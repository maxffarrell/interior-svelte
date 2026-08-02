import { createAttachmentKey, type Attachment } from 'svelte/attachments';
import type { HTMLAttributes, HTMLButtonAttributes, HTMLInputAttributes } from 'svelte/elements';

export type ExpandingSearchOptions = {
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	onSearch?: (value: string) => void;
	onSubmit?: (value: string) => void;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	debounce?: number;
	collapseOnBlur?: boolean;
	disabled?: boolean;
};

export class ExpandingSearchState {
	#read: () => ExpandingSearchOptions;

	#ownValue = $state('');
	#ownOpen = $state(false);
	#focused = $state(false);

	#timer: ReturnType<typeof setTimeout> | null = null;

	#pending = '';

	#input: HTMLInputElement | null = null;
	#trigger: HTMLButtonElement | null = null;

	readonly #rootKey = createAttachmentKey();
	readonly #triggerKey = createAttachmentKey();
	readonly #inputKey = createAttachmentKey();

	constructor(options: ExpandingSearchOptions | (() => ExpandingSearchOptions) = {}) {
		this.#read = typeof options === 'function' ? options : () => options;
		this.#ownValue = this.#read().defaultValue ?? '';
		this.#ownOpen = this.#read().defaultOpen ?? false;
	}

	get query() {
		return this.#read().value ?? this.#ownValue;
	}

	get open() {
		return this.#read().open ?? this.#ownOpen;
	}

	get focused() {
		return this.#focused;
	}

	get filled() {
		return this.query.length > 0;
	}

	#setOpen = (next: boolean) => {
		if (this.open === next) return;
		this.#ownOpen = next;
		this.#read().onOpenChange?.(next);
	};

	#commit = (next: string) => {
		this.#ownValue = next;
		this.#read().onChange?.(next);

		const { debounce = 220 } = this.#read();
		if (this.#timer) clearTimeout(this.#timer);
		this.#pending = next;
		this.#timer = setTimeout(() => {
			this.#timer = null;
			this.#read().onSearch?.(next);
		}, debounce);
	};

	#flush = () => {
		if (!this.#timer) return;
		clearTimeout(this.#timer);
		this.#timer = null;
		this.#read().onSearch?.(this.#pending);
	};

	expand = () => {
		if (this.#read().disabled) return;
		this.#setOpen(true);
		this.#input?.focus();
	};

	collapse = (returnFocus = false) => {
		this.#setOpen(false);
		if (returnFocus) this.#trigger?.focus();
	};

	toggle = () => {
		if (this.open) this.collapse(true);
		else this.expand();
	};

	clear = () => {
		this.#commit('');
		this.#input?.focus();
	};

	focusField = () => {
		this.#input?.focus();
	};

	#attachRoot: Attachment<HTMLElement> = () => {
		return () => {
			if (this.#timer) clearTimeout(this.#timer);
			this.#timer = null;
		};
	};

	#attachTrigger: Attachment<HTMLButtonElement> = (node) => {
		this.#trigger = node;
		return () => {
			if (this.#trigger === node) this.#trigger = null;
		};
	};

	#attachInput: Attachment<HTMLInputElement> = (node) => {
		this.#input = node;
		return () => {
			if (this.#input === node) this.#input = null;
		};
	};

	readonly rootProps = $derived.by(() => {
		return {
			onfocusin: () => {
				this.#focused = true;
			},
			onfocusout: (event: FocusEvent & { currentTarget: EventTarget & HTMLElement }) => {
				const next = event.relatedTarget as Node | null;
				if (next && event.currentTarget.contains(next)) return;

				this.#focused = false;

				const { collapseOnBlur = true } = this.#read();
				if (!collapseOnBlur) return;
				// switching browser tabs blurs the field; that is not a decision to close it
				if (!document.hasFocus()) return;
				// a typed query is never collapsed away
				if (this.filled) return;

				this.#setOpen(false);
			},
			[this.#rootKey]: this.#attachRoot
		} satisfies HTMLAttributes<HTMLElement>;
	});

	readonly triggerProps = $derived.by(() => {
		const { disabled = false } = this.#read();
		return {
			type: 'button',
			disabled,
			tabindex: this.open ? -1 : 0,
			'aria-expanded': this.open,
			onclick: this.expand,
			[this.#triggerKey]: this.#attachTrigger
		} satisfies HTMLButtonAttributes;
	});

	readonly inputProps = $derived.by(() => {
		const { disabled = false } = this.#read();
		return {
			value: this.query,
			disabled,
			tabindex: this.open ? 0 : -1,
			oninput: (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
				this.#commit(event.currentTarget.value);
			},
			onkeydown: (event: KeyboardEvent) => {
				if (event.key === 'Escape') {
					event.preventDefault();
					event.stopPropagation();
					if (this.filled) {
						this.#commit('');
						return;
					}
					this.collapse(true);
					return;
				}

				if (event.key === 'Enter') {
					event.preventDefault();
					this.#flush();
					this.#read().onSubmit?.(this.query);
				}
			},
			onfocus: () => this.#setOpen(true),
			[this.#inputKey]: this.#attachInput
		} satisfies HTMLInputAttributes;
	});
}
