import { defineConfig, presetAttributify, presetUno, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetAttributify()],
  transformers: [transformerDirectives()],
  shortcuts: {
    'atomic-inline-meta': 'inline-flex items-center gap-1 text-xs font-600',
  },
})
