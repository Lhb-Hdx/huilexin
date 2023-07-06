<template>
  <div class="hy-video-play-wrp">
    <!-- vlc插件播放器 服务器录像和设备录像共用 -->
    <vlc-player
      v-if="isInstallVCLPlugin"
      :play-host="playHostAddress"
      :is-live="false"
      :sources="videoSources"
      :set-play-num="playNum"
      :record="recordType"
      :current-block-seconds="currentBlockSeconds"
      :slider-type="sliderType"
      :show-message-tip="showMessageTip"
      @resourceRequestError="resourceRequestError"
      @closeLoading="closeLoading"
      @playUpdateTime="playUpdateTime"
      @playEnd="playEnd"
    />
    <!-- 服务器录像播放器 START -->
    <!-- 普通MP4播放器 -->
    <video-player
      v-if="recordType === 1 && !isInstallVCLPlugin && !isH265"
      :play-host="playHostAddress"
      :sources="videoSources"
      :set-play-num="playNum"
      :open-player-screenshots="openPlayerScreenshots"
      :current-block-seconds="currentBlockSeconds"
      :slider-type="sliderType"
      @closeLoading="closeLoading"
      @closePlayerScreenshots="closePlayerScreenshots"
      @playUpdateTime="playUpdateTime"
      @playEnd="playEnd"
    />
    <!-- H265 MP4播放器 -->
    <wasm-player
      v-if="recordType === 1 && !isInstallVCLPlugin && isH265"
      :play-host="playHostAddress"
      :sources="videoSources"
      :set-play-num="playNum"
      :open-player-screenshots="openPlayerScreenshots"
      :slider-type="sliderType"
      @closeLoading="closeLoading"
      @closePlayerScreenshots="closePlayerScreenshots"
      @playUpdateTime="playUpdateTime"
      @playEnd="playEnd"
    />
    <!-- 服务器录像播放器 END -->
    <!-- 设备录像播放器 START -->
    <!-- 普通设备录像播放器 -->
    <flv-player
      v-if="recordType === 2 && !isInstallVCLPlugin && !isH265"
      :is-live="false"
      :sources="videoSources"
      :set-play-num="playNum"
      :record="2"
      :open-player-screenshots="openPlayerScreenshots"
      :show-message-tip="showMessageTip"
      @resourceRequestError="resourceRequestError"
      @closeLoading="closeLoading"
      @closePlayerScreenshots="closePlayerScreenshots"
    />
    <!-- H265设备录像播放器 -->
    <hy-player
      v-if="recordType === 2 && !isInstallVCLPlugin && isH265"
      :is-live="false"
      :sources="videoSources"
      :set-play-num="playNum"
      :record="2"
      :open-player-screenshots="openPlayerScreenshots"
      :show-message-tip="showMessageTip"
      @resourceRequestError="resourceRequestError"
      @closeLoading="closeLoading"
      @closePlayerScreenshots="closePlayerScreenshots"
    />
  </div>
</template>

<script>
import { hasPlugin } from '@/utils/utils'
import VideoPlayer from '../player/video-player'
import WasmPlayer from '../player/wasm-player'
import HyPlayer from '../player/hy-player'
import VlcPlayer from '../player/vlc-player'
import FlvPlayer from '../player/flv-player'

export default {
  name: 'PlaybackPlayerContent',
  components: { VideoPlayer, WasmPlayer, VlcPlayer, HyPlayer, FlvPlayer },
  props: {
    // 录像资源
    sources: {
      type: Array,
      default() {
        return []
      }
    },
    // 标签资源
    labelSources: {
      type: Array,
      default() {
        return []
      }
    },
    // 点击播放进度条对象
    setPlayTimeObject: {
      type: Object,
      default() {
        return {}
      }
    },
    // 打开截屏
    showCanvas: {
      type: Boolean,
      default: false
    },
    // 录像类型
    recordType: {
      type: Number,
      default: 1
    },
    // 播放条数
    switchPlayNum: {
      type: Object,
      default() {
        return {}
      }
    },
    showMessageTip: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      playNum: 0,
      videoSrc: '',
      isH265: false,
      h265Src: '',
      stopH265: false,
      openPlayerScreenshots: false,
      isInstallVCLPlugin: false,
      vicPlayUrl: '',
      flvPlayer: '',
      flvUrl: '',
      closePlayer: false,
      closeFlow: false,
      rtspUrl: '',
      playHostAddress: '',
      videoSources: [],
      currentBlockSeconds: 0,
      sliderType: ''
    }
  },
  watch: {
    sources() {
      this.playNum = 0
      if (this.sources && this.sources.length > 0) {
        this.videoSources = this.sources
        this.startVideoPlay()
      }
    },
    setPlayTimeObject: {
      handler(newVal) {
        this.playNum = newVal.index
        this.currentBlockSeconds = newVal.currentBlockSeconds
        this.sliderType = newVal.sliderType
        if (newVal.sliderType === 'label') { // 点击标签进度条 将播放器资源替换成标签的视频资源
          this.videoSources = this.labelSources
        } else { // 点视频进度条
          this.videoSources = this.sources
        }
      },
      deep: true
    },
    showCanvas() {
      if (this.showCanvas === true) {
        if (!this.isInstallVCLPlugin) {
          this.openPlayerScreenshots = true
        }
      }
    },
    switchPlayNum: {
      handler(newVal) {
        if (newVal) {
          if ((this.playNum < this.sources.length) && this.sliderType !== 'label' && this.playNum >= 0) {
            if (this.playNum - 1 === -1 && newVal.switchType === 'last') return
            this.playNum = newVal.switchType === 'next' ? ++this.playNum : --this.playNum
            this.$emit('updatePlayerSliderBlock', this.sources[this.playNum])
          }
        }
      },
      deep: true
    }
  },
  mounted() {
    this.isInstallVCLPlugin = hasPlugin('VLC Web Plugin')
  },
  methods: {
    startVideoPlay() {
      const ipReg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
      const locationUrl = window.location.href.split('//')[1]
      const host = locationUrl.split('/')[0]
      const hostName = host.split(':')[0]
      const isIp = ipReg.test(hostName)
      const isHttps = document.location.protocol === 'https:' // 访问浏览器是否是https环境
      const httpType = isHttps ? 'https' : 'http' // http类型
      let port = '' // 端口
      this.videoSrc = this.sources[this.playNum].fpath
      if (this.recordType === 1) { // 服务器录像
        if (isIp) { // ip访问
          port = isHttps ? `:${this.sources[this.playNum].innerportHttps}` : `:${this.sources[this.playNum].innerportHttp}`
        } else { // 域名访问
          port = Number(this.sources[this.playNum].mappingPort) === 80 || Number(this.sources[this.playNum].mappingPort) === 443 ? '' : `:${this.sources[this.playNum].mappingPort}` // 端口
        }
        if (this.sources[this.playNum].mappingPort !== null && Number(this.sources[this.playNum].mappingPort) !== 0) {
          port = `:${this.sources[this.playNum].mappingPort}`
        } else {
          port = isHttps ? `:${this.sources[this.playNum].innerportHttps}` : `:${this.sources[this.playNum].innerportHttp}`
        }

        // 设备录像并且安装了vlc插件播放域名判断
        this.playHostAddress =
          this.recordType === 2 && this.isInstallVCLPlugin ? `rtsp://${this.sources[this.playNum].mappingPort !== null && Number(this.sources[this.playNum].mappingPort) !== 0 ? this.sources[this.playNum].host : this.$tool.getBrowserHost(true)}/` : `${httpType}://${this.sources[this.playNum].mappingPort !== null && Number(this.sources[this.playNum].mappingPort) !== 0 ? this.sources[this.playNum].host : this.$tool.getBrowserHost(true)}${port}/`
        const playSrc = `${this.videoSrc}`
        if (this.isInstallVCLPlugin) { // 安装vlc插件
          this.vicPlayUrl = playSrc
        } else { // 没有安装vlc插件
          if (this.sources[this.playNum].vedioCodec === 1) { // H265
            this.isH265 = true
            this.h265Src = playSrc
          } else { // 非H265
            this.stopH265 = true
            this.isH265 = false
          }
        }
      }
    },
    // 资源请求失败
    resourceRequestError(val) {
      this.$emit('resourceRequestError', val)
    },
    // 关闭loading
    closeLoading(val) {
      this.$emit('closeLoading', val)
    },
    // 关闭播放器截图
    closePlayerScreenshots(val) {
      this.openPlayerScreenshots = val
    },
    // 监测播放进度
    playUpdateTime(val) {
      this.$emit('playUpdateTime', val)
    },
    // 当前片段播放结束
    playEnd(val) {
      this.$emit('updatePlayerSliderBlock', val)
    }
  }
}
</script>

<style lang="scss" scoped>
.hy-video-play-wrp{
  width: 100%;
  height: 100%;
  position: relative;

  video{
    width: 100%;
    height: 100%;
  }

  .hy-video-play-bar{
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    color: #fff;
  }

  .close-record {
    position: absolute;
    right: .5%;
    top: 2%;
    z-index: 10;
    i {
      color: #FFFFFF;
      font-size: 25px;
    }
  }
}
.el-canvas-box{
    display: inline-block;
    padding-bottom: 10px;
    vertical-align: middle;
    background-color: #FFFFFF;
    border-radius: 4px;
    border: 1px solid #e6ebf5;
    font-size: 18px;
    box-shadow: 0 2px 12px 0 #d7d6d6;
    text-align: left;
    overflow: hidden;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    z-index: 2001;
    canvas{
        z-index: 2002;
    }
    .footer{text-align: center;}
}
.el-canvas{width: 100%;height: 100%;}
.el-message-box-canvas{display: none;}
.el-message-box-canvas.active{display: block;}
</style>
