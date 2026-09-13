export const money = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  maximumFractionDigits: 0,
})

export const number = new Intl.NumberFormat('zh-CN')

export const percent = new Intl.NumberFormat('zh-CN', {
  style: 'percent',
  maximumFractionDigits: 1,
})

export function shortDate(date: string) {
  return date.slice(5).replace('-', '/')
}
