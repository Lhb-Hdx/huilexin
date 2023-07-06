<template>
  <div ref="wrapper" class="video-player-content">
    <video
      ref="videoPlayer"
      autoplay
      @timeupdate="playUpdateTime"
      @ended="playEnd"
      @play="playReadyState"
      @setPlayTime="setPlayTime"
    >
      <source :src="playHost + playerSrc" type="video/mp4">
    </video>
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

export default {
  name: 'VideoPlayer',
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
    },
    currentBlockSeconds: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      playerSrc: '',
      playSrcNum: this.setPlayNum,
      videoWidth: 0,
      videoHeight: 0,
      showCanvas: false,
      showPlayerScreenshots: false,
      canvasNode: null
    }
  },
  watch: {
    sources: {
      handler() {
        this.loadPlayer()
      },
      deep: true
    },
    setPlayNum: {
      handler(newVal) {
        if (newVal || newVal === 0) {
          this.playSrcNum = newVal
          this.loadPlayer()
        }
      },
      deep: true
    },
    openPlayerScreenshots(newVal, oldVal) {
      this.showCanvas = this.openPlayerScreenshots
      if (this.showCanvas === true) {
        this.canvasNode = this.$refs.videoPlayer
        this.videoHeight = this.$refs.wrapper.clientHeight
        this.videoWidth = (this.$refs.wrapper.clientHeight / 9) * 16
        this.showPlayerScreenshots = true
      }
    }
  },
  mounted() {
    console.log('Current player：video-player')
  },
  methods: {
    // 加载播放器
    loadPlayer() {
      if (this.sources[this.playSrcNum]) {
        this.playerSrc = this.sliderType === 'video' || !this.sliderType ? this.sources[this.playSrcNum].fpath : this.sources[this.playSrcNum].tagRecordUrl
        this.$refs.videoPlayer.src = this.playHost + this.playerSrc
        // this.playStart()
        this.$emit('closeLoading', true)
        this.$refs.videoPlayer.setAttribute('crossOrigin', 'anonymous')
      }
    },
    // 开始播放
    playStart() {
      if (this.sliderType === 'video') {
        this.$refs.videoPlayer.currentTime = this.currentBlockSeconds
      }
      this.$refs.videoPlayer.setAttribute('crossOrigin', 'anonymous')
      this.$refs.videoPlayer.load()
      this.$refs.videoPlayer.play()
      this.$emit('closeLoading', true)
    },
    playUpdateTime(e) {
      this.$emit('playUpdateTime', { currentTime: e.target.currentTime, ...this.sources[this.playSrcNum] })
    },
    playEnd() {
      if (this.sources && this.sources.length > 0 && this.playSrcNum < this.sources.length - 1) {
        this.playSrcNum += 1
        if (this.sliderType === 'video' || !this.sliderType) this.$emit('playEnd', this.sources[this.playSrcNum])
        this.playerSrc = this.sliderType === 'video' || !this.sliderType ? this.sources[this.playSrcNum].fpath : this.sources[this.playSrcNum].tagRecordUrl
        this.$refs.videoPlayer.src = this.playHost + this.playerSrc
        // this.playStart()
      }
    },
    playReadyState() {},
    setPlayTime() {},
    // 关闭截图
    closePlayerScreenshots(val) {
      this.$emit('closePlayerScreenshots', val)
      this.showPlayerScreenshots = false
    }
  }
}
</script>

<style lang="scss" scoped>
.video-player-content {
  text-align: center;
  width: 100%;
  height: 100%;
  position: relative;
  video{
    width: 100%;
    height: 100%;
  }
}
</style>
