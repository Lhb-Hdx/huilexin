export default {
  bind(el, binding) {
    // 弹框可拉伸最小宽高
    let minWidth = 820
    let minHeight = 420
    // 初始非全屏=
    // let isFullScreen = false
    // 当前宽高
    // let nowWidth = 0
    // 当前顶部高度
    // let nowMarginTop = 0
    // 获取弹框头部（这部分可双击全屏）
    const dialogHeaderEl = el.querySelector('.el-dialog__header')
    // 弹窗
    const dragDom = el.querySelector('.el-dialog')
    // 给弹窗加上overflow auto；不然缩小时框内的标签可能超出dialog；
    dragDom.style.overflow = 'hidden'
    // 清除选择头部文字效果
    // dialogHeaderEl.onselectstart = new Function("return false");
    // 头部加上可拖动cursor
    dialogHeaderEl.style.cursor = 'move'
    dialogHeaderEl.style.cssText += ';cursor:move;'
    dragDom.style.cssText += ';top:0px;'
    // 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
    const sty = (function() {
      if (window.document.currentStyle) {
        return (dom, attr) => dom.currentStyle[attr]
      } else {
        return (dom, attr) => getComputedStyle(dom, null)[attr]
      }
    })()
    // 拖拽边界优化
    let moveDown = (e) => {
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX - dialogHeaderEl.offsetLeft
      const disY = e.clientY - dialogHeaderEl.offsetTop
      const screenWidth = document.body.clientWidth // body当前宽度
      const screenHeight = document.documentElement.clientHeight // 可见区域高度(应为body高度，可某些环境下无法获取)
      const dragDomWidth = dragDom.offsetWidth // 对话框宽度
      const dragDomheight = dragDom.offsetHeight // 对话框高度
      const minDragDomLeft = dragDom.offsetLeft
      const maxDragDomLeft = screenWidth - dragDom.offsetLeft - dragDomWidth
      const minDragDomTop = dragDom.offsetTop
      const maxDragDomTop = screenHeight - dragDom.offsetTop - dragDomheight
      // 获取到的值带px 正则匹配替换
      let styL = sty(dragDom, 'left')
      let styT = sty(dragDom, 'top')
      // 注意在ie中 第一次获取到的值为组件自带50% 移动之后赋值为px
      if (styL.includes('%')) {
        // eslint-disable-next-line no-useless-escape
        styL = +document.body.clientWidth * (+styL.replace(/\%/g, '') / 100)
        // eslint-disable-next-line no-useless-escape
        styT = +document.body.clientHeight * (+styT.replace(/\%/g, '') / 100)
      } else {
        styL = +styL.replace(/\px/g, '')
        styT = +styT.replace(/\px/g, '')
      }

      document.onmousemove = function(e) {
        // 通过事件委托，计算移动的距离
        let left = e.clientX - disX
        let top = e.clientY - disY

        // 边界处理
        if (-left > minDragDomLeft) {
          left = -minDragDomLeft
        } else if (left > maxDragDomLeft) {
          left = maxDragDomLeft
        }
        if (-top > minDragDomTop) {
          top = -minDragDomTop
        } else if (top > maxDragDomTop) {
          top = maxDragDomTop
        }

        // 移动当前元素
        dragDom.style.cssText += `;left:${left + styL}px;top:${top + styT}px;`
      }

      document.onmouseup = function(e) {
        document.onmousemove = null
        document.onmouseup = null
      }
      return false
    }

    dialogHeaderEl.onmousedown = moveDown

    // 双击头部全屏效果
    /* dialogHeaderEl.ondblclick = (e) => {
      if (isFullScreen === false) {
        nowWidth = dragDom.clientWidth
        nowMarginTop = dragDom.style.marginTop
        dragDom.style.left = 0
        dragDom.style.top = 0
        dragDom.style.height = '100VH'
        dragDom.style.width = '100VW'
        dragDom.style.marginTop = 0
        isFullScreen = true
        dialogHeaderEl.style.cursor = 'initial'
        dialogHeaderEl.onmousedown = null
      } else {
        dragDom.style.height = 'auto'
        dragDom.style.width = nowWidth + 'px'
        dragDom.style.marginTop = nowMarginTop
        isFullScreen = false
        dialogHeaderEl.style.cursor = 'move'
        dialogHeaderEl.onmousedown = moveDown
      }
    } */

    dragDom.onmousemove = function(e) {
      if (e.clientX > dragDom.offsetLeft + dragDom.clientWidth - 10 || dragDom.offsetLeft + 10 > e.clientX) {
        dragDom.style.cursor = 'ew-resize'
      } else if (el.scrollTop + e.clientY > dragDom.offsetTop + dragDom.clientHeight - 10) {
        dragDom.style.cursor = 'ns-resize'
      } else {
        dragDom.style.cursor = 'default'
        dragDom.onmousedown = null
      }
      dragDom.onmousedown = (e) => {
        const clientX = e.clientX
        const clientY = e.clientY
        let elW = dragDom.clientWidth
        let elH = dragDom.clientHeight
        let EloffsetLeft = dragDom.offsetLeft
        let EloffsetTop = dragDom.offsetTop
        // dragDom.style.userSelect = 'none';
        let ELscrollTop = el.scrollTop
        // 判断点击的位置是不是为头部
        if (clientX > EloffsetLeft && clientX < EloffsetLeft + elW && clientY > EloffsetTop && clientY < EloffsetTop + 100) {
          // 如果是头部在此就不做任何动作，以上有绑定dialogHeaderEl.onmousedown = moveDown;
        } else {
          document.onmousemove = function(e) {
            // e.preventDefault(); // 移动时禁用默认事件
            // 左侧鼠标拖拽位置
            if (clientX > EloffsetLeft && clientX < EloffsetLeft + 10) {
              // 往左拖拽
              if (clientX > e.clientX) {
                dragDom.style.width = elW + (clientX - e.clientX) * 2 + 'px'
              }
              // 往右拖拽
              if (clientX < e.clientX) {
                if (!dragDom.clientWidth < minWidth) {
                  dragDom.style.width = elW - (e.clientX - clientX) * 2 + 'px'
                }
              }
            }
            // 右侧鼠标拖拽位置
            if (clientX > EloffsetLeft + elW - 10 && clientX < EloffsetLeft + elW) {
              // 往左拖拽
              if (clientX > e.clientX) {
                if (!dragDom.clientWidth < minWidth) {
                  dragDom.style.width = elW - (clientX - e.clientX) * 2 + 'px'
                }
              }
              // 往右拖拽
              if (clientX < e.clientX) {
                dragDom.style.width = elW + (e.clientX - clientX) * 2 + 'px'
              }
            }
            // 底部鼠标拖拽位置
            if (ELscrollTop + clientY > EloffsetTop + elH - 20 && ELscrollTop + clientY < EloffsetTop + elH) {
              let upDom = null
              if (binding.value.length > 0) {
                upDom = el.querySelector(`${binding.value[0]}`)
              }
              // 往上拖拽
              if (clientY > e.clientY) {
                if (!dragDom.clientHeight < minHeight) {
                  dragDom.style.height = elH + (e.clientY - clientY) + 'px'
                  if (upDom) upDom.style.height = elH + (e.clientY - clientY) + 'px'
                }
              }
              // 往下拖拽
              if (clientY < e.clientY) {
                dragDom.style.height = elH + (e.clientY - clientY) + 'px'
                if (upDom) upDom.style.height = elH + (e.clientY - clientY) + 'px'
              }
            }
          }
          // 拉伸结束
          document.onmouseup = function(e) {
            document.onmousemove = null
            document.onmouseup = null
          }
        }
      }
    }
  }
}
