<template>
  <div id="wrapper" ref="wrapper">
    <close-record-flow v-if="record === 2" :record-path="onCloseRecordPath" @onCloseRecord="onCloseRecord" />
    <video
      ref="flvPlayer"
      autoplay
      class="video-player vjs-custom-skin"
      muted
    />
    <player-screenshots
      :show-player-screenshots="showPlayerScreenshots"
      :canvas-node="canvasNode"
      :canvas-width="videoWidth"
      :canvas-height="videoHeight"
      @closePlayerScreenshots="closePlayerScreenshots"
    />
  </div>
</template>

<script>
import flvjs from 'flv.js'
import { playerHostInfo } from '@/utils/utils'
import request from '@/utils/request'
import api from '@/api/api'
import PlayerScreenshots from '../player-screenshots/player-screenshots'
import CloseRecordFlow from './close-record-flow'

export default {
  name: 'FlvPlayer',
  components: {
    PlayerScreenshots, CloseRecordFlow
  },
  props: {
    isLive: {
      type: Boolean,
      default: false
    },
    playHost: {
      type: String,
      default() {
        return ''
      }
    },
    showMessageTip: {
      type: Boolean,
      default: true
    },
    /* 实时预览参数 */
    flowUrl: {
      type: String,
      default() {
        return ''
      }
    },
    playerClose: {
      type: Boolean,
      default: false
    },
    flowClose: {
      type: Boolean,
      default: false
    },
    videoChnInfo: {
      type: Object,
      default() {
        return {}
      }
    },
    /* 录像播放参数 */
    sources: {
      type: Array,
      default() {
        return []
      }
    },
    setPlayNum: {
      type: Number,
      default: 0
    },
    record: {
      type: Number,
      default: 1
    },
    openPlayerScreenshots: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      flvPlayer: null,
      playerSrc: '',
      playSrcNum: this.setPlayNum,
      recordFlowUrl: '',
      playRecordCount: 0, // 请求次数
      videoWidth: 0,
      videoHeight: 0,
      showCanvas: false,
      showPlayerScreenshots: false,
      canvasNode: null,
      onCloseRecordPath: ''
    }
  },
  watch: {
    flowUrl(newVal) {
      if (newVal) {
        this.loadPlayer()
      }
    },
    flowClose(newVal) {
      if (newVal) {
        this.stopVideo()
        if (this.playerClose) {
          this.$nextTick(() => {
            this.$emit('flowCloseSuccess')
          })
        }
      }
    },
    sources(newVal) {
      if (newVal) {
        if (this.record === 2) {
          this.playRecord()
        }
      }
    },
    setPlayNum(newVal, oldVal) {
      if (newVal || newVal === 0) {
        this.playSrcNum = newVal
        this.playRecord()
      }
    },
    openPlayerScreenshots(newVal, oldVal) {
      this.showCanvas = this.openPlayerScreenshots
      if (this.showCanvas === true) {
        this.canvasNode = this.$refs.flvPlayer
        this.showPlayerScreenshots = true
      }
    }
  },
  mounted() {
    console.log('Current player：flv-player')
    this.setVideoSize()
    window.addEventListener('resize', this.setVideoSize)
  },
  // 组件销毁关闭播放 实时预览
  beforeDestroy() {
    window.removeEventListener('resize', this.setVideoSize)
    if (this.isLive && this.flvPlayer) {
      this.stopVideo()
    }
  },
  methods: {
    // 加载播放器
    loadPlayer() {
      const playUrl = this.isLive && this.record === 1 ? this.playHost + this.flowUrl : this.playHost + this.recordFlowUrl
      this.$nextTick(() => {
        const flvPlayer = this.$refs.flvPlayer
        this.flvPlayer = flvjs.createPlayer({
          type: 'flv',
          url: playUrl,
          isLive: true,
          hasAudio: false
        })
        console.log(playUrl)
        this.flvPlayer.attachMediaElement(flvPlayer)
        this.flvPlayer.on('error', (err) => {
          console.log('播放失败', err)
          if (this.isLive) { // 实时预览播放失败
            if (this.showMessageTip) this.$message.error(`摄像头 ${this.videoChnInfo.dvr}${this.videoChnInfo.chn} 播放失败`)
            this.$emit('playSuccess', false)
          }
        })
        this.playStart()
      })
    },
    // 开始播放
    playStart() {
      this.$emit('playLoad', true)
      this.flvPlayer.load()
      this.flvPlayer.play().then(() => {
        this.$emit('playSuccess', true)
      })
    },
    // 获取设备录像地址
    playRecord() {
      request({
        url: api.video.playRecord, data: { fpath: this.sources[this.playSrcNum].fpath }
      }).then(res => {
        if (res.code === 1) {
          this.playRecordCount = 0
          const playerHostInfoResult = playerHostInfo()
          let port = '' // 端口
          if (playerHostInfoResult.isIp) { // ip访问
            port = playerHostInfoResult.isHttps ? `:${res.map.mes.innerportHttps}` : `:${res.map.mes.innerportHttp}`
          } else { // 域名访问
            port = Number(res.map.mes.mappingPort) === 80 || Number(res.map.mes.mappingPort) === 443 ? '' : `:${res.map.mes.mappingPort}`
          }

          if (res.map.mes.mappingPort !== null) {
            port = `:${res.map.mes.mappingPort}`
          } else {
            port = playerHostInfoResult.isHttps ? `:${res.map.mes.innerportHttps}` : `:${res.map.mes.innerportHttp}`
          }

          this.recordFlowUrl = `${playerHostInfoResult.httpType}://${res.map.mes.mappingPort !== null ? res.map.mes.host : this.$tool.getBrowserHost(true)}${port}/${res.map.mes.flvPlayUrl}`
          this.$emit('closeLoading', true)
          this.loadPlayer()
        } else {
          this.playRecordCount++
          if (this.playRecordCount < 3) {
            this.playRecord()
          } else { // 三次请求失败后提醒
            this.playRecordCount = 0
            if (this.showMessageTip) this.$message({ message: '请求失败', type: 'error', duration: 5 * 1000 })
            if (this.playSrcNum === 0) {
              this.$emit('resourceRequestError', true)
            }
          }
        }
      })
    },
    // 设置播放器尺寸
    setVideoSize() {
      this.videoHeight = this.$refs.wrapper.clientHeight
      this.videoWidth = ((this.$refs.wrapper.clientHeight / 9) * 16) + 5
    },
    // 关闭截图
    closePlayerScreenshots(val) {
      this.$emit('closePlayerScreenshots', val)
      this.showPlayerScreenshots = false
    },
    // 关闭设备录像
    onCloseRecord() {
      this.onCloseRecordPath = this.sources[this.playSrcNum].fpath
    },
    // 关闭播放器
    stopVideo() {
      if (this.flvPlayer === null) return
      this.flvPlayer.pause()
      this.flvPlayer.unload()
      this.flvPlayer.detachMediaElement()
      this.flvPlayer.destroy()
      this.flvPlayer = null
    }
  }
}
</script>

<style lang="scss" scoped>
#wrapper {
  width: 100%;
  height: 100%;
  text-align: center;

  video {
    height: 100%;
    width: 100%;
    object-fit: fill; // 处理黑边
  }
}
</style>
