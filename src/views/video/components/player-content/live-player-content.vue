<template>
  <div :class="['videoPlayerBox', isControlling ? 'controlling' : '', playerFullScreen ? 'full-screen-player-box' : '']">
    <div class="controlButton isHoverControlButton">
      <div class="controlButton-main">
        <template v-if="options.inReplaceOver && inPlayLoad">
          <el-tooltip
            v-if="!playerFullScreen"
            class="item"
            effect="dark"
            :content="options.beDvr.title + ' ' + options.cname + ' ' + videoFlow(options.flow) + ' ' + vedioCodec(options.vedioCodec) + ' ' + audioCodec(options.audioCodec) + ' ' + options.videoHeight + 'x' + options.videoWidth"
            placement="top"
          >
            <i class="el-icon-more pointer" />
          </el-tooltip>
          <i v-if="!playerFullScreen" class="el-icon-full-screen margin-left-5 pointer" @click.stop="onFullScreen" />
        </template>
        <i class="el-icon-close margin-left-5 pointer" @click.stop="closeVideo" />
      </div>
    </div>
    <div v-if="inPlayerLoading" class="video-loading">正在缓冲...</div>
    <vlc-player
      v-if="!isClearPlayerComponent && isInstallVCLPlugin"
      :cid="cid"
      :is-live="true"
      :play-host="playHostAddress"
      :flow-url="flowUrl"
      :flow-close="flowClose"
      :player-close="playerClose"
      :video-chn-info="videoChnInfo"
      :show-message-tip="showMessageTip"
      @flowCloseSuccess="flowCloseSuccess"
      @playSuccess="playSuccess"
      @playLoad="playLoad"
    />
    <flv-player
      v-if="!isClearPlayerComponent && !isInstallVCLPlugin && !isH265"
      :is-live="true"
      :play-host="playHostAddress"
      :flow-url="flowUrl"
      :flow-close="flowClose"
      :player-close="playerClose"
      :video-chn-info="videoChnInfo"
      :show-message-tip="showMessageTip"
      @flowCloseSuccess="flowCloseSuccess"
      @playSuccess="playSuccess"
      @playLoad="playLoad"
    />
    <hy-player
      v-if="!isClearPlayerComponent && !isInstallVCLPlugin && isH265"
      :is-live="true"
      :play-host="playHostAddress"
      :flow-url="flowUrl"
      :flow-close="flowClose"
      :player-close="playerClose"
      :video-chn-info="videoChnInfo"
      :show-message-tip="showMessageTip"
      @flowCloseSuccess="flowCloseSuccess"
      @playSuccess="playSuccess"
      @playLoad="playLoad"
    />
  </div>
</template>

<script>
import { hasPlugin, openBrowserFullScreen, closeBrowserFullScreen } from '@/utils/utils'
import HyPlayer from '../player/hy-player'
import VlcPlayer from '../player/vlc-player'
import FlvPlayer from '../player/flv-player'

export default {
  name: 'LivePlayerContent',
  components: {
    HyPlayer, VlcPlayer, FlvPlayer
  },
  props: {
    options: {
      type: Object,
      default() {
        return {}
      }
    },
    cid: {
      type: String,
      default: ''
    },
    isControlling: {
      type: Boolean,
      default: false
    },
    // 分组轮询时间
    groupPollingTime: {
      type: Number,
      default: 0
    },
    // 是否分组
    isGroup: {
      type: Boolean,
      default: false
    },
    // 浏览器全屏关闭
    isBrowserFullScreen: {
      type: Boolean,
      default: false
    },
    // 重新初始化播放器key值
    reInitKey: {
      type: String,
      default: ''
    },
    // 制定重新初始化通道id
    assignReInitKeyCids: {
      type: Array,
      default() {
        return []
      }
    },
    closeVideoDialogKey: {
      type: Boolean,
      default: false
    },
    showMessageTip: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      flvPlayer: '',
      flvUrl: '',
      closePlayer: false,
      flowClose: false,
      isH265: false,
      isInstallVCLPlugin: false,
      rtspUrl: '',
      playHostAddress: '',
      flowUrl: '',
      playerClose: false,
      playerFullScreen: false,
      inPlayerLoading: true,
      inPlayLoad: false,
      isClickClose: false,
      pollingTimeOut: null, // 轮询倒计时
      activePollingTime: 0, // 当前启动轮询时间
      pausePollingTime: null, // 暂停轮询时间
      isClearPlayerComponent: false, // 是否清除掉播放器组件
      videoChnInfo: {}
    }
  },
  computed: {
    videoFlow() { // 视频流类型
      return (flow) => {
        let videoFlow = ''
        switch (flow) {
          case 1:
            videoFlow = '主码流'
            break
          case 2:
            videoFlow = '子码流'
            break
          case 3:
            videoFlow = '第三流'
            break
          default:
            break
        }
        return videoFlow
      }
    },
    vedioCodec() { // 视频编码
      return (code) => {
        let vedioCodec = ''
        switch (code) {
          case 0:
            vedioCodec = 'H264'
            break
          case 1:
            vedioCodec = 'H265'
            break
          default:
            vedioCodec = '未知视频格式'
            break
        }
        return vedioCodec
      }
    },
    audioCodec() { // 音频编码
      return (code) => {
        let audioCodec = ''
        switch (code) {
          case 2:
            audioCodec = 'AAC'
            break
          case 3:
            audioCodec = 'G711A'
            break
          case 4:
            audioCodec = 'G711U'
            break
          case 5:
            audioCodec = '0pus'
            break
          default:
            audioCodec = '未知音频格式'
            break
        }
        return audioCodec
      }
    }
  },
  watch: {
    options: {
      handler(newVal, oldVal) {
        if (newVal && this.reInitKey === '') {
          this.flowClose = true
          this.$nextTick(() => {
            this.createVideo()
          })
        }
      },
      deep: true
    },
    isBrowserFullScreen(newVal) {
      if (!newVal) {
        this.closePlayerFullScreen()
      }
    },
    // 重新初始化 vlc播放器调用
    reInitKey(newVal) {
      if (this.isInstallVCLPlugin && newVal !== '') {
        if (this.assignReInitKeyCids.length === 0 || this.assignReInitKeyCids.indexOf(this.cid) !== -1) {
          this.isClearPlayerComponent = true
          this.playHostAddress = ''
          this.flowUrl = ''
          const that = this
          // 用延时器开启组件和创建播放避免插件崩溃
          setTimeout(() => {
            that.isClearPlayerComponent = false // 创建组件
          }, 200)
          setTimeout(() => {
            that.createVideo() // 创建播放器
          }, 300)
        }
      }
    },
    closeVideoDialogKey(newVal) {
      if (newVal === true) {
        this.closeVideo()
      }
    }
  },
  mounted() {
    // 获取是否安装vlc
    this.isInstallVCLPlugin = hasPlugin('VLC Web Plugin')
    // 创建播放器
    this.$nextTick(() => {
      if (this.options.beDvr && this.reInitKey === '') {
        this.createVideo()
      }
    })
    // 分组轮询设置轮倒计时
    if (this.isGroup) {
      this.activePollingTime = new Date().getTime()
      const that = this
      this.pollingTimeOut = setTimeout(() => {
        that.flowClose = true // 关闭流
        that.playerClose = true // 关闭播放器
        that.isClickClose = false // 是否手动关闭
      }, this.groupPollingTime * 1000)
    }
  },
  methods: {
    createVideo() {
      const ipReg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
      const locationUrl = window.location.href.split('//')[1]
      const host = locationUrl.split('/')[0]
      const hostName = host.split(':')[0]
      const isIp = ipReg.test(hostName === 'localhost' ? '127.0.0.1' : hostName)
      const isHttps = document.location.protocol === 'https:' // 访问浏览器是否是https环境
      const httpType = isHttps ? 'https' : 'http' // http类型
      let port = '' // 端口
      if (isIp && process.env.NODE_ENV === 'production') {
        port = isHttps ? `:${this.options.innerportHttps}` : `:${this.options.innerportHttp}`
      } else {
        port = this.options.mappingPort === 80 || this.options.mappingPort === 443 ? '' : `:${this.options.mappingPort}`
      }
      if (this.options.mappingPort !== null && Number(this.options.mappingPort) !== 0) {
        port = `:${this.options.mappingPort}`
      } else {
        port = isHttps ? `:${this.options.innerportHttps}` : `:${this.options.innerportHttp}`
      }
      this.videoChnInfo = {
        dvr: this.options.beDvr.title,
        chn: this.options.cname
      }
      this.isH265 = this.vedioCodec(this.options.vedioCodec) === 'H265'
      this.flowClose = false
      if (this.isInstallVCLPlugin) { // 安装了VLC播放器插件
        this.playHostAddress = `rtsp://${this.options.mappingPort !== null && Number(this.options.mappingPort) !== 0 ? this.options.host : this.$tool.getBrowserHost(true)}/`
        this.flowUrl = this.options.rtspUrl
      } else {
        const agreement = this.isH265 ? httpType : 'ws'
        this.playHostAddress = `${agreement}://${this.options.mappingPort !== null && Number(this.options.mappingPort) !== 0 ? this.options.host : this.$tool.getBrowserHost(true)}${port}/`
        this.flowUrl = this.options.flvPlayUrl
      }
    },
    closeVideo() {
      if (this.playerFullScreen) {
        this.closePlayerFullScreen(true)
        return
      }
      this.flowClose = true
      this.playerClose = true
      this.isClickClose = true
    },
    flowCloseSuccess() {
      this.$emit('closeMonitor', { cid: this.cid, isGroup: this.isGroup, isClickClose: this.isClickClose })
    },
    onFullScreen() {
      if (this.isGroup) {
        clearTimeout(this.pollingTimeOut)
        this.pausePollingTime = new Date().getTime()
      }
      openBrowserFullScreen()
      this.playerFullScreen = true
      this.$emit('fullScreenMonitor', { isFullScreen: this.playerFullScreen, cid: this.cid, isVlc: this.isInstallVCLPlugin })
    },
    playSuccess(val) {
      if (val) {
        this.inPlayerLoading = false
      } else {
        this.$emit('closeMonitor', { cid: this.cid, isGroup: this.isGroup, isClickClose: this.isClickClose })
      }
    },
    playLoad(val) {
      if (val) {
        this.inPlayLoad = true
      }
    },
    closePlayerFullScreen(isOnClickClose) {
      this.playerFullScreen = false
      if (isOnClickClose) closeBrowserFullScreen()
      this.$emit('fullScreenMonitor', { isFullScreen: this.playerFullScreen, cid: this.cid, isVlc: this.isInstallVCLPlugin })
      if (!this.isGroup) return
      const that = this
      if (this.pausePollingTime) {
        console.log('剩余轮询时间：', (this.activePollingTime + (this.groupPollingTime * 1000)) - this.pausePollingTime)
        this.pollingTimeOut = setTimeout(() => {
          that.flowClose = true
          that.playerClose = true
          that.isClickClose = false
        }, (this.activePollingTime + (this.groupPollingTime * 1000)) - this.pausePollingTime)
      }
      this.pausePollingTime = null
    }
  }
}
</script>

<style lang="scss" scoped>
.full-screen-player-box {
  position: absolute !important;
  z-index: 9999 !important;
  left: 0 !important;
  top: 0 !important;
}
.videoPlayerBox{
  width: 100%;
  height: 100%;
  position: relative;
  video{
    width: 100%;
    height: 100%;
    background: #000;
  }
  .controlButton {
    position: absolute;
    width: 100%;
    padding: 10px;
    color: #fff;
    font-size: 18px;
    top: 0;
    z-index: 9999;
    .controlButton-main {
      display: flex;
      width: 100%;
      justify-content: flex-end;
    }
  }
  .isHoverControlButton {
    display: none;
  }
  .video-loading {
    height: 100%;
    width: 100%;
    background: #000;
    color: #fff;
    font-size: 16px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.videoPlayerBox.controlling {
  box-shadow:  #597cb0 0 1px 3px 3px ;
}
.videoPlayerBox:hover .isHoverControlButton {
  display: block;
  cursor: pointer;
  color: #fff;
}
.videoPlayerBox:hover .controllingTips {
    display: none;
}
video::-webkit-media-controls-timeline {
  display: none;
}
video::-webkit-media-controls-current-time-display{
  display: none;
}
</style>
