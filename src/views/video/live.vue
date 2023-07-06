<template>
  <div class="main video-live">
    <div ref="sideMenu" v-permission="['SearchChn']" class="sideMenu">
      <video-chn-list
        ref="videoChnList"
        :show-calendar="false"
        :is-dragging="true"
        :is-show-group="true"
        @chnCurrentItem="chnCurrentItem"
        @selectFlow="selectChnFlow"
        @selectCid="selectChn"
        @groupClickItem="groupClickItem"
      />
    </div>
    <div class="main-content">
      <div
        ref="videoContainerLive"
        class="content-box"
        :class="onFullScreenMonitor && onFullScreenMonitor.isFullScreen ? 'full-screen-live' : ''"
      >
        <div
          ref="videoWrap"
          :class="['videos-wrap', currentClass]"
          :style="{'height': warpHeight, 'width': warpWidth}"
        >
          <div
            v-for="(item, index) in videoDivs.slice(0, videoDisplayType)"
            :id="item.id"
            :key="item.id"
            class="video-container-live"
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
              <div v-if="!item.videoOptions">
                <div
                  class="no-video"
                  :class="handleItemIndex === index ? 'active-div' : ''"
                >
                  <img style="width:101px; height:99px" src="image/video/bg_video.png" alt="">
                  <div class="hint-text">请选择视频</div>
                </div>
              </div>
              <div v-else class="video-playing">
                <live-player-content
                  v-if="item.videoOptions"
                  :re-init-key="reInitKey"
                  :assign-re-init-key-cids="assignReInitKeyCids"
                  :options="item.videoOptions"
                  :can-control="true"
                  :cid="item.using"
                  :group-polling-time="pollingTime"
                  :is-group="item.videoOptions.isGroup"
                  :is-browser-full-screen="isBrowserFullScreen"
                  :show-message-tip="true"
                  @closeMonitor="closeMonitor"
                  @fullScreenMonitor="fullScreenMonitor"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="content-head">
        <img :class="['switch-btn', videoDisplayType === 1 ? 'active' : '']" src="image/video/1.png" alt="" @click="switchType(1, true)">
        <img :class="['switch-btn', videoDisplayType === 4 ? 'active' : '']" src="image/video/4.png" alt="" @click="switchType(4, true)">
        <img :class="['switch-btn', videoDisplayType === 6 ? 'active' : '']" src="image/video/6.png" alt="" @click="switchType(6, true)">
        <img :class="['switch-btn', videoDisplayType === 9 ? 'active' : '']" src="image/video/9.png" alt="" @click="switchType(9, true)">
      </div>
    </div>
  </div>
</template>

<script>
import LivePlayerContent from './components/player-content/live-player-content'
import VideoChnList from './components/video-chn-list/video-chn-list'
import request from '@/utils/request'
import api from '@/api/api'
import { localStorageOperation } from '@/utils/browser-storage'
import { isArray } from '@/utils/validate'
import { isBrowserFullScreen, guid, hasPlugin } from '@/utils/utils'

export default {
  name: 'Live',
  components: {
    LivePlayerContent,
    VideoChnList
  },
  data() {
    return {
      videoDisplayType: 4, // 监控排版格子
      videoDivs: [], // 所有监控格子数据
      moveUsing: '', // 当前鼠标移入的窗口id
      contextMenuSelectChn: {}, // 当前点击的区域通道
      getChnCurrentItemErrorCount: 0,
      warpWidth: '',
      warpHeight: '',
      dragOverIndex: '',
      pollingTime: 0, // 分组轮询播放秒数
      groupPollingData: {}, // 当前分组轮询数据
      allGroupPollingChnData: [], // 所有分组通道数据
      firstDivWidth: '0px',
      firstDivHeight: '0px',
      onStartItem: null,
      onMoveItem: null,
      handleItemIndex: '',
      onFullScreenMonitor: {},
      isBrowserFullScreen: false,
      isInstallVCLPlugin: false,
      reInitKey: '', // 重新初始化key
      assignReInitKeyCids: [] // 制定要重新初始化的通道
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
    // 获取是否安装vlc
    this.isInstallVCLPlugin = hasPlugin('VLC Web Plugin')
    const that = this
    window.onresize = function() {
      if (!that.isInstallVCLPlugin) that.switchType(that.videoDisplayType)
      that.isBrowserFullScreen = isBrowserFullScreen()
    }
    document.addEventListener('click', (e) => {
      if (this.$refs.videoWrap) {
        const isVideoWrap = this.$refs.videoWrap.contains(e.target)
        const isSideMenu = this.$refs.sideMenu.contains(e.target)
        if (!isVideoWrap && !isSideMenu) { // 点播放区域和通道列表以外的元素就把选择状态取消
          this.handleItemIndex = ''
        }
      }
    })
    this.initVideoDivs()
    this.initLiveStorage()
  },
  beforeDestroy() {
    window.onresize = null
  },
  methods: {
    // 关闭窗口
    async closeMonitor(val) {
      if (val.cid) await this.deletePlayerDiv('id', val.cid, val.cid)
      if (val.isGroup) { // 分组通道
        await this.delLiveStorage('group', val.cid, 'playQueue') // 轮询结束删除播放队列
        if (val.isClickClose) { // 如果是手动关闭播放 要从轮询通道数据中（包括存在缓存的通道数据）删除避免下一遍轮询还会存在这个通道
          this.deleteAllGroupPollingChnDataItem(val.cid)
          await this.delLiveStorage('group', val.cid, 'allQueue')
        }
        if (this.groupPollingData.children.length > 0) { // 如果分组里面还有格子
          this.pollingPlay()
        } else { // 非手动点击关闭播放 轮询结束关闭播放
          const sliceDiv = this.videoDivs.slice(0, this.videoDisplayType)
          const isHaveNotPlayOver = sliceDiv.findIndex(sliceDivItem => sliceDivItem.videoOptions !== '' && sliceDivItem.videoOptions.isGroup === true) // 查询有没有未播放完的分组通道
          // 进行新一遍轮询的条件就是没有格子在播放分组了 而且 队列中没有通道了
          if (isHaveNotPlayOver === -1 && this.groupPollingData.children.length === 0) {
            const groupChildren = [...this.allGroupPollingChnData]
            this.$set(this.groupPollingData, 'children', [...groupChildren])
            await this.setLiveStorage('group', [...groupChildren], 'playQueue')
            this.pollingPlay()
          }
        }
      } else { // 区域通道
        await this.delLiveStorage('area', val.cid, 'playQueue')
      }
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
      this.switchType(Number(localStorageOperation('get', 'videoDisplayType')) || 4)
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
      this.setVideoHeight(e, row)
      if (isClickSwitch && this.isInstallVCLPlugin) this.reInitKey = guid()
      /*
      播放分组时切换布局，多切少，就把多余的格子未播放完的通道重新加到播放队列，少切多，把空余的补上
       */
      const oldVideoDisplayType = this.videoDisplayType // 记录修改前的布局个数
      this.videoDisplayType = e
      this.localStorageOperation('set', 'videoDisplayType', e)
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
      console.log(this.getVideoContainer())
      const getVideoContainer = this.getVideoContainer()
      // const videoHeight = (getVideoContainer.liveHeight / row) - (5 * row)
      // const videoWidth = ((videoHeight / 9) * 16)
      const videoWidth = ((getVideoContainer.liveWidth - 15) / row) - (5 * row)
      const videoHeight = (videoWidth / 16) * 9
      console.log(videoHeight, videoWidth, row)
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
    // 获取界面宽高
    getVideoContainer() {
      const liveWidth = this.$refs.videoContainerLive.clientWidth
      const liveHeight = this.$refs.videoContainerLive.clientHeight
      return { liveWidth, liveHeight }
    },
    /**
     * @description 获取通道预览数据
     * @param propChn 通道数据
     * @param divIndex 插入的格子位置
     * @param isGroup 获取的通道是否是分组通道
     * @param replaceVideoDiv 被替换的格子（如果被替换的格子有播放数据那么就不是null）
     */
    async getChnCurrentItem(propChn, divIndex, isGroup, replaceVideoDiv) {
      const isGroupChn = isGroup || null
      const res = await this.getLive(propChn.cid, propChn.isStream || 1)
      if (res.code === 1) {
        // 预览视频数据请求成功
        this.getChnCurrentItemErrorCount = 0
        console.log(propChn)
        // 组装通道信息
        res.map.mes.cid = propChn.cid // 通道id
        res.map.mes.cname = propChn.cname // 通道名称
        res.map.mes.isStream = propChn.isStream // 流
        res.map.mes.beDvr = propChn.beDvr // 通道所属dvr
        res.map.mes.divIndex = propChn.divIndex || null
        res.map.mes.isGroup = isGroup
        res.map.mes.inReplaceOver = true

        if (isGroup) { // 分组
          res.map.mes.divIndex = divIndex
          await this.setLiveStorage('group', res.map.mes, 'playQueue') // 更新分组缓存
          this.setPlayerDivData(divIndex, res.map)
          await this.deleteGroupPollingChnDataItem(propChn.cid)
          if (!propChn.isStoragePlay) this.pollingPlay()
        } else { // 区域
          await this.setLiveStorage('area', { cid: propChn.cid, divIndex, extended: res.map.mes }, 'playQueue') // 插入区域缓存
          this.setPlayerDivData(divIndex, res.map)
          // 拖拽替换播放
          if (!replaceVideoDiv) return
          // 如果被替换掉的是分组通道
          if (replaceVideoDiv.isGroup) {
            // 把替换掉的分组通道从缓存的分组通道和播放队列中删除
            await this.delLiveStorage('group', replaceVideoDiv.cid, 'queue')
            await this.delLiveStorage('group', replaceVideoDiv.cid, 'allChn')
            // 把替换掉的分组通道从当前的分组通道中删除
            this.deleteAllGroupPollingChnDataItem(replaceVideoDiv.cid)
          } else {
            await this.delLiveStorage('area', replaceVideoDiv.cid, 'playQueue') // 把替换掉的区域通道从缓存的区域通道队列中删除
          }
        }
      } else {
        // 预览视频数据请求失败 请求三次失败后就不请求了
        this.getChnCurrentItemErrorCount++
        if (this.getChnCurrentItemErrorCount < 3) { // 三次请求失败后提醒
          this.getChnCurrentItem(propChn, divIndex, isGroupChn)
        } else {
          this.getChnCurrentItemErrorCount = 0
          if (isGroup) { // 分组判断
            this.deletePlayerDiv('id', propChn.cid)
            this.deleteAllGroupPollingChnDataItem(propChn.cid)
            this.deleteGroupPollingChnDataItem(propChn.cid)
            await this.delLiveStorage('group', propChn.cid, 'allQueue')
            await this.delLiveStorage('group', propChn.cid, 'playQueue')
            // 分组摄像头数据请求成功并且有空余的格子会填入到空余的格子中
            // 并且将通道摄像头的第一个删除掉因为是拿第一个摄像头来播放的
            const haveRes = await this.haveFreeDiv()
            if (haveRes !== -1) {
              this.pollingPlay()
            }
          } else {
            this.deletePlayerDiv('id', propChn.cid)
            await this.delLiveStorage('area', propChn.cid, 'playQueue') // 删除区域通道缓存
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
        request({
          url: api.video.getLive, data: { cid, isStream }
        }).then(res => {
          resolve(res)
        })
      })
    },
    // 是否还有空余的格子 并且返回索引
    async haveFreeDiv() {
      return new Promise(resolve => {
        const activeDivs = this.videoDivs.slice(0, this.videoDisplayType)
        const idx = activeDivs.findIndex(item => {
          return item.videoOptions === ''
        })
        resolve(idx)
      })
    },
    // 插入格子
    async setPlayerDiv(cid, divIndex, isGroup) {
      return new Promise(resolve => {
        let playerIndex = 0
        // 缓存播放
        // 指定插入格子位置
        if (divIndex !== null) { // 缓存指定了盒子位置
          this.$set(this.videoDivs[divIndex], 'using', String(cid))
          this.$set(this.videoDivs[divIndex], 'videoOptions', { isGroup, inReplaceOver: false })
          return resolve(divIndex)
        }
        // 非缓存播放
        // 点击的播放器格子，并且不是选择分组通道
        if (this.handleItemIndex !== '' && !isGroup) {
          playerIndex = this.handleItemIndex
          this.$set(this.videoDivs[this.handleItemIndex], 'using', String(cid))
          this.$set(this.videoDivs[this.handleItemIndex], 'videoOptions', { isGroup, inReplaceOver: false })
          this.handleItemIndex = ''
        } else {
          // 非手动点击播放器格子，区域通道和分组通道都可以
          const existVideoIndex = this.videoDivs.findIndex((item) => { // 查询视频列表有没有这个视频
            return Number(item.using) === cid
          })
          if (existVideoIndex === -1) {
            let saveVideoIndex = 0 // 当前插入窗口索引
            console.log(this.videoDivs)
            for (const key in this.videoDivs) { // 查找出空余的格子
              console.log(this.videoDivs[key])
              if (this.videoDivs[key]['videoOptions'] === '') {
                saveVideoIndex = key
                break
              }
            }
            saveVideoIndex = this.dragOverIndex !== '' ? this.dragOverIndex : saveVideoIndex
            // console.log('窗口Index', saveVideoIndex)
            this.$set(this.videoDivs[saveVideoIndex], 'using', String(cid))
            this.$set(this.videoDivs[saveVideoIndex], 'videoOptions', { isGroup, inReplaceOver: false })
            playerIndex = saveVideoIndex
          }
        }
        resolve(playerIndex)
      })
    },
    // 插入格子数据
    setPlayerDivData(divIdx, data) {
      this.$set(this.videoDivs[divIdx], 'videoOptions', { isRequestLoadSuccess: true, ...data.mes })
    },
    // 删除格子
    async deletePlayerDiv(indexType, videoDivsVal) {
      return new Promise(resolve => {
        let videoDivsValIdx = 0
        if (indexType === 'index') {
          videoDivsValIdx = videoDivsVal
        }
        if (indexType === 'id') {
          videoDivsValIdx = this.videoDivs.findIndex(item => Number(item.using) === Number(videoDivsVal))
        }
        if (videoDivsValIdx !== -1) {
          console.log('videoDivsValIdx', videoDivsValIdx)
          this.videoDivs[videoDivsValIdx].videoOptions = ''
          this.videoDivs[videoDivsValIdx].using = ''
        }
        resolve(true)
      })
    },
    // 右键通道
    selectChn(val) {
      this.contextMenuSelectChn = val
    },
    // 右键选择流
    async selectChnFlow(val) {
      const existVideoIndex = this.videoDivs.findIndex((item) => { // 查询视频列表有没有这个视频
        return Number(item.using) === this.contextMenuSelectChn.cid
      })
      if (existVideoIndex !== -1) {
        this.getChnCurrentItem({ ...this.contextMenuSelectChn, isStream: val }, existVideoIndex)
      } else {
        const haveRes = await this.haveFreeDiv()
        if (haveRes !== -1) {
          const setPlayerDivRes = await this.setPlayerDiv(this.contextMenuSelectChn.cid, haveRes, false)
          this.getChnCurrentItem({ ...this.contextMenuSelectChn, isStream: val }, setPlayerDivRes)
        } else {
          this.$message('没有空余的格子了')
        }
      }
    },
    // 子组件选择通道
    async chnCurrentItem(val) {
      const existVideoIndex = this.videoDivs.findIndex((item) => { // 查询视频列表有没有这个视频
        return Number(item.using) === val.cid
      })
      if (existVideoIndex !== -1) {
        this.$message('该通道已经在播放了!')
      } else {
        const haveRes = await this.haveFreeDiv()
        if (haveRes !== -1) {
          const setPlayerDivRes = await this.setPlayerDiv(val.cid, haveRes, false)
          const getSysDictionaryDetailRes = await this.getSysDictionaryDetail(val.beDvr.devTypeId)
          const propVal = val
          propVal.isStream = getSysDictionaryDetailRes || 1
          this.getChnCurrentItem(propVal, setPlayerDivRes)
        } else {
          this.$message('没有空余的格子了')
        }
      }
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
    // 监听子组件点击分组
    async groupClickItem(val) {
      await this.delLiveStorage('area', null)
      await this.setLiveStorage('group', val.children, 'allQueue')
      await this.setLiveStorage('group', val.children, 'playQueue')
      await this.setLiveStorage('group', null, 'extendedInfo', { pollingTime: val.pollingTime })
      this.groupPollingData = val
      this.allGroupPollingChnData = [...val.children]
      this.pollingTime = this.groupPollingData.pollingTime
      this.clearVideoDiv().then(() => {
        this.pollingPlay()
      })
    },
    // 分组轮询播放方法
    async pollingPlay() {
      // 分组轮询方法逻辑：
      // 判断分组的摄像头数组是否为空，不为空将第一个摄像头传递给 getLive 接口
      // 接口请求成功得到视频预览数据会判断是否还有空余的格子，有的话就把请求的视频预览数据填入并且播放视频流（请求方法请看 getChnCurrentItem）
      if (this.groupPollingData.children.length > 0) {
        this.groupPollingData.children[0].isStream = 1
        const haveRes = await this.haveFreeDiv()
        if (haveRes === -1) return
        console.log('this.groupPollingData.children[0]', this.groupPollingData.children[0])
        const setPlayerDivRes = await this.setPlayerDiv(this.groupPollingData.children[0].cid, haveRes, true)
        const getSysDictionaryDetailRes = await this.getSysDictionaryDetail(this.groupPollingData.children[0].beDvr.devTypeId)
        this.groupPollingData.children[0].isStream = getSysDictionaryDetailRes || 1
        this.getChnCurrentItem(this.groupPollingData.children[0], setPlayerDivRes, true)
      }
    },
    // 清除播放格子 用于点击/拖拽通道时
    async clearVideoDiv() {
      this.videoDivs.forEach((divItem, divIndex) => {
        this.$set(this.videoDivs[divIndex], 'videoOptions', '')
        this.$set(this.videoDivs[divIndex], 'using', '')
      })
      return 'ok'
    },
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
    // 实时预览缓存
    // 初始化缓存结构
    initLiveStorage() {
      const liveStorage = this.localStorageOperation('get', 'liveStorage')
      if (!liveStorage) {
        this.localStorageOperation('set', 'liveStorage', [
          { chnType: 'area', playQueue: [], allQueue: [], extendedInfo: {}},
          { chnType: 'group', playQueue: [], allQueue: [], extendedInfo: {}}
        ])
      } else {
        this.readLiveStorage()
      }
    },
    /**
     * @description 设置/更新缓存
     * @param chnType *通道类型
     * @param storageData 缓存数据（注意：设置扩展信息的时候，这个参数传 null 值!!!）
     * @param chnStorageAttr 分组播放缓存类型
     * @param extendedInfo 扩展信息
     */
    async setLiveStorage(chnType, storageData, chnStorageAttr, extendedInfo) {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async(resolve) => {
        const liveStorage = await this.getLiveStorage() // 获取全部缓存数据
        const chnTypeLiveStorage = await this.getLiveStorage(chnType) // 获取当前缓存类型数据
        if (extendedInfo) chnTypeLiveStorage[`${chnStorageAttr}`] = extendedInfo || {} // 扩展信息
        if (storageData) {
          const chnData = await this.getLiveStorage(chnType, chnStorageAttr, storageData.cid)
          if (chnData) {
            if (chnData.data) {
              chnTypeLiveStorage[`${chnStorageAttr}`][chnData.dataIndex] = storageData
            } else {
              chnTypeLiveStorage[`${chnStorageAttr}`].push(storageData)
            }
          } else {
            if (isArray(storageData)) {
              chnTypeLiveStorage[`${chnStorageAttr}`] = storageData
            } else {
              chnTypeLiveStorage[`${chnStorageAttr}`].push(storageData)
            }
          }
        }
        liveStorage[chnTypeLiveStorage.dataIndex] = chnTypeLiveStorage
        delete liveStorage[chnTypeLiveStorage.dataIndex].dataIndex
        this.localStorageOperation('set', 'liveStorage', liveStorage)
        resolve(true)
      })
    },
    /**
     * @description 删除
     * @param chnType 通道类型
     * @param deleteCid 删除通道id
     * @param chnStorageAttr 分组播放缓存类型
     */
    async delLiveStorage(chnType, deleteCid, chnStorageAttr) {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async(resolve) => {
        const liveStorage = await this.getLiveStorage() // 获取全部缓存数据
        const chnTypeLiveStorage = await this.getLiveStorage(chnType) // 获取当前缓存类型数据
        const chnData = await this.getLiveStorage(chnType, chnStorageAttr, deleteCid)
        if (!liveStorage) return
        if (deleteCid === null && chnType === 'area') { // 如果通道id为null并且是删除区域通道缓存则清空区域缓存信息
          liveStorage[chnTypeLiveStorage.dataIndex][`${chnStorageAttr}`] = []
        } else {
          if (chnData) {
            if (chnData.data) {
              liveStorage[chnTypeLiveStorage.dataIndex][`${chnStorageAttr}`].splice(chnData.dataIndex, 1)
            }
          }
        }
        delete liveStorage[chnTypeLiveStorage.dataIndex].dataIndex
        this.localStorageOperation('set', 'liveStorage', liveStorage)
        resolve(true)
      })
    },
    // 读取缓存进行缓存播放
    async readLiveStorage() {
      const areaLiveStorageData = await this.getLiveStorage('area') // 区域缓存
      const groupLiveStorageData = await this.getLiveStorage('group') // 分组缓存
      // 区域缓存
      if (areaLiveStorageData.playQueue.length > 0) {
        areaLiveStorageData.playQueue.forEach(async item => {
          item.isStoragePlay = true
          const setPlayerDivRes = await this.setPlayerDiv(item.cid, item.divIndex, false)
          this.getChnCurrentItem(item.extended, setPlayerDivRes)
        })
      }
      // 分组缓存
      if (groupLiveStorageData.extendedInfo.pollingTime) this.pollingTime = groupLiveStorageData.extendedInfo.pollingTime
      // 分组队列
      if (groupLiveStorageData.playQueue && groupLiveStorageData.playQueue.length > 0) {
        const playQueue = []
        groupLiveStorageData.playQueue.forEach(async item => {
          playQueue.push(item)
          if (item.divIndex || item.divIndex === 0) {
            item.isStoragePlay = true
            const setPlayerDivRes = await this.setPlayerDiv(item.cid, Number(item.divIndex), true)
            this.getChnCurrentItem(item, setPlayerDivRes, true)
          }
        })
        this.$set(this.groupPollingData, 'children', [...playQueue])
      }
      // 分组通道数据
      if (groupLiveStorageData.allQueue && groupLiveStorageData.allQueue.length > 0) this.allGroupPollingChnData = groupLiveStorageData.allQueue
    },
    /**
     * @description 获取指定缓存通道数据
     * @param chnType 通道类型 area & group
     * @param chnStorageAttr 分组通道类型 allChn & queue
     * @param cid 通道id
     */
    async getLiveStorage(chnType, chnStorageAttr, cid) {
      return new Promise(resolve => {
        if (!chnType) {
          resolve(this.localStorageOperation('get', 'liveStorage')) // 没有传递类型返回所有缓存数据
        } else {
          // 判断通道类型是否存在
          if (!(chnType === 'area' || chnType === 'group')) resolve(null)
          const liveStorageData = this.localStorageOperation('get', 'liveStorage')
          const chnTypeIdx = liveStorageData.findIndex(item => item.chnType === chnType)
          if (chnTypeIdx === -1) {
            resolve(null)
          } else {
            if (!chnStorageAttr) resolve({ ...liveStorageData[chnTypeIdx], dataIndex: chnTypeIdx }) // 返回当前通道类型缓存
            if (!liveStorageData[chnTypeIdx][`${chnStorageAttr}`]) resolve(null) // 不存在的缓存类型
            if (!cid) resolve(liveStorageData[chnTypeIdx][`${chnStorageAttr}`][`${chnStorageAttr}`]) // 没有指定通道id 返回当前当前通道类型缓存属性
            // 根据通道id查询通道
            const chnIdx = liveStorageData[chnTypeIdx][`${chnStorageAttr}`].findIndex(item => {
              return Number(item.cid) === Number(cid)
            })
            resolve(
              chnIdx === -1 ? { data: null, dataLength: liveStorageData[chnTypeIdx][`${chnStorageAttr}`].length } : { data: liveStorageData[chnTypeIdx][`${chnStorageAttr}`][chnIdx], dataIndex: chnIdx }
            )
          }
        }
      })
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
    // 删除指定分组通道
    async deleteAllGroupPollingChnDataItem(cid) {
      return new Promise(resolve => {
        const allGroupPollingChnDataIdx = this.allGroupPollingChnData.findIndex(item => Number(item.cid) === Number(cid))
        if (allGroupPollingChnDataIdx !== -1) this.allGroupPollingChnData.splice(allGroupPollingChnDataIdx, 1)
        resolve(true)
      })
    },
    // 删除指定本地轮询分组通道变量
    async deleteGroupPollingChnDataItem(cid) {
      return new Promise(resolve => {
        const groupPollingChnDataIdx = this.groupPollingData.children.findIndex(item => Number(item.cid) === Number(cid))
        console.log(groupPollingChnDataIdx)
        if (groupPollingChnDataIdx !== -1) this.groupPollingData.children.splice(groupPollingChnDataIdx, 1)
        resolve(true)
      })
    },
    // 监听播放窗口全屏事件
    fullScreenMonitor(val) {
      this.onFullScreenMonitor = val
      if (val.isVlc) {
        this.reInitKey = guid()
      }
    }
  }
}

</script>
<style lang="scss" scoped>
// 样式实现的全屏
.full-screen-live {
  .videos-wrap, .video-container-live, .aspectration, .video-playing {
    position: static !important;
  }
}
.cloud-controller {
  .title {
    height: 40px;
    padding: 0 14px;
    display: flex;
    justify-content: space-between;
    background: #dde3ef;
    align-items: center;
    cursor: pointer;
    font-weight: 500;
  }

  .controller {
      background: #e9ecf3;
      display: flex;
      .direction {
        padding-bottom: 10px;
        width: 112px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        .round {
          width: 100px;
          height: 100px;
          border-radius: 50px;
          position: absolute;
          top: 14px;
          left: 5px;
          border: 1px solid #666
        }

        .button-wrap {
          width: 45px;
          height: 45px;
          border-radius: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: solid 10px #fff;
          background: #0145AB;
          position: relative;

          .button_left,.button_top,.button_right,
          .button_bottom,.button_left_top,.button_right_top,
          .button_right_bottom, .button_left_bottom {
            position: absolute;
            width: 20px;
            height: 20px;
            background: #e9ecf3;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
            color: #0145AB;
            cursor: pointer;
            border: none;
            padding: 0;
            margin:0;
          }
          .button_left_top,.button_right_top,
          .button_right_bottom, .button_left_bottom {
            color: #999999;
          }
          .button_left {
            top: 3px;
            left: -31px;
            // width: 30px;
          }
          .button_left_top {
            top: -24px;
            left: -24px;
            transform: rotate(45deg);
          }
          .button_top {
            top: -30px;
            left: 4px;
          }
          .button_right_top {
            top: -24px;
            right: -25px;
            transform: rotate(45deg);
          }
          .button_right {
            top: 4px;
            right: -31px;
            // width: 30px;
          }
          .button_left_bottom {
            bottom: -24px;
            left: -24px;
            transform: rotate(45deg);
          }
          .button_bottom {
            bottom: -31px;
            left: 4px;
          }
          .button_right_bottom {
            bottom: -24px;
            right: -24px;
            transform: rotate(45deg);
          }
          .btn-reset {
            position: relative;
            z-index: 1;
            height:27px;
            padding:4px 8px;
            border-radius:3px
          }
        }
      }
      .settings {
        padding-bottom: 13px;
        flex: 1;
        display: flex;
        flex-flow: column;
        justify-content: center;

        .s-label {
          line-height: 26px;
          font-weight: 500;
          color: #666;
          text-align: center;
          margin-left: -22px;
        }
        .add-n-subtract {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 500;
          font-size: 12px;
          color:#666;
          width: 113px;
          height: 25px;
          margin-left:-4px;

          .button {
            width: 15px;
            height: 15px;
            padding: 0;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }
      }
  }
}
.video-live {
  height: 100%;
  .sideMenu {
    width: 240px;
    background: #e9ecf3;
    height: 100%;
    font-size: 14px;
    font-weight: 600;
    line-height: 36px;
    overflow: auto;
    display: inline-block;
  }
  .main-content {
    display: inline-block;
    height: 100%;
    background: #fff;
    width: calc(100% - 240px);
    .content-head {
      background: #fff;
      position: relative;
      z-index: 1;
      display: inline-block;
      height: 100%;
    }
    .switch-btn {
      width: 20px;
      height: 20px;
      margin: 9px;
      filter:grayscale(1);
      opacity: .78;
      display: block;
    }
    .switch-btn:hover {
      filter:hue-rotate(24deg);
      opacity: 1;
    }
    .switch-btn.active {
      filter:hue-rotate(24deg);
      opacity: 1;
    }
    .content-box {
      width: calc(100% - 40px);
      background: #f5f5f7;
      height: 100%;
      padding: 0 8px;
      overflow-y: scroll;
      display: inline-block;
      .videos-wrap {
        transition: all .2s;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        position: relative;
        margin: 0 auto;
        .video-container-live {
          transition: all .2s;
          position: relative;
          margin: 5px;
          .aspectration {
            width: 100%;
            height: 100%;
            background: #fff;
            position: relative;
          }
          .video-playing {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            background: #000000;

            .el-button {
              position: absolute;
              z-index: 1;
              margin: 0 !important;
              background: unset;
              border: unset;
              color: #fff;
              font-size: 26px;
            }
            .button_top {
              top: 0;
              left: 50%;
              transform: translateX(-50%);
            }
            .button_bottom {
              bottom: 0;
              left: 50%;
              transform: translateX(-50%);
            }
            .button_left {
              top: 50%;
              left: 0;
              transform: translateY(-50%);
            }
            .button_right {
              top: 50%;
              right: 0;
              transform: translateY(-50%);
            }
            .button_left_top {
              top: 0;
              left: 0;
              transform: rotate(30deg);
            }
            .button_left_bottom {
              bottom: 0;
              left: 0;
              transform: rotate(60deg);
            }
            .button_right_top {
              top: 0;
              right: 0;
              transform: rotate(60deg);
            }
            .button_right_bottom {
              bottom: 0;
              right: 0;
              transform: rotate(30deg);
            }
          }
          .no-video {
            background: #FFFFFF;
            height: 100%;
            display: flex;
            flex-flow: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            color: #666666;
            font-size: 20px;
            font-weight: 400;
            position: absolute;
            top: 0;
            left: 0;
            .hint-text {
              margin-top: 10px;
              font-weight: 500;
            }
          }
        }
        .active-div {
          border: 1px solid #0145ab;
        }
      }

      .videos-wrap.one-block {
        .video-container-live {
          width: 100% !important;
        }
        .video-container-live:nth-child(n+2) {
          display: none;
        }
      }
      .videos-wrap.four-block {
        .video-container-live {
          // margin-bottom: 10px;
        }
        .video-container-live:nth-child(n+5) {
          display: none;
        }
      }
      .videos-wrap.six-block {
        .video-container-live {
          // width: 33% !important;
          // margin: 6px;
        }
        .video-container-live:nth-child(1) {
          // width: 66.5% !important;
        }
        .video-container-live:nth-child(n+7) {
          display: none;
        }
        .video-container-live:nth-child(3) {
          position: absolute;
          right: 0;
          top: 33.4% !important;
        }
      }
      .videos-wrap.nine-block {
        .video-container-live {
          // width: 33% !important;
          // margin-bottom: 5px;
        }
      }
    }
  }
}
</style>
