<script lang="ts">
	import Modal from '#lib/components/interior/modal.svelte';
	let open = $state(false);
</script>
<button type="button" onclick={() => (open = true)} class="mat-cap press h-9 rounded-[9px] px-3.5 text-[13px] font-medium text-ink">Delete project</button>
{#snippet title()}Delete atlas-edge?{/snippet}
{#snippet description()}This removes the project and cannot be undone.{/snippet}
{#snippet body()}<p class="text-stone-500">Four deployments and one custom domain are attached.</p>{/snippet}
{#snippet footer()}<button type="button" onclick={() => (open = false)} class="mat-cap h-8 rounded-[8px] px-3 text-[12.5px]">Cancel</button><button type="button" onclick={() => (open = false)} class="mat-cap h-8 rounded-[8px] px-3 text-[12.5px]">Delete</button>{/snippet}
<Modal {open} onClose={() => (open = false)} {title} {description} children={body} footer={footer} />
