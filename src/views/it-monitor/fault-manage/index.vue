<template>
  <div class="app-container">
    <div class="fault-echarts">
      <div ref="columnar" class="columnar" style="height: 240px; margin-bottom:20px" />
    </div>
    <div class="fault-table">
      <div v-permission="['Search']" class="filter-container">
        <div class="filter-container-left">
          <el-input v-model="findZbxAlarmLogQuery.keyword" placeholder="请输入IP" style="width: 200px;" class="filter-item" clearable />
          <el-date-picker v-model="findZbxAlarmLogQuery.startCLock" class="filter-item" type="datetime" placeholder="开始时间" value-format="timestamp" style="width: 200px;" />
          <el-date-picker v-model="findZbxAlarmLogQuery.endClock" class="filter-item" type="datetime" placeholder="结束时间" value-format="timestamp" style="width: 200px;" />
          <el-select v-model="findZbxAlarmLogQuery.status" v-permission="['Search']" placeholder="告警状态" clearable class="filter-item" style="width: 200px">
            <el-option v-for="item in stateCatData" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
          <el-dropdown v-permission="['BatchAction']" class="filter-item" @command="handleCommand">
            <el-button type="primary">批量操作<i class="el-icon-arrow-down el-icon--right" /></el-button>
            <el-dropdown-menu slot="dropdown" v-permission="['BatchClose']">
              <el-dropdown-item command="batchClose" style="btn_close_alarm">关闭</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-tag v-for="(item,index) in levelData" :key="index" v-loading="tagLoading" class="filter-item" :class="item.isActive ? 'active' : ''" :color="judgmentColor(item.level) ? item.color : 'gray'" effect="dark" @click="handleCatLevelClick(item)">{{ item.name }}</el-tag>
          <el-button class="filter-item">最新数据 {{ $tool.formatSeconds(latestData) }}</el-button>
        </div>
        <div class="filter-container-right">
          <ListControl :check-list="checkList" @setLists="setLists" />
          <el-button class="filter-item" :type="findZbxAlarmLogQuery.userId ? 'primary' : 'default'" @click="handlerSelectCurrentUserDealAlarm">我的</el-button>
        </div>
      </div>
      <div v-loading="loading" class="table-wrapper">
        <el-table
          ref="table"
          style="width: 100%"
          :data="alarm_data"
          fit
          highlight-current-row
          row-class-name="row-expand-cover"
          @selection-change="selectionListChange"
          @header-dragend="colChange"
        >
          <el-table-column type="selection" width="45" />
          <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="级别" align="left" :width="setWidth('级别')" show-overflow-tooltip>
            <template slot-scope="{row}">
              <el-tag effect="dark" :color="setLevelTagColor(row.alevel)">{{ setLevelTagName(row.alevel) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="标题" align="left" :width="setWidth('标题')" show-overflow-tooltip>
            <template slot-scope="{row}">
              <div class="description-item">
                <span class="alarn-description overflow-text-a">{{ row.description }}</span>
                <span v-if="row.sameTypeCount && row.sameTypeCount > 0" class="num" @click="opeAlarmSummary(row)">
                  <a>{{ row.sameTypeCount }}</a>
                </span>
              </div>
            </template>
          </el-table-column>

          <el-table-column type="expand" prop="id" width="1">
            <template slot-scope="props">
              <el-table
                v-table-scroll="scrollBottom"
                :data="props.row.children"
                fit
                highlight-current-row
                style="width: 100%"
                max-height="250"
                :show-header="false"
                class="task-log-table"
              >
                <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="级别" align="left" :width="setWidth('级别')" show-overflow-tooltip>
                  <template slot-scope="{row}">
                    <el-tag effect="dark" :color="setLevelTagColor(row.alevel)">{{ setLevelTagName(row.alevel) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="标题" align="left" :width="setWidth('标题')" show-overflow-tooltip>
                  <template slot-scope="{row}">
                    <span>{{ row.description }}</span>
                  </template>
                </el-table-column>
                <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="设备名称" align="left" :width="setWidth('设备名称')" show-overflow-tooltip>
                  <template slot-scope="{row}">
                    <el-link type="primary" @click="handlerToItMonitorDevice(row)">{{ row.hyMarkName }}</el-link>
                  </template>
                </el-table-column>
                <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="IP" align="left" :width="setWidth('IP')" prop="ip" show-overflow-tooltip />
                <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="类型" align="left" :width="setWidth('类型')" show-overflow-tooltip>
                  <template slot-scope="{row}">
                    <span>{{ setLeaveType(row.devTypeId) }}</span>
                  </template>
                </el-table-column>

                <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="right" label="故障时间" :width="setWidth('故障时间')" show-overflow-tooltip>
                  <template slot-scope="{row}">
                    <span>{{ setFormatMsgTime(row.clock) }}</span>

                  </template>
                </el-table-column>
                <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" label="跟进时间" :width="setWidth('跟进时间')" align="right" show-overflow-tooltip>
                  <template slot-scope="{row}">
                    <span>{{ setRCTime(row.clock, row.rclock) }}</span>
                  </template>
                </el-table-column>
                <el-table-column v-if="lists.length > 0 ? lists[7].ispass : true" label="推送状态" :width="setWidth('推送状态')" align="left" show-overflow-tooltip>
                  <template slot-scope="{row}">
                    <span :style="{ color: setPushMsgColor(row.pushMsg) }">{{ setPushMsg(row.pushMsg) }}</span>
                  </template>
                </el-table-column>
                <el-table-column v-if="lists.length > 0 ? lists[8].ispass : true" label="处理人" :width="setWidth('处理人')" align="left" show-overflow-tooltip>
                  <template slot-scope="{row}">
                    <span>{{ setUser(row.userId) }}</span>
                  </template>
                </el-table-column>
                <el-table-column v-if="lists.length > 0 ? lists[9].ispass : true" label="状态" align="left" :width="setWidth('状态')" show-overflow-tooltip>
                  <template slot-scope="{row}">
                    <span :style="{ color: setAlarmStatusColor(row.status) }">{{ setAlarmStatus(row.status) }}</span>
                  </template>
                </el-table-column>
                <el-table-column v-if="lists.length > 0 ? lists[10].ispass : true" label="操作" align="left" class-name="small-padding fixed-width">
                  <template slot-scope="{row}">
                    <el-button v-permission="['Get']" type="primary" size="mini" @click="handleCheck(row)">查看</el-button>
                    <!-- <el-button v-permission="['Close']" type="primary" size="mini" @click="handleClose(row)">关闭</el-button> -->
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>

          <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="设备名称" :width="setWidth('设备名称')" align="left" show-overflow-tooltip>
            <template slot-scope="{row}">
              <el-link type="primary" @click="handlerToItMonitorDevice(row)">{{ row.hyMarkName }}</el-link>
            </template>
          </el-table-column>

          <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="IP" align="left" :width="setWidth('IP')" prop="ip" show-overflow-tooltip />
          <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="类型" align="left" :width="setWidth('类型')" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span>{{ setLeaveType(row.devTypeId) }}</span>
            </template>
          </el-table-column>

          <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" label="故障时间" align="right" :width="setWidth('故障时间')" show-overflow-tooltip>
            <template slot="header" slot-scope="scope">
              {{ scope.column.label }}
              <span class="caret-wrapper">
                <i class="sort-caret ascending" @click="handlerSort('clock',1)" />
                <i class="sort-caret descending" @click="handlerSort('clock',2)" />
              </span>
            </template>

            <template slot-scope="{row}">
              <span>{{ setFormatMsgTime(row.clock) }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" label="跟进时间" :width="setWidth('跟进时间')" align="right" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span>{{ setRCTime(row.clock, row.rclock) }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[7].ispass : true" label="推送状态" :width="setWidth('推送状态')" align="left" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span :style="{ color: setPushMsgColor(row.pushMsg) }">{{ setPushMsg(row.pushMsg) }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[8].ispass : true" label="处理人" :width="setWidth('处理人')" align="left" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span>{{ setUser(row.userId) }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[9].ispass : true" label="状态" :width="setWidth('状态')" align="left" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span :style="{ color: setAlarmStatusColor(row.status) }">{{ setAlarmStatus(row.status) }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[10].ispass : true" label="操作" align="left" :width="setWidth('操作')" class-name="small-padding fixed-width">
            <template slot-scope="{row}">
              <el-button v-permission="['Get']" class="marginR" type="primary" size="mini" @click="handleCheck(row)">查看</el-button>
              <!-- <el-button v-permission="['Close']" type="primary" size="mini" @click="handleClose(row)">关闭</el-button> -->
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="alarmLogTotal>0"
          :total="alarmLogTotal"
          :page.sync="findZbxAlarmLogQuery.page"
          :limit.sync="findZbxAlarmLogQuery.limit"
          :auto-scroll="false"
          @pagination="findAssetsAlarm"
        />
      </div>
    </div>
    <el-dialog title="填写关闭告警备注" :visible.sync="showDialog" width="40%" top="5vh">
      <el-form ref="form" label-width="110px">
        <el-form-item label="备注">
          <el-input v-model.trim="closeAlarmLogBackup" placeholder="备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="confirmCloseDialog">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="故障详情" :visible.sync="drawer" width="80%" top="5vh">
      <FaultDetails v-if="drawer" :model="model" :level-data="levelData" :login-user="loginUser" @emitFindAssetsAlarm="emitFindAssetsAlarm" />
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import * as echarts from 'echarts'
import { callbackDay, dateFormat, formatNumber } from '@/utils/utils'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import FaultDetails from '@/views/it-monitor/fault-manage/components/faultDetails'
import ListControl from '@/components/ListControl'

export default {
  name: 'FaultIndex',
  components: {
    Pagination, FaultDetails, ListControl
  },
  data() {
    return {
      copyData: '复制的数据',
      agentsIds: '',
      show: false,
      drawer: false,
      model: { color: null, alarmLevelCatName: null, deviceName: null, alarmDesc: null },
      modelData: {
        alarmType: null,
        coverage: '',
        causeDescription: '',
        progress: ''
      },
      TypeCountList: {
        endClock: null,
        alarmIds: ''
      },
      date_data: [], severityCatId: null, influenceCatId: null, exigencyCatId: null,
      alarmTypeData: [],
      colorData: [],
      countAlarmLevelData: [],
      sData: {},
      series_data: [],
      startDate: null,
      endDate: null,
      catData: {},
      levelCatData: {},
      levelColorData: {},
      faultType: [],
      getProblemID: [],
      stateCatData: [
        { label: '待处理', value: 0, color: 'red' },
        { label: '已处理', value: 1, color: 'green' },
        { label: '自动恢复', value: 3, color: 'grey' },
        { label: '处理中', value: 4, color: 'grey' }
      ],
      isMore: true,
      alarm_data: [],
      tmp_date: null,
      levelData: [],
      level: '',
      alarmLevelCatId: 0,
      alarmTypeCatId: null,
      listQuery: {},
      loading: false,
      listLoading: false,
      page: 1,
      limit: 10,
      keyword: null,
      pageSize: [10, 20, 30, 40, 50],
      total: 0,
      callbackDays: [],
      zbxAlarmLogStaticticsData: [],
      startCLock: '',
      endClock: '',
      status: '',
      selectionListChangeValue: '',

      degreesTypes: [
        { value: 3, label: '高', class: 'danger' },
        { value: 2, label: '中', class: 'warning' },
        { value: 1, label: '低', class: 'success' }
      ],
      widthDictionary: [
        {value: '级别', width: '100'},
        {value: '标题', width: '350'},
        {value: '设备名称', width: 'auto'},
        {value: 'IP', width: '120'},
        {value: '类型', width: '100'},
        {value: '故障时间', width: 'auto'},
        {value: '跟进时间', width: 'auto'},
        {value: '推送状态', width: '90'},
        {value: '处理人', width: 'auto'},
        {value: '状态', width: '100'},
        {value: '操作', width: '100'}
      ],
      loginUser: {},
      closeAlarmLogBackup: '',
      showDialog: false,
      closeType: 'batch',
      devTypeList: [], // 设备类型
      timer: null, // 定时器
      requestTime: 300000, // 刷新时间
      latestData: 0, // 最新数据倒计时
      findZbxAlarmLogQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        level: '',
        levels: '',
        status: '',
        startCLock: '',
        endClock: '',
        sameType: 0,
        userId: '',
        orderBy: '',
        desc: null
      },
      alarmLogTotal: 0,
      childData: [],
      showList: false,
      count: 10,
      flag: true,
      getName: [],
      rowData: '',
      esightAlarm: [],
      startTime: '',
      endTime: '',
      showAll: '',
      sameFault: [],
      userList: [],
      tagLoading: false,
      // 显示控制的列表名称
      checkList: ['级别', '标题', '设备名称', 'IP', '类型', '故障时间', '跟进时间', '推送状态', '处理人', '状态', '操作'],
      lists: []
    }
  },
  computed: {
    setLeaveType() {
      return function(devTypeId) {
        const idx = this.devTypeList.findIndex(item => item.id === devTypeId)
        return idx !== -1 ? this.devTypeList[idx].dictdataName : ''
      }
    },
    setFormatMsgTime() {
      return function(t) {
        const date = new Date(t * 1000)
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds() > 10 ? date.getSeconds() : '0' + date.getSeconds()}`
      }
    },
    setLevelTagColor() {
      const that = this
      return function(level) {
        if (level === undefined) return
        const levelIdx = that.levelData.findIndex(item => Number(item.level) === Number(level) && item.level !== '')
        if (levelIdx !== -1) {
          return that.levelData[levelIdx].color
        }
      }
    },
    setLevelTagName() {
      const that = this
      return function(level) {
        if (level === undefined) return
        const levelIdx = that.levelData.findIndex(item => Number(item.level) === Number(level) && item.level !== '')
        if (levelIdx !== -1) {
          return that.levelData[levelIdx].name
        }
      }
    },
    setAlarmType() {
      return function() {
        return ''
      }
    },
    setAlarmStatusColor() {
      const that = this
      return function(level) {
        const levelIdx = that.stateCatData.findIndex(item => item.value === level)
        if (levelIdx !== -1) {
          return that.stateCatData[levelIdx].color
        }
      }
    },
    setPushMsgColor() {
      return function(val) {
        return val === 1 ? '#3CA170' : '#EB4C4C'
      }
    },
    setUser() {
      return function(val) {
        const ids = this.userList.findIndex(item => +item.userId === +val)
        if (ids !== -1) {
          return this.userList[ids].realName
        }
      }
    },
    setAlarmStatus() {
      const that = this
      return function(level) {
        const levelIdx = that.stateCatData.findIndex(item => item.value === level)
        if (levelIdx !== -1) {
          return that.stateCatData[levelIdx].label
        }
      }
    },
    setRCTime() {
      return function(clock, rclock) {
        if (rclock > 0) {
          if ((rclock - clock) <= 1800) {
            return this.$tool.formatSeconds(rclock - clock)
          } else {
            return this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', new Date(rclock * 1000))
          }
        } else {
          return ''
        }
      }
    },
    setPushMsg() {
      return function(val) {
        return val === 1 ? '已推送' : '未推送'
      }
    },
    judgmentColor() {
      return function(val) {
        const ids = this.findZbxAlarmLogQuery.levels.findIndex(item => item === val)
        if (ids !== -1) {
          return true
        } else {
          return false
        }
      }
    },
    setWidth() {
      return function(val) {
        const ids = this.widthDictionary.findIndex(item => item.value === val)
        if (ids !== -1) {
          return this.widthDictionary[ids].width
        }
      }
    }
  },

  mounted() {
    // 设置列表宽度
    const widthData = this.localStorageOperation('get', 'widthList')
    if (widthData) {
      this.widthDictionary = widthData
    }
    this.findSysUser()
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
    this.loadItType() // 加载设备类型
    this.loginUser = this.localStorageOperation('get', 'userInfo')
    // 获取当月天数 curretMonthDayCount 最后一天时间戳 time
    const time = new Date(this.getLastDay()).valueOf()
    let today = new Date()
    let curretMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    let curretMonthDayCount = curretMonth.getDate()
    this.callbackDays = (callbackDay(curretMonthDayCount, time)).reverse()
    // 计算近31天日期
    var date = new Date()
    this.endDate = dateFormat('YYYY-mm-dd', date)
    this.startDate = dateFormat('YYYY-mm-dd', new Date(date.setDate(date.getDate() - 30)))
    date = new Date()
    const nd = date.valueOf()
    for (var i = 31; i >= 0; i--) {
      var new_date = nd - i * 24 * 60 * 60 * 1000
      var newDate = new Date(new_date)
      var year = newDate.getFullYear()
      var month = newDate.getMonth() + 1
      var day = newDate.getDate()
      this.date_data.push([year, month, day].map(formatNumber).join('-'))
    }
    this.loadAlarmType()
    this.setlatestData = setInterval(() => { // 倒计时时间
      this.latestData--
    }, 1000)
    this.timer = setInterval(() => {
      this.$nextTick(() => {
        this.getZbxAlarmLogStatictics()
      })
      this.findAssetsAlarm()
    }, this.requestTime)
  },
  destroyed() {
    clearInterval(this.timer)
    clearInterval(this.setlatestData)
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 缓存列表宽度
    colChange(newWidth, oldWidth, column, event) {
      console.log(newWidth, oldWidth, column, event)
      // 将新的列宽度替换原来的列宽度
      let newWidthDictionary = this.widthDictionary.map(item => {
        if (item.value === column.label) {
          item.width = newWidth.toFixed(0)
        }
        return item
      })
      // 存到浏览器缓存
      this.localStorageOperation('set', 'widthList', newWidthDictionary)
    },
    inBox(item) {
      this.showAll = item.id
    },
    getLastDay() {
      var y = new Date().getFullYear() // 获取年份
      var m = new Date().getMonth() + 1 // 获取月份
      var d = new Date(y, m, 0).getDate() // 获取当月最后一日
      m = m < 10 ? '0' + m : m // 月份补 0
      d = d < 10 ? '0' + d : d // 日数补 0

      return [y, m, d].join('-')
    },
    scrollBottom(statue) {
      if (this.flag) {
        setTimeout(() => {
          if (!statue) {
            this.count = this.count + 10
            this.steChildrenData(this.rowData)
            this.flag = true
          }
        }, 1000)
      }
      this.flag = false
    },
    // 告警类型
    loadAlarmType() {
      request({
        url: '/admin/find-alarm_type-SysCat', data: { limit: -1 }
      }).then(res => {
        this.alarmTypeData = res.data
        this.loadAlarmLevel()
      })
    },
    // 故障等级
    loadAlarmLevel() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'alarm_level', page: 1, limit: -1 }
      }).then(res => {
        // this.levelData.push({ name: '全部', color: '#409eff', level: '' })
        const levelData = []
        res.data.forEach(item => {
          levelData.push(item.dictdataValue)
          this.catData[item.catId] = item.dictdataName
          this.levelCatData[item.catId] = item.dictdataValue
          this.levelColorData[item.catId] = item.remark
          this.levelData.push({ name: item.dictdataName, level: item.dictdataValue, catId: item.id, color: item.remark, isActive: false })
          this.colorData.push(item.remark)
          const f_data = []
          this.callbackDays.forEach(item2 => {
            f_data.push({ date: item2, value: 0 })
          })
          this.$nextTick(() => {
            this.zbxAlarmLogStaticticsData.push({ dictdataValue: item.dictdataValue, name: item.dictdataName, type: 'bar', stack: '总量', barWidth: '20px', fdata: f_data, data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] })
          })
        })
        const levelsData = this.localStorageOperation('get', 'levelsList')
        levelsData ? this.$set(this.findZbxAlarmLogQuery, 'levels', levelsData) : this.$set(this.findZbxAlarmLogQuery, 'levels', levelData)
        this.$nextTick(() => {
          this.getZbxAlarmLogStatictics()
        })
        this.findAssetsAlarm()
      })
    },
    // 选择告警级别选项
    handleCatLevelClick(item) {
      if (!this.tagLoading) {
        this.tagLoading = true
        const levelsList = this.findZbxAlarmLogQuery.levels
        const levelNum = this.findZbxAlarmLogQuery.levels.findIndex(levelsItem => +levelsItem === +item.level)
        if (levelNum === -1) {
          levelsList.push(item.level)
        } else {
          levelsList.splice(levelNum, 1)
        }
        this.$set(this.findZbxAlarmLogQuery, 'levels', levelsList)
        this.localStorageOperation('set', 'levelsList', levelsList)
        this.findAssetsAlarm()
      }
    },
    // 查看告警弹窗
    async handleCheck(data) {
      this.sameFault = []
      this.drawer = true
      this.model = { ...data }
    },
    // 关闭弹窗
    emitFindAssetsAlarm() {
      this.drawer = false
      this.findAssetsAlarm()
    },
    // 查询请假日志
    async findNewOaApproveLog(approveIds) {
      const { code, data } = await request({
        url: api.approveLog.findNewOaApproveLog,
        data: { approveIds, approveType: this.$defineData.projectActivityProcessDefine('matter', 'key', 'id'), page: 1, limit: -1 }
      })
      if (code !== 1) return
      return data
    },
    // 点击关闭告警
    handleClose(item) {
      this.closeType = 'this'
      this.$confirm('确认关闭当前告警吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(
        () => {
          this.confirmCloseDialog()
        }
      )
    },
    handleGrayClose() {
      this.$message('事项流程未结束，无法关闭告警')
    },
    handleGrayConfirmClose() {
      this.$message('告警处理中，无法确认告警')
    },
    // 加载告警级别
    loadCountAlarmLevel() {
      const that = this
      request({
        url: '/admin/alarmLevelSummarizing', data: { classify: 'it', startDate: this.startDate, endDate: this.endDate }
      }).then(res => {
        res.data.forEach(item => {
          // eslint-disable-next-line no-eval
          if (that.sData[eval(item.catId)]) {
            // eslint-disable-next-line no-eval
            that.sData[eval(item.catId)].fdata.forEach(item2 => {
              if (item.date === item2.date) {
                item2.value = parseInt(item.count)
              }
            })
          }
        })
        that.levelData.forEach(item => {
          // eslint-disable-next-line no-eval
          const s_data = that.sData[eval(item.catId)]
          const _data = []
          s_data.fdata.forEach(item2 => {
            _data.push(item2.value)
          })
          s_data.data = _data
          that.series_data.push(s_data)
        })
        that.initmyChart()
      })
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
    // 查询人员信息
    findSysUser() {
      request({
        url: api.sys.findSysUser,
        data: { limit: -1, companyId: this.$auth.getUserSession().companyId }
      }).then(res => {
        if (res.code === 1) {
          this.userList = res.data
          console.log(this.userList)
        }
      })
    },
    // 初始化echart
    initmyChart: function() {
      const self = this
      const myChart = echarts.init(self.$refs['columnar'])
      myChart.getZr().off('click') // 不加上这个点击事件会出现点击事件出现多次
      const option = {
        backgroundColor: '#f9f9f9',
        color: this.colorData,
        legend: {
          data: this.levelData,
          right: 'center',
          top: '2%',
          textStyle: {
            color: '#666F'
          }
        },
        grid: {
          left: '1%',
          right: '1%',
          bottom: '10%',
          top: '14%',
          containLabel: false
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          textStyle: {
            align: 'left'
          }
        },
        xAxis: [{
          type: 'category',
          data: this.callbackDays,
          axisTick: {
            show: false
          },
          axisLabel: {
            show: true,
            textStyle: {
              color: '#666',
              fontSize: 14
            },
            formatter: '{value}'
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#ccc'
            }
          },
          splitLine: { // 网格线
            show: true,
            lineStyle: {
              color: 'rgba(181,181,181,0.2)'
            }
          }
        }],
        yAxis: [{
          type: 'value',
          axisTick: {
            show: false
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#ccc'
            }
          },
          axisLabel: {
            show: false,
            textStyle: {
              color: '#666',
              fontSize: 14
            }
          },
          splitLine: { // 网格线
            show: true,
            lineStyle: {
              color: 'rgba(181,181,181,0.2)'
            }
          }
        }],
        series: this.zbxAlarmLogStaticticsData
      }
      myChart.setOption(option, true)
      myChart.getZr().on('click', (params) => {
        const pointInPixel = [params.offsetX, params.offsetY]
        this.$set(this.findZbxAlarmLogQuery, 'sameType', 0)
        if (myChart.containPixel('grid', pointInPixel)) {
          let xIndex = myChart.convertFromPixel({ seriesIndex: 0 }, [params.offsetX, params.offsetY])[0]
          const echartsClickStartTime = new Date(`${self.callbackDays[xIndex]} 00:00:00`).getTime()
          const echartsClickEndTime = new Date(`${self.callbackDays[xIndex]} 23:59:59`).getTime()
          this.$set(this.findZbxAlarmLogQuery, 'startCLock', echartsClickStartTime)
          this.$set(this.findZbxAlarmLogQuery, 'endClock', echartsClickEndTime)
          this.findAssetsAlarm('nullSameType')
        }
      })
      self.resizeWin = window.addEventListener('resize', () => {
        myChart.resize()
      })
    },
    // 搜索查询
    handleFilter() {
      this.$set(this.findZbxAlarmLogQuery, 'page', 1)
      this.$set(this.findZbxAlarmLogQuery, 'sameType', 0)
      this.findAssetsAlarm()
    },
    // 点击相同项数字
    async opeAlarmSummary(row) {
      console.log(row)
      if (this.showList) {
        this.$refs.table.toggleRowExpansion(row, false)
        this.showList = false
      } else {
        this.rowData = row
        this.count = 10
        await this.steChildrenData(row)
        this.$refs.table.toggleRowExpansion(row, true)
        this.showList = true
      }
    },
    // 查询告警类型数量
    async getAlarmLogTypeCount(val) {
      const t1 = Date.parse(new Date()) / 1000

      const res = await request({
        url: api.itMonitor.getAlarmLogTypeCount,
        data: { endClock: t1, alarmIds: val }
      })
      if (res.code !== 1) return
      return res.model
    },
    // 获取同类型告警数据
    async findZbxAlarmLogSameType(val) {
      const time1 = Date.parse(new Date()) / 1000
      const query = val.sameTypeLastTime && val.sameTypeLastTime > 0 ? { keyword: val.description, hostid: val.hostId, page: 1, limit: this.count, startCLock: val.clock, endClock: val.sameTypeLastTime, agents: this.agentsIds, logId: val.id } : { keyword: val.description, hostid: val.hostId, page: 1, limit: this.count, startCLock: val.clock, endClock: time1, agents: this.agentsIds, logId: val.id }
      if (val.sameType) query.sameType = val.sameType
      const res = await request({
        url: api.itMonitor.findZbxAlarmLog,
        data: query
      })
      if (res.code !== 1) return
      return res.data
    },
    // 排序
    handlerSort(name, val) {
      this.findZbxAlarmLogQuery.orderBy = name
      this.findZbxAlarmLogQuery.desc = val
      this.findAssetsAlarm()
    },
    // 查询告警
    async findAssetsAlarm(val) {
      console.log(val)
      this.getName = []
      this.latestData = this.requestTime / 1000 // 刷新倒计时
      this.$refs.table.bodyWrapper.scrollTop = 1000
      if (this.findZbxAlarmLogQuery.startCLock && this.findZbxAlarmLogQuery.endClock) {
        this.findZbxAlarmLogQuery.startCLock = parseInt(this.findZbxAlarmLogQuery.startCLock / 1000)
        this.findZbxAlarmLogQuery.endClock = parseInt(this.findZbxAlarmLogQuery.endClock / 1000)
      } else if (this.findZbxAlarmLogQuery.startCLock && !this.findZbxAlarmLogQuery.endClock) {
        this.findZbxAlarmLogQuery.startCLock = parseInt(this.findZbxAlarmLogQuery.startCLock / 1000)
        this.findZbxAlarmLogQuery.endClock = parseInt(Date.parse(new Date()) / 1000)
      } else if (!this.findZbxAlarmLogQuery.startCLock && this.findZbxAlarmLogQuery.endClock) {
        this.findZbxAlarmLogQuery.startCLock = parseInt((Date.parse(new Date()) - 365 * 2 * 24 * 3600 * 1000) / 1000) // 没写开始时间，传个2年前
        this.findZbxAlarmLogQuery.endClock = parseInt(this.findZbxAlarmLogQuery.endClock / 1000)
      }
      this.isMore = false
      // val === 'nullSameType' ? this.$set(this.findZbxAlarmLogQuery, 'sameType', '') : this.$set(this.findZbxAlarmLogQuery, 'sameType', 0)
      request({
        url: api.itMonitor.findZbxAlarmLog, data: { ...this.findZbxAlarmLogQuery, agents: this.agentsIds}
      }).then(async res => {
        this.tagLoading = false
        if (this.findZbxAlarmLogQuery.startCLock && this.findZbxAlarmLogQuery.endClock) {
          this.findZbxAlarmLogQuery.startCLock = this.findZbxAlarmLogQuery.startCLock * 1000
          this.findZbxAlarmLogQuery.endClock = this.findZbxAlarmLogQuery.endClock * 1000
        }

        this.alarmLogTotal = Number(res.count)
        const idm = []
        res.data.forEach(item => {
          const getHost = this.getName.filter(ele => +item.hostId === +ele.hyHostId)
          if (getHost.length > 0) {
            item.hyMarkName = getHost[0].hyMarkName
          } else {
            idm.push(item.hostId)
          }
        })
        // 查设备名称
        if (this.getName.length === 0) {
          this.getName = await this.findHyitHost(idm)
        }
        if (this.getName.length > 0) {
          res.data.forEach(item => {
            const getHost = this.getName.filter(ele => +item.hostId === +ele.hyHostId)
            if (getHost.length > 0) {
              item.hyMarkName = getHost[0].hyMarkName
            }
          })
        }
        // // this.addChildren(res)
        this.total = parseInt(res.count)
        this.alarm_data = res.data
      })
    },
    // 添加相同告警数据到children
    async addChildren(res) {
      let getIds = []
      res.data.forEach(itemIds => {
        if (itemIds.status === 4 || itemIds.status === 1 || itemIds.status === 3) {
          getIds.push(itemIds.id)
        }
      })
      if (getIds.length > 0) {
        const getNum = getIds.join(',')
        const countNum = await this.getAlarmLogTypeCount(getNum)
        const countData = JSON.parse(countNum)
        countData.forEach(val1 => {
          res.data.forEach(async val2 => {
            if (Number(val1.alarmId) === Number(val2.id)) {
              this.$set(val2, 'alarmCount', val1.count)
            }
          })
        })
      }
    },
    // 添加children数据和修改hyMarkName设备名称
    async steChildrenData(row) {
      this.childData = await this.findZbxAlarmLogSameType({...row, sameType: 1})
      // 添加hyMarkName设备名称
      this.childData.forEach(childItem => {
        this.getName.forEach(nameItem => {
          if (Number(childItem.hostId) === Number(nameItem.hyHostId)) {
            this.$set(childItem, 'hyMarkName', nameItem.hyMarkName)
          }
        })
      })
      // 添加children
      this.$set(row, 'children', this.childData)
    },
    // 查询设备名称
    async findHyitHost(idm) {
      const { code, data } = await request({
        url: api.itMonitor.findHyitHost,
        data: { ids: idm, page: 1, limit: -1, agents: this.agentsIds }
      })
      if (code !== 1) return
      return data
    },
    // 请求本月告警日志
    getZbxAlarmLogStatictics() {
      const json = []
      const dayNum = new Date().getDate()
      this.callbackDays.forEach((item, index) => {
        if (index > dayNum - 1) return
        json.push({
          startClock: Number(new Date(`${item} 00:00:00`).valueOf() / 1000),
          endClock: Number(new Date(`${item} 23:59:59`).valueOf() / 1000)
        })
      })
      this.startTime = json[0].startClock
      this.endTime = json[dayNum - 1].endClock
      request({
        url: api.itMonitor.getZbxAlarmLogStatictics2, data: { agents: this.agentsIds, startCLock: this.startTime, endClock: this.endTime }
      }).then(res => {
        if (res.code === 1 && res.map.result) {
          this.zbxAlarmLogStaticticsData.forEach((sitem, skey) => {
            res.map.result.forEach(dItem => {
              if (+sitem.dictdataValue === +dItem.alevel) {
                const fdata = this.zbxAlarmLogStaticticsData[skey].fdata
                const dateIdx = fdata.findIndex(item => {
                  return new Date(item.date).getTime() === new Date(dItem.dateTime).getTime()
                })
                this.$nextTick(() => {
                  if (dateIdx !== -1) {
                    this.$set(this.zbxAlarmLogStaticticsData[skey].data, dateIdx, dItem.totalCount)
                    this.zbxAlarmLogStaticticsData[skey].fdata[dateIdx].value = dItem.totalCount
                  }
                })
              }
            })
          })
        }
        this.$nextTick(() => {
          this.initmyChart()
        })
      })
    },
    // 选择告警
    selectionListChange(val) {
      this.selectionListChangeValue = val
    },
    // 批量关闭告警按钮
    handleCommand(command) {
      this.closeType = 'batch'
      if (command === 'batchClose') {
        if (this.selectionListChangeValue.length === 0) {
          this.$message('请选择告警信息')
          return
        }
      }
      this.$confirm('是否批量关闭选择的告警？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.showDialog = true
      })
    },
    // 关闭告警
    confirmCloseDialog() {
      // 批量关闭
      if (this.closeType === 'batch') {
        const alarmIds = []
        let agent = '' // 因为电信Esight这里只有一个网关
        const sameTypeCountItem = []
        this.selectionListChangeValue.forEach(item => {
          alarmIds.push(item.id)
          agent = item.agent
          if (item.sameTypeCount > 0) {
            sameTypeCountItem.push(item)
          }
          request({
            url: '/admin/updateZbxAlarmLog',
            data: { id: item.id, status: '1', ...this.modelData }
          }).then(async res => {
            if (res.code === 1) {
              this.showDialog = false
              this.drawer = false
              await this.commonRequestFn.insertOpsOrderAlarmLog({
                alarmId: item.id,
                alarmModelType: 1,
                alarmHandleLog: `${this.loginUser.realName}关闭了告警`,
                userId: this.loginUser.userId,
                backup: this.closeAlarmLogBackup
              })
              if (item.eventid !== '') {
                await request({
                  url: api.itMonitor.agentUpdateProblem,
                  data: { agent: item.agent, eventid: item.eventid, agents: this.agentsIds }
                })
              }
              // this.alarm_data = []
              this.findAssetsAlarm()
            }
          })
        })
        sameTypeCountItem.forEach(async item => {
          const sameFault = await this.findZbxAlarmLogSameType(item)
          if (sameFault) {
            sameFault.forEach(items => alarmIds.push(items.id))
          }
        })
        this.EsightUpdateAlarm({
          agent, alarmIds: alarmIds.toString(), type: 2
        })
      } else {
        // 单个关闭
        request({
          url: '/admin/updateZbxAlarmLog',
          data: { id: this.model.id, status: '1', ...this.modelData }
        }).then(async res => {
          await this.commonRequestFn.insertOpsOrderAlarmLog({
            alarmId: this.model.id,
            alarmModelType: 1,
            alarmHandleLog: `${this.loginUser.realName}关闭了告警
            ${this.modelData.coverage ? `影响范围：${this.modelData.coverage}` : ''}
            ${this.modelData.causeDescription ? `原因说明：${this.modelData.causeDescription}` : ''}
            ${this.modelData.progress ? `处理进度：${this.modelData.progress}` : ''}`,
            userId: this.loginUser.userId,
            backup: this.closeAlarmLogBackup
          })
          if (this.model.eventid !== '') {
            await request({
              url: api.itMonitor.agentUpdateProblem,
              data: { agent: this.model.agent, eventid: this.model.eventid }
            })
          }

          const alarmIds = [this.model.id]
          if (this.model.sameTypeCount > 0) {
            const sameFault = await this.findZbxAlarmLogSameType(this.model)
            if (sameFault) {
              sameFault.forEach(items => alarmIds.push(items.id))
            }
          }

          this.EsightUpdateAlarm({
            agent: this.model.agent, alarmIds: alarmIds.toString(), type: 2
          })

          this.$notify({
            title: '成功',
            message: '关闭成功',
            type: 'success',
            duration: 2000
          })
          this.drawer = false
          this.showDialog = false
          this.alarm_data = []
          this.findAssetsAlarm()
        })
      }
    },
    // 点击告警设备名称跳转到it监控设备详情
    async handlerToItMonitorDevice(row) {
      const { data } = await request({
        url: api.common.findSysDictionaryDetail,
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
    // 点击类似告警跳转it监控设备详情的 事件列表
    async handlerToItMatterList() {
      const time1 = Date.parse(new Date()) / 1000
      const { data } = await request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_sub_dev_type', limit: -1, ids: this.model.subdevTypeId }
      })
      this.$router.push({
        name: 'ResourceMonitorDetail',
        query: {
          id: this.model.hostId || 0,
          zbxHostId: this.model.zhostId,
          agent: this.model.agent,
          devTypeId: this.model.devTypeId,
          subType: data && data.length > 0 ? data[0].dictdataValue : '',
          hySubdevTypeId: this.model.subdevTypeId && this.model.subdevTypeId > 0 ? this.model.subdevTypeId : '',
          activeTabName: '5',
          startCLock: this.model.clock,
          endClock: time1,
          sameType: 1,
          keyword: this.model.description
          // status: this.model.status
        }
      })
    },

    EsightUpdateAlarm(query) {
      this.$request({
        url: this.api.itMonitor.EsightUpdateAlarm,
        data: query
      })
    },
    // 点击筛选当前用户告警
    handlerSelectCurrentUserDealAlarm() {
      if (this.findZbxAlarmLogQuery.userId === '') {
        this.$set(this.findZbxAlarmLogQuery, 'userId', this.$auth.getUserSession().userId)
      } else {
        this.$set(this.findZbxAlarmLogQuery, 'userId', '')
      }
      this.$set(this.findZbxAlarmLogQuery, 'page', 1)
      this.findAssetsAlarm()
    }
  }
}
</script>
<style lang="scss" scoped>
.columnar{
  flex: 1;
  width: 100%;
  height: 100%;
}
.ellipsis {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
/*IT告警选择后不用加多一个边框
.filter-item.active{
  border: 2px solid #ca1818 !important;
}
*/
.alarms-num {
  display: flex;
  position: absolute;
  right: 20px;
  padding: 7px 10px 5px 10px;
  border-radius: 20px;
  background-color: rgb(242,242,242);
  .alarms-word {
  width: 70px;
  color: #000000;
  }
  el-link {
    color: blue;
  }
}
.drawer-alarm-box{
  padding: 20px;
  .alarm-info {
    .alarm-info-content {
      .alarm-info-title {
        font-size: 16px;
        color: #333333;
        padding: 6px;
      }
      .state {
        width: 100px;
        text-align: center;
        font-size: 14px;
        color: #FFFFFF;
        margin-right: 10px;
      }
    }
    .alarm-info-desc {
      color: #999999;
      font-size: 14px;
      padding: 14px 0;
      line-height: 24px;
    }
  }
  .alarm-info-form {
    margin: 10px 0;
    .tag {
      font-size: 14px;
      margin: 15px 0 5px;
    }
    .row {
      position: relative;
      padding: 10px 0;
      font-size: 14px;
      color: #999999;
      height: 50px;
      border-bottom: 1px solid #f2f2f2;
      .lbl {
        width: 25%;
      }
      .val {
        width: 75%;
        color:#000000;
      }
    }
  }
}

.el-tag--dark {
  border: none;
  color: #ffffff;
}
.degrees-box {
  display: flex;
  align-items: center;
  .degrees-item {
    padding: 5px;
    border-radius: 5px;
    margin: 0 2px;
  }
  .degrees-item:hover {
    background: #f2f2f2;
  }
}
.danger{
  position: relative;
  z-index: 100;
  color: #fff6f6 !important;
  background: #fe5b5c !important;
  border-color: #fe5b5c !important;
}
.warning {
  position: relative;
  z-index: 100;
  color: #fffcf2!important;
  background: #e6a23c !important;
  border-color: #e6a23c !important;
}
.success {
  position: relative;
  z-index: 100;
  color: #f2fbf9 !important;
  background: #1dbb92 !important;
  border-color: #1dbb92 !important;
}
.num {
  margin-left: 10px;
  border-radius: 5px;
  padding: 0px 7px 0PX 7px;
  background-color: #999999;
  a {
    font-size: 8px;
    color: #fff;
  }
  a:hover{
    text-decoration: underline;
  }
}

.row-expand-unhas .el-table__expand-column{
  pointer-events: none;
}
 /deep/ .row-expand-cover .el-table__expand-icon{
  visibility: hidden;
}
.marginR {
  margin-right: 15px;
}
.description-item {
  display: flex;
  align-items: center;
  .alarn-description {
    width: 80%;
    display: inline-block;
  }
}
.filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
