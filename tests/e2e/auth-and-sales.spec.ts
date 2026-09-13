import { expect, test } from '@playwright/test'

test('owner can login, see chart, export permission and switch theme', async ({ page }) => {
  await page.goto('/#/login')
  await page.getByTestId('login-submit').click()
  await expect(page.getByRole('heading', { name: '经营数据总览' })).toBeVisible()
  await expect(page.getByTestId('sales-trend-chart')).toBeVisible()
  await page.getByTestId('theme-toggle').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByRole('link', { name: '销售明细' }).click()
  await expect(page.getByTestId('sales-table')).toBeVisible()
  await expect(page.getByRole('button', { name: /导出当前页 CSV/ })).toBeVisible()
})

test('clerk has reduced navigation and no export action', async ({ page }) => {
  await page.goto('/#/login')
  await page.getByRole('button', { name: /门店员工/ }).click()
  await page.getByTestId('login-submit').click()
  await expect(page.getByRole('link', { name: '门店管理' })).toHaveCount(0)
  await page.getByRole('link', { name: '销售明细' }).click()
  await expect(page.getByRole('button', { name: /导出当前页 CSV/ })).toHaveCount(0)
})
