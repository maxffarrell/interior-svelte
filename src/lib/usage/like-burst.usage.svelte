<script lang="ts">
	import LikeBurst from '#lib/components/interior/like-burst.svelte';

	let { postId, likes, liked }: { postId: string; likes: number; liked: boolean } = $props();

	function toast(message: string) {
		console.warn(message);
	}
</script>

<LikeBurst
	initialLiked={liked}
	initialCount={likes}
	settle={400}
	onCommit={async (next, signal) => {
		const response = await fetch(`/api/posts/${postId}/like`, {
			method: next ? 'POST' : 'DELETE',
			signal
		});
		if (!response.ok) throw new Error('like failed');
	}}
	onError={() => toast('Could not save your like')}
/>
