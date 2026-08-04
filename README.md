# interior[.]svelte

Micro-interactions for Svelte, built for the half-second after a click.

Everybody builds these components. Almost nobody finishes them. The missing
twenty percent is always the same three things: a jump, a restart, and an
animation that ignores the person watching it. This is an unofficial Svelte
port of [ddoemonn/interior](https://github.com/ddoemonn/interior).

## How it works

There is no package. Each shipped component is copied into your project from
[`src/lib/components/interior/`](src/lib/components/interior/). The behavior
is owned by the component and its adjacent state module, so the file is yours
to reskin or change after installation.

The docs site is live at [interior.spelte.dev](https://interior.spelte.dev),
and every currently ready component has a replayable demo, install command, usage
example, source listing, and prop notes.

## Development

```sh
pnpm install
pnpm dev
```

## Validation

```sh
pnpm check
pnpm lint
pnpm test
pnpm build
```

## Deployment

The app is a SvelteKit Cloudflare Worker. Production deploys run from `main`
through GitHub Actions using Wrangler. Wrangler declares the custom domain
`interior.spelte.dev` in [`wrangler.jsonc`](wrangler.jsonc).

## Design premise

Trust is won in the half-second after a click and lost in exactly the same
place. Every component reserves the space its states need, keeps motion
interruptible, gives keyboard input a complete path, and still communicates
under `prefers-reduced-motion`; only the trip is skipped.
