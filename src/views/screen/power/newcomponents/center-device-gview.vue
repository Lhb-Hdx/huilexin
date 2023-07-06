<template>
  <div class="mid_full">
    <div class="com_title"> <span class="span_left">告警管理</span> </div>
    <div class="posbox">
      <div id="topoMap" />
      <div class="delist">
        <ul>
          <!-- 告警：class="onyc" hyState:0离线 1在线 2告警-->
          <div v-for="(item,index) of broSsliceDeviceList" :key="index">
            <li :class="item.hyState === 2 ? 'onyc' : ''" @click="onSelectItem(item)">
              <a :title="item.hyDeviceName">{{ item.hyDeviceName || '暂无数据' }}</a>
            </li>
          </div>
          <li v-if=" broSsliceDeviceList.length === 0 ">
            <a>{{ '暂无数据' }}</a>
          </li>

        </ul>
      </div>
    </div>

    <!-- 选择设备详情 -->
    <el-dialog :title="deviceName" :visible.sync="dialogVisible" append-to-body custom-class="device-dialog" top="5vh">
      <Monitor v-if="dialogVisible" :id="deviceId" />
      <div slot="footer">
        <el-button type="primary" @click="dialogVisible=false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import G6 from '@antv/g6'

export default {
  name: 'CenterDeviceList',
  components: {
    Monitor: () => import('@/views/ring-monitor/rotaing-right')
  },
  props: {
    // 组态图数据
    mapData: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      list: [],
      deviceId: '',
      deviceName: '',
      sliceDeviceList: [],
      dialogVisible: false,
      currentDevice: {},
      broSsliceDeviceList: [],
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
        if (this.topoGraph) this.topoGraph.destroy()
        this.topoMapData = newVal
        this.initMap()
      }
    }
    // selectDeviceData(newVal, oldValue) {
    //   this.beforeActiveStatusItem = oldValue.id
    //   this.updateTopoItemBgImg(newVal)
    // }
  },
  mounted() {
    this.getBroSsliceDeviceList()
  },

  methods: {
    // 接收设备组件子类型参数
    getBroSsliceDeviceList() {
      this.$EventBus.$on('sliceDeviceList', res => {
        this.broSsliceDeviceList = res
      })
    },
    // 选择列表设备
    onSelectItem(device) {
      this.deviceId = device.hyDeviceId
      this.deviceName = device.hyAlias
      this.dialogVisible = true
    },
    // 初始化G6画布配置
    async initMap() {
      var that = this
      // 创建背景动画
      G6.registerNode(
        'background-animate', {
          afterDraw(cfg, group) {
            const r = cfg.size / 2 // 圆半径
            const back1 = group.addShape('circle', {
              zIndex: -3,
              attrs: {
                x: 0,
                y: 0,
                r,
                fill: cfg.color,
                opacity: 0.6
              },
              name: 'back1-shape'
            })
            const back2 = group.addShape('circle', {
              zIndex: -2,
              attrs: {
                x: 0,
                y: 0,
                r,
                fill: cfg.color,
                opacity: 0.6
              },
              name: 'back2-shape'
            })
            const back3 = group.addShape('circle', {
              zIndex: -1,
              attrs: {
                x: 0,
                y: 0,
                r,
                fill: cfg.color,
                opacity: 0.6
              },
              name: 'back3-shape'
            })
            group.sort() // Sort according to the zIndex
            back1.animate({
              // Magnifying and disappearing
              r: r + 20,
              opacity: 0.1
            }, {
              duration: 3000,
              easing: 'easeCubic',
              delay: 0,
              repeat: true // repeat
            }) // no delay
            back2.animate({
              // Magnifying and disappearing
              r: r + 20,
              opacity: 0.1
            }, {
              duration: 3000,
              easing: 'easeCubic',
              delay: 1000,
              repeat: true // repeat
            }) // 1s delay
            back3.animate({
              // Magnifying and disappearing
              r: r + 20,
              opacity: 0.1
            }, {
              duration: 3000,
              easing: 'easeCubic',
              delay: 2000,
              repeat: true // repeat
            }) // 3s delay
          }
        },
        'circle'
      )

      // 实例化默认配置 data:导入数据,render:渲染到画布
      this.topoGraph = new G6.Graph({
        container: 'topoMap',
        defaultNode: {
          type: 'node-template'
        }
      })
      this.topoGraph.data(this.topoMapData)
      this.topoGraph.render()

      // 交互事件配置 | 画布背景图默认配置
      const width = document.getElementById('topoMap').scrollWidth
      const height = document.getElementById('topoMap').scrollHeight || 400
      console.log('画布@', width, height)
      this.graphCenterPoint = that.topoGraph.getGraphCenterPoint()
      let getImg = that.topoMapData?.info ? that.topoMapData.info.imageUrl : 'image/screen/power/img_bg.png'
      let backgroundImag = this.topoGraph.getGroup().addShape('image', {
        attrs: {
          width: 800,
          height: 400,
          // width,
          // height,
          img: getImg,
          x: 0,
          y: 0
        },
        capture: false
      })
      backgroundImag.toBack()

      // 设置画布居中
      this.setGraphSzie(this.topoGraph)

      // 鼠标事件|进入
      const graph = this.topoGraph
      graph.on('node:mouseenter', (ev) => {
        let edge = ev.item
        let model = edge.getModel()
        graph.setItemState(edge, 'hover', true)
        graph.updateItem(edge, {
          label: model.labelName,
          img: 'image/screen/power/ico_zc.png',
          labelCfg: {
            style: {
              fill: '#fff'
            }
          }
        })
      })

      // 鼠标事件|离开
      graph.on('node:mouseleave', (ev) => {
        var edge = ev.item
        graph.setItemState(edge, 'hover', false)
        graph.updateItem(edge, {
          label: '',
          img: 'image/screen/power/ico_zcp.png'
        })
      })
    },
    // 设置画布居中
    setGraphSzie(topoGraph) {
      const width = topoGraph.get('width')
      const height = topoGraph.get('height')
      const group = topoGraph.get('group')
      group.resetMatrix()
      const bbox = group.getCanvasBBox()

      if (bbox.width === 0 || bbox.height === 0) return
      const viewCenter = {
        x: width / 2,
        y: height / 2
      }

      const groupCenter = {
        x: bbox.x + bbox.width / 2,
        y: bbox.y + bbox.height / 2
      }
      topoGraph.translate(viewCenter.x - groupCenter.x, viewCenter.y - groupCenter.y)
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/views/screen/power/componentallstyle/center-device-gview.scss';
</style>

