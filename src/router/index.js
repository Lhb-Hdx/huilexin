import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'
import SaasLayout from '@/views/saas/layout/saas-layout'
/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  }, {
    path: '/authorization',
    component: () => import('@/views/authorization'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/navigat',
    component: () => import('@/views/navigat/index'),
    hidden: true
  },
  {
    path: '/saas/login',
    component: () => import('@/views/saas/login')
  },
  {
    path: '/saas',
    component: SaasLayout,
    redirect: '/saas/index',
    children: [
      { path: 'index', name: 'HYiSAAS平台登录', component: () => import('@/views/saas/index') },
      { path: 'app', name: '应用', component: () => import('@/views/saas/app') },
      { path: 'company', name: '企业管理', component: () => import('@/views/saas/company') },
      { path: 'application', name: '微信平台应用', component: () => import('@/views/saas/application') },
      { path: 'weixin', name: '微信公众号', component: () => import('@/views/saas/application/weixin') },
      { path: 'wxapp', name: '微信小程序', component: () => import('@/views/saas/application/wxapp') },
      { path: 'qywx.self', name: '企业微信(自建)', component: () => import('@/views/saas/application/qywx.self') },
      { path: 'qywx.parent', name: '企业微信(代开发)', component: () => import('@/views/saas/application/qywx.parent') },
      { path: 'qywx.3rd', name: '企业微信(第三方)', component: () => import('@/views/saas/application/qywx.3rd') },
      { path: 'email', name: '微信平台应用', component: () => import('@/views/saas/application/email') },
      { path: 'alisms', name: '微信平台应用', component: () => import('@/views/saas/application/alisms') },
      { path: 'hysaas', name: '开放平台应用', component: () => import('@/views/saas/application/hysaas') },
      { path: 'weixin-user', name: '微信用户', component: () => import('@/views/saas/user/weixin') },
      { path: 'qywx.self-user', name: '企微（自建）用户', component: () => import('@/views/saas/user/qywx.self') },
      { path: 'qywx.parent-user', name: '企微（代建）用户', component: () => import('@/views/saas/user/qywx.parent') },
      { path: 'qywx.3rd-user', name: '企微（三方）用户', component: () => import('@/views/saas/user/qywx.3rd') },
      { path: 'template-qywx.self', name: '企微(自建)模板', component: () => import('@/views/saas/template/qywx.self') },
      { path: 'template-qywx.parent', name: '企微(代建)模板', component: () => import('@/views/saas/template/qywx.parent') },
      { path: 'template-qywx.3rd', name: '企微(三方)模板', component: () => import('@/views/saas/template/qywx.3rd') },
      { path: 'template-weixin', name: '微信公众号消息模板', component: () => import('@/views/saas/message/weixin') },
      { path: 'template-wxapp', name: '微信小程序消息模板', component: () => import('@/views/saas/message/wxapp') },
      { path: 'template-email', name: '邮件消息模板', component: () => import('@/views/saas/template/email') },
      { path: 'template-alisms', name: '阿里短信消息模板', component: () => import('@/views/saas/template/alisms') },
      { path: 'message-logs', name: '日志审计', component: () => import('@/views/saas/message/logs') },
      { path: 'topo', name: '统计拓扑', component: () => import('@/views/saas/summarize/topo') }
    ]
  },
  {
    path: '/unify-link',
    component: () => import('@/views/unify/unify-link'),
    hidden: true
  }
]

export const asyncRoutes = []

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter () {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

window.reset = resetRouter

export default router
