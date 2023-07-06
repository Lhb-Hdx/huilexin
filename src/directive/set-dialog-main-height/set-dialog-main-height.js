const setDialogMainHeight = {
  install(Vue) {
    Vue.directive('set-dialog-main-height', {
      inserted: (el, binding, vnode) => {
        setHeight(el, binding, vnode)
      }
    })
  }
}

export const setHeight = (el, binding) => {
  el.children[0].style.height = binding.value
}

export default setDialogMainHeight
