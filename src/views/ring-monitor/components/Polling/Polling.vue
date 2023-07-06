<template>
  <div class="powerEnv-polling flex-h-center">
    <div class="polling-left mr-10">
      <div class="font-20 font-weight color-333">检测统计</div>
      <div class="sidebar-status text-center">
        <div class="status-text">
          <div class="status-text-status mb-10">系统健康度</div>
          <div class="status-text-progress" :style="{color:setpollingProgressStyle}">{{ pollingprogressStyle.percentage }}%</div>
        </div>
        <el-progress :percentage="pollingprogressStyle.percentage" :stroke-width="12" :text-inside="true" :width="220" status="exception" type="circle" :color="setpollingProgressStyle" />
      </div>
      <div class="text-center font-18 mt-20">
        <div v-if="alarmCount>0">检测完成，检测到{{ alarmCount }}项异常，请及时处理</div>
        <div v-if="alarmCount===0">检测完成，没有检测到异常</div>
      </div>
      <el-divider class="polling-divider" />

      <h2 class="font-20 color-333">备注信息</h2>
      <el-input v-if="!form.status" v-model="form.remark" type="textarea" placeholder="请输入" class="mb-10" />
      <div v-else>{{ form.remark }}</div>

      <FileUpload
        v-if="!form.status"
        button-text="选择图片"
        upload-type="pic"
        file-type=".png,.jpg"
        file-url-list-type="picture"
        :limit="6"
        :button-disabled="false"
        :is-limit-file-size="true"
        :file-max-size="1"
        :file-url-list="fileList"
        @emitFileList="getEmitFileList"
      />
      <div v-else class="mt-40">
        <div v-for="item in fileList" :key="item.id">
          <img :src="item.url" alt="" width="120" height="120">
        </div>
      </div>

      <div v-if="!form.status" class="text-center">
        <el-button :loading="loading" type="primary" class="sub-btn" @click="submitPolling">保存并提交</el-button>
      </div>
    </div>
    <div class="polling-right">
      <div v-for="(item,index) in devTypeList" :key="item.hyDevTypeId" class="mb-30">
        <div class="font-14 font-weight pointer" @click="onshowList(index)">
          <i :class="[item.showList?'el-icon-caret-bottom':'el-icon-caret-right']" />
          {{ item.hyDevTypeName }} ({{ item.deviceList.filter(item=>item.hyState!==1).length }}/{{ item.deviceList.length }})
        </div>
        <div v-if="item.showList" class="flex-wrap dev-list">
          <div v-for="it in item['deviceList']" :key="it.hyDeviceId" class="dev-list-wrapper">
            <div class="dev-list-item">
              <img class="dev-list-item-img" :src="it.icon" alt="" style="height:70px;width: 70px">
              <div class="font-16 mb-16 mt-10 dev-list-item-name" :title="it.hyAlias">
                <!-- <el-tooltip placement="top">
                  <div slot="content">{{ it.hyAlias }}</div>
                </el-tooltip> -->
                {{ it.hyAlias }}
              </div>
              <div class="font-14 dev-list-item-btn pointer" :style="{borderColor:$tool.formatStr(it.hyState,'0:var(--offline),1:var(--success),2:var(--error)'),color:$tool.formatStr(it.hyState,'0:var(--offline),1:var(--success),2:var(--error)')}" @click="showMonitorDialog(it.hyDeviceId,it.hyAddr,it.hyAlias)">监控项{{ it.childItem.length||0 }}项
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    <div class="print-polling">
      <el-button type="primary" @click="exportExcel">打印报告</el-button>
    </div>
    <el-dialog title="监控检查项" :visible.sync="showMonitorDialogFlag" width="40%" top="5vh">
      <div class="dialog-body" />
      <el-table
        :data="childItem"
        style="width: 100%"
        max-height="300"
      >
        <el-table-column
          label="设备源"
          align="center"
        >
          <template slot-scope="scope">
            {{ scope.row.hyAlias }}({{ scope.row.hyAddr }})
          </template>
        </el-table-column>

        <el-table-column
          prop="hyVname"
          label="监控项"
          align="center"
        />
        <el-table-column
          label="阈值条件"
          align="center"
        >
          <template slot-scope="scope">
            {{ setOperator(scope.row.condType) }} {{ (scope.row.alarmValue+scope.row.unit)||'' }}
          </template>
        </el-table-column>
        <el-table-column
          label="当前值"
          align="center"
        >
          <template slot-scope="scope" style="color:red">
            {{ scope.row.hyVal +scope.row.hyUnits }}
          </template>
        </el-table-column>

      </el-table>
      <div slot="footer" class="dialog-footer">

        <el-button @click="showMonitorDialogFlag = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="MonitorDialogComfirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import FileUpload from '@/components/Upload/file-upload'
import { mapState } from 'vuex'
import { saveAs } from 'file-saver'
import Excel from 'exceljs'
// eslint-disable-next-line no-unused-vars
const listIcon = {
  10060: 'image/ring-monitor/jmkj',
  1016: 'image/ring-monitor/ups',
  1000: 'image/ring-monitor/wsd',
  10058: 'image/ring-monitor/gpd',
  1017: 'image/ring-monitor/xdc',
  10069: 'image/ring-monitor/lsjk',
  10068: 'image/ring-monitor/lsjk',
  10067: 'image/ring-monitor/jgwd',
  10066: 'image/ring-monitor/ltg',
  1012: 'image/ring-monitor/ygq',
  105: 'image/ring-monitor/mj',
  1014: 'image/ring-monitor/hwjk',
  159: 'image/ring-monitor/ygq'
}
export default {
  name: 'Polling',
  components: {
    FileUpload
  },
  data() {
    return {
      pollingprogressStyle: {
        percentage: 0
      },
      form: { }, // 报告单
      fileList: [],
      devTypeList: [], // 设备列表
      loading: false,
      deleteFile: '',
      alarmCount: 0,
      showMonitorDialogFlag: false,
      childItem: []
    }
  },
  computed: {
    ...mapState({
      areaId: state => state.ring.areaId,
      reportId: state => state.ring.reportId
    }),
    // filterdeviceList() {
    //   let filterDeviceList = []
    //   if (this.devTypeList.deviceList) {
    //     filterDeviceList = this.devTypeList.deviceList.filter(item => {
    //       return item.hyState !== 1
    //     })
    //   }
    //   return filterDeviceList
    // },

    setpollingProgressStyle() {
      const percentage = this.pollingprogressStyle.percentage
      return percentage === 0 ? 'var(--offline)' : percentage < 100 ? 'var(--error)' : 'var(--success)'
    }
  },
  watch: {
    // deleteFile(n) {
    //   console.log(n)
    //   this.deletePowerEnvInspectionReportPicture(n.id)
    // }
  },
  async mounted() {
    this.form = await this.getPowerEnvInspectionReport(this.reportId)
    await this.findPowerEnvInspectionReportPicture(this.reportId)
    await this.init(this.form.reportId)
  },
  methods: {
    setOperator(Operator) {
      let result
      switch (Operator) {
        case -1:
          result = '小于'
          break
        case 0:
          result = '等于'
          break

        case 1:
          result = '大于'
          break
        case 2:
          result = '小于等于'
          break
        case 3:
          result = '大于等于'
          break

        default:

          break
      }
      return result
    },
    async exportExcel() {
      let userModel = await this.getSysUser(this.form.userId)
      let model = await this.getHyitArea(this.form.areaId)
      var workbook = new Excel.Workbook()
      var worksheet = workbook.addWorksheet('111', { properties: { tabColor: { argb: 'FFC0000' }}})
      worksheet.getRow(1).values = ['巡检报告']
      worksheet.getRow(2).values = [`巡检人:${userModel ? userModel.realName : ''}`]
      worksheet.getRow(3).values = [`巡检时间:${this.form.ctime}`]
      worksheet.getRow(4).values = [`备注内容:${this.form.remark || ''}`]
      worksheet.getRow(5).values = [`巡检区域:${model.hyAreaName}`]
      worksheet.getRow(6).values = ['巡检结果']
      worksheet.getRow(7).values = ['类型', '设备名称', '在线状态']
      worksheet.mergeCells(`A1:E1`)
      worksheet.mergeCells('A2:E2')
      worksheet.mergeCells('A3:E3')
      worksheet.mergeCells('A4:E4')
      worksheet.mergeCells('A5:E5')
      worksheet.mergeCells('A6:C6')
      worksheet.columns = [
        { key: 'devtype', width: 12 },
        { key: 'hyAlias', width: 32 },
        { key: 'hyState', width: 10 },
        { key: 'aaa', width: 12 },
        { key: 'bbb', width: 12 }
      ]
      const fill = {
        type: 'pattern',
        pattern: 'gray125',
        fgColor: { argb: '666666' },
        bgColor: { argb: '666666' }
      }

      worksheet.getCell('A6').fill = {
        type: 'pattern',
        pattern: 'gray125',
        fgColor: { argb: '666666' },
        bgColor: { argb: '666666' }
      }
      worksheet.getCell('A7').fill = fill
      worksheet.getCell('B7').fill = fill
      worksheet.getCell('C7').fill = fill
      worksheet.getCell('A7').font = { color: { argb: 'FFFFFF' }}
      worksheet.getCell('B7').font = { color: { argb: 'FFFFFF' }}
      worksheet.getCell('C7').font = { color: { argb: 'FFFFFF' }}
      worksheet.getCell('A7').alignment = { vertical: 'middle', horizontal: 'center' }
      worksheet.getCell('B7').alignment = { vertical: 'middle', horizontal: 'center' }
      worksheet.getCell('C7').alignment = { vertical: 'middle', horizontal: 'center' }
      worksheet.getCell('A6').font = {
        name: 'Comic Sans MS',
        family: 4,
        size: 16,
        bold: true,
        color: { argb: 'FFFFFF' }
      }
      worksheet.getCell('A1').font = {
        name: 'Comic Sans MS',
        family: 4,
        size: 18,
        bold: true,
        color: { argb: '000000' }
      }
      worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' }
      worksheet.getCell('A6').alignment = { vertical: 'middle', horizontal: 'center' }
      const rows = []
      for (const row of this.devTypeList) {
        for (const rowElement of row.deviceList) {
          const newRow = { ...rowElement }
          newRow.devtype = row.hyDevTypeName
          newRow.hyState = newRow.hyState === 0 ? '离线' : '在线'
          rows.push(newRow)
        }
      }
      worksheet.addRows(rows)
      for (let i = 0; i < rows.length; i++) {
        worksheet.getCell('C' + (i + 8)).font = { color: { argb: rows[i]['hyState'] === 0 ? 'FF00FF00' : 'FFFF0000' }}
      }

      workbook.xlsx.writeBuffer().then(buffer => {
        // done
        saveAs(new Blob([buffer]), `巡检报告.xlsx`)
      })
    },
    async getSysUser(userId) {
      let { model, code } = await request({ url: api.sys.getSysUser, data: { userId }})
      if (code === 1) return model
    },
    onshowList(index) {
      this.$set(this.devTypeList[index], 'showList', !this.devTypeList[index]['showList'])
    },
    async getPowerEnvInspectionReport(reportId) {
      let { model, code } = await request({
        url: api.powerEnv.getPowerEnvInspectionReport,
        data: { reportId }
      })
      if (code === 1) return model
    },
    getEmitFileList(file) {
      console.log(file)
      this.fileList = file['fileList']
      // if (file['deleteFile']) this.deletePowerEnvInspectionReportPicture(file['deleteFile'].id)
      // this.deleteFile = file['deleteFile']
    },
    async submitPolling() {
      delete this.form.ctime
      this.loading = true
      let { code } = await request({
        url: api.powerEnv.updatePowerEnvInspectionReport,
        data: { ...this.form, status: 1 }
      })
      this.loading = false
      for (const it of this.fileList) {
        await request({
          url: api.powerEnv.insertPowerEnvInspectionReportPicture,
          data: { reportId: this.form.reportId, url: it.url }
        })
      }
      if (code === 1) { this.$message.success('提交成功') }
      this.$parent.componentName = 'PollingList'
    },
    async inspectionDongHuan() {
      this.loading = true
      let { model, code } = await request({
        url: api.powerEnv.inspectionDongHuan,
        data: {
          areaId: this.areaId
        }
      })
      this.loading = false

      if (code !== 1) return
      return model
    },
    async getHyitArea(hyAreaId) {
      let { model, code } = await request({ url: api.area.getHyitArea, data: { hyAreaId }})
      if (code === 1) return model
    },
    async init(reportId) {
      //  动环报告，数量异常计算
      let reportDetail = await this.findPowerEnvInspectionReportDetail(reportId)
      // await this.findPowerEnvInspectionReportAlarm(reportId)

      // 获得设备列表
      await this.findHyitDevType()

      // await this.findHyitDeviceValue()
      const alarmNum = reportDetail.reduce((pre, next) => pre + next.alarmNum, 0)
      const normalNum = reportDetail.reduce((pre, next) => pre + next.normalNum, 0)
      const offNum = reportDetail.reduce((pre, next) => pre + next.offNum, 0)
      this.alarmCount = alarmNum + offNum

      if (alarmNum === 0 && normalNum === 0 && offNum === 0) {
        this.pollingprogressStyle.percentage = 100
      } else if ((alarmNum + offNum) === (alarmNum + offNum + normalNum)) {
        this.pollingprogressStyle.percentage = 0
      } else {
        // this.pollingprogressStyle.percentage = ((alarmNum + offNum) / (alarmNum + offNum + normalNum) * 100).toFixed(2)
        this.pollingprogressStyle.percentage = +((1 - (alarmNum + offNum) / (alarmNum + offNum + normalNum)) * 100).toFixed(0)
      }
    },
    async findHyitDevice(hyDevTypeValues) {
      let { data, code } = await request({
        url: api.powerEnv.findHyitDevice,
        data: {
          hyDevTypeValues: this.$tool.uniqueArray(hyDevTypeValues),
          limit: -1,
          hyAreaId: this.form.areaId
        }
      })
      if (code === 1) return data
    },
    async findHyitDeviceValue(hyDeviceIds) {
      let { data, code } = await request({
        url: api.powerEnv.findHyitDeviceValue,
        data: {
          limit: -1,
          hyDeviceIds: this.$tool.uniqueArray(hyDeviceIds)
        }
      })
      if (code === 1) {
        return data
      }
    },
    async findHyitDevType() {
      let { data, code } = await request({
        url: api.powerEnv.findHyitDevType,
        data: {
          Pid: 2,
          limit: -1
        }
      })
      if (code !== 1) return
      // 1 配置data
      data = data.filter(it => it.isShow === 1)
      // for (let item of data) {
      //   //  设备二级菜单
      //   item['deviceList'] = await this.findHyitDevice(item.hyDevTypeValue)
      //   for (const device of item['deviceList']) {
      //     device['icon'] = listIcon[device['hyDevTypeValue']] + `${device['hyState'] + 1}.png`
      //     device['childItem'] = await this.findHyitDeviceValue(device.hyDeviceId)
      //   }

      //   // this.devTypeList.forEach(item => {
      //   //   console.log(item)
      //   //   item.deviceList.forEach(item2 => {
      //   //     this.findHyitDeviceValue(item2.hyDeviceId)
      //   //   })
      //   // })
      // }

      const hyDevTypeValues = []
      data.forEach(item => {
        item.deviceList = []

        hyDevTypeValues.push(item.hyDevTypeValue)
      })
      const deviceList = await this.findHyitDevice(hyDevTypeValues)
      console.log(deviceList)
      const hyDeviceIds = []
      deviceList.forEach(item => {
        hyDeviceIds.push(item.hyDeviceId)
      })
      const deviceListChildItem = await this.findHyitDeviceValue(hyDeviceIds)
      console.log(deviceListChildItem)
      // deviceList.forEach(item=>{
      //   item.childItem=[]
      //   item.icon={}
      //   deviceListChildItem.forEach(v=>{
      //     if(item.hyDeviceId===v.hyDeviceId){
      //       item.childItem.push(v)
      //       item.icon=listIcon[device['hyDevTypeValue']] + `${device['hyState'] + 1}.png`
      //     }
      //   })
      // })
      data.forEach((item, idx) => {
        deviceList.forEach((v, index) => {
          if (item.hyDevTypeValue === v.hyDevTypeValue) {
            item.deviceList.push(v)
          }
        })
      })
      console.log(data)
      // 2 赋给devTypeList
      this.devTypeList = data
      // console.log(JSON.stringify(this.devTypeList))
      // return data
    },
    async findPowerEnvInspectionReportDetail(reportId) {
      let { data, code } = await request({
        url: api.powerEnv.findPowerEnvInspectionReportDetail,
        data: {
          reportId
        }
      })
      if (code === 1) return data
    },
    async findPowerEnvInspectionReportAlarm(hyDeviceId) {
      let { data, code } = await request({
        url: api.powerEnv.findPowerEnvInspectionReportAlarm,
        data: {
          hyDeviceId,
          reportId: this.reportId
        }
      })
      if (code === 1) {
        return data
      }
    },

    async findPowerEnvInspectionReportPicture(reportId) {
      let { data, code } = await request({
        url: api.powerEnv.findPowerEnvInspectionReportPicture,
        data: { reportId }
      })
      if (code === 1) {
        this.fileList = data.map(it => ({ ...it, id: it.picId }))
      }
    },
    async deletePowerEnvInspectionReportPicture(picId) {
      let { code } = await request({
        url: api.powerEnv.deletePowerEnvInspectionReportPicture,
        data: { picId }
      })
      if (code === 1) this.$message.success('删除成功')
    },
    MonitorDialogComfirm() {
      this.showMonitorDialogFlag = false
    },
    async findLinkageThresholdCondition(ids) {
      let { data, code } = await request({
        url: api.linkageManage.findLinkageThresholdCondition,
        data: { ids }
      })
      if (code === 1) return data
    },
    async showMonitorDialog(hyDeviceId, hyAdd, hyAlias) {
      // 有conditionID,和hyVid的alarm数组
      const reportAlarmList = await this.findPowerEnvInspectionReportAlarm(hyDeviceId)
      let conditionIds = []
      reportAlarmList.forEach(item => {
        conditionIds.push(item.conditionId)
      })

      // 有conditionId的 具体阈值条件数组
      const thresholdIdList = await this.findLinkageThresholdCondition(conditionIds)

      reportAlarmList.forEach(item => {
        thresholdIdList.forEach(item2 => {
          if (item.conditionId === item2.conditionId) {
            item['alarmValue'] = item2.alarmValue
            item['condType'] = item2.condType
            item['unit'] = item2.unit
          }
        })
      })

      this.devTypeList.forEach((item) => {
        item.deviceList.forEach((item2, index) => {
          if (item2.hyDeviceId === hyDeviceId) {
          // 将reportAlarmList与childItem 连接
            item2.childItem.forEach(item3 => {
              reportAlarmList.forEach(item4 => {
                if (item3.hyVid === item4.hyVid) {
                  // item3.reportAlarm = item4
                  item3['alarmValue'] = item4.alarmValue
                  item3['condType'] = item4.condType
                  item3['unit'] = item4.unit
                  // item4 = JSON.parse(JSON.stringify(item4))
                  // this.$set(item3, 'reportAlarm', item4)
                }
              })
            })
            // item2[]
            item2.childItem[index]['hyAdd'] = hyAdd
            item2.childItem[index]['hyAlias'] = hyAlias
            item2.childItem.forEach(item3 => {
              item3['hyAdd'] = hyAdd
              item3['hyAlias'] = hyAlias
            })

            // this.$set(item2.childItem[index2], 'address', item2[index2].hyAddr)
            // this.$set(item2.childItem[index2], 'hyAlias', item2[index2].hyAlias)
            this.childItem = item2.childItem
          }
        })
      })
      console.log(JSON.stringify(this.childItem), '++++++++++++++++++++++++++')
      this.showMonitorDialogFlag = true
      // this.showBatchStrategyDialog = true
    }
  }
}
</script>

<style lang="scss" scoped>
.powerEnv-polling{
  background-color: #f5f5f5;
  height: 100%;
  position: relative;
  .polling-left{
    border-radius: 10px;
    background-color: #fff;
    padding: 20px 20px 84px 20px;
    height: 100%;
    overflow: hidden;
    overflow-y: auto;
    flex-basis: 360px;
    .sidebar-status{
      width: 220px;
      height: 220px;
      position: relative;
      margin: 30px auto 0;
      .status-text{
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
        text-align: center;
        .status-text-progress{
          font-size: 48px;
          font-weight: 500;
          color: #00B285;
        }
        .status-text-status{
          font-size: 16px;
          font-weight: 300;
          color: #999999;
        }
      }
    }
    .sub-btn{
      width: 200px;
      height: 50px;
      margin-top: 60px;
    }
  }
  .polling-right{
    border-radius: 10px;
    height: 100%;
    background-color: #fff;
    padding: 20px 20px 84px 20px;
    box-sizing: border-box;
    flex: 1;
    overflow: hidden;
    overflow-y: auto;
    .dev-list{
    display: flex;
    width: 100% !important;
      .dev-list-wrapper{
        // flex-wrap: wrap;
        // display: flex;
        // justify-content: flex-start;
        // align-items: center;
        // flex: 1;
        // width: 100%;
        // flex-basis: 20%;
        width: 20%;

      .dev-list-item{
      // flex-shrink: 0;
      text-align: center;
      // overflow:hidden;
      // white-space: nowrap;
      // text-overflow: ellipsis;
      padding: 30px 20px 0;
      box-sizing: border-box;
      .dev-list-item-name{
        // width: 45px;
        white-space: nowrap;
        overflow:hidden;
        text-overflow: ellipsis;
      }
      .dev-list-item-btn{
        width: 101px;
        height: 31px;
        background: #FFFFFF;
        border: 1px solid #FF656A;
        border-radius: 15px;
        margin: 0 auto;
        line-height: 31px;
      }
    }
      }

    }

  }
}
::v-deep .polling-left{
.el-divider,.polling-divider{
  background-color: #f5f5f5;
  margin: 50px 0;
}
}
.print-polling{
  width: 100%;
  height: 84px;
  background: #FFFFFF;
  box-shadow: 0px 0px 8px 0px rgba(63, 63, 63, 0.2);
  position: absolute;
  left: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  button{
    width: 200px;
    height: 50px;
    background: #0145AB;
    border-radius: 4px;
  }
  .dialog-body{

  }
}
</style>
