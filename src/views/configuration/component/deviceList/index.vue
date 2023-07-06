<template>
  <div class="device-list">
    <div class="map-sidebar">
      <div class="map-sidebar-box">
        <div class="map-sidebar-title">组态图列表</div>
        <div class="map-sidebar-content cabinet-content">
          <div class="content-list">
            <div
              v-for="(item) in mapList"
              :key="item.cabinetId"
              :draggable="false"
              :style="{color:selectMapId===item.id?'#0145ab':''}"
              class="list-item pointer"
              @click="changeMap(item)"
            >
              {{ item.name }}
            </div>
          </div>
        </div>
        <div class="map-sidebar-title">设备列表</div>
        <div class="map-sidebar-content device-content">
          <div class="content-list">
            <div
              v-for="(item,index) of deviceList"
              :key="item.id"
              :loading="cid === item.hostId && item.userDefineType === 1"
              :style="{color:currentDeviceIndex===index?'#0145ab':''}"
              class="content-item pointer"
              type="text"
              @click="handlerDevice(item,index)"
            >
              <div class="content-item-label py-10 flex-v-between">
                <!--                <div class="content-item-icon mr-8"><img :src="item.imageUrl" alt="" height="20" width="20"></div>-->
                <div class="content-item-name overflow-text-a mr-6">{{ item.itemName }}</div>
                <div v-if="!item.hyDevTypeValue" :style="{color:$tool.formatStr(item.statue,'0:#F56C6C,1:#67C23A')}">{{ $tool.formatStr(item.statue,'0:离线,1:在线') }}</div>
                <div v-else class="content-item-info font-12">
                  <div class="mb-4">温度:{{ item.temperature||0 }}</div>
                  <div>湿度:{{ item.humidity||0 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { diagramItemIcon } from '@/utils/define-data'
import loadmore from '@/directive/el-select-loadmore/loadmore'
import { getVuexStoragePermission } from '@/utils/auth'

export default {
  name: 'DeviceListIndex',
  directives: { loadmore },
  data() {
    return {
      mapList: [], // 组态图列表
      selectMapId: '', // 选择的组态图
      allDeviceList: [], // 组态图所有设备
      deviceList: [], // 组态图当前设备列表
      showDialog: false, // 显示视频播放弹窗
      videoOptions: [], // 视频参数
      cid: '', // 选择的通道
      videoName: '', // 通道名称
      topoMapData: '',
      diagramItemIconList: diagramItemIcon(),
      dropDownTitle: '所有',
      findHyitOrgMapQuery: {
        page: 1,
        limit: 10
      },
      getVuexStoragePermissionData: [],
      cabinetList: [],
      currentDeviceIndex: ''
    }
  },
  async mounted() {
    this.selectMapId = +this.$route.query.id
    // await this.findHyitOrgMap()
    await this.getMapData()
    this.getVuexStoragePermissionData = getVuexStoragePermission()
    console.log(this.getVuexStoragePermissionData)
  },
  methods: {
    // 选择设备类型
    handleCommand(val) {
      if (val === '0') this.dropDownTitle = '所有'
      if (val === '4') this.dropDownTitle = '动环设备'
      if (val === '1') this.dropDownTitle = '视频设备'
      if (val === '0') {
        this.deviceList = this.allDeviceList
      } else {
        const device = []
        this.allDeviceList.forEach(item => {
          if (item.userDefineType === Number(val)) {
            device.push(item)
          }
        })
        this.deviceList = device
      }
    },

    // 选择组态图
    async changeMap(item) {
      this.selectMapId = item.id
      await this.getMapData()
    },
    async findDiagram(orgId) {
      let { data, code } = await request({ url: api.diagram.findDiagram, data: { orgId: this.$route.query.orgId }})
      if (code === 1) this.mapList = data
    },
    // 获取组态图列表
    async findHyitOrgMap() {
      await request({ url: api.diagram.findDiagram, data: this.findHyitOrgMapQuery })
        .then(res => {
          if (res.code === 1) {
            if (this.selectMapId === '') {
              this.selectMapId = res.data[0].id
              this.selectMapId = res.data[0].id
              this.$nextTick(() => {
                this.getMapData()
              })
            }
            res.data.forEach(item => {
              this.$set(this.mapList, this.mapList.length, item)
            })
          }
        })
    },
    async getHyitDevice(hyDeviceId) {
      let { model, code } = await request({ url: api.powerEnv.getHyitDevice, data: { hyDeviceId }})
      if (code === 1) return model
    },
    async init(deviceValue, type, name) {
      if (deviceValue['hyType'] === type['hyTypeId']) {
        const str = this.$tool.humpStr(type['hyFieldName'])
        if (deviceValue.hyDes.indexOf(name) !== -1) {
          if (name === '温度') return deviceValue[str]
          if (name === '湿度') return deviceValue[str]
        }
      }
    },
    async findHyitDeviceValue(hyDeviceId) {
      let { code, data } = await request({
        url: api.powerEnv.findHyitDeviceValue,
        data: { limit: -1, hyDeviceId }
      })
      if (code !== 1) return
      return data
    },
    async findHyitValueType(hyTypes) {
      let { code, data } = await request({
        url: api.powerEnv.findHyitValueType,
        data: { limit: -1, ids: hyTypes }
      })
      if (code !== 1) return
      return data
    },
    // 获取组态图数据
    async getMapData() {
      await this.findDiagram()

      this.deviceList = []

      console.log('this.selectMapId', this.selectMapId)
      const topoMapData = {}
      const topoMapInfo = this.mapList.findIndex(item => Number(item.id) === Number(this.selectMapId))
      console.log(topoMapInfo)
      if (topoMapInfo !== -1) topoMapData.info = this.mapList[topoMapInfo]
      // 获取组态图节点
      const topoItemResult = await this.findDiagramItem() || []
      console.log(topoItemResult)
      // 解析组态图节点中的设备
      const deviceList = []
      const itMonitorDeviceIds = []
      topoItemResult.forEach(item => {
        // 自定义节点
        if (item.userDefineType === 8) return
        // 自定义文本
        if (item.userDefineType === 9) return
        // it监控设备
        if (item.userDefineType === 2) {
          itMonitorDeviceIds.push(item.hostId)
        }
        if (item.userDefineType === 2) return
        // it监控设备显示在右侧，其他设备都显示在设备列表中
        const getIcon = this.$tool.findDataItemByAttr(this.diagramItemIconList, 'userDefineType', item.userDefineType)
        if (getIcon) {
          item.icon = getIcon.listIcon
        }
        if (item.userDefineType === 10) {
          item.icon = 'image/configuration/cabinet-icon.png'
        }
        deviceList.push(item)
      })
      // this.allDeviceList = deviceList

      for (let it of deviceList) {
        if (it.userDefineType !== 4) continue
        const device = await this.getHyitDevice(it.hostId)
        it.statue = device.hyState
        if (device.hyDevTypeValue !== 1000) continue
        it.hyDevTypeValue = 1000
        const deviceValuelist = await this.findHyitDeviceValue(device.hyDeviceId)
        const ValueTypes = await this.findHyitValueType(deviceValuelist.map(it => it.hyType).join(','))
        for (let k = 0; k < ValueTypes.length; k++) {
          const type = ValueTypes[k]
          for (let j = 0; j < deviceValuelist.length; j++) {
            const deviceValue = deviceValuelist[j]
            const boole = await this.init(deviceValue, type, '温度')
            it.temperature = boole
            if (boole) break
          }
        }
        for (let k = 0; k < ValueTypes.length; k++) {
          const type = ValueTypes[k]
          for (let j = 0; j < deviceValuelist.length; j++) {
            const deviceValue = deviceValuelist[j]
            const boole = await this.init(deviceValue, type, '湿度')
            it.humidity = boole
            if (boole) break
          }
        }
      }
      this.deviceList = deviceList

      // console.log(deviceList)
      // 根据节点中的it监控设备获取主机信息
      if (itMonitorDeviceIds.length > 0) this.findHyitHost(itMonitorDeviceIds)
      // 生成节点
      const topoItem = []
      console.log(topoItemResult)
      topoItemResult.forEach(item => {
        item.id = String(item.id)
        const topoItemGraph = {
          id: item.id,
          x: item.x,
          y: item.y,
          size: [item.width, item.height],
          label: item.itemName,
          userDefineType: item.userDefineType,
          statue: item.statue,
          onSelectDevice: false,
          bgLeft: 0,
          bgTop: 0,
          iconLeft: 10,
          iconTop: -50
        }
        if (item.userDefineType === 8 || item.userDefineType !== 9) {
          topoItemGraph.labelCfg = { position: 'bottom' }
          topoItemGraph.type = 'node-template'
          // 节点图标
          topoItemGraph.img = item.imageUrl || 'image/configuration/node_item_icon_default.png'
          // 节点背景图片
          topoItemGraph.bgImg = item.statue === 1 ? 'image/configuration/item_tag_bg_success.png' : 'image/configuration/item_tag_bg_err.png'
        }
        if (item.zhostId) topoItemGraph.zhostId = item.zhostId
        if (item.hostId) topoItemGraph.hostId = item.hostId
        if (item.userDefineType === 9) {
          topoItemGraph.type = 'rect'
          if (item.fontBackColor) topoItemGraph.style = { fill: item.fontBackColor }
          topoItemGraph.labelCfg = {
            style: { fontSize: item.fontSize || 0, fill: item.fontColor || '#000', fontWeight: item.fontWeight || 0 }
          }
        }
        topoItem.push(topoItemGraph)
      })
      topoMapData.nodes = topoItem
      // 获取组态图链路
      const topoLineItems = await this.findDiagramLink() || []
      const edges = []
      topoLineItems.forEach(item => {
        item.id = String(item.id)
        edges.push({
          id: `edge-${item.id}`,
          source: String(item.sourceItemId),
          target: String(item.targetItemId)
        })
      })
      topoMapData.edges = edges
      this.$emit('topoMapData', topoMapData)
    },
    // 获取it监控主机
    findHyitHost(ids) {
      request({
        url: api.itMonitor.findHyitHost,
        data: {
          page: 1,
          limit: -1,
          hostType: 1,
          ids,
          agents: this.sessionStorageOperation('get', 'agentId')
        }
      }).then(res => {
        if (res.code === 1) {
          this.$emit('itMonitorDeviceData', res.data)
        }
      })
    },
    // 获取组态图节点
    async findDiagramItem() {
      return new Promise(resolve => {
        request({
          url: api.diagram.findDiagramItem,
          data: { page: 1, limit: -1, diagramId: this.selectMapId }
        }).then(res => { if (res.code === 1) resolve(res.data) })
      })
    },
    // 获取组态图链路
    async findDiagramLink() {
      return new Promise(resolve => {
        request({
          url: api.diagram.findDiagramItemLink,
          data: { page: 1, limit: -1, diagramId: this.selectMapId }
        }).then(res => { if (res.code === 1) resolve(res.data) })
      })
    },
    // 选择设备
    handlerDevice(value, index) {
      this.currentDeviceIndex = index
      this.$emit('selectDevice', value)
    },
    loadMore() {
      this.findHyitOrgMapQuery.page = this.findHyitOrgMapQuery.page + 1
      this.findHyitOrgMap()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../style/mapStyle';
.cabinet-content{
  max-height:300px;
  overflow:hidden;
  overflow-y: scroll;
}
.device-list {
  height: 100%;

  .el-select {
    // width: 100%;
  }

  .device-list-title {
    font-size: 16px;
    font-weight: bold;
    padding: 15px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .device-list-content {
    background: #fff;
    border-top: 3px solid #000000;

    .content-item {
      display: flex;
      justify-content: space-between;
      padding: 15px;
      margin-left: 0 !important;
      width: 100%;

      span {
        display: flex;
      }
    }

    .content-item-label {
      display: flex;
      align-items: center;
      width: 100%;

      .content-item-icon {
        margin-right: 5px;
      }

      .content-item-name {
        color: #0145ab;
        font-weight: bold;
      }
    }

    .content-item-value {
    }
  }
}

.content-list {
  padding-left: 0 !important;
}
.map-sidebar{
width: 100%;
.content-item-label{
  border-bottom: 1px solid #c7c7c7;
  color: #0145ab;
  .content-item-name{
    flex: 1;
  }
  .content-item-info{
    color: #999;
  }
}
}
.map-sidebar-box{
  display:flex;
  flex-direction: column;
  .device-content{
    flex: 1;
    overflow: hidden;
    overflow-y: auto;
  }
}
</style>
