<template>
  <div class="app-container">
    <ProjectTab @handleClick="handleClick" />
    <div class="filter-container">
      <el-select v-model="listQuery.agents" placeholder="网关" clearable class="filter-item" style="width: 200px">
        <el-option v-for="item in agentList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-input v-model="listQuery.keyword" placeholder="请输入关键字" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="search" />
      <el-date-picker
        v-model="SEData"
        class="filter-item"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="yyyy-MM-dd"
      />
      <el-button class="filter-item" type="primary" @click="search">搜索</el-button>
      <!-- <OutputExcel ref="outputExcel" @submitQuery="submitQuery" /> -->
      <ExportExcelWithStyle class="filter-item" button-title="汇总导出" :row-height="rowHeight" :loading="exportLoading" :title="exportFileName" :fillter-list="fillerList" :excel-title="ExcelTitle" :file-name="exportFileName" @sendRequest="showDataDialog" />
      <ListControl :check-list="checkList" :storage-val="storageVal" @setLists="setLists" />
    </div>
    <div class="table-wrapper">
      <el-table
        :data="statement"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="序号" type="index" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="设备名称" prop="hyMarkName" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="IP" prop="hyIp" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="端口名称" prop="portName" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="端口描述" prop="portDescribe" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="连接状态" prop="connetStatue" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" label="管理状态" prop="manageStatue" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" label="端口最大发送值(Kb/s)" prop="portSendMax" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[7].ispass : true" label="端口平均发送值(Kb/s)" prop="portSendAvg" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[8].ispass : true" label="端口最大接收值(Kb/s)" prop="portRecvMax" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[9].ispass : true" label="端口平均接收值(Kb/s)" prop="portRecvAvg" show-overflow-tooltip />
      </el-table>
      <pagination v-show="listTotal > 0" :auto-scroll="false" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="changeSize" />
    </div>
    <el-dialog title="汇总导出" :visible.sync="showDialog" width="50%" top="5vh">
      <el-form label-width="120px">
        <el-date-picker
          v-model="timeData"
          class="filter-item"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
        />
        <el-button class="filter-item m-left" type="primary" @click="oneDay">一天</el-button>
        <el-button class="filter-item" type="primary" @click="threeDay">三天</el-button>
        <el-button class="filter-item" type="primary" @click="oneWeek">七天</el-button>
        <el-button class="filter-item" type="primary" @click="oneMonth">三十天</el-button>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="showDialog = false">取 消</el-button>
        <el-button :loading="exportLoading" class="filter-item" type="primary" @click="confirm">导 出</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ProjectTab from '../../components/data-statement/project-tab'
import Pagination from '@/components/Pagination'
// import OutputExcel from '@/components/outputExcel'
import ExportExcelWithStyle from '@/components/ExportExcelWithStyle/export-excel-with-style'
import ListControl from '@/components/ListControl'

export default {
  name: 'FlowStatement',
  components: {
    ProjectTab,
    Pagination,
    // OutputExcel,
    ExportExcelWithStyle,
    ListControl
  },
  data() {
    return {
      // 显示控制数据 start
      checkList: ['设备名称', 'IP', '端口名称', '端口描述', '连接状态', '管理状态', '端口最大发送值(Kb/s)', '端口平均发送值(Kb/s)', '端口最大接收值(Kb/s)', '端口平均接收值(Kb/s)'],
      lists: [],
      storageVal: 'it-traffic-report', // 存入localStorageOperation的名字
      // 显示控制数据 end
      listQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        stime: '',
        etime: '',
        agents: ''
      },
      page: 1,
      size: 10,
      listTotal: 0,
      initialData: [],
      agentList: [],
      statement: [],
      loading: false,
      exportLoading: false,
      SEData: '',
      showDialog: false,
      timeData: [],
      sTime: '',
      eTime: '',
      // 导出汇总excel参数配置
      exportFileName: '',
      rowHeight: [ // excel各行行高
        { num: 1, height: 70},
        { num: 2, height: 40},
        { num: 3, height: 40}
      ],
      fillerList: [],
      ExcelTitle: [
        {
          title: '设备名称',
          dataIndex: 'hyMarkName',
          width: 40
        },
        {
          title: 'IP',
          dataIndex: 'hyIp',
          width: 30
        },
        {
          title: '端口名称',
          dataIndex: 'portName',
          width: 40
        },
        {
          title: '端口描述',
          dataIndex: 'portDescribe',
          width: 40
        },
        {
          title: '连接状态',
          dataIndex: 'connetStatue',
          width: 10
        },
        {
          title: '管理状态',
          dataIndex: 'manageStatue',
          width: 10
        },
        {
          title: '端口最大发送值(Kb/s)',
          dataIndex: 'portSendMax',
          width: 25
        },
        {
          title: '端口平均发送值(Kb/s)',
          dataIndex: 'portSendAvg',
          width: 25
        },
        {
          title: '端口最大接收值(Kb/s)',
          dataIndex: 'portRecvMax',
          width: 25
        },
        {
          title: '端口平均接收值(Kb/s)',
          dataIndex: 'portRecvAvg',
          width: 25
        }
      ]
    }
  },
  methods: {
    setLists(val) {
      this.lists = val
    },

    confirm() {
      this.sendRequest()
    },
    showDataDialog() {
      this.showDialog = true
    },
    getDay(val) {
      const date = new Date()
      const callbackDayList = this.$tool.callbackDay(val) // 倒推天数
      const sTime = `${callbackDayList[callbackDayList.length - 1]}`
      const eTime = `${this.$tool.dateFormat('YYYY-mm-dd', date)}`
      const timeData = [sTime, eTime]
      return timeData
    },
    oneDay() {
      this.timeData = this.getDay(1)
    },
    threeDay() {
      this.timeData = this.getDay(3)
    },
    oneWeek() {
      this.timeData = this.getDay(7)
    },
    oneMonth() {
      this.timeData = this.getDay(30)
    },
    // 导出汇总excel
    sendRequest() {
      if (this.timeData.length > 1) {
        this.sTime = `${this.timeData[0]} 00:00:00`
        this.eTime = `${this.timeData[1]} 23:59:59`
        this.exportFileName = `设备流量导出报表（近${(this.$tool.getDaysBetween(this.timeData[0], this.timeData[1])) + 1}天的统计）`
      } else {
        return this.$message.error('请选择时间范围')
      }
      this.showDialog = false
      this.$request({
        url: this.api.itMonitor.findZbxFlowStatistics,
        data: {
          page: 1,
          limit: -1,
          keyword: '',
          stime: this.sTime,
          etime: this.eTime,
          agents: this.listQuery.agents
        }
      }).then(res => {
        if (res.code === 1) {
          res.map.data.forEach(item => {
            item.connetStatue = item.connetStatue === 1 ? '在线' : '离线'
            item.manageStatue = item.manageStatue === 1 ? 'Up' : 'Down'
            const avgRecv = this.$tool.sizeUnitsTransform('B', 'KB', Number(item.portRecvAvg))
            item.portRecvAvg = avgRecv.size > 0 ? `${(avgRecv.size).toFixed(2)}` : ''
            const maxRecv = this.$tool.sizeUnitsTransform('B', 'KB', Number(item.portRecvMax))
            item.portRecvMax = maxRecv.size > 0 ? `${(maxRecv.size).toFixed(2)}` : ''
            const avgSend = this.$tool.sizeUnitsTransform('B', 'KB', Number(item.portSendAvg))
            item.portSendAvg = avgSend.size > 0 ? `${(avgSend.size).toFixed(2)}` : ''
            const maxSend = this.$tool.sizeUnitsTransform('B', 'KB', Number(item.portSendMax))
            item.portSendMax = maxSend.size > 0 ? `${(maxSend.size).toFixed(2)}` : ''
          })
          this.exportLoading = false
          this.fillerList = res.map.data
        }
      })
    },
    async handleClick(val) {
      console.log(val)
      this.$set(this.listQuery, 'agents', val.agent.toString())
      this.findHyitAgent(val.agent)
    },
    async findHyitAgent(agent) {
      this.$request({
        url: this.api.itMonitor.findHyitAgent,
        data: { ids: agent.toString(), limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          const data = []
          res.data.forEach(item => {
            data.push(item.id)
          })
          if (res.data.length > 1) {
            res.data.push(
              {id: data.join(','), name: '全部'}
            )
          }

          this.agentList = res.data
          this.$set(this.listQuery, 'agents', res.data[0].id)
          // this.generateStatement()
          this.findZbxFlowStatistics()
        }
      })
    },
    findZbxFlowStatistics(val) {
      if (!this.listQuery.stime || !this.listQuery.etime) {
        const data = this.getDay(7)
        this.SEData = [data[0], data[1]]
        this.$set(this.listQuery, 'stime', `${data[0]} 00:00:00`)
        this.$set(this.listQuery, 'etime', `${data[1]} 23:59:59`)
      }
      this.$request({
        url: this.api.itMonitor.findZbxFlowStatistics,
        data: { ...this.listQuery }
      }).then(res => {
        if (res.code === 1) {
          console.log(333)
          res.map.data.forEach(item => {
            item.connetStatue = item.connetStatue === 1 ? '在线' : '离线'
            item.manageStatue = item.manageStatue === 1 ? 'Up' : 'Down'
            const avgRecv = this.$tool.sizeUnitsTransform('B', 'KB', Number(item.portRecvAvg))
            item.portRecvAvg = avgRecv.size > 0 ? `${(avgRecv.size).toFixed(2)}` : ''
            const maxRecv = this.$tool.sizeUnitsTransform('B', 'KB', Number(item.portRecvMax))
            item.portRecvMax = maxRecv.size > 0 ? `${(maxRecv.size).toFixed(2)}` : ''
            const avgSend = this.$tool.sizeUnitsTransform('B', 'KB', Number(item.portSendAvg))
            item.portSendAvg = avgSend.size > 0 ? `${(avgSend.size).toFixed(2)}` : ''
            const maxSend = this.$tool.sizeUnitsTransform('B', 'KB', Number(item.portSendMax))
            item.portSendMax = maxSend.size > 0 ? `${(maxSend.size).toFixed(2)}` : ''
          })
          this.initialData = JSON.parse(JSON.stringify(res.map.data))
          this.listTotal = +res.count
          this.getTabelData2()
        }
      })
    },
    getTabelData2() {
      this.statement = this.initialData.slice(
        (this.page - 1) * this.size,
        this.page * this.size
      )
    },
    // page改变时的回调函数，参数为当前页码
    changeSize(val) {
      console.log('翻页，当前为第几页', val)
      this.page = val.page
      this.size = val.limit
      this.getTabelData2()
    },
    async generateStatement() {
      const findZbxFlowSummary = await this.getDataSource(this.listQuery.page, this.listQuery.limit)
      if (findZbxFlowSummary.code === 1) {
        this.statement = findZbxFlowSummary.data
        this.listTotal = +findZbxFlowSummary.count
      }
    },
    /**
     * @description 获取主表数据
     * @param page 页码
     * @param limit 条数，全部则传-1
     */
    async getDataSource(page, limit) {
      const listQuery = { ...this.listQuery }
      if (limit === -1) {
        listQuery.page = 1
        listQuery.limit = -1
      } else {
        listQuery.page = page
        listQuery.limit = limit
      }
      const dataSourceData = await this.findZbxFlowSummary(listQuery)
      if (dataSourceData.code && dataSourceData.data && dataSourceData.data.length > 0) {
        return { ...dataSourceData, data: await this.setTypeDataByData(dataSourceData.data) }
      } else {
        return { ...dataSourceData }
      }
    },
    search() {
      if (this.SEData) {
        console.log(this.SEData)
        this.$set(this.listQuery, 'stime', `${this.SEData[0]} 00:00:00`)
        this.$set(this.listQuery, 'etime', `${this.SEData[1]} 23:59:59`)
      } else {
        const data = this.getDay(7)
        this.SEData = [data[0], data[1]]
        this.$set(this.listQuery, 'stime', `${data[0]} 00:00:00`)
        this.$set(this.listQuery, 'etime', `${data[1]} 23:59:59`)
      }
      this.$set(this.listQuery, 'page', 1)
      // this.generateStatement()
      this.findZbxFlowStatistics()
    },

    // async submitQuery(excelQuery) {
    //   if (this.SEData) {
    //     this.$set(this.listQuery, 'stime', `${this.SEData[0]} 00:00:00`)
    //     this.$set(this.listQuery, 'etime', `${this.SEData[1]} 23:59:59`)
    //   } else {
    //     this.$set(this.listQuery, 'stime', '')
    //     this.$set(this.listQuery, 'etime', '')
    //   }
    //   const data = await this.getDataSource(excelQuery.page, excelQuery.limit)
    //   const excelTitle = [
    //     {
    //       title: '设备名称',
    //       dataIndex: 'hyMarkName'
    //     },
    //     {
    //       title: '端口名称',
    //       dataIndex: 'portName'
    //     },
    //     {
    //       title: '端口类型',
    //       dataIndex: 'portTypeName'
    //     },
    //     {
    //       title: '连接状态',
    //       dataIndex: 'connetStatue'
    //     },
    //     {
    //       title: '管理状态',
    //       dataIndex: 'manageStatue'
    //     },
    //     {
    //       title: '端口描述',
    //       dataIndex: 'portDescribe'
    //     },
    //     {
    //       title: '端口发送最大值',
    //       dataIndex: 'portSendMax'
    //     },
    //     {
    //       title: '端口发送最小值',
    //       dataIndex: 'portSendMin'
    //     },
    //     {
    //       title: '端口发送平均值',
    //       dataIndex: 'portSendAvg'
    //     },
    //     {
    //       title: '端口发送最大值',
    //       dataIndex: 'portRecvMax'
    //     },
    //     {
    //       title: '端口发送最小值',
    //       dataIndex: 'portRecvMin'
    //     },
    //     {
    //       title: '端口发送平均值',
    //       dataIndex: 'portRecvAvg'
    //     },
    //     {
    //       title: '发送数据',
    //       dataIndex: 'portSendValue'
    //     },
    //     {
    //       title: '接收数据',
    //       dataIndex: 'portRecvValue'
    //     },
    //     {
    //       title: '发送丢包数',
    //       dataIndex: 'portSendError'
    //     },
    //     {
    //       title: '接收丢包数',
    //       dataIndex: 'portRecvError'
    //     },
    //     {
    //       title: '数据更新时间',
    //       dataIndex: 'updateTime'
    //     }
    //   ]

    //   this.$refs.outputExcel.output(excelTitle, data.data)
    // },
    async findZbxFlowSummary(query) {
      return this.$request({
        url: this.api.itMonitor.findZbxFlowSummary,
        data: query
      })
    },
    setTypeDataByData(data) {
      data.forEach(item => {
        let sendSuffix = ''
        let sendUnit = ''
        let recvSuffix = ''
        let recvUnit = ''
        if (item.portSendUnit && item.portSendUnit.indexOf('ps') !== -1) {
          sendSuffix = 'MBPS'
          sendUnit = item.portSendUnit.split('ps')[0]
        }
        if (item.portSendUnit && item.portSendUnit.indexOf('/s') !== -1) {
          sendSuffix = 'MB/s'
          sendUnit = item.portSendUnit.split('/s')[0]
        }
        if (item.portRecvUnit && item.portRecvUnit.indexOf('ps') !== -1) {
          recvSuffix = 'MBPS'
          recvUnit = item.portSendUnit.split('ps')[0]
        }
        if (item.portRecvUnit && item.portRecvUnit.indexOf('/s') !== -1) {
          recvSuffix = 'MB/s'
          recvUnit = item.portSendUnit.split('/s')[0]
        }
        const send = this.$tool.sizeUnitsTransform(sendUnit, 'MB', item.portSend)
        const recv = this.$tool.sizeUnitsTransform(recvUnit, 'MB', item.portRecv)
        item.portTypeName = item.portType === 1 ? '物理端口' : '逻辑端口'
        item.connetStatue = item.connetStatue === 1 ? '在线' : '离线'
        item.manageStatue = item.manageStatue === 1 ? 'Up' : 'Down'
        item.portSendValue = `${send.size.toFixed(2) > 0 ? send.size.toFixed(2) : ''}${send.size.toFixed(2) > 0 ? sendSuffix : ''}`
        item.portRecvValue = `${recv.size.toFixed(2) > 0 ? recv.size.toFixed(2) : ''}${recv.size.toFixed(2) > 0 ? recvSuffix : ''}`
        const maxSend = this.$tool.sizeUnitsConversion(item.portSendMax, 'capital')
        item.portSendMax = +maxSend.size > 0 ? `${maxSend.size}${maxSend.units}/s` : ''
        const minSend = this.$tool.sizeUnitsConversion(item.portSendMin, 'capital')
        item.portSendMin = +minSend.size > 0 ? `${minSend.size}${minSend.units}/s` : ''
        const avgSend = this.$tool.sizeUnitsConversion(item.portSendAvg, 'capital')
        item.portSendAvg = +avgSend.size > 0 ? `${avgSend.size}${avgSend.units}/s` : ''
        const maxRecv = this.$tool.sizeUnitsConversion(item.portRecvMax, 'capital')
        item.portRecvMax = +maxRecv.size > 0 ? `${maxRecv.size}${maxRecv.units}/s` : ''
        const minRecv = this.$tool.sizeUnitsConversion(item.portRecvMin, 'capital')
        item.portRecvMin = +minRecv.size > 0 ? `${minRecv.size}${minRecv.units}/s` : ''
        const avgRecv = this.$tool.sizeUnitsConversion(item.portRecvAvg, 'capital')
        item.portRecvAvg = +avgRecv.size > 0 ? `${avgRecv.size}${avgRecv.units}/s` : ''
      })
      return data
    }
  }
}
</script>

<style lang="scss" scoped>
.m-left {
  margin-left: 10px;
}
</style>
