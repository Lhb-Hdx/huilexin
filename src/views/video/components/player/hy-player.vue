<template>
  <div id="wrapper" ref="wrapper">
    <close-record-flow v-if="record === 2" :record-path="onCloseRecordPath" @onCloseRecord="onCloseRecord" />
    <canvas id="hyPlayer" ref="hyPlayer" />
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
import request from '@/utils/request'
import api from '@/api/api'
import { playerHostInfo } from '@/utils/utils'
import PlayerScreenshots from '../player-screenshots/player-screenshots'
import CloseRecordFlow from './close-record-flow'

export default {
  name: 'HyPlayer',
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
      videoHeight: 400,
      videoWidth: 800,
      player: null,
      iUrl: '',
      iH265: true,
      iIsLive: true,
      iHasVideo: true,
      iHasAudio: true,
      iAutoPlay: true,
      iLoop: true,
      iChunkSize: 128,
      iBuffer: 500,
      iPreload: 500,
      playerSrc: '',
      playSrcNum: this.setPlayNum,
      showCanvas: false,
      showPlayerScreenshots: false,
      canvasNode: null,
      onCloseRecordPath: ''
    }
  },
  watch: {
    flowUrl(newVal) {
      if (newVal) {
        this.playStart()
      }
    },
    flowClose(newVal) {
      if (newVal) {
        this.player.stop()
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
        this.canvasNode = this.$refs.hyPlayer
        this.showPlayerScreenshots = true
      }
    }
  },
  mounted() {
    console.log('Current player：hy-player')
    this.playStart() // 播放
  },
  // 组件销毁关闭播放 实时预览
  beforeDestroy() {
    this.player.stop()
  },
  methods: {
    // 获取配置
    getOptions() {
      const playUrl = this.isLive ? this.flowUrl : this.sources[this.playSrcNum].fpath
      return {
        url: this.playHost + playUrl,
        $container: this.$refs.hyPlayer,
        hasVideo: this.iHasVideo,
        hasAudio: this.iHasAudio,
        volume: 1.0,
        muted: false,
        autoplay: this.iAutoPlay,
        loop: this.iLoop,
        isLive: this.iIsLive,
        chunkSize: parseInt(this.iChunkSize) * 1024,
        preloadTime: parseInt(this.iPreload),
        bufferingTime: parseInt(this.iBuffer),
        cacheSegmentCount: 64,
        customLoader: null
      }
    },
    // 加载播放器
    loadPlayer() { // 初始化播放器
      const that = this
      const isH265 = this.iH265
      // eslint-disable-next-line no-undef
      hyPlayer.init({
        asmUrl: './hy-player-core/prod.' + (isH265 ? 'h265' : 'all') + '.asm.combine.js',
        wasmUrl: './hy-player-core/prod.' + (isH265 ? 'h265' : 'all') + '.wasm.combine.js'
      })
      // eslint-disable-next-line no-undef
      return hyPlayer.ready().then(() => {
        // eslint-disable-next-line no-undef,new-cap
        that.player = new hyPlayer(that.getOptions())
        that.player.on('loadError', (err) => { // 加载失败
          console.log('播放失败', err)
          if (this.isLive) { // 实时预览播放失败
            if (this.showMessageTip) this.$message.error(`摄像头 ${this.videoChnInfo.dvr}${this.videoChnInfo.chn} 播放失败`)
            this.$emit('playSuccess', false)
          }
        })
        that.player.on('mediaInfo', (mediaInfo) => {
          const { onMetaData } = mediaInfo
          // 注意：这里是指定绘制的真实分辨率。若要让canvas拉伸填满指定的高宽，则由css的style.width和style.height决定。
          this.$refs.hyPlayer.height = onMetaData.height || this.videoHeight
          this.$refs.hyPlayer.width = onMetaData.width || this.videoWidth
        })
        that.player.on('play', () => {
          this.$emit('playSuccess', true)
        })
      })
    },
    // 开始播放
    playStart() {
      this.$emit('playLoad', true)
      this.loadPlayer(this.getOptions()).then(() => {
        this.player.play()
      })
    },
    // 获取设备录像地址
    playRecord(callback) {
      request({
        url: api.video.playRecord, data: { fpath: this.videoSrc }
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
          this.recordFlowUrl = `${playerHostInfoResult.httpType}://${res.map.mes.host}${port}/${res.map.mes.flvPlayUrl}`
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
    // 关闭截图
    closePlayerScreenshots(val) {
      this.$emit('closePlayerScreenshots', val)
      this.showPlayerScreenshots = false
    },
    // 设置播放器尺寸
    setVideoSize() {
      this.videoHeight = this.$refs.wrapper.clientHeight
      this.videoWidth = (this.$refs.wrapper.clientHeight / 9) * 16
    },
    onCloseRecord() {
      this.onCloseRecordPath = this.videoSrc
    }
  }
}
</script>

<style lang="scss" scoped>
#wrapper, #hyPlayer {
  width: 100%;
  height: 100%;
}
</style>
