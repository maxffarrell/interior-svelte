export type AsyncActionStatus = 'idle' | 'pending' | 'success' | 'error';

export type AsyncActionOptions = {
	action: () => unknown;
	resetAfter?: number;
	onError?: (error: unknown) => void;
};

export class AsyncActionState {
	#read: () => AsyncActionOptions;

	#status = $state<AsyncActionStatus>('idle');

	#timer: ReturnType<typeof setTimeout> | undefined;
	#runId = 0;
	#alive = true;

	constructor(options: AsyncActionOptions | (() => AsyncActionOptions)) {
		this.#read = typeof options === 'function' ? options : () => options;

		$effect(() => {
			this.#alive = true;
			return () => {
				this.#alive = false;
				clearTimeout(this.#timer);
			};
		});
	}

	get status() {
		return this.#status;
	}

	get pending() {
		return this.#status === 'pending';
	}

	reset = () => {
		clearTimeout(this.#timer);
		this.#runId += 1;
		this.#status = 'idle';
	};

	#settle(id: number, next: 'success' | 'error') {
		if (!this.#alive || id !== this.#runId) return;

		clearTimeout(this.#timer);
		this.#status = next;
		this.#timer = setTimeout(() => {
			if (!this.#alive || id !== this.#runId) return;
			this.#status = 'idle';
		}, this.#read().resetAfter ?? 1400);
	}

	run = async () => {
		if (this.pending) return;

		clearTimeout(this.#timer);
		const id = ++this.#runId;
		this.#status = 'pending';

		try {
			await this.#read().action();
			this.#settle(id, 'success');
		} catch (error) {
			this.#read().onError?.(error);
			this.#settle(id, 'error');
		}
	};
}
