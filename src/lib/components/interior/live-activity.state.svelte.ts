export type ActivityPhase = 'running' | 'success' | 'error';
export type ActivityAction = { label: string; onClick: () => void };
export type Activity = {
	id: string;
	title: string;
	detail?: string;
	progress?: number | null;
	phase: ActivityPhase;
	action?: ActivityAction;
};
export type ActivityInput = { title: string; detail?: string; progress?: number | null };

export class LiveActivityState {
	#activity = $state<Activity | null>(null);
	#sequence = 0;
	#timer: ReturnType<typeof setTimeout> | undefined;
	#linger: number;

	constructor(linger = 2000) {
		this.#linger = linger;
	}

	get activity() { return this.#activity; }

	#clear = () => {
		if (this.#timer) clearTimeout(this.#timer);
		this.#timer = undefined;
	};

	start = (input: ActivityInput) => {
		this.#clear();
		const id = `activity-${++this.#sequence}`;
		this.#activity = { progress: null, ...input, id, phase: 'running' };
		return id;
	};

	update = (patch: Partial<ActivityInput>) => {
		if (this.#activity) this.#activity = { ...this.#activity, ...patch };
	};

	succeed = (patch: Partial<ActivityInput> = {}) => {
		if (!this.#activity) return;
		this.#activity = { ...this.#activity, ...patch, phase: 'success', progress: 1 };
		this.#clear();
		this.#timer = setTimeout(() => (this.#activity = null), this.#linger);
	};

	fail = (patch: Partial<ActivityInput> = {}, action?: ActivityAction) => {
		this.#clear();
		if (this.#activity) this.#activity = { ...this.#activity, ...patch, phase: 'error', action };
	};

	dismiss = () => {
		this.#clear();
		this.#activity = null;
	};

	destroy = () => this.#clear();
}
