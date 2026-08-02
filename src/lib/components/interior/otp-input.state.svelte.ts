import { createAttachmentKey, type Attachment } from 'svelte/attachments';
import type {
	HTMLInputAttributes,
	FocusEventHandler,
	ClipboardEventHandler,
	KeyboardEventHandler,
	EventHandler
} from 'svelte/elements';

export type OtpMode = 'numeric' | 'alphanumeric';

const ALLOW: Record<OtpMode, RegExp> = {
	numeric: /^[0-9]$/,
	alphanumeric: /^[0-9a-zA-Z]$/
};

export type OtpInputOptions = {
	length?: number;
	mode?: OtpMode;
	defaultValue?: string;
	disabled?: boolean;
	onChange?: (value: string) => void;
	onComplete?: (value: string) => void;
};

export class OtpInputState {
	#read: () => OtpInputOptions;

	#chars = $state<string[]>([]);
	#focusedIndex = $state(-1);

	#inputs: (HTMLInputElement | null)[] = [];
	#attachments: Attachment<HTMLInputElement>[] = [];

	constructor(options: OtpInputOptions | (() => OtpInputOptions) = {}) {
		this.#read = typeof options === 'function' ? options : () => options;

		const { length = 6, mode = 'numeric', defaultValue = '' } = this.#read();
		const seed = [...defaultValue].filter((char) => ALLOW[mode].test(char)).slice(0, length);
		this.#chars = Array.from({ length }, (_, index) => seed[index] ?? '');
	}

	readonly #cells: string[] = $derived.by(() => {
		const length = this.length;
		const own = this.#chars;
		if (own.length === length) return own;
		return Array.from({ length }, (_, index) => own[index] ?? '');
	});

	get length(): number {
		return this.#read().length ?? 6;
	}

	get chars(): string[] {
		return this.#cells;
	}

	get value(): string {
		return this.#cells.join('');
	}

	get complete(): boolean {
		return this.#cells.length > 0 && this.#cells.every((char) => char !== '');
	}

	get focusedIndex(): number {
		return this.#focusedIndex;
	}

	focusAt = (index: number) => {
		const node = this.#inputs[Math.max(0, Math.min(this.length - 1, index))];
		if (!node) return;
		node.focus();
		node.select();
	};

	focus = () => {
		this.focusAt(0);
	};

	clear = () => {
		this.#commit(Array.from({ length: this.length }, () => ''));
		this.focusAt(0);
	};

	#keep = (text: string) => {
		const allow = ALLOW[this.#read().mode ?? 'numeric'];
		return [...text].filter((char) => allow.test(char)).join('');
	};

	#commit = (next: string[]) => {
		this.#chars = next;

		const value = next.join('');
		const { onChange, onComplete } = this.#read();

		onChange?.(value);
		if (next.length > 0 && next.every((char) => char !== '')) onComplete?.(value);
	};

	#fillFrom = (from: number, text: string, node: HTMLInputElement, nodeIndex: number) => {
		const incoming = this.#keep(text);
		if (incoming.length === 0) return;

		const length = this.length;
		const next = [...this.#cells];

		let cursor = from;
		for (const char of incoming) {
			if (cursor >= length) break;
			next[cursor] = char;
			cursor += 1;
		}

		this.#commit(next);
		node.value = next[nodeIndex] ?? '';
		this.focusAt(cursor);
	};

	#cellAttachment(index: number): Attachment<HTMLInputElement> {
		return (this.#attachments[index] ??= (node) => {
			this.#inputs[index] = node;

			return () => {
				if (this.#inputs[index] === node) this.#inputs[index] = null;
			};
		});
	}

	cellProps(index: number) {
		const { mode = 'numeric', disabled = false } = this.#read();
		const length = this.length;

		return {
			value: this.#cells[index] ?? '',
			disabled,
			type: 'text' as const,
			inputmode: mode === 'numeric' ? ('numeric' as const) : ('text' as const),
			autocomplete: index === 0 ? ('one-time-code' as const) : ('off' as const),
			autocorrect: 'off' as const,
			autocapitalize: 'off' as const,
			spellcheck: false,

			oninput: ((event) => {
				const node = event.currentTarget;
				const previous = this.#cells[index] ?? '';
				const raw = node.value;
				const trimmed =
					raw.length > 1 && previous && raw.startsWith(previous) ? raw.slice(previous.length) : raw;
				const incoming = this.#keep(trimmed);

				if (incoming.length === 0) {
					if (raw.length === 0 && previous) {
						const next = [...this.#cells];
						next[index] = '';
						this.#commit(next);
					}
					node.value = this.#cells[index] ?? '';
					return;
				}

				if (incoming.length === 1) {
					const next = [...this.#cells];
					next[index] = incoming;
					node.value = incoming;
					this.#commit(next);
					if (index < length - 1) this.focusAt(index + 1);
					return;
				}

				this.#fillFrom(index, incoming, node, index);
			}) satisfies EventHandler<Event, HTMLInputElement>,

			onkeydown: ((event: KeyboardEvent) => {
				if (event.key === 'Backspace') {
					event.preventDefault();
					const next = [...this.#cells];

					if (next[index]) {
						next[index] = '';
						this.#commit(next);
						return;
					}

					if (index > 0) {
						next[index - 1] = '';
						this.#commit(next);
						this.focusAt(index - 1);
					}
					return;
				}

				if (event.key === 'Delete') {
					event.preventDefault();
					const next = [...this.#cells];
					next[index] = '';
					this.#commit(next);
					return;
				}

				if (event.key === 'ArrowLeft') {
					event.preventDefault();
					this.focusAt(index - 1);
					return;
				}

				if (event.key === 'ArrowRight') {
					event.preventDefault();
					this.focusAt(index + 1);
					return;
				}

				if (event.key === 'Home') {
					event.preventDefault();
					this.focusAt(0);
					return;
				}

				if (event.key === 'End') {
					event.preventDefault();
					this.focusAt(length - 1);
				}
			}) satisfies KeyboardEventHandler<HTMLInputElement>,

			onpaste: ((event) => {
				event.preventDefault();
				const text = this.#keep(event.clipboardData?.getData('text') ?? '');
				this.#fillFrom(text.length >= length ? 0 : index, text, event.currentTarget, index);
			}) satisfies ClipboardEventHandler<HTMLInputElement>,

			onfocus: ((event) => {
				event.currentTarget.select();

				const firstEmpty = this.#cells.findIndex((char) => char === '');
				if (firstEmpty !== -1 && firstEmpty < index) {
					this.focusAt(firstEmpty);
					return;
				}

				this.#focusedIndex = index;
			}) satisfies FocusEventHandler<HTMLInputElement>,

			onblur: ((event) => {
				const to = event.relatedTarget;
				if (to instanceof HTMLInputElement && this.#inputs.includes(to)) return;
				this.#focusedIndex = -1;
			}) satisfies FocusEventHandler<HTMLInputElement>,

			[createAttachmentKey()]: this.#cellAttachment(index)
		} satisfies HTMLInputAttributes;
	}
}
