<script lang="ts">
	import PresenceAvatars, { type PresencePerson } from '#lib/components/interior/presence-avatars.svelte';
	const POOL: PresencePerson[] = ['Ana Ruiz', 'Ivo Bergman', 'Noor Haddad', 'Kei Tanaka', 'Sam Okonkwo', 'Lila Fontaine', 'Gus Martel', 'Mira Sandoval'].map((name, index) => ({ id: name.toLowerCase().replaceAll(' ', '-'), name, src: `https://i.pravatar.cc/96?img=${[47, 12, 32, 60, 15, 26, 68, 5][index]}` }));
	let here = $state(['ana-ruiz', 'ivo-bergman', 'noor-haddad']);
	const people = $derived(POOL.filter((person) => here.includes(person.id)));
</script>

<div class="mx-auto flex w-full max-w-[340px] flex-col items-center gap-7"><PresenceAvatars people={people} max={4} size={48} overlap={14} label="On this board" /><div class="flex items-center gap-1.5"><button type="button" onclick={() => { const next = POOL.find((person) => !here.includes(person.id)); if (next) here = [...here, next.id]; }} class="mat-cap press h-8 rounded-[7px] px-2.5 text-[12px] font-medium text-ink-2">Someone joins</button><button type="button" onclick={() => (here = here.slice(1))} class="mat-cap press h-8 rounded-[7px] px-2.5 text-[12px] font-medium text-ink-2">Longest here leaves</button></div></div>
