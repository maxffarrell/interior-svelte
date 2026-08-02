import { createAttachmentKey, type Attachment } from 'svelte/attachments';
import { on } from 'svelte/events';
import type { HTMLInputAttributes } from 'svelte/elements';

export type FloatingLabelOptions = {
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	onFocus?: () => void;
	onBlur?: () => void;
	disabled?: boolean;
};

export class FloatingLabelState {
	#read: () => FloatingLabelOptions;

	#focused = $state(false);
	#ownLength = $state(0);
	#instant = $state(true);

	#input: HTMLInputElement | null = null;

	readonly #inputKey = createAttachmentKey();

	constructor(options: FloatingLabelOptions | (() => FloatingLabelOptions) = {}) {
		this.#read = typeof options === 'function' ? options : () => options;
		this.#ownLength = (this.#read().defaultValue ?? '').length;
	}

	get length(): number {
		const { value } = this.#read();
		return value !== undefined ? value.length : this.#ownLength;
	}

	get filled(): boolean {
		return this.length > 0;
	}

	get focused(): boolean {
		return this.#focused && !this.#read().disabled;
	}

	get raised(): boolean {
		return this.focused || this.filled;
	}

	get instant(): boolean {
		return this.#instant && !this.#focused;
	}

	focus = () => {
		this.#input?.focus();
	};

	#settle = (next: number) => {
		if (this.#ownLength !== next) this.#ownLength = next;
	};

	#attachInput: Attachment<HTMLInputElement> = (node) => {
		this.#input = node;

		const { value, defaultValue } = this.#read();
		const uncontrolled = value === undefined;

		if (uncontrolled && defaultValue !== undefined && node.value === '') {
			node.value = defaultValue;
		}

		this.#settle(node.value.length);

		const settled = requestAnimationFrame(() => {
			this.#instant = false;
		});

		const read = () => this.#settle(node.value.length);
		const inputEvent = on(node, 'input', read);
		const changeEvent = on(node, 'change', read);

		return () => {
			cancelAnimationFrame(settled);
			inputEvent();
			changeEvent();
			if (this.#input === node) this.#input = null;
		};
	};

	readonly inputProps = $derived.by(() => {
		const { value, disabled = false } = this.#read();

		return {
			...(value !== undefined ? { value } : {}),
			disabled,
			onfocus: () => {
				this.#focused = true;
				this.#read().onFocus?.();
			},
			onblur: () => {
				this.#focused = false;
				this.#read().onBlur?.();
			},
			oninput: (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
				this.#settle(event.currentTarget.value.length);
				this.#read().onChange?.(event.currentTarget.value);
			},
			[this.#inputKey]: this.#attachInput
		} satisfies HTMLInputAttributes;
	});
}
