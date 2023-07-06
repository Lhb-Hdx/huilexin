<template>
  <div class="app-container">
    <ProjectTab @handleClick="handleClick" />
    <div class="filter-container">
      <el-select v-model="listQuery.status" placeholder="告警状态" clearable class="filter-item" style="width: 200px">
        <el-option v-for="item in stateCatData" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="listQuery.level" placeholder="告警级别" clearable class="filter-item" style="width: 200px">
        <el-option v-for="item in levelData" :key="item.dictdataValue" :label="item.dictdataName" :value="item.dictdataValue" />
      </el-select>
      <el-select v-model="listQuery.userId" v-loadmore="loadMoreUser" placeholder="运维人员" clearable class="filter-item" style="width: 200px">
        <el-option v-for="item in sysUserList" :key="item.userId" :label="item.realName" :value="item.userId" />
      </el-select>
      <el-date-picker v-model="listQuery.startCLock" class="filter-item" type="datetime" placeholder="开始时间" value-format="timestamp" style="width: 200px;" />
      <el-date-picker v-model="listQuery.endClock" class="filter-item" type="datetime" placeholder="结束时间" value-format="timestamp" style="width: 200px;" />
      <el-button class="filter-item" type="primary" @click="search">搜索</el-button>
      <OutputExcel ref="outputExcel" @submitQuery="submitQuery" />
      <ExportExcelWithStyle
        class="filter-item"
        :base64="base64"
        :merge-num="mergeNum"
        :content="content"
        :row-height="rowHeight"
        button-title="汇总导出"
        :loading="exportLoading"
        :title="exportFileName"
        :fillter-list="fillerList"
        :excel-title="ExcelTitle"
        :file-name="exportFileName"
        @sendRequest="showDataDialog"
      />
      <ListControl :check-list="checkList" :storage-val="storageVal" @setLists="setLists" />
    </div>
    <div class="table-wrapper">
      <el-table
        :data="statement"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="序号" prop="hyKnowId" type="index" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="级别" width="120">
          <template slot-scope="{row}">
            <span :style="{ color: row.levelStyle }">{{ row.levelName }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" width="400" align="left" label="故障名称" prop="description" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" width="200" label="设备" align="left" show-overflow-tooltip>
          <template slot-scope="{row}">
            <el-link type="primary" @click="handlerToItMonitorDevice(row)">{{ row.deviceName }}</el-link>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="right" label="IP" prop="ip" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="right" label="告警时间" prop="clockValue" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="right" label="跟进时间" prop="rclockValue" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" align="left" label="处理状态">
          <template slot-scope="{row}">
            <span :style="{ color: row.stateStyle }">{{ row.stateName }}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="listTotal > 0" :auto-scroll="false" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="generateStatement" />
    </div>
    <div class="Echarts">
      <div id="firstChart" ref="firstChart" style="width: 400px;height: 400px;" />
      <canvas class="canvas" width="400" height="400" />
    </div>
    <div class="Echarts">
      <div id="secondChart" ref="secondChart" style="width: 400px;height: 400px;" />
      <canvas class="canvas" width="400" height="400" />
    </div>
    <div class="Echarts">
      <div id="threeChart" ref="threeChart" style="width: 400px;height: 400px;" />
      <canvas class="canvas" width="400" height="400" />
    </div>
    <el-dialog title="汇总导出" :visible.sync="showDialog" width="50%" top="5vh">
      <el-form label-width="120px">
        <el-date-picker v-model="listQuery.startCLock" class="filter-item" type="datetime" placeholder="开始时间" value-format="timestamp" style="width: 200px;" />
        <el-date-picker v-model="listQuery.endClock" class="filter-item" type="datetime" placeholder="结束时间" value-format="timestamp" style="width: 200px;" />
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
import Pagination from '@/components/Pagination'
import ProjectTab from '../../components/data-statement/project-tab'
import { getUserInfo } from '@/utils/auth'
import OutputExcel from '@/components/outputExcel'
import ExportExcelWithStyle from '@/components/ExportExcelWithStyle/export-excel-with-style'
import * as echarts from 'echarts'
import ListControl from '@/components/ListControl'

export default {
  name: 'AlarmStatement',
  components: {
    ProjectTab,
    Pagination,
    OutputExcel,
    ExportExcelWithStyle,
    ListControl
  },
  data() {
    return {
      listQuery: {
        page: 1,
        limit: 10,
        level: '',
        agents: '',
        status: '',
        startCLock: '',
        endClock: ''
      },
      agentsIds: '',
      stateCatData: [
        { label: '待处理', value: 0, color: 'red' },
        { label: '已处理', value: 1, color: 'green' },
        { label: '自动恢复', value: 3, color: 'grey' },
        { label: '处理中', value: 4, color: 'grey' }
      ],
      levelData: [],
      users: [],
      statement: [],
      listTotal: 0,
      dealUsersData: [],
      findSysUserQuery: {
        page: 1,
        limit: 10
      },
      sysUserList: [],
      showDialog: false,
      timeData: [],
      sTime: '',
      eTime: '',
      // 导出excel的参数
      devTypeList: [],
      // 级别
      devStatus: [
        { value: 0, name: '信息', color: '#5469BA' },
        { value: 0, name: '警告', color: '#81CE79'},
        { value: 0, name: '一般严重', color: '#FEC75E'},
        { value: 0, name: '严重', color: '#FE5C5E'},
        { value: 0, name: '灾难', color: '#5BC3DD'}
      ],
      // 类型
      devType: [
        { value: 0, name: '虚拟资源', color: '#5469BA' },
        { value: 0, name: '服务设备', color: '#81CE79'},
        { value: 0, name: '存储设备', color: '#FEC75E'},
        { value: 0, name: '网络设备', color: '#FE5C5E'},
        { value: 0, name: '操作系统', color: '#5BC3DD'},
        { value: 0, name: '数据库', color: '#319E71'},
        { value: 0, name: '中间件', color: '#FC8459'},
        { value: 0, name: '应用软件', color: '#AE80BF'}
      ],
      // 状态
      devSituation: [
        { value: 0, name: '待处理', color: '#5469BA' },
        { value: 0, name: '处理中', color: '#81CE79'},
        { value: 0, name: '已处理', color: '#FEC75E'},
        { value: 0, name: '自动恢复', color: '#FE5C5E'}
      ],
      exportLoading: false,
      fillerData: [],
      fillerList: [],
      mergeNum: 3, // 需合并的行数
      content: 4, // 第四行开始为内容
      exportFileName: '设备告警报表',
      base64: [], // echarts的base64
      rowHeight: [ // excel各行行高
        { num: 1, height: 70},
        { num: 2, height: 40},
        { num: 3, height: 350},
        { num: 4, height: 40}
      ],
      ExcelTitle: [
        {
          title: '故障名称',
          dataIndex: 'description',
          width: 80
        },
        {
          title: '级别',
          dataIndex: 'levelName',
          width: 10
        },
        {
          title: '设备',
          dataIndex: 'deviceName',
          width: 30
        },
        {
          title: 'IP',
          dataIndex: 'ip',
          width: 30
        },
        {
          title: '设备类型',
          dataIndex: 'devTypeId',
          width: 10
        },
        {
          title: '告警时间',
          dataIndex: 'clockValue',
          width: 30
        },
        {
          title: '状态',
          dataIndex: 'stateName',
          width: 10
        }
      ],
      // 显示控制数据 start
      checkList: ['级别', '故障名称', 'IP', '告警时间', '设备类型', '跟进时间', '处理状态'],
      lists: [],
      storageVal: 'failure-report' // 存入localStorageOperation的名字
      // 显示控制数据 end
    }
  },
  mounted() {
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
    this.findLevelData()
    this.loadMoreUser()
    this.loadItType()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 点击告警设备名称跳转到it监控设备详情
    async handlerToItMonitorDevice(row) {
      const { data } = await this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_sub_dev_type', limit: -1, ids: row.subdevTypeId }
      })
      this.$router.push({
        name: 'ResourceMonitorDetail',
        query: {
          id: row.hostId || 0,
          zbxHostId: row.zhostId,
          agent: row.agent,
          devTypeId: row.devTypeId,
          subType: data && data.length > 0 ? data[0].dictdataValue : '',
          hySubdevTypeId: row.subdevTypeId && row.subdevTypeId > 0 ? row.subdevTypeId : ''
        }
      })
    },
    confirm() {
      this.sendRequest()
    },
    showDataDialog() {
      this.showDialog = true
    },
    oneDay() {
      const callbackDayList = this.$tool.callbackDay(1) // 倒推天数
      this.listQuery.startCLock = (this.$tool.getTimeF(callbackDayList)) * 1000
      this.listQuery.endClock = Date.parse(new Date())
      console.log(this.listQuery.endClock)
    },
    threeDay() {
      const callbackDayList = this.$tool.callbackDay(3) // 倒推天数
      this.listQuery.startCLock = (this.$tool.getTimeF(callbackDayList[callbackDayList.length - 1])) * 1000
      this.listQuery.endClock = Date.parse(new Date())
    },
    oneWeek() {
      const callbackDayList = this.$tool.callbackDay(7) // 倒推天数
      this.listQuery.startCLock = (this.$tool.getTimeF(callbackDayList[callbackDayList.length - 1])) * 1000
      this.listQuery.endClock = Date.parse(new Date())
    },
    oneMonth() {
      const callbackDayList = this.$tool.callbackDay(30) // 倒推天数
      this.listQuery.startCLock = (this.$tool.getTimeF(callbackDayList[callbackDayList.length - 1])) * 1000
      this.listQuery.endClock = Date.parse(new Date())
    },
    // 获取设备类型
    loadItType() {
      this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.devTypeList = res.data
        }
      })
    },
    // echarts转base64
    createBase64(ele, num) {
      let baseCanvas = document.getElementById(ele).getElementsByTagName('canvas')[num]
      if (!baseCanvas) return false
      let width = baseCanvas.width
      let height = baseCanvas.height
      let ctx = baseCanvas.getContext('2d')
      ctx.drawImage(baseCanvas, 0, 0, width, height)
      let base64 = baseCanvas.toDataURL()
      return base64
    },
    // 导出echarts
    async alarmLogByAll(data) {
      // 1
      let obj = { '信息': 0, '警告': 0, '一般严重': 0, '严重': 0, '灾难': 0}
      for (let i = 0; i < data.length; i++) {
        switch (data[i].alevel) {
          case 1:
            obj['信息'] += 1
            break
          case 2:
            obj['警告'] += 1
            break
          case 3:
            obj['一般严重'] += 1
            break
          case 4:
            obj['严重'] += 1
            break
          case 5:
            obj['灾难'] += 1
            break
        }
      }
      console.log(obj)
      Object.entries(obj).forEach(resItem => {
        const idx = this.devStatus.findIndex(item => item.name === resItem[0])
        if (idx !== -1) {
          this.$set(this.devStatus[idx], 'value', resItem[1])
        }
      })
      await this.createEcharts('firstChart', this.devStatus)
      // 2
      let val = { '虚拟资源': 0, '服务设备': 0, '存储设备': 0, '网络设备': 0, '操作系统': 0, '数据库': 0, '中间件': 0, '应用软件': 0}
      for (let i = 0; i < data.length; i++) {
        switch (data[i].devTypeId) {
          case 478:
            val['虚拟资源'] += 1
            break
          case 479:
            val['服务设备'] += 1
            break
          case 477:
            val['存储设备'] += 1
            break
          case 481:
            val['网络设备'] += 1
            break
          case 484:
            val['操作系统'] += 1
            break
          case 483:
            val['数据库'] += 1
            break
          case 482:
            val['中间件'] += 1
            break
          case 480:
            val['应用软件'] += 1
            break
        }
      }
      console.log(val)
      Object.entries(val).forEach(resItem => {
        const idx = this.devType.findIndex(item => item.name === resItem[0])
        if (idx !== -1) {
          this.$set(this.devType[idx], 'value', resItem[1])
        }
      })
      await this.createEcharts('secondChart', this.devType)

      // 3
      let num = { '待处理': 0, '处理中': 0, '已处理': 0, '自动恢复': 0}
      for (let i = 0; i < data.length; i++) {
        switch (data[i].status) {
          case 0:
            num['待处理'] += 1
            break
          case 4:
            num['处理中'] += 1
            break
          case 1:
            num['已处理'] += 1
            break
          case 3:
            num['自动恢复'] += 1
            break
        }
      }
      console.log(num)
      Object.entries(num).forEach(resItem => {
        const idx = this.devSituation.findIndex(item => item.name === resItem[0])
        if (idx !== -1) {
          this.$set(this.devSituation[idx], 'value', resItem[1])
        }
      })
      await this.createEcharts('threeChart', this.devSituation)

      setTimeout(() => {
        let base1 = this.createBase64('firstChart', 0)
        let base2 = this.createBase64('secondChart', 0)
        let base3 = this.createBase64('threeChart', 0)
        this.base64 = [{ // 配置echarts图片和位置length
          base: base1,
          length: 0.9
        }, {
          base: base2,
          length: 1.5
        }, {
          base: base3,
          length: 5
        }]
        this.exportLoading = false
        this.showDialog = false
        this.fillerList = this.fillerData
        this.listQuery.startCLock = ''
        this.listQuery.endClock = ''
      }, 1000)
    },
    // echarts
    async createEcharts(data, val) {
      const self = this
      const opsChartsObj = echarts.init(self.$refs[data])
      const option = {
        color: ['#88cefd', '#268cf2', '#00b285', '#fe830c', '#f01920', '#5B9F71', '#37A274', '#FC8458', '#9B61B2'],
        graphic: {
          elements: []
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          bottom: '0%',
          left: 'center'
        },
        series: [
          {
            type: 'pie',
            radius: ['80%', '60%'],
            center: ['50%', '40%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 4,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: false,
                fontSize: '40',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: val
          }
        ]
      }
      opsChartsObj.setOption(option, true)
    },
    // 导出
    async sendRequest(val) {
      this.exportLoading = true
      const value = await this.getDataSource(this.listQuery.page, -1)
      console.log(value)
      await this.alarmLogByAll(value.data)
      value.data.forEach(item => {
        Object.keys(item).forEach(keys => {
          if (keys === 'devTypeId') {
            switch (item.devTypeId) {
              case 478:
                item.devTypeId = '虚拟资源'
                break
              case 479:
                item.devTypeId = '服务设备'
                break
              case 477:
                item.devTypeId = '存储设备'
                break
              case 481:
                item.devTypeId = '网络设备'
                break
              case 484:
                item.devTypeId = '操作系统'
                break
              case 483:
                item.devTypeId = '数据库'
                break
              case 482:
                item.devTypeId = '中间件'
                break
              case 480:
                item.devTypeId = '应用软件'
                break
            }
          }
        })
      })
      this.fillerData = value.data
      // this.search()
    },
    handleClick(val) {
      console.log(val)
      this.$set(this.listQuery, 'agents', val.agent.toString())
      this.generateStatement()
    },
    async generateStatement() {
      const findZbxAlarmLog = await this.getDataSource(this.listQuery.page, this.listQuery.limit)
      if (findZbxAlarmLog.code !== 1) return
      this.statement = findZbxAlarmLog.data
      this.listTotal = +findZbxAlarmLog.count
    },
    /**
     * @description 获取主表数据
     * @param page 页码
     * @param limit 条数，全部则传-1
     */
    async getDataSource(page, limit) {
      const listQuery = { ...this.listQuery }
      listQuery.startCLock = listQuery.startCLock > 0 ? listQuery.startCLock / 1000 : ''
      listQuery.endClock = listQuery.endClock > 0 ? listQuery.endClock / 1000 : ''
      if (limit === -1) {
        listQuery.page = 1
        listQuery.limit = -1
      } else {
        listQuery.page = page
        listQuery.limit = limit
      }
      const dataSourceData = await this.findZbxAlarmLog(listQuery)
      if (dataSourceData.code && dataSourceData.data && dataSourceData.data.length > 0) {
        return { ...dataSourceData, data: await this.setTypeDataByData(dataSourceData.data) }
      } else {
        return { ...dataSourceData}
      }
    },
    async setTypeDataByData(data) {
      const userIds = []
      const hostIds = []
      data.forEach(item => {
        if (item.userId) userIds.push(item.userId)
        if (item.hostId) hostIds.push(item.hostId)
      })
      const dealUsersData = await this.findSysUser({
        ids: this.$tool.uniqueArray(userIds).toString(),
        limit: -1,
        companyId: this.$auth.getUserSession().companyId
      })
      const host = await this.findHyitHost({
        agents: this.listQuery.agents,
        ids: this.$tool.uniqueArray(hostIds).toString(),
        limit: -1
      })
      data.forEach(item => {
        const dealUsersDataIndex = dealUsersData.findIndex(items => +items.userId === +item.userId)
        if (dealUsersDataIndex !== -1) item.dealUsers = `${dealUsersData[dealUsersDataIndex].realName} ${dealUsersData[dealUsersDataIndex].tel}`
        const levelIdx = this.levelData.findIndex(items => Number(items.dictdataValue) === Number(item.alevel) && items.dictdataValue !== '')
        if (levelIdx !== -1) {
          item.levelName = this.levelData[levelIdx].dictdataName
          item.levelStyle = this.levelData[levelIdx].style
        }
        const stateIdx = this.stateCatData.findIndex(items => items.value === item.status)
        if (stateIdx !== -1) {
          item.stateName = this.stateCatData[stateIdx].label
          item.stateStyle = this.stateCatData[stateIdx].color
        }
        if (item.rclock > 0) {
          if ((item.rclock - item.clock) <= 1800) {
            item.rclockValue = this.$tool.formatSeconds(item.rclock - item.clock)
          } else {
            item.rclockValue = this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', new Date(item.rclock * 1000))
          }
        } else {
          item.rclockValue = ''
        }
        if (item.clock) {
          const date = new Date(item.clock * 1000)
          item.clockValue = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds() > 10 ? date.getSeconds() : '0' + date.getSeconds()}`
        }
        const hostIndex = host.findIndex(items => +items.hyHostId === +item.hostId)
        if (hostIndex !== -1) {
          item.deviceName = host[hostIndex].hyMarkName
          item.ip = host[hostIndex].hyIp
        }
      })
      return data
    },
    async findZbxAlarmLog(query) {
      return await this.$request({
        url: this.api.itMonitor.findZbxAlarmLog,
        data: query
      })
    },
    async findLevelData() {
      const { code, data } = await this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'alarm_level', page: 1, limit: -1 }
      })
      if (code === 1) this.levelData = data
    },
    async findSysUser(query) {
      const { code, data } = await this.$request({
        url: this.api.sys.findSysUser,
        data: query
      })
      if (code !== 1) return
      return data
    },
    // 加载更多用户
    async loadMoreUser() {
      this.$set(this.findSysUserQuery, 'page', ++this.findSysUserQuery.page)
      const findSysUser = await this.findSysUser({...this.findSysUserQuery, companyId: getUserInfo().companyId})
      if (findSysUser) {
        this.sysUserList = [...this.sysUserList, ...findSysUser]
      }
    },
    search() {
      this.$set(this.listQuery, 'page', 1)
      this.generateStatement()
    },
    // 查询设备名称
    async findHyitHost(query) {
      const { code, data } = await this.$request({
        url: this.api.itMonitor.findHyitHost,
        data: query
      })
      if (code !== 1) return
      return data
    },
    // 导出
    async submitQuery(excelQuery) {
      const data = await this.getDataSource(excelQuery.page, excelQuery.limit)
      const excelTitle = [
        {
          title: '级别',
          dataIndex: 'levelName'
        },
        {
          title: '故障名称',
          dataIndex: 'description'
        },
        {
          title: '设备',
          dataIndex: 'deviceName'
        },
        {
          title: 'IP',
          dataIndex: 'ip'
        },
        {
          title: '处理人员',
          dataIndex: 'dealUsers'
        },
        {
          title: '告警时间',
          dataIndex: 'clockValue'
        },
        {
          title: '跟进时间',
          dataIndex: 'rclockValue'
        },
        {
          title: '处理状态',
          dataIndex: 'stateName'
        }
      ]
      this.$refs.outputExcel.output(excelTitle, data.data)
    }
  }
}
</script>

<style lang="scss" scoped>
.Echarts {
  border: 1px solid black;
  position: absolute;
  z-index: -1;
  top: -10000px;
}
.m-left {
  margin-left: 10px;
}

</style>
