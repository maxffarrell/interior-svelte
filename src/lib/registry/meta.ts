export type Prop = {
	name: string;
	type: string;
	default?: string;
	note: string;
};

export type ComponentMeta = {
	/** the conventional import name for the component's default export */
	export: string;
	/**
	 * There is deliberately no `usage` field. The example lives at
	 * `src/lib/usage/<slug>.usage.svelte` as a real component, so ESLint, `svelte-check`
	 * and the autofixer all police it and it cannot drift from the API it documents.
	 */
	props: Prop[];
	/**
	 * What this component refuses to get wrong. Deliberately **not rendered** on the
	 * docs page - upstream does not either. It is the porting contract: walk this list
	 * against the running demo before ticking the component off in PROGRESS.md.
	 */
	notes: string[];
	/**
	 * npm packages the component imports, e.g. `['motion']`. Drives both the
	 * `dependencies` field of the generated shadcn registry item and the Install
	 * section of the docs page - so neither is hardcoded. Omit when there are none;
	 * a component with no dependencies should say so rather than print a command
	 * nobody needs to run.
	 */
	dependencies?: string[];
	/** other slugs in this registry the component composes, e.g. `['ripple']` */
	registryDependencies?: string[];
	/**
	 * Extra files shipped alongside the component, in shadcn's own registry-item shape.
	 * `type` is one of shadcn's file types - `registry:hook` for a `.svelte.ts` rune
	 * module, the Svelte answer to one of upstream's hooks. A `target` keeps the file
	 * beside the component rather than in the consumer's hooks directory, which is what
	 * lets the component import it relatively and skip aliasing entirely.
	 */
	files?: Array<{ path: string; type: string; target?: string }>;
};

/**
 * A slug appearing here is what makes a component `ready`: it gets a docs page, a
 * source listing and a prerender entry. Everything else in the registry renders as
 * `planned`.
 *
 * Each component owns exactly two source files and one entry in this map, so nothing
 * that builds a component ever has to touch a file another component also touches.
 * Append as each one lands.
 */
export const meta: Record<string, ComponentMeta> = {
	accordion: {
		export: 'Accordion',
		props: [],
		notes: ['Disclosure content with a stable row and keyboard-friendly toggle.']
	},
	'progress-bar': {
		export: 'ProgressBar',
		props: [],
		notes: ['Indeterminate progress hands over to determinate progress without changing the track.']
	},
	'typing-indicator': {
		export: 'TypingIndicator',
		props: [],
		notes: ['The three-dot pulse remains compact and respects reduced motion.']
	},
	'new-items-pill': {
		export: 'NewItemsPill',
		props: [],
		notes: ['New content is announced without stealing the reader’s scroll position.']
	},
	tabs: { export: 'Tabs', props: [], notes: ['One active surface is shared across the tab row.'] },
	'segmented-control': {
		export: 'SegmentedControl',
		props: [],
		notes: ['The active segment inverts in place, keeping the row width stable.']
	},
	'text-reveal': {
		export: 'TextReveal',
		props: [],
		notes: ['Words arrive in reading order with a restrained blur and lift.']
	},
	'show-more': {
		export: 'ShowMore',
		props: [],
		notes: ['Additional content expands in place rather than teleporting the reader.']
	},
	'floating-label': {
		export: 'FloatingLabel',
		dependencies: ['motion-sv'],
		files: [
			{
				path: './src/lib/components/interior/floating-label.state.svelte.ts',
				type: 'registry:hook',
				target: 'interior/floating-label.state.svelte.ts'
			}
		],
		props: [
			{
				name: 'label',
				type: 'string',
				note: "The field's name. It moves into a reserved slot above the text; it is never swapped out for a placeholder."
			},
			{
				name: 'value',
				type: 'string',
				note: 'Controlled value. Omit for an uncontrolled field and the label still tracks the DOM node.'
			},
			{
				name: 'defaultValue',
				type: 'string',
				note: 'Uncontrolled starting value. Counted on the first render, so a pre-filled field never animates its label on load.'
			},
			{
				name: 'onChange',
				type: '(value: string) => void',
				note: 'Receives the value, so `onChange={(v) => (email = v)}` is the whole handler.'
			},
			{
				name: 'hint',
				type: 'string',
				note: 'Secondary line under the field. Read once by screen readers through aria-describedby, not re-announced per keystroke.'
			},
			{
				name: 'invalid',
				type: 'boolean',
				default: 'false',
				note: 'Recolours the border and the label and sets aria-invalid. The message itself stays the caller’s job.'
			},
			{
				name: 'maxlength',
				type: 'number',
				note: 'Enables the counter. Its width is reserved at the largest string it can ever show, so digits rolling over never nudge the row.'
			},
			{
				name: 'required',
				type: 'boolean',
				default: 'false',
				note: 'Sets the native constraint and marks the label. The asterisk is aria-hidden because the input already announces required.'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				note: 'Dims the field and drops focus state, so a field disabled mid-focus does not keep a lit border.'
			},
			{
				name: 'ref',
				type: 'HTMLInputElement | null',
				default: 'null',
				note: 'Bindable. The input node, for form libraries that focus or scroll to a field.'
			},
			{
				name: 'FloatingLabelState',
				type: '(options: FloatingLabelOptions | (() => FloatingLabelOptions)) => FloatingLabelState',
				note: "The machine on its own, from './floating-label.state.svelte' — the rune-class form of upstream's useFloatingLabel hook. Spread `inputProps` onto any input and read `raised`, `filled`, `focused`, `length` and `instant`."
			},
			{
				name: 'class',
				type: 'string',
				note: 'Merged last onto the wrapper. Width and margins are yours.'
			}
		],
		notes: [
			'The label makes room instead of disappearing: the field reserves the raised row and the hint row at mount, so it stands the same height in every reachable state and a counter, an error colour or a hint arriving on blur cannot push the submit button down the page.',
			'The label travels on transform only — y and scale, origin pinned to its left edge — so raising it costs no layout and the spring resumes from wherever the label currently is when you refocus a field you were leaving.',
			'A value the browser restores on back-navigation, or one a password manager writes without firing a framework change event, still raises the label: the field reads its own node on mount and listens for native input and change, so text is never printed underneath the label.',
			'The mount-time raise is applied with zero duration, so a field that arrives pre-filled from the server presents its label already raised rather than animating on page load.',
			'Under prefers-reduced-motion the label still occupies the raised slot and the hint still changes; only the trip is skipped, and nothing is hidden.',
			'Screen readers get the hint once through aria-describedby and never hear the character counter, which is aria-hidden — the native maxlength attribute carries that information instead of sixty live-region updates.'
		]
	},
	'hold-to-confirm': {
		export: 'HoldToConfirm',
		dependencies: ['motion-sv'],
		files: [
			{
				path: './src/lib/components/interior/hold-to-confirm.state.svelte.ts',
				type: 'registry:hook',
				target: 'interior/hold-to-confirm.state.svelte.ts'
			}
		],
		props: [
			{
				name: 'onConfirm',
				type: '() => void',
				note: 'Fires once, only when the hold reaches full duration. A click never reaches it.'
			},
			{
				name: 'label',
				type: 'string',
				note: "The resting label. It stays the button's accessible name in every state, including after it commits."
			},
			{
				name: 'onAbort',
				type: '() => void',
				note: 'Fires the moment a hold is released early, including a stray click. Useful for measuring how often people almost destroyed something.'
			},
			{
				name: 'confirmLabel',
				type: 'string',
				default: '"Confirmed"',
				note: 'Shown after commit and announced once through a polite live region.'
			},
			{
				name: 'duration',
				type: 'number',
				default: '1800',
				note: 'Milliseconds of continuous hold required. Also the number spoken in the screen reader hint.'
			},
			{
				name: 'resetAfter',
				type: 'number',
				default: '1600',
				note: 'Milliseconds the confirmed state is held before the button returns to rest. Set to 0 to keep it confirmed and reset it yourself.'
			},
			{
				name: 'steps',
				type: 'number',
				default: '20',
				note: 'Render budget for the hold. Progress is sampled this many times, and the sweep runs as one continuous animation independent of them.'
			},
			{
				name: 'releaseRate',
				type: 'number',
				default: '2.5',
				note: 'How many times faster progress drains than it fills when you let go. Re-pressing mid-drain resumes from what is left.'
			},
			{
				name: 'moveTolerance',
				type: 'number',
				default: '10',
				note: 'Pixels the pointer may wander from where it landed before the hold is released.'
			},
			{
				name: 'haptic',
				type: 'boolean',
				default: 'true',
				note: 'Fires a 14ms vibration at commit where the platform supports it.'
			},
			{
				name: 'HoldToConfirmState',
				type: 'new (options: HoldToConfirmOptions | (() => HoldToConfirmOptions))',
				note: "The machine on its own, from './hold-to-confirm.state.svelte' - the rune-class form of upstream's useHoldToConfirm hook. Spread `hold.props` onto whatever should be held - it carries every pointer and key path and the attachment that cleans them up - and read `phase`, `step` and `progress`. Both files land in your interior/ directory, so the component imports it relatively."
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				note: 'Marked with aria-disabled rather than the disabled attribute, so focus is never dropped to the body mid-hold.'
			},
			{
				name: 'class',
				type: 'string',
				note: "Merged last onto the button, so the surface, radius and width are the caller's."
			}
		],
		notes: [
			'A click cannot confirm: the click event is prevented at every stage, so a mis-aimed pointer, a double-click on the row underneath, or a stray Enter on a focused button destroys nothing.',
			'Releasing early does not snap the progress to zero, it drains at a bounded rate, and pressing again resumes from whatever is left rather than restarting the count.',
			'The label does not change while you hold. A block sweeps across the button and the same text inverts inside it, so the only thing moving is the progress itself, and the button never changes width. Layout never reflows when the state changes.',
			'Progress arrives as twenty discrete steps rather than a float, so a 1.2 second hold costs twenty renders instead of eighty, and nothing reactive is written per animation frame.',
			'Losing the window, hiding the tab, dragging past the move tolerance, or blurring the button all release the hold, so a hold can never survive in the background and fire when nobody is watching.',
			'Screen readers get a static hint naming the required hold time and one polite announcement at commit, never a stream of progress updates, and prefers-reduced-motion removes the springs while leaving the hold itself intact, because the delay is the guard rail and not decoration.'
		]
	},
	'like-burst': {
		export: 'LikeBurst',
		dependencies: ['motion-sv'],
		files: [
			{
				path: './src/lib/components/interior/like-burst.state.svelte.ts',
				type: 'registry:hook',
				target: 'interior/like-burst.state.svelte.ts'
			}
		],
		props: [
			{
				name: 'initialLiked',
				type: 'boolean',
				default: 'false',
				note: 'Server truth at mount. Read once; the component owns the value afterwards, so a prop update never yanks the heart back mid-gesture.'
			},
			{
				name: 'initialCount',
				type: 'number',
				default: '0',
				note: 'Server truth at mount. Both reachable counts, base and base + 1, are measured up front to reserve the width.'
			},
			{
				name: 'onCommit',
				type: '(liked: boolean, signal: AbortSignal) => Promise<unknown>',
				note: 'Called once per settled intent, never once per tap. Reject to trigger the rollback; the signal aborts when a newer intent supersedes this one.'
			},
			{
				name: 'onError',
				type: '(error: unknown) => void',
				note: 'Fires after the UI has already rolled back to the last confirmed state, so the handler only has to explain, not repair.'
			},
			{
				name: 'onToggle',
				type: '(liked: boolean) => void',
				note: 'Fires on every tap with the intended state. Use it for analytics; do not use it for writes.'
			},
			{
				name: 'settle',
				type: 'number',
				default: '400',
				note: 'Milliseconds of quiet before intent is committed. A burst of taps inside this window collapses into at most one request.'
			},
			{
				name: 'label',
				type: 'string',
				default: '"Like"',
				note: 'The accessible name in both states, and the resting label. The pressed state is carried by aria-pressed, not by the name.'
			},
			{
				name: 'activeLabel',
				type: 'string',
				default: '"Liked"',
				note: 'Visible label once liked. Shares a grid cell with label, so the button is the width of the wider of the two at all times.'
			},
			{
				name: 'format',
				type: '(value: number) => string',
				default: 'Intl.NumberFormat("en-US")',
				note: 'Formats the count. Must be pure and locale-fixed; it runs on the server and on the client.'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				note: 'Refuses new intent. A commit already in flight still settles and still reconciles.'
			},
			{
				name: 'toggle()',
				type: '() => void',
				note: 'Not a prop: a component export. Bind the instance with bind:this to flip the like from outside - it takes the same debounced path a tap does, and does not fire onToggle.'
			},
			{
				name: 'class',
				type: 'string',
				note: 'Merged last onto the button, so width and spacing are the caller’s.'
			},
			{
				name: 'OptimisticLikeState',
				type: 'new (options?: OptimisticLikeOptions | (() => OptimisticLikeOptions))',
				note: "The optimism on its own, from './like-burst.state.svelte' - the rune-class form of upstream's useOptimisticLike hook. `toggle` answers instantly and debounces the write; `liked`, `count`, `base`, `pending` and `burst` are what you draw from, and `settled` is the only value safe to announce. Construct it during component initialisation; it aborts the in-flight commit on teardown."
			}
		],
		notes: [
			'Nine taps produce one request. Intent is debounced by settle, and a burst that returns to the confirmed state sends nothing at all, so a double tap is not a write followed by an undo write.',
			'Responses that arrive out of order cannot win. Every flush increments a sequence number and aborts the previous controller, so a slow unlike landing after a fast like is discarded rather than applied.',
			'A rejected commit rolls the count and the fill back to the last confirmed value, not to zero and not to a guess, so the number on screen is never a lie the user has to reload to discover.',
			'The button never changes width. Both labels share one grid cell, and the count cell reserves the wider of base and base + 1 up front, so a like at 999 does not shove the row.',
			'Screen readers get the settled value once from a polite status region; the optimistic count and the burst are aria-hidden, so a fast tapper does not queue nine announcements.',
			'Under prefers-reduced-motion the sparks are not rendered and the fill switches with no transition. The state still arrives, only the trip is skipped.'
		]
	},
	ripple: {
		export: 'Ripple',
		dependencies: ['motion-sv'],
		files: [
			{
				path: './src/lib/components/interior/ripple.state.svelte.ts',
				type: 'registry:hook',
				target: 'interior/ripple.state.svelte.ts'
			}
		],
		props: [
			{
				name: 'children',
				type: 'Snippet',
				note: 'The label of the pressable surface. It is painted above the ripple layer, so the bloom never washes it out.'
			},
			{
				name: 'onPress',
				type: '() => void',
				note: 'Fired on click, which means pointer and keyboard activation both route through the same native path.'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				note: 'Disables the button and refuses to spawn ripples, so a dead control never gives live feedback.'
			},
			{
				name: 'max',
				type: 'number',
				default: '4',
				note: 'Ceiling on simultaneous blooms. A hammered key evicts the oldest instead of growing the DOM without limit.'
			},
			{
				name: 'tintClass',
				type: 'string',
				default: '"bg-ink/15"',
				note: 'The bloom fill. It is ink at 15%, so it reads on both themes without a dark: variant; swap it when the surface is inverted or tinted with a brand colour.'
			},
			{
				name: 'class',
				type: 'string',
				note: 'Merged last onto the button, so radius, height and padding are the caller’s. The clip layer reads border-radius with rounded-[inherit], so overriding the radius still clips correctly.'
			},
			{
				name: 'RippleState',
				type: 'new (options?: RippleOptions | (() => RippleOptions))',
				note: "The headless half, from './ripple.state.svelte' - the rune-class form of upstream's useRipple hook, for surfaces that are not this button. Spread nothing: `{@attach ripple.attach}` wires every pointer and key path onto the host element, and `ripples` is the list to paint. Options may be a getter when `disabled` or `max` is reactive."
			}
		],
		notes: [
			'A tap released in forty milliseconds still gets a whole bloom: the fade cannot begin until the ripple has been visible for its minimum window, so the fastest presses are the ones most implementations swallow and this one does not.',
			'The bloom is spawned at the pointer’s coordinates inside the element rect and scaled to the distance of the farthest corner, so a press on an edge fills the surface instead of stopping short of the opposite side.',
			'Nothing that moves is a layout property: the ripple is a fixed 40px patch, absolutely positioned inside an aria-hidden overlay, driven only by transform and opacity, so no press can shift the content sitting above it.',
			'Pointer capture, lost capture, pointer cancel, blur, and tab hide all release through one path, so dragging off the control, scrolling the list out from under a finger, or switching tabs mid-press never strands a ripple on screen.',
			'Space and Enter spawn from the element’s centre and release on key up, so keyboard activation is acknowledged exactly like a finger, while the overlay stays aria-hidden and the button announces itself once rather than once per bloom.',
			'Under prefers-reduced-motion the patch arrives already at full size and only fades, so the press is still confirmed and only the travel is skipped.'
		]
	},
	'icon-morph': {
		export: 'IconMorph',
		dependencies: ['motion-sv'],
		files: [
			{
				path: './src/lib/components/interior/icon-morph.state.svelte.ts',
				type: 'registry:hook',
				target: 'interior/icon-morph.state.svelte.ts'
			}
		],
		props: [
			{
				name: 'preset',
				type: '"menu-close" | "play-pause" | "plus-minus" | "check-close"',
				default: '"menu-close"',
				note: 'Built-in shape pair. Each preset ships its paths on a shared command signature so the geometry interpolates.'
			},
			{
				name: 'shapes',
				type: 'readonly MorphShape[]',
				note: 'Your own states: `{ d: string[]; rotate?: number }` per state. Two or more; the button cycles through them.'
			},
			{
				name: 'mode',
				type: '"stroke" | "fill"',
				default: "preset's mode",
				note: 'Whether the paths are stroked outlines or filled bodies. Play/pause is filled, the rest are stroked.'
			},
			{
				name: 'labels',
				type: 'readonly string[]',
				default: "preset's labels",
				note: 'One per state. Becomes the accessible name, and the visible text when showLabel is set.'
			},
			{
				name: 'active',
				type: 'number | boolean',
				note: 'Controlled state index. A boolean maps to 0 and 1. Bindable - bind:active writes the next index back, as a boolean if you bound a boolean. Omit to let the component own its state.'
			},
			{
				name: 'defaultActive',
				type: 'number | boolean',
				default: '0',
				note: 'Starting state when uncontrolled. Read once at mount, so a later change does not yank the icon back.'
			},
			{
				name: 'onActiveChange',
				type: '(index: number) => void',
				note: 'Fires with the next index on activation, in both controlled and uncontrolled mode.'
			},
			{
				name: 'semantics',
				type: '"label" | "pressed" | "expanded"',
				default: '"label"',
				note: 'Which ARIA state the second index reports: none, aria-pressed, or aria-expanded.'
			},
			{
				name: 'showLabel',
				type: 'boolean',
				default: 'false',
				note: 'Renders the labels beside the icon. All of them share one grid cell, so the button is as wide as the longest.'
			},
			{
				name: 'size',
				type: 'number',
				default: '20',
				note: 'Icon box in px. The 24-unit viewBox scales to it; the button stays 36px tall.'
			},
			{ name: 'strokeWidth', type: 'number', default: '1.75', note: 'Stroke mode only.' },
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				note: 'Blocks activation and the press displacement.'
			},
			{
				name: 'class',
				type: 'string',
				note: 'Merged last onto the button, so any of the chrome - width, padding, colour - is the caller’s.'
			},
			{
				name: 'IconMorphState',
				type: 'new (options?: IconMorphOptions | (() => IconMorphOptions))',
				note: "The shape machine on its own, from './icon-morph.state.svelte' - the rune-class form of upstream's useIconMorph hook, along with iconMorphPresets. It hands you `slots`, `rotate`, `mode`, `label` and `index` to draw with, and `setIndex` and `toggle` to drive it. Controlled use passes `active` plus a `setActive` writer, so the index can live wherever you keep it."
			}
		],
		notes: [
			'Two icons crossfaded over each other draw both shapes at once through the middle of the transition; this renders one path list and interpolates its coordinates, so there is never a second icon on screen to catch.',
			'Every state is padded to the same slot count, and a slot a state does not use collapses to a zero-length path and fades, so the number of paths never changes mid-flight and no stroke pops into existence.',
			'The icon box and the label cell are reserved before the first paint - all labels stack in one grid cell - so swapping Play for Pause or Menu for Close cannot widen the button or push the row beside it.',
			'Activating the control mid-transition resumes the spring from the geometry currently on screen, rather than snapping back to the previous shape and replaying.',
			'Under prefers-reduced-motion the target geometry is applied in one frame; the icon still shows the correct state instead of being hidden or left mid-morph.',
			'It is a real button with aria-pressed or aria-expanded and an accessible name that changes once per state, so a screen reader announces the new state on activation and nothing repeats it.'
		]
	},
	'press-depth': {
		export: 'PressDepth',
		dependencies: ['motion-sv'],
		files: [
			{
				path: './src/lib/components/interior/press-depth.state.svelte.ts',
				type: 'registry:hook',
				target: 'interior/press-depth.state.svelte.ts'
			}
		],
		props: [
			{
				name: 'children',
				type: 'Snippet',
				note: 'Label content for the key face. Rendered in a flex row with a 8px gap, so an icon and a word sit together without extra markup.'
			},
			{
				name: 'depth',
				type: 'number',
				default: '4',
				note: 'Travel in pixels. The wrapper reserves this space as bottom padding before the first press, so the key never changes footprint.'
			},
			{
				name: 'tilt',
				type: 'number',
				default: '7',
				note: 'Degrees the face leans towards the point of contact. The lean is dropped under prefers-reduced-motion; the travel is not.'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				note: 'Blocks the gesture and releases any press already in flight.'
			},
			{
				name: 'type',
				type: "'button' | 'submit' | 'reset'",
				default: "'button'",
				note: 'Forwarded to the underlying button so the key works inside a form.'
			},
			{
				name: 'onclick',
				type: 'MouseEventHandler<HTMLButtonElement>',
				note: 'Native click. Activation is left to the browser, so Enter, Space, and release-outside behave exactly as they do on a plain button. Every other button attribute - aria-label, form, name, value - is forwarded the same way.'
			},
			{
				name: 'class',
				type: 'string',
				note: 'Appended last to the key face, so surface, padding, and type are overridable.'
			},
			{
				name: 'ref',
				type: 'HTMLButtonElement | null',
				default: 'null',
				note: 'Bindable. The underlying button element, for focus or measurement.'
			},
			{
				name: 'PressDepthState',
				type: 'new (options?: PressDepthOptions | (() => PressDepthOptions))',
				note: "The gesture on its own, from './press-depth.state.svelte' - the rune-class form of upstream's usePressDepth hook, for drawing your own surface. Spread `press.props` onto the element being pressed - it carries the pointer and key paths and the attachment that marks the hit box - then draw from `pressed` and `origin`. Options are disabled, onPressStart, onPressEnd - pass them as a getter to keep disabled live. Construct it during component initialisation; it owns effects."
			}
		],
		notes: [
			'The key reserves its travel as bottom padding before the first press, so depressing it moves a transform and never the layout around it.',
			"Press state is tracked on the window rather than the element, so a pointer that leaves the key mid-hold lifts it, and a pointer that comes back presses it again - the visual state and the browser's own click suppression agree.",
			'A press that is interrupted by a scroll, a tab switch, a window blur, or a disabled prop arriving mid-hold releases instead of sticking down forever.',
			'Activation stays with the browser: Enter and Space fire a real click on a real button, so no synthetic handler double-fires and no keyboard path is invented.',
			'Auto-repeat is ignored, so holding Enter presses once instead of hammering the key sixty times a second.',
			'The pressed state is a change of material rather than of colour: the cap with its lip crossfades into the well it has been driven into, so the depth carries the state and nothing has to be tinted to say it.',
			'Under prefers-reduced-motion the key still lands at full depth, instantly - the confirmation survives, only the spring is dropped.'
		]
	},
	'loading-button': {
		export: 'LoadingButton',
		dependencies: ['motion-sv'],
		files: [
			{
				path: './src/lib/components/interior/loading-button.state.svelte.ts',
				type: 'registry:hook',
				target: 'interior/loading-button.state.svelte.ts'
			}
		],
		props: [
			{
				name: 'onAction',
				type: '() => unknown',
				note: 'The work to run. Anything thenable is awaited; a rejection settles the button into its error face and is passed to onError.'
			},
			{
				name: 'label',
				type: 'string',
				note: 'Resting label. Also the accessible name, which follows the state rather than staying fixed.'
			},
			{
				name: 'pendingLabel',
				type: 'string',
				default: 'label',
				note: 'Shown while the action is in flight. Defaults to the resting label, so the button reads as the same control doing the same thing.'
			},
			{
				name: 'successLabel',
				type: 'string',
				default: '"Done"',
				note: 'Shown and announced when the action resolves.'
			},
			{
				name: 'errorLabel',
				type: 'string',
				default: '"Try again"',
				note: 'Shown and announced when it rejects. Phrased as the next action, not as a diagnosis.'
			},
			{
				name: 'resetAfter',
				type: 'number',
				default: '1400',
				note: 'Milliseconds the settled face is held before returning to idle.'
			},
			{
				name: 'onError',
				type: '(error: unknown) => void',
				note: 'Receives the rejection. The button reports the failure either way; this is for logging it.'
			},
			{ name: 'disabled', type: 'boolean', default: 'false', note: 'Refuses the press.' },
			{
				name: 'class',
				type: 'string',
				note: 'Merged last onto the button, so width and spacing are the caller’s.'
			},
			{
				name: 'AsyncActionState',
				type: 'new (options: AsyncActionOptions | (() => AsyncActionOptions))',
				note: "The four-state machine on its own, from './loading-button.state.svelte' - the rune-class form of upstream's useAsyncAction hook. Call `run`, read `status` and `pending`, and let the class hold the reset timer and the run ticket that discards a result from a superseded run. Construct it during component initialisation; it clears its own timer on teardown."
			}
		],
		notes: [
			'All four faces are mounted in one grid cell from the first paint, so the button is sized for its widest state and cannot resize when the label changes. This is the whole point: a button that grows from Save to Saving moves every control after it, mid-click.',
			'Every run takes a ticket, and a settle from an abandoned run is discarded. Without it a slow first request can land after a fast second one and report the wrong outcome on top of it.',
			'A press while pending is refused rather than queued, and the button carries aria-busy and aria-disabled instead of the disabled attribute - so it keeps its colours and stays in the accessibility tree while it works.',
			'The spinner only spins while the pending face is the visible one. A hidden element animating at 60fps is work nobody can see.',
			'The outcome is announced once from a polite region outside the button, so a screen reader hears \u201cSent\u201d rather than the whole control being read again.',
			'Under prefers-reduced-motion the crossfade is instant and the spinner holds still; the state still changes, only the travel is dropped.'
		]
	},
	'copy-button': {
		export: 'CopyButton',
		dependencies: ['motion-sv'],
		files: [
			{
				path: './src/lib/components/interior/copy-button.state.svelte.ts',
				type: 'registry:hook',
				target: 'interior/copy-button.state.svelte.ts'
			}
		],
		props: [
			{
				name: 'value',
				type: 'string',
				note: 'The text written to the clipboard. An empty value refuses the press rather than reporting a false success.'
			},
			{
				name: 'label',
				type: 'string',
				default: '"Copy"',
				note: 'Resting label, and the accessible name for every state.'
			},
			{
				name: 'copiedLabel',
				type: 'string',
				default: '"Copied"',
				note: 'Shown and announced after a successful write.'
			},
			{
				name: 'errorLabel',
				type: 'string',
				default: '"Failed"',
				note: 'Shown and announced when both the clipboard API and the fallback refuse.'
			},
			{
				name: 'timeout',
				type: 'number',
				default: '2000',
				note: 'Milliseconds the result is held before reverting to idle. The timer restarts on each press.'
			},
			{
				name: 'onCopy',
				type: '(value: string) => void',
				note: 'Fires once per successful write, with the value that landed.'
			},
			{
				name: 'onError',
				type: '(reason: unknown) => void',
				note: 'Fires with the rejection when the write could not be made.'
			},
			{ name: 'disabled', type: 'boolean', default: 'false', note: 'Refuses the press.' },
			{
				name: 'class',
				type: 'string',
				note: 'Merged last onto the button, so width and spacing are the caller’s.'
			},
			{
				name: 'CopyToClipboardState',
				type: 'new (options?: CopyToClipboardOptions | (() => CopyToClipboardOptions))',
				note: "The write and its outcome on their own, from './copy-button.state.svelte' - the rune-class form of upstream's useCopyToClipboard hook. `copy(value)` returns to idle after `timeout`, `status` is what you draw from, and the execCommand fallback for insecure origins comes with it. Construct it during component initialisation; it clears its own timer on teardown."
			}
		],
		notes: [
			'All three labels are mounted in one grid cell from the first paint, so the button is sized for its widest word and cannot resize when the label swaps. A copy button that grows by six pixels on success moves everything after it in the row.',
			'The three icons share a single cell the same way. The check is drawn rather than faded in - a normalised pathLength means the dash maths is independent of the real geometry.',
			'Pressing again restarts the revert timer instead of stacking timers, so mashing the button holds "Copied" for the full timeout from the last press rather than reverting on the first one to land.',
			'Clipboard access is refused outside a secure context and in some embedded webviews, so a rejected write falls back to a selected off-screen textarea, and the selection the person already had is put back afterwards.',
			'The result is announced once through a polite status region - the visible label swap is aria-hidden, so a screen reader hears "Copied" rather than re-reading the whole button.',
			'Under prefers-reduced-motion the crossfade and the check draw are dropped; the state still changes, only the travel is skipped.'
		]
	},
	'expanding-search': {
		export: 'ExpandingSearch',
		dependencies: ['motion-sv'],
		files: [
			{
				path: './src/lib/components/interior/expanding-search.state.svelte.ts',
				type: 'registry:hook',
				target: 'interior/expanding-search.state.svelte.ts'
			}
		],
		props: [
			{
				name: 'label',
				type: 'string',
				default: '"Search"',
				note: 'Accessible name shared by the collapsed trigger and the input, so both read the same in the a11y tree.'
			},
			{
				name: 'placeholder',
				type: 'string',
				default: '"Search"',
				note: 'Placeholder text; it is clipped by the shell while collapsed rather than being unmounted.'
			},
			{
				name: 'resultCount',
				type: 'number',
				note: 'When supplied, reserves a fixed tabular slot in the field and feeds the debounced live region. Omit it and the slot is never allocated.'
			},
			{
				name: 'align',
				type: '"left" | "right"',
				default: '"right"',
				note: 'Which edge of the reserved track the field is anchored to. Right-anchored fields open leftward over the toolbar actions.'
			},
			{
				name: 'value',
				type: 'string',
				note: 'Controlled query. Leave undefined to let the component own it. `bind:value` works and makes onChange optional.'
			},
			{
				name: 'defaultValue',
				type: 'string',
				default: '""',
				note: 'Initial query when uncontrolled. A literal, so remounting resets the field.'
			},
			{
				name: 'onChange',
				type: '(value: string) => void',
				note: 'Fires on every keystroke. Use it to mirror state, not to run the search.'
			},
			{
				name: 'onSearch',
				type: '(value: string) => void',
				note: 'Fires once the typing settles, and immediately on Enter. This is the one to hang a query off.'
			},
			{
				name: 'onSubmit',
				type: '(value: string) => void',
				note: 'Enter. The pending debounce is flushed first so onSearch never arrives after it.'
			},
			{
				name: 'debounce',
				type: 'number',
				default: '220',
				note: 'Milliseconds of quiet before onSearch fires.'
			},
			{
				name: 'open',
				type: 'boolean',
				note: 'Controlled expansion. Focus handling still runs; only the state lives outside. `bind:open` works too.'
			},
			{
				name: 'defaultOpen',
				type: 'boolean',
				default: 'false',
				note: 'Start expanded, for a page whose primary action is searching.'
			},
			{
				name: 'onOpenChange',
				type: '(open: boolean) => void',
				note: 'Called once per real transition, never twice for the same expand.'
			},
			{
				name: 'collapseOnBlur',
				type: 'boolean',
				default: 'true',
				note: 'Collapse when focus leaves and the query is empty. A non-empty query is never collapsed away.'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				note: "Blocks expansion and the input, and keeps the trigger out of the tab order's reach."
			},
			{
				name: 'class',
				type: 'string',
				note: 'Merged last onto the reserved track, so width and position are the caller’s.'
			},
			{
				name: 'ExpandingSearchState',
				type: 'new (options?: ExpandingSearchOptions | (() => ExpandingSearchOptions))',
				note: "The disclosure, the debounce and the focus handling on their own, from './expanding-search.state.svelte' - the rune-class form of upstream's useExpandingSearch hook. Three prop bags come out of it rather than one - `rootProps`, `triggerProps`, `inputProps` - because the behaviour is spread across three elements, and each element's node is captured through an attachment so `expand()` and `collapse()` work without a bind:this. Construct it during component initialisation; it clears its own debounce on teardown."
			}
		],
		notes: [
			'The track reserves the expanded width before anything opens, so the row beside the field never reflows; neighbouring actions fade where they stand instead of being shoved sideways.',
			'Focus moves to the input synchronously inside the click handler rather than on animation-complete, so the iOS keyboard is not suppressed and a screen reader is never left pointing at a trigger that has already gone.',
			'Blur collapses the field only when it is empty, and a blur caused by switching browser tabs is ignored, so a typed query is never destroyed by clicking somewhere else. Containment is read from focusin/focusout, because the DOM focus and blur events do not bubble and React only appears to say otherwise.',
			'Escape clears a non-empty query and collapses an empty one, returning focus to the trigger instead of the document body, and the event is consumed so a dialog behind the field does not close along with it.',
			'Keystrokes are debounced before onSearch fires and Enter flushes the pending call, so the search runs once per intent; the polite live region announces only the settled result count, not one message per character.',
			'The input holds its expanded width at all times and is clipped by the shell, so the text inside never re-wraps mid-spring, and prefers-reduced-motion drops the transitions to zero without hiding either state.'
		]
	},
	'inline-validation': {
		export: 'InlineValidation',
		dependencies: ['motion-sv'],
		files: [
			{
				path: './src/lib/components/interior/inline-validation.state.svelte.ts',
				type: 'registry:hook',
				target: 'interior/inline-validation.state.svelte.ts'
			}
		],
		props: [
			{
				name: 'label',
				type: 'string',
				note: 'Visible label, wired to the input through `for`. Never swapped out for a placeholder.'
			},
			{
				name: 'value',
				type: 'string',
				note: 'Controlled value. The field owns no text of its own.'
			},
			{
				name: 'onChange',
				type: '(value: string) => void',
				note: 'Receives the raw input value on every keystroke, so `onChange={(v) => (email = v)}` is the whole handler.'
			},
			{
				name: 'validate',
				type: '(value: string) => string | null',
				note: 'Pure check. Return the message to show, or null when the value is acceptable. Called untracked, so an inline arrow does not retrigger the field.'
			},
			{
				name: 'hint',
				type: 'string',
				note: 'Resting help text. Shares one grid cell with the error and crossfades out when the error takes over.'
			},
			{
				name: 'debounce',
				type: 'number',
				default: '400',
				note: 'Milliseconds a still-wrong value waits before the message updates. Clearing is never debounced.'
			},
			{
				name: 'reserveLines',
				type: 'number',
				default: '1',
				note: 'Lines of message space reserved up front, 16px each, held open by an invisible twin rather than a hardcoded height. Longer messages clamp instead of growing the field.'
			},
			{
				name: 'type',
				type: "'text' | 'email' | 'password' | 'tel' | 'url' | 'search'",
				default: "'text'",
				note: 'Native input type.'
			},
			{
				name: 'required',
				type: 'boolean',
				default: 'false',
				note: 'Sets the native constraint and aria-required, and marks the label. The message still comes from validate.'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				note: 'Disables the input, dims the whole field and drops focus state, so a field disabled mid-focus does not keep a lit border.'
			},
			{
				name: 'id',
				type: 'string',
				note: 'Overrides the generated input id. Hint and error ids always come from `$props.id()`, so they are stable across server and client.'
			},
			{
				name: 'ref',
				type: 'HTMLInputElement | null',
				default: 'null',
				note: 'Bindable. The input node, for form libraries that focus or scroll to a field.'
			},
			{
				name: 'InlineValidationState',
				type: '(options: InlineValidationOptions | (() => InlineValidationOptions)) => InlineValidationState',
				note: "The behaviour without the chrome, from './inline-validation.state.svelte' — the rune-class form of upstream's useInlineValidation hook. Read `status`, `error`, `message`, `touched`, `focused`, `valid` and `invalid`, call `commit` and `reset`, and spread `fieldProps` onto your own input."
			},
			{
				name: 'class',
				type: 'string',
				note: 'Merged last onto the field wrapper. Width and margins are yours.'
			}
		],
		notes: [
			'The message slot is measured and reserved before anything is wrong, so an error arriving never pushes the next field, the footer or the submit button down the page.',
			'Validation waits for the first blur; a field you have not finished with is never told it is wrong halfway through the first word.',
			'After that first blur a value that becomes correct clears the message immediately, while a value that is still wrong waits out the debounce, so the text under the input cannot flicker once per keystroke.',
			'Hint and error occupy the same grid cell and only opacity and three pixels of travel move between them, so swapping one for the other cannot change the row’s width or height.',
			'A long message clamps inside its reserved lines rather than animating to an unbounded height, so no validator can make the form taller than it declared it would be.',
			'The announcement lives in one polite region carrying only the settled message, so a screen reader hears the error once instead of on every keypress, and under prefers-reduced-motion the message and the status glyph arrive at full opacity with no travel.',
			'The error message the field is currently showing survives its own exit: the settled text is kept while the paragraph fades out, so a message never blanks mid-crossfade and leaves an empty red row.'
		]
	},
	'password-strength': {
		export: 'PasswordStrength',
		dependencies: ['motion-sv'],
		files: [
			{
				path: './src/lib/components/interior/password-strength.state.svelte.ts',
				type: 'registry:hook',
				target: 'interior/password-strength.state.svelte.ts'
			}
		],
		props: [
			{
				name: 'value',
				type: 'string',
				note: 'The password being typed. The component is controlled and keeps no copy of the secret.'
			},
			{
				name: 'rules',
				type: 'readonly PasswordRule[]',
				default: 'defaultPasswordRules',
				note: 'The requirement set. Its length is the number of segments, so a five-rule policy draws five cells without touching the markup.'
			},
			{
				name: 'labels',
				type: 'readonly string[]',
				default: "['Empty', 'Weak', 'Fair', 'Good', 'Strong']",
				note: 'One label per score from 0 to rules.length. All of them share a single grid cell, so the widest sets the width once.'
			},
			{
				name: 'announceDelay',
				type: 'number',
				default: '700',
				note: 'Milliseconds of quiet before the live region speaks. The visible meter is never delayed by it.'
			},
			{
				name: 'showRules',
				type: 'boolean',
				default: 'true',
				note: 'Renders the requirement checklist under the meter. Turn it off when the policy is stated elsewhere on the page.'
			},
			{
				name: 'PasswordStrengthState',
				type: '(options: PasswordStrengthOptions | (() => PasswordStrengthOptions)) => PasswordStrengthState',
				note: "The machine on its own, from './password-strength.state.svelte' — the rune-class form of upstream's usePasswordStrength hook. Read `score`, `max`, `label`, `rules`, `guessable` and `tone` to gate a submit button or draw your own meter; spread `rootProps` onto an element to also get the debounced `announcement`, which is what owns the timer."
			},
			{
				name: 'class',
				type: 'string',
				note: 'Merged last onto the wrapper. Width and margins are yours.'
			}
		],
		notes: [
			'Strength is a whole number of segments, never a percentage, so the meter cannot report a change too small to name; the cells, the label and the count move together or not at all.',
			'The five verdict labels occupy one grid cell and the requirement list is fixed length, so nothing below the field, including the submit button, moves while a password is typed.',
			'A screen reader hears the verdict once, after typing stops, from a polite region that names the level and the requirements still outstanding, instead of a new announcement per keystroke.',
			'Meaning is never carried by colour: the number of filled cells, the label, and a per-row met or not met string each state it, so the component survives greyscale and low vision.',
			'Segments fill with transform rather than width, and each cell springs from wherever it currently is, so deleting three characters reverses the fill mid-flight instead of restarting it.',
			'Common passwords, four-character repeats and keyboard walks are capped at one segment, because a meter that calls Passw0rd! strong is worse than no meter at all.',
			'Amber is spent here and nowhere else in the set. A strength meter genuinely has three verdicts, and painting the middle one red or green would be a lie.',
			'Under prefers-reduced-motion every cell, label and tick arrives at its final state with zero duration; the verdict is never withheld, only the trip to it.'
		]
	},
	'otp-input': {
		export: 'OtpInput',
		dependencies: ['motion-sv'],
		files: [
			{
				path: './src/lib/components/interior/otp-input.state.svelte.ts',
				type: 'registry:hook',
				target: 'interior/otp-input.state.svelte.ts'
			}
		],
		props: [
			{
				name: 'length',
				type: 'number',
				default: '6',
				note: 'Number of cells. The group reserves its full width on first paint.'
			},
			{
				name: 'mode',
				type: "'numeric' | 'alphanumeric'",
				default: "'numeric'",
				note: 'Which characters survive typing and pasting. Sets inputmode so phones open the right keyboard.'
			},
			{
				name: 'defaultValue',
				type: 'string',
				default: "''",
				note: 'Seed characters, filtered by mode and truncated to length. The cells own the value after mount.'
			},
			{
				name: 'onChange',
				type: '(value: string) => void',
				note: 'Fires on every accepted edit, including a paste that fills several cells at once.'
			},
			{
				name: 'onComplete',
				type: '(value: string) => void',
				note: 'Fires the moment every cell holds a character, and again on each later edit of a full code.'
			},
			{
				name: 'status',
				type: "'idle' | 'error' | 'success'",
				default: "'idle'",
				note: 'One prop for all three verdicts, rather than upstream’s separate booleans. `error` marks every cell aria-invalid and shakes the group once on the edge into it; `success` turns the cells moss. The characters are kept either way.'
			},
			{
				name: 'hint',
				type: 'string',
				default: "''",
				note: 'Occupies the same grid cell as the error and success messages, so the three never move each other.'
			},
			{
				name: 'errorMessage',
				type: 'string',
				default: "''",
				note: 'Shown in the status line while status is error, and announced once through a polite live region.'
			},
			{
				name: 'successMessage',
				type: 'string',
				default: "''",
				note: 'The success branch of the same line. Supplying any of the three messages reserves the row for all of them.'
			},
			{
				name: 'label',
				type: 'string',
				default: "'Verification code'",
				note: 'Names the group and each cell, as "character 3 of 6".'
			},
			{
				name: 'groupEvery',
				type: 'number',
				default: '3',
				note: 'Inserts a wider gap every N cells so a six-digit code reads as two triplets. Set to 0 for one even run.'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				note: 'Disables every cell, drops the focus indicator and hides the caret.'
			},
			{
				name: 'autofocus',
				type: 'boolean',
				default: 'false',
				note: 'Focuses the first cell after mount rather than during render. Lowercase, matching the DOM attribute it shadows.'
			},
			{
				name: 'focusOnError',
				type: 'boolean',
				default: 'true',
				note: 'On rejection, returns focus to the first cell with its character selected so retyping overwrites.'
			},
			{
				name: 'clear',
				type: '() => void',
				note: 'Instance method. `bind:this` the component and call `field.clear()` to empty every cell and return to the first — the Svelte answer to upstream’s imperative handle.'
			},
			{
				name: 'focus',
				type: '() => void',
				note: 'Instance method. Focuses the first cell and selects whatever it holds.'
			},
			{
				name: 'OtpInputState',
				type: 'new (options: OtpInputOptions | (() => OtpInputOptions))',
				note: "The machine on its own, from './otp-input.state.svelte' — the rune-class form of upstream's useOtpInput hook. Spread `cellProps(i)` onto each input; it carries the value, the keyboard, paste and focus paths, and the attachment that registers the cell. Read `chars`, `value`, `complete` and `focusedIndex`, and drive it with `focusAt` and `clear`. Both files land in your interior/ directory, so the component imports it relatively."
			},
			{
				name: 'class',
				type: 'string',
				note: 'Merged last onto the outer wrapper, so width and spacing are yours.'
			}
		],
		notes: [
			'A pasted code fills every cell from one event: paste is intercepted, filtered to the allowed alphabet, and distributed from cell zero whenever the clipboard holds a full-length code, so pasting into the wrong cell is not a failure state.',
			'Autofilled codes arrive as a single multi-character input event and are distributed the same way, because only the first cell claims autocomplete one-time-code and no cell sets maxlength.',
			'Rejection never destroys work: the characters stay where they are, focus returns to the first cell with its content selected, and the shake plays once on the edge into error rather than on every recompute while the error is up.',
			'The cell array is the source of truth, so clearing a digit in the middle leaves a hole instead of sliding the digits after it one place left.',
			'The hint, the error and the success message share one grid cell in a reserved h-4 row and only opacity moves, so a status change cannot push the submit button down the page.',
			'Each cell registers itself through one attachment key hoisted to a readonly field, with the per-cell attachment memoised by index, so recomputing the prop bag on every keystroke never tears a cell down and drops its listeners.',
			'Screen readers get the message once from a polite live region and each cell announces its own position; under prefers-reduced-motion the shake, the caret blink and the character entrance are skipped while the value, the invalid border and the status line still arrive.'
		]
	},
	'tag-input': {
		export: 'TagInput',
		dependencies: ['motion-sv'],
		files: [
			{
				path: './src/lib/components/interior/tag-input.state.svelte.ts',
				type: 'registry:hook',
				target: 'interior/tag-input.state.svelte.ts'
			}
		],
		props: [
			{
				name: 'value',
				type: 'string[]',
				note: 'Bindable. Controlled list of tags — `bind:value={topics}` is the whole integration. Omit to let the component own its state.'
			},
			{
				name: 'defaultValue',
				type: 'string[]',
				default: '[]',
				note: 'Initial list when the component is uncontrolled. Read once in the constructor, so a list restored from the server never animates its chips in on load.'
			},
			{
				name: 'onChange',
				type: '(tags: string[]) => void',
				note: 'Fires once per committed change, never per keystroke. Use it alongside `bind:value` or instead of it.'
			},
			{
				name: 'max',
				type: 'number',
				note: 'Hard ceiling. Reaching it shows the limit message and reveals a counter whose width is reserved at the largest value it can ever print, so the digits rolling over cannot nudge the row.'
			},
			{
				name: 'separators',
				type: 'string[]',
				default: "[',']",
				note: 'Characters that commit the draft on keypress and split pasted text. Enter always commits; newlines and tabs always split.'
			},
			{
				name: 'allowDuplicates',
				type: 'boolean',
				default: 'false',
				note: 'When false, a repeat entry is refused case-insensitively and the tag already holding that value is lit for 460ms instead.'
			},
			{
				name: 'validate',
				type: '(candidate: string, tags: string[]) => boolean',
				note: 'Runs on the trimmed, whitespace-collapsed candidate before it is added, against the list as it stands mid-paste.'
			},
			{
				name: 'label',
				type: 'string',
				note: 'Rendered as a real label bound to the input. Without it the input falls back to aria-label="Tags".'
			},
			{
				name: 'placeholder',
				type: 'string',
				default: "'Add a tag'",
				note: 'Placeholder for the draft field. Also sizes the draft slot at mount, so an empty field is already as wide as its own prompt.'
			},
			{
				name: 'hint',
				type: 'string',
				default: "'Enter adds · Backspace removes'",
				note: 'Persistent description, referenced by aria-describedby. Rejection messages cross-fade over it in the same grid cell.'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				note: 'Dims the field and disables the draft input. The chips stay readable rather than disappearing.'
			},
			{
				name: 'TagInputState',
				type: '(options: TagInputOptions | (() => TagInputOptions)) => TagInputState',
				note: "The machine on its own, from './tag-input.state.svelte' — the rune-class form of upstream's useTagInput hook. Spread `inputProps` onto any input and read `tags`, `draft`, `armedIndex`, `message`, `showMessage` and `announcement`, or drive it with `add`, `removeAt` and `focus`."
			},
			{
				name: 'class',
				type: 'string',
				note: 'Merged last onto the wrapper, so width and margins are yours.'
			}
		],
		notes: [
			'Backspace on an empty field highlights the last tag before it removes anything, and a held Backspace is dropped until the key is released, so key repeat cannot chain-delete a list a user only meant to trim by one.',
			'Enter is ignored while an IME composition is open, so confirming a Japanese or Korean candidate commits the word to the field instead of committing a half-typed tag to the list.',
			'Pasted text is split on the configured separators plus newlines and tabs, so a copied comma list arrives as six tags rather than one tag six words long.',
			'A refused duplicate lights the tag that already holds the value instead of only printing an error, and the hint and the error share one grid cell, so nothing below the field moves when a message appears.',
			'The idle and highlighted labels are two layers in the same grid cell and the highlight is a fill that cross-fades over the chip, so arming a tag re-paints it without ever re-measuring it; removals leave on opacity and x while the remaining tags close the gap with layout position, and the row is capped in height and scrolls rather than growing without bound.',
			'Assistive technology gets one polite announcement per event — added, selected, removed, each with the running count — not a stream, and every path is reachable from the keyboard: arrow keys walk the tags, Delete removes the armed one, Escape only disarms so a surrounding dialog still closes.',
			'Under prefers-reduced-motion the chips still arrive, light and leave, and the message still swaps; only the travel and the spring are dropped, so no state is hidden behind an animation nobody asked for.'
		]
	}
};
