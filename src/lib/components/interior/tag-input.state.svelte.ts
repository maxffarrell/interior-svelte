import { createAttachmentKey, type Attachment } from 'svelte/attachments';
import type {
	ClipboardEventHandler,
	EventHandler,
	HTMLInputAttributes,
	KeyboardEventHandler
} from 'svelte/elements';

export type TagRejection = 'duplicate' | 'limit' | 'invalid';

export type TagInputOptions = {
	value?: string[];
	defaultValue?: string[];
	onChange?: (tags: string[]) => void;
	max?: number;
	separators?: string[];
	allowDuplicates?: boolean;
	validate?: (candidate: string, tags: string[]) => boolean;
	disabled?: boolean;
};

export type Rejection = {
	reason: TagRejection;
	tag: string;
	visible: boolean;
};

const REJECT_VISIBLE = 2400;
const FLASH_VISIBLE = 460;

const clean = (raw: string) => raw.trim().replace(/\s+/g, ' ');

const splitter = (separators: string[]) =>
	new RegExp(`[${separators.map((s) => s.replace(/[\\\]^-]/g, '\\$&')).join('')}\\n\\r\\t]+`);

export class TagInputState {
	#read: () => TagInputOptions;

	#internal = $state<string[]>([]);
	#draft = $state('');
	#armed = $state(-1);
	#rejection = $state<Rejection | null>(null);
	#flashed = $state<string | null>(null);
	#announcement = $state('');

	#input: HTMLInputElement | null = null;
	#rejectTimer: ReturnType<typeof setTimeout> | null = null;
	#flashTimer: ReturnType<typeof setTimeout> | null = null;

	constructor(options: TagInputOptions | (() => TagInputOptions) = {}) {
		this.#read = typeof options === 'function' ? options : () => options;
		this.#internal = [...(this.#read().defaultValue ?? [])];
	}

	get tags(): string[] {
		return this.#read().value ?? this.#internal;
	}

	get draft(): string {
		return this.#draft;
	}

	get armedIndex(): number {
		return this.#armed >= this.tags.length ? -1 : this.#armed;
	}

	get flashed(): string | null {
		return this.#flashed;
	}

	get announcement(): string {
		return this.#announcement;
	}

	get max(): number | undefined {
		return this.#read().max;
	}

	get message(): string {
		const rejection = this.#rejection;
		if (!rejection) return '';
		if (rejection.reason === 'duplicate') return `${rejection.tag} is already in the list`;
		if (rejection.reason === 'limit') return `That is the limit of ${this.max} tags`;
		return `${rejection.tag} is not allowed here`;
	}

	get showMessage(): boolean {
		return this.#rejection?.visible === true;
	}

	lit(index: number, tag: string): boolean {
		return this.armedIndex === index || this.#flashed === tag;
	}

	focus = () => {
		this.#input?.focus();
	};

	#apply = (next: string[]) => {
		if (this.#read().value === undefined) this.#internal = next;
		this.#read().onChange?.(next);
	};

	#dismiss = () => {
		if (this.#rejectTimer) clearTimeout(this.#rejectTimer);
		this.#rejectTimer = null;

		const current = this.#rejection;
		if (current && current.visible) this.#rejection = { ...current, visible: false };
	};

	#refuse = (reason: TagRejection, tag: string) => {
		if (this.#rejectTimer) clearTimeout(this.#rejectTimer);
		this.#rejection = { reason, tag, visible: true };

		this.#rejectTimer = setTimeout(() => {
			this.#rejectTimer = null;
			const current = this.#rejection;
			if (current) this.#rejection = { ...current, visible: false };
		}, REJECT_VISIBLE);

		this.#announcement =
			reason === 'duplicate'
				? `${tag} is already in the list.`
				: reason === 'limit'
					? `That is the limit of ${this.max} tags.`
					: `${tag} is not allowed here.`;

		if (reason !== 'duplicate') return;

		if (this.#flashTimer) clearTimeout(this.#flashTimer);
		this.#flashed = tag;
		this.#flashTimer = setTimeout(() => {
			this.#flashTimer = null;
			this.#flashed = null;
		}, FLASH_VISIBLE);
	};

	#arm = (index: number) => {
		const tag = this.tags[index];
		if (tag === undefined) return;
		this.#armed = index;
		this.#announcement = `${tag} selected, press Backspace again to remove it.`;
	};

	add = (raws: string[]): boolean => {
		const { max, allowDuplicates = false, validate } = this.#read();

		const next = [...this.tags];
		let added = 0;
		let failure: { reason: TagRejection; tag: string } | null = null;

		for (const raw of raws) {
			const candidate = clean(raw);
			if (!candidate) continue;

			if (max !== undefined && next.length >= max) {
				failure = { reason: 'limit', tag: candidate };
				break;
			}

			if (!allowDuplicates) {
				const twin = next.find((tag) => tag.toLowerCase() === candidate.toLowerCase());
				if (twin !== undefined) {
					failure = { reason: 'duplicate', tag: twin };
					continue;
				}
			}

			if (validate && !validate(candidate, next)) {
				failure = { reason: 'invalid', tag: candidate };
				continue;
			}

			next.push(candidate);
			added += 1;
		}

		if (added > 0) {
			const last = next[next.length - 1] ?? '';
			this.#apply(next);
			this.#draft = '';
			this.#armed = -1;
			this.#dismiss();
			this.#announcement = `${added === 1 ? last : `${added} tags`} added, ${next.length} total.`;
		}

		if (failure) this.#refuse(failure.reason, failure.tag);
		return added > 0;
	};

	removeAt = (index: number) => {
		const tags = this.tags;
		const gone = tags[index];
		if (gone === undefined) return;

		const next = tags.filter((_, i) => i !== index);
		this.#apply(next);
		this.#armed = -1;
		this.#dismiss();
		this.#announcement = `${gone} removed, ${next.length} left.`;
	};

	#attachInput: Attachment<HTMLInputElement> = (node) => {
		this.#input = node;

		return () => {
			if (this.#input === node) this.#input = null;
			if (this.#rejectTimer) clearTimeout(this.#rejectTimer);
			if (this.#flashTimer) clearTimeout(this.#flashTimer);
			this.#rejectTimer = null;
			this.#flashTimer = null;
		};
	};

	readonly inputProps = $derived.by(() => {
		const { separators = [','], disabled = false } = this.#read();

		return {
			value: this.#draft,
			disabled,
			oninput: ((event) => {
				this.#draft = event.currentTarget.value;
				this.#armed = -1;
				this.#dismiss();
			}) satisfies EventHandler<Event, HTMLInputElement>,
			onkeydown: ((event) => {
				if (event.isComposing) return;

				if (event.key === 'Enter' || separators.includes(event.key)) {
					event.preventDefault();
					this.add([this.#draft]);
					return;
				}

				if (event.key === 'Backspace' && this.#draft === '') {
					event.preventDefault();
					if (event.repeat) return;
					if (this.armedIndex >= 0) this.removeAt(this.armedIndex);
					else if (this.tags.length > 0) this.#arm(this.tags.length - 1);
					return;
				}

				if (event.key === 'Delete' && this.armedIndex >= 0) {
					event.preventDefault();
					if (event.repeat) return;
					this.removeAt(this.armedIndex);
					return;
				}

				if (event.key === 'ArrowLeft') {
					const { selectionStart, selectionEnd } = event.currentTarget;
					if (selectionStart !== 0 || selectionEnd !== 0 || this.tags.length === 0) return;
					event.preventDefault();
					this.#arm(this.armedIndex < 0 ? this.tags.length - 1 : Math.max(0, this.armedIndex - 1));
					return;
				}

				if (event.key === 'ArrowRight' && this.armedIndex >= 0) {
					event.preventDefault();
					if (this.armedIndex >= this.tags.length - 1) this.#armed = -1;
					else this.#arm(this.armedIndex + 1);
					return;
				}

				if (event.key === 'Escape' && this.armedIndex >= 0) {
					event.preventDefault();
					this.#armed = -1;
				}
			}) satisfies KeyboardEventHandler<HTMLInputElement>,
			onpaste: ((event) => {
				const text = event.clipboardData?.getData('text') ?? '';
				const pattern = splitter(separators);
				if (!pattern.test(text)) return;
				event.preventDefault();
				this.add(text.split(pattern));
			}) satisfies ClipboardEventHandler<HTMLInputElement>,
			onblur: () => {
				this.#armed = -1;
			},
			[createAttachmentKey()]: this.#attachInput
		} satisfies HTMLInputAttributes;
	});
}
