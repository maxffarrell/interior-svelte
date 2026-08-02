<script lang="ts">
	import BrandMark from '#lib/components/site/brand-mark.svelte';
	import Logo from '#lib/components/site/logo.svelte';
	import ThemeToggle from '#lib/components/site/theme-toggle.svelte';

	const SITE = 'https://interior-svelte.max-gottschalk.workers.dev';
	const REPO = 'https://github.com/max-got/interior-dev-svelte';
	const UPSTREAM = 'https://github.com/ddoemonn/interior';
</script>

<svelte:head>
	<title>interior[.]svelte</title>
	<meta
		name="description"
		content="Micro-interactions for Svelte, built for the half-second after a click. An unofficial port of ddoemonn/interior."
	/>
	<link rel="canonical" href={SITE} />
</svelte:head>

<div class="flex h-dvh flex-1 p-3 sm:h-auto sm:min-h-screen sm:p-5">
	<div class="mat-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-[20px]">
		<header class="flex h-12 shrink-0 items-center gap-4 border-b border-hairline px-5">
			<Logo />
			<span class="flex-1"></span>
			<ThemeToggle />
		</header>

		<main class="flex min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 sm:px-12">
			<div class="m-auto w-full max-w-225 py-10 sm:py-24">
				<div class="w-fit origin-left scale-[1.3] sm:scale-[1.6]">
					<BrandMark />
				</div>

				<h1
					class="mt-8 max-w-[22ch] text-[clamp(26px,7.6vw,32px)] leading-[1.08] font-medium tracking-[-0.04em] text-balance text-ink sm:mt-16 sm:text-[clamp(32px,5.6vw,52px)]"
				>
					Software feels cheap in the <span class="whitespace-nowrap">half-second</span> after a click.
				</h1>

				<div
					class="mt-6 grid max-w-[44ch] gap-3 text-[13.5px] leading-[1.7] text-ink-2 sm:mt-9 sm:gap-4 sm:text-[15px]"
				>
					<p>
						The fade a beat too slow. The spinner outliving the request. The row that jumps as it
						loads.
					</p>
					<p>
						Every one of these is argued out to the frame. The behaviour is finished; the style is
						yours.
					</p>
				</div>

				<div class="mt-8 flex flex-wrap items-center gap-3 sm:mt-12">
					<a
						href="/docs"
						class="press inline-flex h-8 items-center rounded-[9px] bg-ink px-3 text-[12.5px] font-medium text-panel sm:h-9 sm:px-3.5 sm:text-[13px]"
					>
						See the components
					</a>
					<a
						href={REPO}
						target="_blank"
						rel="noreferrer"
						class="mat-cap press inline-flex h-8 items-center gap-2 rounded-[9px] px-3 text-[12.5px] font-medium text-ink-2 hover:text-ink sm:h-9 sm:px-3.5 sm:text-[13px]"
					>
						<svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
							<path
								d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38l-.01-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.19c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
							/>
						</svg>
						GitHub
					</a>
				</div>

				<p class="mt-10 max-w-[52ch] text-[12.5px] leading-[1.6] text-ink-3 sm:mt-14">
					An unofficial Svelte port. The components, the design language and every word of the
					argument behind them are
					<a
						href={UPSTREAM}
						target="_blank"
						rel="noreferrer"
						class="text-accent underline decoration-hairline-strong underline-offset-2 hover:text-ink-2"
					>
						ddoemonn/interior
					</a>, originally built for React. Not affiliated with or endorsed by its author.
				</p>
			</div>
		</main>
	</div>
</div>
