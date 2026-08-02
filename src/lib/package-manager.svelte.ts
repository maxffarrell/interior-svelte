import { browser } from '$app/env';

export const packageManagers = ['npm', 'pnpm', 'bun', 'yarn'] as const;

export type PackageManager = (typeof packageManagers)[number];

export const dlx: Record<PackageManager, string> = {
	npm: 'npx',
	pnpm: 'pnpm dlx',
	bun: 'bunx --bun',
	yarn: 'yarn dlx'
};

export const STORAGE_KEY = 'interior:pm';

function isPackageManager(value: unknown): value is PackageManager {
	return packageManagers.includes(value as PackageManager);
}

let current = $state<PackageManager>(read());

function read(): PackageManager {
	if (!browser) return 'npm';
	const attr = document.documentElement.dataset.pm;
	return isPackageManager(attr) ? attr : 'npm';
}

export const packageManager = {
	get current() {
		return current;
	},
	set current(next: PackageManager) {
		current = next;
		document.documentElement.dataset.pm = next;
		try {
			localStorage.setItem(STORAGE_KEY, next);
		} catch {
			void 0;
		}
	}
};
