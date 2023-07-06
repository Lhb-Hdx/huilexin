<template>
  <div class="app-container">
    <el-page-header content="模板" @back="goBack" />
    <div class="filter-container">
      <el-button v-waves v-permission="['Import']" class="filter-item" type="primary" icon="el-icon-plus" @click="openImportFileDialog">导入</el-button>
      <el-input v-model="listQuery.keyword" v-permission="['Search']" placeholder="请输入模板名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves v-permission="['Search']" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        :data="templateList"
        fit
        highlight-current-row
      >
        <el-table-column label="序号" width="80" type="index" />
        <el-table-column label="模板名称" show-overflow-tooltip>
          <template slot-scope="{row}">
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="设备类型" show-overflow-tooltip>
          <template slot-scope="{row}">
            <span>{{ setCatDevType(row.catDevType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="监控项" show-overflow-tooltip>
          <template slot-scope="{row}">
            <el-button type="text" size="mini" @click="openZbxItemsDialog(row)">{{ row.itemCount }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="触发器" show-overflow-tooltip>
          <template slot-scope="{row}">
            <el-button type="text" size="mini" @click="openZbxTriggersDialog(row)">{{ row.triggerCount }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="备注" show-overflow-tooltip>
          <template slot-scope="{row}">
            <span>{{ row.hyDevTypeName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-permission="['Edit']" type="primary" size="mini" @click="onEdit(row)">编辑</el-button>
            <el-button v-permission="['Delete']" type="danger" size="mini" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="listQuery.total > 0" :auto-scroll="false" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findZbxTamplate" />
    </div>
    <el-dialog title="监控项" :visible.sync="showZbxItemsDialog" top="5vh">
      <el-tabs v-model="activeItemKey" @tab-click="handleClickItemKey">
        <el-tab-pane v-for="(item, index) in hostItemTypeList" :key="index" :label="item.sslCertFile" :name="toStringKey(index)" />
      </el-tabs>
      <div v-loading="listLoading" class="table-wrapper">
        <el-table
          :data="zbxItemsList"
          fit
          highlight-current-row
        >
          <el-table-column label="序号" width="80" type="index" />
          <el-table-column label="监控项名称" prop="name" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span>{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="监控项周期" prop="delay" width="120" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span>{{ row.delay }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" prop="status" width="120" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                :active-value="0"
                :inactive-value="1"
                @change="changeZbxItemsStatus(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" class-name="small-padding fixed-width">
            <template slot-scope="{row}">
              <el-button type="primary" size="mini" @click="getZbxItems(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="findZbxItemsQuery.total > 0" :auto-scroll="false" :total="findZbxItemsQuery.total" :page.sync="findZbxItemsQuery.page" :limit.sync="findZbxItemsQuery.limit" @pagination="findZbxItems" />
      </div>
    </el-dialog>
    <el-dialog title="触发器" :visible.sync="shoeZbxTriggersDialog" top="5vh">
      <div v-loading="listLoading" class="table-wrapper">
        <el-table
          :data="zbxTriggers"
          fit
          highlight-current-row
        >
          <el-table-column label="序号" width="80" type="index" />
          <el-table-column label="触发器名称" prop="name" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span>{{ row.description }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" prop="status" width="120" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                :active-value="0"
                :inactive-value="1"
                @change="changeZbxTriggersStatus(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" class-name="small-padding fixed-width">
            <template slot-scope="{row}">
              <el-button type="primary" size="mini" @click="getZbxTriggers(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="findZbxTriggersQuery.total>0" :auto-scroll="false" :total="findZbxTriggersQuery.total" :page.sync="findZbxTriggersQuery.page" :limit.sync="findZbxTriggersQuery.limit" @pagination="findZbxTriggers" />
      </div>
    </el-dialog>
    <el-dialog title="导入模板" :visible.sync="showImportFileDialog" width="30%" top="5vh">
      <el-form label-width="110px">
        <el-form-item label="设备类型">
          <el-select
            v-model="catDevTypeId"
            placeholder="请选择设备类型"
            style="width: 100%;"
          >
            <el-option
              v-for="item in devTypeList"
              :key="item.id"
              :label="item.dictdataName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="模板文件">
          <el-upload
            class="upload-demo"
            action
            accept=".json,.xml,.yaml"
            :http-request="upload"
            :on-change="handleChange"
            :file-list="fileList"
          >
            <el-button size="mini" type="primary">选择文件导入</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="对应配置类目" prop="cmdbItemTypeId">
          <el-select
            v-model="cmdbItemTypeId"
            placeholder="请选择配置类目"
            style="width: 100%;"
          >
            <el-option
              v-for="item in classifyTreeList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showImportFileDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="confirmImportFile">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑模板" :visible.sync="showEditTemplateDialog" width="30%" top="5vh">
      <el-form label-width="110px">
        <el-form-item label="设备类型">
          <el-select
            v-model="catDevTypeId"
            placeholder="请选择设备类型"
            style="width: 100%;"
          >
            <el-option
              v-for="item in devTypeList"
              :key="item.id"
              :label="item.dictdataName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="设备子类型">
          <el-select
            v-model="subDevType"
            placeholder="请选择设备子类型"
            style="width: 100%;"
          >
            <el-option
              v-for="item in subtypeList"
              :key="item.id"
              :label="item.dictdataName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showEditTemplateDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="confirmEditImportFileDialog">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="监控项详情" :visible.sync="showZbxItemsDetail" top="5vh">
      <div class="table-wrapper">
        <el-table
          :data="zbxItemsDetail"
          fit
          border
          highlight-current-row
          :show-header="false"
        >
          <el-table-column label="属性" prop="name" width="120" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span>{{ row.label }}：</span>
            </template>
          </el-table-column>
          <el-table-column label="值" prop="name" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span>{{ row.value }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
    <el-dialog title="触发器详情" :visible.sync="showZbxTriggersDetail" top="5vh">
      <div class="table-wrapper">
        <el-table
          :data="zbxTriggersDetail"
          fit
          border
          highlight-current-row
          :show-header="false"
        >
          <el-table-column label="属性" prop="name" width="120" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span>{{ row.label }}：</span>
            </template>
          </el-table-column>
          <el-table-column label="值" prop="name" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span>{{ row.value }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import loadmore from '@/directive/el-select-loadmore/loadmore'

export default {
  name: 'SubSystem',
  components: { Pagination },
  directives: { waves, loadmore },
  data() {
    return {
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        agent: '',
        total: 0,
        keyword: ''
      },
      agentList: [],
      templateList: [],
      showImportFileDialog: false,
      showZbxItemsDialog: false,
      findZbxItemsQuery: {
        page: 1,
        limit: 10,
        templateid: '',
        total: 0,
        keyword: ''
      },
      zbxItemsList: [],
      findZbxTriggersQuery: {
        page: 1,
        limit: 10,
        templateid: '',
        total: 0,
        keyword: ''
      },
      zbxTriggers: [],
      shoeZbxTriggersDialog: false,
      fileList: [],
      showZbxItemsDetail: false,
      zbxItemsDetail: [],
      zbxItemType: [
        { value: 0, label: 'Zabbix agent' },
        { value: 1, label: 'SNMPv1 agent' },
        { value: 2, label: 'Zabbix trapper' },
        { value: 3, label: 'simple check' },
        { value: 4, label: 'SNMPv2 agent' },
        { value: 5, label: 'Zabbix internal' },
        { value: 6, label: 'SNMPv3 agent' },
        { value: 7, label: 'Zabbix agent (active)' },
        { value: 8, label: 'Zabbix aggregate' },
        { value: 9, label: 'web item' },
        { value: 10, label: 'external check' },
        { value: 11, label: 'database monitor' },
        { value: 12, label: 'IPMI agent' },
        { value: 13, label: 'SSH agent' },
        { value: 14, label: 'TELNET agent' },
        { value: 15, label: 'calculated' },
        { value: 16, label: 'JMX agent' },
        { value: 17, label: 'SNMP trap' },
        { value: 18, label: 'Dependent item' },
        { value: 19, label: 'HTTP agent' }
      ],
      showZbxTriggersDetail: false,
      zbxTriggersDetail: [],
      devTypeList: [], // 设备列表
      subtypeList: [], // 设备子类型列表
      showEditTemplateDialog: false,
      catDevTypeId: '',
      chooseHyitOrg: '', // 选择设备类型
      filters: [], // 筛选后设备子类型列表。
      subDevType: '', // 设备子类型。
      templateId: '',
      fdata: null,
      activeItemKey: '0',
      hostItemTypeList: [],
      classifyTreeList: [],
      cmdbItemTypeId: ''
    }
  },
  computed: {
    setCatDevType() {
      return function(id) {
        const idx = this.devTypeList.findIndex(item => item.id === id)
        if (idx !== -1) {
          return this.devTypeList[idx].dictdataName
        }
      }
    },
    toStringKey() {
      return function(value) {
        return String(value)
      }
    }
  },
  watch: {
    catDevTypeId(n) { // 部门修改更新对应的部门人员列表
      this.loadSubType(n)
    }
  },
  created() {
    this.$set(this.listQuery, 'agent', this.$route.query.id)
    this.findZbxTamplate()
    this.loadDevType()
    this.loadSubType()
    this.findCmdbItemType()
  },
  methods: {
    findHyitAgent() {
      request({
        url: api.itMonitor.findHyitAgent,
        data: { agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      }).then(res => {
        if (res.code === 1) {
          if (res.data.length > 0) {
            this.agentList.push(...res.data)
            this.listQuery.agent = res.data[0].id
          } else {
            this.listQuery.page = this.listQuery.page > 0 ? this.listQuery.page - 1 : 0
          }
        }
        this.findZbxTamplate()
      })
    },
    findZbxTamplate() {
      request({
        url: api.itMonitor.findZbxTamplate,
        data: { ...this.listQuery }
      }).then(res => {
        this.listLoading = false
        this.templateList = res.data
        this.listQuery.total = Number(res.count)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.findZbxTamplate()
    },
    onDelete(row) {
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(res => {
        request({
          url: api.itMonitor.agentDeleteTamplate, data: { agent: row.agent, tamplateid: row.zabbixTamplateId }
        }).then(res => {
          if (res.code === 1) {
            this.$message.success('删除成功')
            this.findZbxTamplate()
          }
        })
      }).catch(res => {
        this.$message.error(res.msg)
      })
    },
    openZbxItemsDialog(row) {
      this.findZbxItemsTag(row)
      this.showZbxItemsDialog = true
    },
    findZbxItems() {
      const params = { ...this.findZbxItemsQuery }
      delete params.total
      request({
        url: api.itMonitor.findZbxItems,
        data: { ...params, agent: this.listQuery.agent }
      }).then(res => {
        this.listLoading = false
        this.zbxItemsList = res.data
        this.findZbxItemsQuery.total = Number(res.count)
      })
    },
    openZbxTriggersDialog(row) {
      this.shoeZbxTriggersDialog = true
      this.findZbxTriggersQuery.templateid = row.zabbixTamplateId
      this.findZbxTriggers()
    },
    findZbxTriggers() {
      const params = { ...this.findZbxTriggersQuery }
      delete params.total
      request({
        url: api.itMonitor.findZbxTriggers,
        data: { ...params, agent: this.listQuery.agent }
      }).then(res => {
        this.listLoading = false
        this.zbxTriggers = res.data
        this.findZbxTriggersQuery.total = Number(res.count)
      })
    },
    // 选择图片
    handleChange(file, fileList) {
      this.fileList = fileList.slice(-3)
    },
    // 上传文件
    upload(param) {
      let format = ''
      if (param.file.type === 'application/json') {
        format = 'json'
      } else if (param.file.type === 'text/xml') {
        format = 'xml'
      } else if (param.file.type === 'application/x-yaml') {
        format = 'yaml'
      }
      const fdata = new FormData()
      fdata.append('file', param.file)
      fdata.append('devType', this.catDevTypeId)
      fdata.append('agent', this.listQuery.agent)
      fdata.append('cmdbItemSourceType', 2)
      fdata.append('cmdbItemTypeId', this.cmdbItemTypeId)
      fdata.append('format', format)
      this.fdata = fdata
    },
    getZbxItems(row) {
      this.showZbxItemsDetail = true
      request({
        url: api.itMonitor.getZbxItems,
        data: { itemid: row.itemid, agent: this.listQuery.agent }
      }).then(res => {
        if (res.code === 1) {
          const typeIndex = this.zbxItemType.findIndex(item => {
            return item.value === res.model.type
          })
          this.zbxItemsDetail = [
            { label: '监控项名称', value: res.model.name },
            { label: '监控项周期', value: res.model.delay },
            { label: '监控项类型', value: res.model.status },
            { label: '监控项状态', value: this.zbxItemType[typeIndex].label }
          ]
        }
      })
    },
    getZbxTriggers(row) {
      this.showZbxTriggersDetail = true
      request({
        url: api.itMonitor.getZbxTriggers,
        data: { triggerid: row.triggerid, agent: this.listQuery.agent }
      }).then(res => {
        if (res.code === 1) {
          this.zbxTriggersDetail = [
            { label: '触发器名称', value: res.model.description },
            { label: '触发器表达式', value: res.model.expression },
            { label: '触发器状态', value: res.model.status }
          ]
        }
      })
    },
    changeZbxItemsStatus(row) {
      request({
        url: api.itMonitor.agentEnableItem,
        data: { itemid: row.itemid, enableItem: row.status, agent: this.listQuery.agent }
      }).then(res => {
        if (res.code === 1) {
          const messageTxt = row.status === 0 ? '关闭成功' : '启用成功'
          this.$message.success(messageTxt)
          this.findZbxItemsQuery.page = 1
          this.findZbxItems()
        }
      })
    },
    changeZbxTriggersStatus(row) {
      request({
        url: api.itMonitor.agentEnableTrigger,
        data: { triggerid: row.triggerid, enableTrigger: row.status, agent: this.listQuery.agent }
      }).then(res => {
        if (res.code === 1) {
          const messageTxt = row.status === 0 ? '关闭成功' : '启用成功'
          this.$message.success(messageTxt)
          this.findZbxItemsQuery.page = 1
          this.findZbxItems()
        }
      })
    },
    loadMoreAgent() {
      this.listQuery.page = this.listQuery.page + 1
      this.findHyitAgent()
    },
    loadDevType() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.devTypeList = res.data
        }
      })
    },
    loadSubType(n) {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { limit: -1, pid: n }
      }).then(res => {
        if (res.code === 1) {
          this.subtypeList = res.data
        }
      })
    },
    confirmImportFile() {
      if (this.fdata === null) {
        this.$message.warning('请选择模板文件')
        return
      }
      if (this.catDevTypeId === '') {
        this.$message.warning('请选择设备类型')
        return
      }
      request({
        url: `${process.env.VUE_APP_BASE_API}/admin/agentImportTamplate`, data: this.uploadToken, form: this.fdata
      }).then(res => {
        if (res.code === 1) {
          this.showImportFileDialog = false
          this.listQuery.page = 1
          this.findHyitAgent()
          this.$message.success('导入成功')
          this.fdata = null
          this.catDevTypeId = ''
          this.fileList = []
        } else {
          this.$message.error('导入失败')
        }
      })
    },
    onEdit(row) {
      this.showEditTemplateDialog = true
      this.catDevTypeId = row.catDevType
      this.subDevType = row.subDevType
      this.templateId = row.id
    },
    confirmEditImportFileDialog() {
      request({
        url: api.itMonitor.updateZbxTamplate,
        data: { id: this.templateId, catDevType: this.catDevTypeId, subDevType: this.subDevType }
      }).then(res => {
        if (res.code === 1) {
          this.findZbxItemsQuery.page = 1
          this.findZbxTamplate()
          this.showEditTemplateDialog = false
          this.$message.success('编辑成功')
        }
      })
    },
    openImportFileDialog() {
      this.showImportFileDialog = true
      this.catDevTypeId = ''
    },
    goBack() {
      this.$router.go(-1)
    },
    findZbxItemsTag(row) {
      request({
        url: api.itMonitor.findZbxItemsTag,
        data: { page: 1, limit: -1, templateid: row.zabbixTamplateId }
      }).then(res => {
        if (res.code === 1) {
          this.hostItemTypeList = res.data
          this.findZbxItemsQuery.page = 1
          this.findZbxItemsQuery.templateid = row.zabbixTamplateId
          this.findZbxItemsQuery.tag = res.data[0].sslCertFile
          this.findZbxItems()
        }
      })
    },
    handleClickItemKey(value) {
      this.findZbxItemsQuery.page = 1
      this.findZbxItemsQuery.tag = this.hostItemTypeList[value.index].sslCertFile
      this.findZbxItems()
    },
    // 获取类目列表
    findCmdbItemType() {
      request({
        url: api.cmdb.findCmdbItemType,
        data: {
          page: 1,
          limit: -1,
          parentId: 6
        }
      }).then(res => {
        if (res.code === 1) {
          this.classifyTreeList = res.data
        } else {
          this.$message.error(res.msg)
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.status-0{color: red;}
.status-1{color: green;}
.status-2{color: gray;}
.filter-container {padding-top: 14px}
</style>
