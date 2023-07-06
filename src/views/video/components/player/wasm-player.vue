<template>
  <div id="wrapper" ref="wrapper">
    <canvas id="wasmPlayer" ref="wasmPlayer" :width="videoWidth" :height="videoHeight" />
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
import PlayerScreenshots from '../player-screenshots/player-screenshots'
import { hmsTos } from '@/utils/utils'

export default {
  name: 'WasmVideoPlayer',
  components: {
    PlayerScreenshots
  },
  props: {
    playHost: {
      type: String,
      default() {
        return ''
      }
    },
    sliderType: {
      type: String,
      default() {
        return ''
      }
    },
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
    openPlayerScreenshots: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      playerSrc: '',
      playSrcNum: this.setPlayNum,
      logger: null,
      videoWidth: 0,
      videoHeight: 0,
      showCanvas: false,
      showPlayerScreenshots: false,
      canvasNode: null,
      timeUpdateInterval: null
    }
  },
  watch: {
    sources: {
      handler(newVal) {
        this.loadPlayer()
      },
      deep: true
    },
    setPlayNum(newVal, oldVal) {
      if (newVal || newVal === 0) {
        this.playSrcNum = newVal
        this.loadPlayer()
      }
    },
    openPlayerScreenshots(newVal, oldVal) {
      this.showCanvas = this.openPlayerScreenshots
      if (this.showCanvas === true) {
        this.canvasNode = this.$refs.wasmPlayer
        this.showPlayerScreenshots = true
      }
    }
  },
  destroyed() {
    clearInterval(this.timeUpdateInterval)
    this.playStop()
  },
  mounted() {
    console.log('Current player：wasm-player')
    this.setVideoSize()
    window.addEventListener('resize', this.setVideoSize)
    // eslint-disable-next-line no-undef
    self.player = new Player()
    // eslint-disable-next-line no-undef
    this.logger = new Logger('Page')
    this.$nextTick(() => {
      this.loadPlayer()
    })
  },
  // 组件销毁关闭播放 实时预览
  beforeDestroy() {
    window.removeEventListener('resize', this.setVideoSize)
    if (this.isLive && this.flvPlayer) {
      this.stopVideo()
    }
  },
  methods: {
    // 播放列表切换
    playerListSwitch() {},
    // 加载播放
    loadPlayer() {
      if (!this.sources[this.playSrcNum]) return
      console.log(this.sliderType, this.sources, this.playSrcNum, this.sources[this.playSrcNum])
      this.playerSrc = this.sliderType === 'video' || !this.sliderType ? this.sources[this.playSrcNum].fpath : this.sources[this.playSrcNum].tagRecordUrl
      this.playStop()
      setTimeout(() => {
        this.$emit('closeLoading', true)
        this.playStart()
      }, 1000)
    },
    // 播放
    playStart() {
      const protoObj = {
        http: {
          url: this.playerSrc,
          waitLength: 512 * 1024,
          stream: false
        }
      }
      const url = this.playerSrc
      const currentState = self.player.getState()
      // currentState 当前状态
      // playerStatePlaying 播放状态
      // eslint-disable-next-line no-undef
      // eslint-disable-next-line no-undef
      if (currentState !== playerStatePlaying) {
        const canvasId = 'wasmPlayer'
        const canvas = document.getElementById(canvasId)
        if (!canvas) {
          this.logger.logError('No Canvas with id ' + canvasId + '!')
          return false
        }
        // 播放错误
        self.player.play(this.playHost + url, canvas, function(e) {
          clearInterval(this.timeUpdateInterval)
          console.log('play error ' + e.error + ' status ' + e.status + '.')
          if (e.error === 1) {
            this.logger.logInfo('Finished.')
          }
        }, protoObj.waitLength, protoObj.stream)

        // 设置播放长度 监听进度更新
        self.player.setTrack()
        clearInterval(this.timeUpdateInterval)
        this.timeUpdateInterval = setInterval(() => {
          const updateTrackTime = self.player.updateTrackTime()
          if (!updateTrackTime) return
          this.$emit('playUpdateTime', { currentTime: hmsTos(updateTrackTime[0]).s, ...this.sources[this.playSrcNum] })
          console.log('播放进度：', hmsTos(updateTrackTime[0]), hmsTos(updateTrackTime[1]))
          if (hmsTos(updateTrackTime[0]).s >= hmsTos(updateTrackTime[1]).s) { // 播放结束
            this.playSrcNum += 1
            clearInterval(this.timeUpdateInterval)
            if (this.sources[this.playSrcNum]) {
              if (this.sliderType === 'video' || !this.sliderType) this.$emit('playEnd', this.sources[this.playSrcNum])
              this.playerSrc = this.sliderType === 'video' || !this.sliderType ? this.sources[this.playSrcNum].fpath : this.sources[this.playSrcNum].tagRecordUrl
              this.playStop()
              setTimeout(() => {
                this.playStart()
                console.log(`Switch to play video ${this.playerSrc}`)
              }, 1500)
            }
          }
        }, 1000)
        // 当前视频播放时长
        // const videoMillisecond = (this.sources[this.playSrcNum].etime - this.sources[this.playSrcNum].stime) * 1000
        // console.log(`Video address：${this.playerSrc}，MS：${videoMillisecond} MS`)
      } else {
        // self.player.pause()
      }
    },
    // 停止
    playStop() {
      self.player.stop()
    },
    // 全屏
    fullScreen() {
      self.player.fullscreen()
    },
    // 设置播放器尺寸
    setVideoSize() {
      this.videoHeight = this.$refs.wrapper.clientHeight
      this.videoWidth = (this.$refs.wrapper.clientHeight / 9) * 16
    },
    // 关闭截图
    closePlayerScreenshots(val) {
      this.$emit('closePlayerScreenshots', val)
      this.showPlayerScreenshots = false
    },
    // 清除定时器
    async clearTimeUpdateInterval() {
      return new Promise(resolve => {
        clearInterval(this.timeUpdateInterval)
        this.timeUpdateInterval = null
        resolve(true)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
#wrapper {
  width: 100%;
  height: 100%;
  text-align: center;
}
</style>
