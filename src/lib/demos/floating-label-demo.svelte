<script lang="ts">
	import FloatingLabel from '#lib/components/interior/floating-label.svelte';
</script>

<div class="flex w-full justify-center">
	<div class="w-full max-w-80">
		<FloatingLabel
			label="Account reference"
			hint="Printed on the statement header."
			maxlength={16}
		/>
	</div>
</div>
