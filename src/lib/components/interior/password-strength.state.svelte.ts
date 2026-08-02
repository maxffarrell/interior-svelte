import { createAttachmentKey, type Attachment } from 'svelte/attachments';
import type { HTMLAttributes } from 'svelte/elements';

const COMMON =
	/^(?:password|passw0rd|qwerty|letmein|welcome|admin|iloveyou|monkey|dragon|abc123|111111|123123|123456)/i;
const RUN = /(.)\1{3,}/;
const RUN_UP = /(?:0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|defg|qwer|wert|erty|asdf)/i;
const SYMBOL = /[!-/:-@[-`{-~]/;

export type PasswordRule = {
	id: string;
	label: string;
	test: (value: string) => boolean;
};

export type EvaluatedRule = PasswordRule & { met: boolean };

export type PasswordTone = 'none' | 'danger' | 'caution' | 'safe';

export type PasswordStrengthOptions = {
	value: string;
	rules?: readonly PasswordRule[];
	labels?: readonly string[];
	announceDelay?: number;
};

export const defaultPasswordRules: readonly PasswordRule[] = [
	{ id: 'length', label: '12 characters or more', test: (v) => v.length >= 12 },
	{ id: 'case', label: 'Upper and lower case', test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
	{ id: 'digit', label: 'A number', test: (v) => /\d/.test(v) },
	{ id: 'symbol', label: 'A symbol', test: (v) => SYMBOL.test(v) }
];

export const defaultPasswordLabels: readonly string[] = ['Empty', 'Weak', 'Fair', 'Good', 'Strong'];

export class PasswordStrengthState {
	#read: () => PasswordStrengthOptions;

	#settled = $state('');

	constructor(options: PasswordStrengthOptions | (() => PasswordStrengthOptions)) {
		this.#read = typeof options === 'function' ? options : () => options;
	}

	readonly #computed = $derived.by(() => {
		const { value, rules = defaultPasswordRules, labels = defaultPasswordLabels } = this.#read();

		const evaluated: EvaluatedRule[] = rules.map((rule) => ({ ...rule, met: rule.test(value) }));
		const passed = evaluated.reduce((n, rule) => n + (rule.met ? 1 : 0), 0);

		const guessable =
			value.length > 0 && (COMMON.test(value) || RUN.test(value) || RUN_UP.test(value));

		const score =
			value.length === 0 ? 0 : guessable ? 1 : Math.min(rules.length, Math.max(1, passed));

		const label = labels[Math.min(score, labels.length - 1)] ?? '';
		const unmet = evaluated.filter((rule) => !rule.met);

		const spoken =
			value.length === 0
				? ''
				: [
						`Password strength ${label.toLowerCase()}.`,
						guessable ? 'This is a commonly guessed pattern.' : '',
						unmet.length === 0
							? 'All requirements met.'
							: `Still needed: ${unmet.map((rule) => rule.label.toLowerCase()).join(', ')}.`
					]
						.filter(Boolean)
						.join(' ');

		return { score, max: rules.length, label, labels, rules: evaluated, guessable, spoken };
	});

	get score(): number {
		return this.#computed.score;
	}

	get max(): number {
		return this.#computed.max;
	}

	get label(): string {
		return this.#computed.label;
	}

	get labels(): readonly string[] {
		return this.#computed.labels;
	}

	get rules(): EvaluatedRule[] {
		return this.#computed.rules;
	}

	get guessable(): boolean {
		return this.#computed.guessable;
	}

	get announcement(): string {
		return this.#settled;
	}

	get tone(): PasswordTone {
		const { score, max } = this.#computed;
		if (score === 0) return 'none';
		const ratio = score / max;
		if (ratio <= 0.34) return 'danger';
		if (ratio <= 0.67) return 'caution';
		return 'safe';
	}

	#announce: Attachment<HTMLElement> = () => {
		const spoken = this.#computed.spoken;

		if (spoken === '') {
			this.#settled = '';
			return;
		}

		const { announceDelay = 700 } = this.#read();

		const id = setTimeout(() => {
			this.#settled = spoken;
		}, announceDelay);

		return () => clearTimeout(id);
	};

	readonly rootProps = {
		[createAttachmentKey()]: this.#announce
	} satisfies HTMLAttributes<HTMLElement>;
}
