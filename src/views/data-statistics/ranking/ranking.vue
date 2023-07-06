<template>
  <div class="app-container">
    <div class="table-wrapper">
      <div v-for="(item,index) in flow" :key="index" class="service" style="cursor:pointer" :class="aTitle === item.id ? 'service1':''" @click="changeColorA(item.id)">{{ item.data }}</div>
    </div>

    <div class="time">
      <div class="time-box">
        <div v-for="(item,index) in SubtitleList" :key="index" style="cursor:pointer" :class="Subtitle === item.id ? 'week':''" @click="changeBottomA(item.id)">{{ item.label }}</div>
      </div>
    </div>
    <div class="Ranking">
      <div v-if="tableList.length > 0" class="Rank1">
        <div class="rank-title">CPU使用率 TOP
          <OutputExcel v-if="outCPUTOP" ref="outputExcel" class="export-right" @submitQuery="submitCPUTOP" />
        </div>
        <div v-for="(item,index) in tableList" :key="index" class="rank-div">
          <i class="iColor1">{{ index+1 }}</i>
          <div class="rank-box">
            <div class="rank-box-data">
              <div v-if="item.hyMarkName !== '暂无数据'" class="data-name">
                <el-link type="primary" @click="handlerToItMonitorDevice(item)">{{ item.hyMarkName }}</el-link>
              </div>
              <div v-else class="data-name1"> {{ item.hyMarkName }}</div>
              <div class="data-ip">{{ item.hyIp }}</div>
            </div>
            <div class="speed">{{ item.Value }}<em>%</em></div>
          </div>
          <div class="no-progress-bar-innerText">
            <div v-if="index === 0">
              <el-progress v-if="item.Value" class="progress" :percentage="item.Value === '-' ? 0 : Number(item.Value)" :text-inside="true" />
            </div>
            <div v-else>
              <el-progress v-if="item.Value" class="progress" :percentage="item.Value === '-' ? 0 : Number(item.Value)" :text-inside="true" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="portList.length > 0" class="Rank1">
        <div class="rank-title">内存使用率 TOP
          <OutputExcel v-if="outMemoryTOP" ref="outputExcel" class="export-right" @submitQuery="submitMemoryTOP" />
        </div>
        <div v-for="(item,index) in portList" :key="index" class="rank-div">
          <i class="iColor1">{{ index+1 }}</i>
          <div class="rank-box">
            <div class="rank-box-data">
              <div v-if="item.hyMarkName !== '暂无数据'" class="data-name">
                <el-link type="primary" @click="handlerToItMonitorDevice(item)">{{ item.hyMarkName }}</el-link>
              </div>
              <div v-else class="data-name1"> {{ item.hyMarkName }}</div>
              <div class="data-ip">{{ item.hyIp }}</div>
            </div>
            <div class="speed">{{ item.Value }}<em>%</em></div>
          </div>
          <div class="no-progress-bar-innerText">
            <div v-if="index === 0">
              <el-progress v-if="item.Value" class="progress" :percentage="item.Value === '-' ? 0 : Number(item.Value)" :text-inside="true" />
            </div>
            <div v-else>
              <el-progress v-if="item.Value" class="progress" :percentage="item.Value === '-' ? 0 : Number(item.Value)" :text-inside="true" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="diskList.length > 0" class="Rank1">
        <div class="rank-title">磁盘使用率 TOP
          <OutputExcel v-if="outDiskTOP" ref="outputExcel" class="export-right" @submitQuery="submitDiskTOP" />
        </div>
        <div v-for="(item,index) in diskList" :key="index" class="rank-div">
          <i class="iColor1">{{ index+1 }}</i>

          <div class="rank-box">
            <!-- <i>01</i> -->
            <div class="rank-box-data">
              <div v-if="item.hyMarkName !== '暂无数据'" class="data-name">
                <el-link type="primary" @click="handlerToItMonitorDevice(item)">{{ item.hyMarkName }}</el-link>
              </div>
              <div v-else class="data-name1"> {{ item.hyMarkName }}</div>
              <div class="data-ip">{{ item.hyIp }}</div>
            </div>
            <div class="speed">{{ item.Value }}<em>%</em></div>
          </div>
          <div class="no-progress-bar-innerText">
            <div v-if="index === 0">
              <el-progress v-if="item.Value" class="progress" :percentage="item.Value === '-' ? 0 : Number(item.Value)" :text-inside="true" />
            </div>
            <div v-else>
              <el-progress v-if="item.Value" class="progress" :percentage="item.Value === '-' ? 0 : Number(item.Value)" :text-inside="true" />
            </div>
          </div>
        </div>
      </div>

    </div>
  </div></template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import OutputExcel from '@/components/outputExcel/index.vue'
// import StatisticsUp from './components/statistics-up.vue' // 数据排序的方法
export default {
  name: 'Statistics',
  components: {
    OutputExcel // StatisticsUp
  },
  data() {
    return {
      activeName: 'first',
      aTitle: 1,
      Subtitle: 1,
      form: {
        page: 1,
        limit: 20,
        deviceType: 479 // 设备类型
        // dataType: '' // 汇总类型 1cpu使用率 2内存使用率 3硬盘使用率 4上行流量 5下行流量
      },
      blankList: [ // 空数据时
        { data: '暂无数据' },
        { data: '暂无数据' },
        { data: '暂无数据' },
        { data: '暂无数据' },
        { data: '暂无数据' },
        { data: '暂无数据' },
        { data: '暂无数据' },
        { data: '暂无数据' },
        { data: '暂无数据' },
        { data: '暂无数据' }
      ],
      flow: [
        { data: '服务设备', id: 1 },
        { data: '网络设备', id: 2 },
        { data: '虚拟资源', id: 3 }

      ],
      SubtitleList: [
        { label: '本周', id: 1 },
        { label: '本月份', id: 2 },
        { label: '本季度', id: 3 },
        { label: '本年度', id: 4 }
      ],
      tableList: {}, // CPU TOP 数据
      portList: {}, // 内存TOP 数据
      diskList: {}, // 磁盘TOP 数据,
      outCPUTOP: true,
      outMemoryTOP: true,
      outDiskTOP: true
    }
  },
  mounted() {
    this.findData()
  },
  methods: {
    // 导出CPU TOP
    async submitCPUTOP(excelQuery) {
      const data = await this.exportCPUTOP(excelQuery)
      const excelTitle = [
        {
          title: '设备名称',
          dataIndex: 'hyMarkName'
        },
        {
          title: 'IP',
          dataIndex: 'hyIp'
        },
        {
          title: 'CPU使用率',
          dataIndex: 'percentage'
        }
      ]
      this.$refs.outputExcel.output(excelTitle, data)
      this.outCPUTOP = false
      setTimeout(() => {
        this.outCPUTOP = true
      })
    },
    // 导出的数据
    async exportCPUTOP(val) {
      const res = await request({
        url: api.Summary.findZbxTrendStatistics,
        data: { ...this.form, dataType: 1, page: 1, limit: val.limit }
      })
      if (res.code !== 1) return
      const ids = []
      res.data.forEach(item => {
        ids.push(item.hostId)
      })
      const logData = await request({ url: api.itMonitor.findHyitHost, data: { limit: -1, agents: this.sessionStorageOperation('get', 'agentId') }})
      if (logData.code === 1) {
        res.data.forEach(item => {
          logData.data.forEach(lItem => {
            if (+item.hostId === +lItem.hyHostId) {
              item.hyIp = lItem.hyIp
              item.hyMarkName = lItem.hyMarkName
            }
          })
        })
      }
      const listData = []
      res.data.forEach((item, index) => {
        const size = this.$tool.conversionData('data', Number(item.avgValue), 'b').size
        this.$set(item, 'percentage', size > 0 ? `${size}%` : '0')
        if (item.hyMarkName) {
          listData.push(item)
        }
      })
      const tableLength = 10 - listData.length
      if (listData.length < 10) {
        for (let i = 0; i < tableLength; i++) {
          listData.push({ hyMarkName: '暂无数据', Value: '-' })
        }
      }
      return listData
    },
    // 导出内存 TOP
    async submitMemoryTOP(excelQuery) {
      const data = await this.exportMemoryTOP(excelQuery)
      const excelTitle = [
        {
          title: '设备名称',
          dataIndex: 'hyMarkName'
        },
        {
          title: 'IP',
          dataIndex: 'hyIp'
        },
        {
          title: '内存使用率',
          dataIndex: 'percentage'
        }
      ]
      this.$refs.outputExcel.output(excelTitle, data)
      this.outMemoryTOP = false
      setTimeout(() => {
        this.outMemoryTOP = true
      })
    },
    // 导出的数据
    async exportMemoryTOP(val) {
      const res = await request({
        url: api.Summary.findZbxTrendStatistics,
        data: { ...this.form, dataType: 2, page: 1, limit: val.limit }
      })
      if (res.code !== 1) return
      const ids = []
      res.data.forEach(item => {
        ids.push(item.hostId)
      })
      const logData = await request({ url: api.itMonitor.findHyitHost, data: { limit: -1, agents: this.sessionStorageOperation('get', 'agentId') }})
      if (logData.code === 1) {
        res.data.forEach(item => {
          logData.data.forEach(lItem => {
            if (+item.hostId === +lItem.hyHostId) {
              item.hyIp = lItem.hyIp
              item.hyMarkName = lItem.hyMarkName
            }
          })
        })
      }
      const listData = []
      res.data.forEach((item, index) => {
        const size = this.$tool.conversionData('data', Number(item.avgValue), 'b').size
        this.$set(item, 'percentage', size > 0 ? `${size}%` : '0')
        if (item.hyMarkName) {
          listData.push(item)
        }
      })
      const tableLength = 10 - listData.length
      if (listData.length < 10) {
        for (let i = 0; i < tableLength; i++) {
          listData.push({ hyMarkName: '暂无数据', Value: '-' })
        }
      }
      return listData
    },
    // 导出磁盘 TOP
    async submitDiskTOP(excelQuery) {
      const data = await this.exportDiskTOP(excelQuery)
      const excelTitle = [
        {
          title: '设备名称',
          dataIndex: 'hyMarkName'
        },
        {
          title: 'IP',
          dataIndex: 'hyIp'
        },
        {
          title: '磁盘使用率',
          dataIndex: 'percentage'
        }
      ]
      this.$refs.outputExcel.output(excelTitle, data)
      this.outDiskTOP = false
      setTimeout(() => {
        this.outDiskTOP = true
      })
    },
    // 导出的数据
    async exportDiskTOP(val) {
      const res = await request({
        url: api.Summary.findZbxTrendStatistics,
        data: { ...this.form, dataType: 3, page: 1, limit: val.limit, isDesc: 0 }
      })
      if (res.code !== 1) return
      const ids = []
      res.data.forEach(item => {
        ids.push(item.hostId)
      })
      const logData = await request({ url: api.itMonitor.findHyitHost, data: { limit: -1, agents: this.sessionStorageOperation('get', 'agentId') }})
      if (logData.code === 1) {
        res.data.forEach(item => {
          logData.data.forEach(lItem => {
            if (+item.hostId === +lItem.hyHostId) {
              item.hyIp = lItem.hyIp
              item.hyMarkName = lItem.hyMarkName
            }
          })
        })
      }
      const listData = []
      res.data.forEach((item, index) => {
        const size = this.$tool.conversionData('data', Number(100 - item.avgValue), 'b').size
        this.$set(item, 'percentage', size > 0 ? `${size}%` : '0')
        if (item.hyMarkName) {
          listData.push(item)
        }
      })
      const tableLength = 10 - listData.length
      if (listData.length < 10) {
        for (let i = 0; i < tableLength; i++) {
          listData.push({ hyMarkName: '暂无数据', Value: '-' })
        }
      }
      return listData
    },
    // 获取设备类型
    loadItType() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.devTypeList = res.data
        }
      })
    },
    // 点击告警设备名称跳转到it监控设备详情
    async handlerToItMonitorDevice(row) {
      const { data } = await request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_sub_dev_type', limit: -1, ids: row.hySubdevTypeId }
      })
      this.$router.push({
        name: 'ResourceMonitorDetail',
        query: {
          id: row.hyHostId || 0,
          zbxHostId: row.hyZhostId,
          agent: row.agent,
          devTypeId: row.hyDevTypeId,
          subType: data && data.length > 0 ? data[0].dictdataValue : '',
          hySubdevTypeId: row.hySubdevTypeId && row.hySubdevTypeId > 0 ? row.hySubdevTypeId : ''
        }
      })
    },

    // 数据
    findData(id) {
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
      if (this.aTitle === 1) {
        this.form.deviceType = 479
      } else if (this.aTitle === 2) {
        this.form.deviceType = 481
      } else if (this.aTitle === 3) {
        this.form.deviceType = 478
      }

      // CPU TOP
      request({
        url: api.Summary.findZbxTrendStatistics,
        data: { ...this.form, dataType: 1 }
      }).then(async res => {
        if (res.code === 1) {
          const ids = []
          res.data.forEach(item => {
            ids.push(item.hostId)
          })
          const logData = await request({ url: api.itMonitor.findHyitHost, data: { ids, agents: this.sessionStorageOperation('get', 'agentId') }})
          if (logData.code === 1) {
            res.data.forEach(item => {
              logData.data.forEach(items => {
                if (item.hostId === items.hyHostId) {
                  item.hyIp = items.hyIp
                  item.hyMarkName = items.hyMarkName
                  item.hySubdevTypeId = items.hySubdevTypeId
                  item.hyHostId = items.hyHostId
                  item.hyZhostId = items.hyZhostId
                  item.hyDevTypeId = items.hyDevTypeId
                }
              })
            })
          }
          const listData = []
          res.data.forEach((item, index) => {
            this.$set(item, 'Value', this.$tool.conversionData('data', Number(item.avgValue), 'b').size)
            this.$set(item, 'Symbol', this.$tool.conversionData('data', Number(item.avgValue), 'b').units)
            if (item.hyMarkName && listData.length < 10) {
              listData.push(item)
            }
          })
          const tableLength = 10 - listData.length
          if (listData.length < 10) {
            for (let i = 0; i < tableLength; i++) {
              listData.push({ hyMarkName: '暂无数据', Value: '-' })
            }
          }
          this.tableList = listData
        }
      })

      // 内存 TOP
      request({
        url: api.Summary.findZbxTrendStatistics,
        data: { ...this.form, dataType: 2 }
      }).then(async res => {
        if (res.code === 1) {
          const ids = []
          res.data.forEach(item => {
            ids.push(item.hostId)
          })
          const logData = await request({ url: api.itMonitor.findHyitHost, data: { ids, agents: this.sessionStorageOperation('get', 'agentId') }})

          if (logData.code === 1) {
            res.data.forEach(item => {
              logData.data.forEach(items => {
                if (item.hostId === items.hyHostId) {
                  item.hyIp = items.hyIp
                  item.hyMarkName = items.hyMarkName
                  item.hySubdevTypeId = items.hySubdevTypeId
                  item.hyHostId = items.hyHostId
                  item.hyZhostId = items.hyZhostId
                  item.hyDevTypeId = items.hyDevTypeId
                }
              })
            })
          }
          const listData = []
          res.data.forEach((item, index) => {
            this.$set(item, 'Value', this.$tool.conversionData('data', Number(item.avgValue), 'b').size)
            this.$set(item, 'Symbol', this.$tool.conversionData('data', Number(item.avgValue), 'b').units)
            if (item.hyMarkName && listData.length < 10) {
              listData.push(item)
            }
          })
          const portLength = 10 - listData.length
          if (listData.length < 10) {
            for (let i = 0; i < portLength; i++) {
              listData.push({ hyMarkName: '暂无数据', Value: '-' })
            }
          }
          this.portList = listData
        }
      })
      //   // 磁盘 TOP
      request({
        url: api.Summary.findZbxTrendStatistics,
        data: { ...this.form, dataType: 3, isDesc: 0 }
      }).then(async res => {
        if (res.code === 1) {
          res.data.forEach(item => {
            item.avgValue = 100 - item.avgValue // 空闲率转为使用率
          })
          this.diskList = res.data
          const ids = []
          res.data.forEach(item => {
            ids.push(item.hostId)
          })
          const logData = await request({ url: api.itMonitor.findHyitHost, data: { ids, agents: this.sessionStorageOperation('get', 'agentId') }})

          if (logData.code === 1) {
            res.data.forEach(item => {
              logData.data.forEach(items => {
                if (item.hostId === items.hyHostId) {
                  item.hyIp = items.hyIp
                  item.hyMarkName = items.hyMarkName
                  item.hySubdevTypeId = items.hySubdevTypeId
                  item.hyHostId = items.hyHostId
                  item.hyZhostId = items.hyZhostId
                  item.hyDevTypeId = items.hyDevTypeId
                }
              })
            })
          }
          const listData = []
          res.data.forEach((item, index) => {
            this.$set(item, 'Value', this.$tool.conversionData('data', Number(item.avgValue), 'b').size)
            this.$set(item, 'Symbol', this.$tool.conversionData('data', Number(item.avgValue), 'b').units)
            if (item.hyMarkName && listData.length < 10) {
              listData.push(item)
            }
          })
          const diskLength = 10 - listData.length
          if (listData.length < 10) {
            for (let i = 0; i < diskLength; i++) {
              listData.push({ hyMarkName: '暂无数据', Value: '-' })
            }
          }
          this.diskList = listData
        }
      })
    },
    // 点击大标题
    changeColorA(id) {
      this.aTitle = id
      this.Subtitle = 1
      if (id === 1) {
        this.deviceType = 479
      } else if (id === 2) {
        this.deviceType = 481
      } else if (id === 3) {
        this.deviceType = 478
      }
      this.findData()
    },
    // 点击日期
    changeBottomA(id) {
      this.Subtitle = id
      this.findData(id)
    }
  }
}
</script>
<style lang="scss" scoped>
i {
  font-style: normal;
  font-weight: 700;
}
.table-wrapper {
    display: flex;
    .service {
        cursor:pointer;
        font-size: 15px;
        width: 120px;
        height: 40px;
        text-align: center;
        line-height: 40px;
        font-weight: 400;
        border: 1px solid rgb(204,204,204);
        border-bottom: 0px;
        // background-color: white;
    }
    .service1 {
        cursor:pointer;
        font-size: 15px;
        width: 120px;
        height: 40px;
        text-align: center;
        line-height: 40px;
        font-weight: 700;
        border: 1px solid rgb(204,204,204);
        border-bottom: 0px;
        background-color: white;
    }
}
.time {
    // border: 1px solid rgb(204,204,204);
    margin: 20px auto 20px;
    width: 100%;
    height: 40px;
    .time-box {
        display: flex;
        justify-content: center;
        align-items: center;
        div {
            cursor:pointer;
            font-size: 16px;
            width: 50px;
            height: 40px;
            text-align: center;
            line-height: 40px;
            font-weight: 400;
            color: #999999;
            margin: 0 20px;
            // border-bottom: 2px solid rgb(1,69,171);
        }
        .week {
            border-bottom: 3px solid rgb(1,63,165);
             font-weight: 700;
            color:rgb(1,63,165);
        }
    }
}
.filter-container{
    margin-top: 10px;
    font-size:18px;
    font-weight:700;
}
.table-wrapper{
        margin-top: 30px;
        border: 0px;
        border-bottom: 1px solid rgb(204,204,204);

}
.rank-title {
    font-size: 15px;
    font-weight: 700;
    height: 43px;
    background: rgb(242,246,251);
    line-height: 40px;
    padding-left: 10px;
    .export-right {
      float: right;
    }
}
.Ranking {
    display: flex;
    height: 880px;
    .Rank1 {
        flex: 1;
        margin: 0 10px;
        background: white;
        margin-top: 10px;

    }
}
.rank-div {
  height: 80px;
    display: flex;
    position: relative;
    // border: 1px solid rgb(204,204,204);
  //   .iColor1{
  //      font-style: normal;
  //      text-align: center;
  //      line-height: 20px;
  //      margin-top: 14px;
  //      margin-left: 10px;
  //      width: 20px;
  //      height: 20px;
  //      border-radius: 3px;
  //      background: rgb(170,170,170);
  //      color: white;
  //  }
   .iColor1 {
    margin-top: 15px;
    margin-left: 15px;
    width: 30px;
    text-align: center;
    line-height: 70px;
    background-color: rgb(238,238,238);
  }
   .iColor2{
       font-style: normal;
       text-align: center;
       line-height: 20px;
       margin-top: 14px;
       margin-left: 10px;
       width: 20px;
       height: 20px;
       border-radius: 3px;
       background: rgb(255,64,0);
       color: white;
   }
   .progress {
    //  border: 1px solid black;
     position: absolute;
     bottom: 5px;
     width: 80%;
     left: 55px;
   }
}
.rank-box {
    //  border: 1px solid black;

    display: flex;
    height: 50px;
    border-radius: 3px;
    flex-flow: row nowrap;
    justify-content: space-between;
    margin-top: 15px;
    //margin-bottom: 2px;
    flex: 1;
   .rank-box-data {
       margin-left: 15px;
        div{
            margin-bottom: 10px;
        }
        .data-name {
            //margin-top: 10px;
            margin-bottom: 0;
            font-size: 14px;
            line-height: 25px;
            color: #333333;
        }
        .data-name1 {
          margin-top: 26px;
        }
        .data-ip {
          line-height: 20px;
          color:#999999
        }
   }
  .speed {
       //margin: 15px;
       font-size: 20px;
       line-height: 45px;
       margin-right: 15px;
       em {
         font-size: 12px;
         margin-left: 5px;
       }
   }

}
</style>

