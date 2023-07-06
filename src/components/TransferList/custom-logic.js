/**
 * @description custom-logic.js
 * @author linhaojia
 * @date 2022/8/15 14:46:10
 */

/**
 * 存放穿梭框自定义逻辑
 */

/**
 * 自定义自动化运维 定时作业设备选择逻辑
 */
export default {
  methods: {
    // 自定义到左侧事件
    timingTaskOnLeftPanel(item) {
      const notInIds = this.$tool.deepCopy(this.dictionary.notInIds)
      this.dataCheckSelect.forEach(dItem => {
        const idx = this.dataCheck.findIndex(items => Number(items[this.dataKey]) === Number(dItem[this.dataKey]))
        if (idx !== -1) {
          this.dataCheck.splice(idx, 1)
        }
        if (dItem.hyDevTypeId !== this.dictionary.leftPanelDevTypeId) {
          const idx = notInIds.indexOf(dItem.hyHostId)
          if (idx !== -1) notInIds.splice(idx, 1)
        } else {
          this.$set(this.dataSource, this.dataSource.length, {...this.$tool.deepCopy(dItem), checked: false})
        }
      })
      this.$EventBus.$emit('change-notInIds', { notInIds })
      this.changeRightAll = false
      this.dataCheckSelect = []
    }
  }
}
