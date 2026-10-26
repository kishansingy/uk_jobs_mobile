import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { registerPushNotifications } from './composables/usePushNotifications'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

// Register push after app is mounted
registerPushNotifications()
