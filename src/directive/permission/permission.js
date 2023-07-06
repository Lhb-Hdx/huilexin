import store from '@/store'

/**
 * 界面按钮权限控制指令
 */

const hasPermission = {
  install(Vue) {
    Vue.directive('permission', {
      inserted: (el, binding, vnode) => {
        filterGlobalPermission(el, binding, vnode)
      }
    })
  }
}

/**
 * 界面按钮权限控制
 */

export const filterGlobalPermission = (el, binding) => {
  const { value } = binding
  const roles = store.getters && store.getters.roles
  if (value && value instanceof Array && value.length > 0) {
    const permissionRoles = value

    const isPermission = roles.some(role => {
      return permissionRoles.includes(role)
    })

    if (!isPermission) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  } else {
    throw new Error(`需要使用权限？节点绑定指令如 v-permission="['Get','Search']"`)
  }
}

export default hasPermission
