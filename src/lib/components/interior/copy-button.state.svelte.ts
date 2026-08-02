export type CopyStatus = 'idle' | 'copied' | 'error';

export type CopyToClipboardOptions = {
	timeout?: number;
	onCopy?: (value: string) => void;
	onError?: (reason: unknown) => void;
};

export class CopyToClipboardState {
	#read: () => CopyToClipboardOptions;

	#status = $state<CopyStatus>('idle');
	#timer: ReturnType<typeof setTimeout> | undefined;

	constructor(options: CopyToClipboardOptions | (() => CopyToClipboardOptions) = {}) {
		this.#read = typeof options === 'function' ? options : () => options;

		$effect(() => () => clearTimeout(this.#timer));
	}

	get status() {
		return this.#status;
	}

	get copied() {
		return this.#status === 'copied';
	}

	reset = () => {
		clearTimeout(this.#timer);
		this.#status = 'idle';
	};

	copy = async (value: string) => {
		if (!value) return;

		let ok: boolean;
		let reason: unknown = null;

		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(value);
				ok = true;
			} else {
				ok = writeFallback(value);
			}
		} catch (error) {
			reason = error;
			try {
				ok = writeFallback(value);
			} catch {
				ok = false;
			}
		}

		this.#status = ok ? 'copied' : 'error';
		if (ok) this.#read().onCopy?.(value);
		else this.#read().onError?.(reason);

		clearTimeout(this.#timer);
		this.#timer = setTimeout(() => (this.#status = 'idle'), this.#read().timeout ?? 2000);
	};
}

function writeFallback(text: string): boolean {
	const area = document.createElement('textarea');
	area.value = text;
	area.setAttribute('readonly', '');
	area.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
	document.body.appendChild(area);

	const selection = document.getSelection();
	const previous = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

	area.select();
	let ok: boolean;
	try {
		ok = document.execCommand('copy');
	} catch {
		ok = false;
	}

	document.body.removeChild(area);
	if (selection && previous) {
		selection.removeAllRanges();
		selection.addRange(previous);
	}
	return ok;
}
