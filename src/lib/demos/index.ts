import type { Component } from 'svelte';
import CopyButtonDemo from './copy-button-demo.svelte';
import AccordionDemo from './accordion-demo.svelte';
import ExpandingSearchDemo from './expanding-search-demo.svelte';
import FloatingLabelDemo from './floating-label-demo.svelte';
import HoldToConfirmDemo from './hold-to-confirm-demo.svelte';
import IconMorphDemo from './icon-morph-demo.svelte';
import InlineValidationDemo from './inline-validation-demo.svelte';
import LikeBurstDemo from './like-burst-demo.svelte';
import LoadingButtonDemo from './loading-button-demo.svelte';
import OtpInputDemo from './otp-input-demo.svelte';
import PasswordStrengthDemo from './password-strength-demo.svelte';
import PressDepthDemo from './press-depth-demo.svelte';
import RippleDemo from './ripple-demo.svelte';
import TagInputDemo from './tag-input-demo.svelte';
import ProgressBarDemo from './progress-bar-demo.svelte';
import TypingIndicatorDemo from './typing-indicator-demo.svelte';
import NewItemsPillDemo from './new-items-pill-demo.svelte';
import TabsDemo from './tabs-demo.svelte';
import SegmentedControlDemo from './segmented-control-demo.svelte';
import TextRevealDemo from './text-reveal-demo.svelte';
import ShowMoreDemo from './show-more-demo.svelte';

export const demos: Record<string, Component> = {
	accordion: AccordionDemo,
	'copy-button': CopyButtonDemo,
	'expanding-search': ExpandingSearchDemo,
	'floating-label': FloatingLabelDemo,
	'hold-to-confirm': HoldToConfirmDemo,
	'icon-morph': IconMorphDemo,
	'inline-validation': InlineValidationDemo,
	'like-burst': LikeBurstDemo,
	'loading-button': LoadingButtonDemo,
	'otp-input': OtpInputDemo,
	'password-strength': PasswordStrengthDemo,
	'press-depth': PressDepthDemo,
	ripple: RippleDemo,
	'tag-input': TagInputDemo,
	'progress-bar': ProgressBarDemo,
	'typing-indicator': TypingIndicatorDemo,
	'new-items-pill': NewItemsPillDemo,
	tabs: TabsDemo,
	'segmented-control': SegmentedControlDemo,
	'text-reveal': TextRevealDemo,
	'show-more': ShowMoreDemo
};

export const bleedDemos = new Set<string>([]);
