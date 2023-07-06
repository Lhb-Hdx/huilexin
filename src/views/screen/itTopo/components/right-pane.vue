<template>
  <div ref="rightPane" class="right-pane" :style="{ 'width': !showRightPaneMain ? '32px' : '' }">
    <div class="icon pointer" @click="handlerShowRightPaneMain">
      <i v-if="showRightPaneMain" class="el-icon-arrow-right" />
      <i v-else class="el-icon-arrow-left" />
    </div>
    <div v-if="showRightPaneMain" class="right-pane-main">
      <div class="tab-bar">
        <div v-for="(item, index) in tabItem" :key="index" class="tab-item pointer" :class="tabItemIndex === index ? 'active' : ''" @click="handlerTabItem(index)">{{ item }}</div>
      </div>
      <div class="tab-main">
        <!-- 告警管理 -->
        <template v-if="tabItemIndex === 0">
          <AlarmCount />
          <AlarmEchart />
          <AlarmList />
        </template>
        <!-- 流量监控 -->
        <template v-if="tabItemIndex === 1">
          <FlowList />
        </template>
        <!-- 数据统计 -->
        <template v-if="tabItemIndex === 2">
          <StatisticsCount />
          <StatisticsAlarmTop :style="{ 'height': itemHeight + 'px' }" />
          <StatisticsVirtualLoad :style="{ 'height': itemHeight + 'px' }" />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import AlarmCount from '@/views/screen/itTopo/components/alarm-count'
import AlarmEchart from '@/views/screen/itTopo/components/alarm-echart'
import AlarmList from '@/views/screen/itTopo/components/alarm-list'
import FlowList from '@/views/screen/itTopo/components/flow-list'
import StatisticsCount from '@/views/screen/itTopo/components/statistics-count'
import StatisticsAlarmTop from '@/views/screen/itTopo/components/statistics-alarm-top'
import StatisticsVirtualLoad from '@/views/screen/itTopo/components/statistics-virtual-load'

export default {
  name: 'RightPane',
  components: {
    AlarmCount,
    AlarmEchart,
    AlarmList,
    FlowList,
    StatisticsCount,
    StatisticsAlarmTop,
    StatisticsVirtualLoad
  },
  data() {
    return {
      tabItem: ['告警管理', '流量监控', '数据统计'],
      tabItemIndex: 0,
      showRightPaneMain: true,
      tabMainHeight: '',
      itemHeight: ''
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('open-right-pane')
    window.removeEventListener('resize', this.setSize)
  },
  mounted() {
    this.$nextTick(() => {
      this.setSize()
      window.addEventListener('resize', this.setSize)
    })
    this.$EventBus.$on('open-right-pane', () => {
      this.handlerTabItem(this.tabItemIndex)
    })
    this.$store.dispatch('screen/setState', { stateName: 'topoRightPaneHeight', stateData: this.$refs.rightPane.clientHeight })
  },
  methods: {
    // 设置相关尺寸
    setSize() {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      const itemHeight = windowHeight - (50 + this.$refs.rightPane.getBoundingClientRect().top + 55 + 280)
      this.itemHeight = itemHeight / 2
    },
    handlerTabItem(index) {
      this.tabItemIndex = index
      setTimeout(() => {
        if (index === 0) this.$EventBus.$emit('open-topo-alarm')
        if (index === 1) this.$EventBus.$emit('open-topo-flow')
        if (index === 2) this.$EventBus.$emit('open-topo-statistical')
      }, 500)
    },
    handlerShowRightPaneMain() {
      this.showRightPaneMain = !this.showRightPaneMain
      if (this.showRightPaneMain) this.handlerTabItem(this.tabItemIndex)
    }
  }
}
</script>

<style lang="scss" scoped>
.right-pane {
  position: absolute;
  right: 0;
  width: calc(25% + 32px);
  height: calc(100%);
  .icon {
    display: inline-block;
    vertical-align: top;
    width: 32px;
    height: 32px;
    background: #11337E;
    text-align: center;
    line-height: 32px;
    color: #ffffff;
    opacity: .8;
    text-decoration: none;
    transition: all .5s;
    &:hover {
      color: #99CCFF;
      opacity: 1;
    }
  }
  .right-pane-main {
    display: inline-block;
    padding: 0 15px;
    background: rgba(10, 15, 70,.9);
    height: 100%;
    width: calc(100% - 32px);
    .tab-bar {
      padding-top: 15px;
      width: 100%;
      overflow: hidden;
      position: relative;
      display: flex;
      .tab-item {
        flex: 1;
        color: #cccccc;
        text-align: center;
        z-index: 1;
        text-decoration: none;
        transition: all .5s;
        height: 40px;
        line-height: 30px;
        &:hover {
          color: #99E5FF;
          background: url(/image/screen/tab_bg.png) no-repeat 50% 100%;
        }
      }
      .active {
        color: #99E5FF;
        background: url(/image/screen/tab_bg.png) no-repeat 50% 100%;
      }
    }
    .tab-main {
      height: 100%;
      margin-top: 10px;
      overflow-y: auto;
    }
  }
}
</style>
