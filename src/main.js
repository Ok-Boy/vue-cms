import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 导入element-ui
import './plugin/element.js'
import 'element-ui/lib/theme-chalk/index.css'

// 导入自定义日期过滤器
import './plugin/time.js'

// 导入字体图标
import './assets/fonts/iconfont.css'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 导入页面加载进度条插件 nprogress
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 导入全局样式表
import './assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'

// 导入axios
import axios from 'axios'

// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 设置请求拦截器，在请求拦截器中展示进度条
axios.interceptors.request.use((config) => {
  // 展示进度条
  NProgress.start()
  // 需要授权的 API ，必须在请求头中使用 `Authorization` 字段提供 `token` 令牌
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 必须有return
  return config
})
// 设置响应拦截器，在响应拦截器中隐藏进度条
axios.interceptors.response.use((config) => {
  NProgress.done()
  return config
})

// 全局注册富文本编辑器
Vue.use(VueQuillEditor)
Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
