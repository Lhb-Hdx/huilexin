<template>
  <el-dialog class="Dialog" title="打印预览" :visible.sync="showPrintDialog" width="61.8%" top="5vh">
    <div id="print" class="container_prints">
      <h1 class="title_top">广州市番禺中心医院</h1>
      <div class="linktitle" />
      <div class="content">
        <div class="leftbox">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="设备名称" :label-style="labelStyle" :content-style="contentStyle"> {{ deviceList.assetsName }}</el-descriptions-item>
            <el-descriptions-item label="设备型号" :label-style="labelStyle" :content-style="contentStyle"> {{ deviceList.model }}</el-descriptions-item>
            <el-descriptions-item label="机身号" :label-style="labelStyle" :content-style="contentStyle"> {{ deviceList.assetsSn }}</el-descriptions-item>
            <el-descriptions-item label="启用日期" :label-style="labelStyle" :content-style="contentStyle"> {{ deviceList.useStime }}</el-descriptions-item>
            <el-descriptions-item label="所属科室" :label-style="labelStyle" :content-style="contentStyle"> {{ setUseOrg(deviceList.departmentCatId) }}</el-descriptions-item>
            <el-descriptions-item label="设备编码" :label-style="labelStyle" :content-style="contentStyle"> {{ deviceList.assetsId }}</el-descriptions-item>
            <el-descriptions-item label="资产编码" :label-style="labelStyle" :content-style="contentStyle"> {{ deviceList.assetsId }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="rightbox">
          <div ref="qrcodeDialog" class="qrcoderBox" />
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button v-print="printForm" type="primary">打 印</el-button>
      <el-button type="info" @click="onCancel">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import assetsListMixin from '../mixins/assets-list-mixin'
import request from '@/utils/request'
import QRCode from 'qrcodejs2'

export default {
  name: 'DetailPirnt',
  mixins: [assetsListMixin],
  data() {
    return {
      showPrintDialog: false,
      labelStyle: 'width: 50px',
      contentStyle: 'width: 250px',
      deviceList: {
        assetsName: null,
        model: null,
        useStime: null,
        departmentCatId: null,
        assetsSn: null
      },
      printForm: {
        id: 'print',
        popTitle: ''
      }
    }
  },
  methods: {
    // 交互--父组件调用
    handleMit(arg) {
      this.showPrintDialog = true
      Object.keys(this.deviceList).forEach(key => {
        this.$set(this.deviceList, key, arg[key])
      })
      console.log('AssetsInfo', arg, this.deviceList)
      this.onQRCode(arg)
    },
    // 按钮--取消
    onCancel() {
      this.showPrintDialog = false
    },
    // 图标--X
    handleClose(done) {
      done()
    },

    // 获取二维码
    onQRCode(row) {
      this.showQRCodeDialog = true

      request({
        url: '/authorization.device',
        notNeedToken: true
      }).then(res => {
        this.$refs.qrcodeDialog.innerHTML = ''
        if (res.code === 1 && res.model) {
          this.$nextTick(() => {
            new QRCode(this.$refs.qrcodeDialog, {
              text: 'https://iot.huiyuntc.net/assets-scan-malfunction-' + res.model.appId + '-' + res.model.companyId + '?assetsId=' + row.assetsId,
              width: 200,
              height: 200,
              colorDark: '#000000',
              colorLight: '#ffffff',
              correctLevel: QRCode.CorrectLevel.H
            })
          })
        }
      })
    }

  }
}
</script>

<style lang="scss" scoped>
    .container_prints{
        border: 1px solid #fff; //防止打印时出现空白页

        // .linktitle{
        //     margin: 10px  0;
        //     border: 1px solid #c8c8e4;
        // }
        .title_top{
            text-align: center;
        }
        .content{
            background-color: #fff;
            border-radius: 6px;
            border: 1px solid #c8c8e4;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .leftbox{
                flex: 2;
                display: flex;
                flex-direction: column;
            }
            .rightbox{
                flex: 1;
                margin: 0 30px ;
                .qrcoderBox{
                    height: 100%;
                    width: 100%;
                }
            }
        }

    }
</style>
