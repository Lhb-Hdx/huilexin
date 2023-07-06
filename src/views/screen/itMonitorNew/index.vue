<template>
  <dv-full-screen-container class="bg">
    <div class="monitor">
      <ScreenHeader :top-project="agentGroup" :top-project-options="{ key: 'id', value: 'name' }" @handlerTopProject="handlerTopProject" />
      <div ref="monitorContent" class="monitor-content">
        <div class="left">
          <IpaddressResource />
          <FlowMonitor />
          <CapacityManage />
        </div>
        <div class="main">
          <DeviceTypeView />
          <div class="main-left">
            <AlarmPane />
          </div>
          <div class="main-right">
            <OpmPane />
          </div>
        </div>
        <div class="right">
          <StatisticsAlarmTop />
          <StatisticsVirtualLoad />
          <StatisticsSchedulingManage />
        </div>
      </div>
    </div>
    <FlowDeviceDialog ref="flowDeviceDialog" />
  </dv-full-screen-container>
</template>

<script>
import screenGlobal from '@/views/screen/mixin/screenGlobal'

import ScreenHeader from '@/views/screen/components/screen-header'
import IpaddressResource from '@/views/screen/itMonitorNew/components/ipaddress-resource'
import FlowMonitor from '@/views/screen/itMonitorNew/components/flow-monitor'
import CapacityManage from '@/views/screen/itMonitorNew/components/capacity-manage'
import DeviceTypeView from '@/views/screen/itMonitorNew/components/device-type-view'
import StatisticsAlarmTop from '@/views/screen/itMonitorNew/components/statistics-alarm-top'
import StatisticsVirtualLoad from '@/views/screen/itMonitorNew/components/statistics-virtual-load'
import StatisticsSchedulingManage from '@/views/screen/itMonitorNew/components/statistics-scheduling-manage'
import AlarmPane from '@/views/screen/itMonitorNew/components/alarm-pane'
import OpmPane from '@/views/screen/itMonitorNew/components/opm-pane'
import FlowDeviceDialog from '@/views/screen/itMonitorNew/components/flow-device-dialog'

export default {
  name: 'Index',
  components: {
    ScreenHeader,
    IpaddressResource,
    FlowMonitor,
    CapacityManage,
    DeviceTypeView,
    StatisticsAlarmTop,
    StatisticsVirtualLoad,
    StatisticsSchedulingManage,
    AlarmPane,
    OpmPane,
    FlowDeviceDialog
  },
  mixins: [screenGlobal],
  data() {
    return {
      agentGroup: [],
      setInterval: null
    }
  },
  mounted() {
    this.$nextTick(async () => {
      const findHyitAgentGroup = await this.findHyitAgentGroup()
      const findHyitAgentGroupLink = await this.findHyitAgentGroupLink()
      if (findHyitAgentGroup.code === 1 && findHyitAgentGroup.data) {
        findHyitAgentGroup.data.forEach(dataItem => {
          if (findHyitAgentGroupLink.code === 1 && findHyitAgentGroupLink.data) {
            dataItem.agents = findHyitAgentGroupLink.data.filter(el => +el.groupId === +dataItem.id)
          }
        })
        this.agentGroup = findHyitAgentGroup.data
        this.$EventBus.$on('open-select-flow-device', (val) => {
          this.$refs.flowDeviceDialog.open(val)
        })
      }
    })
  },
  beforeDestroy() {
    this.batchOffEventBus('open-select-flow-device')
    clearInterval(this.setInterval)
    this.setInterval = null
  },
  methods: {
    // 获取网关分组
    async findHyitAgentGroup() {
      return await this.$request({url: this.api.itAgentGroup.findHyitAgentGroup, data: { limit: -1 }})
    },
    // 获取网关分组关联网关
    async findHyitAgentGroupLink() {
      return await this.$request({url: this.api.itAgentGroup.findHyitAgentGroupLink, data: { limit: -1 } })
    },
    // 点击项目
    async handlerTopProject(val) {
      const agents = []
      val.agents.forEach(item => agents.push(item.agentId))
      if (agents.length === 0) return
      const findHyitHost = await this.findHyitHost(this.$tool.uniqueArray(agents).toString())
      const hostIds = []
      findHyitHost.data.forEach(item => hostIds.push(item.hyHostId))
      if (findHyitHost.code === 1) {
        this.$EventBus.$emit('handler-top-project', {
          projectItem: val,
          host: findHyitHost.data,
          hostIds,
          agents
        })
      }
      this.setInterval = setInterval(() => {
        this.$EventBus.$emit('start-up-date')
      }, 10000)
    },
    // 查询主机
    async findHyitHost(agents) {
      return await this.$request({url: this.api.itMonitor.findHyitHost, data: { limit: -1, hostType: 1, agents }})
    }
  }
}
</script>

<style lang="scss" scoped>
.monitor {
  --default-color: #082949;
  background: #05052C url(/image/screen/new-bg.png) no-repeat 50% top;
  min-height: 100%;
  padding-left: 0;
  padding-right: 0;
  position: relative;
  transition: all 0.5s;
  color: #fff;
  font-size: 14px;
  .topo-wrapper{
    position: absolute;
    width: 100%;
    height: 100%;
    // background-color: red;
    #topoMap {
      // width: 650px;
      height: 100%;
      // overflow: hidden;
    }
  }
  .monitor-content {
    margin: 20px;
    // position: absolute;
    position: relative;
    // z-index: 101;
    // width: 100%;
    // 减掉header和最大的盒子上下的padding还 占3分之2
    height: calc(100vh - 150px);

    .left, .right {
      width: 22.5%;
      display: inline-block;
      vertical-align: top;
    }
    .main {
      width: 55%;
      display: inline-block;
      vertical-align: top;
      padding: 0 30px;

      .main-left, .main-right {
        width: 50%;
        display: inline-block;
        vertical-align: top;
      }
    }
  }
}
.monitor ::v-deep .bottom-center-box {
  display: flex;
  flex-direction: column;
  // height: 88%;
  overflow: hidden;
  .bottom-center-box-tabs {
    display: flex;
    .tabs-tab {
      flex: 1;
      height: 30px;
      line-height: 30px;
      text-align: center;
      &.active {
        background-color: #082949;
      }
    }
  }
  .bottom-center-box-box {
    // border: 1px solid var(--default-color);
    flex: 1;
    margin-top: 14px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .bottom-center-box-content {
    flex: 1;
    overflow: hidden;
    overflow-y: auto;
    .content-list {
      padding: 0 9px 0 0;
      .list-item .list-item-ip {
        color: #999999;
      }
    }
  }
  .top-title {
    color: #9ee5ff;
    position: relative;
    padding-left: 10px;
    line-height: 20px;
    font-size: 14px;
    &:before {
      content: '';
      width: 3px;
      height: 20px;
      font-size: 18px;
      font-weight: 400;
      background-color: #9ee7ff;
      position: absolute;
      left: 0;
      top: 0;
    }
  }
}
.monitor ::v-deep .el-row {
  height: 100%;
  .el-col {
    height: 100%;
  }
}
.monitor ::v-deep div::-webkit-scrollbar {/*滚动条整体样式*/
  width: 5px;     /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
}
.monitor ::v-deep div::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
  border-radius: 5px;
  -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
  background: #3D9FE9;
}
.monitor ::v-deep div::-webkit-scrollbar-track {/*滚动条里面轨道*/
  -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
  border-radius: 5px;
  background: #123788;
}
</style>
