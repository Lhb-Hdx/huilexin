<template>
  <div class="port-traffic bottom-center-box">
    <div class="top-title">
      端口流量TOP
    </div>
    <div class="bottom-center-box-box">
      <div class="bottom-center-box-tabs pointer">
        <div class="tabs-tab" :class="{ active: currType === 0 }" @click="changeColorA(0)">接收</div>
        <div class="tabs-tab" :class="{ active: currType === 1 }" @click="changeColorA(1)">发送</div>
      </div>
      <div class="bottom-center-box-content">
        <div class="content-list">
          <div v-for="item in portList" :key="item.id" class="list-item flex-v-between py-10">
            <div class="flex-1 mr-10 overflow-text-a">
              <div class="overflow-text-a">{{ item.portName }}</div>
              <div class="list-item-ip font-12 mt-6">{{ item.hyMarkName }}</div>
            </div>
            <div class="font-12">{{ item.Value }} {{ item.Symbol }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'PortTraffic',
  data() {
    return {
      currType: 0,
      form: {
        page: 1,
        limit: 10,
        dataType: 4 // 设备类型 1cpu使用率 2内存使用率 3硬盘使用率 4上行流量 5下行流量
        // sTime: '', // 开始时间
        // eTime: '' // 结束时间
      },
      aTitle: 1,
      Subtitle: 1,
      portList: {}, // 存端口排行数据
      portData: {
        page: 1,
        limit: 10,
        itemids: [],
        agent: ''
      }
    }
  },
  mounted() {
    this.findWeek()
  },
  methods: {
    changeColorA(id) {
      this.currType = id
      this.Subtitle = 1
      this.findWeek()
    },
    findWeek(id) {
      if (id === 1 || !id) {
        const startTime = `${this.$tool.getFirstDayOfWeek(new Date())} 00:00:00`
        this.form.sTime = startTime
        const date = new Date()
        const entTime = `${this.$tool.dateFormat('YYYY-mm-dd', date)} 00:00:00`
        this.form.eTime = entTime
      } else if (id === 2) {
        const startTime = `${this.$tool.getFirstDayOfMonth(new Date())} 00:00:00`
        this.form.sTime = startTime
        const date = new Date()
        const entTime = `${this.$tool.dateFormat('YYYY-mm-dd', date)} 00:00:00`
        this.form.eTime = entTime
      } else if (id === 3) {
        const startTime = `${this.$tool.getFirstDayOfSeason(new Date())} 00:00:00`
        this.form.sTime = startTime
        const date = new Date()
        const entTime = `${this.$tool.dateFormat('YYYY-mm-dd', date)} 00:00:00`
        this.form.eTime = entTime
      } else if (id === 4) {
        const startTime = `${this.$tool.getFirstDayOfYear(new Date())} 00:00:00`
        this.form.sTime = startTime
        const date = new Date()
        const entTime = `${this.$tool.dateFormat('YYYY-mm-dd', date)} 00:00:00`
        this.form.eTime = entTime
      }
      if (this.currType === 0) {
        this.form.dataType = 4
      } else if (this.currType === 1) {
        this.form.dataType = 5
      }

      // 端口排行
      request({
        url: api.Summary.findZbxTrendStatistics,
        data: this.form
      }).then(async res => {
        if (res.code === 1) {
          this.portList = res.data
          // console.log(this.portList)
          const ids = []
          this.portList.forEach(item => {
            ids.push(item.hostId)
          })
          // console.log(ids)
          const idx = []
          this.portList.forEach(item => {
            idx.push(item.itemId)
          })
          // console.log(idx)
          this.portData.itemids = idx
          if (res.data.length > 0) {
            this.portData.agent = res.data[0].agent
          } else {
            this.portData.agent = ''
          }
          // 显示主机名
          const logData = await request({ url: api.itMonitor.findHyitHost, data: { ids }})
          if (logData.code === 1) {
            for (let i = 0; i < this.portList.length; i++) {
              const tableL = this.portList[i]
              for (let j = 0; j < logData.data.length; j++) {
                const log = logData.data[j]
                if (tableL.hostId === log.hyHostId) {
                  console.log('找到了')
                  this.portList[i].hyIp = log.hyIp
                  this.portList[i].hyMarkName = log.hyMarkName
                }
              }
            }
          }
          // 显示端口名
          const portData = await request({ url: api.itMonitor.findZbxItemsHost, data: this.portData })
          if (portData.code === 1) {
            for (let i = 0; i < this.portList.length; i++) {
              const portD = this.portList[i]
              for (let j = 0; j < portData.data.length; j++) {
                const po = portData.data[j]
                if (Number(portD.itemId) === Number(po.itemid)) {
                  this.$set(this.portList[i], 'portName', po.name)
                }
              }
            }
          }
          this.portList.forEach((item, index) => {
            this.$set(this.portList[index], 'Value', this.$tool.conversionData('data', Number(this.portList[index].avgValue), 'b').size)
            this.$set(this.portList[index], 'Symbol', this.$tool.conversionData('data', Number(this.portList[index].avgValue), 'b').units)
          })
          const portLength = 10 - this.portList.length
          if (this.portList.length < 10) {
            for (let i = 0; i < portLength; i++) {
              this.portList.push({ hyMarkName: '暂无数据' })
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.port-traffic {
  flex: 1;
  /* height: 100%; */
  height: 300px;
  /* margin: 0 20px 0 20px; */
}
</style>
