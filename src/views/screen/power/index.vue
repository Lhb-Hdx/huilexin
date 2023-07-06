<template>
  <dv-full-screen-container class="bg">
    <div class="monitor-container">
      <ScreenHeader :top-project="agentGroup" :top-project-options="{ key: 'hyAreaId', value: 'hyAreaName' }" @handlerTopProject="handlerTopProject" />
      <div class="content-container">
        <div class="side-left">
          <LeftHumiture ref="LeftHumiture" />
          <LefPercisonAriConditioner ref="LefPercisonAriConditioner" />
          <LeftHumitureNow />
        </div>
        <div class="center-main">
          <CenterDeviceList ref="CenterDeviceList" :select-region-object="selectRegionObject" />
          <CenterDeviceGview :map-data="topoMapData" />
        </div>
        <div class="side-right">
          <RigthWarningInfo />
          <RigthinAndoutLog />
          <RigthAccumulator ref="RigthAccumulator" />
        </div>
      </div>
    </div>
  </dv-full-screen-container>
</template>

<script>

import api from '@/api/api'
import request from '@/utils/request'
import ScreenHeader from '@/views/screen/components/screen-header'
import LeftHumiture from '@/views/screen/power/newcomponents/left-humiture'
import LefPercisonAriConditioner from '@/views/screen/power/newcomponents/left-percisonAriConditioner'
import LeftHumitureNow from '@/views/screen/power/newcomponents/left-humitureNow'
import CenterDeviceList from '@/views/screen/power/newcomponents/center-device-list'
import CenterDeviceGview from '@/views/screen/power/newcomponents/center-device-gview'
import RigthWarningInfo from '@/views/screen/power/newcomponents/rigth-warning-info'
import RigthinAndoutLog from '@/views/screen/power/newcomponents/rigth-inAndout-log'
import RigthAccumulator from '@/views/screen/power/newcomponents/rigth-accumulator'

export default {
  name: 'PowerDashboard',
  components: {
    ScreenHeader,
    LeftHumiture,
    LefPercisonAriConditioner,
    LeftHumitureNow,
    CenterDeviceList,
    CenterDeviceGview,
    RigthWarningInfo,
    RigthinAndoutLog,
    RigthAccumulator
  },
  data() {
    return {
      fullpath: null,
      setInterval: null,
      agentGroup: [],
      selectRegionObject: {},
      topoMapData: {},
      // selectMapId: 28,
      // selectMapId: 34,
      selectMapId: 36, // 选择的背景图,36:番禺中心医院2
      mapList: []
    }
  },
  beforeUpdate() {
    this.fullpath = this.$route.path
  },
  mounted() {
    this.$nextTick(() => {
      this.findHyitAgentGroup()
    })
  },
  beforeDestroy() {
    clearInterval(this.setInterval)
    this.setInterval = null
  },
  methods: {

    // 接收头部选择平台返回的参数
    handlerTopProject(val) {
      this.selectRegionObject = val
      this.getMapData(val)
      this.$refs.CenterDeviceList.openFind()
      this.$refs.LeftHumiture.openFind(val)
      this.$refs.LefPercisonAriConditioner.openFind(val)
      this.$refs.RigthAccumulator.openFind(val)
      // console.log('handlerTopProject', this.selectRegionObject)
      // this.setInterval = setInterval(() => {
      //   this.$EventBus.$emit('start-up-date')
      // }, 10000)
    },
    // 获取不同系统参数
    findHyitAgentGroup() {
      request({ url: api.area.findHyitArea, data: {isDh: 1, limit: -1}})
        .then(res => {
          if (res.code === 1) {
            this.agentGroup = res.data

            this.selectRegionObject = {...res.data[0]}
          }
        })
    },
    // 组态图背景
    async findDiagram(orgId) {
      let { data, code } = await request({ url: api.diagram.findDiagram, data: { orgId }})
      if (code === 1) this.mapList = data
    },
    // 获取组态图节点
    async findDiagramItem() {
      return new Promise(resolve => {
        request({
          url: api.diagram.findDiagramItem,
          data: { page: 1, limit: -1, diagramId: this.selectMapId }
        }).then(res => {
          if (res.code !== 1) return
          const backData = res.data.map(it => ({ ...it, x: it.x * 0.8, y: it.y * 0.67, height: it.height * 0.7, width: it.width * 0.7 }))
          resolve(backData)
        })
      })
    },
    // 获取设备 hyState
    async getHyitDevice(hyDeviceId) {
      let { model, code } = await request({ url: api.powerEnv.getHyitDevice, data: { hyDeviceId }})
      if (code === 1) return model
    },
    // 组态图数据
    async getMapData(params) {
      const orgId = params.hyAreaId
      await this.findDiagram(orgId)

      const topoMapData = {}
      const topoMapInfo = this.mapList.findIndex(item => Number(item.id) === Number(this.selectMapId))
      if (topoMapInfo !== -1) topoMapData.info = this.mapList[topoMapInfo]

      // 获取组态图节点|设备闪灯位置获取
      let topoItemResult = []
      if (this.mapList.length > 0) { // 没有背景图时不传设备nodes节点
        topoItemResult = await this.findDiagramItem() || []

        const topoItem = []
        for (const item of topoItemResult) {
          item.id = String(item.id)
          const topoItemGraph = {
            id: item.id,
            x: item.x,
            y: item.y,
            color: '#00ffff',
            itemTypes: ['node', 'edge'],
            userDefineType: item.userDefineType,
            statue: item.statue,
            onSelectDevice: false,
            bgLeft: 0,
            bgTop: 0,
            iconLeft: 10,
            iconTop: -50
          }
          // userDefineType:1视频设备 2it监控设备 3it运维设备 4动环设备 5人员 6组织机构 7区域 8图标，9文本
          if (item.userDefineType === 4) {
            const device = await this.getHyitDevice(item.hostId)
            if (device) {
              topoItemGraph.statue = device.hyState // hyState:0离线 1在线 2告警
              if (topoItemGraph.statue === 2) {
                topoItemGraph.color = '#e24449'// 告警色
                topoItemGraph.size = item.width / 4 // 默认圆半径
                topoItemGraph.type = 'background-animate'// 背景动画
                topoItemGraph.label = '' // 标题
                topoItemGraph.labelName = item.itemName // 标题内容
                topoItemGraph.labelCfg = {
                  position: 'left',
                  offset: 10
                }
                topoItemGraph.style = {
                  fill: '#fc6e6e',
                  stroke: '#e24449'
                }
              }
              if (topoItemGraph.statue === 1) {
                topoItemGraph.type = 'image'// 背景图
                topoItemGraph.size = [item.width, item.height]// 默认圆半径
                topoItemGraph.img = ''
                topoItemGraph.label = '' // 标题
                topoItemGraph.labelName = item.itemName // 标题内容
              }
            }
          }

          topoItem.push(topoItemGraph)
        }
        // G6--nodes 节点配置
        topoMapData.nodes = topoItem
      }

      // G6数据赋值
      this.topoMapData = topoMapData
      // console.log('topoMapData:', topoMapData)
    }

  }
}
</script>

<style lang="scss" scoped>
 @import  './componentallstyle/index.scss';
</style>

