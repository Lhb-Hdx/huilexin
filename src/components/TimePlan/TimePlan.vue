<template>
  <div class="timePlanWrap">
    <div class="timePlanScale">
      <div class="mark">
        <div v-for="i in times" :key="i" class="markKey">
          <div class="timesKey">{{ i }}</div>
        </div>
      </div>
    </div>
    <div
      ref="timePlanBox"
      class="timePlanBox"
      @mousedown.self="timePlanBoxDown($event)"
    >
      <div
        v-for="(item, tpindex) in tpData"
        ref="timePlanItem"
        :key="tpindex"
        :style="{ left: item.left + 'px', width: item.width + 'px' }"
        :data-timestamp="item.timestamp"
        class="planItem"
        @click.stop="timePlanClick(tpindex)"
        @blur.stop="timePlanBlur"
      >
        <div v-if="item.active" class="timeTip">{{ item.startHours }}:{{ item.startMinute }} - {{ item.endHours }}:{{ item.endMinute }}</div>
        <div
          v-if="item.active"
          ref="mouseLeftButton"
          class="mouseButton mouseLeftButton"
          @mousedown.stop="timePlanItemDown($event, tpindex, 'left')"
        />
        <div
          v-if="item.active"
          ref="mouseRightButton"
          class="mouseButton mouseRightButton"
          @mousedown.stop="timePlanItemDown($event, tpindex, 'right')"
        />
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'TimePlan',
  props: {
    /*
    组件时间段参数
    [
      {
        weekValue: '1', // 周几
        startHours: '1', // 开始时间时
        startMinute: '1', // 开始时间分
        endHours: '1', // 结束时间时
        endMinute: '1', // 结束时间分
        tid: '1', // 时间模板id
        tdId: '1' // 时间段id
      }
    ]
    * */
    weekPlanItem: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      tpData: [], // 时间段数据
      times: [], // 时间刻度
      mode: 'many' // 配置项：时间段模式 参数有one 和 many，one：单时间段 many：多时间段
    }
  },
  mounted() {
    this.initTime()
  },
  methods: {
    /**
     * @description 插件逻辑
     */

    /**
     * @description 在灰色区域摁下鼠标
     * @param ev 事件对象
     */
    timePlanBoxDown(ev) {
      if (this.tpData.length > 0) {
        for (let i = 0; i < this.tpData.length; i++) {
          this.$set(this.tpData[i], 'active', false)
        }
      }
      if (this.mode === 'one' && this.tpData.length > 0) return
      const that = this
      const oEvent = ev || event
      const startPos = this.getPos(oEvent) // 鼠标当前摁下的坐标
      const timestamp = new Date().getTime()// 以时间戳作为识别标志
      const second = parseInt((86400 * startPos.x) / this.$refs.timePlanBox.clientWidth)
      const secondToHour = this.secondToHour(second)
      const tpLeft = startPos.x
      // 初始化数据
      this.tpData.push({
        pos: startPos,
        timestamp: timestamp,
        left: tpLeft > 0 ? tpLeft : 0,
        width: 0,
        startHours: this.formatNum(secondToHour.hour),
        startMinute: this.formatNum(secondToHour.minute),
        endHours: this.formatNum(secondToHour.hour),
        endMinute: this.formatNum(secondToHour.minute),
        active: true,
        weekValue: this.weekPlanItem.weekValue
      })

      // 注册滑动事件
      document.onmousemove = function(ev) {
        const oEvent = ev || event
        const pos = that.getPos(oEvent)

        if (pos.x <= 0 || pos.x >= that.$refs.timePlanBox.clientWidth) return // 边界值判断

        const _tpData = that.tpData[that.tpData.length - 1]

        // 设置宽度
        _tpData.width = pos.x - _tpData.left

        // 计算时间
        const second = (86400 * (_tpData.left + _tpData.width)) / (that.$refs.timePlanBox.clientWidth)
        const secondToHour = that.secondToHour(second)
        _tpData.endHours = that.formatNum(secondToHour.hour)
        _tpData.endMinute = that.formatNum(secondToHour.minute)

        const idx = that.tpData.length - 1
        that.tpData[idx] = _tpData
      }

      // 鼠标抬起注销事件
      document.onmouseup = function() {
        const idx = that.tpData.length - 1
        that.clearTime(idx)
        that.$set(that.tpData[idx], 'active', false)
        that.$emit('timePlanDown', { weekValue: that.weekPlanItem.weekValue, tpData: that.tpData })
        document.onmousemove = null
        document.onmouseup = null
      }
    },

    /**
     * @description 点击滑块
     * @param idx 索引
     */
    timePlanClick(idx) {
      for (let i = 0; i < this.tpData.length; i++) {
        this.$set(this.tpData[i], 'active', false)
      }
      this.$set(this.tpData[idx], 'active', true)
    },

    /**
     * @description 摁下滑块
     * @param ev 事件对象
     * @param idx 索引
     * @param direction 当前移动方向
     */
    timePlanItemDown(ev, idx, direction) {
      const that = this

      // 注册滑动事件
      document.onmousemove = function(ev) {
        const oEvent = ev || event
        const pos = that.getPos(oEvent)

        that.clearTime(idx)

        if (direction === 'left') { // 拖动左侧
          if (pos.x <= 0) return // 左侧边界值判断
          that.tpData[idx].width = (that.tpData[idx].left + that.tpData[idx].width) - pos.x
          that.tpData[idx].left = pos.x
          that.tpData[idx].pos = { x: pos.x, y: pos.y }
          const second = parseInt((86400 * that.tpData[idx].left) / that.$refs.timePlanBox.clientWidth)
          const secondToHour = that.secondToHour(second)
          that.$set(that.tpData[idx], 'startHours', that.formatNum(secondToHour.hour))
          that.$set(that.tpData[idx], 'startMinute', that.formatNum(secondToHour.minute))
        } else { // 拖动右侧
          if (pos.x >= that.$refs.timePlanBox.clientWidth) return // 右侧边界值判断
          that.tpData[idx].width = pos.x - that.tpData[idx].left
          that.tpData[idx].pos = { x: pos.x, y: pos.y }
          // 拖动右边修改结束时间
          const second = (86400 * (that.tpData[idx].left + that.tpData[idx].width)) / (that.$refs.timePlanBox.clientWidth)
          const secondToHour = that.secondToHour(second)
          that.$set(that.tpData[idx], 'endHours', that.formatNum(secondToHour.hour))
          that.$set(that.tpData[idx], 'endMinute', that.formatNum(secondToHour.minute))
        }
      }

      // 鼠标抬起注销事件
      document.onmouseup = function() {
        that.$set(that.tpData[idx], 'active', false)
        that.$emit('timePlanDown', { weekValue: that.weekPlanItem.weekValue, tpData: that.tpData })
        document.onmousemove = null
        document.onmouseup = null
      }
    },

    /**
     * @description 时间插件工具方法
     */

    /**
     * @description 初始化时间
     */
    initTime() {
      for (let i = 0; i <= 24; i++) this.times.push(i)
      if (this.weekPlanItem.plans) {
        this.editSetTime()
      }
    },

    /**
     * @description 删除某条时间段
     * @param idx 索引
     * @returns {boolean}
     */
    clearTime(idx) {
      if (this.tpData[idx].width <= 0) {
        this.tpData.splice(idx, 1)
        return true
      }
    },

    /**
     * @description 获取当前鼠标x、y坐标信息
     * @param ev 事件对象
     * @returns {{x: number, y: number}}
     */
    getPos(ev) {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      return { x: ev.x - this.$refs.timePlanBox.getBoundingClientRect().left, y: ev.clientY + scrollTop }
    },

    /**
     * @description 格式化数字
     * @param num 数字
     * @returns {string|*}
     */
    formatNum(num) {
      return num < 10 ? '0' + num : num
    },

    /**
     * @description 秒换算时分秒
     * @param msd 时分秒
     * @returns {{hour: number, minute: number, second: number}}
     */
    secondToHour(msd) {
      let second = parseInt(msd) // 秒
      let minute = 0 // 分
      let hour = 0 // 小时
      if (second > 60) {
        minute = parseInt(second / 60)
        second = parseInt(second % 60)
        if (minute > 60) {
          hour = parseInt(minute / 60)
          minute = parseInt(minute % 60)
        }
      }
      return {
        hour: parseInt(hour),
        minute: parseInt(minute),
        second: parseInt(second)
      }
    },

    /**
     * @description 编辑时获取数据渲染滑块
     */
    editSetTime() {
      for (let i = 0; i < this.weekPlanItem.plans.length; i++) {
        const ranDom = String(Math.random(3)).split('.')[1]
        const startSecond = Number(this.weekPlanItem.plans[i].startHours * 3600) + Number(this.weekPlanItem.plans[i].startMinute * 60)
        const endSecond = Number(this.weekPlanItem.plans[i].endHours * 3600) + Number(this.weekPlanItem.plans[i].endMinute * 60)
        const left = this.$refs.timePlanBox.clientWidth * (startSecond / 86400)
        const right = (this.$refs.timePlanBox.clientWidth * (endSecond / 86400)) - left
        this.tpData.push({
          pos: {},
          timestamp: new Date().getTime() + ranDom,
          left: left,
          width: right,
          startHours: this.weekPlanItem.plans[i].startHours > 10 ? this.weekPlanItem.plans[i].startHours : `0${this.weekPlanItem.plans[i].startHours}`,
          startMinute: this.weekPlanItem.plans[i].startMinute > 10 ? this.weekPlanItem.plans[i].startMinute : `0${this.weekPlanItem.plans[i].startMinute}`,
          endHours: this.weekPlanItem.plans[i].endHours > 10 ? this.weekPlanItem.plans[i].endHours : `0${this.weekPlanItem.plans[i].endHours}`,
          endMinute: this.weekPlanItem.plans[i].endMinute > 10 ? this.weekPlanItem.plans[i].endMinute : `0${this.weekPlanItem.plans[i].endMinute}`,
          active: false,
          weekValue: this.weekPlanItem.weekValue,
          tdId: this.weekPlanItem.plans[i].tdId,
          tid: this.weekPlanItem.plans[i].tid
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.timePlanBox{
  width: 100%;
  height: 20px;
  background: #e4e4e4;
  position: relative;

  .planItem {
    height: 100%;
    background: #0866e2;
    position: absolute;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;

    .timeTip {
      position: absolute;
      top: -90%;
      z-index: 100;
      font-size: 10px;
      color: #666;
      left: 50%;
      transform: translateX(-50%);
      width: 110px;
      text-align: center;
    }

    .mouseButton {
      width: 5px;
      height: 5px;
      z-index: 9;
      border: 1px solid;
      position: absolute;
      cursor: ew-resize;
    }

    .mouseLeftButton {
      left: -3px;
    }

    .mouseRightButton {
      right: -3px;
    }
  }
}

.mark{
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.mark{
  padding-top: 10px;

  .markKey {
    width: 1px;
    height: 5px;
    background: #999;
    display: inline-block;
    position: relative;
    .timesKey {
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
    }
  }
}

</style>
