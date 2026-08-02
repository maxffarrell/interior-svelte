<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	export type Props = Omit<HTMLButtonAttributes, 'disabled'> & {
		children: Snippet;
		depth?: number;
		tilt?: number;
		disabled?: boolean;
		ref?: HTMLButtonElement | null;
	};
</script>

<script lang="ts">
	import { motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';
	import { PressDepthState } from './press-depth.state.svelte';

	const PRESS = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } as const;
	const INSTANT = { duration: 0 } as const;

	let {
		children,
		depth = 4,
		tilt = 7,
		disabled = false,
		type = 'button',
		class: className,
		ref = $bindable(null),
		...rest
	}: Props = $props();

	const press = new PressDepthState(() => ({ disabled }));

	const travel = $derived(reducedMotion.current ? INSTANT : PRESS);
	const lean = $derived(press.pressed && !reducedMotion.current ? press.origin : null);
</script>

<button
	{...rest}
	bind:this={ref}
	{...press.props}
	{type}
	{disabled}
	data-pressed={press.pressed || undefined}
	style="padding-bottom: {depth}px"
	class="group relative inline-flex touch-manipulation rounded-[9px] align-middle outline-none select-none [-webkit-tap-highlight-color:transparent] disabled:opacity-50"
>
	<span
		aria-hidden="true"
		style="top: {depth}px"
		class="absolute inset-x-0 bottom-0 rounded-[9px] bg-ink/15"
	></span>

	<motion.span
		initial={false}
		animate={{
			y: press.pressed ? depth : 0,
			rotateX: lean ? -lean.y * tilt : 0,
			rotateY: lean ? lean.x * tilt : 0,
			transformPerspective: 340
		}}
		transition={travel}
		class={cn(
			'relative inline-flex h-9 items-center justify-center rounded-[9px] px-3.5 text-[13px] font-medium text-ink-2 group-focus-visible:outline-2 group-focus-visible:outline-offset-1 group-focus-visible:outline-accent',
			className
		)}
	>
		<motion.span
			aria-hidden="true"
			initial={false}
			animate={{ opacity: press.pressed ? 0 : 1 }}
			transition={travel}
			class="mat-cap pointer-events-none absolute inset-0 rounded-[9px]"
		/>
		<motion.span
			aria-hidden="true"
			initial={false}
			animate={{ opacity: press.pressed ? 1 : 0 }}
			transition={travel}
			class="mat-well pointer-events-none absolute inset-0 rounded-[9px]"
		/>

		<span class="relative inline-flex items-center gap-2">
			{@render children()}
		</span>
	</motion.span>
</button>
