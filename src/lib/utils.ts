import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class values, resolving Tailwind conflicts so the last one wins.
 *
 * This is what makes the `class` prop on every component behave the way the
 * registry documents it: "appended last to the root, so width and spacing are
 * the caller's". Plain concatenation would leave both `p-2` and the caller's
 * `p-4` in the list and let source order in the stylesheet decide; `twMerge`
 * drops the loser outright.
 *
 * Design-language classes from `layout.css` (`mat-panel`, `press`, `tnum`, …)
 * are not utilities, so `twMerge` passes them through untouched.
 */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}
