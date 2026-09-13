import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

const saved = localStorage.getItem('retail-locale') || 'zh-CN'
export const i18n = createI18n({ legacy: false, locale: saved, fallbackLocale: 'zh-CN', messages: { 'zh-CN': zhCN, 'en-US': enUS } })
export function setLocale(locale: 'zh-CN' | 'en-US') { i18n.global.locale.value = locale; localStorage.setItem('retail-locale', locale); document.documentElement.lang = locale }
export function formatMoney(value: number) { return new Intl.NumberFormat(i18n.global.locale.value, { style: 'currency', currency: i18n.global.locale.value === 'zh-CN' ? 'CNY' : 'USD', maximumFractionDigits: 0 }).format(value) }
