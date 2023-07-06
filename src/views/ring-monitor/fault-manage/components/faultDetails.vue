<template>
  <div>
    <div class="drawer-alarm-dialog">
      <div ref="leftRegion" class="left-region">
        <div class="alarm-info">
          <div class="alarm-info-content flexBox align-item-center">
            <el-tag effect="dark" :color="setLevelTagColor(getDetail.alevel)">{{ setLevelTagName(getDetail.alevel) }}</el-tag>
            <div class="alarm-info-title overflow-text-a">
              {{ getDetail.description }}
            </div>
            <div :style="{ color: setAlarmStatusColor(getDetail.status) }" class="float-word">
              {{ setAlarmStatus(getDetail.status) }}
            </div>
          </div>
          <div class="alarm-info-desc">{{ getDetail.description }}</div>
        </div>
        <div class="alarm-mation">
          <div class="mation-item">
            <div class="mation-object">
              <div class="left-object">对象：</div>
              <div class="right-object">
                <el-link type="primary" @click="handlerToItMonitorDevice(getDetail)">{{ getDetail.hyMarkName }}</el-link>
              </div>
            </div>
            <div class="mation-object">
              <div class="left-object">IP：</div>
              <div class="right-object">
                {{ getDetail.ip }}
              </div>
            </div>
          </div>
          <div class="mation-item">
            <div class="mation-object">
              <div class="left-object">告警时间：</div>
              <div class="right-object">
                {{ setFormatMsgTime(getDetail.clock) }}
              </div>
            </div>
            <div class="mation-object">
              <div class="left-object">持续时间：</div>
              <div class="right-object">
                <div class="val">{{ getDetail.trailTime }}</div>
              </div>
            </div>
          </div>
          <div class="mation-item">
            <div class="mation-object">
              <div class="left-object">对象标识：</div>
              <div class="right-object">
                <div class="val ">{{ esightAlarm.length > 0 ? esightAlarm[0].moi : '' }}</div>
              </div>
            </div>
            <div class="mation-object">
              <div class="left-object">可能原因：</div>
              <div class="right-object">
                <div class="val ">{{ esightAlarm.length > 0 ? esightAlarm[0].probableCause : '' }}</div>
              </div>
            </div>
          </div>
          <div class="mation-item">
            <div class="mation-object">
              <div class="left-object">是否为变更设备：</div>
              <div class="right-object">
                <div class="val " :style="{'color':changeShow ? 'green' : 'red'}">{{ changeShow ? '是' : '否' }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="switch-box">
          <div class="box-w">
            <div class="switch-title">
              <div v-permission="['DealLog']" class="records pointer" :style="{ 'background-color' : (showSwitch === 1 ? '#fff' : ' rgb(242,242,242)')}" @click="showSwitch = 1">处理记录</div>
              <div v-permission="['SameAlarm']" class="fault pointer" :style="{ 'background-color' : (showSwitch === 2 ? '#fff' : ' rgb(242,242,242)')}" @click="showSwitch = 2">历史告警</div>
              <!-- <div v-permission="['PortInfo']" class="information pointer" :style="{ 'background-color' : (showSwitch === 3 ? '#fff' : ' rgb(242,242,242)')}" @click="showSwitch = 3">端口信息</div> -->
              <div v-permission="['Know']" class="knowledge pointer" :style="{ 'background-color' : (showSwitch === 4 ? '#fff' : ' rgb(242,242,242)')}" @click="showSwitch = 4">相关知识</div>
              <div v-permission="['DeviceChange']" class="knowledge pointer" :style="{ 'background-color' : (showSwitch === 5 ? '#fff' : ' rgb(242,242,242)')}" @click="showSwitch = 5">设备变更</div>
              <!-- <div v-permission="['WiringTable']" class="knowledge pointer" :style="{ 'background-color' : (showSwitch === 6 ? '#fff' : ' rgb(242,242,242)')}" @click="showSwitch = 6">布线表</div> -->
            </div>
          </div>
          <div class="show-box" @scroll="handleScroll($event)">
            <!-- 处理记录 -->
            <div v-show="showSwitch === 1" v-permission="['DealLog']" class="records-info">
              <el-timeline v-if="alarmChangeLog.length > 0" class="no-padding margin-top-15">
                <el-timeline-item
                  v-for="(activity, index) in alarmChangeLog"
                  :key="index"
                  :timestamp="activity.createTime"
                >
                  {{ activity.alarmHandleLog }} {{ activity.backup ? `${`备注：${activity.backup}`}` : '' }}
                </el-timeline-item>
              </el-timeline>
              <el-empty v-else description="暂无数据" />
            </div>
            <!-- 历史告警 -->
            <div v-show="showSwitch === 2" v-permission="['SameAlarm']" class="fault-info">
              <template v-if="sameFault.length > 0">
                <div v-for="item in sameFault" :key="item.id">
                  <div class="fault-box">
                    <div class="fault-title line-height">
                      <div class="title-a overflow-text-a"><span :style="{ color: setAlarmStatusColor(getDetail.status) }">{ {{ setAlarmStatus(getDetail.status) }} }</span>  {{ getDetail.description }}</div>
                      <div class="title-b overflow-text-a">{{ setFormatMsgTime(item.clock) }}</div>
                    </div>
                  </div>
                </div>
              </template>
              <el-empty v-else description="暂无数据" />
            </div>
            <!-- 端口信息 -->
            <!-- <div v-show="showSwitch === 3" v-permission="['PortInfo']" class="information-info" style="{ width: 100% }">
              <DetailedInformation v-if="showPortComponent" :device="portDevice" :show-back="false" />
              <el-empty v-else description="暂无数据" />
            </div> -->
            <!-- 相关知识 -->
            <div v-show="showSwitch === 4" v-permission="['Know']" class="knowledge-info">
              <RelevantKnowledge :item="getDetail" />
            </div>
            <!-- 设备变更 -->
            <div v-show="showSwitch === 5" v-permission="['DeviceChange']" class="knowledge-info">
              <EquipmentChange v-if="changeShow" :item="getDetail" @setShow="setShow" />
              <el-empty v-else description="暂无数据" />
            </div>
            <!-- 布线表 -->
            <!-- <div v-show="showSwitch === 6" v-permission="['WiringTable']" class="wiring-list">
              <WiringTable :item="getDetail" />
            </div> -->
          </div>
        </div>
      </div>
      <!-- 处理信息 -->
      <div class="right-region">
        <div class="information">处理信息</div>
        <div class="info-box">
          <div class="row flexBox align-item-center t-top">
            <div class="lbl">故障类型</div>
            <el-select v-model.trim="modelData.alarmType" placeholder="请选择故障类型" clearable class="filter-item val" style="width: 200px">
              <el-option
                v-for="item in faultType"
                :key="item.catId"
                :label="item.catName"
                :value="item.catId"
              />
            </el-select>
          </div>
          <div class="row flexBox align-item-center m-top">
            <div class="lbl">影响范围</div>
            <div class="val degrees-box">
              <el-input v-model.trim="modelData.coverage" type="textarea" :autosize="{ minRows: 2, maxRows: 3}" placeholder="请输入影响范围" />
            </div>
          </div>
          <div class="row flexBox align-item-center m-top">
            <div class="lbl">原因说明</div>
            <div class="val degrees-box">
              <el-input v-model.trim="modelData.causeDescription" type="textarea" :autosize="{ minRows: 2, maxRows: 3}" placeholder="请输入原因说明" />
            </div>
          </div>
          <div class="row flexBox align-item-center m-top">
            <div class="lbl">处理进度</div>
            <div class="val degrees-box">
              <el-input v-model.trim="modelData.progress" placeholder="请输入处理进度" />
            </div>
          </div>
          <div class="flexBox align-item-center m-top">
            <div class="lbl">备注</div>
            <div class="val degrees-box">
              <el-input v-model.trim="closeAlarmLogBackup" type="textarea" :autosize="{ minRows: 2, maxRows: 3}" placeholder="请输入备注" />
            </div>
          </div>
          <div class="flexBox align-item-center m-top">
            <div class="lbl">沉淀</div>
            <div class="val degrees-box">
              <el-checkbox v-model="checked">保存到运维智库</el-checkbox>
            </div>
          </div>
        </div>
        <div class="button-b fault-detail-btns">
          <div v-if="getDetail.status !== 1">
            <el-row>
              <el-button v-if="!getDetail.isLock" v-permission="['OnLock']" size="mini" type="primary" @click="handleLock(getDetail)">接单</el-button>
              <el-button v-permission="['ConfirmClose']" :disabled="!getDetail.isLock" size="mini" type="primary" @click="handleConfirmClose(getDetail)">确认保存</el-button>
              <el-button v-if="!getDetail.isProblem" v-permission="['SubmitMatters']" :disabled="!getDetail.isLock" size="mini" type="primary" @click="submitApproval(getDetail)">升级为事项</el-button>
              <el-button v-if="getDetail.isProblem" v-permission="['SubmitMatters']" :disabled="!getDetail.isLock" size="mini" type="primary" @click="seeApproval(getDetail)">查看事项</el-button>
              <el-button
                v-permission="['CloseMatters']"
                v-clipboard:copy="copyData"
                v-clipboard:success="copyAddress"
                v-clipboard:error="copyAddressError"
                :disabled="!getDetail.isLock"
                size="mini"
                type="primary"
                @click="omCopy(getDetail)"
              >复制播报</el-button>
              <el-button v-if="getDetail.eventStatus || !getDetail.isProblem" v-permission="['CloseMatters']" :disabled="!getDetail.isLock" size="mini" type="danger" @click="handleClose(getDetail)">故障关闭</el-button>
              <el-button v-if="!getDetail.eventStatus && getDetail.isProblem" v-permission="['CloseMatters']" :disabled="!getDetail.isLock" size="mini" type="info" @click="handleGrayClose(getDetail)">故障关闭</el-button>
              <el-button v-permission="['MaskingAlarmPush']" :disabled="!getDetail.isLock" size="mini" type="primary" @click="handleMaskingAlarmPush(getDetail)">屏蔽告警推送</el-button>
            </el-row>
          </div>
          <div v-if="getDetail.status === 1" class="footer">
            <el-row>
              <el-button
                v-permission="['CloseMatters']"
                v-clipboard:copy="copyData"
                v-clipboard:success="copyAddress"
                v-clipboard:error="copyAddressError"
                size="mini"
                type="primary"
                @click="omCopy(getDetail)"
              >复制播报</el-button>
            </el-row>
          </div>
        </div>
      </div>
    </div>
    <MaskingAlarmPushDialog ref="maskingAlarmPushDialog" />
  </div>
</template>
<script>

// import DetailedInformation from '@/views/port-manage/component/detailed-information'
import EquipmentChange from '@/views/it-monitor/fault-manage/components/equipmentChange'
import RelevantKnowledge from '@/views/it-monitor/fault-manage/components/relevantKnowledge'
// import WiringTable from '@/views/it-monitor/fault-manage/components/wiringTable'
import MaskingAlarmPushDialog from '@/views/it-monitor/fault-manage/components/maskingAlarmPushDialog'

export default {
  components: {
    EquipmentChange, RelevantKnowledge, MaskingAlarmPushDialog
  },
  props: {
    model: {
      type: Object,
      default() {
        return { }
      }
    },
    levelData: {
      type: Array,
      default() {
        return []
      }
    },
    loginUser: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      drawer: false,
      stateCatData: [
        { label: '待处理', value: 0, color: 'red' },
        { label: '已处理', value: 1, color: 'green' },
        { label: '自动恢复', value: 3, color: 'grey' },
        { label: '处理中', value: 4, color: 'grey' }
      ],
      faultType: [],

      esightAlarm: [],
      leftRegionWidth: 0,
      modelData: {
        alarmType: null,
        coverage: '',
        causeDescription: '',
        progress: ''
      },
      loading: false,
      closeAlarmLogBackup: '',
      copyData: '复制的数据',
      checked: false,
      showSwitch: 1,
      alarmChangeLog: [],
      sameFault: [],
      showPortComponent: false,
      portDevice: null,
      changeShow: false,
      form: {
        company: '',
        name: '',
        tel: '',
        changeType: '',
        changeAddress: '',
        changeStartTime: '',
        changeEndTime: '',
        room: '',
        netAddress: '',
        deviceAddress: '',
        deviceType: '',
        changeContent: '',
        deviceName: '',
        deviceIp: '',
        influenceDeviceName: '',
        influenceDeviceIp: '',
        influence: '',
        backup: ''
      },
      // 点击告警详情按钮
      severityType: 3,
      effectType: 3,
      urgencyType: 3,
      logState: [
        { id: 1, value: '创建' },
        { id: 2, value: '指派' },
        { id: 3, value: '领取' },
        { id: 4, value: '解锁' },
        { id: 5, value: '关闭' },
        { id: 6, value: '确认事项，待主管审核' },
        { id: 7, value: '安排工程师处理 , 待主管审批' },
        { id: 8, value: '无法处理' },
        { id: 9, value: '完成计划' },
        { id: 10, value: '处理成功,关闭事项' },
        { id: 11, value: '正在处理中' },
        { id: 12, value: '处理失败,关闭事项'},
        { id: 13, value: '不通过该事项,关闭事项'},
        { id: 14, value: '驳回申请,待运维主管审核中'}
      ],
      getDetail: {}
    }
  },
  computed: {
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
        const levelIdx = that.levelData.findIndex(item => Number(item.level || item.dictdataValue) === Number(level) && item.level || item.dictdataValue !== '')
        if (levelIdx !== -1) {
          return that.levelData[levelIdx].name || that.levelData[levelIdx].dictdataName
        }
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
    setAlarmStatus() {
      const that = this
      return function(level) {
        const levelIdx = that.stateCatData.findIndex(item => item.value === level)
        if (levelIdx !== -1) {
          return that.stateCatData[levelIdx].label
        }
      }
    },
    setFormatMsgTime() {
      return function(t) {
        const date = new Date(t * 1000)
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds() > 10 ? date.getSeconds() : '0' + date.getSeconds()}`
      }
    },
    getLogsValueByState() {
      return function(status) {
        const filter = this.logState.filter(item => item.id === status)
        return filter[0].value
      }
    }
  },
  created() {
    this.getDetail = this.$tool.deepCopy(this.model)
    this.handleCheck(this.getDetail)
  },
  methods: {
    // 查看告警
    async handleCheck(data) {
      let item = { ...data }
      console.log(item)
      this.showSwitch = 1
      this.alarmChangeLog = []
      this.sameFault = []
      Object.keys(this.form).forEach(item => {
        this.$set(this.form, `${item}`, '')
      })
      this.changeShow = false
      const getProblem = await this.findOpsOrderProblem(item.id)
      if (getProblem.length > 0) {
        this.$set(this.getDetail, 'isProblem', true)
        if (Number(getProblem[0].statue) === 7) {
          this.$set(this.getDetail, 'eventStatus', true)// 事项处理状态
        }
        this.$set(this.getDetail, 'matterId', getProblem[0].id)
        this.$set(this.getDetail, 'severityType', getProblem[0].severityType)
        this.$set(this.getDetail, 'effectType', getProblem[0].effectType)
        this.$set(this.getDetail, 'urgencyType', getProblem[0].urgencyType)
      }
      if (!item.isProblem) {
        this.severityType = 3
        this.effectType = 3
        this.urgencyType = 3
      } else {
        this.severityType = item.severityType
        this.effectType = item.effectType
        this.urgencyType = item.urgencyType
      }
      this.checked = false

      this.count = 10
      this.closeAlarmLogBackup = ''
      this.faultType = await this.findSysCat()
      this.modelData.alarmType = item.alarmType
      this.modelData.coverage = item.coverage
      this.modelData.causeDescription = item.causeDescription
      this.modelData.progress = item.progress
      if (item.rclock !== 0) {
        let continuedTime = this.$tool.sToYMDS(item.rclock - item.clock)
        this.$set(this.getDetail, 'trailTime', continuedTime)
      } else {
        let timestamp = Date.parse(new Date()) / 1000
        let continuedTime = this.$tool.sToYMDS(timestamp - item.clock)
        this.$set(this.getDetail, 'trailTime', continuedTime)
      }
      // 处理记录
      this.getProblemID = await this.findOpsOrderProblem(item.id)
      // 相同故障
      console.log(item)

      this.sameFault = await this.findZbxAlarmLogSameType(item)
      // 设备变更
      this.findEsightChange(item)
      // 故障这边的记录
      const alarmChangeLogData = await this.commonRequestFn.findOpsOrderAlarmLog({
        alarmId: this.getDetail.id,
        alarmModelType: 1,
        limit: -1
      })
      console.log(alarmChangeLogData)

      if (this.getProblemID.length < 1) {
        this.alarmChangeLog = alarmChangeLogData.reverse()
      } else {
        let form = { page: -1, limit: -1 }
        const logData = await this.findNewOaApproveLog(this.getProblemID[0].id)
        // 新建和提交的时间一样，故先对状态排一次序
        logData.sort((a, b) => {
          return a.approveStatue - b.approveStatue
        })
        // 拼接logData
        logData.forEach(item => {
          const logD = {}
          logD.alarmHandleLog = item.approveLog
          logD.createTime = item.approveTime
          alarmChangeLogData.push(logD)
        })
        // 拼接事项记录
        const { code: probloemCode, data: problemLogs } = await this.$request({ url: this.api.opm.findOpsOrderProblemLog, data: form })
        if (probloemCode !== 1) {
          this.$message({ type: 'error', message: '获取事项记录失败' })
        } else {
          if (problemLogs.length !== 0) {
            // 根据事项ID过滤出来的事项数组
            const filterLogs = problemLogs.filter(item => +item.orderId === +this.getProblemID[0].id)
            // 处理拼凑后的数组
            filterLogs.forEach(async item => {
              const { data, code } = await this.$request({ url: this.api.sys.findSysUser, data: { ids: [item.userId, item.receiveId], limit: -1, companyId: this.$auth.getUserSession().companyId } })
              if (code === 1) {
                let userName
                let receiveName
                let alarmHandleLog
                let createTime
                data.forEach(item2 => {
                  if (+item2.userId === +item.userId) {
                    userName = item2.realName
                  }
                  if (+item2.userId === +item.receiveId) {
                    receiveName = item2.realName
                  }
                })
                createTime = item.createTime
                alarmHandleLog = `${userName} ${this.getLogsValueByState(item.status)} ${receiveName || ''}`
                alarmChangeLogData.push({ alarmHandleLog, createTime })
                const alarmChangeLogList = alarmChangeLogData.sort((a, b) => {
                  return this.$tool.getTimeF(a.createTime) - this.$tool.getTimeF(b.createTime)
                })
                this.alarmChangeLog = alarmChangeLogList
                console.log(this.alarmChangeLog)
              }
            })
          }
        }
      }
      await this.findEsightAlarm(item.id)

      const findPortDeviceQuery = { limit: -1 }
      if (item.zhostId === 0) {
        findPortDeviceQuery.hostid = item.hostId
      } else {
        findPortDeviceQuery.zhostid = item.zhostId
      }
      // 查询端口设备
      this.$request({ url: this.api.port.findPortDevice, data: findPortDeviceQuery}).then(res => {
        if (res.code === 1) {
          if (res.data.length > 0) {
            this.showPortComponent = true
            this.portDevice = res.data[0]
          } else {
            this.showPortComponent = false
          }
        }
      })
      // this.$nextTick(() => {
      //   this.leftRegionWidth = this.$refs.leftRegion.clientWidth
      //   console.log(this.leftRegionWidth)
      // })
    },
    // 查询请假日志
    async findNewOaApproveLog(approveIds) {
      const { code, data } = await this.$request({
        url: this.api.approveLog.findNewOaApproveLog,
        data: { approveIds, approveType: this.$defineData.projectActivityProcessDefine('matter', 'key', 'id'), page: 1, limit: -1 }
      })
      if (code !== 1) return
      return data
    },
    // 变更设备
    findEsightChange(row) {
      this.$request({
        url: this.api.itMonitor.findEsightChange,
        data: { limit: -1, ip: row.ip }
      }).then(res => {
        if (res.code === 1) {
          if (res.data.length > 0) {
            const form = {}
            Object.keys(this.form).forEach(key => {
              form[key] = res.data[0][key]
            })
            this.form = form
            this.changeShow = true
          }
        }
      })
    },

    copyAddress(e) {
      this.$message.success('复制成功')
    },
    copyAddressError(e) {
      this.$message.error('复制失败')
    },
    findEsightAlarm(zbxAlarmId) {
      this.$request({
        url: this.api.itMonitor.findEsightAlarm,
        data: { zbxAlarmId }
      }).then(res => {
        if (res.code === 1 && res.data && res.data.length > 0) {
          this.esightAlarm = res.data
        } else {
          this.esightAlarm = []
        }
      })
    },
    // 点击告警设备名称跳转到it监控设备详情
    async handlerToItMonitorDevice(row) {
      console.log(row)
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
    // 弹窗相同故障触底加载
    async handleScroll(e) {
      let el = e.target
      // 判断是否到达div容器底部
      if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
        this.count = this.count + 10
        this.sameFault = await this.findZbxAlarmLogSameType(this.getDetail)
      }
    },
    // 获取同类型告警数据
    async findZbxAlarmLogSameType(val) {
      // const time1 = Date.parse(new Date()) / 1000
      // const query = val.sameTypeLastTime && val.sameTypeLastTime > 0 ? { keyword: val.description, hostid: val.hostId, page: 1, limit: this.count, startCLock: val.clock, endClock: val.sameTypeLastTime, agents: this.agentsIds } : { keyword: val.description, hostid: val.hostId, page: 1, limit: this.count, startCLock: val.clock, endClock: time1, agents: this.agentsIds }
      const time1 = (Date.parse(new Date()) - (86400000 * 30)) / 1000
      const query = { keyword: val.description, hostid: val.hostId, page: 1, limit: this.count, startCLock: time1, endClock: val.clock, agents: this.agentsIds }
      if (val.sameType) query.sameType = val.sameType
      const res = await this.$request({
        url: this.api.itMonitor.findZbxAlarmLog,
        data: query
      })
      if (res.code !== 1) return
      return res.data
    },
    setShow(res) {
      this.changeShow = res
    },

    // 复制播报
    omCopy(row) {
      this.setCopyData(row)
    },
    // 设置一键复制的内容
    setCopyData(item) {
      const date = new Date()
      const a = date.getFullYear()
      const b = (date.getMonth() + 1) < 10 ? `0${(date.getMonth() + 1)}` : date.getMonth() + 1
      const c = date.getDate()
      this.copyData = `【告警处理播报】-${a}${b}${c}-${item.hyMarkName} (${item.ip})
【告警标题】${item.description}
【故障/告警预警时间】${this.setFormatMsgTime(item.clock)}
【影响范围评估】${this.esightAlarm.length > 0 ? this.esightAlarm[0].moi === null ? '' : this.esightAlarm[0].moi : ''}
【处理人员】电信侧
【简要原因】${this.esightAlarm.length > 0 ? this.esightAlarm[0].probableCause === null ? '' : this.esightAlarm[0].probableCause : ''}
【预计恢复时间】
【修复进度】${this.modelData.progress ? this.modelData.progress : ''}`
    },
    // 确认告警
    handleConfirmClose() {
      this.$request({
        url: '/admin/updateZbxAlarmLog',
        data: { id: this.getDetail.id, status: '4', ...this.modelData }
      }).then(async res => {
        if (res.code === 1) {
          await this.commonRequestFn.insertOpsOrderAlarmLog({
            alarmId: this.getDetail.id,
            alarmModelType: 1,
            alarmHandleLog: `${this.loginUser.realName}保存了告警
            ${this.modelData.coverage ? `影响范围：${this.modelData.coverage}` : ''}
            ${this.modelData.causeDescription ? `原因说明：${this.modelData.causeDescription}` : ''}
            ${this.modelData.progress ? `处理进度：${this.modelData.progress}` : ''}
            ${this.checked ? `${this.loginUser.realName}保存到运维智库` : ''}`,
            userId: this.loginUser.userId,
            backup: this.closeAlarmLogBackup
          })
          this.$notify({
            title: '成功',
            message: '保存成功',
            type: 'success',
            duration: 2000
          })
          if (this.checked) {
            const getKnowType = await this.getKnowType()
            const knowData = {
              hyKnowName: `${this.getDetail.description} ${this.$tool.dateFormat('YYYY-mm-dd HH:MM:SS', new Date())}`,
              hyKeyword: '',
              hyKtxt: `
影响范围：${this.modelData.coverage}
原因说明：${this.modelData.causeDescription}
处理进度：${this.modelData.progress}
备注：${this.closeAlarmLogBackup}
                `,
              hyTitleImageUrl: '',
              knowRemark: '',
              hyStatus: 1
            }
            if (getKnowType && getKnowType.length > 0) {
              knowData.hyKtId = getKnowType[0].catId
              this.addHyitKnow(knowData)
            } else {
              const insertKnowType = await this.insertKnowType({
                systemName: 'kbms',
                classify: 'kbms_know_type',
                catName: '故障告警',
                parentId: 0,
                catDesc: ''
              })
              if (insertKnowType.code === 1) {
                knowData.hyKtId = insertKnowType.model.catId
                this.addHyitKnow(knowData)
              }
            }
          }
          this.$emit('emitFindAssetsAlarm')
        } else {
          this.$message.error('保存失败，请重试')
        }
      })
    },
    async insertKnowType() {
      return await this.$request({
        url: this.api.sys.insertSysCat,
        data: {
          systemName: 'kbms',
          classify: 'kbms_know_type',
          catName: '故障告警'
        }
      })
    },
    // 保存到知识库
    async addHyitKnow(data) {
      const { code, model } = await this.$request({
        url: this.api.knowledge.addHyitKnow,
        data
      })
      if (code !== 1) return
      await this.insertZbxAlarmLogKnow({
        logId: this.getDetail.id,
        knowId: model.hyKnowId
      })
    },
    // 插入告警和知识点关联
    insertZbxAlarmLogKnow(data) {
      this.$request({
        url: this.api.itMonitor.insertZbxAlarmLogKnow,
        data
      })
    },
    async getKnowType(catName) {
      const { code, data } = await this.$request({
        url: this.api.sys.findSysCat,
        data: {
          systemName: 'kbms',
          classify: 'kbms_know_type',
          catName: '故障告警'
        }
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
    // 关闭告警
    confirmCloseDialog() {
      // 单个关闭
      this.$request({
        url: '/admin/updateZbxAlarmLog',
        data: { id: this.getDetail.id, status: '1', ...this.modelData }
      }).then(async res => {
        await this.commonRequestFn.insertOpsOrderAlarmLog({
          alarmId: this.getDetail.id,
          alarmModelType: 1,
          alarmHandleLog: `${this.loginUser.realName}关闭了告警
            ${this.modelData.coverage ? `影响范围：${this.modelData.coverage}` : ''}
            ${this.modelData.causeDescription ? `原因说明：${this.modelData.causeDescription}` : ''}
            ${this.modelData.progress ? `处理进度：${this.modelData.progress}` : ''}`,
          userId: this.loginUser.userId,
          backup: this.closeAlarmLogBackup
        })
        if (this.getDetail.eventid !== '') {
          await this.$request({
            url: this.api.itMonitor.agentUpdateProblem,
            data: { agent: this.getDetail.agent, eventid: this.getDetail.eventid }
          })
        }

        this.$notify({
          title: '成功',
          message: '关闭成功',
          type: 'success',
          duration: 2000
        })

        this.$emit('emitFindAssetsAlarm')
      })
    },
    // 点击提交事项
    submitApproval(item) {
      this.$confirm('确认提交当前告警转运维吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$router.push({
          name: 'matterApplication',
          query: {
            alarmId: this.getDetail.id,
            alarmModelType: 1,
            severityType: this.severityType,
            effectType: this.effectType,
            urgencyType: this.urgencyType
          }
        })
        this.localStorageOperation('set', 'fault', JSON.stringify(this.getDetail))
        item.alarmStateCatName = '已转运维工程师处理'
        this.drawer = false
      })
    },
    // 查看事项
    seeApproval(model) {
      this.$router.push({ name: 'matterDetail', query: { id: model.matterId, alarmId: model.id } })
    },
    // 查询告警的事项
    async findOpsOrderProblem(alarmIds) {
      const { code, data } = await this.$request({
        url: this.api.opm.findOpsOrderProblem,
        data: { alarmIds, alarmModelType: 1 }
      })
      if (code !== 1) return
      return data
    },
    // 获取故障类型
    async findSysCat() {
      let { code, data } = await this.$request({
        url: this.api.sys.findSysCat,
        data: {
          page: 1,
          limit: -1,
          systemName: 'userDefine',
          classify: 'userDefine_故障类型',
          parentId: -1,
          module: 2
        }
      })
      if (code !== 1) return
      return data
    },
    async handleLock(data) {
      this.$confirm('是否接单？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const updateZbxAlarmLog = await this.$request({
          url: this.api.itMonitor.updateZbxAlarmLog,
          data: { id: data.id, isLock: 1, status: 4 }
        })
        if (updateZbxAlarmLog.code !== 1) return

        const { code, model } = await this.$request({
          url: this.api.itMonitor.getZbxAlarmLog,
          data: { id: data.id }
        })

        this.$emit('emitFindAssetsAlarm')
        if (code === 1) {
          this.getDetail = model
        }
      })
    },
    handleMaskingAlarmPush(item) {
      this.$refs.maskingAlarmPushDialog.open(item)
    }
  }
}
</script>

<style lang="scss" scoped>
.drawer-alarm-dialog {
  overflow:hidden;
  .left-region {
    float: left;
    width: 65%;
    border-right: 1px solid rgb(215,215,215);
    .alarm-info {
      margin-right: 20px;
      border-bottom: 1px solid rgb(215,215,215);
    .alarm-info-content {
      .alarm-info-title {
        font-size: 20px;
        color: #333333;
        padding: 6px;
        width: 85%;
      }
      .float-word {
        float: right;
        right: 0;
        width: 60px;
      }
    }
    .alarm-info-desc {
      font-size: 14px;
      padding: 5px 0 10px 0;
      line-height: 24px;
    }
  }
  .alarm-mation {
    margin: 10px 0;
    .mation-item {
      .mation-object {
        display: inline-block;
        width: 50%;
        margin: 5px 0;
        .left-object {
          width: 25%;
          display: inline-block;
          vertical-align:top;
          line-height: 25px;
        }
        .right-object {
          padding-right: 10px;
          width: 75%;
          display: inline-block;
          vertical-align:top;
          line-height: 25px;
        }
      }
    }
    .left-mation {
      flex: 1;
      .mation-object {
        margin: 18px 20px 18px 10px;
        display: flex;
        justify-content:space-between;
        line-height: 20px;
      }

    }
    .right-mation {
      flex: 1;
      .mation-object {
        margin: 15px 20px;
        display: flex;
        justify-content:space-between;
        line-height: 20px;
      }
    }
  }
  .switch-box {
    .box-w {
      border-bottom: 1px solid rgb(170,170,170);
      margin-right: 20px;
    }
    .switch-title {
      width: 65%;
      display: flex;
      .records {
        background-color: #fff;
      }
      div {
        flex: 1;
        height: 35px;
        border-top: 1px solid rgb(170,170,170);
        border-right: 1px solid rgb(170,170,170);
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgb(242,242,242);
      }
      .records {
        border-left: 1px solid rgb(170,170,170);
      }
    }
    .show-box {
      height: 450px;
      overflow-x: hidden;
			overflow-y: auto;
    }
    .fault-box::-webkit-scrollbar{
				display: none;
    }
    .fault-box {
      margin-right: 20px;
      overflow-x: hidden;
			overflow-y: auto;
      border-bottom: 1px solid rgb(215,215,215);
      .line-height {
        height: 50px;
        line-height: 40px;
      }
      .fault-title {
        padding-top: 5px;
        display: flex;
        .title-a {
          flex: 3;
        }
        .title-b {
          flex: 1;
        }
      }
      .margin-b {
        margin-bottom: 15px;
      }
    }
  }
  }
  .right-region {
    float: right;
    width: 35%;
    .information {
      padding: 10px 0;
      margin-left: 20px;
      font-size: 15px;
      font-weight: bold;
      border-bottom: 1px solid rgb(215,215,215);
      margin-bottom: 10px;
    }
    .info-box {
      margin-left: 20px;
    }
    .button-b {
      margin-left: 20px;

    }
  }
}
.t-top {
  padding: 10px 0;
  font-size: 14px;
  color: #999999;
  .lbl {
        width: 15%;
  }
  .val {
        width: 75%;
        color:#000000;
  }
}
.m-top {
  padding: 10px 0;
  font-size: 14px;
  color: #999999;
  height: 80px;
  .lbl {
        width: 15%;
      }
      .val {
        width: 75%;
        color:#000000;
        el-input {
        height: 150px;
        }
      }
}
</style>
