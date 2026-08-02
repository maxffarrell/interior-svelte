import prettier from 'eslint-config-prettier';
import path from 'node:path';
import js from '@eslint/js';
import betterTailwind from 'eslint-plugin-better-tailwindcss';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	{ ignores: ['worker-configuration.d.ts'] },
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			'no-undef': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser
			}
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js', '**/*.ts'],
		extends: [betterTailwind.configs['recommended-error']],
		settings: {
			'better-tailwindcss': {
				entryPoint: 'src/routes/layout.css'
			}
		},
		rules: {
			'better-tailwindcss/enforce-consistent-class-order': 'off',
			'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
			'better-tailwindcss/no-unknown-classes': [
				'error',
				{
					ignore: [
						'^mat-(panel|float|well|cap|row)$',
						'term',
						'fade-scroll',
						'^(press|meta|tnum|fade-y|no-bar|scroll-inset)$',
						'^shiki$'
					]
				}
			]
		}
	}
);
