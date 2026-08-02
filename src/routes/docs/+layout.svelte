<script lang="ts">
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import Logo from '#lib/components/site/logo.svelte';
	import MobileNav from '#lib/components/site/mobile-nav.svelte';
	import Sidebar from '#lib/components/site/sidebar.svelte';
	import ThemeToggle from '#lib/components/site/theme-toggle.svelte';

	let { children } = $props();
</script>

<div class="fixed inset-0 flex gap-3 overflow-hidden p-3 sm:gap-4 sm:p-5">
	<aside class="hidden h-full w-59 shrink-0 lg:block">
		<Sidebar />
	</aside>

	<div class="min-w-0 flex-1">
		<div
			class="mat-panel scroll-inset h-full overflow-x-hidden overflow-y-auto overscroll-contain rounded-[20px]"
		>
			<header
				class="sticky top-0 z-20 flex h-12 items-center gap-2.5 border-b border-hairline bg-panel/85 px-4 backdrop-blur-md sm:gap-4 sm:px-5"
			>
				<a href="/docs" class="lg:hidden"><Logo size={14} /></a>
				<MobileNav />
				<div class="hidden min-w-0 lg:block"><Breadcrumb /></div>
				<span class="flex-1"></span>
				<ThemeToggle />
			</header>

			<div
				class="pointer-events-none sticky top-12 z-10 -mb-12 h-12 bg-linear-to-b from-panel via-panel/85 to-transparent"
			></div>

			{@render children()}

			<div
				class="pointer-events-none sticky bottom-0 z-10 -mt-16 h-16 bg-linear-to-t from-panel via-panel/85 to-transparent"
			></div>
		</div>
	</div>
</div>
