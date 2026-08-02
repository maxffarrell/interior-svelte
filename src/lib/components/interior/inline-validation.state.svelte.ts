import { untrack } from 'svelte';
import type { HTMLInputAttributes } from 'svelte/elements';

export type ValidationStatus = 'idle' | 'pending' | 'valid' | 'invalid';

export type Validator = (value: string) => string | null;

export type InlineValidationOptions = {
	value: string;
	validate: Validator;
	debounce?: number;
	disabled?: boolean;
};

type Settled = {
	status: ValidationStatus;
	error: string | null;
	message: string;
};

const CLEAN: Settled = { status: 'idle', error: null, message: '' };

export class InlineValidationState {
	#read: () => InlineValidationOptions;

	#touched = $state(false);
	#focused = $state(false);
	#settled = $state.raw<Settled>(CLEAN);

	constructor(options: InlineValidationOptions | (() => InlineValidationOptions)) {
		this.#read = typeof options === 'function' ? options : () => options;

		$effect(() => {
			const { value, validate, debounce = 400 } = this.#read();
			if (!this.#touched) return;

			const next = validate(value);

			if (next === null) {
				const resolved: ValidationStatus = value.length > 0 ? 'valid' : 'idle';

				this.#update((prev) =>
					prev.status === resolved && prev.error === null
						? prev
						: { status: resolved, error: null, message: prev.message }
				);

				return;
			}

			this.#update((prev) =>
				prev.status === 'invalid' ? prev : { status: 'pending', error: null, message: prev.message }
			);

			const timer = setTimeout(() => {
				this.#update((prev) =>
					prev.error === next ? prev : { status: 'invalid', error: next, message: next }
				);
			}, debounce);

			return () => clearTimeout(timer);
		});
	}

	#update = (settle: (prev: Settled) => Settled) => {
		const prev = untrack(() => this.#settled);
		const next = settle(prev);
		if (next !== prev) this.#settled = next;
	};

	get status(): ValidationStatus {
		return this.#settled.status;
	}

	get error(): string | null {
		return this.#settled.error;
	}

	get message(): string {
		return this.#settled.message;
	}

	get touched(): boolean {
		return this.#touched;
	}

	get focused(): boolean {
		return this.#focused && !this.#read().disabled;
	}

	get invalid(): boolean {
		return this.#settled.status === 'invalid';
	}

	get valid(): boolean {
		return this.#settled.status === 'valid';
	}

	commit = () => {
		this.#touched = true;

		const { value, validate } = this.#read();
		const next = validate(value);

		this.#update((prev) =>
			next === null
				? { status: value.length > 0 ? 'valid' : 'idle', error: null, message: prev.message }
				: { status: 'invalid', error: next, message: next }
		);
	};

	reset = () => {
		this.#touched = false;
		this.#focused = false;
		this.#settled = CLEAN;
	};

	readonly fieldProps = $derived.by(() => {
		const { disabled = false } = this.#read();

		return {
			disabled,
			'aria-invalid': this.invalid,
			onfocus: () => {
				this.#focused = true;
			},
			onblur: () => {
				this.#focused = false;
				this.commit();
			}
		} satisfies HTMLInputAttributes;
	});
}
