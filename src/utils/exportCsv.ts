import type { SaleRecord } from '@/types/domain'

function escapeCell(value: string | number) {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function exportSalesCsv(rows: SaleRecord[]) {
  const header = ['日期', '门店', '城市', '渠道', '销售额', '订单数', '退款率']
  const body = rows.map((row) => [
    row.date,
    row.storeName,
    row.city,
    row.channel,
    row.amount,
    row.orders,
    `${(row.refundRate * 100).toFixed(2)}%`,
  ].map(escapeCell).join(','))
  const blob = new Blob([`\uFEFF${[header.join(','), ...body].join('\n')}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `retailops-sales-${new Date().toISOString().slice(0, 10)}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}
