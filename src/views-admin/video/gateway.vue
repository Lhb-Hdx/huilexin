<template>
  <div class="gateway">
    <div class="table-content">
      <tsb-list-switch :button-data="gatewayList" :button-width="200">
        <div v-for="item in gatewayList" :key="item.id" class="tab-item pointer" :class="gatewayId === item.id ? 'active' : ''" @click="handlerGateway(item.id)">
          <div class="flexBox align-item-center space-between">
            <div class="gateway-name overflow-text-a">{{ item.name }}</div>
            <div class="gateway-status" :class="item.status ? 'success' : 'danger'">{{ item.status ? '在线' : '离线' }}</div>
          </div>
          <div class="gateway-ip overflow-text-a">{{ item.ip }}</div>
        </div>
      </tsb-list-switch>
      <div class="table-content-main flexBox">
        <div ref="mainLeft" class="main-left">
          <div class="disk-select flexBox align-item-center">
            <div class="label">存储磁盘：</div>
            <el-select v-model="activeVideoDisk" class="width-100 no-select-border" @change="changeGatewayDisk">
              <el-option
                v-for="item in videoDiskList"
                :key="item.disId"
                :label="item.name"
                :value="item.disId"
              >
                <div class="disk-content">
                  <div class="disk-content-item">{{ item.name }}</div>
                  <el-progress :text-inside="true" :percentage="100" status="success" class="no-progress-bar-innerText" />
                  <div class="disk-content-item">{{ item.totalDiskSize }}{{ item.unit }} / {{ setUseDiskSize(item.totalDiskSize - item.freeDiskSize) }}{{ item.unit }}</div>
                </div>
              </el-option>
            </el-select>
          </div>
          <div ref="diskEchart" :style="{'width': mainLeftWidth + 'px', 'height': mainLeftWidth + 'px'}" />
          <div class="disk-situation">共{{ activeVideoDiskList.totalDiskSize }}{{ activeVideoDiskList.unit }} / 已用{{ setUseDiskSize(activeVideoDiskList.totalDiskSize - activeVideoDiskList.freeDiskSize) }}{{ activeVideoDiskList.freeUnit }}</div>
        </div>
        <div class="main-right">
          <div class="app-container">
            <div class="filter-container no-padding">
              <el-input v-model="findVideoChnByGidQuery.title" v-permission="['SearchStrategyDevice']" size="mini" placeholder="请输入设备名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="findVideoChn" />
              <el-input v-model="findVideoChnByGidQuery.ip" v-permission="['SearchStrategyDevice']" size="mini" placeholder="请输入IP" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="findVideoChn" />
              <el-select v-model="findVideoChnByGidQuery.devTypeId" v-permission="['SearchStrategyDevice']" size="mini" clearable placeholder="请选择设备类型" class="filter-item">
                <el-option label="所有类型" value="" />
                <el-option
                  v-for="item in typeArr"
                  :key="item.hyDevTypeId"
                  :label="item.hyDevTypeName"
                  :value="item.hyDevTypeId"
                />
              </el-select>
              <el-select v-model="findVideoChnByGidQuery.orgId" v-permission="['SearchStrategyDevice']" size="mini" clearable placeholder="请选择区域" class="filter-item">
                <el-option label="所有区域" value="" />
                <el-option
                  v-for="item in areaArr"
                  :key="item.hyAreaId"
                  :label="item.hyAreaName"
                  :value="item.hyAreaId"
                />
              </el-select>
              <el-button v-permission="['SearchStrategyDevice']" size="mini" class="filter-item" type="primary" icon="el-icon-search" @click="findVideoChnByGid">查询</el-button>
              <el-button v-if="getGatewayClientType(gatewayId) !== 4" v-permission="['AddStrategyDevice']" size="mini" class="filter-item" type="primary" @click="openAddDeviceDialog">新增</el-button>
              <el-button v-if="getGatewayClientType(gatewayId) !== 4" v-permission="['StrategyManage']" size="mini" class="filter-item" type="primary" @click="openStrategyDialog">策略管理</el-button>
              <el-dropdown v-if="getGatewayClientType(gatewayId) !== 4" v-permission="['BatchAction']" size="mini" type="primary" split-button class="filter-item" @command="handlerBatch">
                批量操作
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-permission="['BatchSelectStrategy']" command="batchSelectPlan">批量选择策略</el-dropdown-item>
                  <el-dropdown-item v-permission="['BatchCancelStrategy']" command="batchDeleteDevice">批量删除</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <ListControl :check-list="checkList" @setLists="setLists" />
            </div>
            <div class="table-wrapper">
              <el-table ref="authDeviceTable" :data="videoChnListByGid" style="width: 100%" @selection-change="handleSelectionDevice">
                <el-table-column type="selection" width="55" />
                <el-table-column type="index" label="NO" width="50" />
                <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="设备名称" width="" show-overflow-tooltip>
                  <template slot-scope="{row}">
                    {{ setTableField(row.dvrId, 'chnDvrListByGid', 'title') }}
                  </template>
                </el-table-column>
                <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="right" label="设备IP" show-overflow-tooltip>
                  <template slot-scope="{row}">
                    {{ setTableField(row.dvrId, 'chnDvrListByGid', 'ip') }}
                  </template>
                </el-table-column>
                <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="left" label="通道" show-overflow-tooltip>
                  <template slot-scope="{row}">
                    {{ row.cname }}
                  </template>
                </el-table-column>
                <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="left" label="所在区域" width="200" show-overflow-tooltip>
                  <template slot-scope="{row}">
                    {{ setArea(row.orgId) }}
                  </template>
                </el-table-column>
                <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="left" label="状态" width="200">
                  <template slot-scope="{row}">
                    <div :class="row.status === 1 ? 'success' : 'danger'">
                      <i :class="row.status === 1 ? 'el-icon-success' : 'el-icon-error'" />
                      {{ row.status === 1 ? '在线' : '离线' }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="left" label="存储策略" width="200">
                  <template slot-scope="{row}">
                    <el-select v-model="row.planId" v-permission="['DeviceSelectStrategy']" size="mini" placeholder="选择存储策略" clearable @visible-change="changeChnStrategy($event, row)" @change="onChangeItem" @clear="clearChnStrategy(row)">
                      <el-option
                        v-for="item in videoPlanList"
                        :key="item.planId"
                        :label="item.planName"
                        :value="item.planId"
                      />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="" align="left" width="50" class-name="small-padding fixed-width">
                  <template slot-scope="{row}">
                    <div v-permission="['CancelStrategy']" class="pointer" @click="delBind(row)">
                      <i class="el-icon-close" />
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <pagination v-show="videoChnListByGidTotal>0" :auto-scroll="false" :total="videoChnListByGidTotal" :page.sync="findVideoChnByGidQuery.page" :limit.sync="findVideoChnByGidQuery.limit" @pagination="findVideoChnByGid" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog title="新增设备" :visible.sync="showAddDeviceDialog" width="60%" top="5vh">
      <div class="dialog-body">
        <div class="table-wrapper">
          <el-table ref="authDeviceTable" :data="videoChnList" style="width: 100%" @selection-change="handleSelectionNewDevice">
            <el-table-column type="selection" width="55" />
            <el-table-column type="index" label="NO" width="50" />
            <el-table-column label="设备名称" width="">
              <template slot-scope="{row}">
                {{ setTableField(row.dvrId, 'chnDvrList', 'title') }}
              </template>
            </el-table-column>
            <el-table-column label="设备IP">
              <template slot-scope="{row}">
                {{ setTableField(row.dvrId, 'chnDvrList', 'ip') }}
              </template>
            </el-table-column>
            <el-table-column label="通道">
              <template slot-scope="{row}">
                <span>{{ row.cname }}</span>
              </template>
            </el-table-column>
            <el-table-column label="所在区域" width="200">
              <template slot-scope="{row}">
                {{ setArea(row.orgId) }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="200">
              <template slot-scope="{row}">
                <div :class="row.status === 1 ? 'success' : 'danger'">
                  <i :class="row.status === 1 ? 'el-icon-success' : 'el-icon-error'" />
                  {{ row.status === 1 ? '在线' : '离线' }}
                </div>
              </template>
            </el-table-column>
          </el-table>
          <pagination v-show="videoChnListTotal>0" :auto-scroll="false" :total="videoChnListTotal" :page.sync="findVideoChnQuery.page" :limit.sync="findVideoChnQuery.limit" @pagination="findVideoChnList" />
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddDeviceDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="addDeviceByGateway">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="策略管理" :visible.sync="showStrategyDialog" width="60%" top="5vh">
      <div class="dialog-body">
        <div class="plan-content flexBox">
          <div class="plan-left-list">
            <div class="list-main">
              <div v-for="item in videoPlanList" :key="item.planId" class="list-item pointer flexBox align-item-center space-between" :class="activeVideoPlan === item.planId ? 'active' : ''" @click="handlerPlanListItem(item)">
                <div class="overflow-text-a">{{ item.planName }}</div>
                <i v-permission="['DeleteStrategy']" class="el-icon-delete pointer" @click="deleteStrategy(item)" />
              </div>
            </div>
            <div v-permission="['AddStrategy']" class="add-plan pointer" @click="newAddStrategy">添加策略</div>
          </div>
          <div class="plan-right-form">
            <el-form ref="videoPlanForm" :model="videoPlanForm" :rules="videoPlanFormRules">
              <el-form-item label="存储计划名称" label-width="140px" prop="planName">
                <el-input v-model="videoPlanForm.planName" placeholder="请输入存储计划名称" autocomplete="off" style="width: 60%;" />
              </el-form-item>
              <el-form-item label="码流类型" label-width="140px" prop="flow">
                <el-select v-model="videoPlanForm.flow" placeholder="请选择码流类型">
                  <el-option
                    v-for="item in mltypeArr"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    style="width: 60%;"
                  />
                </el-select>
              </el-form-item>
              <!-- <el-form-item label="循环录像" label-width="140px" prop="cycle">
              <el-select v-model="videoPlanForm.cycle" placeholder="请选择是否循环录像">
                <el-option
                  v-for="item in cycleArr"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  style="width: 60%;"
                />
              </el-select>
            </el-form-item> -->
              <el-form-item label="时间段" label-width="140px" prop="tid">
                <el-select v-model="videoPlanForm.tid" placeholder="请选择时间段" @change="changeTimePlan">
                  <el-option
                    v-for="item in timeList"
                    :key="item.hyTid"
                    :label="item.hyTname"
                    :value="item.hyTid"
                    style="width: 60%;"
                  />
                </el-select>
              </el-form-item>
              <div ref="timePlanList" class="time-plan-list">
                <div v-for="item in timePlanDetail" :key="item.value" class="plan-list-item flexBox align-item-center">
                  <div class="label">{{ item.label }}</div>
                  <div class="label-block">
                    <div v-for="(items, index) in item.list" :key="index" class="block-item" :style="{'left': items.left + 'px', width: items.width + 'px'}" />
                  </div>
                </div>
              </div>
            </el-form>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showStrategyDialog = false">取 消</el-button>
        <el-button v-permission="['SubmitStrategy']" class="filter-item" type="primary" @click="comfirmStrategy">保 存</el-button>
      </div>
    </el-dialog>
    <el-dialog title="选择存储策略" :visible.sync="showBatchStrategyDialog" width="40%" top="5vh">
      <div class="dialog-body">
        <el-form ref="batchStrategyForm" :model="batchStrategyForm" :rules="batchStrategyFormRules">
          <el-form-item label="存储策略" label-width="140px" prop="planId">
            <el-select v-model="batchStrategyForm.planId" placeholder="请选择存储策略" class="width-100">
              <el-option
                v-for="item in videoPlanList"
                :key="item.planId"
                :label="item.planName"
                :value="item.planId"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showBatchStrategyDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="batchActionChnStrategy">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import * as echarts from 'echarts'
import Pagination from '@/components/Pagination'
import TsbListSwitch from './components/tab-list-switch'
import store from '@/store'
import ListControl from '@/components/ListControl'

export default {
  components: { Pagination, TsbListSwitch, ListControl },
  data() {
    return {
      // 显示控制数据 start
      checkList: ['设备名称', '设备IP', '通道', '所在区域', '状态', '存储策略'],
      lists: [],
      // 显示控制数据 end
      findVideoGatewayQuery: { // 存储网关列表查询参数
        page: 1,
        limit: -1
      },
      gatewayList: [],
      gatewayId: '',
      videoDiskList: [],
      activeVideoDisk: '',
      activeVideoDiskId: '',
      activeVideoDiskList: [], // 当前网关的磁盘
      // 网关绑定的通道
      videoChnListByGid: [],
      videoChnListByGidTotal: 0,
      // 所有通道
      videoChnList: [],
      videoChnListTotal: 0,
      // 网关绑定dvr
      chnDvrListByGid: [],
      // 所有dvr
      chnDvrList: [],
      // 网关绑定的通道
      findVideoChnByGidQuery: {
        title: '',
        ip: '',
        devTypeId: '',
        orgId: '',
        page: 1,
        limit: 10
      },
      // 所有通道
      findVideoChnQuery: {
        gid: 0,
        title: '',
        ip: '',
        devTypeId: '',
        orgId: '',
        page: 1,
        limit: 10
      },
      mainLeftWidth: 0,
      typeArr: [],
      areaArr: [],
      showAddDeviceDialog: false, // 是否显示绑定视频通道弹窗
      bindVideoChnIds: [], // 选择的视频通道
      videoPlanList: [],
      showStrategyDialog: false,
      activeVideoPlan: '',
      videoPlanForm: {
        planName: '',
        planType: 1,
        flow: 1,
        ssId: 0,
        cycle: 1,
        cidDvrids: '',
        tid: '',
        times: 60
      },
      videoPlanFormRules: {
        planName: [
          { required: true, message: '请输入存储计划名称', trigger: 'blur' }
        ],
        flow: [
          { required: true, message: '请选择流类型', trigger: 'blur' }
        ],
        cycle: [
          { required: true, message: '请选择是否循环录像', trigger: 'blur' }
        ],
        tid: [
          { required: true, message: '请选择时间段', trigger: 'blur' }
        ]
      },
      mltypeArr: [
        {
          value: 1,
          label: '主码流'
        },
        {
          value: 2,
          label: '子码流'
        },
        {
          value: 3,
          label: '第三流'
        }
      ],
      planTypeArr: [
        {
          label: '录像',
          value: 1
        },
        {
          label: '抓图',
          value: 2
        }
      ],
      cycleArr: [
        {
          value: 0,
          label: '不循环'
        },
        {
          value: 1,
          label: '循环'
        }
      ],
      timeList: [],
      timePlanDetail: [
        {
          label: '星期一',
          value: 1,
          list: []
        },
        {
          label: '星期二',
          value: 2,
          list: []
        },
        {
          label: '星期三',
          value: 3,
          list: []
        },
        {
          label: '星期四',
          value: 4,
          list: []
        },
        {
          label: '星期五',
          value: 5,
          list: []
        },
        {
          label: '星期六',
          value: 6,
          list: []
        },
        {
          label: '星期日',
          value: 7,
          list: []
        }
      ],
      onChangeChnStrategyItem: false,
      pageBatchDevice: [],
      showBatchStrategyDialog: false,
      batchStrategyForm: {
        planId: ''
      },
      batchStrategyFormRules: {
        planId: [
          { required: true, message: '请选择存储策略', trigger: 'blur' }
        ]
      },
      batchAddDeviceChnIds: [],
      batchAddDeviceDvrIds: [],
      batchUpStrategy: [],
      routerRoles: []
    }
  },
  computed: {
    navTitle() {
      return this.$route.meta.title
    },
    setUseDiskSize() {
      return function(size) {
        const numberSize = Number(size)
        return numberSize.toFixed(2)
      }
    },
    // 设置表格字段内容
    setTableField() {
      return function(dvrId, dataName, field) {
        const data = dataName === 'chnDvrListByGid' ? this.chnDvrListByGid : this.chnDvrList
        const idx = data.findIndex(item => item.dvrId === dvrId)
        if (idx !== -1) {
          return data[idx][`${field}`]
        }
      }
    },
    // 区域
    setArea() {
      const that = this
      return function(orgId) {
        const idx = that.areaArr.findIndex(item => item.hyAreaId === orgId)
        if (idx !== -1) {
          return that.areaArr[idx].hyAreaName
        }
      }
    },
    // 匹配网关clientType
    getGatewayClientType() {
      return function(id) {
        const idx = this.gatewayList.findIndex(item => item.id === id)
        if (idx !== -1) {
          return this.gatewayList[idx].clientType
        }
      }
    }
  },
  mounted() {
    this.findVideoGateway()
    this.getTypeArr()
    this.getAreaArr()
    this.findVideoPlan()
    this.mainLeftWidth = this.$refs.mainLeft.clientWidth - 40
    this.routerRoles = store.getters && store.getters.roles
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 获取时间模板
    getFindHyitTime() {
      request({
        url: api.video.findHyitTime,
        data: {}
      })
        .then(res => {
          if (res.code === 1) {
            this.timeList = res.data
            this.findHyitTimeDetail(this.videoPlanList[0].tid)
          }
        })
    },
    // 获取类型select
    getTypeArr() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'video_dev_type', limit: -1 }
      })
        .then(res => {
          if (res.code === 1) {
            for (var i = 0; i < res.data.length; i++) {
              res.data[i].hyDevTypeId = res.data[i].id
              res.data[i].hyDevTypeName = res.data[i].dictdataName
            }
            this.typeArr = res.data
          }
        })
    },
    // 获取区域
    getAreaArr() {
      request({ url: api.area.findHyitArea, data: {isVideo: 1}}).then(res => {
        if (res.code === 1) {
          this.areaArr = res.data
        }
      })
    },
    // 获取存储网关
    findVideoGateway() {
      request({
        url: api.video.findVideoGateway,
        data: this.findVideoGatewayQuery
      }).then(res => {
        if (res.code === 1) {
          this.gatewayList = res.data
          if (res.data.length > 0) {
            this.gatewayId = res.data[0].id
            this.findVideoChnByGid()
            if (this.routerRoles.indexOf('SelectDisk') !== -1) this.findVideoDisk()
          }
        }
      })
    },
    // 根据网关获取通道
    findVideoChnByGid() {
      this.findVideoChn(this.findVideoChnByGidQuery).then(res => {
        this.videoChnListByGid = res.data
        this.videoChnListByGidTotal = Number(res.count)
        if (res.data.length > 0) {
          const dvrIds = []
          res.data.forEach(item => {
            dvrIds.push(item.dvrId)
          })
          this.findVideoDvr(dvrIds).then(res => {
            this.chnDvrListByGid = res
          })
          const chnIds = []
          res.data.forEach(item => {
            chnIds.push(item.cid)
          })
          this.findVideoPlanChn(chnIds).then(videoPlanChnRes => {
            if (videoPlanChnRes.data) {
              this.videoChnListByGid.forEach((item, index) => {
                const idx = videoPlanChnRes.data.findIndex(items => items.cid === item.cid)
                this.$set(this.videoChnListByGid[index], 'planId', idx !== -1 ? videoPlanChnRes.data[idx].planId : '')
                this.$set(this.videoChnListByGid[index], 'bindPlanChnId', idx !== -1 ? videoPlanChnRes.data[idx].id : '')
              })
            }
          })
        }
      })
    },
    // 获取通道的存储策略
    async findVideoPlanChn(channelIds) {
      return await request({
        url: api.video.findVideoPlanChn,
        data: {
          channelIds: channelIds.toString(),
          limit: -1
        }
      }).then(res => {
        if (res.code === 1) {
          return res
        }
      })
    },
    // 获取通道列表
    findVideoChnList() {
      this.findVideoChn(this.findVideoChnQuery).then(res => {
        this.videoChnList = res.data
        this.videoChnListTotal = Number(res.count)
        if (res.data.length > 0) {
          const ids = []
          res.data.forEach(item => {
            ids.push(item.dvrId)
          })
          this.findVideoDvr(ids).then(res => {
            this.chnDvrList = res
          })
        }
      })
    },
    // 获取通道
    async findVideoChn(findQuery) {
      return await request({
        url: api.video.findVideoChn,
        data: { gid: this.gatewayId, ...findQuery }
      })
        .then(res => {
          if (res.code === 1) {
            return res
          }
        })
    },
    // 获取通道dvr
    async findVideoDvr(ids) {
      return await request({
        url: api.video.findVideoDvr,
        data: { ids: ids.toString(), limit: -1 }
      })
        .then(res => {
          if (res.code === 1) {
            return res.data
          }
        })
    },
    // 查询存储网关的磁盘
    findVideoDisk() {
      request({
        url: api.video.findVideoDisk,
        data: { gid: this.gatewayId, page: 1, limit: -1 }
      })
        .then(res => {
          if (res.code === 1) {
            this.videoDiskList = res.data
            if (res.map) {
              this.activeVideoDiskId = res.map.disIds[0].id
              const disId = res.map.disIds[0].disId
              const idx = res.data.findIndex(item => item.disId === disId)
              if (idx !== -1) {
                this.activeVideoDisk = res.data[idx].disId
                this.activeVideoDiskList = res.data[idx]
                this.createDiskEchart()
              }
            }
          }
        })
    },
    // 创建磁盘使用情况echart
    createDiskEchart() {
      const self = this
      const myChart = echarts.init(self.$refs.diskEchart)
      const option = {
        series: [
          {
            type: 'pie',
            radius: '65%',
            itemStyle: {
              normal: {
                label: {
                  show: false // 隐藏标示文字
                },
                labelLine: {
                  show: false // 隐藏标示线
                }
              }
            },
            data: [
              { value: Number(self.activeVideoDiskList.totalDiskSize) - Number(self.activeVideoDiskList.freeDiskSize), name: '已使用' },
              { value: self.activeVideoDiskList.freeDiskSize, name: '剩余' }
            ]
          }
        ]
      }
      myChart.setOption(option, true)
    },
    // 选择网关
    handlerGateway(id) {
      this.gatewayId = id
      this.findVideoChnByGid()
      this.findVideoDisk()
    },
    // 打开新增设备弹窗
    openAddDeviceDialog() {
      this.showAddDeviceDialog = true
      this.$set(this.findVideoChnQuery, 'page', 1)
      this.findVideoChnList()
    },
    // 选择网关设备
    handleSelectionDevice(val) {
      this.pageBatchDevice = val
    },
    // 批量操作
    handlerBatch(name) {
      if (name === 'batchSelectPlan') {
        this.batchAddDeviceChnIds = []
        this.batchAddDeviceDvrIds = []
        this.batchUpStrategy = []
        // 批量新增
        const addChnIds = [] // 添加的通道
        const addDvrIds = [] // 添加的dvr
        // 批量编辑
        const upIds = [] // 策略id
        this.pageBatchDevice.forEach(item => {
          if (item.bindPlanChnId && item.bindPlanChnId !== '') {
            upIds.push(item.bindPlanChnId)
          } else {
            addChnIds.push(item.cid)
            addDvrIds.push(item.dvrId)
          }
        })
        this.batchAddDeviceChnIds = addChnIds
        this.batchAddDeviceDvrIds = addDvrIds
        this.batchUpStrategy = upIds
        if (this.pageBatchDevice.length === 0) {
          this.$message('请选择设备')
          return
        }
        this.showBatchStrategyDialog = true
        setTimeout(() => {
          this.$refs['batchStrategyForm'].resetFields()
        }, 100)
      } else if (name === 'batchDeleteDevice') {
        this.onBatchDevice()
      }
    },
    // 批量删除网关设备
    onBatchDevice() {
      if (this.pageBatchDevice.length === 0) {
        this.$message('请选择设备')
        return
      }
      this.$confirm('确认删除选择的设备吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const cids = []
        this.pageBatchDevice.forEach(item => {
          cids.push(item.cid)
        })
        this.updateVideoChn({
          cid: 0,
          gid: 0,
          ids: cids.toString()
        })
        this.deleteVideoPlanChnByChannelIds(cids.toString())
      }).catch(() => {})
    },
    // 表格选择框选择设备
    handleSelectionNewDevice(val) {
      if (val.length > 0) {
        const ids = []
        val.forEach(item => {
          ids.push(item.cid)
        })
        this.bindVideoChnIds = ids
      } else {
        this.bindVideoChnIds = []
      }
    },
    // 点击确认新增设备
    addDeviceByGateway() {
      if (this.bindVideoChnIds.length === 0) return this.$message('请选择设备')
      this.updateVideoChn({
        cid: 0,
        gid: this.gatewayId,
        ids: this.bindVideoChnIds.toString()
      })
    },
    // 点击删除绑定
    delBind(val) {
      this.$confirm('确认取消吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.updateVideoChn({
          cid: 0,
          gid: 0,
          ids: val.cid
        })
        this.deleteVideoPlanChnByChannelId(val.cid)
      }).catch(() => {})
    },
    onChangeItem() {
      this.onChangeChnStrategyItem = true
    },
    // 选择通道策略
    changeChnStrategy(el, val) {
      if (!el && this.onChangeChnStrategyItem) {
        const apiName = val.bindPlanChnId && val.bindPlanChnId !== '' ? api.video.updateVideoPlanChn : api.video.addVideoPlanChn
        const data = val.bindPlanChnId !== '' ? {
          id: val.bindPlanChnId,
          planId: val.planId,
          dvrId: val.dvrId,
          cid: val.cid
        } : {
          planId: val.planId,
          dvrId: val.dvrId,
          cid: val.cid
        }
        this.changeVideoPlanChn(apiName, data)
      }
    },
    // 清除通道策略
    clearChnStrategy(val) {
      if (val.bindPlanChnId !== '') {
        request({
          url: api.video.deleteVideoPlanChn,
          data: {
            id: val.bindPlanChnId
          }
        })
          .then(res => {
            if (res.code === 1) {
              this.findVideoChnByGid()
              this.$message({
                message: res.msg,
                type: 'success'
              })
            }
          })
      }
    },
    // 更新视频通道
    updateVideoChn(data) {
      request({
        url: api.video.updateVideoChn,
        data
      })
        .then(res => {
          if (res.code === 1) {
            this.showAddDeviceDialog = false
            this.findVideoChnByGid()
            this.$message({
              message: res.msg,
              type: 'success'
            })
          }
        })
    },
    // 更新通道策略
    changeVideoPlanChn(url, data) {
      request({
        url, data
      })
        .then(res => {
          if (res.code === 1) {
            this.findVideoChnByGid()
            this.$message({
              message: res.msg,
              type: 'success'
            })
          }
        })
    },
    // 获取存储策略列表
    findVideoPlan(isDeletePlan) {
      request({
        url: api.video.findVideoPlan,
        data: {
          page: 1,
          limit: -1
        }
      })
        .then(res => {
          if (res.code === 1) {
            this.videoPlanList = res.data
            if (res.data.length > 0) {
              this.activeVideoPlan = res.data[0].planId
              if (isDeletePlan) this.findHyitTimeDetail(res.data[0].tid)
              Object.keys(this.videoPlanForm).forEach(key => {
                this.$set(this.videoPlanForm, `${key}`, res.data[0][`${key}`])
              })
            }
          }
        })
    },
    // 选择网关磁盘
    changeGatewayDisk() {
      const apiName = this.activeVideoDiskId !== '' ? api.video.updateVideoGatewayDiskNew : api.video.addVideoGatewayDisk
      const data = this.activeVideoDiskId !== '' ? {
        id: this.activeVideoDiskId,
        gId: this.gatewayId,
        disId: this.activeVideoDisk
      } : {
        id: 0,
        gId: this.gatewayId,
        disId: this.activeVideoDisk
      }
      this.bindVideoGatewayDisk(apiName, data)
    },
    // 绑定网关磁盘
    bindVideoGatewayDisk(url, data) {
      request({
        url, data
      })
        .then(res => {
          if (res.code === 1) {
            this.findVideoDisk()
            this.$message({
              message: res.msg,
              type: 'success'
            })
          }
        })
    },
    // 打开存储策略弹窗
    openStrategyDialog() {
      this.showStrategyDialog = true
      this.getFindHyitTime()
    },
    // 点击添加策略
    newAddStrategy() {
      Object.keys(this.videoPlanForm).forEach(key => {
        if (key !== 'planType') {
          this.$set(this.videoPlanForm, `${key}`, '')
        } else {
          this.$set(this.videoPlanForm, `${key}`, 1)
        }
      })
      this.activeVideoPlan = ''
      this.clearTimeDetail()
    },
    // 提交策略
    comfirmStrategy() {
      this.$refs.videoPlanForm.validate(valid => {
        if (valid) {
          const apiName = this.activeVideoPlan !== '' ? api.video.updateVideoPlan : api.video.addVideoPlan
          const data = this.activeVideoPlan !== '' ? {
            planId: this.activeVideoPlan,
            ...this.videoPlanForm
          } : this.videoPlanForm
          request({
            url: apiName,
            data
          })
            .then(res => {
              if (res.code === 1) {
                this.findVideoPlan()
                this.$message.success(res.msg)
              } else {
                this.$message.error(res.msg)
              }
            })
        }
      })
    },
    // 点击存储策略
    handlerPlanListItem(val) {
      this.findHyitTimeDetail(val.tid)
      this.activeVideoPlan = val.planId
      Object.keys(this.videoPlanForm).forEach(key => {
        this.$set(this.videoPlanForm, `${key}`, val[`${key}`])
      })
    },
    // 删除存储策略
    deleteStrategy(val) {
      this.$confirm('是否删除该存储策略？', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.video.deleteVideoPlan,
          data: { planId: val.planId }
        })
          .then(res => {
            if (res.code === 1) {
              this.findVideoPlan(true)
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            } else {
              this.$message.error(res.msg)
            }
          })
      }).catch(() => {})
    },
    // 选择时间模板
    changeTimePlan(val) {
      this.findHyitTimeDetail(val)
    },
    // 清除时间详情6
    clearTimeDetail() {
      this.timePlanDetail.forEach((item, index) => {
        this.$set(this.timePlanDetail[index], 'list', [])
      })
    },
    // 获取时间模板
    findHyitTimeDetail(tid) {
      this.clearTimeDetail()
      const sWidth = (this.$refs.timePlanList.clientWidth - (20 + 60)) / 86400
      request({ url: api.video.findHyitTimeDetail, data: { tid }}).then(res => {
        if (res.code === 1) {
          res.data.forEach(item => {
            item.startSecond = Number(item.hyTsHours * 3600) + Number(item.hyTsMin * 60)
            item.endSecond = Number(item.hyTeHours * 3600) + Number(item.hyTeMin * 60)
            item.left = item.startSecond * sWidth
            item.width = (item.endSecond - item.startSecond) * sWidth
            const idx = this.timePlanDetail.findIndex(items => items.value === item.hyWeek)
            if (idx !== -1) {
              this.$set(this.timePlanDetail[idx].list, this.timePlanDetail[idx].list.length, item)
            }
          })
        }
      })
    },
    // 批量选择通道策略
    batchActionChnStrategy() {
      this.$refs.batchStrategyForm.validate(valid => {
        if (valid) {
          if (this.batchAddDeviceChnIds.length > 0 && this.batchAddDeviceDvrIds.length > 0) {
            this.changeVideoPlanChn(api.video.addVideoPlanChn, {
              dvrId: 0,
              cid: 0,
              planId: this.batchStrategyForm.planId,
              dvrIds: this.batchAddDeviceDvrIds.toString(),
              channelIds: this.batchAddDeviceChnIds.toString()
            })
          }
          if (this.batchUpStrategy.length > 0) {
            this.changeVideoPlanChn(api.video.updateVideoPlanChn, {
              id: 0,
              ids: this.batchUpStrategy.toString(),
              planId: this.batchStrategyForm.planId
            })
          }
          this.showBatchStrategyDialog = false
        }
      })
    },
    // 删除网关后调用
    deleteVideoPlanChnByChannelId(channelId) {
      request({ url: api.video.deleteVideoPlanChnByChannelId, data: { channelId }})
    },
    // 批量删除网关后调用
    deleteVideoPlanChnByChannelIds(channelIds) {
      request({ url: api.video.deleteVideoPlanChnByChannelIds, data: { channelIds }})
    }
  }
}
</script>

<style lang='scss' scoped>
.gateway {
  padding: 20px;
  .header {
    .header-title {
      position: relative;
      font-size: 17px;
      &:before {
        content: "";
        width: 6px;
        height: 22px;
        position: absolute;
        background: rgb(78, 110, 242);
      }
      .header-title-content {
        padding-left: 14px;
      }
    }
  }
  .table-content {
    // margin-top: 20px;
    .tab-item {
      width: 200px;
      padding: 14px;
      margin-bottom: 4px;
      display: inline-block;
      .gateway-name {
        font-size: 14px;
        margin-bottom: 8px;
        font-weight: 600;
      }
      .gateway-status {
        margin-bottom: 8px;
        font-size: 14px;
      }
      .gateway-ip {
        font-size: 12px;
        color: #666666;
      }
    }
    .active {
      background: #fff;
    }
    .table-content-main {
      margin-top: 20px;
      background: #fff;
      .main-left {
        width: 20%;
        padding: 10px;
        .disk-select {
          .label {
            font-size: 14px;
            width: 100px;
          }
          .select-content {
            font-size: 16px;
            i {
              font-size: 14px;
              margin-left: 5px;
            }
          }
        }
        .disk-situation {
          font-size: 14px;
          text-align: center;
        }
      }
      .main-right {
        width: 80%;
      }
    }
  }
  .plan-content {
    .plan-left-list {
      width: 25%;
      background: #f0f0f0;
      .list-main {
        padding: 10px 0 10px 10px;
        height: 85%;
        overflow: auto;
        .list-item {
          padding: 10px;
        }
        .active {
          background: #ffffff;
        }
      }
      .add-plan {
        text-align: center;
        margin: 10px;
        padding: 10px;
      }
    }
    .plan-right-form {
      width: 75%;
      .time-plan-list {
        margin-left: 140px;
        width: calc(100% - 140px);
        background: #f5f7fa;
        padding: 4px 0;
        .plan-list-item {
          padding: 10px;
          .label {
            font-size: 14px;
            width: 60px;
          }
          .label-block {
            background: #e4e4e4;
            width: calc(100% - 60px);
            height: 20px;
            position: relative;
            .block-item {
              position: absolute;
              background: #0866e2;
              height: 20px;
            }
          }
        }
      }
    }
  }
}
</style>
