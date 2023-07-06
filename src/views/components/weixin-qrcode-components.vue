<template>
  <div class="qr-wrp">
    <div v-if="isShow === false" class="qr-icon" @click="onShowQrCode">
      <svg-icon icon-class="wechat" />
    </div>
    <div v-if="isShow === true" class="qr-pic">
      <div ref="qrcodePic" class="qrcode" />
      <div class="qr-close" @click="onCloseQrCode"><i>&times;</i>关闭</div>
    </div>
  </div>
</template>

<script>
// 微信二维码绑定运维人员
import request from '@/utils/request'
import QRCode from 'qrcodejs2'
export default {
  name: '',
  data() {
    return {
      isShow: false
    }
  },
  mounted() { },
  methods: {
    onShowQrCode() {
      console.log('这里要换成api里面封装，暂时未放是免得冲突')
      this.isShow = true
      request({ // 这里要换成api里面封装，暂时未放是免得冲突
        url: '/admin/mobileUserBindQrCode'
      }).then(res => {
        new QRCode(this.$refs.qrcodePic, {
          text: res.model,
          width: 200,
          height: 200,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        })
      })
    },
    onCloseQrCode() {
      this.isShow = false
    }
  }
}
</script>

<style lang="scss" scoped>
.qr-wrp {
  position: fixed;
  right: 10px;
  bottom: 10px;
  z-index: 99999;
  .qr-icon {
    z-index:100000;
    display:inline-block;
    .svg-icon {
      width: 28px;
      height: 28px;
      vertical-align: -0.15em;
      fill: currentColor;
      overflow: hidden;
      color: #008000;
      cursor: pointer;
      &:hover {
        color: #034903;
      }
    }
  }
  .qr-pic {
    .qr-close {
      text-align: right;
      padding: 10px 0;
      cursor: pointer;
      &:hover {
        color: #034903;
      }
    }
  }
}
</style>
