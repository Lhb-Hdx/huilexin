<template>
  <div>
    <div class="main_side">
      <div calss="layui-form-item">
        <h1 class="font-family" style="text-align:center;margin-bottom: 20px;">慧乐信产品授权</h1>
      </div>
      <div class="box">
        <div class="box-left">
          <div class="box-body">
            <div class="item flexBox align-item-center">
              <div class="lbl">产品型号：</div>
              <div id="model" class="val">{{ model }}</div>
            </div>
            <div class="item flexBox align-item-center">
              <div class="lbl">版本号：</div>
              <div id="version" class="val">{{ version }}</div>
            </div>
            <div class="item flexBox align-item-center">
              <div class="lbl">序列号：</div>
              <div id="series" class="val">{{ series }}</div>
            </div>
            <div class="item">
              <VueBarcode :value="series" />
            </div>
            <div class="item">
              <div class="lbl" />
              <div id="submit">
                <button type="button" class="licenesUpload" @click="licenesUpload">License 上 传</button>
                <input ref="uploadFile" type="file" style="opacity:0" @change="changeFile">
              </div>
            </div>
          </div>
        </div>
        <div class="box-right">
          <div id="qrcode-pic" ref="qrcodePic" />
          <div class="tip">微信扫描</div>
          <div class="device_download">
            <button type="button" class="licenesUpload" @click="onDeviceUpload">Device 下 载</button>
            <form ref="deviceForm" :action="action" method="post" target="_blank" />
          </div>
        </div>
      </div>
    </div>
    <div class="layui-form-item" />
  </div>
</template>

<script>
import request from '@/utils/request'
import QRCode from 'qrcodejs2'
import VueBarcode from 'vue-barcode'
import JsBarcode from 'jsbarcode'

export default {
  components: { VueBarcode },
  data() {
    return {
      version: null, series: '', model: null, action: process.env.VUE_APP_BASE_API + '/authorization.device.download'
    }
  },
  mounted() {
    this.authorization()
  },
  methods: {
    authorization() {
      request({
        url: '/authorization.device', notNeedToken: true
      }).then(res => {
        this.version = res.model.version
        this.series = res.model.series
        this.model = res.model.model

        new QRCode(this.$refs.qrcodePic, {
          text: 'https://developer.huiyuntc.net/authorization?q=' + res.map.qrcode, // 需要转换为二维码的内容
          width: 250,
          height: 250,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        })

        JsBarcode('#bar-code', res.map.series, {
          format: 'CODE39',
          lineColor: '#000',
          background: '#EBEEF5',
          width: 300,
          height: 80,
          displayValue: false
        })
      })
    },
    licenesUpload() {
      console.log('licenesUpload...')
      // 上传证书
      this.$refs.uploadFile.click()
    },
    changeFile() {
      const inputFile = this.$refs.uploadFile.files[0]
      var form = new FormData()
      form.append('file', inputFile)
      request({
        url: '/authorization.licenes.upload', form: form
      }).then(res => {
        console.log('res', JSON.stringify(res))
        if (res.code === 1) {
          this.$router.replace('login')
        }
      })
    },
    onDeviceUpload() {
      // 下载设备码
      this.$refs.deviceForm.submit()
    }
  }
}
</script>

<style lang="scss" scoped>
html,
body {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  min-width: 1349px;
}
.box {
  width: 100%;
  display: flex;
  .box-left {
    width: 50%;
    display: flex;
    justify-content: flex-end;
    .box-body {
      width: 650px;
      margin-top: 100px;
    }
  }
  .box-right {
    width: 50%;
  }
}
.item {
  display: flex;
  justify-content: flex-start;
  color: #666;
  font-size: 22px;
  padding-bottom: 20px;
  .lbl {
    width: 180px;
    color: #333;
    font-size: 32px;
    text-align: right;
  }
  .val {
    line-height: 48px;
  }
}
#qrcode-pic {
  margin: 100px 0 0 150px;
  width: 250px;
  height: 250px;
}
.box-right {
  border-left: 1px solid #ddd;
  padding-bottom: 150px;
  .tip {
    width: 550px;
    text-align: center;
    margin-top: 50px;
  }
}
.licenesUpload {
  border: 0;
  background: #007aff;
  color: #fff;
  width: 350px;
  height: 45px;
}
.layui-upload-file {
  opacity: 0;
}
.device_download {
  margin: 20px 0 0 100px;
}
</style>
