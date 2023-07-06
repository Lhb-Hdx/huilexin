<template>
  <div class="app-container">
    <div v-if="showDetails">
      <div class="filter-container">
        <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">新增设备</el-button>
        <el-input v-model="listQuery.keyword" placeholder="请输入名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter" />
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
        <ListControl :check-list="checkList" @setLists="setLists" />
      </div>
      <div v-loading="listLoading" class="table-wrapper">
        <el-table
          :data="list"
          fit
          highlight-current-row
        >
          <el-table-column label="序号" width="50" type="index" align="center" />
          <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="设备名称" show-overflow-tooltip align="left" min-width="150px">
            <template slot-scope="{row}">
              <el-link type="primary" @click="handlerToItMonitorDevice(row)">{{ row.deviceName }}</el-link>
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" width="100" label="IP地址" show-overflow-tooltip align="left" min-width="130px">
            <template slot-scope="{row}">
              {{ row.ip }}
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="总数" show-overflow-tooltip align="right">
            <template slot-scope="{row}">
              {{ row.portCount }}
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="已用" show-overflow-tooltip align="right">
            <template slot-scope="{row}">
              {{ row.portUsedCount }}
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="未用" show-overflow-tooltip align="right">
            <template slot-scope="{row}">
              {{ row.portCount - row.portUsedCount }}
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" label="使用率" show-overflow-tooltip width="200" align="left">
            <template slot-scope="{row}">
              <el-progress :percentage="parseFloat(((row.portUsedCount / row.portCount)*100).toFixed(0))" />
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" label="状态" show-overflow-tooltip align="left">
            <template slot-scope="{row}">
              <el-tag :type="setHostStataTag(row)">
                {{ setHostStatus(row) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[7].ispass : true" label="最后编辑时间" width="160" align="right">
            <template slot-scope="{row}">
              {{ row.updateTime }}
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[8].ispass : true" label="编辑人" show-overflow-tooltip align="left">
            <template slot-scope="{row}">
              {{ setUser(row.userId) }}
            </template>
          </el-table-column>

          <el-table-column v-if="lists.length > 0 ? lists[9].ispass : true" label="所在位置" show-overflow-tooltip align="left">
            <template slot-scope="{row}">
              {{ row.location }}
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[10].ispass : true" label="操作" class-name="small-padding fixed-width" width="220" align="left">
            <template slot-scope="{row}">
              <el-button type="primary" size="mini" @click="onDetail(row)">查看</el-button>
              <el-button type="primary" size="mini" @click="onEdit(row)">编辑</el-button>
              <el-button type="danger" size="mini" @click="onDel(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :auto-scroll="false" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findPortDeviceList()" />
      </div>
      <el-dialog :title="dialogTitle" :visible.sync="showIpDialog" width="50%" top="5vh">
        <div class="dialog-body">
          <el-row :gutter="2">
            <el-form ref="form" :model="form" :rules="rules" label-width="120px">
              <el-col :span="20">
                <el-form-item label="所属分组" prop="groupId">
                  <el-cascader
                    v-model="form.groupId"
                    clearable
                    class="filter-item w-100"
                    multiple="false"
                    :options="groupData"
                    :props="portProps"
                    :show-all-levels="false"
                    filterable
                    prop="groupId"
                  />
                </el-form-item>
                <el-form-item v-if="form.deviceName === ''" label="选择设备" prop="groupName">
                  <el-button type="primary" @click="onClick()">请选择网络设备</el-button>
                </el-form-item>
                <el-form-item v-if="form.deviceName !== ''" label="选择设备">
                  <el-button type="primary" @click="onClick()">{{ form.deviceName }}</el-button>
                </el-form-item>
                <el-form-item label="设备类型" prop="deviceType">
                  <el-select v-model="form.deviceType" placeholder="请选择设备类型">
                    <el-option
                      v-for="val in equipmentType"
                      :key="val.id"
                      :label="val.value"
                      :value="val.id"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="所在位置" prop="location">
                  <el-input v-model="form.location" placeholder="请输入所在位置" />
                </el-form-item>

                <div v-for="(item,index) in PortDevice" :key="index">
                  <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                    <div v-if="dialogTitle === '新增设备'" class="card">板卡 {{ index+1 }}</div>
                    <div v-else class="card">板卡 {{ item.cardNum }}</div>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
                    <el-form-item label="端口数量" label-width="90px" prop="portCount">
                      <el-select v-model="item.portCount" :disabled="item.disabled ? true : false" placeholder="请选择端口数量">
                        <el-option
                          v-for="val in options"
                          :key="val.value"
                          :label="val.label"
                          :value="val.value"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
                    <el-form-item label="排序规则" label-width="90px" prop="sortType">
                      <el-select v-model="item.sortType" :disabled="item.disabled ? true : false" placeholder="请选择排序规则">
                        <el-option
                          v-for="num in optionsSortType"
                          :key="num.value"
                          :label="num.label"
                          :value="num.value"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col v-if="formId" :xs="24" :sm="24" :md="24" :lg="4" :xl="4">
                    <el-button class="filter-item mar" type="danger" size="mini" @click="deleteFormIdBoard(item)">删除板卡</el-button>
                  </el-col>
                </div>
                <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                  <el-form-item label="" label-width="90px">
                    <el-button class="filter-item" type="primary" size="mini" @click="addBoard">添加板卡</el-button>
                    <el-button v-if="!formId" class="filter-item" type="danger" size="mini" @click="deleteBoard()">删除板卡</el-button>
                  </el-form-item>
                </el-col>
              </el-col>
            </el-form>
          </el-row>
        </div>
        <div v-if="look === false" slot="footer" class="dialog-footer">
          <el-button @click="showIpDialog = false">取 消</el-button>
          <el-button :loading="loading" class="filter-item" type="primary" @click="confirm">确 定</el-button>
        </div>
      </el-dialog>
      <!-- 选择网络设备 -->
      <el-dialog title="选择设备" :visible.sync="showEquipmentDialog" width="60%" top="5vh">
        <div class="filter-container">
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
                    <!-- <el-radio v-model="radio" :label="row.hyHostId" :disable="isDisabled(row)" @change="(val) => checkBoxChange(row)">{{ }}</el-radio> -->
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
          <el-button class="filter-item" type="primary" @click="confirmEquipment">保 存</el-button>
        </div>
      </el-dialog>
    </div>
    <!-- 查看页面 端口详情页 -->
    <div v-if="!showDetails">
      <DetailedInformation :device="device" @show="show" />
    </div>
  </div>

</template>

<script>
import Pagination from '@/components/Pagination'
import request from '@/utils/request'
import api from '@/api/api'
import socketCmd from '@/api/socket-cmd'
import { getUserSession } from '@/utils/auth'
import { sendWebsocket } from '@/utils/websocket'
import DetailedInformation from './component/detailed-information'
import ListControl from '@/components/ListControl'

export default {
  name: 'SubnetSummary',
  components: {
    Pagination,
    DetailedInformation,
    ListControl
  },
  data() {
    return {
      disabled: false,
      agentsIds: '',
      agentGroupId: '',
      userInfo: '',
      showDetails: true,
      listLoading: true,
      updatePort: '',
      load: 0,
      userList: [],
      hostList: [],
      loading: false,
      DeviceDataVal: '',
      listQuery: {
        page: 1,
        limit: 10,
        keyword: ''
      },
      list: [],
      total: 0,
      dialogTitle: '新增设备',
      showIpDialog: false,
      showEquipmentDialog: false,
      portProps: { emitPath: false, label: 'portDeviceGroup', value: 'id', checkStrictly: true },
      form: {
        deviceName: '',
        ip: '',
        groupId: '',
        // portCount: '',
        // portUsedCount: '',
        hostid: '',
        zhostid: '',
        userId: '',
        location: '',
        sortType: '',
        cardCount: '',
        agent: '',
        hyNetState: '',
        deviceType: ''
      },
      findHyitHostQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        devType: 481,
        status: '',
        hostType: 1,
        total: 0
      },
      PortDevice: [{
        portDeviceId: '', // 设备id
        cardNum: '1', // 板卡号
        portCount: 1, // 端口数量
        sortType: 1// 排序规则
      }],
      options: [
        { value: 1, label: 1 },
        { value: 4, label: 4 },
        { value: 8, label: 8 },
        { value: 16, label: 16 },
        { value: 32, label: 32 },
        { value: 64, label: 64 },
        { value: 128, label: 128 }
      ],
      equipmentType: [
        { id: 1, value: '交换机'},
        { id: 2, value: '路由器'}
      ],
      optionsSortType: [
        { value: 1, label: '从左到右，从上到下' },
        { value: 2, label: '从左到右，从下到上' },
        { value: 3, label: '从右到左，从上到下' },
        { value: 4, label: '从右到左，从下到上' }
      ],
      cardCountNumber: [
        { value: 1, label: 1 },
        { value: 2, label: 2 },
        { value: 3, label: 3 },
        { value: 4, label: 4 }
      ],
      assetsDeviceList: [],
      radio: '', // 单选绑定的值
      customerSelect: '', // 存储选择的设备row
      rules: {
        groupId: [
          { required: true, message: '请选择所属分组', trigger: 'blur' }
        ],
        groupName: [
          { required: true, message: '请选择网络设备', trigger: 'blur' }
        ],
        deviceType: [
          { required: true, message: '请选择设备类型', trigger: 'blur' }
        ]
      },
      groupData: [],
      calculation: null,
      agentList: [],
      formId: '',
      look: false,
      device: '',
      originalData: [],
      editData: '',
      // 显示控制的列表名称
      checkList: ['设备名称', 'IP地址', '总数', '已用', '未用', '使用率', '状态', '最后编辑时间', '编辑人', '所在位置', '操作'],
      lists: []
    }
  },
  computed: {
    // isDisabled() {
    //   return function(val) {
    //     const idx = this.DeviceDataVal.findIndex(item => Number(item.zhostid) === Number(val.hyZhostId))
    //     console.log(idx)
    //     return idx !== -1 ? 'false' : 'true'
    //   }
    // },
    setPercentage() {
      return function(val) {
        return Number((((val.ipUsedCount === null ? 0 : val.ipUsedCount) / (val.ipCount === null ? 0 : val.ipCount)) * 100).toFixed(2))
      }
    },
    setAgent() {
      return function(val) {
        const idx = this.agentList.findIndex(item => item.id === val)
        if (idx !== -1) {
          return this.agentList[idx].name
        }
      }
    },
    setUser() {
      return function(val) {
        const idx = this.userList.findIndex(item => Number(item.userId) === Number(val))
        if (idx !== -1) {
          return this.userList[idx].realName
        }
      }
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
    }
  },
  watch: {
  },
  created() {
    this.userInfo = this.localStorageOperation('get', 'userInfo')
  },
  mounted() {
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
    this.agentGroupId = this.sessionStorageOperation('get', 'agentGroupId')
    this.findPortDevice()
    this.findSysUser()
    this.$EventBus.$on('summary-equipment', (msg) => {
      this.findPortDevice({
        ...this.listQuery, ...msg.query
      })
      this.load = 1
      this.dataVal = msg.query
    })
    this.$EventBus.$on('handler-tree-show-details', (msg) => {
      this.onDetail(msg.val)
    })
    this.$EventBus.$on('click-port-catalogue', () => {
      this.$set(this.listQuery, 'page', 1)
      this.findPortDevice()
    })
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 新增设备
    handleCreate() {
      this.disabled = false
      this.radio = ''
      this.dialogTitle = '新增设备'
      this.PortDevice = [{
        portDeviceId: '',
        cardNum: '1',
        portCount: 1,
        sortType: 1
      }]
      Object.keys(this.form).forEach(key => {
        this.$set(this.form, `${key}`, '')
      })
      this.findPortDeviceGroup()
      this.form.userId = Number(this.userInfo.userId)
      this.formId = ''
      this.customerSelect = ''
      this.showIpDialog = true
      this.look = false
    },
    // 显示端口详情页
    show(val) {
      this.showDetails = val
      this.findPortDevice()
    },
    // 搜索
    handleFilter() {
      this.$set(this.listQuery, 'page', 1)
      this.findPortDevice()
    },
    // 搜索设备
    handleFilterEquipment() {
      this.findHyitHostQuery.page = 1
      this.findHyitHost()
    },
    // 点击选择设备
    onClick() {
      this.showEquipmentDialog = true
      this.findHyitHost()
    },
    // 打开编辑
    async onEdit(val) {
      this.disabled = true
      console.log(val)
      this.editData = val
      this.dialogTitle = '编辑设备'
      this.showIpDialog = true
      this.look = false
      this.formId = val.id
      this.findPortDeviceGroup()
      const updatacard = await this.findPortDeviceCard(val.id)// 查询端口设备板卡
      this.originalData = updatacard.reverse()
      this.PortDevice = updatacard.reverse()
      updatacard.forEach(item => {
        this.$set(item, 'disabled', true)
      })
      this.PortDevice = updatacard.reverse()
      console.log(this.PortDevice)
      const updataList = await this.getPortDevice(val)// 查找分组信息
      Object.keys(this.form).forEach(key => {
        this.$set(this.form, `${key}`, updataList[`${key}`])
      })
    },
    // 查询端口设备板卡
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
    // 添加板卡
    addBoard() {
      this.$set(this.PortDevice, this.PortDevice.length, {
        portDeviceId: '', // 设备id
        cardNum: String(this.PortDevice.length + 1), // 板卡号
        portCount: 1, // 端口数量
        sortType: 1// 排序规则
      })
    },
    // 删除板卡
    deleteBoard() {
      this.PortDevice.pop()
    },
    // 编辑页面删除板卡
    deleteFormIdBoard(val) {
      console.log(val)
      this.$confirm('确定删除板卡吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deletePortDeviceCard(val.id)
      })
    },
    // 删除板卡
    deletePortDeviceCard(id) {
      request({
        url: api.port.deletePortDeviceCard,
        data: { id }
      }).then(res => {
        if (res.code === 1) {
          this.$message.success('删除成功')
          this.onEdit(this.editData)
        }
      })
    },
    // 打开查看
    onDetail(val) {
      if (val.id) {
        this.device = val
      } else {
        this.device = { ...val, id: val.treeItemId }
      }
      this.itAgentGetDBData(val.zhostid, val.agent) // 更新端口
      this.showDetails = false
    },
    // 查找分组信息
    async getPortDevice(val) {
      const res = await request({
        url: api.port.getPortDevice,
        data: { id: val.id }
      })
      if (res.code !== 1) return
      return res.model
    },
    // 查询所属分组
    async findPortDeviceGroup() {
      const { code, data } = await request({
        url: api.port.findPortDeviceGroup,
        data: {
          limit: -1,
          agentGroupId: this.agentGroupId
        }
      })
      if (code !== 1) return
      this.groupData = this.$tool.listToTree(data, 0, 0, 'id', 'parentId')
    },
    // 点击树结构就传值去请求数据，没点就不传
    findPortDeviceList() {
      if (this.code === 0) {
        this.findPortDevice()
      } else {
        this.findPortDevice({
          ...this.listQuery, ...this.dataVal
        })
      }
    },
    // 查询接口
    findPortDevice(query) {
      request({
        url: api.port.findPortDevice,
        data: query || this.listQuery
      }).then(async res => {
        if (res.code === 1) {
          this.listLoading = false
          const ids = []
          res.data.forEach(item => {
            ids.push(item.hostid)
          })
          await request({
            url: api.itMonitor.findHyitHost,
            data: { ids }
          }).then(res => {
            if (res.code === 1) {
              this.hostList = res.data
            }
          })
          res.data.forEach(item => {
            this.hostList.forEach(lostItem => {
              if (Number(item.hostid) === Number(lostItem.hyHostId)) {
                this.$set(item, 'hyNetState', lostItem.hyNetState)
                item.hySubdevTypeId = lostItem.hySubdevTypeId
                item.hyHostId = lostItem.hyHostId
                item.hyZhostId = lostItem.hyZhostId
                item.hyDevTypeId = lostItem.hyDevTypeId
              }
            })
          })
          this.list = res.data
          this.total = Number(res.count)
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
    // 查询接口
    async findPortDeviceData(query) {
      const res = await request({
        url: api.port.findPortDevice,
        data: query || this.listQuery
      })
      if (res.code !== 1) return
      return res.data
    },
    // 查询角色
    findSysUser() {
      request({
        url: api.sys.findSysUser,
        data: {
          page: 1,
          limit: -1,
          companyId: this.$auth.getUserSession().companyId
        }
      }).then(res => {
        if (res.code === 1) {
          this.userList = res.data
        }
      })
    },
    // 获取主机
    findHyitHost() {
      const data = { ...this.findHyitHostQuery }
      if (data.devType === 0) data.devType = ''
      request({
        url: api.itMonitor.findHyitHost,
        data: { ...data, agents: this.agentsIds }
      }).then(async res => {
        if (res.code === 1) {
          this.DeviceDataVal = await this.findPortDeviceData({ page: 1, limit: -1 })
          // res.data.forEach((item, index, array) => {
          //   this.DeviceDataVal.forEach(itemVal => {
          //     if (Number(item.hyZhostId) === Number(itemVal.zhostid)) {
          //       console.log(item)
          //       array.splice(item, 1)
          //     }
          //   })
          // })
          this.findHyitHostQuery.total = parseInt(res.count)
          this.assetsDeviceList = res.data
          this.listLoading = false
        }
      })
    },
    // 单选框 存储选择客户row值
    checkBoxChange(row) {
      console.log(row)
      this.customerSelect = row
    },
    // 确定选择设备
    confirmEquipment() {
      this.updatePort = this.customerSelect
      this.form.deviceName = this.customerSelect.hyMarkName
      this.form.ip = this.customerSelect.hyIp
      this.form.hostid = this.customerSelect.hyHostId
      this.form.zhostid = this.customerSelect.hyZhostId
      this.form.agent = this.customerSelect.agent
      this.form.hyNetState = this.customerSelect.hyNetState
      this.showEquipmentDialog = false
    },
    // 保存
    confirm(val) {
      this.$refs['form'].validate(valid => {
        const portDevice = this.formId !== '' ? api.port.updatePortDevice : api.port.insertPortDevice
        if (this.formId !== '') {
          this.form.id = this.formId // 设备id
        }
        if (valid) {
          this.loading = true
          request({
            url: portDevice,
            data: { ...this.form }
          }).then(async res => {
            this.loading = false
            if (res.code === 1) {
              this.showIpDialog = false
              if (this.formId !== '') { // 判断是新增还是编辑
                await this.updatePortDeviceCard(this.formId) // 编辑端口设备板卡
              } else {
                await this.insertPortDeviceCard(res.model.id) // 添加端口设备板卡
              }
              this.itAgentGetDBData(this.updatePort.hyZhostId, this.updatePort.agent) // 更新端口
              const portData = await this.findPortDeviceData({ page: 1, limit: -1, groupId: res.model.groupId })
              this.$EventBus.$emit('add-subnet-equipment', { setInType: 'area', setInId: this.form.groupId, data: portData })
              setTimeout(() => {
                this.findPortDevice() // 查询列表数据
              }, 800)
            } else {
              this.$message({
                type: 'error',
                message: '该设备已经存在，请选择其他设备'
              })
            }
          })
        }
      })
    },
    // 新增端口设备板卡
    insertPortDeviceCard(id) {
      this.PortDevice.forEach(item => {
        request({
          url: api.port.insertPortDeviceCard,
          data: { ...item, portDeviceId: id }
        }).then(res => {
          if (res.code === 1) {
            console.log(res)
          }
        })
      })
    },
    // 编辑端口设备板卡
    updatePortDeviceCard(id) {
      this.PortDevice.forEach(item => {
        if (item.id) { // 存在id更新板卡信息
          request({
            url: api.port.updatePortDeviceCard,
            data: { ...item, portDeviceId: id, id: item.id }
          })
        } else {
          request({ // 不存在id新增板卡
            url: api.port.insertPortDeviceCard,
            data: { ...item, portDeviceId: id }
          })
        }
      })
    },
    // 更新监控项数据 websocket
    itAgentGetDBData(val, num) {
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
      () => {},
      (err) => {
        this.$message({ message: '更新失败', type: 'error' })
        console.log(err)
      })
    },
    // 删除
    onDel(val) {
      this.$confirm('确定删除吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.port.deletePortDevice,
          data: { id: val.id }
        }).then(({ code }) => {
          this.$message.success('删除成功')
          this.$nextTick(() => {
            if (this.load === 0) {
              this.findPortDevice() // 获取全部设备
            } else {
              this.findPortDevice({ groupId: val.groupId, agent: val.agent }) // 删除后获取当前分组设备
            }
          })
          this.$EventBus.$emit('delete-equipment-ip', { deleteInType: 'area', deletePId: val.groupId, deleteId: val.id })
        }, () => {
          this.$message.error('删除失败')
        })
      })
    }
  }
}
</script>

<style scoped lang="scss">
.box {
  border: 1px solid black;
  border-radius: 5px;
  border-color: rgb(204,207,214);
  margin: 15px 0 0 0;
  padding-left: 15px;

}
.card {
    color:rgb(1,62,154);
    margin-bottom: 10px;
    font-weight: bold;
}
.mar {
  margin: 4px 0 0 10px;
}
</style>
