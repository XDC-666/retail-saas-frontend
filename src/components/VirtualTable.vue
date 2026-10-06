<script setup lang="ts" generic="T extends { id: string }">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{ items: T[]; rowHeight?: number; height?: number }>(),
  { rowHeight: 48, height: 520 },
)

/** 上下各多渲染几行，滚动时不容易看到空白 */
const OVERSCAN = 8

const scrollTop = ref(0)

const startIndex = computed(() =>
  Math.max(0, Math.floor(scrollTop.value / props.rowHeight) - OVERSCAN),
)

const visibleCount = computed(() =>
  Math.ceil(props.height / props.rowHeight) + OVERSCAN * 2,
)

const visibleItems = computed(() =>
  props.items.slice(startIndex.value, startIndex.value + visibleCount.value),
)

function onScroll(event: Event) {
  scrollTop.value = (event.target as HTMLElement).scrollTop
}
</script>

<template>
  <div class="virtual-table" :style="{ height: `${height}px` }" @scroll="onScroll">
    <!-- 外层撑出总高度，内层用 transform 把可视区域平移到对应位置 -->
    <div :style="{ height: `${items.length * rowHeight}px`, position: 'relative' }">
      <div :style="{ transform: `translateY(${startIndex * rowHeight}px)` }">
        <div
          v-for="(item, index) in visibleItems"
          :key="item.id"
          class="virtual-row"
          :style="{ height: `${rowHeight}px` }"
        >
          <slot :item="item" :index="startIndex + index" />
        </div>
      </div>
    </div>
  </div>
</template>