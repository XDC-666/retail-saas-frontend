import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { permissionDirective } from './directives/permission'
import { useThemeStore } from './stores/theme'
import 'virtual:uno.css'
import './styles/index.scss'
import './styles/v3.scss'
import { i18n } from './locales'
import { installErrorMonitor } from './monitor/error'
import { installPerformanceMonitor } from './monitor/performance'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(i18n)
app.directive('permission', permissionDirective)
useThemeStore(pinia).init()
installErrorMonitor(); installPerformanceMonitor()
app.mount('#app')
