<template>
  <div id="wrapper" ref="wrapper">
    <close-record-flow v-if="record === 2" :record-path="onCloseRecordPath" @onCloseRecord="onCloseRecord" />
    <object
      v-if="showVLCPlayer"
      :ref="'vlc' + cid"
      type="application/x-vlc-plugin"
      events="True"
      :width="videoWidth"
      :height="videoHeight"
    >
      <param name="mrl" :value="playUrl">
      <param name="ShowDisplay" value="false">
      <param name="AutoLoop" value="false">
      <param name="AutoPlay" value="true">
      <param name="mute" value="true">
      <param name="controls" value="false">
      <param name="windowless" value="true">
      <param name="fullscreen" value="false">
      <embed>
    </object>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import CloseRecordFlow from './close-record-flow'
import { isBrowserFullScreen } from '@/utils/utils'

export default {
  name: 'VlcPlayer',
  components: {
    CloseRecordFlow
  },
  props: {
    cid: {
      type: String,
      default: ''
    },
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
    sliderType: {
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
    currentBlockSeconds: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      playUrl: '',
      videoHeight: 0,
      videoWidth: 0,
      showVLCPlayer: false,
      playerSrc: '',
      playSrcNum: this.setPlayNum,
      recordFlowUrl: '',
      playRecordCount: 0, // 请求次数
      onCloseRecordPath: ''
    }
  },
  watch: {
    // 获得播放流
    flowUrl(newVal, oldVal) {
      if (newVal !== '') {
        if (oldVal) {
          this.stopVideo()
          this.showVLCPlayer = false
        }
        const that = this
        this.$nextTick(() => {
          this.showVLCPlayer = true
          setTimeout(() => {
            that.setPlayList([{ fpath: newVal }]).then(() => {
              that.playVideo()
            })
          }, 1000)
        })
      }
    },
    // 关闭流
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
    // 录像资源
    sources(newVal, oldVal) {
      if (newVal) {
        if (oldVal) {
          this.stopVideo()
          this.showVLCPlayer = false
        }
        this.$nextTick(() => {
          if (newVal) {
            if (this.record === 1) {
              this.$emit('closeLoading', true)
              this.showVLCPlayer = true
              const that = this
              setTimeout(() => {
                that.setPlayList(newVal).then(res => {
                  that.playVideo()
                })
              }, 1000)
            } else {
              this.playRecord()
            }
          }
        })
      }
    },
    // 设置播放回访索引
    setPlayNum(newVal, oldVal) {
      if (newVal || newVal === 0) {
        this.playSrcNum = newVal
        if (this.record === 1) {
          const that = this
          that.playVideo()
        } else {
          this.playRecord()
        }
      }
    }
  },
  mounted() {
    console.log('Current player：vlc-player')
    this.setVideoSize()
    var elementResizeDetectorMaker = require('element-resize-detector')
    var erd = elementResizeDetectorMaker()
    const that = this
    erd.listenTo(this.$refs.wrapper, function(element) {
      that.setVideoSize()
    })
  },
  // 组件销毁关闭播放 实时预览
  beforeDestroy() {
    if (this.isLive) {
      console.log('卸载VLC组件')
      this.stopVideo()
    }
  },
  methods: {
    // 设置播放列表
    async setPlayList(sources) {
      this.registerVLCEvent('MediaPlayerTimeChanged', this.watchMediaPlayerTimeChanged) // 监听时间改变
      this.registerVLCEvent('MediaPlayerEncounteredError', this.watchMediaPlayerEncounteredError) // 监听播放错误
      this.registerVLCEvent('MediaPlayerPlaying', this.watchMediaPlayerPlaying) // 监听播放中状态
      this.registerVLCEvent('MediaPlayerLengthChanged', this.watchMediaPlayerLengthChanged) // 监听长度改变
      const vlc = this.$refs[`vlc${this.cid}`]
      vlc.playlist.clear()
      const options = [':rtsp-tcp']
      const that = this
      await sources.forEach(item => { // 遍历资源生成播放列表
        const playerSrc = this.sliderType === 'video' || !this.sliderType ? item.fpath : item.tagRecordUrl
        vlc.playlist.add(that.playHost + playerSrc, '', options)
      })
    },
    // 播放
    playVideo() {
      this.$emit('playLoad', true)
      const vlc = this.$refs[`vlc${this.cid}`]
      // 播放当前选择的视频索引
      vlc.playlist.playItem(this.playSrcNum)
      if (this.sliderType === 'video') {
        vlc.input.time = this.currentBlockSeconds * 1000
      }
    },
    // 设置播放器尺寸
    setVideoSize() {
      this.videoHeight = isBrowserFullScreen() ? this.getViewportSize().height : this.$refs.wrapper.clientHeight
      this.videoWidth = isBrowserFullScreen() ? this.getViewportSize().width : this.$refs.wrapper.clientWidth
    },
    // 停止
    stopVideo() {
      const vlc = this.$refs[`vlc${this.cid}`]
      if (vlc) {
        if (vlc.playlist) {
          vlc.playlist.pause()
          vlc.playlist.items.clear()
          vlc.playlist.stop()
        }
      }
    },
    // 暂停/开始
    pauseVideo() {
      const vlc = this.$refs[`vlc${this.cid}`]
      if (vlc) {
        if (vlc.playlist.isPlaying) {
          vlc.playlist.togglePause()
        } else {
          vlc.playlist.play()
        }
      }
    },
    // 获取设备录像地址
    playRecord() {
      request({
        url: api.video.playRecord, data: { fpath: this.sources[this.playSrcNum].fpath }
      }).then(res => {
        if (res.code === 1) {
          this.$emit('closeLoading', true)
          this.playRecordCount = 0
          this.showVLCPlayer = true
          const that = this
          setTimeout(() => {
            that.setPlayList([{ fpath: 'rtsp://iot.huiyuntc.net/' + res.map.mes.rtspUrl }]).then(res => {
              that.playVideo()
            })
          }, 1000)
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
    // 注册vlc播放器事件
    registerVLCEvent(event, handler) {
      const vlc = this.$refs[`vlc${this.cid}`]
      if (vlc) {
        if (vlc.attachEvent) {
          // Microsoft
          vlc.attachEvent(event, handler)
        } else if (vlc.addEventListener) {
          // Mozilla: DOM level 2
          vlc.addEventListener(event, handler, false)
        }
      }
    },
    // 检查播放发生错误
    watchMediaPlayerEncounteredError() {
      if (this.isLive) { // 实时预览播放失败
        this.$message.error(`摄像头 ${this.videoChnInfo.dvr}${this.videoChnInfo.chn} 播放失败`)
        this.$emit('playSuccess', false)
      } else {
        this.$message({
          message: '播放发生错误',
          type: 'error',
          duration: 5 * 1000
        })
      }
    },
    onCloseRecord() {
      this.onCloseRecordPath = this.sources[this.playSrcNum].fpath
    },
    watchMediaPlayerTimeChanged(time) {
      this.$emit('playUpdateTime', { currentTime: time / 1000, ...this.sources[this.playSrcNum] })
    },
    watchMediaPlayerPlaying() {
      this.$emit('playSuccess', true)
    },
    watchMediaPlayerLengthChanged() {
      if (this.isLive) return
      if (this.sliderType === 'video' || !this.sliderType) this.$emit('playEnd', this.sources[this.playSrcNum++])
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
