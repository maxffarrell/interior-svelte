<script lang="ts">
	import Drawer from '#lib/components/interior/drawer.svelte'; let open = $state(false);
</script>
<button type="button" onclick={() => (open = true)} class="mat-cap press h-9 rounded-[9px] px-3.5 text-[13px]">Edit profile</button>
{#snippet drawerFooter()}<div class="flex justify-end gap-2"><button type="button" onclick={() => (open = false)} class="mat-cap h-8 rounded-[8px] px-3 text-[12px]">Cancel</button><button type="button" onclick={() => (open = false)} class="mat-cap h-8 rounded-[8px] px-3 text-[12px]">Save changes</button></div>{/snippet}
{#snippet drawerBody()}<div class="grid gap-3"><label class="grid gap-1 text-[12px]">Display name<input class="mat-well h-9 rounded-[9px] px-3" value="Mira Sandoval" /></label><label class="grid gap-1 text-[12px]">Email<input class="mat-well h-9 rounded-[9px] px-3" value="mira@studio.co" /></label></div>{/snippet}
<Drawer {open} onOpenChange={(next) => (open = next)} title="Edit profile" description="Visible to everyone in the workspace" children={drawerBody} footer={drawerFooter} />
