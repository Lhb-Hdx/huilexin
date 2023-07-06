<template>
  <div class="tab-list-switch">
    <div class="switch-content">
      <el-row class="content-row">
        <el-col class="lable-icon"><i class="el-icon-arrow-left " @click="moveButtons('left')" @dblclick="moveSide('left')" /></el-col>
        <el-col ref="buttonBody" class="button-body">
          <el-row :style="{ marginLeft: marginLeft }">
            <slot />
          </el-row>
        </el-col>
        <el-col class="lable-icon"><i class="el-icon-arrow-right " @click="moveButtons('right')" @dblclick="moveSide('right')" /></el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    buttonData: {
      type: Array,
      default: () => {
        return []
      }
    },
    buttonWidth: {
      type: Number,
      default: 62
    }
  },
  data() {
    return {
      clickIndex: 0,
      currentSite: 0,
      showCount: 0,
      clickTimer: null,
      marginLeft: 0
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.showCount = parseInt(this.$refs.buttonBody.$el.clientWidth / this.buttonWidth) // 一行能展示几个按钮
    })
  },
  methods: {
    // 设置名字
    resetName(val) {
      const i = parseInt(this.buttonWidth / 12) - 1
      if (val && val.length > i) {
        return val.slice(0, i)
      } else {
        return val
      }
    },
    // 单击移一格
    moveButtons(val) {
      if (this.clickTimer) {
        window.clearTimeout(this.clickTimer)
        this.clickTimer = null
      }
      this.clickTimer = window.setTimeout(() => {
        this.$nextTick(() => {
          if (val === 'left') {
            if (this.currentSite < 0) {
              this.currentSite = this.currentSite + this.buttonWidth
            }
          } else {
            const totalCount = this.buttonData.length // 总共几个按钮
            const showIndex = -parseInt(this.currentSite / this.buttonWidth) // 向左移了几个按钮
            if (showIndex + this.showCount < totalCount) {
              this.currentSite = this.currentSite - this.buttonWidth
            }
          }
          this.marginLeft = this.currentSite + 'px'
        })
      }, 300)
    },
    // 双击到边
    moveSide(val) {
      if (this.clickTimer) {
        window.clearTimeout(this.clickTimer)
        this.clickTimer = null
      }
      this.$nextTick(() => {
        if (val === 'left') {
          this.currentSite = 0
        } else {
          const totalCount = this.buttonData.length // 总共几个按钮
          if (totalCount > this.showCount) {
            this.currentSite = -((totalCount - this.showCount) * this.buttonWidth)
          }
        }
        this.marginLeft = this.currentSite + 'px'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.tab-list-switch {
  width: 100%;
  height: 100%;
  .switch-content {
    width: 100%;
    margin: 0 auto;
    .content-row {
      display: flex;
      align-items: center;
      background: #000;
      color: #fff;
      .lable-icon {
        width: 20px;
        cursor: pointer;
      }
      .button-body {
        overflow: hidden;
        width: calc(100% - 40px);
        white-space: nowrap;
      }
    }
  }
}
</style>
