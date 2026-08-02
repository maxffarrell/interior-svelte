import type { Component } from 'svelte';
import CopyButtonDemo from './copy-button-demo.svelte';
import ExpandingSearchDemo from './expanding-search-demo.svelte';
import FloatingLabelDemo from './floating-label-demo.svelte';
import HoldToConfirmDemo from './hold-to-confirm-demo.svelte';
import IconMorphDemo from './icon-morph-demo.svelte';
import LikeBurstDemo from './like-burst-demo.svelte';
import LoadingButtonDemo from './loading-button-demo.svelte';
import PressDepthDemo from './press-depth-demo.svelte';
import RippleDemo from './ripple-demo.svelte';

export const demos: Record<string, Component> = {
	'copy-button': CopyButtonDemo,
	'expanding-search': ExpandingSearchDemo,
	'floating-label': FloatingLabelDemo,
	'hold-to-confirm': HoldToConfirmDemo,
	'icon-morph': IconMorphDemo,
	'like-burst': LikeBurstDemo,
	'loading-button': LoadingButtonDemo,
	'press-depth': PressDepthDemo,
	ripple: RippleDemo
};

export const bleedDemos = new Set<string>([]);
