import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import WelCome from '../components/WelCome.vue'
import Users from '../components/users/Users.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    component: Login
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/home',
    component: Home,
    redirect: 'welcome',
    children: [
      {
        path: '/welcome',
        component: WelCome
      },
      {
        path:'/users',
        component:Users
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

//挂载路由导航守卫
// to表示要访问的路径
// from表示从哪个函数跳转
// next表示放行
// next()放行，next('/xxxx') 强制跳转
export default router
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  //获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
