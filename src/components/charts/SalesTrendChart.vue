<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { TrendPoint } from '@/types/domain'
import { shortDate } from '@/utils/format'

echarts.use([LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

const props = defineProps<{ data: TrendPoint[]; dark?: boolean }>()
const el = ref<HTMLDivElement | null>(null)
let chart: ReturnType<typeof echarts.init> | null = null
let observer: ResizeObserver | null = null

function render() {
  if (!el.value) return
  if (!chart) chart = echarts.init(el.value, props.dark ? 'dark' : undefined, { renderer: 'canvas' })
  const textColor = props.dark ? '#94a3b8' : '#64748b'
  const gridColor = props.dark ? '#243044' : '#e2e8f0'
  chart.setOption({
    backgroundColor: 'transparent',
    animationDuration: 650,
    tooltip: { trigger: 'axis', valueFormatter: (value: unknown) => Number(value).toLocaleString('zh-CN') },
    legend: { right: 0, top: 0, textStyle: { color: textColor }, data: ['销售额', '订单数'] },
    grid: { left: 12, right: 12, top: 44, bottom: 8, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.data.map((item) => shortDate(item.date)),
      axisLine: { lineStyle: { color: gridColor } },
      axisLabel: { color: textColor },
    },
    yAxis: [
      {
        type: 'value',
        axisLabel: { color: textColor, formatter: (value: number) => `${Math.round(value / 10000)}w` },
        splitLine: { lineStyle: { color: gridColor, type: 'dashed' } },
      },
      {
        type: 'value',
        axisLabel: { color: textColor },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '销售额', type: 'line', smooth: true, symbol: 'circle', symbolSize: 7,
        data: props.data.map((item) => item.amount),
        lineStyle: { width: 3, color: '#4f46e5' },
        itemStyle: { color: '#4f46e5' },
        areaStyle: { color: 'rgba(79,70,229,.12)' },
      },
      {
        name: '订单数', type: 'line', smooth: true, yAxisIndex: 1, symbolSize: 6,
        data: props.data.map((item) => item.orders),
        lineStyle: { width: 2, color: '#10b981' },
        itemStyle: { color: '#10b981' },
      },
    ],
  }, true)
}

function recreate() {
  chart?.dispose()
  chart = null
  render()
}

onMounted(() => {
  render()
  observer = new ResizeObserver(() => chart?.resize())
  if (el.value) observer.observe(el.value)
})
watch(() => props.data, render, { deep: true })
watch(() => props.dark, recreate)
onBeforeUnmount(() => { observer?.disconnect(); chart?.dispose() })
</script>

<template>
  <div ref="el" class="sales-trend-chart" data-testid="sales-trend-chart" />
</template>
