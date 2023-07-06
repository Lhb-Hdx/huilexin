<template>
  <dv-full-screen-container>
    <div class="video" :class="onFullScreenMonitor && onFullScreenMonitor.isFullScreen ? 'full-screen-live' : ''">
      <div class="video-header">
        <div class="header-title">数据中心机房监控管理</div>
        <!-- <div class="header-left-btn pointer flex-v-between">
          <span>中心医院数据机房</span>
          <i class="el-icon-caret-right" />
        </div> -->
        <div class="header-right flex-v-between">
          <div ref="fullScreen" class="right-btn" @click="openfullScreen">视频监控</div>
          <div class="right-date">
            {{ time }}
          </div>
        </div>
      </div>

      <div class="video-content">
        <div class="content-left">
          <div class="switchTabs">
            <div class="SeletedTab" :class="{ isSelected: isAuto }" @click="changeSelected(0)">自动切换</div>
            <div class="SeletedTab" :class="{ isSelected: isManul }" @click="changeSelected(1)">手动切换</div>
          </div>
          <ul class="videoTypeList">
            <li v-for="(item, index) in videoGroup" :key="item.id" class="videoTypeItem" :class="{ active: index === countIndex }" @click="prePollingVideoGroup(item,index)">
              {{ item.name }}
            </li>
          </ul>
        </div>
        <div class="content-center">
          <div ref="liveVideo" class="liveVideoList" :class="onFullScreenMonitor && onFullScreenMonitor.isFullScreen ? 'full-screen-live' : ''">
            <!-- <div v-for="(item, index) in 4" :key="index" class="liveVideoItem">
              <div v-if="isHasChildren(index, 'cid')" class="isShow">
                <div class="livePlayer-wrap">
                  <LivePlayerContent :cid="isHasChildren(index, 'cid') + ''" :close-video-dialog-key="closeVideoDialogKey" :is-controlling="false" :options="isHasChildren(index, 'options')" />
                </div>
                <div class="message-box">
                  <div class="dvr-message">{{ isHasChildren(index, 'title') }}({{ isHasChildren(index, 'ip') }})</div>
                </div>
              </div>
              <div class="corner" />
              <div class="corner2" />
            </div> -->
            <div
              v-for="(item, index) in videoDivs.slice(0, videoDisplayType)"
              :id="item.id"
              :key="item.id"
              class="liveVideoItem"
              :style="{'height': setMonitorHeight(index, item), 'width': setMonitorWidth(index, item)}"
              draggable="true"
              @dragstart="handleDragVideoDivStart($event, item)"
              @dragover.prevent="handleDragVideoDivOver($event, item)"
              @dragenter="handleDragVideoDivEnter($event, item)"
              @dragend="handleDragVideoDivEnd($event, item)"
              @click="handleVideoDiv(item, index)"
              @drop="dropChnItemInVideoDiv($event, index)"
            >
              <div class="aspectration">
                <!-- <div v-if="!item.videoOptions">
                  <div
                    class="no-video"
                    :class="handleItemIndex === index ? 'active-div' : ''"
                  >
                    <img style="width:101px; height:99px" src="image/video/bg_video.png" alt="">
                    <div class="hint-text">请选择视频</div>
                  </div>
                </div> -->
                <div v-if="item.videoOptions" class="video-playing livePlayer-wrap ">
                  <live-player-content
                    v-if="item.videoOptions"
                    :re-init-key="reInitKey"
                    :assign-re-init-key-cids="assignReInitKeyCids"
                    :options="item.videoOptions"
                    :can-control="true"
                    :cid="item.using+''"
                    :group-polling-time="pollingTime"
                    :is-group="true"
                    :show-message-tip="false"
                    @fullScreenMonitor="fullScreenMonitor"
                    @closeMonitor="closeMonitor"
                  />
                  <div class="playerBox">
                    <div class="subtitle">  {{ item.videoOptions.title }} ( {{ item.videoOptions.ip }} )</div>
                  </div>
                </div>

              </div>
              <div class="corner" />
              <div class="corner2" />
            </div>
          </div>
        </div>
        <div class="content-right">
          <div class="device-count">
            <VideoTitle title="设备数量" />
            <div class="circle-count">
              <dv-digital-flop :config="config" style="width: 200px; height: 50px" />
            </div>
          </div>
          <div class="device-online">
            <VideoTitle title="设备在线率" />
            <div class="circle-percent">
              <!-- <dv-active-ring-chart :config="config2" style="width:150px;height:150px; " /> -->
              <!-- <el-progress type="circle" :percentage="onlineDevicePercent()" color="green" :stroke-width="8" style="font-size:18px;" :width="90" /> -->
              <CircleCharts :percent-data="onlineDevicePercent()" />
            </div>
          </div>
          <div class="storage-space">
            <VideoTitle title="存储空间" />
            <div class="memory-list">
              <div v-for="item in gatewayList" :key="item.id" class="memory-list-item">
                <div class="storage-des">
                  <div class="disk-name">{{ item.name }}</div>
                </div>
                <div v-for="item2 in item.children" :key="item2.disId" class="gatewayChildren">
                  <div>
                    <div class="titleAndPercent">
                      <div class="title">存储磁盘:&emsp;{{ item2.name }}</div>
                      <div class="disk-percent" style="color: white">{{ getDiskPercent(item2) }}%</div>
                    </div>
                    <div class="percentPond-wrap">
                      <PercentPond :percent-data="getDiskPercentPond(item2)" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="cpu-performance">
            <VideoTitle title="CPU" />
            <div class="percent-and-count">
              <PercentPond :percent-data="cpu" />
              <div class="count-wrap">
                <dv-digital-flop :config="config4" style="width: 100%; height: 50px" />
              </div>
            </div>
          </div>
          <div class="memory-performance">
            <VideoTitle title="内存" />
            <div class="percent-and-count">
              <PercentPond :percent-data="memory" />
              <div class="count-wrap">
                <dv-digital-flop :config="config5" style="width: 100%; height: 50px" />
              </div>
              <!-- <MemoryPerformance :memory="memory" /> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </dv-full-screen-container>
</template>

<script>
import VideoTitle from './componets/title'
import PercentPond from './componets/percent-pond'
import CircleCharts from './componets/circle-charts.vue'
import request from '@/utils/request'
import { isBrowserFullScreen, guid } from '@/utils/utils'
import api from '@/api/api'
import * as echarts from 'echarts'
import LivePlayerContent from '@/views/video/components/player-content/live-player-content'
import { getUserSession } from '@/utils/auth'
import * as _ from 'lodash'
export default {
  name: 'VideoScreenIndex',
  components: {
    VideoTitle,
    PercentPond,
    LivePlayerContent,
    CircleCharts
  },
  data() {
    return {
      rightBtnList: [
        // { name: '动环信息', type: 0 },
        { name: '数控管理', type: 0 }
        // { name: '视频监控', type: 1 },
        // { name: 'IT监控', type: 2 }
      ],
      pollingTime: 10,
      assignReInitKeyCids: [], // 制定要重新初始化的通道
      videoDivs: [], // 所有监控格子数据
      videoDisplayType: 4, // 监控排版格子
      gatewayList: [],
      findVideoGatewayQuery: {
        // 存储网关列表查询参数
        page: 1,
        limit: -1
      },
      //
      clientList: [],
      isBrowserFullScreen: false,
      cpu: {}, // cpu
      memory: {}, // 内存
      memTotal: 0, // 总内存
      memUnit: '', // 内存单位
      lastTime: 30000, // 推迟时间
      startTime: new Date().getTime(), // 开始时间
      getDataInterval: null, // 获取统计图数据的定时器
      cpuColor: ['#87DEAF', '#3ba9ed'],
      memColor: ['#87DEAF', '#3ba9ed'],
      //
      countIndex: 0,
      onFullScreenMonitor: {},
      chnIndex: 0,
      manulChnIndex: 0,
      timer: '',
      closeVideoDialogKey: false,
      videoOptions: {},
      cid: '',
      time: this.$tool.getNowDate(''),
      config: {
        number: [100],
        content: '{nt}',
        style: {
          fill: '#fff',
          shadowColor: '#fff',
          shadowBlur: 10,
          fontSize: 30,
          fontFamily: 'sans-serif'
        }
      },
      config4: {
        number: [0],
        toFixed: 2,
        content: '{nt}%',
        style: {
          fill: '#fff',
          fontSize: 30,
          shadowColor: '#fff',
          shadowBlur: 10,
          fontFamily: 'sans-serif'
        }
      },
      config5: {
        number: [0],
        toFixed: 2,
        content: '{nt}%',
        style: {
          fill: '#fff',
          fontSize: 30,
          shadowColor: '#fff',
          shadowBlur: 10,
          fontFamily: 'sans-serif'
        }
      },
      isAuto: true,
      isManul: false,
      getChnCurrentItemErrorCount: 0,
      listTotal: 1,
      videoGroup: [], // 分组列表
      findVideoGroupQuery: {
        name: '',
        page: 1,
        limit: 10
      }, // 查询视频分组的条件
      isInstallVCLPlugin: false,
      reInitKey: '', // 重新初始化key
      userSession: getUserSession(),
      videoTimer: null,
      newPollingTimer: null,
      newManulPollingTimer: null,
      onlineCount: 0,
      offlineCount: 0,
      endAutoPollingFlag: false,
      endManulPollingFlag: false,
      groupPollingData: {}, // 当前分组轮询数据
      allGroupPollingChnData: [], // 所有分组通道数据
      firstDivWidth: '0px',
      firstDivHeight: '0px',
      handleItemIndex: '',
      countCloseNum: 0 // 关闭窗口机会
    }
  },

  computed: {
    isHasChildren() {
      return function(index, props) {
        if (!this.videoGroup[this.countIndex]) return false
        // if (!this.videoGroup[this.countIndex].children[index]) return 0
        if (!this.videoGroup[this.countIndex].children[index][`${props}`]) return
        return this.videoGroup[this.countIndex].children[index][`${props}`]
      }
    },
    setMonitorWidth() {
      return function(divIndex, item) {
        return item.width
      }
    },
    setMonitorHeight() {
      return function(divIndex, item) {
        return item.height
      }
    },
    getClientName() {
      return function(cid) {
        const clientIdx = this.clientList.findIndex(item => item.clientId === cid)
        if (clientIdx !== -1) {
          return this.clientList[clientIdx].name
        }
      }
    },
    onlineDevicePercent() {
      return function name(params) {
        if (this.onlineCount && this.deviceCount) {
          return Number(((this.onlineCount / this.deviceCount) * 100).toFixed(2))
        } else {
          return 0
        }
      }
    },
    // 获取网关硬盘使用率
    getDiskPercent() {
      return function(disObj) {
        return (((disObj.totalDiskSize - disObj.freeDiskSize) / disObj.totalDiskSize) * 100).toFixed(2)
      }
    },
    getDiskPercentPond() {
      return function(diskObj) {
        let usedDiskSize = diskObj.totalDiskSize - diskObj.freeDiskSize
        const percentObj = {
          data: usedDiskSize,
          max: diskObj.totalDiskSize
        }
        return percentObj
      }
    }
  },
  watch: {

  },
  async created() {
    this.getTime()
    // 查找视频组屏数据列表
    await this.findVideoGroup()
    // 查找
    this.findVideoGateway()
    this.getVideoBindWidthRealTime()
  },
  mounted() {
    const that = this
    window.onresize = function() {
      that.isBrowserFullScreen = isBrowserFullScreen()
    }
    // 模拟F11全屏
    this.$nextTick(() => {
      this.$tool.ADCfullScreen()
      this.initVideoDivs()
    })
  },
  beforeDestroy() {
    this.endAutoPollingFlag = true
    this.endManulPollingFlag = true
    clearInterval(this.timer)
    clearInterval(this.videoTimer)
    clearInterval(this.newPollingTimer)
    clearTimeout(this.newManulPollingTimer)
    clearInterval(this.getDataInterval)
  },
  methods: {
    // 初始化视频格子
    initVideoDivs() {
      const videoDivs = []
      for (let i = 1; i <= 4; i++) {
        videoDivs.push({
          id: i, // 格子id
          text: i, // 格子text
          using: 0, // 格子是否被占用
          videoOptions: '' // 格子中视频资源参数
        })
      }
      this.videoDivs = [...videoDivs]
      // this.switchType(4)
    },
    // 选择布局
    async switchType(e, isClickSwitch) {
      let row = 1
      if (e === 1) {
        row = 1
      } else if (e === 4) {
        row = 2
      } else if (e === 6 || e === 9) {
        row = 3
      }
      // this.setVideoHeight(e, row)
      if (isClickSwitch && this.isInstallVCLPlugin) this.reInitKey = guid()
      /*
      播放分组时切换布局，多切少，就把多余的格子未播放完的通道重新加到播放队列，少切多，把空余的补上
       */
      const oldVideoDisplayType = this.videoDisplayType // 记录修改前的布局个数
      this.videoDisplayType = e
      // this.localStorageOperation('set', 'videoDisplayType', e)
      if (oldVideoDisplayType > e) { // 多切少
        const sliceDiv = this.videoDivs.slice(row, this.videoDivs.length) // 多余的格子
        const reAddChnPlayQueueStorage = []
        sliceDiv.forEach(async sliceDivItem => {
          // 存在通道数据 并且是分组通道
          if (sliceDivItem.videoOptions !== '' && sliceDivItem.videoOptions.isGroup) {
            // 重新加入回播放队列
            const groupChnIdx = this.allGroupPollingChnData.findIndex(groupChnItem => Number(groupChnItem.cid) === Number(sliceDivItem.videoOptions.cid))
            if (groupChnIdx !== -1) {
              await this.deletePlayerDiv('id', this.allGroupPollingChnData[groupChnIdx].cid)
              this.$set(this.groupPollingData.children, this.groupPollingData.children.length, this.allGroupPollingChnData[groupChnIdx])
              reAddChnPlayQueueStorage.push(this.allGroupPollingChnData[groupChnIdx])
            }
          }
        })
      } else if (oldVideoDisplayType < e) { // 少切多
        if (this.groupPollingData.children && this.groupPollingData.children.length > 0) { // 如果队列还有通道
          this.pollingPlay()
        }
      }
    },
    // 适应播放器宽高
    setVideoHeight(e, row) {
      const getVideoContainer = this.getVideoContainer()
      // const videoHeight = (getVideoContainer.liveHeight / row) - (5 * row)
      // const videoWidth = ((videoHeight / 9) * 16)
      const videoWidth = ((getVideoContainer.liveWidth - 15) / row) - (5 * row)
      const videoHeight = (videoWidth / 16) * 9
      this.warpWidth = `${Math.ceil((videoWidth * row) + (row * 10))}px`
      this.warpHeight = `${(videoHeight * row) + (row * 10)}px`
      if (e !== 6) {
        this.firstDivHeight = `${videoHeight}px`
        this.firstDivWidth = `${videoWidth}px`
        for (let i = 0; i < this.videoDivs.slice(0, e).length; i++) {
          this.$set(this.videoDivs[i], 'height', `${videoHeight}px`)
          this.$set(this.videoDivs[i], 'width', `${videoWidth}px`)
        }
      } else {
        for (let k = 0; k < this.videoDivs.slice(0, e).length; k++) {
          if (k === 0) {
            this.firstDivHeight = `${(videoHeight * 2) + 6}px`
            this.firstDivWidth = `${(videoWidth * 2) + 10}px`
          }
          this.$set(this.videoDivs[k], 'height', `${videoHeight}px`)
          this.$set(this.videoDivs[k], 'width', `${videoWidth}px`)
        }
      }
    },
    closeMonitor(item) {
      console.log(item)
      console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq')
      // this.autoPollingVideoGroup
      console.log(this.videoDivs)
      const idx = this.videoDivs.findIndex(v => Number(v.using) === Number(item.cid))
      console.log(idx)
      console.log(this.pollingChnData.length)
      console.log(this.countCloseNum)
      if (idx !== -1) {
        this.$set(this.videoDivs[idx], 'videoOptions', '')
        this.$set(this.videoDivs[idx], 'using', '')
        this.countCloseNum -= 1
      }
      console.log(this.countCloseNum, '  console.log(this.countCloseNum)')
      if (this.countCloseNum === 0) {
        // this.videoDivs.forEach((divItem, divIndex) => {
        //   this.$set(this.videoDivs[divIndex], 'videoOptions', '')
        //   this.$set(this.videoDivs[divIndex], 'using', '')
        // })
        // 手动还是自动
        if (this.isAuto) {
          if (this.pollingChnData.length > 0) {
            const chnData = this.$tool.deepCopy(this.pollingChnData)
            console.log(chnData)
            this.pollingHandle(chnData)
          } else {
            this.countIndex += 1
            this.autoPollingVideoGroup()
          }
        } else {
          console.log(this.pollingChnData)
          if (this.pollingChnData.length > 0) {
            const manulChnData = this.$tool.deepCopy(this.pollingChnData)
            console.log(manulChnData)
            this.handleManulPolling(manulChnData)
          } else {
            // this.countIndex += 1
            console.log(111111111111)
            this.manulPollingVideoGroup(this.videoGroup[this.countIndex])
          }
        }
      }
      // else {
      //   this.countIndex += 1
      //   this.autoPollingVideoGroup()
      // }
    },
    // 获取界面宽高
    getVideoContainer() {
      return this.$nextTick(() => {
        const liveWidth = this.$refs.liveVideo.clientWidth
        const liveHeight = this.$refs.liveVideo.clientHeight
        return { liveWidth, liveHeight }
      })
    },
    async findVideoGateway() {
      const { code, data } = await request({
        url: api.video.findVideoGateway,
        data: {}
      })
      if (code === 1) this.clientList = data
    },
    getVideoBindWidthRealTime() {
      // 获取网关设备带宽/内存/cpu使用情况
      const _this = this
      _this.getCpuAndMemoryData()
      _this.getVideoDvrDetail() // 设备在线
      _this.getVideoGateway()
      _this.getDataInterval = setInterval(function() {
        const nowTime = new Date().getTime() // 当前毫秒
        if (nowTime > _this.startTime + _this.lastTime) {
          // 当前时间毫秒数大于设定的时间毫秒数则删除所有图表数据数组第一个
          // 删除带宽流量数据第一个

          // 删除各个网关CPU数据第一个
          for (let i = 0; i < _this.cpu.length; i++) {
            _this.cpu[i].data.shift()
          }
          // 删除各个网关内存数据第一个
          for (let i = 0; i < _this.memory.length; i++) {
            _this.memory[i].data.shift()
          }
        }
        // CPU和内存信息
        _this.getCpuAndMemoryData()
        _this.getVideoDvrDetail() // 设备在线
        _this.getVideoGateway() // 网关存储
      }, 8000)
    },
    async getCpuAndMemoryData() {
      await request({
        url: api.video.getVideoBindWidthRealTime,
        data: {}
      }).then(res => {
        if (res.code === 1) {
          res.data.forEach(item => {
            const ctime = item.ctime.split(' ')[1]
            const systemCpu = item.systemCpu
            this.cpu = {
              ctime: ctime,
              data: systemCpu.toFixed(2),
              max: 100
            }

            this.config4 = {
              ...this.config4,
              number: [Number(systemCpu.toFixed(2))]
            }

            this.memory = {
              ctime: ctime,
              data: item.memUsed.toFixed(2),
              max: item.memTotal
            }

            this.config5 = {
              ...this.config5,
              number: [Number(((item.memUsed / item.memTotal) * 100).toFixed(2))]
            }
          })
        }
      })
    },
    async getVideoDvrDetail() {
      // 获取在线离线
      return await request({
        url: api.video.getVideoDvrDetail,
        data: {}
      }).then(res => {
        if (res.code === 1) {
          // const onlineData = [
          //   { value: res.model.onlineCount, name: '在线设备' },
          //   { value: res.model.offlineCount, name: '离线设备' }
          // ]
          // this.getOnline(onlineData)
          // this.config = Object.assign({}, { number: res.model.deviceCount, ...this.config })
          // this.config.number.splice(0, 1, res.model.deviceCount)
          this.config = { ...this.config, number: [res.model.deviceCount] }
          this.onlineCount = res.model.onlineCount
          this.offlineCount = res.model.offlineCount
          this.deviceCount = res.model.deviceCount
        }
      })
    },
    getOnline(data) {
      // 设备在线离线统计
      var option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          bottom: 1,
          fontSize: '10',
          data: ['在线设备', '离线设备']
        },
        series: [
          {
            name: '设备在线/离线统计',
            type: 'pie',
            radius: ['50%', '70%'],
            label: {
              formatter: '{b}: {c}'
            },
            labelLine: {
              show: true
            },
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              },
              normal: {
                color: function(params) {
                  // 自定义颜色
                  var colorList = ['rgb(0, 178, 133)', 'red']
                  return colorList[params.dataIndex]
                }
              }
            },
            data: data
          }
        ]
      }
      const self = this
      const myChart = echarts.init(self.$refs['online'], 'light')
      myChart.setOption(option, true)
    },
    // 获取分组
    async findVideoGroup() {
      const { data, code, count } = await request({
        url: api.video.findVideoGroup,
        data: { ...this.findVideoGroupQuery, userId: this.userSession.userId }
      })
      if (code !== 1) return
      if (data.length > 0) {
        data.forEach(item => {
          item.children = []
        })
        this.videoGroup = data
        this.autoPollingVideoGroup()
        // // 新
        // data.forEach((item, index) => {
        //   this.pollingVideoGroup(item.id, index)
        // })
        this.listTotal = Number(count)
      }
    },

    // 根据groupId来展示摄像头数据
    async autoPollingVideoGroup() {
      if (this.endAutoPollingFlag) return
      if (this.countIndex === this.videoGroup.length) {
        this.countIndex = 0
      }
      if (!this.videoGroup.length) return
      const { code, data } = await this.findVideoGroupChannel({
        groupId: this.videoGroup[this.countIndex].id,
        page: 1,
        limit: -1
      })
      if (data.length === 0) {
        this.countIndex += 1
        this.autoPollingVideoGroup()
        return
      }
      console.log('11')
      if (code !== 1) return
      const cIds = []
      const dvrIds = []
      // let cData = null
      // let dData = null
      if (data.length > 0) {
        // 存储分组关联dvrid和通道id

        // let fourData = null
        data.forEach(item => {
          cIds.push(item.channelId)
          dvrIds.push(item.dvrId)
        })
        // 分组通道信息
        const { code: chnCode, data: chnData } = await this.findVideoChn({
          ids: cIds.toString(),
          page: 1,
          limit: -1
        })
        // 没有通道就下一个分组
        if (chnData.length === 0) {
          this.countIndex += 1
          this.autoPollingVideoGroup()
          return
        }
        if (chnCode !== 1) return
        if (!chnData) return

        //  通道播放设备信息
        const { code: dvrCode, data: dvrData } = await this.findVideoDvr(dvrIds)
        if (dvrCode !== 1) return
        if (!dvrData) return
        chnData.forEach(videoChnResItem => {
          const idx = dvrData.findIndex(videoDvrResItem => videoDvrResItem.dvrId === videoChnResItem.dvrId)
          if (idx !== -1) {
            videoChnResItem.beDvr = Object.assign({}, dvrData[idx])
            videoChnResItem.title = dvrData[idx].title
            videoChnResItem.ip = dvrData[idx].ip
          }
        })

        // if(this.chnIndex)
        console.log(...chnData)
        console.log(this.videoGroup)
        this.videoGroup[this.countIndex].children = [...chnData]
        this.pollingTime = this.videoGroup[this.countIndex].pollingTime
        const pollingChnData = this.$tool.deepCopy(chnData)
        this.pollingChnData = pollingChnData
        // const ids = []
        // pollingChnData.forEach(item => {
        //   ids.push(item.cid)
        // })
        // console.log(ids)
        this.pollingHandle(pollingChnData)
        console.log(chnData)
      }
      //  else {
      //   this.countIndex += 1
      //   this.autoPollingVideoGroup()
      // }
    },
    // 手动
    async manulPollingVideoGroup(item) {
      this.countCloseNum = 0
      const { code, data } = await this.findVideoGroupChannel({
        groupId: item.id,
        page: 1,
        limit: -1
      })
      if (data.length === 0) {
        this.videoDivs.forEach((divItem, divIndex) => {
          this.$set(this.videoDivs[divIndex], 'videoOptions', '')
          this.$set(this.videoDivs[divIndex], 'using', '')
        })
        this.$message({type: 'error', message: '该分组没有数据'})
        return
      }
      if (code !== 1) return
      const cIds = []
      const dvrIds = []
      // let cData = null
      // let dData = null

      if (data.length > 0) {
        // 存储分组关联dvrid和通道id

        // let fourData = null
        data.forEach(item => {
          cIds.push(item.channelId)
          dvrIds.push(item.dvrId)
        })
        // 分组通道信息
        const { code: chnCode, data: chnData } = await this.findVideoChn({
          ids: cIds.toString(),
          page: 1,
          limit: -1
        })
        if (chnCode !== 1) return
        if (!chnData) return

        //  通道播放设备信息
        const { code: dvrCode, data: dvrData } = await this.findVideoDvr(dvrIds)
        if (dvrCode !== 1) return
        if (!dvrData) return
        chnData.forEach(videoChnResItem => {
          const idx = dvrData.findIndex(videoDvrResItem => videoDvrResItem.dvrId === videoChnResItem.dvrId)
          if (idx !== -1) {
            videoChnResItem.beDvr = Object.assign({}, dvrData[idx])
            videoChnResItem.title = dvrData[idx].title
            videoChnResItem.ip = dvrData[idx].ip
          }
        })
        // if(this.chnIndex)

        this.pollingTime = this.videoGroup[this.countIndex].pollingTime
        const pollingChnData = this.$tool.deepCopy(chnData)
        this.pollingChnData = pollingChnData
        this.videoGroup[this.countIndex].children = [...chnData]

        this.videoDivs.forEach((divItem, divIndex) => {
          this.$set(this.videoDivs[divIndex], 'videoOptions', '')
          this.$set(this.videoDivs[divIndex], 'using', '')
        })
        this.handleManulPolling(pollingChnData)
      }
    },
    // 根据groupId来展示摄像头数据
    async pollingVideoGroup() {
      const { code, data } = await this.findVideoGroupChannel({
        groupId: this.videoGroup[this.countIndex].id,
        page: 1,
        limit: -1
      })
      if (code !== 1) return
      if (data.length > 0) {
        // 存储分组关联dvrid和通道id
        const cIds = []
        const dvrIds = []
        let cData = null
        let dData = null

        // let fourData = null
        data.forEach(item => {
          cIds.push(item.channelId)
          dvrIds.push(item.dvrId)
        })
        const { code: chnCode, data: chnData } = await this.findVideoChn({
          ids: cIds.toString(),
          page: 1,
          limit: -1
        })
        if (chnCode !== 1) return
        if (!chnData) return
        cData = data.map(item => {
          chnData.forEach(item2 => {
            if (item.channelId === item2.cid) {
              item.cname = item2.cname
            }
          })
          return item
        })
        const { code: dvrCode, data: dvrData } = await this.findVideoDvr(dvrIds)
        if (dvrCode !== 1) return
        if (!dvrData) return
        dData = cData.map(item => {
          dvrData.forEach(item2 => {
            if (item.dvrId === item2.dvrId) {
              item.ip = item2.ip
              item.title = item2.title
            }
          })
          return item
        })

        for (let index = 0; index < dData.length; index++) {
          const videoOptions = await this.getLivePlayerOption(dData[index].channelId)

          if (videoOptions) {
            dData[index] = {
              ...dData[index],
              options: {
                ...videoOptions,
                beDvr: { title: dData[index].title }
              }
            }
          }
        }

        if (data.length >= 4) {
          let videoArr = _.cloneDeep(dData)
          let backupArr = _.cloneDeep(dData)
          // 4个4个切割
          let spliceArr = videoArr.splice(0, 4)
          this.$set(this.videoGroup[this.countIndex], 'children', spliceArr)
          this.newManulPollingTimer = setInterval(() => {
            // 如果剩下还超过或者等于4个

            if (videoArr.length >= 4) {
              spliceArr = videoArr.slice(0, 4)
              videoArr = videoArr.slice(4, videoArr.length)
              this.$set(this.videoGroup[this.countIndex], 'children', spliceArr)
            } else if (videoArr.length > 0 && videoArr.length < 4) {
              // 切割下来的数组小于4等于0直接赋值
              this.$set(this.videoGroup[this.countIndex], 'children', videoArr)
              videoArr = backupArr
            }
          }, this.videoGroup[this.countIndex].pollingTime * 1000)
        } else if (data.length > 0 && data.length < 4) {
          this.$set(this.videoGroup[this.countIndex], 'children', dData)
        }
      } else {
        return this.$message({ type: 'warning', message: '无数据' })
      }
    },
    async pollingHandle(chnData) {
      if (this.endAutoPollingFlag) return
      const channelData = [...chnData]
      console.log(channelData)
      console.log(11111111111111111111111111111111111111111)
      const getSysDictionaryDetailRes = await this.getSysDictionaryDetail(channelData[this.chnIndex].beDvr.devTypeId)
      console.log(getSysDictionaryDetailRes)
      const isStream = getSysDictionaryDetailRes || 1
      const videoOptions = await this.getLivePlayerOption(channelData[this.chnIndex].cid, isStream)
      if (videoOptions) {
        videoOptions.cid = channelData[this.chnIndex].cid // 通道id
        videoOptions.cname = channelData[this.chnIndex].cname // 通道名称
        videoOptions.ip = channelData[this.chnIndex].ip // 通道IP
        videoOptions.title = channelData[this.chnIndex].title // 通道title
        videoOptions.inReplaceOver = true
        videoOptions.beDvr = channelData[this.chnIndex].beDvr // 通道所属dvr
        console.log(videoOptions)
        console.log(channelData[this.chnIndex])
        this.$set(this.videoDivs[this.chnIndex], 'videoOptions', { isRequestLoadSuccess: true, ...videoOptions })
        // this.$set(this.videoDivs[this.chnIndex], 'cid', channelData[this.chnIndex].cid)
        this.$set(this.videoDivs[this.chnIndex], 'using', String(channelData[this.chnIndex].cid))
        this.countCloseNum += 1
        console.log(this.videoDivs)
      }
      // console.log(this.chnIndex)
      // console.log(channelData.length - 1)
      // 当索引比三小，通道数比三大
      if (this.chnIndex < 3 && this.chnIndex < channelData.length - 1) {
        this.chnIndex = this.chnIndex + 1
        // if (this.chnIndex < channelData.length - 1) {
        this.pollingHandle(channelData)
        // }
      } else if (this.chnIndex >= 3 && this.chnIndex < channelData.length - 1) {
        // 当索引比三大，通道数三大
        const spliceData = this.$tool.deepCopy(channelData)
        this.chnIndex = 0
        this.pollingChnData = spliceData.splice(4, spliceData.length)
        console.log(this.pollingChnData)
        console.log(channelData)
        console.log('ggggggggggggggggggggggggggggggggggggggg')
      } else if (this.chnIndex < 3 && this.chnIndex >= channelData.length - 1) {
        // 当索引比三小，通道数比三小
        console.log(11111)
        // 没有剩余的轮询通道
        this.pollingChnData = []
        this.chnIndex = 0
      }
      //  else {
      //   this.chnIndex = this.chnIndex + 1
      //   if (this.chnIndex < channelData.length) {
      //     this.handlePolling(channelData)
      //   }
      // }
    },

    async handleManulPolling(chnData) {
      if (this.endManulPollingFlag) return
      const channelData = [...chnData]
      const getSysDictionaryDetailRes = await this.getSysDictionaryDetail(channelData[this.manulChnIndex].beDvr.devTypeId)
      const isStream = getSysDictionaryDetailRes || 1
      const videoOptions = await this.getLive(channelData[this.manulChnIndex].cid, isStream)
      if (videoOptions) {
        videoOptions.cid = channelData[this.manulChnIndex].cid // 通道id
        videoOptions.cname = channelData[this.manulChnIndex].cname // 通道名称
        videoOptions.ip = channelData[this.manulChnIndex].ip // 通道IP
        videoOptions.title = channelData[this.manulChnIndex].title // 通道title
        videoOptions.inReplaceOver = true
        videoOptions.beDvr = channelData[this.manulChnIndex].beDvr // 通道所属dvr
        console.log(videoOptions)
        console.log(channelData[this.manulChnIndex])
        this.$set(this.videoDivs[this.manulChnIndex], 'videoOptions', { isRequestLoadSuccess: true, ...videoOptions })
        // this.$set(this.videoDivs[this.chnIndex], 'cid', channelData[this.chnIndex].cid)
        this.$set(this.videoDivs[this.manulChnIndex], 'using', String(channelData[this.manulChnIndex].cid))
        this.countCloseNum += 1
        console.log(this.videoDivs)
        console.log(this.countCloseNum)
      }
      // console.log(this.chnIndex)
      // console.log(channelData.length - 1)
      // 当索引比三小，通道数比三大
      if (this.manulChnIndex < 3 && this.manulChnIndex < channelData.length - 1) {
        this.manulChnIndex = this.manulChnIndex + 1
        // if (this.chnIndex < channelData.length - 1) {
        this.handleManulPolling(channelData)
        // }
      } else if (this.manulChnIndex >= 3 && this.manulChnIndex < channelData.length - 1) {
        // 当索引比三大，通道数三大
        const spliceData = this.$tool.deepCopy(channelData)
        this.manulChnIndex = 0
        this.pollingChnData = spliceData.splice(4, spliceData.length)
        console.log(this.pollingChnData)
        console.log(channelData)
        console.log('ggggggggggggggggggggggggggggggggggggggg')
      } else if (this.manulChnIndex < 3 && this.manulChnIndex >= channelData.length - 1) {
        // 当索引比三小，通道数比三小
        console.log(11111)
        // 没有剩余的轮询通道
        this.pollingChnData = []
        this.manulChnIndex = 0
      }
    },
    prePollingVideoGroup(item, index) {
      if (this.isAuto) {
        this.$message({
          message: '请切换手动模式',
          type: 'warning',
          duration: 1000
        })
        return
      }
      // if (this.newManulPollingTimer) {
      //   clearInterval(this.newManulPollingTimer)
      // }
      this.countIndex = index
      this.manulChnIndex = 0
      this.manulPollingVideoGroup(item)
    },
    // 获取通道
    async findVideoChn(data) {
      return await request({
        url: api.video.findVideoChn,
        data
      }).then(res => {
        if (res.code === 1) {
          return res
        }
      })
    },
    // 获取分组通道
    async findVideoGroupChannel(data) {
      return await request({ url: api.video.findVideoGroupChannel, data }).then(res => {
        if (res.code === 1) {
          return res
        }
      })
    },
    // 获取存储网关
    async getVideoGateway() {
      // 获取存储网关
      await request({
        url: api.video.findVideoGateway,
        data: this.findVideoGatewayQuery
      }).then(async res => {
        if (res.code === 1) {
          let { data: pdata } = res
          // this.gatewayList = res.data
          // if (res.data.length > 0) {
          //   this.gatewayId = res.data[0].id
          //   this.findVideoChnByGid()
          //   if (this.routerRoles.indexOf('SelectDisk') !== -1) this.findVideoDisk()
          // }
          for (let index = 0; index < res.data.length; index++) {
            const { code, data } = await this.findVideoDisk(pdata[index].id)
            if (code === 1) {
              pdata[index].children = data
            }
          }
          this.gatewayList = pdata
        }
      })
    },
    // 查询存储网关的磁盘
    async findVideoDisk(id) {
      return await request({
        url: api.video.findVideoDisk,
        data: { gid: id, page: 1, limit: -1 }
      })
    },
    // 根据通道ID，获取通道dvr
    async findVideoDvr(ids) {
      return await request({
        url: api.video.findVideoDvr,
        data: { ids: ids.toString(), page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          return res
        }
      })
    },
    // 根据Cid和码流类型获取播放信息
    async getLivePlayerOption(cid, isStream) {
      if (this.endAutoPollingFlag) return
      const { code, map } = await request({
        url: api.video.getLive,
        data: { cid, isStream}
        // data: { cid, isStream: 1 }
      })

      if (code === 1) {
        this.getChnCurrentItemErrorCount = 0
        if (map.mes) {
          // mes.cname = this.videoName
          return map.mes
        } else {
          return null
        }
      } else {
        this.getChnCurrentItemErrorCount++
        if (this.getChnCurrentItemErrorCount < 3) {
          // 三次请求失败后提醒
          this.getLivePlayerOption(cid, isStream)
        } else {
          // this.$message({
          //   message: '请求失败',
          //   type: 'error',
          //   duration: 5 * 1000
          // })
          this.getChnCurrentItemErrorCount = 0
          return false
        }
      }
    },
    // 根据Cid和码流类型获取播放信息
    async getLive(cid, isStream) {
      // if (this.endAutoPollingFlag) return
      if (this.endManulPollingFlag) return
      const { code, map } = await request({
        url: api.video.getLive,
        data: { cid, isStream}
        // data: { cid, isStream: 1 }
      })

      if (code === 1) {
        this.getChnCurrentItemErrorCount = 0
        if (map.mes) {
          // mes.cname = this.videoName
          return map.mes
        } else {
          return null
        }
      } else {
        this.getChnCurrentItemErrorCount++
        if (this.getChnCurrentItemErrorCount < 3) {
          // 三次请求失败后提醒
          this.getLive(cid, isStream)
        } else {
          // this.$message({
          //   message: '请求失败',
          //   type: 'error',
          //   duration: 5 * 1000
          // })
          this.getChnCurrentItemErrorCount = 0
          return false
        }
      }
    },
    // 查询视频设备类型字典判断是否是海康或者是宇视 海康首次默认使用主码流 宇视首次默认使用子码流
    async getSysDictionaryDetail(id) {
      return new Promise(resolve => {
        request({
          url: api.common.getSysDictionaryDetail, data: { id }
        }).then(res => {
          if (res.code === 1) {
            if (res.model.dictdataName.indexOf('海康') !== -1) {
              resolve(1)
            } else if (res.model.dictdataName.indexOf('宇视') !== -1) {
              resolve(2)
            } else {
              resolve(null)
            }
          }
        })
      })
    },
    getTime() {
      this.timer = setInterval(() => {
        this.time = this.$tool.getNowDate('')
      }, 1000)
    },
    changeSelected(flag) {
      // flag 0为在自动，1为手动
      this.countCloseNum = 0
      console.log(this.countCloseNum)
      if (flag === 0) {
        // 自动

        this.isAuto = true
        this.isManul = false
        this.endManulPollingFlag = true
        this.endAutoPollingFlag = false
        // if (this.newManulPollingTimer) {
        //   clearInterval(this.newManulPollingTimer)
        // }
        console.log(111111111)
        this.autoPollingVideoGroup()
      } else {
        // 手动
        this.endAutoPollingFlag = true
        this.endManulPollingFlag = false
        // if (this.newPollingTimer) {
        //   clearInterval(this.newPollingTimer)
        // }
        this.isAuto = false
        this.isManul = true
      }
    },
    // 跳转监控
    openfullScreen() {},
    // 开始拖拽窗口
    handleDragVideoDivStart(e, item) {
      this.onStartItem = item
    },
    // 移动窗口
    handleDragVideoDivOver(e) {
      e.dataTransfer.dropEffect = 'move'// e.dataTransfer.dropEffect="move";//在dragenter中针对放置目标来设置!
    },
    handleDragVideoDivEnter(e, item) {
      e.dataTransfer.effectAllowed = 'move'// 为需要移动的元素设置dragstart事件
      this.onMoveItem = item
    },
    // 拖拽窗口结束
    async handleDragVideoDivEnd() {
      if (this.onMoveItem === this.onStartItem) return
      const videoDivs = [...this.videoDivs]
      const videoDivsSrc = videoDivs.indexOf(this.onStartItem)
      const videoDivsDst = videoDivs.indexOf(this.onMoveItem)
      if (this.isInstallVCLPlugin) {
        const dragCids = []
        if (this.onStartItem.videoOptions !== '') dragCids.push(this.onStartItem.using)
        if (this.onMoveItem.videoOptions !== '') dragCids.push(this.onMoveItem.using)
        // this.assignReInitKeyCids = dragCids
        this.reInitKey = guid()
      }
      // 替换
      videoDivs.splice(videoDivsSrc, 1, ...videoDivs.splice(videoDivsDst, 1, videoDivs[videoDivsSrc]))
      this.videoDivs = videoDivs
      // 修改缓存中的位置
      // 如果拖拽的格子没有播放数据，但是目标格子有播放数据，就把拖拽的格子索引给到目标格子
      if (this.onStartItem.videoOptions !== '') {
        // 修改缓存中通道位置
        const onStartItemChnStorage = await this.getLiveStorage(this.onStartItem.videoOptions.isGroup ? 'group' : 'area', 'playQueue', this.onStartItem.videoOptions.cid)
        onStartItemChnStorage.data.divIndex = Number(videoDivsDst)
        await this.setLiveStorage(this.onStartItem.videoOptions.isGroup ? 'group' : 'area', onStartItemChnStorage.data, 'playQueue') // 更新分组缓存
      }
      // 如果目标格子没有播放数据，但是拖拽的格子有播放数据，就把目标格子的索引给到拖拽的格子
      if (this.onMoveItem.videoOptions !== '') {
        // 修改缓存中通道位置
        const onMoveItemChnStorage = await this.getLiveStorage(this.onMoveItem.videoOptions.isGroup ? 'group' : 'area', 'playQueue', this.onMoveItem.videoOptions.cid)
        onMoveItemChnStorage.data.divIndex = Number(videoDivsSrc)
        await this.setLiveStorage(this.onMoveItem.videoOptions.isGroup ? 'group' : 'area', onMoveItemChnStorage.data, 'playQueue') // 更新分组缓存
      }
      this.onStartItem = null
      this.onMoveItem = null
      // this.assignReInitKeyCids = []
      this.reInitKey = ''
    },
    // 选择格子
    handleVideoDiv(item, idx) {
      this.handleItemIndex = idx
    },
    // 拖拽到播放窗口
    async dropChnItemInVideoDiv(e, i) {
      this.dragOverIndex = i
      const getDragChnItem = e.dataTransfer.getData('chn') || this.DataTransfer.getData('chn')
      if (!getDragChnItem) return
      const ChnJson = getDragChnItem ? JSON.parse(getDragChnItem) : null
      if (ChnJson.dataType === 'channel') { // 拖拽区域通道
        const existVideoIndex = this.videoDivs.findIndex((item) => Number(item.using) === ChnJson.cid) // 查询视频列表有没有这个视频
        if (existVideoIndex !== -1) {
          this.$message('该通道已经在播放了!')
        } else {
          const haveRes = await this.haveFreeDiv()
          if (haveRes !== -1) {
            const replaceVideoDiv = { ...this.videoDivs[this.dragOverIndex] }
            const setPlayerDivRes = await this.setPlayerDiv(ChnJson.cid, i, false)
            const getSysDictionaryDetailRes = await this.getSysDictionaryDetail(ChnJson.beDvr.devTypeId)
            const propVal = ChnJson
            propVal.isStream = getSysDictionaryDetailRes || 1
            this.getChnCurrentItem(propVal, setPlayerDivRes, false, replaceVideoDiv.videoOptions)
          } else {
            this.$message('没有空余的格子了')
          }
        }
      } else if (ChnJson.dataType === 'group') { // 拖拽分组
        this.groupClickItem({ ...ChnJson })
      }
      e.dataTransfer.clearData()
      this.DataTransfer.clearData()
    },
    // 监听播放窗口全屏事件
    fullScreenMonitor(val) {
      console.log(4444444)
      console.log(val)
      this.onFullScreenMonitor = val
      if (val.isVlc) {
        this.reInitKey = guid()
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import './utils.scss';
</style>
