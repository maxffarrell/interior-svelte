<script lang="ts">import ReadingProgress from '#lib/components/interior/reading-progress.svelte'; let scroller = $state<HTMLElement | null>(null);</script><ReadingProgress {scroller} words={420} />
