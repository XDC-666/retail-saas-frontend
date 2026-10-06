<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { z } from 'zod'
import AppDrawer from '@/components/common/AppDrawer.vue'
import type { Store, StoreInput } from '@/types/domain'

const props = defineProps<{ open: boolean; store?: Store }>()
const emit = defineEmits<{ close: []; submit: [value: StoreInput] }>()

const submitting = ref(false)
const errors = ref<Record<string, string>>({})

const emptyForm: StoreInput = {
  name: '',
  city: '',
  manager: '',
  address: '',
  phone: '',
  target: 1000000,
  status: 'open',
}

const form = reactive<StoreInput>({ ...emptyForm })

const schema = z.object({
  name: z.string().min(2, '至少输入 2 个字符'),
  city: z.string().min(2, '请输入城市'),
  manager: z.string().min(2, '请输入负责人'),
  address: z.string().min(5, '请输入详细地址'),
  phone: z.string().regex(/^[0-9-]{7,20}$/, '电话号码格式不正确'),
  target: z.coerce.number().positive('目标必须大于 0'),
  status: z.enum(['open', 'closed']),
})

const title = computed(() => (props.store ? '编辑门店' : '新增门店'))

watch(
  () => [props.open, props.store] as const,
  ([open, store]) => {
    if (!open) return
    Object.assign(form, store ?? emptyForm)
    errors.value = {}
  },
)

async function submit() {
  if (submitting.value) return

  const result = schema.safeParse(form)
  if (!result.success) {
    errors.value = Object.fromEntries(
      result.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
    )
    return
  }

  submitting.value = true
  emit('submit', result.data)
  // 抽屉由父组件关闭，这里兜底复位，避免异常时按钮卡在禁用态
  setTimeout(() => {
    submitting.value = false
  }, 500)
}

function close() {
  emit('close')
}
</script>

<template>
  <AppDrawer :open="open" :title="title" @close="close">
    <form class="drawer-form" @submit.prevent="submit">
      <label class="field">
        <span>门店名称</span>
        <input v-model.trim="form.name" placeholder="例如：上海静安旗舰店" />
        <small v-if="errors.name">{{ errors.name }}</small>
      </label>

      <div class="form-columns">
        <label class="field">
          <span>城市</span>
          <input v-model.trim="form.city" />
          <small v-if="errors.city">{{ errors.city }}</small>
        </label>
        <label class="field">
          <span>负责人</span>
          <input v-model.trim="form.manager" />
          <small v-if="errors.manager">{{ errors.manager }}</small>
        </label>
      </div>

      <label class="field">
        <span>详细地址</span>
        <input v-model.trim="form.address" />
        <small v-if="errors.address">{{ errors.address }}</small>
      </label>

      <div class="form-columns">
        <label class="field">
          <span>联系电话</span>
          <input v-model.trim="form.phone" />
          <small v-if="errors.phone">{{ errors.phone }}</small>
        </label>
        <label class="field">
          <span>月度目标</span>
          <input v-model.number="form.target" type="number" min="1" />
          <small v-if="errors.target">{{ errors.target }}</small>
        </label>
      </div>

      <label class="field">
        <span>营业状态</span>
        <select v-model="form.status">
          <option value="open">营业中</option>
          <option value="closed">已停业</option>
        </select>
      </label>
    </form>

    <template #footer>
      <button class="btn-ghost" type="button" @click="close">取消</button>
      <button class="btn-primary" :disabled="submitting" @click="submit">
        {{ submitting ? '保存中…' : '保存门店' }}
      </button>
    </template>
  </AppDrawer>
</template>