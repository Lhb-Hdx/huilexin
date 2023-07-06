<template>
  <dv-full-screen-container class="bg" :style="{ 'height': windowHeight + 'px' }">
    <div class="monitor">
      <ScreenHeader :top-project="agentGroup" :top-project-options="{ key: 'id', value: 'name' }" @handlerTopProject="handlerTopProject" />
      <div ref="monitorContent" class="monitor-content">
        <TopoList @handlerTopoItem="handlerTopoItem" />
        <TopoMiniMap />
        <div ref="topoWrapper" class="topo-wrapper">
          <TopoMap
            ref="topoMapComponent"
            mode="preview"
            :topo-info="topoInfo"
            :map-config="mapConfig"
            :map-combos="mapCombos"
            :map-edges="mapEdges"
            :map-nodes="mapNodes"
            :map-preview="true"
            :map-grid-bg="false"
            :style-options="styleOptions"
          />
        </div>
        <RightPane />
      </div>
    </div>
    <el-dialog title="故障详情" :visible.sync="showFaultDetails" width="80%" top="5vh" append-to-body>
      <FaultDetails v-if="showFaultDetails" :model="activeAlarm" :level-data="levelData" :login-user="loginUser" @emitFindAssetsAlarm="emitFindAssetsAlarm" />
    </el-dialog>
    <!-- 端口图表 -->
    <UsedDetailDialog
      v-if="showUsedDetailDialog"
      :echart-params="detailParams"
      :table-params="tableParams"
      :port="port"
      @closeUsedDetailDialog="closeUsedDetailDialog"
    />
  </dv-full-screen-container>
</template>

<script>
import screenGlobal from '@/views/screen/mixin/screenGlobal'

import ScreenHeader from '@/views/screen/components/screen-header'
import TopoList from '@/views/screen/itTopo/components/topo-list'
import TopoMap from '@/components/Topo/Components/TopoMap'
import RightPane from '@/views/screen/itTopo/components/right-pane'
import FaultDetails from '@/views/it-monitor/fault-manage/components/faultDetails'
import TopoMiniMap from '@/components/Topo/Components/TopoMiniMap'
import UsedDetailDialog from '@/views/it-monitor/flow-monitor/monitoring-item-drawer'

export default {
  name: 'ItMonitorScreen',
  components: {
    ScreenHeader,
    TopoList,
    TopoMap,
    RightPane,
    FaultDetails,
    TopoMiniMap,
    UsedDetailDialog
  },
  mixins: [screenGlobal],
  data() {
    return {
      agentGroup: [],
      topoInfo: {},
      mapConfig: {},
      mapCombos: [],
      mapEdges: [],
      mapNodes: [],
      setInterval: null,
      showFaultDetails: false,
      activeAlarm: {},
      levelData: [],
      loginUser: {},
      styleOptions: {
        TopHostDetail: {
          backgroundColor: '#0d1231',
          borderColor: '#112153',
          linkItemColor: '#08F2F5',
          nameColor: '#fff',
          onlineTagBackgroundColor: '#1a3f4f',
          onlineTagBorderColor: '#1a3f4f',
          onlineTagColor: '#60ceae',
          offlineTagBackgroundColor: '',
          offlineTagBorderColor: '',
          offlineTagColor: ''
        },
        TopoMap: {
          nodeFontColor: '#fff'
        }
      },
      showUsedDetailDialog: false,
      detailParams: [],
      tableParams: [],
      port: {},
      windowHeight: ''
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
      }

      this.loadAlarmLevel()
      this.loginUser = this.localStorageOperation('get', 'userInfo')
    })
    this.$EventBus.$on('handler-alarm-item', (item) => {
      this.showFaultDetails = true
      this.activeAlarm = item
    })
    this.$EventBus.$on('open-flow-dialog', (item) => {
      this.port = { ...item, isSummary: true }
      this.detailParams = [
        {
          agent: this.port.agent,
          unit: this.port.portSendRateUnits,
          itemid: this.port.portSendRateItemId,
          valueType: this.port.portSendRateValueType,
          name: '发送',
          color: '#87DEAF',
          echartType: 'value',
          unitSuffix: '/S',
          isConversion: true,
          conversionUnitType: 'data',
          data: [],
          originalData: [],
          units: [],
          originalUnits: [],
          time: [],
          toFixed: 2,
          keyword: 'send'
        },
        {
          agent: this.port.agent,
          unit: this.port.portReceiveRateUnits,
          itemid: this.port.portReceiveRateItemId,
          valueType: this.port.portReceiveRateValueType,
          name: '接收',
          color: '#3ba9ed',
          echartType: 'value',
          unitSuffix: '/s',
          isConversion: true,
          conversionUnitType: 'data',
          data: [],
          originalData: [],
          units: [],
          originalUnits: [],
          time: [],
          toFixed: 2,
          keyword: 'receive'
        }
      ]
      this.tableParams = [
        {
          agent: this.port.agent,
          label: ['最高发送', '最低发送', '平均发送'],
          value: 0,
          unit: this.port.portSendRateUnits,
          itemid: this.port.portSendRateItemId,
          valueType: this.port.portSendRateValueType,
          isConversion: true,
          conversionUnitType: 'data',
          type: ['max', 'min', 'avg'],
          keyword: 'send',
          fixed: 2
        },
        {
          agent: this.port.agent,
          label: ['最高接收', '最低接收', '平均接收'],
          value: 0,
          unit: this.port.portReceiveRateUnits,
          itemid: this.port.portReceiveRateItemId,
          valueType: this.port.portReceiveRateValueType,
          isConversion: true,
          conversionUnitType: 'data',
          type: ['max', 'min', 'avg'],
          keyword: 'receive',
          fixed: 2
        }
      ]
      this.showUsedDetailDialog = true
    })
  },
  beforeDestroy() {
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
    handlerTopProject(val) {
      console.log('handlerTopProject', val)
    },
    // 监听选择拓扑
    async handlerTopoItem(val) {
      this.topoInfo = val
      const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      this.mapConfig = {
        width: this.$refs.topoWrapper.clientWidth,
        height: windowHeight - this.$refs.topoWrapper.getBoundingClientRect().top
      }
      this.mapCombos = await this.findHyitTopologyItemGroup(val) || []
      this.mapNodes = await this.findHyitTopologyItem(val) || []
      this.mapEdges = await this.findHyitTopologyItemLink(val) || []

      this.$store.dispatch('screen/setState', { stateName: 'currentTopoInfo', stateData: val })
      this.$store.dispatch('screen/setState', { stateName: 'currentTopoMapCombos', stateData: this.mapCombos })
      this.$store.dispatch('screen/setState', { stateName: 'currentTopoMapEdges', stateData: this.mapEdges })
      this.$store.dispatch('screen/setState', { stateName: 'currentTopoMapNodes', stateData: this.mapNodes })

      this.$EventBus.$emit('open-right-pane')

      if (val.emitType === 'click') {
        this.setInterval = setInterval(() => {
          this.$EventBus.$emit('start-up-date')
        }, 10000)
      }

      setTimeout(async() => {
        // 调用拓扑组件生成数据
        await this.$refs.topoMapComponent.generateData()
        // 调用拓扑组件初始化拓扑图
        this.$refs.topoMapComponent.initMap()
      }, 100)
    },
    // 获取拓扑节点分组
    async findHyitTopologyItemGroup(query) {
      const { code, data } = await this.$request({ url: this.api.itMonitor.findHyitTopologyItemGroup, data: { topId: query.id }})
      if (code !== 1) return
      return data
    },
    // 获取拓扑节点 ，节点重要数据
    async findHyitTopologyItem(query) {
      const { code, data } = await this.$request({ url: this.api.itMonitor.findHyitTopologyItem, data: { page: 1, limit: -1, topId: query.id }})
      if (code !== 1) return
      return data
    },
    // 查询节点链路关系
    async findHyitTopologyItemLink(query) {
      const { code, data } = await this.$request({ url: this.api.itMonitor.findHyitTopologyItemLink, data: { page: 1, limit: -1, topId: query.id }})
      if (code !== 1) return
      return data
    },
    // 故障等级
    loadAlarmLevel() {
      this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'alarm_level', page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          res.data.forEach(item => {
            this.$set(this.levelData, this.levelData.length, { name: item.dictdataName, level: item.dictdataValue, catId: item.id, color: item.remark, isActive: false })
          })
        }
      })
    },
    // 重新加载告警
    emitFindAssetsAlarm() {
      this.$EventBus.$emit('load-alarm-list')
    },
    // 关闭流量弹窗
    closeUsedDetailDialog() {
      this.showUsedDetailDialog = false
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
.topo-mini-map {
  width: 15%;
  height: 160px;
  position: absolute;
  left: 0;
  bottom: 0;
  margin-bottom: 0 !important;
  z-index: 9999;
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
