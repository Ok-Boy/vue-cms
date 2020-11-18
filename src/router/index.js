import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import GoodsList from '../components/goods/List.vue'
import GoodsAdd from '../components/goods/Add.vue'
import GoodsUpdata from '../components/goods/Updata.vue'
import Order from '../components/order/Order.vue'
import Report from '../components/report/Report.vue'


Vue.use(VueRouter)

const routes = [
  // 路由重定向
  { path: '/', redirect: '/login' },
  // 登录路由规则
  { path: '/login', component: Login },
  // 登录成功后跳转规则
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: GoodsAdd },
      { path: '/goods/updata', component: GoodsUpdata },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report },
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
// 如果用户没有登录，直接通过url访问特定的页面，需要重新导航到登录页面
router.beforeEach((to, from, next) => {
  // 参数 to 表示将要访问的页面路径
  // 参数 from 表示从哪个路径跳转而来
  // 参数 next 是一个函数，表示放行
  // next() 直接放行； next('xxx') 强制跳转

  // console.log('to', to)
  // console.log('from', from)

  // 判断url地址访问的是否是登录页，如果是，将sessionStorage清空，直接放行（可以访问）
  if (to.path === '/login'){
    window.sessionStorage.clear()
    return next()
  } 
  // 获取 token
  const tokenStr = window.sessionStorage.getItem('token')
  // 判断是否获取到了 token
  // 如果没有获取到，则不放行，强行跳转到登录页
  if (!tokenStr) return next('/login')
  // 如果存在，则直接放行
  next()
})
export default router
