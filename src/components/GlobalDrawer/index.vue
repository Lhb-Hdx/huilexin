<template>
  <div ref="rightPanel" :class="{ show: visible }" class="rightPanel-container">
    <div v-if="modal" class="rightPanel-background" />
    <div class="rightPanel" :style="{ width }">
      <div class="rightPanel-items">
        <div class="rightPanel-header">
          <div class="rightPanel-header-title">{{ title }}</div>
          <div class="rightPanel-header-close" @click="visible = !visible">
            <i class="el-icon-close" />
          </div>
        </div>
        <div class="rightPanel-body">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { addClass, removeClass } from '@/utils'

export default {
  name: 'RightPanel',
  props: {
    clickNotClose: {
      default: false,
      type: Boolean
    },
    modal: {
      default: false,
      type: Boolean
    },
    show: {
      default: false,
      type: Boolean
    },
    title: {
      type: String,
      default: '标题'
    },
    width: {
      type: String,
      default: '30%'
    }
  },
  computed: {
    visible: {
      get() {
        return this.show
      },
      set(val) {
        this.$emit('update:show', val)
      }
    }
  },
  watch: {
    show(value) {
      if (value && !this.clickNotClose) {
        this.addEventClick()
      }
      if (value) {
        addClass(document.body, 'showRightPanel')
      } else {
        removeClass(document.body, 'showRightPanel')
      }
    }
  },
  mounted() {
    this.insertToBody()
  },
  beforeDestroy() {
    const elx = this.$refs.rightPanel
    elx.remove()
    removeClass(document.body, 'showRightPanel')
  },
  methods: {
    addEventClick() {
      window.addEventListener('click', this.closeSidebar)
    },
    closeSidebar(evt) {
      const parent = evt.target.closest('.rightPanel')
      if (!parent) {
        this.show = false
        window.removeEventListener('click', this.closeSidebar)
      }
    },
    insertToBody() {
      const elx = this.$refs.rightPanel
      const body = document.querySelector('body')
      body.insertBefore(elx, body.firstChild)
    }
  }
}
</script>

<style>
.showRightPanel {
  overflow: hidden;
  position: relative;
  width: calc(100% - 15px);
}
</style>

<style lang="scss" scoped>
.rightPanel-background {
  position: fixed;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.7, 0.3, 0.1, 1);
  background: rgba(0, 0, 0, 0.2);
  z-index: -1;
}

.rightPanel {
  position: fixed;
  top: 110px;
  right: 0;
  bottom: 0;
  transition: all 0.25s cubic-bezier(0.7, 0.3, 0.1, 1);
  transform: translate(100%);
  background: #fff;
  z-index: 2000;
}

.showRightPanel {
  .rightPanel {
    box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.05);
  }
}

.show {
  transition: all 0.3s cubic-bezier(0.7, 0.3, 0.1, 1);

  .rightPanel-background {
    z-index: 20000;
    opacity: 1;
    width: 100%;
    height: 100%;
  }

  .rightPanel {
    transform: translate(0);
  }

  .handle-button {
    transform: translate3d(-30px, 0, 0);
  }
}

.handle-button {
  width: 48px;
  height: 48px;
  position: absolute;
  left: -18px;
  text-align: center;
  font-size: 24px;
  border-radius: 50% 0 0 50% !important;
  z-index: 0;
  pointer-events: auto;
  cursor: pointer;
  color: #fff;
  line-height: 48px;
  transition: transform 0.2s cubic-bezier(0.7, 0.3, 0.1, 1);
  i {
    font-size: 24px;
    line-height: 48px;
  }
  &:hover {
    transform: translate3d(-30px, 0, 0);
  }
}
.rightPanel-items {
  height: 100%;
  .rightPanel-header {
    height: 36px;
    background: rgb(221, 221, 221);
    display: flex;
    justify-content: space-between;
  }
  .rightPanel-header-title {
    line-height: 36px;
    font-weight: bold;
    padding-left: 15px;
  }
  .rightPanel-header-close {
    width: 36px;
    line-height: 36px;
    text-align: center;
    font-size: 22px;
    background: rgb(254, 77, 78);
    cursor: pointer;
    color: #f2f2f2;
    transition: all 0.25s ease-in-out;
    &:hover {
      color: #fff;
      background: red;
    }
  }
  .rightPanel-body {
    height: calc(100% - 45px);
    overflow-y: auto;
    overflow-x: hidden;
  }
}
</style>
