<template>
  <div class="ring flex">
    <div class="area-sidebar">
      <div class="sidebar-status text-center">
        <div class="status-text">
          <div class="status-text-status mb-10">系统健康度</div>
          <div
            class="status-text-progress"
            :style="{ color: setProgressStyle }"
          >
            {{ progressStyle.percentage }}%
          </div>
        </div>
        <el-progress
          :percentage="progressStyle.percentage"
          :stroke-width="12"
          :text-inside="true"
          :width="180"
          status="exception"
          type="circle"
          :color="setProgressStyle"
        />
        <div class="text-center">
          <el-button
            class="mt-20 polling-btn"
            :loading="btnLoading"
            round
            type="success"
            @click="inspectionDongHuan"
          >全部巡检</el-button>
        </div>
      </div>
      <div class="area-sidebar-list">
        <h3 class="m-0 px-14 font-16 pointer" @click="onAllAreaClick">全部区域</h3>
        <div class="area-sidebar-list-box">
          <div
            v-for="(item, index) in areaList"
            :key="item.hyAreaId"
            :class="{ active: areaId === item.hyAreaId }"
            class="area-sidebar-list-item flex-h-center"
            @click="onClick(item, index)"
          >
            <div class="overflow-text-a flex-1">{{ item.hyAreaName }}</div>
            <!-- 列表旁边的告警数字，已经包含了hyState==0和==2的数量 -->
            <div
              v-if="item.alarmNum"
              class="area-sidebar-list-item-alarmnum flex-center"
            >
              {{ item.alarmNum }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="ring-box flex-column">
      <div class="box-tabs flex-h-center">
        <div
          v-for="item in tabs"
          :key="item.component"
          :class="{ active: componentName === item.component || (componentName==='Polling' && item.component==='PollingList') }"
          class="tabs-item"
          @click="componentName = item.component"
        >
          {{ item.name }}
        </div>
        <div class="polling-btn">
          <el-button
            plain
            :loading="loading"
            @click="inspectionDongHuanone"
          >快速扫描</el-button>
        </div>
      </div>
      <!-- 右边tabs项内容 -->
      <div class="box-container">
        <div v-if="componentName === 'Device'" class="ring-device flex">
          <div class="list-wrapper">
            <h3 class="pl-20 font-16">设备列表</h3>
            <ul class="list">
              <template v-for="(item, index) in list">
                <li v-if="item.isShow === 1" :key="item.hyDevTypeId">
                  <div
                    :class="[
                      'list-item',
                      { active: +item.hyDevTypeValue === currHydevtypevalue },
                    ]"
                    @click="onShowDeviceList(item, index)"
                  >
                    <img
                      :src="listIcon[item.hyDevTypeValue]"
                      fit="fill"
                      style="width: 20px; height: 20px"
                    >
                    <div class="ml-10 color-333 font-16 flex-1 overflow-text-a flex-v-between">
                      <div class="text">  {{ item.hyDevTypeName }}</div>
                      <!-- test -->
                      <div
                        v-if="item.count"
                        style="margin:0 20px 0 0"
                        class="area-sidebar-list-item-alarmnum flex-center"
                      >
                        {{ item.count }}
                      </div>
                    </div>

                    <i
                      class="el-icon-arrow-down"
                      style="width: 10px; height: 7px; color: #666"
                    />
                  </div>
                  <!-- 二级菜单-->
                  <template v-if="item.showDeviceList">
                    <div
                      v-for="device in item.deviceList"
                      :key="device.hyDeviceId"
                      :class="{
                        active: currHydeviceid === device['hyDeviceId'],
                      }"
                      class="my-14 device-list flex-h-center pointer"
                      @click="onItemClick(device)"
                    >
                      <div class="list-item-name linear-1">
                        {{ device.hyAlias }}
                      </div>
                      <div
                        :style="setStatus(device.hyState)"
                        class="list-item-state flex-center ml-8"
                      >
                        {{ device.hyState === 1 ? '正常' : '异常' }}
                      </div>
                    </div>
                  </template>
                </li>
              </template>
            </ul>
          </div>
          <div
            class="mx-20 pt-20 flex-1 ring-device-right"
          >
            <Rotaing :id="currHydeviceid" :show-config="true" @dhMenuListLength="goAndSetLanmu" />
          </div>
        </div>
        <div v-if="componentName === 'Alarm'" class="ring-alarm">
          <div class="alarm-echart">
            <div ref="echart" style="height: 300px; width: 100%" />
          </div>
          <div class="alarm-table">
            <el-form ref="form" :model="query" inline label-width="80px">
              <el-form-item>
                <el-date-picker
                  v-model="query.time"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="yyyy-MM-dd"
                  clearable
                  @clear="onSearch"
                />
              </el-form-item>
              <el-form-item>
                <el-select
                  v-model="query.hyLevel"
                  placeholder="请选择"
                  clearable
                  @clear="onSearch"
                >
                  <el-option
                    v-for="item in levelList"
                    :key="item.dictdataValue"
                    :label="item.dictdataName"
                    :value="+item.dictdataValue"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  icon="el-icon-search"
                  @click="onSearch"
                >搜索</el-button>
              </el-form-item>
              <el-form-item>
                <el-dropdown @command="selectClose">
                  <el-button type="primary">
                    批量操作<i class="el-icon-arrow-down el-icon--right" />
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :command="'close'">关闭</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </el-form-item>
              <el-form-item>
                <el-button
                  v-for="item in levelList"
                  :key="item.id"
                  clss="levelbtn"
                  :border="false"
                  size="mini"
                  :style="{
                    backgroundColor: item['remark'],
                    border: 'none',
                  }"
                  type="primary"
                  @click=";(query.hyLevel = +item.dictdataValue), onSearch()"
                >
                  {{ item.dictdataName }}
                </el-button>
              </el-form-item>
              <ListControl :check-list="checkList" :storage-val="storageVal" @setLists="setLists" />

            </el-form>

            <div class="table-wrapper">
              <el-table
                :data="alarmList"
                style="width: 100%"
                @selection-change="tableSelect"
              >
                <el-table-column type="selection" align="center" />
                <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="级别" show-overflow-tooltip align="center">
                  <template v-slot="{ row }">
                    <el-button
                      size="mini"
                      :style="{
                        backgroundColor: $tool.matchData(levelList,row,'hyLevel','remark','dictdataValue'),
                        border: 'none',
                        color: '#fff',
                      }"
                    >
                      {{
                        $tool.matchData(
                          levelList,
                          row,
                          'hyLevel',
                          'dictdataName',
                          'dictdataValue'
                        )
                      }}
                    </el-button>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="lists.length > 0 ? lists[1].ispass : true"
                  prop="hyDeviceName"
                  label="设备名称"
                  show-overflow-tooltip
                  align="left"
                >
                  <template v-slot="{ row }">
                    <el-link>{{ row.hyDeviceName }}</el-link>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="lists.length > 0 ? lists[2].ispass : true"
                  prop="hyAlarmDesc"
                  label="描述"
                  show-overflow-tooltip
                  align="left"
                />
                <el-table-column
                  v-if="lists.length > 0 ? lists[3].ispass : true"
                  prop="hyCtime"
                  label="时间"
                  show-overflow-tooltip
                  align="right"
                />
                <el-table-column
                  v-if="lists.length > 0 ? lists[4].ispass : true"
                  prop="hyStatus"
                  label="状态"
                  show-overflow-tooltip
                  align="left"
                >
                  <template v-slot="{ row }">
                    <div
                      class="font-14"
                      :style="setAlarmStatusStyle(row.hyStatus)"
                    >
                      {{ !row.hyStatus?'待处理':'已处理' }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" prop="address" label="操作" width="180" align="left">
                  <template v-slot="{ row }">
                    <el-button
                      v-if="!row.hyStatus"
                      type="primary"
                      size="mini"
                      @click=";(currentala = row), (dialogVisible = true)"
                    >确认</el-button>
                    <el-button
                      v-else
                      type="primary"
                      size="mini"
                      @click=";(currentala = row), (dialogLookVisible = true)"
                    >查看</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <pagination
              v-show="query.total > 0"
              :total="query.total"
              :page.sync="query.page"
              :limit.sync="query.limit"
              :auto-scroll="false"
              @pagination="onSearch"
            />
            <el-dialog
              title="操作确认"
              :visible.sync="dialogVisible"
              width="60%"
            >
              <el-form ref="form" :model="currentala" label-width="80px">
                <div class="flex">
                  <el-form-item label="名称">
                    <el-input v-model="currentala.hyDeviceName" readonly />
                  </el-form-item>
                  <!--                  <el-form-item label="时间">-->
                  <!--                    <el-date-picker v-model="currentala.hyUtime" type="datetime" placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" :picker-options="setDisabled" />-->
                  <!--                  </el-form-item>-->
                  <!--                  <el-form-item label="处理情况">-->
                  <!--                    <el-select v-model="currentala.hyStatus" placeholder="请选择">-->
                  <!--                      <el-option label="未处理" :value="0" />-->
                  <!--                      <el-option label="已处理" :value="1" />-->
                  <!--                    </el-select>-->
                  <!--                  </el-form-item>-->
                </div>
                <el-form-item label="备注">
                  <el-input v-model="currentala.remark" type="textarea" />
                </el-form-item>
              </el-form>
              <span slot="footer" class="dialog-footer">
                <el-button
                  type="primary"
                  @click="updateHyitAlarmLog(currentala)"
                >保存</el-button>
              </span>
            </el-dialog>
            <el-dialog
              title="查看"
              :visible.sync="dialogLookVisible"
              width="60%"
            >
              <el-form ref="form" :model="currentala" label-width="80px">
                <el-form-item label="名称">
                  <div>{{ currentala.hyDeviceName }}</div>
                </el-form-item>
                <el-form-item label="时间">
                  {{ currentala.hyUtime }}
                </el-form-item>
                <el-form-item label="处理情况">
                  {{ currentala.hyStatus === 0 ? '未处理' : '已处理' }}
                </el-form-item>
                <el-form-item label="备注">
                  <div>{{ currentala.remark }}</div>
                </el-form-item>
              </el-form>
              <span slot="footer" class="dialog-footer">
                <el-button
                  type="primary"
                  @click="dialogLookVisible = false"
                >关闭</el-button>
              </span>
            </el-dialog>
          </div>
        </div>
        <div v-if="componentName === 'PollingList'" class="powerEnv-pollingList">
          <el-form ref="form" :model="pollquery" inline label-width="80px">
            <el-form-item>
              <el-date-picker
                v-model="pollquery.ctime"
                type="date"
                format="yyyy 年 MM 月 dd 日"
                value-format="yyyy-MM-dd"
                placeholder="请选择"
                @clear="onSearchPolling"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="medium"
                @click="onSearchPolling"
              >搜索</el-button>
            </el-form-item>
            <ListControl :check-list="checkLists" :storage-val="storageVals" @setLists="setLists" />
          </el-form>
          <div class="table-wrapper">
            <el-table :data="tableData" style="width: 100%">
              <el-table-column
                v-if="lists.length > 0 ? lists[0].ispass : true"
                prop="reportName"
                label="报告名称"
                show-overflow-tooltip
                align="left"
              />
              <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="巡检人" show-overflow-tooltip align="left">
                <template v-slot="{ row }">
                  {{ $tool.matchData(userList, row, 'userId', 'realName') }}
                </template>
              </el-table-column>
              <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="巡检区域" show-overflow-tooltip align="left">
                <template v-slot="{ row }">
                  {{ $tool.matchData(areaList, row, 'areaId', 'hyAreaName','hyAreaId') }}
                </template>
              </el-table-column>
              <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" width="100" label="巡检结果" show-overflow-tooltip align="left">
                <template v-slot="{ row }">
                  {{ !row.state?'正常':'异常' }}
                </template>
              </el-table-column>
              <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="巡检设备数量" show-overflow-tooltip prop="totalNum" align="right">
                <template />
              </el-table-column>
              <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" label="离线设备数" show-overflow-tooltip prop="offNum" align="right" />
              <el-table-column
                v-if="lists.length > 0 ? lists[6].ispass : true"
                prop="alarmNum"
                label="告警设备数"
                show-overflow-tooltip
                align="right"
              />
              <el-table-column
                v-if="lists.length > 0 ? lists[7].ispass : true"
                prop="ctime"
                label="巡检时间"
                show-overflow-tooltip
                align="right"
              />
              <el-table-column v-if="lists.length > 0 ? lists[8].ispass : true" prop="status" label="状态" show-overflow-tooltip align="left">
                <template v-slot="{ row }">
                  <div
                    class="font-14"
                    :style="setPollingStatusStyle(row.status)"
                  >
                    {{ !row.status?'未提交':'已提交' }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column v-if="lists.length > 0 ? lists[9].ispass : true" label="操作" width="180" align="left">
                <template v-slot="{ row }">
                  <el-button
                    type="primary"
                    size="mini"
                    @click="pushPollingDetail(row)"
                  >查看</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <pagination
            v-show="pollquery.total > 0"
            :total="pollquery.total"
            :page.sync="pollquery.page"
            :limit.sync="pollquery.limit"
            :auto-scroll="false"
            @pagination="onSearchPolling"
          />
        </div>
        <Polling v-if="componentName === 'Polling'" />
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import {formatNumber } from '@/utils/utils'
import api from '@/api/api'
import Rotaing from './components/Device/components/rotaing-right'
import * as echarts from 'echarts'
import Pagination from '@/components/Pagination'
import { mapState } from 'vuex'
import Polling from './components/Polling/Polling'
import { dateFormat } from '@/utils/utils'
import ListControl from '@/components/ListControl'
export default {
  name: 'Ring',
  components: {
    Rotaing,
    Pagination,
    Polling,
    ListControl
  },
  data() {
    return {
      tabs: [
        { name: '设备', component: 'Device' },
        { name: '警告', component: 'Alarm' },
        { name: '报告', component: 'PollingList' }
      ],
      componentName: 'Device',
      loading: false,
      rotaingLoading: true,
      current: 0,
      areaList: [],
      pollingprogressStyle: {
        percentage: 100
      },
      btnLoading: false,
      list: [],
      currHydeviceid: 0,
      currHydevtypevalue: 0,
      listIcon: {
        10060: 'image/ring-monitor/精密空调.png',
        1016: 'image/ring-monitor/ups.png',
        1000: 'image/ring-monitor/温湿度.png',
        10058: 'image/ring-monitor/供配电.png',
        1017: 'image/ring-monitor/蓄电池.png',
        10069: 'image/ring-monitor/声光报警.png',
        10068: 'image/ring-monitor/漏水监控.png',
        10067: 'image/ring-monitor/ls.png',
        10066: 'image/ring-monitor/列头柜.png',
        1012: 'image/ring-monitor/新风系统.png',
        105: 'image/ring-monitor/门禁.png',
        1014: 'image/ring-monitor/红外监控.png'
      },
      query: {
        stime: '',
        etime: '',
        hyLevel: '',
        // hyStatus: '',
        total: 0,
        limit: 10,
        pageSize: 10,
        time: '',
        hyOrgId: ''
      },
      levelList: [],
      statusList: [
        { label: '待处理', value: 0 },
        { label: '已处理', value: 1 }
      ],
      alarmList: [],
      alarmColors: {
        5: '#FE4D4E',
        4: '#FE830C',
        3: '#268CF2',
        2: '#FE4D4E',
        1: '#00B285'
      },
      dialogVisible: false,
      currentala: {},
      selectList: [],
      setDisabled: {
        disabledDate(time) {
          return time.getTime() > Date.now() // 可选历史天、可选当前天、不可选未来天
        }
      },
      tableData: [],
      pollquery: {
        ctime: '',
        total: 0,
        limit: 10,
        pageSize: 10
      },
      userList: [],
      progressStyle: {
        percentage: 0
      },
      form: {},
      fileList: [],
      devTypeList: [],
      deleteFile: '',
      alarmCount: 0,
      echartLabel: [],
      dialogLookVisible: false,
      date_data: [],
      // 显示控制数据 start
      checkList: ['级别', '设备名称', '描述', '时间', '状态', '操作'],
      storageVal: 'ring-warning', // 存入localStorageOperation的名字
      checkLists: ['报告名称', '巡检人', '巡检区域', '巡检结果', '巡检设备数量', '离线设备数', '告警设备数', '巡检时间', '状态', '操作', '状态', '操作'],
      storageVals: 'ring-report',
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setProgressStyle() {
      const percentage = this.progressStyle.percentage
      return percentage === 0
        ? 'var(--offline)'
        : percentage < 100
          ? 'var(--error)'
          : 'var(--success)'
    },
    setStatus() {
      return function(status) {
        return {
          // background: status === 0 ? '#FBEDED' : '#E6F7F3',
          background: status === 1 ? '#E6F7F3' : '#FBEDED',
          // color: status === 0 ? 'var(--error)' : 'var(--success)'
          color: status === 1 ? 'var(--success)' : 'var(--error)'
        }
      }
    },
    ...mapState({
      areaId: (state) => state.ring.areaId,
      reportId: (state) => state.ring.reportId
    }),
    setpollingProgressStyle() {
      const percentage = this.pollingprogressStyle.percentage
      return percentage === 0
        ? 'var(--offline)'
        : percentage < 100
          ? 'var(--error)'
          : 'var(--success)'
    },
    setPollingStatusStyle() {
      return (state) => ({
        background: !state ? 'rgba(254, 77, 78,.1)' : 'rgba(0, 178, 133,.1)',
        borderRadius: '3px',
        padding: '2px 5px',
        color: !state ? 'var(--error)' : 'var(--success)',
        display: 'inline-block'
      })
    },
    setAlarmStatusStyle() {
      return (state) => ({
        color: !state ? 'var(--error)' : 'var(--success)',
        background: !state ? 'rgba(245,108,108,0.1)' : 'rgba(0,178,133,0.1)',
        padding: '2px 5px',
        borderRadius: '3px',
        display: 'inline-block'
      })
    }
  },
  watch: {
    'query.time': {
      handler(n) {
        this.query.stime = n[0]
        this.query.etime = n[1]
      },
      deep: true
    },
    componentName(n) {
      if (n === 'Alarm') {
        this.$nextTick(async() => {
          await this.findHyitAlarmLevel()
          await this.showDayDHAlarmLogByDay()
          await this.findHyitAlarmLog()
        })
      }
      if (n === 'Polling') {
        this.$nextTick(async() => {
          // this.form = await this.getPowerEnvInspectionReport(this.reportId)
          // await this.findPowerEnvInspectionReportPicture(this.reportId)
          // await this.init(this.form.reportId)
        })
      }
      if (n === 'PollingList') {
        this.$nextTick(async() => {
          await this.findSysUser()
          await this.findPowerEnvInspectionReport()
        })
      }
      if (n === 'Device') {
        this.$nextTick(async() => {
          await this.findHyitDevType()
        })
      }
    },
    deleteFile(n) {
      this.deletePowerEnvInspectionReportPicture(n.id)
    },
    areaId(n) {
      this.query.hyOrgId = n
    }
  },
  async mounted() {
    await this.findHyitArea()
  },

  methods: {
    setLists(val) {
      this.lists = val
    },
    async onAllAreaClick() {
      this.$store.commit('ring/SET_AREA_ID', '')
      this.currHydeviceid = null
      if (this.componentName !== 'Device') this.componentName = 'Device'
      else await this.findHyitDevType()
    },
    pushPollingDetail(item, flag) {
      this.$store.commit('ring/SET_REPORTID', item.reportId)
      this.componentName = 'Polling'
    },
    async findSysUser() {
      let { data, code } = await request({
        url: api.sys.findSysUser,
        data: { limit: -1, companyId: this.$auth.getUserSession().companyId }
      })
      if (code === 1) this.userList = data
    },
    async findPowerEnvInspectionReportDetail(reportId) {
      let { data, code } = await request({ url: api.powerEnv.findPowerEnvInspectionReportDetail, data: { reportIds: reportId.join() }})
      if (code === 1) return data
    },
    onSearchPolling() {
      this.pollquery.pageSize = 1
      this.findPowerEnvInspectionReport()
    },
    async findPowerEnvInspectionReport() {
      let { data, code, count } = await request({
        url: api.powerEnv.findPowerEnvInspectionReport,
        data: { ...this.pollquery, areaId: this.areaId }
      })
      if (code !== 1) return
      // count为巡检报告总数
      this.pollquery.total = +count
      let reportIds = []
      if (!data || data.length === 0) {
        this.tableData = []
        return
      }
      data.forEach(item => {
        reportIds.push(item.reportId)
      })
      // const detail = await this.findPowerEnvInspectionReportDetail(datum.reportId)
      const detail = await this.findPowerEnvInspectionReportDetail(reportIds)

      if (data.length > 0) {
        console.log(111)
        data.forEach(item => {
          item.alarmNum = 0
          item.offNum = 0
          item.normalNum = 0
          item.totalNum = 0
          if (detail.length > 0) {
            detail.forEach(item2 => {
              if (item.reportId === item2.reportId) {
              // alarmNum = detail.reduce((pre, next) => pre + next.alarmNum, 0)
              // normalNum = detail.reduce((pre, next) => pre + next.normalNum, 0)
              // offNum = detail.reduce((pre, next) => pre + next.offNum, 0)
                item.alarmNum += item2.alarmNum || 0
                item.offNum += item2.offNum || 0
                item.normalNum += item2.normalNum || 0
              }
            })
          }
          item.totalNum = item.alarmNum + item.offNum + item.normalNum
        })
      }
      this.tableData = data
    },
    initEchart(tempList) {
      var myChart = echarts.init(this.$refs.echart)
      var option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          textStyle: { color: '#999' }
        },
        grid: [
          {
            left: 0,
            right: 0,
            bottom: 30
          }
        ],
        calculable: true,
        xAxis: [
          {
            type: 'category',
            boundaryGap: true,
            axisLine: {
              show: true,
              lineStyle: {
                color: '#e8e8e8'
              }
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              color: '#bbb',
              margin: 15

            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#f3f3f3',
                width: 1
              }
            },
            // data: this.echartLabel
            data: this.date_data
          }
        ],
        yAxis: [
          {
            type: 'value',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#e8e8e8'
              }
            },
            axisTick: {
              show: true
            },
            splitLine: {
              lineStyle: {
                color: '#f3f3f3'
              }
            }
          }
        ],
        series: tempList
      }
      option && myChart.setOption(option)
    },
    tableSelect(e) {
      this.selectList = e
    },
    async selectClose(e) {
      if (!this.selectList.length) return this.$message.error('请选择')
      for (const selkect of this.selectList) {
        delete selkect.hyCtime
        await request({
          url: api.powerEnv.updateHyitAlarmLog,
          data: { ...selkect, hyStatus: 1 }
        })
      }
      this.$message.success('操作成功')
    },
    onSearch() {
      this.findHyitAlarmLog()
    },
    async updateHyitAlarmLog(row) {
      delete this.currentala.hyCtime
      delete this.currentala.hyUtime
      let { code } = await request({
        url: api.powerEnv.updateHyitAlarmLog,
        data: { ...this.currentala, hyStatus: 1 }
      })
      if (code !== 1) return
      this.$message.success('操作成功')
      await this.findHyitAlarmLog()
      this.dialogVisible = false
    },
    async showDayDHAlarmLogByDay() {
      const stime = dateFormat(
        'YYYY-mm-dd 00:00:00',
        new Date(+new Date() - 24 * 1000 * 60 * 60 * 15)
      )
      const etime = dateFormat('YYYY-mm-dd 23:59:59', new Date())
      let {
        map: { timeList },
        code
      } = await request({
        url: api.powerEnv.showDayDHAlarmLogByDay,
        data: { stime, etime, hyAreaId: this.areaId, limit: -1 }
      })
      if (code !== 1) return

      this.echartLabel = [...new Set(timeList.map((it) => it.time))]
      let tempObj = Object.fromEntries(
        Array(this.levelList.length)
          .fill([])
          .map((it, index) => [
            +this.levelList[index]['dictdataValue'],
            Object.fromEntries(this.echartLabel.map((it) => [it, 0]))
          ])
      )
      var date = new Date()
      this.endDate = dateFormat('YYYY-mm-dd', date)
      this.startDate = dateFormat('YYYY-mm-dd', new Date(date.setDate(date.getDate() - 30)))
      date = new Date()
      const nd = date.valueOf()
      for (var i = 15; i >= 0; i--) {
        var new_date = nd - i * 24 * 60 * 60 * 1000
        var newDate = new Date(new_date)
        var year = newDate.getFullYear()
        var month = newDate.getMonth() + 1
        var day = newDate.getDate()
        this.date_data.push([year, month, day].map(formatNumber).join('-'))
      }
      timeList.forEach((it) => {
        if (timeList.length === 0) {
          tempObj[it['hyLevel']][it['time']] = 0
        }
        tempObj[it['hyLevel']][it['time']] = it['count']
      })
      tempObj = Object.entries(tempObj).map((it, index) => ({
        name: this.levelList[index]['dictdataName'],
        type: 'bar',
        stack: 'Ad',
        barMaxWidth: 30,
        color: this.levelList[index]['remark'],
        emphasis: {
          focus: 'series'
        },
        data: Object.entries(it[1])
      }))
      // 假如timeList为空数组
      let fakeTempObJ = []
      fakeTempObJ = [{
        name: this.levelList[0]['dictdataName'],
        type: 'bar',
        stack: 'Ad',
        barMaxWidth: 30,
        color: this.levelList[0]['remark'],
        emphasis: {
          focus: 'series'
        },
        data: 0
      }]
      this.fakeTempObJ = fakeTempObJ
      timeList.length === 0 ? this.initEchart(fakeTempObJ) : this.initEchart(tempObj)
    },
    async findHyitAlarmLog() {
      delete this.query.time
      let { code, data, count } = await request({
        url: api.powerEnv.findHyitAlarmLog,
        data: this.query
      })
      if (code !== 1) return
      for (const alarm of data) {
        const device = await this.getHyitDevice(alarm.hyDeviceId)
        alarm.hyDeviceName = device?.hyDeviceName || ''
      }
      this.alarmList = Object.freeze(data)
      this.query.total = Number(count)
    },
    async findHyitAlarmLevel() {
      let { data, code } = await request({
        url: api.linkageManage.findSysDictionaryDetail,
        data: { dictCode: 'alarm_level', limit: -1 }
      })
      if (code === 1) this.levelList = data
    },
    async getHyitDevice(hyDeviceId) {
      let { model, code } = await request({
        url: api.powerEnv.getHyitDevice,
        data: { hyDeviceId }
      })
      if (code === 1) return model
    },
    onItemClick(item) {
      this.currHydeviceid = item.hyDeviceId
      this.currHydevtypevalue = item.hyDevTypeValue
      this.id = this.currHydeviceid
    },
    //  能展示的deviceList
    async onShowDeviceList(item, index) {
      //  如果一级菜单有的话，请求二级菜单。根据的是一级菜单的hyDevTypeValue去取
      // if (!this.list[index]['deviceList'].length) {
      //   var data = await this.findHyitDevice(item.hyDevTypeValue)
      //   this.$set(this.list[index], 'deviceList', data)
      // }
      // console.log(item['deviceList'][0])
      // console.log(item['deviceList'][0])
      if (!item['deviceList'].length > 0) return
      // 取反。关闭
      this.$set(
        this.list[index],
        'showDeviceList',
        !this.list[index]['showDeviceList']
      )
      // 如果二级菜单关闭
      if (!item.showDeviceList) return
      this.currHydevtypevalue = item.hyDevTypeValue
      this.currHydeviceid = item['deviceList'][0]['hyDeviceId'] || ''
    },
    async findHyitDevType() {
      let { code, data } = await request({
        url: api.powerEnv.findHyitDevType,
        data: { Pid: 2, limit: -1 }
      })
      if (code !== 1) return
      // 返回一个带deviceList的设备类型数组

      let list = data.map((it) => ({ ...it, deviceList: [] }))
      // 第一个设备的isShow为0 就return
      if (!list[0]['isShow']) return
      // 给选中的项添加样式用
      // this.currHydevtypevalue = list[0].hyDevTypeValue
      // 初始化给了一个第一项设备类型过去,所以没有显示的了数量
      // await this.onShowDeviceList(this.list[0], 0)
      const hyDevTypeValues = []
      data.forEach(item => {
        hyDevTypeValues.push(item.hyDevTypeValue)
      })
      const deviceList = await this.findHyitDevice(hyDevTypeValues)
      if (deviceList.length <= 0) {
        this.list = list
        return
      }

      list.forEach((item, idx) => {
        let count = 0
        deviceList.forEach((v, index) => {
          if (item.hyDevTypeValue === v.hyDevTypeValue) {
            item.deviceList.push(v)
            if (v.hyState !== 1) {
              count++
            }
          }
        })
        item.count = count
      })
      // list.forEach((item, index) => {
      //   if (item.deviceList.length > 0) {
      //     const idx = item.deviceList.findIndex(v => v.hyState !== 1)
      //     this.currHydeviceid = item.deviceList[idx]['hyDeviceId']
      //     this.currHydevtypevalue = item.hyDevTypeValue
      //     this.$set(this.list[index], 'showDeviceList', true)
      //   }
      // })
      const idx = list.findIndex(item => item.deviceList.length > 0)
      console.log('idx: ', idx)
      this.currHydevtypevalue = list[idx]?.hyDevTypeValue
      // const deviceIdx = list[idx].deviceList.findIndex(v => v.hyState !== 1)
      // if (deviceIdx !== -1) this.currHydeviceid = list[idx].deviceList[deviceIdx].hyDeviceId
      this.currHydeviceid = list[idx]?.deviceList[0]?.hyDeviceId
      this.list = list
      this.$set(this.list[idx], 'showDeviceList', true)

      // this.$set(this.list[0], 'showDeviceList', true)
      // console.log(deviceList)
      // console.log(this.list)
      // this.list.forEach(async(item, index) => {
      //   const deviceList = await this.findHyitDevice(item.hyDevTypeValue)
      //   this.list[index].deviceList = deviceList
      //   if (index === 0 && deviceList.length > 0) {
      //     this.$set(this.list[index], 'showDeviceList', true)
      //     this.currHydeviceid = this.list[index].deviceList[index]['hyDeviceId'] || ''
      //   }

      //   let count = 0
      //   if (deviceList.length > 0) {
      //     deviceList.forEach(item => {
      //       if (item.hyState !== 1) {
      //         count++
      //       }
      //     })
      //   }
      //   this.$set(this.list[index], 'count', count)
      // })
    },
    async findHyitDevice(hyDevTypeValues) {
      let { data, code } = await request({
        url: api.powerEnv.findHyitDevice,
        data: { hyDevTypeValues: this.$tool.uniqueArray(hyDevTypeValues), hyAreaId: this.areaId, limit: -1}
      })
      if (code === 1) return data
    },
    async inspectionDongHuan() {
      this.btnLoading = true
      for (const area of this.areaList) {
        await request({
          url: api.powerEnv.inspectionDongHuan,
          data: {
            areaId: area.hyAreaId
          }
        })
      }
      this.btnLoading = false
      this.$message.success('全部巡检完成')
      if (this.componentName !== 'PollingList') this.componentName = 'PollingList'
      else await this.findPowerEnvInspectionReport()
    },
    async findHyitArea() {
      let { data, code } = await request({
        url: api.area.findHyitArea,
        data: {limit: -1, isDh: 1}
      })

      if (code !== 1) return
      // for (const area of data) {
      //   //  区域ID找状态和数量
      //   const areaDeviceStatus = await this.findDeviceNumAndState(area.hyAreaId)
      //   // 总量
      //   area.deviceTotal = areaDeviceStatus.reduce(
      //     (pre, next) => +pre + +next['count'],
      //     0
      //   )
      //   // hyState ===1为正常设备。
      //   area.alarmNum = areaDeviceStatus.reduce((pre, next) => {
      //     if (next['hyState'] === 1) return pre
      //     else return +pre + +next['count']
      //   }, 0)
      // }
      let hyOrgIds = []
      data.forEach(item => {
        item.alarmNum = 0
        item.deviceTotal = 0
        hyOrgIds.push(item.hyAreaId)
      })

      const NumData = await this.selectDeviceNumByOrgId(hyOrgIds)
      console.log(NumData)

      if (NumData.length > 0) {
        // data.forEach(item => {
        //   const idx = NumData.findIndex(v => v.hyOrgid === item.hyAreaId)
        //   if (idx !== -1) {
        //     item.deviceTotal += Number(NumData[idx].count)
        //     if (NumData[idx].hyState !== 1) {
        //       item.alarmNum += Number(NumData[idx].count)
        //     }
        //   }
        // })
        data.forEach(item => {
          NumData.forEach(v => {
            if (v.hyOrgid === item.hyAreaId) {
              item.deviceTotal += Number(v.count)
              if (v.hyState !== 1) {
                item.alarmNum += Number(v.count)
              }
            }
          })
        })
      }
      console.log(data)
      this.areaList = data
      // let totalCount = 0; let alramCount = 0
      // NumData.forEach(item => {
      //   totalCount += item.count
      //   if (item.hyState !== 1) {
      //     alramCount += item.count
      //   }
      // })
      // return
      // area.alarmNum = NumData.reduce((pre, next) => {
      //   if (next['hyState'] === 1) return pre
      //   else return +pre + +next['count']
      // }, 0)

      if (data[0]['alarmNum'] === 0 && data[0]['deviceTotal'] === 0) {
        this.progressStyle.percentage = 100
      } else if (data[0]['alarmNum'] === data[0]['deviceTotal']) {
        this.progressStyle.percentage = 0
      } else {
        this.progressStyle.percentage = +((1 - (data[0]['alarmNum'] / data[0]['deviceTotal'])) * 100).toFixed(2)
      }
      this.$store.commit('ring/SET_AREA_ID', data[0]['hyAreaId'])
      await this.findHyitDevType()
    },
    async selectDeviceNumByOrgId(hyOrgids) {
      let { data, code } = await request({
        url: api.powerEnv.selectDeviceNumByOrgId,
        data: { hyOrgIds: this.$tool.uniqueArray(hyOrgids).toString() }
      })
      if (code === 1) return data
    },
    async findDeviceNumAndState(hyOrgid) {
      let { data, code } = await request({
        url: api.powerEnv.findDeviceNumAndState,
        data: { hyOrgid, limit: -1 }
      })
      if (code === 1) return data
    },
    async init() {},
    async onClick(item, index) {
      console.log(item)
      this.current = index
      if (item['alarmNum'] === 0 && item['deviceTotal'] === 0) {
        this.progressStyle.percentage = 100
      } else if (item['alarmNum'] === item['deviceTotal']) {
        this.progressStyle.percentage = 0
      } else {
        this.progressStyle.percentage = +((1 - (item['alarmNum'] / item['deviceTotal'])) * 100).toFixed(2)
      }
      this.$store.commit('ring/SET_AREA_ID', item['hyAreaId'])
      this.componentName = 'Device'
      await this.findHyitDevType()
    },
    async inspectionDongHuanone() {
      this.loading = true
      let { model } = await request({
        url: api.powerEnv.inspectionDongHuan,
        data: {
          areaId: this.$store.state.ring.areaId
        }
      })
      this.loading = false
      this.$message.success('巡检完成')
      this.$store.commit('ring/SET_REPORTID', model.reportId)
      this.componentName = 'Polling'
    },
    goAndSetLanmu(val) {
      console.log(val)
      console.log(232323232332)
    }
  }
}
</script>

<style lang="scss">
.ring-device {
  height: 100%;
}
.ring-device-right {
  box-sizing: border-box;
}
.full-left-header-right-icon {
  width: 40px;
  text-align: center;
  cursor: pointer;
}
.list-wrapper {
  height: 100%;
  width: 300px;
  overflow: hidden;
  overflow-y: auto;
  background-color: #f5f5f5;
  border-width: 1px 0 1px 1px;
  border-style: solid;
  border-color: #eee;
  .list {
  }
  .list,
  .list-item {
    padding: 0;
    margin: 0;
  }
  .list-item {
    width: 100%;
    list-style: none;
    display: flex;
    align-items: center;
    padding: 0 20px;
    height: 50px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    &:hover {
      background: #fff;
    }
    &.active {
      background: #fff;
      color: #000;
    }
  }
}
.device-list {
  padding-left: 50px;
  padding-right: 20px;
  box-sizing: border-box;
  color: #666;
  overflow: hidden;
  &.active {
    color: #0145ab;
  }
  .list-item-name {
    font-size: 14px;
    flex: 1;
  }
  .list-item-state {
    font-size: 14px;
    flex-shrink: 0;
    width: 42px;
    height: 24px;
    border-radius: 12px;
  }
}
.full-left-header-right-icon {
  width: 40px;
  text-align: center;
  cursor: pointer;
}
.list-wrapper {
  height: 100%;
  width: 300px;
  overflow: hidden;
  overflow-y: auto;
  background-color:rgba(245,245,245,.8);
  border-width: 1px 0 1px 1px;
  border-style: solid;
  border-color: #eee;
  .list {
  }
  .list,
  .list-item {
    padding: 0;
    margin: 0;
  }
  .list-item {
    width: 100%;
    list-style: none;
    display: flex;
    align-items: center;
    padding: 0 20px;
    height: 40px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    &:hover {
      background: #fff;
    }
    &.active {
      background: #fff;
      color: #000;
    }
    .area-sidebar-list-item-alarmnum {
          min-width: 22px;
          height: 22px;
          padding: 6px;
          background: #fe4d4e;
          border-radius: 11px;
          font-size: 14px;
          font-weight: 500;
          color: #ffffff;
          margin-left: 6px;
        }
  }
}
.device-list {
  padding-left: 50px;
  padding-right: 20px;
  box-sizing: border-box;
  color: #666;
  overflow: hidden;
  &.active {
    color: #0145ab;
  }
  .list-item-name {
    font-size: 14px;
    flex: 1;
  }
  .list-item-state {
    font-size: 14px;
    flex-shrink: 0;
    width: 42px;
    height: 24px;
    border-radius: 12px;
  }
}
.ring-alarm {
  background-color: #f5f5f5;
  height: 100%;
  overflow: auto;
}
.alarm-echart {
  background-color: #fff;
  margin-bottom: 15px;
  padding: 20px;
  box-sizing: border-box;
  height: 330px;
  width: 100%;
  position: relative;
  .alarm-select {
    position: absolute;
    right: 20px;
    top: 20px;
  }
}
.area-sidebar {
  flex: 0 0 240px;
  height: 100%;
  background: #e5ecf6;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .sidebar-status {
    width: 220px;
    height: 280px;
    position: relative;
    margin: 30px auto 0;
    .status-text {
      position: absolute;
      left: 50%;
      top: 40%;
      transform: translate(-50%, -80%);
      text-align: center;
      .status-text-progress {
        font-size: 32px;
        font-weight: 500;
        color: #00b285;
        //line-height: 102px;
      }
      .status-text-status {
        font-size: 12px;
        color: #999999;
        //line-height: 0px;
      }
    }
    .polling-btn {
      width: 150px;
      background-color: var(--success);
    }
  }
  .area-sidebar-list {
    //margin-top: 30px;
    flex: 1;
    overflow: hidden;
    overflow-y: auto;
    .area-sidebar-list-box {
      .area-sidebar-list-item {
        height: 48px;
        line-height: 48px;
        padding: 0 14px;
        font-size: 16px;
        &.active,
        &:hover {
          background: #cedbee;
          cursor: pointer;
        }
        .area-sidebar-list-item-alarmnum {
          min-width: 22px;
          height: 22px;
          padding: 6px;
          background: #fe4d4e;
          border-radius: 11px;
          font-size: 14px;
          font-weight: 500;
          color: #ffffff;
          margin-left: 6px;
        }
      }
    }
  }
}
.ring {
  div::-webkit-scrollbar {
    display: none;
  }
}
.ring {
  height: 100%;
  color: #333;
  user-select: none;
  --success: #00b285;
  --error: #fe4d4e;
  --offline: #333;
  .ring-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    .box-tabs {
      height: 40px;
      background: #ffffff;
      font-size: 16px;
      padding: 0 20px;
      .polling-btn {
        flex: 1;
        text-align: right;
        .el-button {
          border: 1px solid #0145ab;
          color: #0145ab;
          padding: 0 15px;
          line-height: 30px;
          height: 30px;
        }
      }
      .tabs-item {
        margin: 0 40px;
        height: 100%;
        padding: 0 10px;
        line-height: 40px;
        position: relative;
        cursor: pointer;
        &.active:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          width: 100%;
          background: #0145ab;
        }
      }
    }
    .box-container {
      margin: 10px;
      flex: 1;
      background-color: #fff;
      overflow: hidden;
    }
  }
  .powerEnv-pollingList {
    background-color: #F5F5F5;
    height: 100%;
    overflow-y: auto;
  }
}
.alarm-table {
  .el-form-item {
    margin-bottom: 15px;
  }
}
</style>
