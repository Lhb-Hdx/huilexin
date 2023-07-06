<template>
  <div class="transfer-list">
    <div class="transfer-list-panel">
      <div class="panel-header">
        <template v-if="useLeftHeaderSlot">
          <slot name="leftHeader" />
        </template>
        <template v-else>
          <el-checkbox v-model="changeLeftAll" @change="onChangeLeftAll($event)" />
          <div class="panel-header-title">{{ titles[0] }}</div>
        </template>
      </div>
      <div ref="leftPanelBody" class="panel-body">
        <div v-for="item in dataSource" :key="item[dataKey]" class="body-item">
          <el-checkbox v-model="item.checked" :label="item[dataLabel]" :disabled="item.disabled" @change="onChangeLeft($event, item)">
            <slot v-if="useListItemSlot" :item="item" />
            <template v-else>{{ item[dataLabel] }}</template>
          </el-checkbox>
        </div>
        <div v-if="dataSource.length === 0" class="empty">暂无数据</div>
      </div>
      <div v-if="useLeftFooterSlot" class="panel-footer">
        <slot name="leftFooter" />
      </div>
    </div>
    <div class="transfer-list-buttons">
      <el-button class="block-button" size="mini" type="primary" :disabled="dataCheckSelect.length === 0" @click="onLeftPanel">
        <i class="el-icon-arrow-left" />
      </el-button>
      <el-button class="block-button" size="mini" type="primary" :disabled="dataSourceSelect.length === 0" @click="onRightPanel">
        <i class="el-icon-arrow-right" />
      </el-button>
    </div>
    <div class="transfer-list-panel">
      <div class="panel-header">
        <template v-if="useRightHeaderSlot">
          <slot name="rightHeader" />
        </template>
        <template v-else>
          <el-checkbox v-model="changeRightAll" @change="onChangeRightAll($event)" />
          <div class="panel-header-title">{{ titles[1] }}</div>
        </template>
      </div>
      <div ref="rightPanelBody" class="panel-body">
        <div v-for="item in dataCheck" :key="item[dataKey]" class="body-item">
          <el-checkbox v-model="item.checked" :label="item[dataLabel]" :disabled="item.disabled" @change="onChangeRight($event, item)">
            <slot v-if="useListItemSlot" :item="item" />
            <template v-else>{{ item[dataLabel] }}</template>
          </el-checkbox>
        </div>
        <div v-if="dataCheck.length === 0" class="empty">暂无数据</div>
      </div>
      <div v-if="useRightFooterSlot" class="panel-footer">
        <slot name="rightFooter" />
      </div>
    </div>
  </div>
</template>

<script>
import CustomLogic from './custom-logic'

export default {
  name: 'TransferList',
  mixins: [CustomLogic],
  props: {
    // 数据
    propDataSource: {
      type: Array,
      default() {
        return []
      }
    },
    // 选择的数据
    propDataCheck: {
      type: Array,
      default() {
        return []
      }
    },
    // 标题
    titles: {
      type: Array,
      default() {
        return ['左侧', '右侧']
      }
    },
    // 按钮文案
    buttonTexts: {
      type: Array,
      default() {
        return ['到左侧', '到右侧']
      }
    },
    // 主键
    dataKey: {
      type: String,
      default: 'id'
    },
    // 显示值
    dataLabel: {
      type: String,
      default: 'name'
    },
    // 左侧头部使用插槽内容
    useLeftHeaderSlot: {
      type: Boolean,
      default: false
    },
    // 左侧底部使用插槽内容
    useLeftFooterSlot: {
      type: Boolean,
      default: false
    },
    // 左侧头部使用插槽内容
    useRightHeaderSlot: {
      type: Boolean,
      default: false
    },
    // 右侧底部使用插槽内容
    useRightFooterSlot: {
      type: Boolean,
      default: false
    },
    // 列表项使用插槽内容
    useListItemSlot: {
      type: Boolean,
      default: false
    },
    // 指定自定义到左侧事件名称 需要在custom-logic.js注册方法
    onLeftPanelMethod: {
      type: String,
      default: ''
    },
    // 指定自定义到右侧事件名称 需要在custom-logic.js注册方法
    onRightPanelMethod: {
      type: String,
      default: ''
    },
    // 字典参考值
    dictionary: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      dataSource: [],
      dataSourceSelect: [],
      dataCheck: [],
      dataCheckSelect: [],
      changeLeftAll: false,
      changeRightAll: false
    }
  },
  watch: {
    propDataSource: {
      handler() {
        this.setData()
      },
      deep: true
    },
    propDataCheck: {
      handler() {
        this.setDataCheck()
      },
      deep: true
    }
  },
  mounted() {
    this.setData()
    this.setDataCheck()
    this.$refs.leftPanelBody.addEventListener('scroll', this.scrollLeftPanelBody)
    this.$refs.rightPanelBody.addEventListener('scroll', this.scrollRightPanelBody)
  },
  methods: {
    // 设置数据
    setData() {
      this.dataSource = this.$tool.deepCopy(this.propDataSource)
    },
    // 设置数据
    setDataCheck() {
      this.dataCheck = this.$tool.deepCopy(this.propDataCheck)
    },
    // 选择左边的数据
    onChangeLeft(e, val) {
      if (e) {
        this.$set(this.dataSourceSelect, this.dataSourceSelect.length, this.$tool.deepCopy(val))
      } else {
        const idx = this.dataSourceSelect.findIndex(item => Number(item[this.dataKey]) === Number(val[this.dataKey]))
        if (idx !== -1) this.dataSourceSelect.splice(idx, 1)
      }
    },
    // 到左侧
    onLeftPanel() {
      if (this.onLeftPanelMethod) {
        this[`${this.onLeftPanelMethod}`]()
      } else {
        this.dataCheckSelect.forEach(item => {
          this.$set(this.dataSource, this.dataSource.length, {...this.$tool.deepCopy(item), checked: false})
          const idx = this.dataCheck.findIndex(items => Number(items[this.dataKey]) === Number(item[this.dataKey]))
          if (idx !== -1) {
            this.dataCheck.splice(idx, 1)
          }
        })
        this.changeRightAll = false
        this.dataCheckSelect = []
      }
    },
    // 选择右边的数据
    onChangeRight(e, val) {
      if (e) {
        this.$set(this.dataCheckSelect, this.dataCheckSelect.length, this.$tool.deepCopy(val))
      } else {
        const idx = this.dataCheckSelect.findIndex(item => Number(item[this.dataKey]) === Number(val[this.dataKey]))
        if (idx !== -1) this.dataCheckSelect.splice(idx, 1)
      }
    },
    // 到右侧
    onRightPanel() {
      if (this.onRightPanelMethod) {
        this[`${this.onRightPanelMethod}`]()
      } else {
        this.dataSourceSelect.forEach(item => {
          this.$set(this.dataCheck, this.dataCheck.length, {...this.$tool.deepCopy(item), checked: false})
          const idx = this.dataSource.findIndex(items => Number(items[this.dataKey]) === Number(item[this.dataKey]))
          if (idx !== -1) {
            this.dataSource.splice(idx, 1)
          }
        })
        this.changeLeftAll = false
        this.dataSourceSelect = []
        if (this.dataSource.length === 0) {
          this.$EventBus.$emit('data-source-null')
        }
      }
    },
    // 左侧全选
    onChangeLeftAll(e) {
      this.changeLeftAll = e
      this.dataSourceSelect = []
      this.dataSource.forEach((item, index) => {
        this.$set(this.dataSource[index], 'checked', e)
      })
      if (e) {
        this.dataSourceSelect = this.$tool.deepCopy(this.dataSource)
      }
    },
    // 右侧权限
    onChangeRightAll(e) {
      this.changeRightAll = e
      this.dataCheckSelect = []
      this.dataCheck.forEach((item, index) => {
        this.$set(this.dataCheck[index], 'checked', e)
      })
      if (e) {
        this.dataCheckSelect = this.$tool.deepCopy(this.dataCheck)
      }
    },
    // 获取选择的数据
    getCheck() {
      const checkIds = []
      this.dataCheck.forEach(item => checkIds.push(item[this.dataKey]))
      return {
        checkIds, dataCheck: this.dataCheck
      }
    },
    // 左侧列表触底
    scrollLeftPanelBody() {
      const scrollTop = this.$refs.leftPanelBody.scrollTop
      // 获取可视区的高度
      const windowHeight = this.$refs.leftPanelBody.clientHeight
      // 获取滚动条的总高度
      const scrollHeight = this.$refs.leftPanelBody.scrollHeight
      if (scrollTop + windowHeight >= scrollHeight) {
        // 把距离顶部的距离加上可视区域的高度 等于或者大于滚动条的总高度就是到达底部
        // 调用函数
        this.$EventBus.$emit('left-panel-body-bottom')
      }
    },
    // 右侧列表触底
    scrollRightPanelBody() {
      const scrollTop = this.$refs.rightPanelBody.scrollTop
      // 获取可视区的高度
      const windowHeight = this.$refs.rightPanelBody.clientHeight
      // 获取滚动条的总高度
      const scrollHeight = this.$refs.rightPanelBody.scrollHeight
      if (scrollTop + windowHeight >= scrollHeight) {
        // 把距离顶部的距离加上可视区域的高度 等于或者大于滚动条的总高度就是到达底部
        // 调用函数
        this.$EventBus.$emit('right-panel-body-bottom')
      }
    }
  }
}
</script>

<style lang="scss">
.body-item {
  .el-checkbox {
    width: 100%;
    display: flex;
    align-items: center;
    .el-checkbox__label {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
      box-sizing: border-box;
      line-height: 30px;
    }
  }
}
</style>

<style lang="scss" scoped>
.transfer-list {
  .transfer-list-panel {
    border: 1px solid #dddddd;
    width: 200px;
    display: inline-block;
    vertical-align: top;
    .panel-header {
      height: 40px;
      line-height: 40px;
      background: #f5f7fa;
      margin: 0;
      padding: 0 15px;
      border-bottom: 1px solid #ebeef5;
      box-sizing: border-box;
      color: #000;
      .panel-header-title {
        display: inline-block;
        padding-left: 10px;
      }
    }
    .panel-body {
      height: 246px;
      overflow: auto;
      .body-item {
        padding: 0 15px;
      }
      .empty {
        margin: 0;
        height: 30px;
        line-height: 30px;
        padding: 6px 15px 0;
        color: #909399;
        text-align: center;
      }
    }
    .panel-footer {
      border-top: 1px solid #ebeef5;
    }
  }
  .transfer-list-buttons {
    display: inline-block;
    vertical-align: middle;
    padding: 0 30px;
    margin-top: 10%;
  }
}
</style>
