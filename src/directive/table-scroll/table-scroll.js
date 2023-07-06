const tableScroll = {
  install(Vue) {
    Vue.directive('tableScroll', {
      bind(el, binding, vnode, oldVnode) {
        let scrollTop = 0
        let dom = el.querySelector('.el-table__body-wrapper')
        dom.addEventListener('scroll', (e) => {
          // let isBottom = (dom.scrollHeight).toFixed(0) - (dom.scrollTop).toFixed(0) === dom.clientHeight;
          let isBottom = (dom.scrollHeight).toFixed(0) - (dom.scrollTop).toFixed(0) - dom.clientHeight <= 10
          let isHorizontal = scrollTop === dom.scrollTop
          if (isBottom && !isHorizontal && dom.scrollTop !== 0) {
            if (binding.value) {
              binding.value()
            }
          }
          if (!isHorizontal) {
            scrollTop = dom.scrollTop
          }
        })
      }
    })
  }
}

export default tableScroll
