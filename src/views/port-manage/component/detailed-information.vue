<template>
  <div class="app-container">
    <div class="title-container">
      <div v-if="showBack">
        <!-- <el-page-header @back="back()" /> -->
        <el-page-header @back="goBack" />
      </div>
      <div>
        <div>
          <span class="title">{{ device.deviceName }}</span>
          <span>
            <el-tag :type="setHostStataTag(device)">
              {{ setHostStatus(device) }}
            </el-tag>
          </span>
        </div>
        <div class="ip">{{ device.ip }}</div>
      </div>
    </div>
    <div>
      <div class="view">
        <div class="view-box margin-b">端口视图</div>
        <div v-for="(cardItem,cardIndex) in imgList" :key="cardIndex" :class="imgList.length > 1 ? 'view-pic-0' : 'view-pic-50'">
          <div class="bk">{{ cardItem.cardNum }}</div>

          <div class="padding-5" :class="`${cardItem.sortType === 2 || cardItem.sortType === 3 ? 'view-img-wrap-reverse' : 'view-img-wrap'} ${cardItem.origin.length > 1 ? 'padding-5' : 'padding-15'}`">
            <div v-for="(item,index) in cardItem.origin" :key="index" class="img-box">
              <div class="mask-box" @mouseover="showMaskEvent(item)" @mouseout="downMaskEvent(item)" /> <!-- 蒙版 -->
              <div>
                <img v-if="item.linkDeviceName && item.portStatue === 2" class="monitor-icon" src="image/port/dk_a.png" alt="">
                <img v-if="item.linkDeviceName && item.portStatue === 1" class="monitor-icon" src="image/port/dk_b.png" alt="">
                <img v-if="!item.linkDeviceName " class="monitor-icon" src="image/port/dk_c.png" alt="">
              </div>
              <div v-show="showMaskData === item.id" class="showMask-box" @mouseover="showMaskEvent(item)" @mouseout="downMaskEvent(item)" /><!-- 弹框蒙版 -->
              <div v-if="showMaskData === item.id" class="mask">
                <div>端口索引：{{ item.portIndex }}</div>
                <div>端口名称：{{ item.portName }}</div>
                <div>
                  <span>可用：
                    <!-- <img v-if="item.portUsed === 1" class="monitor-icon" src="image/common/ico_lx.png" alt="">
                    <img v-else class="monitor-icon" src="image/common/ico_zx.png" alt=""> -->
                    <img v-if="item.portUsed === 2" class="monitor-icon" src="image/common/ico_bk.png" alt="">
                    <img v-if="item.portUsed === 1" class="monitor-icon" src="image/common/ico_lx.png" alt="">
                    <img v-if="item.portUsed === 0" class="monitor-icon" src="image/common/ico_zx.png" alt="">
                  </span>
                  <span>状态：{{ setStatue(item.portStatue) }}</span>
                </div>
                <div>连接设备名：{{ item.linkDeviceName }}</div>
                <div>IP地址：{{ item.linkDeviceIp }}</div>
                <div>连接端口：{{ item.linkPortNum }}</div>
              </div>
              <div v-show="showMaskData === item.id" class="buttonMask" @mouseover="showMaskEvent(item)">
                <a class="but" @click="Administration(item)">管理端口</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 端口列表 -->
      <div class="list">
        <div class="view-box marfin-t">端口列表</div>
        <div class="filter-container">
          <el-input v-model="form.keyword" placeholder="请输入名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter" />
          <el-select v-model="form.portDeviceCardId" placeholder="板卡" clearable class="filter-item" style="width: 200px">
            <el-option v-for="item in imgList" :key="item.portDeviceCardId" :label="item.cardNum" :value="item.portDeviceCardId" />
          </el-select>
          <el-button class="filter-item" type="primary" icon="el-icon-search" size="medium" @click="handleFilter">查询</el-button>
          <ExportExcel class="filter-item" :fillter-list="fillerList" :excel-title="ExcelTitle" :file-name="exportFileName" />
          <ListControl :check-list="checkList" :storage-val="storageVal" @setLists="setLists" />
        </div>
        <div class="table-wrapper">
          <el-table
            :data="list"
            fit
            border
            highlight-current-row
            style="width: 100%"
          >
            <el-table-column label="端口索引" show-overflow-tooltip align="center" width="80">
              <template slot-scope="{row}">
                {{ row.portIndex }}
              </template>
            </el-table-column>
            <!-- <el-table-column label="所属板卡" show-overflow-tooltip align="center" width="80">
              <template slot-scope="{row}">
                板卡 {{ row.catNumber }}
              </template>
            </el-table-column> -->
            <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="端口名称" show-overflow-tooltip align="center" width="200">
              <template slot-scope="{row}">
                {{ row.portName }}
              </template>
            </el-table-column>
            <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="端口号" show-overflow-tooltip align="center" width="200">
              <template slot-scope="{row}">
                {{ row.portNum }}
              </template>
            </el-table-column>
            <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="可用" show-overflow-tooltip align="center">
              <template slot-scope="{row}">
                <div class="icon-flex">
                  <img v-if="row.portUsed === 0" class="monitor-icon" src="image/common/ico_zx.png" alt="">
                  <img v-if="row.portUsed === 1" class="monitor-icon" src="image/common/ico_lx.png" alt="">
                  <img v-if="row.portUsed === 2" class="monitor-icon" src="image/common/ico_bk.png" alt="">
                  <!-- <img v-if="row.portUsed === 1" class="monitor-icon" src="image/common/ico_lx.png" alt="">
                  <img v-if="row.portUsed === 0" class="monitor-icon" src="image/common/ico_zx.png" alt=""> -->
                </div>
              </template>
            </el-table-column>
            <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="状态" show-overflow-tooltip align="center">
              <template slot-scope="{row}">
                <div :style="row.portStatue === 1 ? 'color:#3CA170' : 'color: #EB4C4C'">
                  {{ setStatue(row.portStatue) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="连接设备名" show-overflow-tooltip align="center" width="200">
              <template slot-scope="{row}">
                {{ row.linkDeviceName }}
              </template>
            </el-table-column>
            <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" label="连接端口号" show-overflow-tooltip align="center" width="200">
              <template slot-scope="{row}">
                {{ row.linkPortNum }}
              </template>
            </el-table-column>
            <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" label="IP地址" show-overflow-tooltip align="center" width="150">
              <template slot-scope="{row}">
                {{ row.linkDeviceIp }}
              </template>
            </el-table-column>
            <el-table-column v-if="lists.length > 0 ? lists[7].ispass : true" label="位置" show-overflow-tooltip align="center" width="200">
              <template slot-scope="{row}">
                {{ row.linkDeviceLocation }}
              </template>
            </el-table-column>
            <el-table-column v-if="lists.length > 0 ? lists[8].ispass : true" label="业务编码" show-overflow-tooltip align="center" width="200">
              <template slot-scope="{row}">
                {{ row.code }}
              </template>
            </el-table-column>
            <el-table-column v-if="lists.length > 0 ? lists[9].ispass : true" label="速率" show-overflow-tooltip align="center" width="200">
              <template slot-scope="{row}">
                {{ row.rate }}
              </template>
            </el-table-column>
            <el-table-column v-if="lists.length > 0 ? lists[10].ispass : true" label="用途" show-overflow-tooltip align="center" width="200">
              <template slot-scope="{row}">
                {{ row.purpose }}
              </template>
            </el-table-column>
            <el-table-column v-if="lists.length > 0 ? lists[11].ispass : true" label="备注" show-overflow-tooltip align="center" width="200">
              <template slot-scope="{row}">
                {{ row.backup }}
              </template>
            </el-table-column>
            <el-table-column v-if="lists.length > 0 ? lists[12].ispass : true" label="流量视图" show-overflow-tooltip align="center" width="80">
              <template slot-scope="{row}">
                <img src="image/common/ico_char.png" alt="" @click="openFlowEchart(row)">
              </template>
            </el-table-column>
            <el-table-column v-if="lists.length > 0 ? lists[13].ispass : true" label="操作" class-name="small-padding fixed-width" align="center">
              <template slot-scope="{row}">
                <el-button type="primary" size="mini" @click="Administration(row)">管理</el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination v-show="total > 0" :auto-scroll="false" :total="total" :page.sync="form.page" :limit.sync="form.limit" @pagination="handleFilter()" />
        </div>
      </div>
    </div>

    <!-- 流量视图 -->
    <UsedDetailDialog
      v-if="showUsedDetailDialog"
      :show-dialog="showUsedDetailDialog"
      :echart-params="detailParams"
      :table-params="tableParams"
      @closeUsedDetailDialog="closeUsedDetailDialog"
    />

    <!-- 端口信息配置 -->
    <el-dialog tit le="端口信息配置" append-to-body :visible.sync="showPortDialog" width="60%" top="5vh">
      <div class="dialog-body">
        <el-row :gutter="4">
          <el-form ref="port" :model="port" :rules="rules">
            <el-col :span="20" :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <div class="Indexes">端口索引：{{ portVal }}</div>
              <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <el-form-item label="端口名称" label-width="90px" prop="portName">
                  <el-input v-model="port.portName" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <el-form-item label="端口号" label-width="90px" prop="portNum">
                  <el-input v-model="port.portNum" />
                </el-form-item>
              </el-col>

              <el-col :xs="24" :sm="24" :md="24" :lg="9" :xl="9">
                <el-form-item label="连接设备名" label-width="90px">
                  <el-input v-model="port.linkDeviceName" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="3" :xl="3">
                <el-form-item label="" label-width="0px">
                  <el-button type="primary" @click="onClick()">选择设备</el-button>
                </el-form-item>
              </el-col>

              <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <el-form-item label="IP地址" label-width="90px">
                  <el-input v-model="port.linkDeviceIp" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <el-form-item label="设备端口号" label-width="90px">
                  <el-select v-if="linkDeviceLidt.length > 0" v-model="port.linkPortNum" clearable style="width:100%">
                    <el-option
                      v-for="(item,index) in linkDeviceLidt"
                      :key="index"
                      :label="item.id"
                      :value="item.value"
                    />
                  </el-select>
                  <el-input v-else v-model="port.linkPortNum" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <el-form-item label="设备所在" label-width="90px">
                  <el-input v-model="port.linkDeviceLocation" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <el-form-item label="业务编码" label-width="90px">
                  <el-input v-model="port.code" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <el-form-item label="速率" label-width="90px">
                  <el-input v-model="port.rate" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <el-form-item label="用途" label-width="90px">
                  <el-input v-model="port.purpose" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <el-form-item label="备注" label-width="90px">
                  <el-input v-model="port.backup" type="textarea" />
                </el-form-item>
              </el-col>
            </el-col>
          </el-form>
        </el-row>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button :loading="loading" class="filter-item" type="primary" @click="confirm">保 存</el-button>
      </div>
    </el-dialog>
    <!-- 选择网络设备 -->
    <el-dialog title="选择设备" :visible.sync="showEquipmentDialog" width="60%" top="5vh">
      <div class="filter-container">
        <el-select v-model="findHyitHostQuery.devType" class="filter-item" clearable placeholder="选择设备类型">
          <el-option
            v-for="item in devTypeList"
            :key="item.id"
            :label="item.dictdataName"
            :value="item.id"
          />
        </el-select>
        <el-input v-model="findHyitHostQuery.keyword" placeholder="请输入名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilterEquipment" />
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilterEquipment">查询</el-button>
      </div>
      <div class="dialog-body">
        <el-row :gutter="20">
          <el-form ref="form" :model="form" :rules="rules" label-width="120px">
            <el-table
              :data="assetsDeviceList"
              row-key="assetsDeviceId"
              default-expand-all
              fit
              highlight-current-row
              style="width: 100%;"
            >
              <el-table-column label="选择" align="center" width="80">
                <template slot-scope="{row}">
                  <el-radio v-model="radio" :label="row.hyHostId" @change="(val) => checkBoxChange(row)">{{ }}</el-radio>
                </template>
              </el-table-column>
              <el-table-column label="对象" prop="hyMarkName" show-overflow-tooltip />
              <el-table-column label="IP地址" prop="hyIp" show-overflow-tooltip />
              <el-table-column label="状态" prop="status" show-overflow-tooltip>
                <template slot-scope="{row}">
                  <el-tag :type="setHostStataTag(row)">
                    {{ setHostStatus(row) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
            <Pagination
              v-show="findHyitHostQuery.total > 0"
              :total="findHyitHostQuery.total"
              :page.sync="findHyitHostQuery.page"
              :limit.sync="findHyitHostQuery.limit"
              @pagination="findHyitHost"
            />
          </el-form>
        </el-row>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showEquipmentDialog = false">取 消</el-button>
        <el-button :loading="loading" class="filter-item" type="primary" @click="confirmEquipment">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import request from '@/utils/request'
import api from '@/api/api'
import ExportExcel from '@/components/ExportExcel/export-excel'
import { isJSONString, conversionSymbols } from '@/utils/utils'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import socketCmd from '@/api/socket-cmd'
import UsedDetailDialog from '@/views/it-monitor/resources-monitor/monitor-content-components/monitoringData/component/used-detail-dialog'
import ListControl from '@/components/ListControl'
export default {
  components: {
    Pagination, UsedDetailDialog, ExportExcel, ListControl
  },
  props: {
    device: {
      type: Object,
      default: null
    },
    showBack: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      // 显示控制数据 start
      checkList: ['端口名称', '端口号', '可用', '状态', '连接设备名', '连接端口号', 'IP地址', '位置', '业务编码', '速率', '用途', '备注', '流量视图', '操作'],
      lists: [],
      storageVal: 'port-manage-history', // 存入localStorageOperation的名字
      // 显示控制数据 end
      agentsIds: '',
      agentGroupId: '',
      list: [],
      imgList: [],
      devTypeList: [], // 设备类型
      sortOrder: '', // 排序方式
      showMask: true, // 显示蒙版内容
      showMaskData: 0, // 显示蒙版内容
      showPortDialog: false, // 端口配置
      showEquipmentDialog: false, // 选择网络设备
      showUsedDetailDialog: false, // 流量视图
      assetsDeviceList: [],
      linkDeviceLidt: [],
      radio: '', // 单选绑定的值
      customerSelect: [], // 点击后存储选择客户row值
      equipmentList: [], // 保存后存储选择客户row值
      detailParams: [], // echart数据
      tableParams: [], // echart数据
      loading: false,
      requestInterval: 5000, // 获取统计数据间隔 毫秒
      setHyitShowSurveyInterval: null, // 获取各项数据统计的定时器
      flowViewList: [], // echart流量视图数据
      stateList: [
        { id: 1, label: 'up' },
        { id: 2, label: 'down' }
      ],
      form: {
        page: 1,
        limit: 10,
        keyword: '',
        portDeviceId: '', // 设备id
        portUsed: '', // 是否可用 1已用 0闲置
        portStatue: '', // 端口状态 1up， 2down
        linkDeviceHostid: '', // 连接设备id
        linkDeviceZhostid: '', // 连接设备zhostid
        portDeviceCardId: ''
      },
      port: {
        id: '',
        portDeviceId: '', // 设备id
        portName: '', // 端口名称
        portIndex: '', // 端口索引
        portNum: '', // 端口号
        portUsed: '', // 是否可用 1已用 0闲置 2不可用
        portStatue: '', // 端口状态 1up， 2down
        linkDeviceName: '', // 连接设备名
        linkPortNum: '', // 连接端口号
        linkDeviceIp: '', // 连接设备ip
        linkDeviceLocation: '', // 连接设备位置
        linkDeviceHostid: '', // 连接设备id
        linkDeviceZhostid: '', // 连接设备zhostid
        portSendItemid: '', // 端口发送监控项id
        portRecvItemid: '', // 端口接收监控项id
        code: '',
        backup: '',
        rate: '',
        purpose: ''
      },
      total: 0,
      statueList: [
        { id: 1, value: 'Up' },
        { id: 2, value: 'Down' }
      ],
      rules: {
        groupId: [{ required: true, message: '请选择所属分组', trigger: 'blur' }],
        portName: [{ required: true, message: '请输入端口名称', trigger: 'blur' }],
        portNum: [{ required: true, message: '请输入端口号', trigger: 'blur' }]
      },
      portVal: 0,
      findHyitHostQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        devType: '',
        status: '',
        hostType: 1,
        total: 0
      },
      CatData: [
        {}
      ],
      options: [
        { value: 1, label: 1 },
        { value: 2, label: 2 }
      ],
      fillerList: [],
      exportFileName: '端口列表',
      ExcelTitle: [
        {
          title: '端口名称',
          dataIndex: 'portName'
        },
        {
          title: '端口号',
          dataIndex: 'portNum'
        },
        {
          title: '可用',
          dataIndex: 'portUsed'
        },
        {
          title: '状态',
          dataIndex: 'portStatue'
        },
        {
          title: '连接设备名',
          dataIndex: 'linkDeviceName'
        },
        {
          title: '连接端口号',
          dataIndex: 'linkPortNum'
        },
        {
          title: 'IP地址',
          dataIndex: 'linkDeviceIp'
        },
        {
          title: '位置',
          dataIndex: 'linkDeviceLocation'
        },
        {
          title: '业务编码',
          dataIndex: 'code'
        },
        {
          title: '速率',
          dataIndex: 'rate'
        },
        {
          title: '用途',
          dataIndex: 'purpose'
        },
        {
          title: '备注',
          dataIndex: 'backup'
        }
      ]

    }
  },
  computed: {
    navTitle() {
      return this.$route.meta.title
    },
    // 设置主机可用性标签
    setHostStataTag() {
      return function(row) {
        return row.hyNetState === 1 ? 'success' : 'info'
      }
    },
    // 设置主机状态
    setHostStatus() {
      return function(row) {
        return row.hyNetState === 1 ? '在线' : '离线'
      }
    },
    // 设置状态
    setStatue() {
      return function(val) {
        const idx = this.statueList.findIndex(item => item.id === val)
        if (idx !== -1) {
          return this.statueList[idx].value
        }
      }
    }
  },
  mounted() {
    console.log(this.device)
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
    this.agentGroupId = this.sessionStorageOperation('get', 'agentGroupId')
    this.handleFilter() // 列表数据查询
    this.exportHandleFilter()
    this.oneHandleFilter()
    // 用于流量视图
    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'it-agentGetRealTimeData-websocket') {
        this.watchFlowView(isJSONString(res.detail.data.data) ? JSON.parse(res.detail.data.data) : res.detail.data.data)
      }
    })
    // 用于查询设备端口和端口号
    window.addEventListener('watchWsMessage', (res) => {
      if (res.detail.data.cmd === 'it-agentGetHostPort-websocket') {
        this.watchPortList(isJSONString(res.detail.data.HostPortData) ? JSON.parse(res.detail.data.HostPortData)[0] : res.detail.data.HostPortData[0])
      }
    })
    // 点击树状设备名更新数据
    this.$EventBus.$on('handler-tree-show-details', () => {
      setTimeout(() => {
        this.handleFilter() // 列表数据查询
        this.exportHandleFilter()
        this.oneHandleFilter()
      }, 100)
    })
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    goBack() {
      this.$emit('show', true)
    },
    // 查询列表数据
    handleFilter() {
      request({
        url: api.port.findPortInfo,
        data: { ...this.form, portDeviceId: this.device.id }
      }).then(async res => {
        if (res.code === 1) {
          if (this.device.deviceType === 1) {
            // const cat = await this.findPortDeviceCard(this.device.id)
            res.data.forEach(item => {
              item.portIndex = item.portIndex + 1
              // cat.forEach(aItem => {
              //   if (item.portDeviceCardId === aItem.id) {
              //     item.catNumber = aItem.cardNum
              //   }
              // })
            })
            this.list = res.data
          } else {
            this.list = res.data
          }
          this.total = Number(res.count)
        }
      })
    },
    // 导出列表数据
    exportHandleFilter() {
      request({
        url: api.port.findPortInfo,
        data: { ...this.form, portDeviceId: this.device.id, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          if (this.device.deviceType === 1) {
            res.data.forEach(item => {
              item.portIndex = item.portIndex + 1
            })
          }
          res.data.forEach(item => {
            Object.keys(item).forEach(keys => {
              if (keys === 'portUsed') {
                switch (item.portUsed) {
                  case 0:
                    item.portUsed = '闲置'
                    break
                  case 1:
                    item.portUsed = '可用'
                    break
                  case 2:
                    item.portUsed = '不可用'
                    break
                }
              }
              if (keys === 'portStatue') {
                switch (item.portStatue) {
                  case 1:
                    item.portStatue = 'Up'
                    break
                  case 2:
                    item.portStatue = 'Down'
                    break
                }
              }
            })
          })
          this.fillerList = res.data
        }
      })
    },
    // 鼠标经过事件
    showMaskEvent(item) {
      this.showMaskData = item.id
    },
    // 鼠标离开事件
    downMaskEvent() {
      this.showMaskData = 0
    },
    // 查询视图数据
    oneHandleFilter() {
      request({
        url: api.port.findPortInfo,
        data: { page: 1, limit: -1, portDeviceId: this.device.id }
      }).then(async res => {
        if (res.code === 1) {
          console.log(res)
          if (this.device.deviceType === 1) {
            res.data.forEach(item => {
              item.portIndex = item.portIndex + 1
            })
          }
          const sort = await this.findPortDeviceCard(this.device.id)// 查询端口设备板卡排序方式
          this.sortOrder = sort
          // 区分板卡数据
          let afterData = []
          let val = []
          for (let i = 0; i < res.data.length; i++) {
            if (val.indexOf(res.data[i].portDeviceCardId) === -1) {
              afterData.push({
                portDeviceCardId: res.data[i].portDeviceCardId,
                origin: [res.data[i]]
              })
              val.push(res.data[i].portDeviceCardId)
            } else {
              for (let j = 0; j < afterData.length; j++) {
                if (afterData[j].portDeviceCardId === res.data[i].portDeviceCardId) {
                  afterData[j].origin.push(res.data[i])
                  break
                }
              }
            }
          }
          // 排序规则
          afterData.forEach(item => {
            sort.forEach(sitem => {
              if (item.portDeviceCardId === sitem.id) {
                item.cardNum = `板卡${sitem.cardNum}`
                if (sitem.sortType === 1) { // 从左到右
                  item.sortType = 1
                } else if (sitem.sortType === 2) { // 从左到右
                  item.sortType = 2
                } else if (sitem.sortType === 3) { // 从右到左
                  item.origin.reverse()
                  item.sortType = 3
                } else if (sitem.sortType === 4) { // 从右到左
                  item.origin.reverse()
                  item.sortType = 4
                }
              }
            })
          })
          this.imgList = afterData
          console.log(this.imgList)
        }
      })
    },
    // 查询端口设备板卡排序方式
    async findPortDeviceCard(val) {
      const res = await request({
        url: api.port.findPortDeviceCard,
        data: {
          page: 1,
          limit: -1,
          portDeviceId: val
        }
      })
      if (res.code !== 1) return
      return res.data
    },
    // 关闭图表
    closeUsedDetailDialog() {
      // 关闭定时器轮巡
      clearInterval(this.setHyitShowSurveyInterval)
      console.log('关闭定时器')
      this.showUsedDetailDialog = false
    },
    // 获取流量视图监控项数据 websocket
    itAgentGetDBData(row) {
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      if (!wsToken) return
      const getUserSessionResult = getUserSession()
      const item = `${row.portRecvItemid},${row.portSendItemid}` // 目前默认两个
      sendWebsocket(socketCmd.host.default, {
        cmd: socketCmd.itMonitor.itAgentGetRealTimeData,
        data: {
          token: wsToken,
          companyId: String(getUserSessionResult.companyId),
          appId: String(getUserSessionResult.appId),
          itemid: String(item),
          agent: String(this.device.agent),
          valueType: '3,3', // valueType目前默认2个
          key: 'key',
          fromAgent: this.localStorageOperation('get', 'fromAgent'),
          fromHostId: this.localStorageOperation('get', 'fromHostId')
        }
      },
      () => {},
      (err) => {
        this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
        console.log(err)
      })
    },
    // 流量视图数据
    watchFlowView(val) {
      val.forEach(item => {
        let flowData = this.$tool.sizeUnitsConversion((Number(item.itemValue)), 'capital')
        item.itemValue = flowData.size
        item.units = `${flowData.units}/s`
      })
      this.flowViewList = val
      this.detailParams = [
        {
          itemid: Number(this.flowViewList[0].itemid),
          valueType: this.flowViewList[0].valueType,
          name: '端口每秒接收速率',
          color: '#87DEAF',
          unit: this.flowViewList[0].units,
          echartType: 'value',
          data: [],
          units: [],
          time: []
        },
        {
          itemid: Number(this.flowViewList[1].itemid),
          valueType: this.flowViewList[1].valueType,
          name: '端口每秒发送速率',
          color: '#3ba9ed',
          unit: this.flowViewList[1].units,
          conversionUnitType: 'data',
          data: [],
          units: [],
          time: []
        }
      ]
      this.tableParams = [
        {
          label: ['端口每秒接收速率'],
          value: 0,
          unit: '',
          itemid: Number(this.flowViewList[0].itemid),
          valueType: this.flowViewList[0].valueType,
          type: ['max']
        },
        {
          label: ['端口每秒发送速率'],
          value: 0,
          unit: '',
          itemid: Number(this.flowViewList[1].itemid),
          valueType: this.flowViewList[1].valueType,
          type: ['max']
        }
      ]
      console.log(this.setHyitShowSurveyInterval)
      if (this.setHyitShowSurveyInterval) {
        this.showUsedDetailDialog = true
      }
    },
    // 点击打开流量视图
    openFlowEchart(row) {
      console.log(row)
      if (row.portRecvItemid && row.portSendItemid) {
        // 打开定时器 开始发送websocket 5秒
        this.itAgentGetDBData(row)
        this.setHyitShowSurveyInterval = setInterval(() => {
          this.itAgentGetDBData(row)
        }, this.requestInterval)
      } else {
        this.$message({ message: '该端口暂无数据', type: 'error' })
      }
    },
    // 保存更改
    confirm() {
      this.$refs.port.validate(valid => {
        if (valid) {
          delete this.port.portSendItemid
          delete this.port.portRecvItemid
          delete this.port.portUsed
          delete this.port.portStatue
          this.loading = true
          request({
            url: api.port.updatePortInfo,
            data: { ...this.port }
          }).then(res => {
            this.loading = false
            if (res.code === 1) {
              this.$message.success(res.msg)
            }
          })
          this.showPortDialog = false
          this.agentUpdateHostPort(this.device.zhostid, this.device.agent) // 更新端口
          setTimeout(() => {
            this.oneHandleFilter()
            this.handleFilter()
            this.exportHandleFilter()
          }, 1000)
        }
      })
    },
    // 更新监控项数据 websocket
    agentUpdateHostPort(val, num) {
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      if (!wsToken) return
      const getUserSessionResult = getUserSession()
      sendWebsocket(socketCmd.host.default, {
        cmd: socketCmd.itMonitor.agentUpdateHostPort,
        data: {
          token: wsToken,
          companyId: String(getUserSessionResult.companyId),
          appId: String(getUserSessionResult.appId),
          agent: String(num),
          hostid: String(val)
        }
      },
      (res) => {
        console.log(res)
      }, (err) => {
        this.$message({ message: '更新失败', type: 'error' })
        console.log(err)
      })
    },
    // 点击管理 获取原数据
    async Administration(val) {
      this.portVal = val.portIndex
      const infoData = await this.getPortInfo(val.id)
      const hostData = await this.contrastFindHyitHost()
      let linkDeviceLidtData = ''
      hostData.forEach(item => {
        if (item.hyZhostId === infoData.linkDeviceZhostid) {
          linkDeviceLidtData = item
        }
      })
      this.port = infoData
      this.linkDeviceLidt = []
      this.agentGetHostPort(linkDeviceLidtData)
      this.showMaskData = 0
      this.showPortDialog = true
    },
    // 查询全部设备数据
    async contrastFindHyitHost() {
      let res = await request({
        url: api.itMonitor.findHyitHost,
        data: { page: 1, limit: -1, agents: this.agentsIds }
      })
      if (res.code !== 1) return
      return res.data
    },
    // 查询端口原数据
    async getPortInfo(val) {
      const res = await request({
        url: api.port.getPortInfo,
        data: { id: val }
      })
      if (res.code !== 1) return
      return res.model
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
    // 点击选择设备
    onClick() {
      this.loadItType()
      this.radio = ''
      this.showEquipmentDialog = true
      this.findHyitHost()
    },
    // 搜索设备
    handleFilterEquipment() {
      this.findHyitHostQuery.page = 1
      this.findHyitHost()
    },
    // 单选框 存储选择客户row值
    checkBoxChange(row) {
      console.log(row)
      this.customerSelect = row
    },
    // 确定选择设备
    confirmEquipment() {
      this.loading = true
      this.equipmentList = this.customerSelect // 存起选择的row值
      this.port.linkDeviceName = this.customerSelect.hyMarkName
      this.port.linkDeviceIp = this.customerSelect.hyIp
      this.port.linkDeviceHostid = this.customerSelect.hyHostId
      this.port.linkDeviceZhostid = this.customerSelect.hyZhostId
      this.agentGetHostPort(this.customerSelect) // 查询设备端口和端口号数据
      this.loading = false
      this.showEquipmentDialog = false
    },
    // 设备端口下拉框数据
    watchPortList(val) {
      this.linkDeviceLidt = []
      let alist = []
      val['端口描述'].forEach(item => {
        let num = conversionSymbols(item.itemName).split('(')
        alist.push(num[0])
      })
      alist.forEach((item, index) => {
        if (item.indexOf('Vlan') === -1 && item.indexOf('Bridge') === -1) {
          this.linkDeviceLidt.push({ id: alist[index], value: alist[index] })
        }
      })
    },
    // 设备端口和端口号数据 websocket
    agentGetHostPort(val) {
      const wsToken = this.sessionStorageOperation('get', 'wsToken')
      if (!wsToken) return
      const getUserSessionResult = getUserSession()
      sendWebsocket(socketCmd.host.default, {
        cmd: socketCmd.itMonitor.itAgentGetHostPort,
        data: {
          token: wsToken,
          companyId: String(getUserSessionResult.companyId),
          appId: String(getUserSessionResult.appId),
          hostid: String(val.hyZhostId),
          agent: String(val.agent),
          fromAgent: this.localStorageOperation('get', 'fromAgent'),
          fromHostId: this.localStorageOperation('get', 'fromHostId')
        }
      },
      () => {},
      (err) => {
        this.$message({ message: 'WebSocket登录连接失败', type: 'error' })
        console.log(err)
      })
    },
    // 获取主机
    findHyitHost() {
      const data = { ...this.findHyitHostQuery }
      if (data.devType === 0) data.devType = ''
      request({
        url: api.itMonitor.findHyitHost,
        data: { ...data, agents: this.agentsIds }
      }).then(res => {
        if (res.code === 1) {
          this.findHyitHostQuery.total = parseInt(res.count)
          this.assetsDeviceList = res.data
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.app-container {
  background-color: #fff;
}
.title-container {
    display: flex;
    .title {
        font-size: 18px;
        font-weight: bold;
        margin: 10px 10px 10px 0px;
    }
    .ip {
        font-size: 14px;
        margin: 5px 0 12px 0;
    }
}
.monitor-icon{
    width: 16px;
    height: 16px;
}
.margin-b {
  margin-bottom: 50px;
}
.marfin-t {
  margin-top: 50px;
}
.view-box {
    height: 40px;
    line-height: 40px;
    font-size: 15px;
    padding-left: 10px;
    background-color: rgb(249,249,249);
}
.padding-5 {
    padding: 15px 5px 15px 15px;
}
.padding-15 {
    padding: 15px 15px 15px 15px;
}

.view-pic-50 {
    display: flex;
    margin-left: 25%;
    // justify-content: center;
    // align-items: center;
    padding: 50px 0;
}
.view-pic-0 {
    display: flex;
    margin-left: 25%;
    // justify-content: center;
    // align-items: center;
    padding: 5px 0;
}
.view-img-wrap {
    width: 715px;
    display: flex;
    flex-wrap: wrap;
    background-color: rgb(102,102,102);
    div:nth-child(4n){
        margin-right: 10px;
    }
}
.view-img-wrap-reverse {
    width: 715px;
    display: flex;
    flex-wrap: wrap-reverse;
    background-color: rgb(249,249,249);
    div:nth-child(4n){
        margin-right: 10px;
    }
}
.img-box {
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid black;
    border-radius: 8px;
    margin: 1px 1px 0px 0px;
    position: relative;
    background-color: #fff;
    .mask-box {
        width: 40px;
        height: 40px;
        position: absolute;
        top: -2px;
        left: -2px;
    }
    .showMask-box {
        width: 400px;
        height: 250px;
        position: absolute;
        z-index: 2000;
        top: 38px;
        left: 0;
    }
    .mask {
        width: 400px;
        height: 250px;
        position: absolute;
        color: white;
        top: 38px;
        left: 0;
        z-index: 1000;
        background-color: rgba(0, 0, 0, 0.54);
        div{
            margin: 16px;
            span {
                margin-right: 20px;
            }
        }
    }
    .buttonMask {
            width: 60px;
            height: 30px;
            position: absolute;
            top: 245px;
            left: 12px;
            color: rgb(0,255,255);
            z-index: 4000;
            .but {
            margin-left:5px;
        }
    }
}
.filter-container {
    margin-top: 10px;
}
.Indexes {
    margin-bottom: 20px;
    font-size: 18px;
    margin-left: 10px;
}
.card {
    color:rgb(1,62,154);
    margin-bottom: 10px;
    font-weight: bold;
}
.increase {
    color:rgb(1,62,154);
    margin-left: 100px;
}
.bk {
  display: flex;
  align-items: center;
  margin-right: 10px;
}
</style>
