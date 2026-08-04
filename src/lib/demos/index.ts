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
import SkeletonSwapDemo from './skeleton-swap-demo.svelte';
import LoadMoreDemo from './load-more-demo.svelte';
import StreamingTextDemo from './streaming-text-demo.svelte';
import TaskStepsDemo from './task-steps-demo.svelte';
import LiveActivityDemo from './live-activity-demo.svelte';
import CollapsibleBannerDemo from './collapsible-banner-demo.svelte';
import PresenceAvatarsDemo from './presence-avatars-demo.svelte';
import ModalDemo from './modal-demo.svelte';
import PopoverDemo from './popover-demo.svelte';
import TooltipGroupDemo from './tooltip-group-demo.svelte';
import CommandPaletteDemo from './command-palette-demo.svelte';
import DrawerDemo from './drawer-demo.svelte';
import ContextMenuDemo from './context-menu-demo.svelte';
import DropdownDemo from './dropdown-demo.svelte';
import WizardStepsDemo from './wizard-steps-demo.svelte';
import PaginationDemo from './pagination-demo.svelte';
import TreeViewDemo from './tree-view-demo.svelte';
import StickyHeaderDemo from './sticky-header-demo.svelte';
import ReadingProgressDemo from './reading-progress-demo.svelte';
import ScrollSpyDemo from './scroll-spy-demo.svelte';
import SnapCarouselDemo from './snap-carousel-demo.svelte';
import HideOnScrollDemo from './hide-on-scroll-demo.svelte';
import SortableTableDemo from './sortable-table-demo.svelte';
import FilterGridDemo from './filter-grid-demo.svelte';
import ValueFlashDemo from './value-flash-demo.svelte';
import PollResultsDemo from './poll-results-demo.svelte';
import SliderDetentsDemo from './slider-detents-demo.svelte';
import SwipeDeckDemo from './swipe-deck-demo.svelte';
import ReorderListDemo from './reorder-list-demo.svelte';
import LongPressDemo from './long-press-demo.svelte';
import LightboxDemo from './lightbox-demo.svelte';
import LogoMarqueeDemo from './logo-marquee-demo.svelte';
import BlurUpImageDemo from './blur-up-image-demo.svelte';

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
	'show-more': ShowMoreDemo,
	'skeleton-swap': SkeletonSwapDemo,
	'load-more': LoadMoreDemo,
	'streaming-text': StreamingTextDemo,
	'task-steps': TaskStepsDemo,
	'live-activity': LiveActivityDemo,
	'collapsible-banner': CollapsibleBannerDemo,
	'presence-avatars': PresenceAvatarsDemo,
	'modal': ModalDemo,
	'popover': PopoverDemo,
	'tooltip-group': TooltipGroupDemo,
	'command-palette': CommandPaletteDemo,
	'drawer': DrawerDemo,
	'context-menu': ContextMenuDemo,
	'dropdown': DropdownDemo,
	'wizard-steps': WizardStepsDemo,
	'pagination': PaginationDemo,
	'tree-view': TreeViewDemo,
	'sticky-header': StickyHeaderDemo,
	'reading-progress': ReadingProgressDemo,
	'scroll-spy': ScrollSpyDemo,
	'snap-carousel': SnapCarouselDemo,
	'hide-on-scroll': HideOnScrollDemo,
	'sortable-table': SortableTableDemo,
	'filter-grid': FilterGridDemo,
	'value-flash': ValueFlashDemo,
	'poll-results': PollResultsDemo,
	'slider-detents': SliderDetentsDemo,
	'swipe-deck': SwipeDeckDemo,
	'reorder-list': ReorderListDemo,
	'long-press': LongPressDemo,
	'lightbox': LightboxDemo,
	'logo-marquee': LogoMarqueeDemo,
	'blur-up-image': BlurUpImageDemo,
};

export const bleedDemos = new Set<string>([]);
