<template>
  <!--  <div class="power-device" style="background:url('image/screen/bg.png')">-->
  <div class="power-device">
    <div class="device-box">
      <!--      <div-->
      <!--        v-for="(item,index) in sliceDeviceList"-->
      <!--        :key="item.hyDeviceId"-->
      <!--        :style="{top:deviceLocal[index]['y']+'%', left:deviceLocal[index]['x']+'%',}"-->
      <!--        class="device"-->
      <!--        @mouseenter="onmouseenter($event,item)"-->
      <!--      >-->
      <!--        <img v-if="item.hyDevTypeValue!==1000 && item.hyState===0" slot="reference" alt="" height="30" src="image/dashboard/power/ico_yc.png">-->
      <!--        <img v-if="item.hyDevTypeValue===1000 && item.hyState===1" slot="reference" alt="" height="30" src="image/dashboard/power/uco_yj.png">-->
      <!--        <el-popover-->
      <!--          placement="top"-->
      <!--          popper-class="hoverPopover"-->
      <!--          trigger="hover"-->
      <!--          width="200"-->
      <!--        >-->
      <!--          <div>-->
      <!--            <div>{{ deviceInfo.deviceName }}</div>-->
      <!--            <div class="mt-14">温度：{{ deviceInfo.temperature }}</div>-->
      <!--            <div class="mt-6">湿度：{{ deviceInfo.humidity }}</div>-->
      <!--          </div>-->
      <!--          <img v-if="item.hyDevTypeValue===1000" slot="reference" alt="" height="30" src="image/dashboard/power/_r4_dj.png">-->
      <!--        </el-popover>-->
      <!--      </div>-->
      <mapIndex :map-data="topoMapData" :select-device-data="selectDeviceData" />
    </div>
    <img alt="" class="fx" src="image/screen/fx.png">
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import mapIndex from '../map/index'
export default {
  name: 'PowerDevice',
  components: {
    mapIndex
  },
  props: {
    sliceDeviceList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      deviceLocal: [
        { x: 49, y: 38 },
        { x: 58.5, y: 37 },
        { x: 40.5, y: 44 },
        { x: 46.5, y: 44 },
        { x: 52.5, y: 44 },
        { x: 59.5, y: 44 },
        { x: 32.5, y: 51.5 },
        { x: 43.5, y: 57.5 },
        { x: 47.5, y: 49.5 },
        { x: 55, y: 49.5 },
        { x: 62.5, y: 49.5 },
        { x: 35, y: 61 },
        { x: 43.5, y: 61 },
        { x: 51.5, y: 61 },
        { x: 59.5, y: 61 },
        { x: 0, y: 0 },
        { x: 0, y: 0 }
      ],
      deviceInfo: {
        temperature: 0,
        humidity: 0,
        deviceName: ''
      },
      topoMapData: {},
      selectMapId: 28, // 28番禺中心医院图组 ,34中心医院
      mapList: [],
      selectDeviceData: {}
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('changeDevice')
  },
  mounted() {
    this.getMapData()
    this.$EventBus.$on('changeDevice', res => {
      this.selectDeviceData = res
    })
  },
  methods: {
    mathLocal(max = 60, min = 20) {
      return Math.floor(Math.random() * (max - min + 1) + min)
    },
    selectDevice(val) {
      this.selectDeviceData = val
    },
    // async onmouseenter(e, item) {
    //   if (item.hyDevTypeValue !== 1000) return
    //   this.deviceInfo.deviceName = item.hyAlias
    //   this.deviceInfo.humidity = 0
    //   this.deviceInfo.temperature = 0
    //   let deviceValuelist = await this.findHyitDeviceValue(item.hyDeviceId)
    //   const ValueTypes = await this.findHyitValueType(deviceValuelist.map(it => it.hyType).join(','))
    //   for (let k = 0; k < ValueTypes.length; k++) {
    //     const type = ValueTypes[k]
    //     for (let j = 0; j < deviceValuelist.length; j++) {
    //       const deviceValue = deviceValuelist[j]
    //       const boole = await this.init(deviceValue, type, '温度')
    //       if (boole) break
    //     }
    //   }
    //   for (let k = 0; k < ValueTypes.length; k++) {
    //     const type = ValueTypes[k]
    //     for (let j = 0; j < deviceValuelist.length; j++) {
    //       const deviceValue = deviceValuelist[j]
    //       const boole = await this.init(deviceValue, type, '湿度')
    //       if (boole) break
    //     }
    //   }
    // },

    async findDiagram(orgId) {
      // let { data, code } = await request({ url: api.diagram.findDiagram, data: { orgId: this.$route.query.orgId }})
      let { data, code } = await request({ url: api.diagram.findDiagram, data: { orgId: 820040 }})
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
          res.data = res.data.map(it => ({ ...it, x: it.x * 0.8, y: it.y * 0.67, height: it.height * 0.7, width: it.width * 0.7 }))
          resolve(res.data)
        })
      })
    },
    async findDiagramLink() {
      return new Promise(resolve => {
        request({
          url: api.diagram.findDiagramItemLink,
          data: { page: 1, limit: -1, diagramId: this.selectMapId }
        }).then(res => { if (res.code === 1) resolve(res.data) })
      })
    },
    async getMapData() {
      await this.findDiagram()

      // this.deviceList = []

      console.log('this.selectMapId', this.selectMapId)
      console.log('this.mapList', this.mapList)
      const topoMapData = {}
      const topoMapInfo = this.mapList.findIndex(item => Number(item.id) === Number(this.selectMapId))
      if (topoMapInfo !== -1) topoMapData.info = this.mapList[topoMapInfo]
      console.log('topoMapData.info', topoMapData.info)
      // 获取组态图节点
      const topoItemResult = await this.findDiagramItem() || []
      console.log('获取组态图节点', topoItemResult)
      // 解析组态图节点中的设备
      // const deviceList = []
      // const itMonitorDeviceIds = []
      // topoItemResult.forEach(item => {
      //   // 自定义节点
      //   if (item.userDefineType === 8) return
      //   // 自定义文本
      //   if (item.userDefineType === 9) return
      //   // it监控设备
      //   if (item.userDefineType === 2) {
      //     itMonitorDeviceIds.push(item.hostId)
      //   }
      //   if (item.userDefineType === 2) return
      //   // it监控设备显示在右侧，其他设备都显示在设备列表中
      //   const getIcon = this.$tool.findDataItemByAttr(this.diagramItemIconList, 'userDefineType', item.userDefineType)
      //   if (getIcon) {
      //     item.icon = getIcon.listIcon
      //   }
      //   if (item.userDefineType === 10) {
      //     item.icon = 'image/configuration/cabinet-icon.png'
      //   }
      //   deviceList.push(item)
      // })
      // 根据节点中的it监控设备获取主机信息
      // if (itMonitorDeviceIds.length > 0) this.findHyitHost(itMonitorDeviceIds)
      // 生成节点
      const topoItem = []
      for (const item of topoItemResult) {
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
        if (item.userDefineType === 4) {
          const device = await this.getHyitDevice(item.hostId)
          if (device) {
            console.log('getHyitDevice', device.hyState, device)
            topoItemGraph.statue = device.hyState
            item.statue = device.hyState
          }
        }
        if (item.userDefineType === 8 || item.userDefineType !== 9) {
          topoItemGraph.labelCfg = { position: 'bottom' }
          topoItemGraph.type = 'node-template'
          // 节点图标| 机房背景图
          topoItemGraph.img = item.imageUrl || 'image/configuration/node_item_icon_default.png'
          // 节点背景图片 | statue: 0 , 1成功
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
      }
      // topoItemResult.forEach(async item => {
      //   item.id = String(item.id)
      //   const topoItemGraph = {
      //     id: item.id,
      //     x: item.x,
      //     y: item.y,
      //     size: [item.width, item.height],
      //     label: item.itemName,
      //     userDefineType: item.userDefineType,
      //     statue: item.statue,
      //     onSelectDevice: false,
      //     bgLeft: 0,
      //     bgTop: 0,
      //     iconLeft: 10,
      //     iconTop: -50
      //   }
      //   if (item.userDefineType === 8 || item.userDefineType !== 9) {
      //     topoItemGraph.labelCfg = { position: 'bottom' }
      //     topoItemGraph.type = 'node-template'
      //     // 节点图标
      //     topoItemGraph.img = item.imageUrl || 'image/configuration/node_item_icon_default.png'
      //     // 节点背景图片
      //     topoItemGraph.bgImg = item.statue === 1 ? 'image/configuration/item_tag_bg_success.png' : 'image/configuration/item_tag_bg_err.png'
      //   }
      //   if (item.zhostId) topoItemGraph.zhostId = item.zhostId
      //   if (item.hostId) topoItemGraph.hostId = item.hostId
      //   if (item.userDefineType === 9) {
      //     topoItemGraph.type = 'rect'
      //     if (item.fontBackColor) topoItemGraph.style = { fill: item.fontBackColor }
      //     topoItemGraph.labelCfg = {
      //       style: { fontSize: item.fontSize || 0, fill: item.fontColor || '#000', fontWeight: item.fontWeight || 0 }
      //     }
      //   }
      //   if (item.userDefineType === 4) {
      //     const device = await this.getHyitDevice(item.hostId)
      //     topoItemGraph.statue = device.hyState
      //   }
      //   topoItem.push(topoItemGraph)
      // })
      topoMapData.nodes = topoItem
      console.log('topoMapData.nodes', topoMapData.nodes)
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
      this.topoMapData = topoMapData
      console.log('topoMapData.edges', topoMapData.edges)
      console.log('topoMapData', topoMapData)
    },
    async init(deviceValue, type, name) {
      if (deviceValue['hyType'] === type['hyTypeId']) {
        const str = this.$tool.humpStr(type['hyFieldName'])
        if (deviceValue.hyDes.indexOf(name) !== -1) {
          console.log(12132)
          if (name === '温度') this.deviceInfo.temperature = deviceValue[str]
          if (name === '湿度') this.deviceInfo.humidity = deviceValue[str]
          return true
        }
      }
    },
    async getHyitDevice(hyDeviceId) {
      let { model, code } = await request({ url: api.powerEnv.getHyitDevice, data: { hyDeviceId }})
      if (code === 1) return model
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
    }
  }
}
</script>

<style lang="scss">
.power-device{
  position: relative;
  overflow: hidden;
  display:flex;
  .fx{
    position:absolute;
    bottom: 30px;
    right: 30px;
    transform: rotate(-45deg);
  }
  .device-box{
    height: 100%;
    //flex: 1;
    //display:flex;
    //justify-content:center;
    width: 800px !important;
    margin: 0 auto;
    //transform: translateY(-100px);
    .config-content-main{
      width:800px !important;
    }
  }
}
img{
  object-fit:cover;
}
.device{
  position: absolute;
}
.info-box{
  position: absolute;
  background: rgba(0,0,0,.5);
  width: 200px;
  height:100px;
}
.hoverPopover{
  background:rgba(0,0,0,.5);
  border: none;
  color: #fff;
  .popper__arrow{
    display: none;
  }
}
</style>
