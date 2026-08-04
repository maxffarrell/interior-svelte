<script lang="ts">
	import LogoMarquee, { type LogoMarqueeItem } from '#lib/components/interior/logo-marquee.svelte';
	const ITEMS: LogoMarqueeItem[] = ['Vercel', 'GitHub', 'Stripe', 'Linear', 'Raycast', 'Framer'].map((label) => ({ id: label.toLowerCase(), label }));
</script>

<div class="mx-auto w-full min-w-0 max-w-[440px]"><LogoMarquee items={ITEMS} label="Customers" /></div>
