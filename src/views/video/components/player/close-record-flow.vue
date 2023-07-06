<template>
  <div class="close-record pointer">
    <i class="el-icon-close" @click.stop="onCloseRecord" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'CloseRecordFlow',
  props: {
    // 流地址
    recordPath: {
      type: String,
      default: ''
    }
  },
  watch: {
    recordPath(newValue) {
      if (newValue) {
        this.closeRecord()
      }
    }
  },
  methods: {
    // 关闭nvr播放流
    onCloseRecord() {
      this.$emit('onCloseRecord', true)
    },
    // 请求关闭流接口
    closeRecord() {
      request({
        url: api.video.closeRecord, data: { fpath: this.recordPath }
      }).then(res => {
        if (res.code === 1) {
          console.log(`NVR流地址：${this.recordPath} 已关闭`)
        } else {
          console.log(`NVR流地址：${this.recordPath} 关闭失败`)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
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
</style>
