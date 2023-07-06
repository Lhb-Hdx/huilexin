<template>
  <dv-full-screen-container class="bg">
    <div class="monitor">
      <ScreenHeader :top-project="agentGroup" :top-project-options="{ key: 'id', value: 'name' }" @handlerTopProject="handlerTopProject" />
      <div ref="monitorContent" class="monitor-content">
        <div id="content">
          <div class="videoside">
            <div class="com_title">
              <span class="span_left">分组查看</span>

              <span class="span_right" style="width: 30%"><router-link :to="{ name: 'Grouping' }">设置</router-link></span>
            </div>
            <div class="btn_screen">
              <a href="" :class="['one', videoDisplayType === 1 ? 'onhover' : '']" @click.prevent="switchType(1, true)">1</a>
              <a href="" :class="['two', videoDisplayType === 4 ? 'onhover' : '']" @click.prevent="switchType(4, true)">4</a>
              <a href="" :class="['three', videoDisplayType === 6 ? 'onhover' : '']" @click.prevent="switchType(6, true)">6</a>
              <a href="" :class="['font', videoDisplayType === 9 ? 'onhover' : '']" @click.prevent="switchType(9, true)">9</a>
              <span class="btn_lx" :class="autoPollingCheck?'btn_lx_checked':''" @click="autoPolling">轮巡</span>
            </div>
            <div class="groupbox">
              <GroupTree ref="GroupTree" :auto-polling-check="autoPollingCheck" @groupClick="groupClick" @chnClick="chnClick" @getGroupData="getGroupData" />
            </div>
          </div>

          <div ref="videoContainerLive" class="videomain" :class="onFullScreenMonitor && onFullScreenMonitor.isFullScreen ? 'full-screen-live' : ''">
            <el-carousel :height="warpHeight" :autoplay="carouselAutoplay" class="carouselWrap" :interval="carouselInterval" arrow="never" style="width: 100%; overflow: hidden;" indicator-position="outside">
              <el-carousel-item v-for="(v, vIndex) in pagingVideoDivs" :key="vIndex" class="carouselItemWrap">
                <div ref="videoWrap" :class="['videos-wrap', currentClass]" :style="{ height: warpHeight, width: warpWidth }">
                  <div v-for="(item, index) in v.slice(0, videoDisplayType)" :key="item.id" class="playbox" :style="{ height: setMonitorHeight(index, item), width: setMonitorWidth(index, item) }">
                    <div class="boxmain" :class="item.videoOptions?'bgUrl':''">

                      <div v-if="!item.videoOptions">
                        <div class="no-video" />
                      </div>

                      <div v-else class="video-playing">
                        <div class="player-wrap">
                          <live-player-content
                            v-if="item.videoOptions"
                            :re-init-key="reInitKey"
                            :assign-re-init-key-cids="assignReInitKeyCids"
                            :options="item.videoOptions"
                            :can-control="true"
                            :cid="item.using"

                            :is-group="item.videoOptions.isGroup"
                            :show-message-tip="true"
                            @closeMonitor="closeMonitor"
                            @fullScreenMonitor="fullScreenMonitor"
                          />
                        </div>
                        <div class="text-wrap">
                          <div>
                            {{ item.videoOptions.cname ||'' }}
                            {{ item.videoOptions.beDvr?`(${item.videoOptions.beDvr.ip})`:'' }}
                          </div>
                          <div>
                            <!-- 下拉 -->
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </el-carousel-item>
            </el-carousel>
          </div>

          <div class="videoside_r">
            <div class="com_title">
              <span class="span_left">资源监控</span>
            </div>
            <div class="echarsbox" style="padding-bottom: 25px">
              <!-- <img src="./images/img_16.png" alt=""> -->
              <CircleCharts style="height: 150px" />
            </div>
            <div class="resmain">
              <div class="resbox">
                <div class="resname">CPU使用率</div>
                <div class="res_box">
                  <!-- <span><img src="./images/img_17.png" alt="" /></span> -->
                  <PercentPond :percent-data="cpu" />
                </div>
              </div>
              <div class="resbox">
                <div class="resname">内存使用率</div>
                <div class="res_box">
                  <!-- <span><img src="./images/img_17.png" alt="" /></span> -->
                  <PercentPond :percent-data="memory" />
                </div>
              </div>
              <div class="resbox storageResBox">
                <div class="resname">存储使用率</div>

                <div v-for="item in gatewayList" :key="item.id" class="resname2">
                  <div class="title">
                    <span>{{ item.name }}</span>
                    <span class="online" :class=" item.status===1?'':'unline'">{{ item.status===1?'在线':'离线' }}</span>
                  </div>

                  <div v-for="v in item.children" :key="v.disId" class="res_box">
                    <!-- <span><img src="./images/img_19.png" alt="" /></span> -->
                    <div class="itemContent">
                      <div class="name" :title="v.name">{{ v.name }}</div>
                      <div class="chart"> <PercentPond :percent-data="getDiskPercentPond(v)" /></div>
                    </div>
                  </div>
                </div>

                <!-- <div class="resname2">
                  <span>hyNvrDeviceClient</span>
                  <span class="unline">离线</span>
                </div>
                <div class="res_box">
                  <span><img src="images/img_20.png" alt="" /></span>
                </div> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </dv-full-screen-container>
</template>

<script>
import screenGlobal from '@/views/screen/mixin/screenGlobal'
import ScreenHeader from '@/views/screen/components/screen-header'
import CircleCharts from './components/circle-charts.vue'
import PercentPond from './components/percent-pond'
import GroupTree from './components/group-tree.vue'
import LivePlayerContent from '@/views/video/components/player-content/live-player-content'
import { localStorageOperation } from '@/utils/browser-storage'
export default {
  name: 'ItMonitorScreen',
  components: {
    ScreenHeader,
    PercentPond,
    LivePlayerContent,
    GroupTree,
    CircleCharts
  },
  mixins: [screenGlobal],
  data() {
    return {
      agentGroup: [],
      carouselAutoplay: false,
      carouselInterval: 0,
      topoInfo: {},
      mapConfig: {},
      mapCombos: [],
      mapEdges: [],
      mapNodes: [],
      videoDisplayType: 4,
      pagingVideoDivs: [],
      videoDivs: [],
      warpWidth: '',
      warpHeight: '',
      reInitKey: '',
      assignReInitKeyCids: [], // 制定要重新初始化的通道
      firstDivWidth: '0px',
      firstDivHeight: '0px',
      pollingTime: 0,
      allGroupPollingChnData: [],
      groupPollingData: '',
      cpu: {},
      memory: {},
      getDataInterval: '',
      gatewayList: [],
      getChnCurrentItemErrorCount: 0,
      onFullScreenMonitor: {},
      autoPollingCheck: false,
      GroupData: '',
      findVideoGatewayQuery: {
        // 存储网关列表查询参数
        page: 1,
        limit: -1
      }
    }
  },
  computed: {
    currentClass() {
      let className = ''
      switch (this.videoDisplayType) {
        case 1:
          className = 'one-block'
          break
        case 4:
          className = 'four-block'
          break
        case 6:
          className = 'six-block'
          break
        case 9:
          className = 'nine-block'
          break
        default:
          break
      }
      return className
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
    },

    setMonitorWidth() {
      return function(divIndex, item) {
        return divIndex === 0 ? this.firstDivWidth : item.width
      }
    },
    setMonitorHeight() {
      return function(divIndex, item) {
        return divIndex === 0 ? this.firstDivHeight : item.height
      }
    }
  },
  mounted() {
    this.$tool.ADCfullScreen()

    this.$nextTick(() => {
      this.$nextTick(() => {
        this.switchType(+localStorageOperation('get', 'videoDisplayType2') || 4)
      })
    })

    this.findHyitAgentGroup()
    this.initVideoDivs()
    this.getVideoBindWidthRealTime()
  },

  beforeDestroy() {
  },
  destroyed() {
    clearInterval(this.getDataInterval)
    // if (this.$tool.isBrowserFullScreen()) {
    //   this.$tool.closeBrowserFullScreen()
    // }
  },
  methods: {

    findHyitAgentGroup() {
      this.$request({
        url: this.api.itAgentGroup.findHyitAgentGroup,
        data: { limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.agentGroup = res.data
        }
      })
    },
    handlerTopProject(val) {
      console.log('handlerTopProject', val)
    },
    getVideoBindWidthRealTime() {
      // 获取网关设备带宽/内存/cpu使用情况
      const _this = this
      _this.getCpuAndMemoryData()
      // _this.getVideoDvrDetail() // 设备在线
      _this.getVideoGateway()
      _this.getDataInterval = setInterval(function() {
        // CPU和内存信息
        _this.getCpuAndMemoryData()
        // _this.getVideoDvrDetail() // 设备在线
        _this.getVideoGateway() // 网关存储
      }, 1000)
    },
    // 获取存储网关
    async getVideoGateway() {
      // 获取存储网关
      await this.$request({
        url: this.api.video.findVideoGateway,
        data: this.findVideoGatewayQuery
      }).then(async res => {
        if (res.code === 1) {
          // let { data: pdata } = res
          // this.gatewayList = res.data
          // if (res.data.length > 0) {
          //   this.gatewayId = res.data[0].id
          //   this.findVideoChnByGid()
          //   if (this.routerRoles.indexOf('SelectDisk') !== -1) this.findVideoDisk()
          // }
          // if (pdata.length > 0) {
          //   const gids = []
          //   pdata.forEach(item => {
          //     gids.push(item.id)
          //   })
          //   this.findVideoDisk(gids)
          // }
          const gids = []
          if (res.data.length > 0) {
            res.data.forEach(item => {
              gids.push(item.id)
              item.children = []
            })
            const {data, code} = await this.findVideoDisk(gids)
            if (code !== -1 && data.length > 0) {
              res.data.forEach(item => {
                data.forEach(v => {
                  if (+v.clientId === +item.id) {
                    item.children.push(v)
                  }
                })
              })
            }
          }

          this.gatewayList = res.data
        }
      })
    },
    // 查询存储网关的磁盘
    async findVideoDisk(gids) {
      return await this.$request({
        url: this.api.video.findVideoDisk,
        data: { gids, limit: -1 }
      })
    },
    async findVideoGatewayDisk(query) {
      return await this.$request({
        url: this.api.video.findVideoGatewayDisk,
        data: { gids: query, limit: -1 }
      })
    },
    getCpuAndMemoryData() {
      this.$request({
        url: this.api.video.getVideoBindWidthRealTime,
        data: {}
      }).then(res => {
        if (res.code === 1) {
          if (res.data.length > 0) {
            res.data.forEach(item => {
              const ctime = item.ctime.split(' ')[1]
              const systemCpu = item.systemCpu
              this.cpu = {
                ctime: ctime,
                data: systemCpu.toFixed(2),
                max: 100
              }

              // this.config4 = {
              //   ...this.config4,
              //   number: [Number(systemCpu.toFixed(2))]
              // }

              this.memory = {
                ctime: ctime,
                data: item.memUsed.toFixed(2),
                max: item.memTotal
              }
            })
          }
        }
      })
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

      //   if (isClickSwitch && this.isInstallVCLPlugin) this.reInitKey = guid()
      /*
      播放分组时切换布局，多切少，就把多余的格子未播放完的通道重新加到播放队列，少切多，把空余的补上
       */
      if (isClickSwitch) {
        this.switchPaginData(e)
      }
      this.$nextTick(() => {
        this.setVideoHeight(e, row)
        // const oldVideoDisplayType = this.videoDisplayType // 记录修改前的布局个数
        this.videoDisplayType = e
        this.localStorageOperation('set', 'videoDisplayType2', e)
      })

      //   if (oldVideoDisplayType > e) { // 多切少
      //     const sliceDiv = this.videoDivs.slice(row, this.videoDivs.length) // 多余的格子
      //     const reAddChnPlayQueueStorage = []
      //     sliceDiv.forEach(async sliceDivItem => {
      //       // 存在通道数据 并且是分组通道
      //       if (sliceDivItem.videoOptions !== '' && sliceDivItem.videoOptions.isGroup) {
      //         // 重新加入回播放队列
      //         const groupChnIdx = this.allGroupPollingChnData.findIndex(groupChnItem => Number(groupChnItem.cid) === Number(sliceDivItem.videoOptions.cid))
      //         if (groupChnIdx !== -1) {
      //           await this.deletePlayerDiv('id', this.allGroupPollingChnData[groupChnIdx].cid)
      //           this.$set(this.groupPollingData.children, this.groupPollingData.children.length, this.allGroupPollingChnData[groupChnIdx])
      //           reAddChnPlayQueueStorage.push(this.allGroupPollingChnData[groupChnIdx])
      //         }
      //       }
      //     })
      //   } else if (oldVideoDisplayType < e) { // 少切多
      //     if (this.groupPollingData.children && this.groupPollingData.children.length > 0) { // 如果队列还有通道
      //       this.pollingPlay()
      //     }
      //   }
    },
    switchPaginData(e) {
      const tempPagingDataList = []
      // 收集所有播放的分组项
      this.pagingVideoDivs.forEach(item => {
        item.forEach(v => {
          if (v.using !== 0) {
            tempPagingDataList.push(v)
          }
        })
      })
      if (tempPagingDataList.length === 0) return
      // 清空pagingvideoDivs数据
      this.pagingVideoDivs = []
      // 重新按照布局个数来分配格子数据
      // 如果布局个数小于分组数据则需要分页，否则不需要
      if (e < tempPagingDataList.length) {
        let initCount = Math.ceil(tempPagingDataList.length / e)
        for (let index = 0; index < initCount; index++) {
          this.initVideoDivs()
        }
        for (let index = 0; index < this.pagingVideoDivs.length; index++) {
          for (let j = 0; j < e; j++) {
            this.$set(this.pagingVideoDivs[index][j], 'videoOptions', tempPagingDataList[0].videoOptions)
            this.$set(this.pagingVideoDivs[index][j], 'using', tempPagingDataList[0].using)
            tempPagingDataList.shift()
            if (tempPagingDataList.length === 0) return
          }
        }
      } else {
        this.initVideoDivs()
        let initCount = tempPagingDataList.length
        for (let index = 0; index < this.pagingVideoDivs.length; index++) {
          for (let j = 0; j < initCount; j++) {
            // this.pagingVideoDivs[index].push(tempPagingDataList[0])
            this.$set(this.pagingVideoDivs[index][j], 'videoOptions', tempPagingDataList[0].videoOptions)
            this.$set(this.pagingVideoDivs[index][j], 'using', tempPagingDataList[0].using)
            tempPagingDataList.shift()
            if (tempPagingDataList.length === 0) return
          }
        }
      }
    },
    // 适应播放器宽高
    setVideoHeight(e, row) {
      const getVideoContainer = this.getVideoContainer()
      // const videoHeight = (getVideoContainer.liveHeight / row) - (5 * row)
      // const videoWidth = ((videoHeight / 9) * 16)
      const videoWidth = (getVideoContainer.liveWidth - 15) / row - 5 * row
      const videoHeight = (videoWidth / 16) * 9
      this.warpWidth = `${Math.ceil(videoWidth * row + row * 10)}px`
      this.warpHeight = `${videoHeight * row + row * 10}px`
      if (e !== 6) {
        this.firstDivHeight = `${videoHeight}px`
        this.firstDivWidth = `${videoWidth}px`
        for (let j = 0; j < this.pagingVideoDivs.length; j++) {
          for (let i = 0; i < this.videoDivs.slice(0, e).length; i++) {
            this.$set(this.pagingVideoDivs[j][i], 'height', `${videoHeight}px`)
            this.$set(this.pagingVideoDivs[j][i], 'width', `${videoWidth}px`)
          }
        }
      } else {
        for (let j = 0; j < this.pagingVideoDivs.length; j++) {
          for (let k = 0; k < this.videoDivs.slice(0, e).length; k++) {
            if (k === 0) {
              this.firstDivHeight = `${videoHeight * 2 + 6}px`
              this.firstDivWidth = `${videoWidth * 2 + 9}px`
            }
            this.$set(this.pagingVideoDivs[j][k], 'height', `${videoHeight}px`)
            this.$set(this.pagingVideoDivs[j][k], 'width', `${videoWidth}px`)
          }
        }
      }
    },
    // 获取界面宽高
    getVideoContainer() {
      const liveWidth = this.$refs.videoContainerLive.clientWidth
      const liveHeight = this.$refs.videoContainerLive.clientHeight
      return { liveWidth, liveHeight }
    },
    // 初始化视频格子
    initVideoDivs() {
      const videoDivs = []
      for (let i = 1; i <= 9; i++) {
        videoDivs.push({
          id: i, // 格子id
          text: i, // 格子text
          using: 0, // 格子是否被占用
          videoOptions: '' // 格子中视频资源参数
        })
      }
      this.videoDivs = [...videoDivs]
      this.pagingVideoDivs.push(this.videoDivs)

      //   this.switchType(Number(localStorageOperation('get', 'videoDisplayType')) || 4)
    },
    // 关闭窗口
    async closeMonitor(val) {
      if (val.cid) await this.deletePlayerDiv('id', val.cid)
      // if (val.isGroup) { // 分组通道
      //   // await this.delLiveStorage('group', val.cid, 'playQueue') // 轮询结束删除播放队列
      //   if (val.isClickClose) { // 如果是手动关闭播放 要从轮询通道数据中（包括存在缓存的通道数据）删除避免下一遍轮询还会存在这个通道
      //     this.deleteAllGroupPollingChnDataItem(val.cid)
      //     // await this.delLiveStorage('group', val.cid, 'allQueue')
      //   }
      //   if (this.groupPollingData.children.length > 0) { // 如果分组里面还有格子
      //     this.pollingPlay()
      //   } else { // 非手动点击关闭播放 轮询结束关闭播放
      //     const sliceDiv = this.videoDivs.slice(0, this.videoDisplayType)
      //     const isHaveNotPlayOver = sliceDiv.findIndex(sliceDivItem => sliceDivItem.videoOptions !== '' && sliceDivItem.videoOptions.isGroup === true) // 查询有没有未播放完的分组通道
      //     // 进行新一遍轮询的条件就是没有格子在播放分组了 而且 队列中没有通道了
      //     if (isHaveNotPlayOver === -1 && this.groupPollingData.children.length === 0) {
      //       const groupChildren = [...this.allGroupPollingChnData]
      //       this.$set(this.groupPollingData, 'children', [...groupChildren])
      //       await this.setLiveStorage('group', [...groupChildren], 'playQueue')
      //       this.pollingPlay()
      //     }
      //   }
      // }
    },
    async groupClick(val) {
      // await this.delLiveStorage('area', null)
      // await this.setLiveStorage('group', val.children, 'allQueue')
      // await this.setLiveStorage('group', val.children, 'playQueue')
      // await this.setLiveStorage('group', null, 'extendedInfo', { pollingTime: val.pollingTime })
      this.groupPollingData = this.$tool.deepCopy(val)
      // this.allGroupPollingChnData = [...val.children]
      // this.pollingTime = this.groupPollingData.pollingTime
      // this.clearVideoDiv().then(() => {
      //   })
      this.pollingPlay()
    },
    // 点击分组按钮得到分组各子摄像头数据
    getGroupData(val) {
      // this.clearVideoDiv()
      this.GroupData = this.$tool.deepCopy(val)
      this.pagingVideoDivs = []
      this.initVideoDivs()
      this.switchType(this.videoDisplayType)
      // this.pagingVideoDivs.push(this.videoDivs)
      // 切换分组清空数据格子
    },
    async chnClick(val) {
      // const existVideoIndex = this.videoDivs.findIndex((item) => { // 查询视频列表有没有这个视频
      //   return Number(item.using) === val.cid
      // })
      // if (existVideoIndex !== -1) {
      //   this.$message('该通道已经在播放了!')
      // } else {

      // }
      for (let index = 0; index < this.pagingVideoDivs.length; index++) {
        // const element = array[index]
        const existVideoIndex = this.pagingVideoDivs[index].findIndex(item => {
          return Number(item.using) === val.cid
        })
        if (existVideoIndex !== -1) {
          this.$message('该通道已经在播放了!')
          return
        }
      }
      const haveRes = await this.haveFreeDiv()
      if (haveRes === -1) {
        this.initVideoDivs()
        this.switchType(this.videoDisplayType)
      }
      const setPlayerDivRes = await this.setPlayerDiv(val.cid, haveRes, false)
      const getSysDictionaryDetailRes = await this.getSysDictionaryDetail(val.beDvr.devTypeId)
      const propVal = val
      propVal.isStream = getSysDictionaryDetailRes || 1
      this.getChnCurrentItem(propVal, setPlayerDivRes)
    },
    // 分组轮询播放方法
    async pollingPlay() {
      // 分组轮询方法逻辑：
      // 判断分组的摄像头数组是否为空，不为空将第一个摄像头传递给 getLive 接口
      // 接口请求成功得到视频预览数据会判断是否还有空余的格子，有的话就把请求的视频预览数据填入并且播放视频流（请求方法请看 getChnCurrentItem）
      if (this.groupPollingData.children.length > 0) {
        const haveRes = await this.haveFreeDiv()
        if (haveRes === -1) {
          // 增加一个分页并设置宽高
          this.initVideoDivs()
          this.switchType(this.videoDisplayType)
        }
        // 设置加载和格子
        const setPlayerDivRes = await this.setPlayerDiv(this.groupPollingData.children[0].cid, haveRes, true)
        // 主码流
        const getSysDictionaryDetailRes = await this.getSysDictionaryDetail(this.groupPollingData.children[0].beDvr.devTypeId)
        const propV = this.$tool.deepCopy(this.groupPollingData.children[0])
        propV.isStream = getSysDictionaryDetailRes || 1
        this.getChnCurrentItem(propV, setPlayerDivRes, true)
      }
    },
    // 清除播放格子 用于点击/拖拽通道时
    async clearVideoDiv() {
      this.pagingVideoDivs = []
      this.pagingVideoDivs.push(this.videoDivs)
      return 'ok'
    },
    // 是否还有空余的格子 并且返回索引
    async haveFreeDiv() {
      return new Promise(resolve => {
        for (let i = 0; i < this.pagingVideoDivs.length; i++) {
          for (let j = 0; j < this.pagingVideoDivs[i].slice(0, this.videoDisplayType).length; j++) {
            if (this.pagingVideoDivs[i][j].videoOptions === '') {
              resolve({ i, j })
              return
            }
          }
        }
        resolve(-1)
      })
    },
    async getChnCurrentItem(propChn, divIndex, isGroup, replaceVideoDiv) {
      const isGroupChn = isGroup || null
      const res = await this.getLive(propChn.cid, propChn.isStream || 1)
      if (res.code === 1) {
        // 预览视频数据请求成功
        this.getChnCurrentItemErrorCount = 0
        // 组装通道信息
        res.map.mes.cid = propChn.cid + '' // 通道id
        res.map.mes.cname = propChn.cname // 通道名称
        res.map.mes.isStream = propChn.isStream // 流
        res.map.mes.beDvr = propChn.beDvr // 通道所属dvr
        res.map.mes.divIndex = propChn.divIndex || null
        // res.map.mes.isGroup = isGroup
        res.map.mes.inReplaceOver = true

        if (isGroup) {
          // 分组
          res.map.mes.divIndex = divIndex
          this.setPlayerDivData(divIndex, res.map)
          await this.deleteGroupPollingChnDataItem(propChn.cid)
          // if (!propChn.isStoragePlay)
          this.pollingPlay()
        } else {
          res.map.mes.divIndex = divIndex
          this.setPlayerDivData(divIndex, res.map)
        }
      } else {
        // 预览视频数据请求失败 请求三次失败后就不请求了
        this.getChnCurrentItemErrorCount++
        if (this.getChnCurrentItemErrorCount < 3) {
          // 三次请求失败后提醒
          this.getChnCurrentItem(propChn, divIndex, isGroupChn)
        } else {
          this.getChnCurrentItemErrorCount = 0
          if (isGroup) {
            // 分组判断
            // this.deletePlayerDiv('id', propChn.cid)
            // this.deleteAllGroupPollingChnDataItem(propChn.cid)

            await this.deleteGroupPollingChnDataItem(propChn.cid)
            // await this.delLiveStorage('group', propChn.cid, 'allQueue')
            // await this.delLiveStorage('group', propChn.cid, 'playQueue')
            // 分组摄像头数据请求成功并且有空余的格子会填入到空余的格子中
            // 并且将通道摄像头的第一个删除掉因为是拿第一个摄像头来播放的
            const haveRes = await this.haveFreeDiv()
            if (haveRes !== -1) {
              this.pollingPlay()
            }
          }
          this.$message({
            message: '请求失败',
            type: 'error'
          })
        }
      }
      this.dragOverIndex = ''
    },
    // 获取流
    async getLive(cid, isStream) {
      return new Promise(resolve => {
        this.$request({
          url: this.api.video.getLive,
          data: { cid, isStream }
        }).then(res => {
          resolve(res)
        })
      })
    },
    // 插入格子
    async setPlayerDiv(cid, divIndex, isGroup) {
      return new Promise(resolve => {
        let playerIndex = {}

        // -1代表已经新添加了分页
        if (divIndex === -1) {
          let saveVideoIndex = {i: '', j: ''}// 当前插入窗口索引
          if (this.pagingVideoDivs[1]) {
            console.log(this.pagingVideoDivs[1].slice(0, this.videoDisplayType).length)
          }
          for (let i = 0; i < this.pagingVideoDivs.length; i++) {
            for (let j = 0; j < this.pagingVideoDivs[i].slice(0, this.videoDisplayType).length; j++) {
              if (this.pagingVideoDivs[i][j].videoOptions === '') {
                saveVideoIndex = {i, j}
                this.$set(this.pagingVideoDivs[saveVideoIndex.i][saveVideoIndex.j], 'using', String(cid))
                this.$set(this.pagingVideoDivs[saveVideoIndex.i][saveVideoIndex.j], 'videoOptions', { isGroup, inReplaceOver: false })

                playerIndex = saveVideoIndex
                resolve(playerIndex)
                return
              }
            }
          }
        } else {
          this.$set(this.pagingVideoDivs[divIndex.i][divIndex.j], 'using', String(cid))
          this.$set(this.pagingVideoDivs[divIndex.i][divIndex.j], 'videoOptions', { isGroup, inReplaceOver: false })
          resolve(divIndex)
        }
      })
    },
    // 删除指定本地轮询分组通道变量
    async deleteGroupPollingChnDataItem(cid) {
      return new Promise(resolve => {
        const groupPollingChnDataIdx = this.groupPollingData.children.findIndex(item => Number(item.cid) === Number(cid))
        if (groupPollingChnDataIdx !== -1) this.groupPollingData.children.splice(groupPollingChnDataIdx, 1)
        resolve(true)
      })
    },
    // 查询视频设备类型字典判断是否是海康或者是宇视 海康首次默认使用主码流 宇视首次默认使用子码流
    async getSysDictionaryDetail(id) {
      return new Promise(resolve => {
        this.$request({
          url: this.api.common.getSysDictionaryDetail, data: { id }
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
    // 插入格子数据
    setPlayerDivData(divIdx, data) {
      this.$set(this.pagingVideoDivs[divIdx.i][divIdx.j], 'videoOptions', { isRequestLoadSuccess: true, ...data.mes })
    },
    // 监听播放窗口全屏事件
    fullScreenMonitor(val) {
      this.onFullScreenMonitor = val
    },
    // 删除格子
    async deletePlayerDiv(indexType, videoDivsVal) {
      return new Promise(resolve => {
        let videoDivsValIdx = 0
        let saveVideoIndex = {i: '', j: ''}// 当前插入窗口索引

        if (indexType === 'index') {
          videoDivsValIdx = videoDivsVal
        }
        if (indexType === 'id') {
          // videoDivsValIdx = this.videoDivs.findIndex(item => Number(item.using) === Number(videoDivsVal))

          for (let i = 0; i < this.pagingVideoDivs.length; i++) {
            for (let j = 0; j < this.pagingVideoDivs[i].slice(0, this.videoDisplayType).length; j++) {
              if (+this.pagingVideoDivs[i][j].using === +videoDivsVal) {
                saveVideoIndex = {i, j}
              }
            }
          }
        }
        if (videoDivsValIdx !== -1) {
          this.pagingVideoDivs[saveVideoIndex.i][saveVideoIndex.j].videoOptions = ''
          this.pagingVideoDivs[saveVideoIndex.i][saveVideoIndex.j].using = '0'
        }
        // 删完检查这一分页，如果没有一个播放的视频则删除分页，只有一个分页时不删除
        for (let i = 0; i < this.pagingVideoDivs.length; i++) {
          let deleteFlag = false
          for (let j = 0; j < this.pagingVideoDivs[i].slice(0, this.videoDisplayType).length; j++) {
            if (this.pagingVideoDivs[i][j].using) {
              deleteFlag = true
            }
          }
          if (!deleteFlag && this.pagingVideoDivs.length > 1) {
            this.pagingVideoDivs.splice(i, 1)
            i--
          }
        }
        resolve(true)
      })
    },
    autoPolling() {
      if (!this.GroupData) {
        this.$message({type: 'warning', message: '请先选择一个分组'})
        return
      }
      this.autoPollingCheck ? this.$message({type: 'info', message: '轮巡结束'}) : this.$message({type: 'success', message: '轮巡开始'})
      this.autoPollingCheck = !this.autoPollingCheck
      this.carouselAutoplay = this.autoPollingCheck
      if (this.autoPollingCheck) {
        // const groupData = this.$tool.deepCopy(this.GroupData)
        // 复原，初始化格子，初始化高度宽度
        this.pagingVideoDivs = []
        this.initVideoDivs()
        this.switchType(this.videoDisplayType)

        this.carouselInterval = 4000
        this.groupPollingData = this.GroupData

        this.pollingPlay()
      }
    }

  }
}
</script>

<style lang="scss" scoped>
// 样式实现的全屏
.full-screen-live {
  // float: none;
 .carouselWrap,.carouselItemWrap .videos-wrap,.playbox,.boxmain,.video-playing, .player-wrap{
    position: static !important;
  }
  ::v-deep .el-carousel__container{
    position: static !important;
  }
  ::v-deep .el-carousel__item{
    width: 100%;
  }
}
::v-deep .el-carousel__item{
  width: auto;
}
.monitor {
  --default-color: #082949;
  background: #05052c url(/image/screen/video/new-bg.png) no-repeat 50% top;
  min-height: 100%;
  //padding: 16px;
  padding-left: 0;
  padding-right: 0;
  // position: relative;
  transition: all 0.5s;
  color: #fff;
  font-size: 14px;
  .topo-wrapper {
    position: absolute;
    z-index: 100;
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
    // position: relative;
    // z-index: 101;
    // width: 100%;
    // 减掉header和最大的盒子上下的padding还 占3分之2
    // height: calc(100vh - 100px - 16px - 16px - 300px);
    .column-box {
      position: absolute;
      z-index: 101;
      display: flex;
      flex-direction: column;
      height: 100%;
      & > div:first-child {
        margin-bottom: 20px;
      }
    }
    .rightStatic {
      position: absolute;
      right: 0 !important;
      z-index: 101;
      display: flex;
      //width: 80px;
      flex-direction: column;
      align-items: flex-end;
      padding: 0 20px 0 0;
    }

    .tooltip-group,
    .host-tooltip {
      position: absolute;
    }
    .g6-component-tooltip {
      display: inline-block;
      visibility: visible;
      font-size: 14px;
      .host-name {
        color: #0045ab;
      }
      .host-ip {
        color: #878787;
      }
      .item-name {
        display: inline-block;
        width: 72px !important;
      }
    }
  }
}
.monitor ::v-deep div::-webkit-scrollbar-track-piece {
  background: #071f39;
}
.monitor ::v-deep div::-webkit-scrollbar-thumb {
  background: #78b0c9;
  border-radius: 0;
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
/deep/ .g6-minimap {
  position: absolute !important;
  top: 50%;
  transform: translateY(-60%);
  right: 26px !important;
  // bottom: 13%;
}
//  #topoMap /deep/ canvas{
//   transform: scale(.4);
//  }
body {
  margin: 0;
  font-size: 14px;
  overflow: hidden;
  font-family: Helvetica, Tahoma, Arial, 'PingFang SC', 'Hiragino Sans GB', 'WenQuanYi Micro Hei', 'Microsoft YaHei', 宋体, sans-serif;
  background: #05052c url('/image/screen/video/bg.png') no-repeat 50% top;
}
::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 5px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
}
::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 5px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #3d9fe9;
}
::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  background: #123788;
}
h1,
h2,
h3,
h4,
h5,
p,
ul,
li,
dl,
dd,
dt {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
a:link,
a:visited {
  color: #99ccff;
  text-decoration: none;
  transition: all 0.5s;
}
a:hover {
  color: #ffffff;
}
.text_color {
  font-weight: bold;
  background-image: -webkit-linear-gradient(bottom, #00bfff, #08f2f5, #ffffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
#header {
  width: 100%;
  height: 110px;
  margin-bottom: 20px;
  background: url('/image/screen/video/head_bg_full.png') repeat-x 0 -14px;
}
.headermain {
  width: 1900px;
  height: 110px;
  margin: 0 auto;
  background: url('/image/screen/video/head_bg.png') no-repeat 50% 100%;
}
.head_text {
  width: 780px;
  height: 110px;
  float: left;
}
.menu {
  width: 100%;
  height: 60px;
}
.menu li {
  width: 125px;
  height: 60px;
  float: left;
  text-align: center;
}
.menu li a {
  display: block;
  height: 59px;
  line-height: 50px;
}
.menu li a.onli {
  color: #ffffff;
  font-weight: bold;
  background: url('/image/screen/video/ico_menu_on.png') no-repeat 50% 100%;
}
.selmenu {
  margin: 20px;
}
.selmenu li {
  float: left;
  margin-left: -1px;
}
.selmenu li:first-child {
  margin-left: 0;
}
.selmenu li a {
  display: block;
  padding: 0 15px;
  height: 30px;
  line-height: 30px;
  background: #0c1a52;
  border: 1px solid #2d72b3;
  opacity: 0.5;
  text-align: center;
}
.selmenu li a:hover,
.selmenu li a.onhover {
  opacity: 1;
  color: #99ccff;
}
.time_r {
  padding-right: 20px;
  text-align: right;
  font-size: 12px;
  color: #cccccc;
  line-height: 57px;
}
.logo {
  width: 340px;
  height: 94px;
  float: left;
  padding-top: 15px;
  text-align: center;
  background-image: -webkit-linear-gradient(bottom, #cccccc, #ffffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.logo p {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 3px;
}
.logo h1 {
  margin-top: 10px;
  font-size: 26px;
}
#content {
  width: 1900px;
  height: 100%;
  overflow: auto;
  margin: 0 auto;
}
#side {
  float: left;
  width: 420px;
  height: auto;
  overflow: hidden;
}
#main {
  float: left;
  width: 1000px;
  margin: 0 30px;
  padding-bottom: 30px;
}
.com_title {
  width: 100%;
  height: 40px;
  line-height: 40px;
  background: url('/image/screen/video/title_bg.png') no-repeat 0 0;
}
.com_title .span_left {
  float: left;
  width: 50%;
  padding-left: 15px;
  font-size: 14px;
  font-weight: bold;
  color: #99e5ff;
}
.com_title .span_right {
  float: right;
  width: 40%;
  text-align: right;
  padding-right: 15px;
}
.com_title .sel_data {
  padding-right: 0;
}
.com_title .sel_data a:link,
.com_title .sel_data a:visited {
  float: left;
  display: inline-block;
  width: 40px;
  text-align: center;
  color: #cccccc;
}
.com_title .sel_data a:hover,
.com_title .sel_data a.a_on {
  color: #99e5ff;
}
.com_title .sel_data em {
  float: left;
  color: #cccccc;
  margin: 0 7px;
}
.com_title .span_right a.setflow {
  display: inline-block;
  width: 16px;
  height: 16px;
  background: url('/image/screen/video/ico_set.png') no-repeat 0 0;
}

.videoside {
  float: left;
  width: 240px;
  height: 100%;
  overflow-y: auto;
}
.btn_screen {
  width: 100%;
  height: 26px;
  margin: 15px 0;
}
.btn_screen a {
  float: left;
  display: inline-block;
  height: 16px;
  width: 16px;
  line-height: 50px;
  overflow: hidden;
  margin: 5px 0 5px 10px;
  opacity: 0.3;
}
.btn_lx {
  float: right;
  height: 24px;
  line-height: 24px;
  cursor: pointer;
  color: #3893d8;
  padding: 0 10px;
  border: 1px solid #082862;
  transition: all 0.5s;
}
.btn_lx_checked{
  color: #08f2f5;
  border: 1px solid #00bfff;
}
.btn_lx:hover {
  color: #08f2f5;
  border: 1px solid #00bfff;
}

.btn_screen a.one {
  background: url('/image/screen/video/btn_vio_btn.png') no-repeat 0 0;
}
.btn_screen a.one:hover,
.btn_screen a.onhover {
  opacity: 1;
}
.btn_screen a.two {
  background: url('/image/screen/video/btn_vio_btn.png') no-repeat -22px 0;
}
.btn_screen a.two:hover,
.btn_screen a.onhover {
  opacity: 1;
}
.btn_screen a.three {
  background: url('/image/screen/video/btn_vio_btn.png') no-repeat -45px 0;
}
.btn_screen a.three:hover,
.btn_screen a.onhover {
  opacity: 1;
}
.btn_screen a.font {
  background: url('/image/screen/video/btn_vio_btn.png') no-repeat -67px 0;
}
.btn_screen a.font:hover,
.btn_screen a.onhover {
  opacity: 1;
}
.groupbox {
  height: 800px;
  overflow: auto;
}
.groupbox dl {
  display: block;
}
.groupbox dd {
  padding: 10px 0;
}
.groupbox .name {
  height: 35px;
  line-height: 35px;
  text-indent: 30px;
  color: #ffffff;
  background: #0a113b url('/image/screen/video/ico.png') no-repeat 15px 13px;
}
.groupbox p {
  height: 35px;
  line-height: 35px;
  text-indent: 15px;
  color: #cccccc;
}
.groupbox .img_ico {
  float: left;
  width: 16px;
  height: 16px;
  overflow: hidden;
  margin: 9px 0 0 32px;
  background: url('/image/screen/video/ico_vdo.png') no-repeat 0 0;
}

.videoside_r {
  float: right;
  width: 220px;
  height: 100%;
  overflow-y: auto;
}
.echarsbox {
  text-align: center;
  margin: 15px auto 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #082862;
}
.resmain {
  overflow: hidden;
  margin: 10px auto 20px;
}
.resbox {
  float: left;
  width: 100%;

}
.storageResBox{
    overflow: scroll;
    height: 400px;
    .resname2{
      border-bottom: solid 1px grey;
    }
    .title{
      display: flex;
    }
    .itemContent{
      display: flex;
      align-items: center;
      .name{
        text-align: center;
        overflow: hidden;
        width: 30px;
        text-overflow:ellipsis ;
        white-space: nowrap;
      }
      .chart{
        flex: 1;
        border-left: solid 1px grey;
      }
    }
  }
.resbox .resname {
  // float: left;
  width: 100%;
  line-height: 30px;
  padding: 0 0 10px;
  font-size: 14px;
  font-weight: bold;
  color: #ffffff;
}
.resbox .resname2 {
  float: left;
  width: 100%;
  line-height: 30px;
  // padding-bottom: 10px;
  font-size: 14px;
  color: #ffffff;
}
.resbox .resname2 span {
  float: left;
}
.resbox .resname2 span.online {
  float: left;
  // line-height: 25px;
  margin-left: 10px;
  padding: 0 10px;
  color: #00b285;
  background: rgba(0, 180, 135, 0.3);
}
.resbox .resname2 span.unline {
  float: left;
  // line-height: 25px;
  margin-left: 10px;
  padding: 0 10px;
  color: #cccccc;
  background: rgba(255, 255, 255, 0.2);
}
.resbox .res_text {
  float: left;
  width: 100%;
  padding: 5px 0 10px;
  font-size: 24px;
}
.resbox .res_text em {
  font-size: 12px;
}
.res_box span {
  // float: left;
}
.videomain {
  float: left;
  width: 1410px;
  margin: 0 20px 0 5px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  .videos-wrap {
    transition: all 0.2s;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    // position: relative;
    margin: 0 auto;
    .playbox {
      transition: all 0.2s;
      // position: relative;
      margin: 5px;
    }
  }
  .six-block {
    .playbox:nth-child(3) {
      position: absolute;
      right: 0;
      top: 33% !important;
    }
  }
}

.videomain .playbox {
  // width: 50%;
  // height: 450px;
  background: #0a113b;
}
.videomain .playbox .boxmain {
  // margin: 0 0 15px 15px;
  // padding: 15px;
  // height: 405px;
  // background:#0A113B;
  width: 100%;
  height: 100%;
  // position: relative;
  background: url('/image/screen/video/img_vdonoimg.png') no-repeat 50% 40%;
}
.bgUrl{
 background-image:none !important;
}
.boxmain{
  .video-playing{
    width: 100%;
    height: 100%;
    padding: 15px 15px 0 15px;
    display: flex;
    flex-direction: column;
    .player-wrap{
      height:85%;
      width: 100%;
    }
    .text-wrap{
      height: 15%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
}
.videoplayer {
  width: 100%;
  height: 360px;
  margin-bottom: 15px;
  overflow: hidden;
  background: url('/image/screen/video/img_vdonoimg.png') no-repeat 50% 40%;
}
.videoplayer img {
  width: 100%;
}
.videoinfo {
  float: left;
  width: 100%;
  height: 30px;
  color: #ffffff;
  line-height: 30px;
}
.videoinfo .videoname {
  float: left;
  width: 60%;
}
.videoinfo .sel_btn {
  float: right;
  width: 100px;
  height: 30px;
  color: #999999;
  ine-height: 30px;
  background: #05052c;
}

</style>
