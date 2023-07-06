<template>
  <div class="app-container">
    <div class="table-wrapper">
      <div v-for="(item,index) in flow" :key="index" style="cursor:pointer" :class="aTitle === item.id ? 'box1':'box'" @click="changeColorA(item.id)">{{ item.data }}</div>
    </div>

    <div class="time">
      <div class="time-box">
        <div v-for="(item,index) in SubtitleList" :key="index" style="cursor:pointer" :class="Subtitle === item.id ? 'week':''" @click="changeBottomA(item.id)">{{ item.label }}</div>
      </div>
    </div>
    <div class="Ranking">
      <div v-if="tableList.length > 0" class="Rank1">
        <div class="rank-title">设备排行
          <OutputExcel v-if="showEquipment" ref="outputExcel" class="export-right" @submitQuery="submitEquipment" />
        </div>
        <div v-for="(item,index) in tableList" :key="index" class="rank-div">
          <i class="iColor1">{{ index+1 }}</i>

          <div class="rank-box">
            <div class="rank-box-data">
              <div v-if="(item.show === false)" class="data-name">{{ item.hyMarkName }}</div>
              <div v-else class="data-name">
                <el-link type="primary" @click="handlerToItMonitorDevice(item)">{{ item.hyMarkName }}</el-link>
              </div>
              <div class="data-ip">{{ item.hyIp }}</div>
            </div>
            <div class="speed">{{ item.Value }}<em>{{ item.Symbol }}/s</em></div>
          </div>
        </div>
      </div>

      <div v-if="portList.length > 0" class="Rank1">
        <div class="rank-title">端口排行
          <OutputExcel v-if="showPort" ref="outputExcel" class="export-right" @submitQuery="submitPort" />
        </div>
        <div v-for="(item,index) in portList" :key="index" class="rank-div">
          <i class="iColor1">{{ index+1 }}</i>

          <div class="rank-box">
            <div class="rank-box-data">

              <div v-if="(item.show===false)" class="data-name">[{{ item.hyMarkName }}]</div>
              <div v-else class="data-name">
                <em>[ <el-link type="primary" @click="handlerToItMonitorDevice(item)">{{ item.hyMarkName }}</el-link>]</em> {{ filterSymbol(item.portName) }}
              </div>
              <div class="data-ip">{{ item.hyIp }}</div>
            </div>
            <div class="speed">{{ item.Value }}<em>{{ item.Symbol }}/s</em></div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { conversionSymbols } from '@/utils/utils'
import OutputExcel from '@/components/outputExcel/index.vue'
// import Strategy from '@/views-admin/video/strategy.vue'
// import StatisticsUp from './components/statistics-up.vue'
export default {
  name: 'Statistics',
  components: {
    OutputExcel
    // Strategy
    // StatisticsUp
  },
  data() {
    return {
      activeName: 'first',
      aTitle: 1,
      Subtitle: 1,
      activeDeviceType: '', // 用于点击改变大标题按钮样式
      activeSubType: '', // 用于点击改变小标题按钮样式
      form: {
        page: 1,
        limit: 10,
        dataType: 4 // 设备类型 1cpu使用率 2内存使用率 3硬盘使用率 4上行流量 5下行流量
        // sTime: '', // 开始时间
        // eTime: '' // 结束时间
      },
      portData: {
        page: 1,
        limit: 10,
        itemids: [],
        agents: ''
      },
      flow: [
        { data: '上行流量', id: 1 },
        { data: '下行流量', id: 2 }

      ],
      SubtitleList: [
        { label: '本周', id: 1 },
        { label: '本月份', id: 2 },
        { label: '本季度', id: 3 },
        { label: '本年度', id: 4 }
      ],
      tableList: {}, // 存设备排行数据
      portList: {}, // 存端口排行数据
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
      showEquipment: true,
      showPort: true,
      agents: ''
    }
  },
  computed: {
    filterSymbol() {
      return function(val) {
        if (val) {
          let num = conversionSymbols(val).split('(')
          return num[0]
        } else {
          return ''
        }
      }
    }
  },
  mounted() {
    this.agents = this.sessionStorageOperation('get', 'agentId')
    this.findWeek() // 本周
  },
  methods: {
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
    // 导出设备排行
    async submitEquipment(excelQuery) {
      const data = await this.exportEquipment(excelQuery)
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
          title: '速率',
          dataIndex: 'rate'
        }
      ]
      this.$refs.outputExcel.output(excelTitle, data)
      this.showEquipment = false
      setTimeout(() => {
        this.showEquipment = true
      })
    },
    // 导出设备排行的数据
    async exportEquipment(val) {
      // this.loading = true
      const res = await request({
        url: api.Summary.findZbxTrendHostFlowStatistics,
        data: { ...this.form, page: 1, limit: val.limit }
      })
      if (res.code !== 1) return
      const tableList = JSON.parse(res.model)
      const ids = []
      tableList.forEach(item => {
        ids.push(item.hostId)
      })
      const logData = await request({ url: api.itMonitor.findHyitHost, data: { limit: -1, agents: this.agents} })
      if (logData.code === 1) {
        tableList.forEach(item => {
          logData.data.forEach(itemS => {
            if (+item.hostId === +itemS.hyHostId) {
              item.hyIp = itemS.hyIp
              item.hyMarkName = itemS.hyMarkName
            }
          })
        })
      }

      tableList.forEach((item, index) => {
        const size = this.$tool.sizeUnitsConversion(Number(item.totalValue), 'capital').size
        const units = this.$tool.sizeUnitsConversion(Number(item.totalValue), 'capital').units
        this.$set(item, 'Value', size)
        this.$set(item, 'Symbol', units)
        this.$set(item, 'rate', size > 0 ? `${size}${units}/s` : '0B/s')
      })
      const tableLength = 10 - tableList.length
      if (tableList.length < 10) {
        for (let i = 0; i < tableLength; i++) {
          tableList.push({ hyMarkName: '暂无数据' })
        }
      }
      // this.loading = false
      return tableList
    },
    // 导出端口排行
    async submitPort(excelQuery) {
      const data = await this.exportPort(excelQuery)
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
          title: '速率',
          dataIndex: 'rate'
        }
      ]
      this.$refs.outputExcel.output(excelTitle, data)
      this.showPort = false
      setTimeout(() => {
        this.showPort = true
      })
    },
    // 导出端口排行的数据
    async exportPort(val) {
      // this.loading = true
      const res = await request({
        url: api.Summary.findZbxTrendStatistics,
        data: { ...this.form, page: 1, limit: val.limit }
      })
      if (res.code !== 1) return
      const portList = res.data
      const idx = []
      portList.forEach(item => {
        idx.push(item.itemId)
      })
      this.portData.itemids = idx
      if (res.data.length > 0) {
        this.portData.agents = this.agents
      } else {
        this.portData.agents = ''
      }
      // 显示主机名
      const logData = await request({ url: api.itMonitor.findHyitHost, data: { limit: -1, agents: this.agents }})
      if (logData.code === 1) {
        portList.forEach(item => {
          logData.data.forEach(itemB => {
            if (+item.hostId === +itemB.hyHostId) {
              item.hyIp = itemB.hyIp
              item.hyMarkName = itemB.hyMarkName
            }
          })
        })
      }
      // 显示端口名
      if (this.portData.itemids.length > 0) {
        const portData = await request({ url: api.itMonitor.findZbxItemsHost, data: { ...this.portData, limit: -1 } })
        if (portData.code === 1) {
          portList.forEach(item => {
            portData.data.forEach(itemF => {
              if (+item.itemId === +itemF.itemid) {
                this.$set(item, 'portName', this.filterSymbol(itemF.name))
              }
            })
          })
        }
      }

      portList.forEach((item, index) => {
        const size = this.$tool.sizeUnitsConversion(Number(item.avgValue), 'capital').size
        const units = this.$tool.sizeUnitsConversion(Number(item.avgValue), 'capital').units
        this.$set(item, 'Value', size)
        this.$set(item, 'Symbol', units)
        this.$set(item, 'rate', size > 0 ? `${size}${units}/s` : '0B/s')
        if (item.portName) {
          this.$set(item, 'hyMarkName', `[${item.hyMarkName}]${item.portName}`)
        }
      })
      const portLength = 10 - portList.length
      if (portList.length < 10) {
        for (let i = 0; i < portLength; i++) {
          portList.push({ hyMarkName: '暂无数据' })
        }
      }
      // this.loading = false
      return portList
    },
    // 本周
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
      if (this.aTitle === 1) {
        this.form.dataType = 4
      } else if (this.aTitle === 2) {
        this.form.dataType = 5
      }
      // 设备排行
      request({
        url: api.Summary.findZbxTrendHostFlowStatistics,
        data: this.form
      }).then(async res => {
        if (res.code === 1) {
          this.tableList = JSON.parse(res.model)
          const ids = []
          this.tableList.forEach(item => {
            ids.push(item.hostId)
          })
          const logData = await request({ url: api.itMonitor.findHyitHost, data: { ids, agents: this.agents }})

          if (logData.code === 1) {
            this.tableList.forEach(item => {
              logData.data.forEach(items => {
                if (+item.hostId === +items.hyHostId) {
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

          this.tableList.forEach((item, index) => {
            this.$set(item, 'Value', this.$tool.sizeUnitsConversion(Number(item.totalValue), 'capital').size)
            this.$set(item, 'Symbol', this.$tool.sizeUnitsConversion(Number(item.totalValue), 'capital').units)
          })
          const tableLength = 10 - this.tableList.length
          if (this.tableList.length < 10) {
            for (let i = 0; i < tableLength; i++) {
              this.tableList.push({ hyMarkName: '暂无数据', show: false })
            }
          }
        }
      })
      // 端口排行
      request({
        url: api.Summary.findZbxTrendStatistics,
        data: this.form
      }).then(async res => {
        if (res.code === 1) {
          this.portList = res.data
          const ids = []
          this.portList.forEach(item => {
            ids.push(item.hostId)
          })
          const idx = []
          this.portList.forEach(item => {
            idx.push(item.itemId)
          })
          this.portData.itemids = idx
          if (res.data.length > 0) {
            this.portData.agents = this.agents
          } else {
            this.portData.agents = ''
          }
          // 显示主机名
          const logData = await request({ url: api.itMonitor.findHyitHost, data: { ids, agents: this.agents }})
          if (logData.code === 1) {
            this.portList.forEach(item => {
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
            this.$set(item, 'Value', this.$tool.sizeUnitsConversion(Number(item.avgValue), 'capital').size)
            this.$set(item, 'Symbol', this.$tool.sizeUnitsConversion(Number(item.avgValue), 'capital').units)
          })
          const portLength = 10 - this.portList.length
          if (this.portList.length < 10) {
            for (let i = 0; i < portLength; i++) {
              this.portList.push({ hyMarkName: '暂无数据', show: false })
            }
          }
        }
      })
    },
    // 点击流量
    changeColorA(id) {
      this.aTitle = id
      this.Subtitle = 1
      this.findWeek()
    },
    // 点击日期
    changeBottomA(id) {
      this.Subtitle = id
      this.findWeek(id)
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
    .box1 {
        cursor:pointer;
        font-size: 15px;
        width: 120px;
        height: 40px;
        text-align: center;
        line-height: 40px;
        font-weight:700;
        background-color: white;
        border: 1px solid rgb(204,204,204);
        border-bottom: 0px;
    }
    .box {
        cursor:pointer;
        font-size: 16px;
        width: 120px;
        height: 40px;
        text-align: center;
        line-height: 40px;
        font-weight: 400;
        border: 1px solid rgb(204,204,204);
        border-bottom: 0px;
    }
}
.time {
    margin: 20px auto;
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
            color: #999999;
            margin: 0 20px;
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
    margin-top: 10px;
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
    .Rank1 {
        flex: 1;
        margin: 0 10px;
        background: white;
        margin-top: 5px;

    }
}
.rank-div {
    display: flex;
    border-bottom: 1px solid #f5f5f5;
    padding-bottom: 5px;
  .iColor1 {
    margin-top: 15px;
    margin-left: 15px;
    width: 30px;
    text-align: center;
    line-height: 50px;
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
}
.rank-box {
    display: flex;
    height: 50px;
    border-radius: 3px;
    flex-flow: row nowrap;
    justify-content: space-between;
    margin-top: 15px;
    flex: 1;
   .rank-box-data {
       margin-left: 15px;
        .data-name {
            margin-bottom: 0;
            font-size: 14px;
            line-height: 25px;
            color: #333333;
        }
        .data-ip {
            line-height: 20px;
            color:#999999
        }
   }
   .speed {
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
