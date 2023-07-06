<template>
  <div class="app-container">
    <div class="echarts">
      <div class="echarts-box">
        <div id="equipmentType" ref="equipmentType" style="height: 250px" />
      </div>
      <div class="echarts-box">
        <div id="alarmFrequency" ref="alarmFrequency" style="height: 250px" />
      </div>
      <div class="echarts-box">
        <div id="onlineStatus" ref="onlineStatus" style="height: 250px" />
      </div>
      <div class="echarts-box">
        <div id="regionalSummary" ref="regionalSummary" style="height: 250px" />
      </div>
    </div>
    <div class="tab-box">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane v-for="item in projectTab" :key="String(item.id)" :label="item.name" :name="String(item.id)" />
      </el-tabs>
    </div>

    <div v-permission="['Search']" class="filter-search">
      <el-input v-model="form.keyword" placeholder="请输入对象名称或IP" style="width: 200px;" class="filter-item" />
      <el-select v-model="form.status" placeholder="设备状态" clearable class="filter-item" style="width: 200px">
        <el-option v-for="item in statusOptions" :key="item.id" :label="item.value" :value="item.id" />
      </el-select>
      <el-button class="filter-item" type="primary" @click="initialFindHyitHost">查询</el-button>
      <OutputExcel ref="outputExcel" @submitQuery="submitQuery" />
      <el-dropdown :hide-on-click="false" class="filter-item screen">
        <i class="icon el-icon-s-operation" />
        <el-dropdown-menu slot="dropdown">
          <el-scrollbar style="height: 60vh">
            <el-checkbox-group v-model="filterItems">
              <el-dropdown-item v-for="(item,index) in checkList" :key="index"><el-checkbox :key="item" :label="item" />
              </el-dropdown-item>
            </el-checkbox-group>
          </el-scrollbar>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="table-wrapper">
      <el-table
        :data="statisticsData"
        default-expand-all
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="NO" prop="id" type="index" show-overflow-tooltip />
        <el-table-column v-if="lists[0].ispass" align="left" label="设备名称" width="270" show-overflow-tooltip>
          <template slot-scope="{row}">
            <el-link type="primary" @click="handlerToItMonitorDevice(row)">{{ row.hyMarkName }}</el-link>
            <div class="ip-val">{{ row.hyIp }}</div>
          </template>
        </el-table-column>
        <el-table-column v-if="lists[1].ispass" align="left" label="设备类型" show-overflow-tooltip>
          <template slot-scope="{row}">
            <span>{{ setLeaveType(row.hyDevTypeId) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists[2].ispass" align="right" label="运行时长" show-overflow-tooltip>
          <template slot="header" slot-scope="scope">
            {{ scope.column.label }}
            <span class="caret-wrapper">
              <i class="sort-caret ascending" @click="handlerSort('run_time',1)" />
              <i class="sort-caret descending" @click="handlerSort('run_time',2)" />
            </span>
          </template>
          <template slot-scope="{row}">
            {{ setTime(row.runTime) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists[3].ispass" align="right" prop="lastrRestart" label="最近一次重启时间" show-overflow-tooltip />
        <el-table-column v-if="lists[4].ispass" align="left" prop="description" label="最近一次故障" show-overflow-tooltip />
        <el-table-column v-if="lists[5].ispass" align="right" prop="" label="故障时间" show-overflow-tooltip />
        <el-table-column v-if="lists[6].ispass" align="right" label="故障累计次数" width="150" show-overflow-tooltip>
          <template slot="header" slot-scope="scope">
            {{ scope.column.label }}
            <span class="caret-wrapper">
              <i class="sort-caret ascending" @click="handlerSort('hy_alarm_count', 1)" />
              <i class="sort-caret descending" @click="handlerSort('hy_alarm_count', 2)" />
            </span>
          </template>
          <template slot-scope="{row}">
            {{ row.hyAlarmCount }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists[7].ispass" align="left" prop="hyRelation" label="管理人" show-overflow-tooltip />
        <el-table-column v-if="lists[8].ispass" align="left" label="所在区域" show-overflow-tooltip>
          <template slot-scope="{row}">
            <div>{{ setOrgName(row.hyOrgId) }}</div>
          </template>
        </el-table-column>
        <el-table-column v-if="lists[9].ispass" align="left" prop="hyAddr" label="所在位置" show-overflow-tooltip />

        <el-table-column v-if="lists[10].ispass" align="left" label="状态" prop="pingStatue" show-overflow-tooltip>
          <template slot-scope="{row}">
            <el-tag :type="setPingStatue('class', row.hyNetState)">
              {{ setPingStatue('text', row.hyNetState) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="total > 0" :auto-scroll="false" :total="total" :page.sync="form.page" :limit.sync="form.limit" @pagination="findHyitHost" />

  </div>
</template>

<script>
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import { formatTime } from '@/utils/screen-itms.js'
import OutputExcel from '@/components/outputExcel/index.vue'
import * as echarts from 'echarts'
// import { loading } from '@jiaminghi/data-view'
export default {
  name: '',
  components: {
    Pagination, OutputExcel
  },
  data() {
    return {
      statisticsData: [],
      agentIds: '',
      form: {
        page: 1,
        limit: 10,
        keyword: '',
        status: '',
        orderBy: 'hy_alarm_count', //  run_time ，hy_alarm_count
        agents: '',
        orderByDesc: '2' // 1升序 2降序
      },
      pingStatue: [
        { value: 1, label: '在线', class: 'success' },
        { value: 2, label: '异常', class: 'danger' },
        { value: 0, label: '离线', class: 'info' }
      ],
      total: 0,
      operationData: {},
      statusOptions: [
        {id: 0, value: '离线'},
        {id: 1, value: '在线'}
      ],
      allSubDevType: [],
      loading: false,
      devStatus: [
        { value: 0, name: '虚拟资源', color: '#5469BA', num: 478 },
        { value: 0, name: '服务设备', color: '#81CE79', num: 479},
        { value: 0, name: '存储设备', color: '#FEC75E', num: 477},
        { value: 0, name: '网络设备', color: '#FE5C5E', num: 481},
        { value: 0, name: '操作系统', color: '#5BC3DD', num: 484},
        { value: 0, name: '数据库', color: '#319E71', num: 483},
        { value: 0, name: '中间件', color: '#FC8459', num: 482},
        { value: 0, name: '应用软件', color: '#AE80BF', num: 480}
      ],
      onlineStatus: [
        { value: 0, name: '在线', color: '#5469BA' },
        { value: 0, name: '离线', color: '#81CE79'},
        { value: 0, name: '未知', color: '#81CE79'}
      ],
      alarmFrequency: [
        { value: 0, name: '10次以下', color: '#5469BA', val: 'hyAlarmCount10'},
        { value: 0, name: '10-20次', color: '#81CE79', val: 'hyAlarmCount20'},
        { value: 0, name: '20-30次', color: '#81CE79', val: 'hyAlarmCount30'},
        { value: 0, name: '30-50次', color: '#FE5C5E', val: 'hyAlarmCount50'},
        { value: 0, name: '50-100次', color: '#5BC3DD', val: 'hyAlarmCount100'},
        { value: 0, name: '100次以上', color: '#319E71', val: 'hyAlarmCount1000'}
      ],
      regionalSummary: [],
      devTypeList: [],
      projectTab: [],
      activeName: '',
      ideField: 'id', // 匹配的字段，用id
      filterItems: [],
      checkList: ['设备名称', '设备类型', '运行时长', '最近一次重启时间', '最近一次故障', '故障时间', '故障累计次数', '管理人', '所在区域', '所在位置', '状态'],
      lists: [
        {label: '设备名称', prop: 'hyMarkName', ispass: false},
        {label: '设备类型', prop: 'hyDevTypeId', ispass: false},
        {label: '运行时长', prop: 'runTime', ispass: false},
        {label: '最近一次重启时间', prop: 'lastrRestart', ispass: false},
        {label: '最近一次故障', prop: 'description', ispass: false},
        {label: '故障时间', prop: '', ispass: false},
        {label: '故障累计次数', prop: 'hyAlarmCount', ispass: false},
        {label: '管理人', prop: 'hyRelation', ispass: false},
        {label: '所在区域', prop: 'hyOrgId', ispass: false},
        {label: '所在位置', prop: 'hyAddr', ispass: false},
        {label: '状态', prop: 'pingStatue', ispass: false}
      ],
      orgList: []
    }
  },
  computed: {
    setPingStatue() {
      return function(valueType, val) {
        const idx = this.pingStatue.findIndex(item => item.value === val)
        if (idx === -1) return
        if (valueType === 'text') return this.pingStatue[idx].label
        if (valueType === 'class') return this.pingStatue[idx].class
      }
    },
    setLeaveType() {
      return function(devTypeId) {
        const idx = this.devTypeList.findIndex(item => item.id === devTypeId)
        return idx !== -1 ? this.devTypeList[idx].dictdataName : ''
      }
    },
    setTime() {
      return function(val) {
        return val ? this.$tool.sToYMD(Number(val)) : ''
      }
    },
    // 设置区域
    setOrgName() {
      return function(val) {
        // if (!this.orgList) return ''
        const orgIdx = this.orgList.findIndex(item => +item.hyAreaId === +val)
        if (orgIdx !== -1) {
          return this.orgList[orgIdx].hyAreaName
        }
      }
    }
  },
  watch: {
    filterItems(newVal) {
      if (newVal) {
        this.localStorageOperation('set', 'statistics', newVal)
        let arr = this.checkList.filter(i => newVal.indexOf(i) < 0) // 未选中
        this.lists.map(i => {
          if (arr.indexOf(i.label) !== -1) {
            i.ispass = false
          } else {
            i.ispass = true
          }
        })
      }
    }
  },
  async mounted() {
    this.agentIds = this.sessionStorageOperation('get', 'agentId')
    await this.loadOrgList()
    await this.findHyitAgentGroup()
    this.loadItType()
    this.getHyitHostRunTimeStatictics()
    this.getHyitHostTypeStatictics()
    this.getHyitHostAlarmCountStatictics()
    this.findHyitHostOrgStatistics()
  },
  methods: {
    // 点击告警设备名称跳转到it监控设备详情
    async handlerToItMonitorDevice(row) {
      console.log(row)
      const { data } = await this.$request({
        url: this.api.common.findSysDictionaryDetail,
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
    handleSelect(rows, row) {
      let selected = rows.length && rows.indexOf(row) !== -1
      if (!selected) {
        this.allSelection = this.allSelection.filter(
          (it) => it[this.ideField] !== row[this.ideField]
        )
      }
    },
    // 点击tab
    handleClick(val) {
      this.$set(this.form, 'agents', String(this.projectTab[+val.index].agent))
      this.findHyitHost()
    },
    async findHyitAgentGroup() {
      const findHyitAgentGroup = await this.$request({
        url: this.api.itAgentGroup.findHyitAgentGroup,
        data: { limit: -1 }
      })
      if (findHyitAgentGroup.code !== 1) return
      const groupIds = []
      findHyitAgentGroup.data.forEach(item => groupIds.push(item.id))

      const findHyitAgentGroupLink = await this.$request({
        url: this.api.itAgentGroup.findHyitAgentGroupLink,
        data: { limit: -1, groupIds }
      })

      if (findHyitAgentGroupLink.code === 1) {
        findHyitAgentGroupLink.data.forEach(item => {
          const idx = findHyitAgentGroup.data.findIndex(items => +items.id === +item.groupId)
          if (idx !== -1) {
            if (findHyitAgentGroup.data[idx].agent) {
              findHyitAgentGroup.data[idx].agent.push(item.agentId)
            } else {
              findHyitAgentGroup.data[idx].agent = [item.agentId]
            }
          }
        })
      }

      this.projectTab = findHyitAgentGroup.data
      this.activeName = String(findHyitAgentGroup.data[0].id)
      this.activeProjectAgent = String(findHyitAgentGroup.data[0].agent)
      this.$set(this.form, 'agents', this.activeProjectAgent.toString())
      this.findHyitHost()
    },
    // 随机生成十六进制颜色
    randomHexColor() {
      var hex = Math.floor(Math.random() * 16777216).toString(16)
      // 生成ffffff以内16进制数
      while (hex.length < 6) {
        // while循环判断hex位数，少于6位前面加0凑够6位
        hex = '0' + hex
      }
      return '#' + hex // 返回‘#'开头16进制颜色
    },
    async getHyitHostRunTimeStatictics() {
      const res = await this.$request({
        url: api.itMonitor.getHyitHostRunTimeStatictics
      })
      if (res.code !== 1) return
      if (this.$tool.isJSONString(res.model)) {
        this.operationData = JSON.parse(res.model)
      } else {
        this.operationData = res.model
      }
    },
    // 导出
    async submitQuery(excelQuery) {
      const data = await this.exportFindHyitHost(excelQuery)
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
          title: '设备类型',
          dataIndex: 'hyDevTypeName'
        },
        {
          title: '运行时长',
          dataIndex: 'runTime'
        },

        {
          title: '最后一次重启时间',
          dataIndex: 'lastrRestart'
        },
        {
          title: '最后一次故障',
          dataIndex: 'description'
        },
        {
          title: '故障次数',
          dataIndex: 'hyAlarmCount'
        },
        {
          title: '管理人',
          dataIndex: 'hyRelation'
        },
        {
          title: '所在区域',
          dataIndex: 'hyRegion'
        },
        {
          title: '所在位置',
          dataIndex: 'hyAddr'
        },
        {
          title: '状态',
          dataIndex: 'hyNetState'
        }
      ]
      this.$refs.outputExcel.output(excelTitle, data)
    },
    // 获取区域列表
    async loadAllOrgList() {
      const res = await this.$request({ url: this.api.area.findHyitArea, data: { pid: 10, limit: -1 }})
      if (res.code !== 1) return
      return res.data
    },
    // 导出的数据
    async exportFindHyitHost(val) {
      this.loading = true

      const data = { ...this.form }
      const res = await this.$request({
        url: api.itMonitor.findHyitHost,
        data: { ...data, page: 1, limit: val.limit }
      })
      if (res.code !== 1) return
      const ATime = Date.parse(new Date()) / 1000
      const ids = []
      res.data.forEach(item => {
        ids.push(item.hyHostId)
      })
      const hostData = await this.getLastAlarmLogByHost(ids.toString())
      const resData = await this.loadAllOrgList()
      // 获取区域列表
      this.$request({ url: this.api.area.findHyitArea, data: { pid: 10, limit: -1 }})
        .then(res => {
          if (res.code === 1) {
            this.orgList = res.data
          }
        })
      res.data.forEach(item => {
        this.devTypeList.forEach(val => {
          if (+val.id === +item.hyDevTypeId) {
            item.hyDevTypeName = val.dictdataName
          }
        })
        Object.keys(item).forEach(keys => {
          if (keys === 'runTime') {
            if (item.runTime) {
              const bTime = ATime - item.runTime
              const cTime = new Date(bTime * 1000)
              item.lastrRestart = formatTime(cTime, 'yyyy-MM-dd HH:mm:ss')
              item.runTime = this.$tool.sToYMD(Number(item.runTime))
            }
          }
          hostData.forEach(val => {
            if (+val.hostId === +item.hyHostId) {
              item.description = val.description
            }
          })

          resData.forEach(data => {
            if (+data.hyAreaId === +item.hyOrgId) {
              item.hyRegion = data.hyAreaName
            }
          })
          if (keys === 'hyNetState') {
            switch (item.hyNetState) {
              case 0:
                item.hyNetState = '离线'
                break
              case 1:
                item.hyNetState = '在线'
                break
            }
          }
        })
      })
      this.loading = false
      return res.data
    },
    // 第一、三个图
    async getHyitHostTypeStatictics() {
      const res = await this.$request({ url: this.api.itMonitor.getHyitHostTypeStatictics, data: { agents: this.agentIds }})
      if (res.code !== 1) return
      let online = null
      let offline = null
      res.data.forEach(resItem => {
        const idx = this.devStatus.findIndex(item => +item.num === +resItem.devType)
        if (idx !== -1) {
          this.$set(this.devStatus[idx], 'value', resItem.count)
        }
        online += resItem.online
        offline += resItem.offline
      })
      this.$set(this.onlineStatus[0], 'value', online)
      this.$set(this.onlineStatus[1], 'value', offline)
      this.createEcharts()
      this.createLineEcharts()
    },

    createEcharts() {
      const self = this
      const opsChartsObj = echarts.init(self.$refs['equipmentType'])
      const option = {
        color: ['#5469BA', '#81CE79', '#FEC75E', '#FE5C5E', '#5BC3DD', '#5B9F71'],
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
            data: self.devStatus
          }
        ]
      }
      opsChartsObj.setOption(option, true)
    },
    createLineEcharts() {
      const self = this
      const opsChartsObj = echarts.init(self.$refs['onlineStatus'])
      const option = {
        color: ['#5469BA', '#81CE79', '#FEC75E', '#FE5C5E', '#5BC3DD', '#5B9F71'],
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
            data: self.onlineStatus
          }
        ]
      }
      opsChartsObj.setOption(option, true)
    },
    // 第二个图
    async getHyitHostAlarmCountStatictics() {
      const res = await this.$request({ url: this.api.itMonitor.getHyitHostAlarmCountStatictics, data: { agents: this.agentIds }})
      if (res.code !== 1) return
      const data = (JSON.parse(res.model))[0]
      const val = Object.entries(data)
      val.forEach(resItem => {
        const idx = this.alarmFrequency.findIndex(item => item.val === resItem[0])
        if (idx !== -1) {
          this.$set(this.alarmFrequency[idx], 'value', resItem[1])
        }
      })
      this.createAlarmEcharts()
    },
    createAlarmEcharts() {
      const self = this
      const opsChartsObj = echarts.init(self.$refs['alarmFrequency'])
      const option = {
        color: ['#5469BA', '#81CE79', '#FEC75E'],
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
            data: self.alarmFrequency
          }
        ]
      }
      opsChartsObj.setOption(option, true)
    },
    // 第四个图
    async findHyitHostOrgStatistics() {
      const res = await this.$request({ url: this.api.flowMonitor.findHyitHostOrgStatistics, data: { agents: this.agentIds }})
      if (res.code !== 1) return
      const model = JSON.parse(res.model)
      model.forEach((item, index) => {
        const data = {}
        data.value = item.orgCount
        data.name = item.hyAreaName
        data.color = this.randomHexColor()
        this.regionalSummary.push(data)
      })
      const color = []
      this.regionalSummary.forEach(val => {
        color.push(val.color)
      })
      this.createRegionalEcharts(color)
    },
    createRegionalEcharts(color) {
      const self = this
      const opsChartsObj = echarts.init(self.$refs['regionalSummary'])
      const option = {
        color: color,
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
            data: self.regionalSummary
          }
        ]
      }
      opsChartsObj.setOption(option, true)
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
    initialFindHyitHost() {
      this.form.orderBy = 'hy_alarm_count'
      this.form.orderByDesc = '2'
      this.findHyitHost()
    },
    findHyitHost(val) {
      this.$request({
        url: api.itMonitor.findHyitHost,
        data: {...this.form, ...val }
      }).then(async (res) => {
        if (res.code === 1) {
          const ATime = Date.parse(new Date()) / 1000
          res.data.forEach(itemDate => {
            if (itemDate.runTime) {
              const bTime = ATime - itemDate.runTime
              const cTime = new Date(bTime * 1000)
              this.$set(itemDate, 'lastrRestart', formatTime(cTime, 'yyyy-MM-dd HH:mm:ss'))
            }
          })
          const ids = []
          res.data.forEach(item => {
            ids.push(item.hyHostId)
          })
          const hostData = await this.getLastAlarmLogByHost(ids.toString())
          hostData.forEach(val => {
            res.data.forEach(data => {
              if (+val.hostId === +data.hyHostId) {
                data.description = val.description
              }
            })
          })
          this.statisticsData = res.data
          this.total = Number(res.count)

          // 获取保存的显示配置
          const itemsData = this.localStorageOperation('get', 'statistics')
          // 初次进入默认访问以下十个字段
          itemsData ? this.filterItems = itemsData : this.filterItems = ['设备名称', '设备类型', '运行时长', '最近一次重启时间', '最近一次故障', '故障时间', '故障累计次数', '管理人', '所在区域', '所在位置', '状态']
        }
      })
    },
    // 获取区域列表
    loadOrgList() {
      this.$request({ url: this.api.area.findHyitArea, data: { pid: 10 }})
        .then(res => {
          if (res.code === 1) {
            this.orgList = res.data
          }
        })
    },
    async getLastAlarmLogByHost(ids) {
      const res = await this.$request({
        url: api.itMonitor.getLastAlarmLogByHost,
        data: { hostIds: ids }
      })
      if (res.code !== 1) return
      return res.data
    },
    handlerSort(name, val) {
      this.form.orderBy = name
      this.form.orderByDesc = val
      this.findHyitHost({orderBy: name, orderByDesc: val})
    }
  }
}
</script>

<style lang="scss" scoped>
.echarts {
  display: flex;
  .echarts-box {
    flex: 1;
  }
}
.ip-val {
  font-size: 10px;
  color: rgb(149,149,149);
}
.tab-box {
  margin-top: 20px;
}
.filter-search {
    margin-bottom: 10px;
    .filter-item {
        margin-right: 10px;
    }
}
.screen {
        float: right;
        .icon {
            border: 2px solid gray;
            font-size:25px;
        }
    }
</style>

