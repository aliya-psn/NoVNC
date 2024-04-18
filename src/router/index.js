/*
 * router路由
 */
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const RemoteView = () => import('@/views/index')

export const constantRouterMap = [{ path: '*', component: RemoteView, hidden: true }]

export default new Router({
    // mode: 'history', //后端支持可开
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRouterMap
})
