<template>
  <div ref="appContainer" class="config-content-main">
    <div
      ref="configContentMain"
      class="config-content-main flex-center"
    >
      <div id="topoMap" style="width: 800px;height:400px" />
      <div v-if="showOc" :style="{'left': ocLeft + 'px', 'top': ocTop + 'px'}" class="conext-oC">
        <div>{{ deviceInfo.deviceName }}</div>
        <div class="mt-14">温度：{{ deviceInfo.temperature }}</div>
        <div class="mt-6">湿度：{{ deviceInfo.humidity }}</div>
      </div>
      <div v-if="showLabel" :style="{'left': labelLeft + 'px', 'top': labelTop + 'px'}" class="conext-oC">
        <div>{{ labelName }}</div>
      </div>
    </div>
    <el-dialog :title="itMonitorModelTitle" :visible.sync="showItMonitorDialog" top="5vh" width="80%">
      <div class="dialog-wrapper" style="height: 60vh; overflow: auto;">
        <MonitorEcharts
          v-if="showItMonitorDialog"
          :prop-agent="agent"
          :prop-dev-type-id="devTypeId"
          :prop-zbx-host-id="zbxHostId"
          :usability="1"
        />
      </div>
    </el-dialog>
    <el-dialog
      :close="closeVideoDialog"
      :close-on-click-modal="false"
      :title="videoName"
      :visible.sync="showVideoDialog"
      :width="videoDialogWidth"
      class="dialog-no-padding"
      top="5vh"
      append-to-body
    >
      <div ref="videoWrapperRef" :style="{ height: '80vh', width: videoModelWidth + 'px'}" class="dialog-wrapper">
        <live-player-content
          v-if="showVideoDialog"
          :can-control="true"
          :cid="cid"
          :close-video-dialog-key="closeVideoDialogKey"
          :is-controlling="true"
          :options="videoOptions"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import G6 from '@antv/g6'
import MonitorEcharts from '@/views/it-monitor/resources-monitor/monitor-content'
import request from '@/utils/request'
import api from '@/api/api'
import LivePlayerContent from '@/views/video/components/player-content/live-player-content'

export default {
  name: 'MapIndex',
  components: {
    MonitorEcharts,
    LivePlayerContent
  },
  props: {
    // 组态图数据
    mapData: {
      type: Object,
      default: function() {
        return {}
      }
    },
    // 设备列中选择的设备
    selectDeviceData: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      containerHeight: 0,
      showMap: false,
      topoMapData: {},
      topoGraph: null,
      showItMonitorDialog: false,
      devTypeId: '',
      agent: '',
      zbxHostId: '',
      showVideoDialog: false,
      getChnCurrentItemErrorCount: 0,
      videoOptions: {}, // 视频参数
      cid: '', // 选择的通道
      videoName: '', // 通道名称
      videoModelWidth: 0, // 实时预览弹窗高度 16:9
      videoModelHeight: 0, // 实时预览弹窗宽度 16:9
      beforeActiveStatusItem: null, // 上一个高亮
      itMonitorModelTitle: 'IT监控详情',
      videoDialogWidth: '',
      closeVideoDialogKey: false,
      deviceInfo: {},
      showOc: false,
      ocLeft: '',
      ocTop: '',
      showLabel: '',
      labelName: '',
      labelLeft: '',
      labelTop: ''
    }
  },
  watch: {
    mapData(newVal) {
      if (newVal) {
        console.log('来了')
        if (this.topoGraph) this.topoGraph.destroy()
        this.topoMapData = newVal
        this.initMap()
        // this.topoGraph.fitView()
      }
    },
    selectDeviceData(newVal, oldValue) {
      this.beforeActiveStatusItem = oldValue.id
      this.updateTopoItemBgImg(newVal)
    }
  },
  mounted() {
    console.log('接收到的组态图数据', this.mapData)
    // 设置内容区域高度宽度
    this.containerHeight = this.$refs.appContainer.clientHeight
    this.containerWidth = this.$refs.configContentMain.clientWidth
  },
  methods: {
    // 初始化topo图
    async initMap() {
      var that = this
      // 自定义节点
      G6.registerNode(
        'node-template',
        (cfg) => `
          <group style={{ width: ${cfg.size[0]}, height: ${cfg.size[1]}, boxShadow: '10px 10px 10px #000' }}>
            <image draggable="true" style={{ img: ${cfg.bgImg}, width: ${cfg.size[0]}, height: ${cfg.size[1]}, marginLeft: ${cfg.bgLeft}, marginTop: ${cfg.bgTop} }} />
            <image draggable="true" style={{ img: ${cfg.img}, width: 11, height: 11, marginLeft: 13,  marginTop: -21, sIndex: 999 }} />
          </group>`
      )
      // 实例化配置
      this.topoGraph = new G6.Graph({
        container: 'topoMap', // 视图区域DOM
        // width: 600,
        // height: 300,
        // fitView: true,
        // fitCenter: true,
        defaultEdge: { // 线条默认配置
          color: '#B7C2CBFF',
          lineAppendWidth: 10,
          style: { lineWidth: 3 }
        },
        defaultNode: { // 节点默认配置
          type: 'node-template',
          size: [40, 40]
        },
        modes: { // 模式
          // default: ['drag-canvas', 'drag-node'],
          altSelect: [{ type: 'brush-select', trigger: 'drag' }, 'drag-node']
        },
        animate: true
      })
      console.log('G6数据:', this.topoGraph)
      this.topoGraph.data(this.topoMapData)
      // G6.Util.processParallelEdges(this.topoMapData.edges) // 多边渲染
      this.topoGraph.render()
      this.graphCenterPoint = that.topoGraph.getGraphCenterPoint()

      let backgroundImag = this.topoGraph.getGroup().addShape('image', {
        attrs: {
          width: 800,
          height: 400,
          img: that.topoMapData.info.imageUrl,
          x: 0,
          y: 0
        },
        capture: false
      })
      backgroundImag.toBack()
      // 点击元素节点
      // this.topoGraph.on('node:click', function(evt) {
      //   console.log(evt.item._cfg.model.label)
      //   // 视频设备
      //   if (evt.item._cfg.model.userDefineType === 1) {
      //     that.cid = String(evt.item._cfg.model.hostId)
      //     that.videoName = evt.item._cfg.model.label
      //     that.showVideoDialog = true
      //     that.getChnCurrentItem()
      //     setTimeout(() => {
      //       that.videoModelWidth = (that.$refs.videoWrapperRef.clientHeight / 9) * 16
      //       that.videoDialogWidth = `${(that.videoModelWidth / window.innerWidth) * 100}%`
      //       console.log(that.videoDialogWidth, that.videoModelWidth, window.innerWidth)
      //     }, 500)
      //   } else if (evt.item._cfg.model.userDefineType === 4) { // 动环设备
      //     that.$emit('ringDevice', evt.item._cfg.model)
      //   } else if (evt.item._cfg.model.userDefineType === 2) { // it监控设备
      //     request({
      //       url: api.itMonitor.getHyitHost,
      //       data: { hyHostId: evt.item._cfg.model.hostId }
      //     }).then(res => {
      //       if (res.code === 1) {
      //         if (res.model) {
      //           that.itMonitorModelTitle = res.model.hyMarkName
      //           that.showItMonitorDialog = true
      //           that.devTypeId = res.model.hyDevTypeId
      //           that.agent = res.model.agent
      //           that.zbxHostId = res.model.hyZhostId
      //         }
      //       }
      //     })
      //   }
      // })
      // this.topoGraph.on('node:dblclick', function(evt) {
      //   if (evt.item._cfg.model.userDefineType !== 10) return
      //   that.$router.push({
      //     name: 'configCabinetWeb',
      //     query: { id: that.$route.query.id, cabinetId: evt.item._cfg.model.hostId }
      //   })
      // })
      // this.topoGraph.on('node:mouseout', async function(evt) {
      //   that.showOc = false
      //   that.showLabel = false
      // })
      // this.topoGraph.on('mouseenter', async function(evt) {
      //   that.showOc = false
      //   that.showLabel = false
      // })
      // 移动元素上方显示温湿度
      // this.topoGraph.on('node:mouseenter', async(evt) => {
      //   // console.log(evt, evt.item._cfg.model.hostId)
      //   console.log('进来')
      //   const that = this
      //   that.showInfo(evt.canvasX, evt.canvasY, evt.item._cfg.model.label, evt.item._cfg.model.hostId, evt.item._cfg.model.userDefineType)
      // })
    },
    async showInfo(x, y, label, hostId, userDefineType) {
      const that = this
      that.showOc = false
      that.showLabel = false

      // evt.preventDefault()
      const deviceId = hostId
      const device = await that.getHyitDevice(deviceId)
      if (userDefineType === 4 && device.hyDevTypeValue === 1000) {
        that.$set(that.deviceInfo, 'deviceName', device.hyAlias)
        that.$set(that.deviceInfo, 'humidity', 0)
        that.$set(that.deviceInfo, 'temperature', 0)
        let deviceValuelist = await that.findHyitDeviceValue(device.hyDeviceId)
        const ValueTypes = await that.findHyitValueType(deviceValuelist.map(it => it.hyType).join(','))
        for (let k = 0; k < ValueTypes.length; k++) {
          const type = ValueTypes[k]
          for (let j = 0; j < deviceValuelist.length; j++) {
            const deviceValue = deviceValuelist[j]
            const boole = await that.init(deviceValue, type, '温度')
            if (boole) break
          }
        }
        for (let k = 0; k < ValueTypes.length; k++) {
          const type = ValueTypes[k]
          for (let j = 0; j < deviceValuelist.length; j++) {
            const deviceValue = deviceValuelist[j]
            const boole = await that.init(deviceValue, type, '湿度')
            if (boole) break
          }
        }
        that.showOc = true
        that.ocLeft = x - 80
        that.ocTop = y - 50
        return
      }
      that.showLabel = true
      that.labelName = label
      that.labelLeft = x - 50
      that.labelTop = y - 10
    },
    async getHyitDevice(hyDeviceId) {
      let { model, code } = await request({ url: api.powerEnv.getHyitDevice, data: { hyDeviceId }})
      if (code === 1) return model
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
    // 获取流地址址播放
    getChnCurrentItem() {
      const cid = this.cid
      request({
        url: api.video.getLive, data: { cid, isStream: 1 }
      }).then(res => {
        this.cid = ''
        if (res.code === 1) {
          if (res.map) {
            this.getChnCurrentItemErrorCount = 0
            res.map.mes.cname = this.videoName
            this.videoOptions = {
              ...res.map.mes,
              beDvr: {
                title: this.videoName
              }
            }
            this.showDialog = true
          }
        } else {
          this.getChnCurrentItemErrorCount++
          if (this.getChnCurrentItemErrorCount < 3) { // 三次请求失败后提醒
            this.getChnCurrentItem()
          } else {
            this.showVideoDialog = false
            this.getChnCurrentItemErrorCount = 0
            this.$message({
              message: '请求失败',
              type: 'error',
              duration: 5 * 1000
            })
          }
        }
      })
    },
    // 更新节点选择状态 把之前高亮的取消掉，再高亮当前
    updateTopoItemBgImg(active) {
      if (this.beforeActiveStatusItem) {
        // 获取上一个高亮的节点
        const getBeforeTopoItem = this.topoGraph.findById(this.beforeActiveStatusItem)
        getBeforeTopoItem.update({
          bgImg: getBeforeTopoItem._cfg.model.statue === 1 ? 'image/configuration/item_tag_bg_success.png' : 'image/configuration/item_tag_bg_err.png'
          // size: [getBeforeTopoItem._cfg.model.size[0] - 15, getBeforeTopoItem._cfg.model.size[1] - 15],
          // bgLeft: 0,
          // bgTop: 0,
          // iconLeft: 10,
          // iconTop: -50
        })
      }
      // 高亮当前
      const getTopoItem = this.topoGraph.findById(active.id)
      getTopoItem.update({
        bgImg: 'image/configuration/select.png'
        // size: [active.width + 15, active.height + 15],
        // bgLeft: -7,
        // bgTop: -7,
        // iconLeft: 10,
        // iconTop: -62
      })
      this.topoGraph.refresh()
    },
    closeVideoDialog() {
      this.closeVideoDialogKey = true
      this.showVideoDialog = false
      this.closeVideoDialogKey = false
    },
    async findDiagram(orgId) {
      let { data, code } = await request({ url: api.diagram.findDiagram, data: { orgId: this.$route.query.orgid }})
      if (code === 1) return data
    }
  }
}
</script>

<style lang="scss" scoped>
.config-content-main {
  width: 100%;
  height: 100%;
  //overflow: auto;
  //margin: 0 auto;
  position: relative;
  //overflow:hidden;
}
#topoMap::-webkit-scrollbar{
    display: none;
}
.transition-live-box {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #FFFFFF;
  width: 70%;
  height: 70%;
  z-index: 10;
}

.conext-oC {
  position: absolute;
  background-color: rgba(0,0,0,.8);
  color: #fff;
  padding: 10px;
  //width: 140px;
  border-radius: 5px;
}
</style>
