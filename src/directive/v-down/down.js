const down = {
  install(Vue) {
    Vue.directive('down', {
      inserted: (el, binding, vnode) => {
        downFile(el, binding, vnode)
      }
    })
  }
}

export const downFile = (el, binding) => {
  el.style.cssText = 'cursor: pointer;color:write;'
  el.addEventListener('click', () => {
    console.log(binding.value)
    let link = document.createElement('a')
    let url = binding.value
    // 这里是将url转成blob地址，
    fetch(url).then(res => res.blob()).then(blob => { // 将链接地址字符内容转变成blob地址
      link.href = URL.createObjectURL(blob)
      console.log(link.href)
      link.download = ''
      document.body.appendChild(link)
      link.click()
    })
  })
}

export default down
