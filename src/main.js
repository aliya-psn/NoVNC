/*
 * 主函数
 * UI库：elementUI
 * 新手引导：VueTour
 */
import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import router from './router'
import { default as api } from './utils/api'

Vue.use(ElementUI, { size: 'small' })

// 全局的常量
Vue.prototype.api = api

Vue.config.productionTip = false
new Vue({
    render: h => h(App),
    router
}).$mount('#app')
