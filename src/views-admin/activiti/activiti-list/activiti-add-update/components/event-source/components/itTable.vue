<template>
  <div class="app-container">
    <!-- <div class="filter-container">
        <el-input
          v-model="listQuery.keyword"
          placeholder="请输入主机名称"
          style="width: 200px;"
          class="filter-item"
          clearable
          @keyup.enter.native="handleFilter"
        />
        <el-select v-model="listQuery.devType" placeholder="请选择设备类型" clearable class="filter-item" style="width: 200px">
          <el-option v-for="item in devTypeList" :key="item.id" :label="item.dictdataName" :value="item.id" />
        </el-select>
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      </div> -->
    <div class="table-wrapper">
      <el-table
        ref="table"
        :data="sliceTableData"
      >
        <el-table-column label="No" type="index" />
        <el-table-column label="主机名称" show-overflow-tooltip>
          <template slot-scope="{row}">
            <span>{{ row.hyMarkName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="主机IP" show-overflow-tooltip>
          <template slot-scope="{row}">
            <span>{{ row.hyIp }}</span>
          </template>
        </el-table-column>
        <el-table-column label="主机端口" show-overflow-tooltip>
          <template slot-scope="{row}">
            <span>{{ row.hyPort }}</span>
          </template>
        </el-table-column>
        <el-table-column label="主机类型" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ setHostType(scope.row.hyDevTypeId) }}
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="{row}">
            <el-tag :type="setHostStataTag(row)">
              {{ setHostStatus(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right">
          <template slot-scope="{$index}">
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteItem($index)" />
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="dynamicList.length > 0"
        :total="dynamicList.length"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        :auto-scroll="false"
      />
    </div>

  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { listToTree } from '@/utils/index'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import loadmore from '@/directive/el-select-loadmore/loadmore'
export default {
  name: 'ItTable',
  components: { Pagination },
  directives: { waves, loadmore },
  props: {
    dynamicList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      list: [],
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        agent: '',
        devType: '',
        // total: 0,
        keyword: '',
        hostType: 1
      },
      listTotal: 0,
      agentList: [],
      zbxHstgrp: [],
      availables: [
        {
          label: 'AGENT'
        },
        {
          label: 'SNMP'
        },
        {
          label: 'JMX'
        },
        {
          label: 'IPMI'
        }
      ],
      findZbxItemsQuery: {
        page: 1,
        limit: 10,
        hostid: '',
        total: 0,
        keyword: ''
      },
      zbxItemsList: [],
      findZbxTriggersQuery: {
        page: 1,
        limit: 10,
        hostid: '',
        total: 0,
        keyword: ''
      },
      zbxTriggers: [],
      fileList: [],
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
      zbxTriggersDetail: [],
      findZbxApplicationHostQuery: {
        page: 1,
        limit: 10,
        hostid: '',
        total: 0
      },
      zbxApplicationHost: [],
      devTypeList: [],
      getListPage: null,
      hostTemplate: [],
      showEditTemplateDialog: false,
      editTemplateForm: {
        id: '',
        catDevType: '',
        cmdbItemTypeId: ''
      },
      templateList: [],
      activeItemKey: '0',
      hostItemTypeList: [],
      classifyTreeList: [],
      allSelection: [],
      keyField: 'hyHostId',
      listField: 'list'
    }
  },
  computed: {
    sliceTableData() {
      return this.dynamicList.slice((this.listQuery.page - 1) * this.listQuery.limit, this.listQuery.limit * this.listQuery.page)
    },
    setHostStatus() {
      return function(row) {
        const count = row.hyAvailable + row.hySnmpAvailable + row.hyIpmiAvailable + row.hyJmxAvailable
        return row.hyDevTypeId === 478 ? row.hyNetState === 1 ? '在线' : '离线' : count === 1 ? '在线' : '离线'
      }
    },
    setHostStataTag() {
      return function(row) {
        const count = row.hyAvailable + row.hySnmpAvailable + row.hyIpmiAvailable + row.hyJmxAvailable
        return row.hyDevTypeId === 478 ? row.hyNetState === 1 ? 'success' : 'info' : count === 1 ? 'success' : 'info'
      }
    },
    setFlag() {
      return function(flag) {
        if (flag === 0) {
          return '模板配置'
        } else if (flag === 4) {
          return '自动发现'
        }
      }
    },
    // 设置主机类型
    setHostType() {
      return function(id) {
        const devTypeIdx = this.devTypeList.findIndex(item => item.id === id)
        if (devTypeIdx !== -1) {
          return id === 0 ? '' : this.devTypeList[devTypeIdx].dictdataName
        }
      }
    },
    setHostTemplate() {
      return function(id) {
        const idx = this.hostTemplate.findIndex(item => Number(item.zabbixTamplateId) === Number(id))
        if (idx !== -1) return this.hostTemplate[idx].name
      }
    },
    toStringKey() {
      return function(value) {
        return String(value)
      }
    }
  },
  async mounted() {
    await this.loadItType()
    await this.findCmdbItemType()
    // this.$nextTick(() => {
    //   this.$nextTick(async() => {
    //     await this.findHyitHost()
    //   })
    // })
  },
  methods: {
    deleteItem(index) {
      this.dynamicList.splice(index, 1)
    },
    async open() {
    },
    setAvailables(row, index) {
      let key = 'info'
      if (row.hyAvailable === 1 && index === 0 || row.hySnmpAvailable === 1 && index === 1 || row.hyJmxAvailable === 1 && index === 2 || row.hyIpmiAvailable === 1 && index === 3) {
        key = 'success'
      }
      if (row.hyAvailable === 2 && index === 0 || row.hySnmpAvailable === 2 && index === 1 || row.hyJmxAvailable === 2 && index === 2 || row.hyIpmiAvailable === 2 && index === 3) {
        key = 'danger'
      }
      return key
    },
    handleFilter() {
      this.listQuery.page = 1
      this.findHyitHost()
    },
    findHyitAgent() {
      request({
        url: api.itMonitor.findHyitAgent,
        data: { agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      }).then(res => {
        if (res.code === 1) {
          if (res.data.length > 0) {
            this.agentList = res.data
            this.listQuery.agent = res.data[0].id
          } else {
            this.listQuery.page = this.listQuery.page > 0 ? this.listQuery.page - 1 : 0
          }
        }
        this.findHyitHost()
      })
    },
    // handleSelect(selection, row) { // 单选
    //   let selected = this.allSelection.some(it => it[this.keyField] === row[this.keyField])
    //   if (!selected) this.allSelection.push(row)// 列表不存在加进去
    //   if (selected) this.allSelection = this.allSelection.filter(it => it[this.keyField] !== row[this.keyField])// 列表有的删除
    // },
    // handleSelectAll(val) { // 全选去重
    //   if (!val.length) { // 取消全选
    //     this.list.forEach(it => {
    //       const idx = this.allSelection.findIndex(selectit => selectit[this.keyField] === it[this.keyField])
    //       if (idx !== -1) this.allSelection.splice(idx, 1)
    //     })
    //     return
    //   }
    //   let setPagingSelection = [...this.allSelection, ...val]
    //   setPagingSelection = setPagingSelection.map(it => JSON.stringify(it))
    //   setPagingSelection = [...new Set(setPagingSelection)].map((item) => JSON.parse(item))
    //   this.allSelection = setPagingSelection
    // },
    // initTable() { // 勾选初始化
    //   console.log('执行', { 1: this.allSelection, 2: this.list })
    //   for (let i = 0; i < this.allSelection.length; i++) {
    //     for (let j = 0; j < this.list.length; j++) {
    //       if (this.allSelection[i][this.keyField] === this.list[j][this.keyField]) {
    //         console.log('找到了')
    //         this.$refs.table.toggleRowSelection(this.list[j], true)
    //       }
    //     }
    //   }
    // },
    // submit() {
    //   this.$emit('update:dynamicList', this.allSelection)
    //   this.$emit('close', false)
    // },
    findHyitHost() {
      return request({
        url: api.itMonitor.findHyitHost, data: { ...this.listQuery, agents: this.sessionStorageOperation('get', 'agentId') }
      }).then(res => {
        if (res.code === 1) {
          this.list = res.data
          this.listTotal = Number(res.count)
          this.listLoading = false
          const ids = []
          this.$nextTick(() => {
            this.initTable()
          })
          this.list.forEach(item => {
            if (ids.indexOf(item.hyDevTypeValue)) ids.push(item.hyDevTypeValue)
          })
          if (ids.length > 0) {
            this.findZbxTamplate(ids.toString())
          }
        }
      })
    },
    findHyitOrg() {
      request({
        url: api.area.findHyitArea, data: { limit: -1 }
      }).then(res => {
        this.orgList = res.data
        this.orgTreeList = listToTree(res.data, 0, 0, 'hyAreaId', 'hyPid')
      })
    },
    loadMoreAgent() {
      this.listQuery.page = this.listQuery.page + 1
      this.findHyitAgent()
    },
    openZbxItemsDialog(row) {
      this.findZbxItemsHostTag(row)
      this.showZbxItemsDialog = true
    },
    findZbxItems() {
      const params = { ...this.findZbxItemsQuery }
      delete params.total
      request({
        url: api.itMonitor.findZbxItemsHost,
        data: { ...params, agent: this.listQuery.agent }
      }).then(res => {
        this.listLoading = false
        this.zbxItemsList = res.data
        this.findZbxItemsQuery.total = Number(res.count)
      })
    },
    openZbxTriggersDialog(row) {
      this.shoeZbxTriggersDialog = true
      this.findZbxTriggersQuery.page = 1
      this.findZbxTriggersQuery.hostid = row.hyZhostId
      this.findZbxTriggers()
    },
    findZbxTriggers() {
      const params = { ...this.findZbxTriggersQuery }
      delete params.total
      request({
        url: api.itMonitor.findZbxTriggersHost,
        data: { ...params, agent: this.listQuery.agent }
      }).then(res => {
        this.listLoading = false
        this.zbxTriggers = res.data
        this.findZbxTriggersQuery.total = Number(res.count)
      })
    },
    openHostTemplateDialog(row) {
      this.findZbxTamplateList()
      const idx = this.hostTemplate.findIndex(item => Number(item.zabbixTamplateId) === Number(row.hyDevTypeValue))
      if (idx !== -1) {
        this.editTemplateForm = {
          id: this.hostTemplate[idx].id,
          catDevType: row.hyDevTypeId,
          cmdbItemSourceType: 2
        }
      }
      this.showEditTemplateDialog = true
    },
    findZbxApplicationHost() {
      const params = { ...this.findZbxApplicationHostQuery }
      delete params.total
      request({
        url: api.itMonitor.findZbxApplicationHost,
        data: { ...params, agent: this.listQuery.agent }
      }).then(res => {
        this.listLoading = false
        this.zbxApplicationHost = res.data
        this.findZbxApplicationHostQuery.total = Number(res.count)
      })
    },
    getZbxItems(row) {
      this.showZbxItemsDetail = true
      request({
        url: api.itMonitor.getZbxItemsHost,
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
        url: api.itMonitor.getZbxTriggersHost,
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
    goBack() {
      this.$router.go(-1)
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
    findZbxTamplate(zabbixTamplateIds) {
      request({
        url: api.itMonitor.findZbxTamplate,
        data: { zabbixTamplateIds, ageng: this.$route.query.id, page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.hostTemplate = res.data
        }
      })
    },
    findZbxItemsHostTag(row) {
      request({
        url: api.itMonitor.findZbxItemsHostTag,
        data: { page: 1, limit: -1, hostid: row.hyZhostId }
      }).then(res => {
        if (res.code === 1) {
          this.hostItemTypeList = res.data
          this.findZbxItemsQuery.page = 1
          this.findZbxItemsQuery.hostid = row.hyZhostId
          this.findZbxItemsQuery.tag = res.data[0].sslCertFile
          this.findZbxItems()
        }
      })
    },
    confirmEditImportFileDialog() {
      request({
        url: api.itMonitor.updateZbxTamplate,
        data: this.editTemplateForm
      }).then(res => {
        if (res.code === 1) {
          this.showEditTemplateDialog = false
          this.$message.success('编辑成功')
          this.listQuery.page = 1
          this.findHyitHost()
        }
      })
    },
    findZbxTamplateList() {
      request({
        url: api.itMonitor.findZbxTamplate,
        data: { page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.templateList = res.data
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
.filter-container {
  padding-top: 14px
}
</style>
