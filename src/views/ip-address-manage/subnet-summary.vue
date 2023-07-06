<template>
  <div class="app-container" style="padding-top:0">
    <div class="filter-container">
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">新增IPv4子网</el-button>
      <el-input v-model="listQuery.keyword" placeholder="请输入名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <ExportExcel class="filter-item" :fillter-list="fillerList" :excel-title="ExcelTitle" :file-name="exportFileName" />
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        :data="list"
        fit
        highlight-current-row
      >
        <el-table-column label="序号" width="80" type="index" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="子网地址" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ row.netSegment }} / {{ row.maskBit }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="left" label="子网名称" prop="subnetName" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="使用率" show-overflow-tooltip>
          <template slot-scope="{row}">
            <el-progress :percentage="setPercentage(row)" />
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="right" label="已用" prop="ipUsedCount" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="right" label="禁用" prop="ipDisableCount" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="right" label="总大小" prop="ipCount" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" label="操作" class-name="small-padding fixed-width" width="240">
          <template slot-scope="{row}">
            <el-button type="primary" size="mini" @click="onDetail(row)">查看</el-button>
            <el-button type="primary" size="mini" @click="onEdit(row)">编辑</el-button>
            <el-button type="danger" size="mini" @click="onDel(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :auto-scroll="false" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findOpsIpAddress" />
    </div>
    <el-dialog :title="dialogTitle" :visible.sync="showIpDialog" width="80%" top="5vh">
      <div class="dialog-body">
        <el-row :gutter="20">
          <el-form ref="form" :model="form" :rules="rules" label-width="120px">
            <el-col :span="14">
              <div v-if="formId === ''" class="flex">
                <el-form-item class="inline" label="子网/网络地址" prop="ip">
                  <el-input
                    id="ip1"
                    ref="ip1"
                    v-model="ip1"
                    :clearable="false"
                    placeholder="0-255"
                    size="small"
                    style="width: 70px; text-align: right"
                    onkeyup="this.form=this.value.replace(/\D/g,'')"
                    maxlength="3"
                  />
                  <span> . </span>
                  <el-input
                    ref="ip2"
                    v-model="ip2"
                    :clearable="false"
                    placeholder="0-255"
                    size="small"
                    style="width: 70px"
                    onkeyup="this.value=this.value.replace(/\D/g,'')"
                    maxlength="3"
                    @keyup.backspace.native="fallbackIn2"
                  />
                  <span> . </span>
                  <el-input
                    ref="ip3"
                    v-model="ip3"
                    :clearable="false"
                    placeholder="0-255"
                    size="small"
                    style="width: 70px"
                    onkeyup="this.value=this.value.replace(/\D/g,'')"
                    maxlength="3"
                    @keyup.backspace.native="fallbackIn3"
                  />
                  <span> . </span>
                  <el-input
                    ref="ip4"
                    v-model="ip4"
                    :clearable="false"
                    placeholder="0-255"
                    size="small"
                    style="width: 70px"
                    onkeyup="this.value=this.value.replace(/\D/g,'')"
                    maxlength="3"
                    @keyup.backspace.native="fallbackIn4"
                  />
                </el-form-item>
              </div>
              <el-form-item label="掩码位" prop="maskBit">
                <div class="flex">
                  <el-input v-model.trim="form.maskBit" type="number" placeholder="请输入掩码位" style="width: 120px" />
                  <el-button class="filter-item margin-left-10" type="primary" @click="onCalculation">计算</el-button>
                </div>
              </el-form-item>
              <el-form-item label="项目" prop="agentGroupId">
                <el-select
                  v-model="form.agentGroupId"
                  filterable
                  placeholder="请选择项目"
                  style="width: 100%;"
                >
                  <el-option
                    v-for="item in agentProject"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="分组" prop="ipGroupId">
                <el-select
                  v-model="form.ipGroupId"
                  placeholder="请选择上级分组"
                  style="width: 100%;"
                  clearable
                >
                  <el-option
                    v-for="item in groupData"
                    :key="item.id"
                    :label="item.groupName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="子网名称" prop="subnetName">
                <el-input v-model.trim="form.subnetName" placeholder="请输入子网名称" />
              </el-form-item>
              <el-form-item label="VLAN名称" prop="vlanName">
                <el-input v-model.trim="form.vlanName" placeholder="请输入VLAN名称" />
              </el-form-item>
              <el-form-item label="描述" prop="backup">
                <el-input v-model="form.backup" placeholder="请输入" type="textarea" />
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="可用IP数">
                {{ calculation ? calculation.useIp : '' }}
              </el-form-item>
              <el-form-item label="掩码">
                {{ calculation ? calculation.mask : '' }}
              </el-form-item>
              <el-form-item label="网络">
                {{ calculation ? calculation.netIp : '' }}
              </el-form-item>
              <el-form-item label="第一个可用IP">
                {{ calculation ? calculation.startIP : '' }}
              </el-form-item>
              <el-form-item label="最后一个可用IP">
                {{ calculation ? calculation.endIP : '' }}
              </el-form-item>
              <el-form-item label="广播">
                {{ calculation ? calculation.broadcastIp : '' }}
              </el-form-item>
            </el-col>
          </el-form>
        </el-row>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showIpDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="confirm">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑网段" :visible.sync="showNetSegmentDialog" width="40%" top="5vh">
      <el-form ref="form" :model="netSegmentForm" label-width="120px">
        <el-form-item label="分组" prop="ipGroupId">
          <el-select
            v-model="netSegmentForm.ipGroupId"
            placeholder="请选择上级分组"
            style="width: 100%;"
            clearable
          >
            <el-option
              v-for="item in groupData"
              :key="item.id"
              :label="item.groupName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="子网名称" prop="subnetName">
          <el-input v-model.trim="netSegmentForm.subnetName" placeholder="请输入子网名称" />
        </el-form-item>
        <el-form-item label="VLAN名称" prop="vlanName">
          <el-input v-model.trim="netSegmentForm.vlanName" placeholder="请输入VLAN名称" />
        </el-form-item>
        <el-form-item label="网关" prop="agent">
          <!-- <el-input v-model.trim="netSegmentForm.agent" placeholder="请输入网关名称" /> -->
          {{ setAgent(netSegmentForm.agent) }}
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showNetSegmentDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="confirmNetSegment">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import request from '@/utils/request'
import api from '@/api/api'
import ExportExcel from '@/components/ExportExcel/export-excel'
import ListControl from '@/components/ListControl'

export default {
  name: 'SubnetSummary',
  components: {
    Pagination, ExportExcel, ListControl
  },
  data() {
    const validateMaskBit = (rule, value, callback) => {
      if (value < 20 || value > 32) {
        return callback(new Error('掩码位大小不能小于20或者大于32'))
      }
      callback()
    }
    const validateIp = (rule, value, callback) => {
      if (this.ip1 === '' || this.ip2 === '' || this.ip3 === '' || this.ip4 === '') {
        return callback(new Error('请输入完整的IP地址'))
      }
      callback()
    }
    return {
      agentGroupId: '',
      agentProject: [{id: '', name: ''}],
      agentsIds: '',
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        keyword: ''
      },
      listNum: {
        page: 1,
        limit: -1
      },
      list: [],
      total: 0,
      dialogTitle: '新增IPv4子网',
      showIpDialog: false,
      form: {
        agentGroupId: '', // 项目id
        ip: '', // ip
        maskBit: '', // 掩码位
        vlanName: '', // vlan名称
        ipGroupId: '', // 所属分组
        subnetName: '', // 子网名称
        backup: '' // 备注
      },
      rules: {
        ip: [
          { required: true, validator: validateIp, trigger: 'blur' }
        ],
        maskBit: [
          { required: true, validator: validateMaskBit, trigger: 'blur' }
        ],
        vlanName: [
          { required: true, message: '请输入VLAN名称', trigger: 'blur' }
        ],
        areaId: [
          { required: true, message: '请选择区域', trigger: 'blur' }
        ],
        subnetName: [
          { required: true, message: '请输入子网名称', trigger: 'blur' }
        ],
        agentGroupId: [
          { required: true, message: '请选择网关', trigger: 'blur' }
        ]
      },
      areaProps: { label: 'hyAreaName', value: 'hyAreaId', checkStrictly: true },
      areaTreeArr: [],
      groupData: [],
      ip1: '',
      ip2: '',
      ip3: '',
      ip4: '',
      calculation: null,
      fillerList: [],
      ExcelTitle: [
        {
          title: '子网地址',
          dataIndex: 'netSegment'
        },
        {
          title: '子网名称',
          dataIndex: 'subnetName'
        },
        {
          title: '已用',
          dataIndex: 'ipUsedCount'
        },
        {
          title: '禁用',
          dataIndex: 'ipDisableCount'
        },
        {
          title: '总大小',
          dataIndex: 'ipCount'
        }
      ],
      exportFileName: '子网汇总',
      agentList: [],
      formId: '',
      lastIpStorage: null,
      showNetSegmentDialog: false,
      netSegmentForm: {
        ipGroupId: '',
        subnetName: '',
        vlanName: '',
        agent: ''
      },
      // 显示控制的列表名称
      checkList: ['子网地址', '子网名称', '使用率', '已用', '禁用', '总大小', '操作'],
      lists: []
    }
  },
  computed: {
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
    }
  },
  watch: {
    ip1: function(v) {
      // 输入点自动跳入下一次输入框
      v = v + ''
      if (v.indexOf('.') !== -1) {
        // 去除里面的点
        this.ip1 = v.replace('.', '')
        // 跳转下一次输入框
        this.$refs.ip2.focus()
      }
      // 去掉数字前面的0
      if (v === '00') {
        this.ip1 = ~~v
      }
      if (v !== 0) {
        this.ip1 = ~~v
      }
      // 数字超过255的全部按255算
      if (v > 255) {
        this.ip1 = 255
      }
      // 长度为3了自动跳下一个框
      try {
        if (v.length === 3) {
          this.$refs.ip2.focus()
        }
      } catch (err) {
        console.log(err)
      }
    },
    ip2: function(v) {
      v = v + ''
      if (v.indexOf('.') !== -1) {
        this.ip2 = v.replace('.', '')

        this.$refs.ip3.focus()
      }
      if (v === '00') {
        this.ip2 = ~~v
      }
      if (v !== 0) {
        this.ip2 = ~~v
      }
      if (v > 255) {
        this.ip2 = 255
      }
      try {
        if (v.length === 3) {
          this.$refs.ip3.focus()
        }
        // 当目前输入框为空的时候，回退到上一输入框
        /* if (v.length == 0) {
          this.$refs.ip1.focus();
        } */
      } catch (err) {
        console.log(err)
      }
    },
    ip3: function(v) {
      v = v + ''
      if (v.indexOf('.') !== -1) {
        this.ip3 = v.replace('.', '')

        this.$refs.ip4.focus()
      }
      if (v === '00') {
        this.ip3 = ~~v
      }
      if (v !== 0) {
        this.ip3 = ~~v
      }
      if (v > 255) {
        this.ip3 = 255
      }
      try {
        if (v.length === 3) {
          this.$refs.ip4.focus()
        }
        /* if (v.length == 0) {
          this.$refs.ip2.focus();
        } */
      } catch (err) {
        console.log(err)
      }
    },
    ip4: function(v) {
      v = v + ''
      if (v === '00') {
        this.ip4 = v.replace('.', '')
        this.ip4 = ~~v
      }
      if (v !== 0) {
        this.ip4 = ~~v
      }
      if (v > 255) {
        this.ip4 = 255
      }
      try {
        /* if (v.length == 0) {
          this.$refs.ip3.focus();
        } */
      } catch (err) {
        console.log(err)
      }
    }
  },
  mounted() {
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
    this.agentProject[0].id = this.sessionStorageOperation('get', 'agentGroupId')
    this.agentProject[0].name = this.sessionStorageOperation('get', 'agentProject')
    this.findOpsIpAddress()
    this.loadOrgList()
    // this.initFillerList({ limit: -1 })
    this.$EventBus.$on('summary', (msg) => {
      this.exportFileName = `${msg.treeItemName}子网汇总`
      this.findOpsIpAddress({
        ...this.listQuery, ...msg.query
      })
      // this.exportFindOpsIpAddress({
      //   ...this.listQuery, ...msg.query
      // })
      // this.initFillerList({ limit: -1, ...msg.query })
    })
    this.findHyitAgent()
    this.$EventBus.$on('click-ip-catalogue', () => {
      this.$set(this.listQuery, 'page', 1)
      this.findOpsIpAddress()
    })
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 打开创建
    handleCreate() {
      this.formId = ''
      this.showIpDialog = true
      Object.keys(this.form).forEach(key => {
        this.$set(this.form, `${key}`, '')
      })
      this.form.agentGroupId = this.agentProject[0].id
      this.calculation = null
      this.ip1 = ''
      this.ip2 = ''
      this.ip3 = ''
      this.ip4 = ''
      this.findOpsIpGroup()
    },
    // 搜索
    handleFilter() {
      this.$set(this.listQuery, 'page', 1)
      this.findOpsIpAddress()
    },
    // 打开编辑
    onEdit(val) {
      Object.keys(this.netSegmentForm).forEach(key => {
        this.$set(this.netSegmentForm, `${key}`, val[`${key}`])
        if ((key === 'areaId' || key === 'ipGroupId') && val[`${key}`] === 0) {
          this.$set(this.form, `${key}`, '')
        }
      })
      this.formId = val.id
      this.showNetSegmentDialog = true
      this.lastIpStorage = val
      this.findOpsIpGroup()
    },
    // 打开查看
    onDetail(val) {
      this.$EventBus.$emit('detail', val)
      console.log(val)
    },
    // 查询子网
    findOpsIpAddress(query) {
      // console.log(query)
      request({
        url: api.ipAddressManage.findOpsIpAddressNetSegment,
        data: query || this.listQuery
      }).then(async res => {
        if (res.code === 1) {
          this.listLoading = false
          const ids = []
          res.data.forEach(item => { ids.push(item.id) })
          const ipAddressDetailUsage = await this.getOpsIpAddressDetailUsage(ids.toString())
          res.data.forEach(item => {
            if (ipAddressDetailUsage[item.id].length > 0) {
              item.ipUsedCount = ipAddressDetailUsage[item.id][0].useCount ? Number(ipAddressDetailUsage[item.id][0].useCount) : 0
              item.ipDisableCount = ipAddressDetailUsage[item.id][0].total - item.ipUsedCount
            }
          })
          this.list = res.data
          this.fillerList = res.data
          this.total = Number(res.count)
        }
      })
    },

    // 获取区域
    loadOrgList() {
      request({ url: api.area.findHyitArea, data: {}})
        .then(res => {
          if (res.code === 1) {
            this.areaTreeArr = this.$tool.listToTree(res.data, 0, 0, 'hyAreaId', 'hyPid')
          }
        })
    },
    // 保存
    confirm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.calculation === null) return this.$message('请先计算IP')
          const data = { ...this.form }
          data.ipCount = this.calculation.useIp
          data.mask = this.calculation.mask
          data.net = this.calculation.netIp
          data.firstIp = this.calculation.startIP
          data.lastIp = this.calculation.endIP
          data.broadcastIp = this.calculation.broadcastIp
          if (data.ipGroupId === '' && data.ipGroupId === null) {
            data.ipGroupId = 0
          }
          request({ url: api.ipAddressManage.insertOpsIpAddress, data })
            .then(async res => {
              if (res.code === 1) {
                this.showIpDialog = false
                this.findOpsIpAddress()
                const ipNetSegment = await this.getOpsIpAddressNetSegment({ id: res.model.net })
                if (data.ipGroupId === 0) {
                  this.$EventBus.$emit('add-subnet-ip', { setInType: 'area', setInId: data.areaId, data: [ipNetSegment] })
                } else {
                  this.$EventBus.$emit('add-subnet-ip', { setInType: 'group', setInId: data.ipGroupId, data: [ipNetSegment] })
                }
              }
            })
        }
      })
    },
    // 获取分组
    async findOpsIpGroup(val) {
      const { code, data } = await request({
        url: api.ipAddressManage.findOpsIpGroup,
        data: {
          limit: -1
        }
      })
      if (code !== 1) return
      this.groupData = data
    },
    // 第二个输入框的删除事件
    fallbackIn2() {
      if (this.ip2) {
        return
      } else {
        // 将上一个输入框里面的ip清掉一个
        if (this.ip1) {
          // var ip1s = this.ip1 + "";
          // this.ipi = ip1s.substring(0,ip1s.length-1)
        }
        // 回退上一个输入框
        this.$refs.ip1.focus()
      }
    },
    // 第三个输入框的删除事件
    fallbackIn3() {
      if (this.ip3) {
        return
      } else {
        // 将上一个输入框里面的ip清掉一个
        if (this.ip2) {
          // var ip2s = this.ip2 + "";
          // this.ip2 = ip2s.substring(0,ip2s.length-1)
        }
        // 回退上一个输入框
        this.$refs.ip2.focus()
      }
    },
    // 第四个输入框的删除事件
    fallbackIn4(e) {
      console.log('事件', e)
      if (this.ip4) {
        return
      } else {
        // 将上一个输入框里面的ip清掉一个
        if (this.ip3) {
          // 默认是number类型，换成string
          // var ip3s = this.ip3 + "";
          // this.ip3 = ip3s.substring(0,ip3s.length-1)
        }
        // 回退上一个输入框
        this.$refs.ip3.focus()
      }
    },
    // 计算
    onCalculation() {
      if (this.form.maskBit < 20 || this.form.maskBit > 32) {
        // this.$message.error('掩码位大小不能小于20或者大于32')
        return
      }
      if (this.formId === '') {
        this.$refs.form.validateField(['ip', 'maskBit'])
        this.$set(this.form, 'ip', `${this.ip1}.${this.ip2}.${this.ip3}.${this.ip4}`)
      }
      if (this.form.ip !== '' && this.form.maskBit !== '') {
        request({ url: api.ipAddressManage.calculationOpsIpAddress, data: { ip: this.form.ip, maskBit: this.form.maskBit }})
          .then(res => {
            if (res.code === 1 && res.model) {
              this.calculation = JSON.parse(res.model)
            }
          })
      }
    },
    // // 生成导出数据
    // initFillerList(query) {
    //   request({
    //     url: api.ipAddressManage.findOpsIpAddress,
    //     data: query
    //   }).then(res => {
    //     if (res.code === 1) {
    //       this.fillerList = res.data
    //     }
    //   })
    // },
    // 生成导出数据
    exportFindOpsIpAddress(query) {
      console.log(query)
      request({
        url: api.ipAddressManage.findOpsIpAddressNetSegment,
        data: query || this.listNum
      }).then(async res => {
        if (res.code === 1) {
          const ids = []
          res.data.forEach(item => { ids.push(item.id) })
          const ipAddressDetailUsage = await this.getOpsIpAddressDetailUsage(ids.toString())
          res.data.forEach(item => {
            if (ipAddressDetailUsage[item.id].length > 0) {
              item.ipUsedCount = ipAddressDetailUsage[item.id][0].useCount ? Number(ipAddressDetailUsage[item.id][0].useCount) : 0
              item.ipDisableCount = ipAddressDetailUsage[item.id][0].total - item.ipUsedCount
            }
          })
          res.data.forEach(item => {
            item.netSegment = item.netSegment + '/255'
          })
          this.fillerList = res.data
          this.total = Number(res.count)
        }
      })
    },
    // 获取网关
    findHyitAgent() {
      request({
        url: api.itMonitor.findHyitAgent,
        data: { agentType: 1, agents: this.agentsIds, agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      }).then(res => {
        if (res.code === 1) {
          if (this.agentsIds) {
            let agentDataList = []
            let agentIdsList = this.agentsIds.split(',')
            res.data.forEach(item => {
              agentIdsList.forEach(itemVal => {
                if (Number(item.id) === Number(itemVal)) agentDataList.push(item)
              })
            })
            this.agentList = agentDataList
          } else {
            this.agentList = res.data
          }
        }
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
          url: api.ipAddressManage.deleteOpsIpAddressNetSegment,
          data: { id: val.id }
        }).then(({ code }) => {
          this.$message.success('删除成功')
          this.$nextTick(() => {
            this.findOpsIpAddress()
          })
          if (val.areaId) {
            this.$EventBus.$emit('delete-subnet-ip', { deleteInType: 'area', deletePId: val.areaId, deleteId: val.id })
          } else {
            this.$EventBus.$emit('delete-subnet-ip', { deleteInType: 'group', deletePId: val.ipGroupId, deleteId: val.id })
          }
        }, () => {
          this.$message.error('删除失败')
        })
      })
    },
    // 查询子网下的网段
    async findOpsIpAddressDetailNetSegment(query) {
      const { data, code } = await request({
        url: api.ipAddressManage.findOpsIpAddressDetailNetSegment,
        data: query
      })
      if (code !== 1) return
      return data
    },
    // 保存网段
    confirmNetSegment() {
      const data = { ...this.netSegmentForm }
      data.ipGroupId = typeof data.ipGroupId !== 'number' ? data.ipGroupId[data.ipGroupId.length - 1] : data.ipGroupId
      request({
        url: api.ipAddressManage.updateOpsIpAddressNetSegment,
        data: { id: this.formId, ...data }
      }).then(async res => {
        if (res.code === 1) {
          this.showNetSegmentDialog = false
          this.findOpsIpAddress()
          const ipNetSegment = await this.getOpsIpAddressNetSegment({ id: this.formId })
          if (data.ipGroupId !== 0) {
            this.$EventBus.$emit('update-subnet-ip', {
              fromType: this.lastIpStorage.areaId !== 0 ? 'area' : 'group',
              fromPid: this.lastIpStorage.areaId !== 0 ? this.lastIpStorage.areaId : this.lastIpStorage.ipGroupId,
              toType: 'group',
              toPid: data.ipGroupId,
              updateId: this.formId,
              data: ipNetSegment
            })
          } else {
            this.$EventBus.$emit('update-subnet-ip', {
              fromType: this.lastIpStorage.areaId !== 0 ? 'area' : 'group',
              fromPid: this.lastIpStorage.areaId !== 0 ? this.lastIpStorage.areaId : this.lastIpStorage.ipGroupId,
              toType: 'area',
              toPid: data.areaId,
              updateId: this.formId,
              data: ipNetSegment
            })
          }
        }
      })
    },
    // 查询子网网段
    async findOpsIpAddressNetSegment(query) {
      const { data, code } = await request({
        url: api.ipAddressManage.findOpsIpAddressNetSegment,
        data: query
      })
      if (code !== 1) return
      return data
    },
    // 查看子网网段
    async getOpsIpAddressNetSegment(query) {
      const { model, code } = await request({
        url: api.ipAddressManage.getOpsIpAddressNetSegment,
        data: query
      })
      if (code !== 1) return
      return model
    },
    // 获取网段统计
    async getOpsIpAddressDetailUsage(netSegmentIds) {
      const { code, map } = await request({ url: api.ipAddressManage.getOpsIpAddressDetailUsage, data: { netSegmentIds }})
      if (code !== 1) return
      return map
    }
  }
}
</script>

<style scoped>
</style>
