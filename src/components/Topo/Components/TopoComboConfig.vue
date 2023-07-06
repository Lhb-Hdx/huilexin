<template>
  <div class="config-content-right-component">
    <div class="right-config-group">
      <div class="config-group-title">
        分组样式
        <i :class="isMenuDown === true ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" @click="clickMenuDown" />
      </div>
      <div v-show="isMenuDown" class="config-group-main">
        <div class="group-main-item">
          <div class="group-main-title">分组名称：</div>
          <div class="group-main-value" style="display: flex">
            <input v-model.lazy="topoComboProp.groupName" type="text" class="input">
          </div>
        </div>
        <div class="group-main-item">
          <div class="group-main-title">分组图形：</div>
          <div class="group-main-value">
            <el-select v-model.lazy="topoComboProp.groupType" size="mini" placeholder="请选择">
              <el-option
                v-for="item in topoShape"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>
        <div class="group-main-item">
          <div class="group-main-title">分组颜色：</div>
          <div class="group-main-value">
            <el-color-picker v-model="topoComboProp.groupColor" size="mini" @change="changeBgColor" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { topoShape } from '@/utils/define-data'

export default {
  name: 'ComboConfig',
  props: {
    topoCombo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      isMenuDown: true,
      topoShape: [],
      topoComboProp: []
    }
  },
  watch: {
    topoCombo: {
      handler(newVal, oldVal) {
        let isHaveNewValue = false
        Object.keys(newVal).forEach(key => {
          if (newVal[`${key}`] !== oldVal[`${key}`]) isHaveNewValue = true
        })
        if (!isHaveNewValue) return
        this.topoComboProp = newVal
      },
      deep: true
    },
    topoComboProp: {
      handler(newVal, oldVal) {
        if (Object.keys(oldVal).length > 0 && oldVal.id === newVal.id) {
          this.$emit('updateCombo', newVal)
        }
      },
      deep: true
    }
  },
  mounted() {
    this.topoShape = topoShape()
    this.topoComboProp = { ...this.topoCombo }
    this.$emit('updateCombo', this.topoComboProp)
  },
  methods: {
    // 菜单收缩
    clickMenuDown() {
      this.isMenuDown = !this.isMenuDown
    },
    changeBgColor() {
      this.$emit('updateCombo', this.topoComboProp)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../Styles/TopoEditor.scss';
</style>
