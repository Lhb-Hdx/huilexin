<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-waves v-permission="['Add']" class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
      <el-select v-model="listQuery.agent" placeholder="请选择网关" clearable class="filter-item" style="width: 200px">
        <el-option label="全部网关" value="" />
        <el-option v-for="item in itAgentList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-input v-model="listQuery.keyword" v-permission="['Search']" placeholder="请输入主机名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.devType" v-permission="['Search']" placeholder="请选择设备类型" clearable class="filter-item" style="width: 200px">
        <el-option label="全部类型" value="" />
        <el-option v-for="item in devTypeList" :key="item.id" :label="item.dictdataName" :value="item.id" />
      </el-select>
      <el-button v-waves v-permission="['Search']" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-download" @click="onBulkImportModal">批量导入</el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-download" @click="download">下载模板</el-button>
      <!-- <OutputExcel ref="outputExcel" @submitQuery="submitQuery" /> -->
      <ExportExcel class="filter-item" :fillter-list="fillerList" :excel-title="ExcelTitle" :file-name="exportFileName" />
      <el-dropdown type="primary" split-button class="filter-item" @command="handlerBatch">
        批量操作
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="org">区域分配</el-dropdown-item>
          <el-dropdown-item command="assets">批量转资产</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <ListControl :check-list="checkList" :storage-val="storageVal" @setLists="setLists" />
      <!-- <el-button class="filter-item" type="primary" @click="onBatchTransferAssets">批量转资产</el-button> -->
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        ref="table"
        :data="list"
        @select="handleSelect"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" width="250" align="left" label="主机名称" show-overflow-tooltip>
          <template slot-scope="{row}">
            <el-link type="primary" @click="handlerToItMonitorDevice(row)">{{ row.hyMarkName }}</el-link>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="left" label="所属网关" show-overflow-tooltip>
          <template slot-scope="{row}">
            <span>{{ setHostAgent(row.agent) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="right" label="主机IP" show-overflow-tooltip>
          <template slot-scope="{row}">
            <span>{{ row.hyIp }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="right" label="主机端口" show-overflow-tooltip>
          <template slot-scope="{row}">
            <span>{{ row.hyPort }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="left" label="主机类型" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ setHostType(scope.row.hyDevTypeId) }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="监控可用性" width="220px" show-overflow-tooltip>
          <template slot-scope="{row}">
            <sapn v-if="row.hyAvailable && row.hyAvailable !== 0|| row.hySnmpAvailable&& row.hySnmpAvailable !== 0 ||row.hyJmxAvailable&& row.hyJmxAvailable !== 0 ||row.hyIpmiAvailable&& row.hyIpmiAvailable !== 0 " class="aaa" :style="{'background-color': color}">
              {{ setUsability(row) }}
            </sapn>
          </template>
        </el-table-column> -->
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="left" label="监控可用性" width="240px" show-overflow-tooltip>
          <template slot-scope="{row}">
            <el-tag
              v-for="(item, index) in availables"
              :key="item.label"
              size="mini"
              :type="setAvailables(row, index)"
              effect="dark"
              style="margin-right: 5px;"
            >
              {{ item.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" align="left" label="引用模板" show-overflow-tooltip>
          <template slot-scope="{row}">
            <el-button class="overflow-text-a width-100 text-left" type="text" size="mini" @click="openHostTemplateDialog(row)">{{ setHostTemplate(row.hyDevTypeValue) }}</el-button>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[7].ispass : true" align="right" label="监控项" show-overflow-tooltip>
          <template slot-scope="{row}">
            <el-button type="text" size="mini" @click="openZbxItemsDialog(row)">{{ row.hyItemCount }}</el-button>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[8].ispass : true" align="right" label="触发器" show-overflow-tooltip>
          <template slot-scope="{row}">
            <el-button type="text" size="mini" @click="openZbxTriggersDialog(row)">{{ row.hyTriggerCount }}</el-button>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[9].ispass : true" align="left" label="在线状态">
          <template slot-scope="{row}">
            <el-tag :type="setHostStataTag(row)">
              {{ setHostStatus(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="操作" width="250" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-permission="['Edit']" type="primary" size="mini" @click="handleUpdate(row)">
              修改
            </el-button>
            <el-button v-permission="['Config']" type="primary" size="mini" @click="handleConfig(row)">
              展示配置
            </el-button>
            <el-button v-permission="['Delete']" size="mini" type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="listTotal > 0" :auto-scroll="false" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findHyitHost" />
    </div>
    <el-dialog title="应用集" :visible.sync="showZbxApplicationHostDialog" top="5vh">
      <div v-loading="listLoading" class="table-wrapper">
        <el-table
          :data="zbxApplicationHost"
          fit
          highlight-current-row
        >
          <el-table-column label="序号" width="80" type="index" />
          <el-table-column label="应用集名称" prop="name" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span>{{ row.name }}</span>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="findZbxApplicationHostQuery.total > 0" :auto-scroll="false" :total="findZbxApplicationHostQuery.total" :page.sync="findZbxApplicationHostQuery.page" :limit.sync="findZbxApplicationHostQuery.limit" @pagination="findZbxApplicationHost" />
      </div>
    </el-dialog>
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
          <el-table-column label="监控项类型" prop="delay" width="120" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span>{{ setFlag(row.flags) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" prop="status" width="100" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                :active-value="0"
                :inactive-value="1"
                @change="changeZbxItemsStatus(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" class-name="small-padding fixed-width">
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
          <el-table-column label="状态" prop="status" width="100" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                :active-value="0"
                :inactive-value="1"
                @change="changeZbxTriggersStatus(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" class-name="small-padding fixed-width">
            <template slot-scope="{row}">
              <el-button type="primary" size="mini" @click="getZbxTriggers(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="findZbxTriggersQuery.total>0" :auto-scroll="false" :total="findZbxTriggersQuery.total" :page.sync="findZbxTriggersQuery.page" :limit.sync="findZbxTriggersQuery.limit" @pagination="findZbxTriggers" />
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
          <el-table-column label="属性" prop="name" width="120">
            <template slot-scope="{row}">
              <span>{{ row.label }}：</span>
            </template>
          </el-table-column>
          <el-table-column label="值" prop="name">
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
          <el-table-column label="属性" prop="name" width="120">
            <template slot-scope="{row}">
              <span>{{ row.label }}：</span>
            </template>
          </el-table-column>
          <el-table-column label="值" prop="name">
            <template slot-scope="{row}">
              <span>{{ row.value }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
    <el-dialog title="编辑模板" :visible.sync="showEditTemplateDialog" width="30%" top="5vh">
      <el-form ref="editTemplateForm" label-width="110px" :rules="editTemplateFormRule" :model="editTemplateForm">
        <el-form-item label="设备类型" prop="catDevType">
          <el-select
            v-model="editTemplateForm.catDevType"
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
            v-model="editTemplateForm.subDevType"
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
        <el-form-item label="对应配置类目" prop="cmdbItemTypeId">
          <el-select
            v-model="editTemplateForm.cmdbItemTypeId"
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
        <el-button @click="showEditTemplateDialog = false">取 消</el-button>
        <el-button class="filter-item" :loading="dialogLoading" type="primary" @click="confirmEditImportFileDialog">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 批量导入 -->
    <el-dialog title="导入" :visible.sync="bulkImportModal">
      <el-form ref="rulesBulk" :model="bulkImport" :rules="rulesBulk">
        <el-form-item label="选择文件" :label-width="formLabelWidth">
          <el-upload
            class="upload-demo text-left"
            action
            accept=".xls,.xlsx"
            :http-request="upload"
            :on-change="changeUpload"
            :file-list="fileList"
          >
            <el-button size="small" type="primary">选择文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <div class="isSynStyle">
        <el-checkbox v-model="isSyn" :true-label="1" :false-label="0">是否同步添加到网关</el-checkbox>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="bulkImportModal = false">取 消</el-button>
        <el-button type="primary" @click="toLead('rulesBulk')">导 入</el-button>
      </div>
    </el-dialog>
    <el-dialog title="区域分配" :visible.sync="showSetOrgDialog" width="30%" top="5vh">
      <el-form ref="UpdateHyitHostOrgForm" label-width="110px" :rules="UpdateHyitHostOrgFormRule" :model="UpdateHyitHostOrgForm">
        <el-form-item label="区域" prop="orgId">
          <el-cascader
            v-model="UpdateHyitHostOrgForm.orgId"
            clearable
            class="filter-item"
            multiple="false"
            :options="areaTreeArr"
            :props="orgProps"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showSetOrgDialog = false">取 消</el-button>
        <el-button class="filter-item" :loading="dialogLoading" type="primary" @click="confirmSetOrgDialog">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { listToTree } from '@/utils/index'
// import OutputExcel from '@/components/outputExcel/index.vue'
import ExportExcel from '@/components/ExportExcel/export-excel'

import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import loadmore from '@/directive/el-select-loadmore/loadmore'
import ListControl from '@/components/ListControl'

let getListPage = null

export default {
  name: 'BusinessConfig',
  components: { Pagination, ExportExcel, ListControl},
  directives: { waves, loadmore },
  data() {
    return {
      list: [],
      listLoading: true,
      subDevType: '', // 选择的设备子类型。
      subtypeList: [], // 设备子类型列表
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
      itAgentList: [],
      fillerList: [],
      exportFileName: '主机列表',
      ExcelTitle: [
        {
          title: '主机名称',
          dataIndex: 'hyMarkName'
        },
        {
          title: '所属网关',
          dataIndex: 'agent'
        },
        {
          title: '主机IP',
          dataIndex: 'hyIp'
        },
        {
          title: '主机端口',
          dataIndex: 'hyPort'
        },
        {
          title: '主机类型',
          dataIndex: 'hyDevTypeId'
        },
        {
          title: 'AGENT',
          dataIndex: 'hyAvailable'
        },
        {
          title: 'SNMP',
          dataIndex: 'hySnmpAvailable'
        },
        {
          title: 'JMX',
          dataIndex: 'hyJmxAvailable'
        },
        {
          title: 'IPMI',
          dataIndex: 'hyIpmiAvailable'
        },
        {
          title: '引用模板',
          dataIndex: 'hyDevTypeValue'
        },
        {
          title: '监控项',
          dataIndex: 'hyItemCount'
        },
        {
          title: '触发器',
          dataIndex: 'hyTriggerCount'
        },
        {
          title: '状态',
          dataIndex: 'state'
        }
      ],
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
      showZbxItemsDialog: false,
      findZbxItemsQuery: {
        page: 1,
        limit: 10,
        hostid: '',
        total: 0,
        keyword: ''
      },
      formLabelWidth: '120px',
      bulkImportModal: false, // 导入
      bulkImport: { // 导入参数
        name: ''
      },
      isSyn: 0,
      rulesBulk: {
        name: [
          { required: true, message: '请选择文件', trigger: 'blur' }
        ]
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
      shoeZbxTriggersDialog: false,
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
      showZbxApplicationHostDialog: false,
      findZbxApplicationHostQuery: {
        page: 1,
        limit: 10,
        hostid: '',
        total: 0
      },
      color: '',
      fileList: [],
      zbxApplicationHost: [],
      devTypeList: [],
      getListPage: null,
      hostTemplate: [],
      showEditTemplateDialog: false,
      editTemplateForm: {
        id: '',
        catDevType: '',
        cmdbItemTypeId: '',
        subDevType: '' // 选择的设备子类型。
      },
      templateList: [],
      activeItemKey: '0',
      hostItemTypeList: [],
      classifyTreeList: [],
      ideField: 'hyHostId', // 匹配的字段，用id
      allSelection: [], // 所有页面选择的
      showSetOrgDialog: false,
      UpdateHyitHostOrgForm: {
        orgId: ''
      },
      areaTreeArr: [],
      orgProps: { label: 'hyAreaName', value: 'hyAreaId', checkStrictly: true },
      UpdateHyitHostOrgFormRule: {
        orgId: [
          { required: true, message: '请选择区域', trigger: 'blur' }
        ]
      },
      editTemplateFormRule: {
        catDevType: [
          { required: true, message: '请选择设备类型', trigger: 'blur' }
        ],
        cmdbItemTypeId: [
          { required: true, message: '请选择配置类目', trigger: 'blur' }
        ]
      },
      dialogLoading: false,
      hostAgent: [],
      handlerHost: {}, // 点击的主机
      // 显示控制数据 start
      checkList: ['主机名称', '所属网关', '主机IP', '主机端口', '主机类型', '监控可用性', '引用模板', '监控项', '触发器', '在线状态', '操作'],
      lists: [],
      storageVal: 'agent-monitor-host-li' // 存入localStorageOperation的名字
      // 显示控制数据 end
    }
  },
  computed: {
    setHostStatus() {
      return function(row) {
        // const count = row.hyAvailable + row.hySnmpAvailable + row.hyIpmiAvailable + row.hyJmxAvailable
        // return row.hyDevTypeId === 478 || row.hyDevTypeId === 483 ? row.hyNetState === 1 ? '在线' : '离线' : count === 1 ? '在线' : '离线'
        return row.hyNetState === 1 ? '在线' : '离线'
      }
    },
    setHostStataTag() {
      return function(row) {
        // const count = row.hyAvailable + row.hySnmpAvailable + row.hyIpmiAvailable + row.hyJmxAvailable
        // return row.hyDevTypeId === 478 || row.hyDevTypeId === 483 ? row.hyNetState === 1 ? 'success' : 'info' : count === 1 ? 'success' : 'info'
        return row.hyNetState === 1 ? 'success' : 'info'
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
    },
    setUsability() {
      return function(row) {
        if (row.hyAvailable === 1 || row.hyAvailable === 2) {
          return 'AGENT'
        } else if (row.hySnmpAvailable === 1 || row.hySnmpAvailable === 2) {
          return 'SNMP'
        } else if (row.hyJmxAvailable === 1 || row.hyJmxAvailable === 2) {
          return 'JMX'
        } else if (row.hyIpmiAvailable === 1 || row.hyIpmiAvailable === 2) {
          return 'IPMI'
        }
        if (row.hyAvailable === 1 || row.hySnmpAvailable === 1 || row.hyJmxAvailable === 1 || row.hyIpmiAvailable === 1) {
          this.color = 'green'
        } else if (row.hyAvailable === 2 || row.hySnmpAvailable === 2 || row.hyJmxAvailable === 2 || row.hyIpmiAvailable === 2) {
          this.color = 'red'
        }
      }
    },
    setHostAgent() {
      return function(id) {
        const idx = this.hostAgent.findIndex(item => +item.id === +id)
        return idx !== -1 ? this.hostAgent[idx].name : ''
      }
    }
  },
  watch: {
    editTemplateForm: {
      immediate: true,
      deep: true,
      handler(newValue, oldValue) {
        this.loadSubType(newValue.catDevType)
      }
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      this.listQuery = pageQuery
    }
    if (getListPage) {
      this.$set(this.listQuery, 'page', getListPage)
    }
  },
  mounted() {
    this.loadItType()
    // this.$set(this.listQuery, 'agent', this.$route.query.id)
    this.findHyitHost()
    this.findCmdbItemType()
    this.loadOrgList()
    this.findHyitAgentData()
  },
  beforeRouteEnter(to, from, next) {
    getListPage = from.params.listPage
    next() // 必需调用
  },
  methods: {
    setLists(val) {
      this.lists = val
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
    // 导出
    async submitQuery(excelQuery) {
      const data = await this.exportFindHyitHost(excelQuery)
      const excelTitle = [
        {
          title: '主机名称',
          dataIndex: 'hyMarkName'
        },
        {
          title: '主机IP',
          dataIndex: 'hyIp'
        },
        {
          title: '主机端口',
          dataIndex: 'hyPort'
        },
        {
          title: '主机类型',
          dataIndex: 'hyDevTypeId'
        },
        {
          title: 'AGENT',
          dataIndex: 'hyAvailable'
        },
        {
          title: 'SNMP',
          dataIndex: 'hySnmpAvailable'
        },
        {
          title: 'JMX',
          dataIndex: 'hyJmxAvailable'
        },
        {
          title: 'IPMI',
          dataIndex: 'hyIpmiAvailable'
        },
        {
          title: '引用模板',
          dataIndex: 'hyDevTypeValue'
        },
        {
          title: '监控项',
          dataIndex: 'hyItemCount'
        },
        {
          title: '触发器',
          dataIndex: 'hyTriggerCount'
        },
        {
          title: '状态',
          dataIndex: 'state'
        }
      ]
      this.$refs.outputExcel.output(excelTitle, data)
    },
    // 导出的数据
    async exportFindHyitHost(val) {
      this.loading = true
      const data = { ...this.listQuery }
      if (data.devType === 0) data.devType = ''
      const res = await request({
        url: api.itMonitor.findHyitHost,
        data: { ...data, limit: val.limit }
      })
      if (res.code !== 1) return
      res.data.forEach(item => {
        // 状态
        const count = item.hyAvailable + item.hySnmpAvailable + item.hyIpmiAvailable + item.hyJmxAvailable
        item.state = item.hyDevTypeId === 478 || item.hyDevTypeId === 483 ? item.hyNetState === 1 ? '在线' : '离线' : count === 1 ? '在线' : '离线'
        // 主机类型
        const Idx = this.devTypeList.findIndex(items => items.id === item.hyDevTypeId)
        if (Idx !== -1) {
          item.hyDevTypeId === 0 ? '' : this.devTypeList[Idx].dictdataName
        }
        // 引用模板
        const templateIdx = this.hostTemplate.findIndex(itemT => Number(itemT.zabbixTamplateId) === Number(item.hyDevTypeValue))
        if (templateIdx !== -1) item.hyDevTypeValue = this.hostTemplate[templateIdx].name

        Object.keys(item).forEach(keys => {
          if (keys === 'hyAvailable') {
            switch (item.hyAvailable) {
              case 0:
                item.hyAvailable = ''
                break
              case 1:
                item.hyAvailable = '在线'
                break
              case 2:
                item.hyAvailable = '离线'
                break
            }
          }
          if (keys === 'hySnmpAvailable') {
            switch (item.hySnmpAvailable) {
              case 0:
                item.hySnmpAvailable = ''
                break
              case 1:
                item.hySnmpAvailable = '在线'
                break
              case 2:
                item.hySnmpAvailable = '离线'
                break
            }
          }
          if (keys === 'hyJmxAvailable') {
            switch (item.hyJmxAvailable) {
              case 0:
                item.hyJmxAvailable = ''
                break
              case 1:
                item.hyJmxAvailable = '在线'
                break
              case 2:
                item.hyJmxAvailable = '离线'
                break
            }
          }
          if (keys === 'hyIpmiAvailable') {
            switch (item.hyIpmiAvailable) {
              case 0:
                item.hyIpmiAvailable = ''
                break
              case 1:
                item.hyIpmiAvailable = '在线'
                break
              case 2:
                item.hyIpmiAvailable = '离线'
                break
            }
          }
        })
      })
      this.loading = false
      return res.data
    },
    // 上传
    toLead(formname) {
      const _this = this
      _this.$refs[formname].validate((val) => {
        if (val) {
          console.log(_this.bulkImport)
          request({
            url: api.upload.importHost,
            data: { file: _this.bulkImport.raw, isSyn: this.isSyn }
          })
            .then(res => {
              if (res.code === 1) {
                console.log(res)
                _this.bulkImport = {
                  name: ''
                }
                _this.bulkImportModal = false
                _this.$message({
                  type: 'success',
                  message: res.msg
                })
                _this.onFilter()
              }
            })
        } else {
          _this.$message.error('请先选择文件')
        }
      })
    },
    // 检测upload上传变换
    changeUpload(file, fileList) {
      const _this = this
      _this.bulkImport = file
      console.log(_this.bulkImport)
      console.log(fileList)
    },
    // 上传文件
    upload(param) {
      console.log(param.file)
      this.fdata.append('uploadfile', param.file)
      this.fdata.append('format', 'xml')
    },
    // 导入
    onBulkImportModal() {
      this.fileList = []
      this.bulkImportModal = true
      this.fdata = new FormData()
    },
    // 下载模板
    download() {
      const url = `${process.env.VUE_APP_BASE_API}/export/downloadZabbixHostTamplate?token=${this.localStorageOperation('get', 'loginToken')}`
      window.open(url)
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
    findHyitHost() {
      request({
        url: api.itMonitor.findHyitHost, data: { ...this.listQuery }
      }).then(res => {
        if (res.code === 1) {
          this.list = res.data
          console.log(this.list)
          this.listTotal = Number(res.count)
          this.listLoading = false
          const ids = []
          const agentIds = []
          this.list.forEach(item => {
            agentIds.push(item.agent)
            if (ids.indexOf(item.hyDevTypeValue)) ids.push(item.hyDevTypeValue)
          })
          if (ids.length > 0) {
            this.findZbxTamplate(ids.toString())
          }
          this.getHostAgent(this.$tool.uniqueArray(agentIds))
          this.$nextTick(() => {
            this.initTableSelection()
          })
          this.$emit('setGatewayCount', res.count)
          this.outputHyitHost()
        }
      })
    },
    async findZbxAllTamplate() {
      const res = await request({
        url: api.itMonitor.findZbxTamplate,
        data: { agent: this.handlerHost.agent, page: 1, limit: -1 }
      })
      if (res.code !== 1) return
      return res.data
    },
    // 导出的数据
    outputHyitHost() {
      request({
        url: api.itMonitor.findHyitHost,
        data: { ...this.listQuery, limit: -1 }
      }).then(async res => {
        if (res.code === 1) {
          const data = await this.findZbxAllTamplate()
          res.data.forEach(item => {
            // 状态
            const count = item.hyAvailable + item.hySnmpAvailable + item.hyIpmiAvailable + item.hyJmxAvailable
            item.state = item.hyDevTypeId === 478 || item.hyDevTypeId === 483 ? item.hyNetState === 1 ? '在线' : '离线' : count === 1 ? '在线' : '离线'
            // 主机类型
            const Idx = this.devTypeList.findIndex(items => items.id === item.hyDevTypeId)
            if (Idx !== -1) {
              item.hyDevTypeId === 0 ? item.hyDevTypeId = '' : item.hyDevTypeId = this.devTypeList[Idx].dictdataName
            }
            // 所属网关
            const idm = this.hostAgent.findIndex(items => +items.id === +item.agent)
            if (idm !== -1) {
              item.agent === 0 ? item.agent = '' : item.agent = this.hostAgent[idm].name
            }
            // 引用模板
            const templateIdx = data.findIndex(itemT => Number(itemT.zabbixTamplateId) === Number(item.hyDevTypeValue))
            if (templateIdx !== -1) item.hyDevTypeValue === 0 ? item.hyDevTypeValue = '' : item.hyDevTypeValue = data[templateIdx].name

            Object.keys(item).forEach(keys => {
              if (keys === 'hyAvailable') {
                switch (item.hyAvailable) {
                  case 0:
                    item.hyAvailable = ''
                    break
                  case 1:
                    item.hyAvailable = '在线'
                    break
                  case 2:
                    item.hyAvailable = '离线'
                    break
                }
              }
              if (keys === 'hySnmpAvailable') {
                switch (item.hySnmpAvailable) {
                  case 0:
                    item.hySnmpAvailable = ''
                    break
                  case 1:
                    item.hySnmpAvailable = '在线'
                    break
                  case 2:
                    item.hySnmpAvailable = '离线'
                    break
                }
              }
              if (keys === 'hyJmxAvailable') {
                switch (item.hyJmxAvailable) {
                  case 0:
                    item.hyJmxAvailable = ''
                    break
                  case 1:
                    item.hyJmxAvailable = '在线'
                    break
                  case 2:
                    item.hyJmxAvailable = '离线'
                    break
                }
              }
              if (keys === 'hyIpmiAvailable') {
                switch (item.hyIpmiAvailable) {
                  case 0:
                    item.hyIpmiAvailable = ''
                    break
                  case 1:
                    item.hyIpmiAvailable = '在线'
                    break
                  case 2:
                    item.hyIpmiAvailable = '离线'
                    break
                }
              }
            })
          })
          this.fillerList = res.data
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
    handleFilter() {
      this.listQuery.page = 1
      this.findHyitHost()
    },
    handleCreate() {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'HostCreate',
        query: {
          listPage: this.listQuery.page
        }
      })
    },

    handleUpdate(row) {
      console.log(row)
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'HostUpdate',
        query: {
          id: row.hyHostId || 0,
          hyZhostId: row.hyZhostId || 0,
          hyHostId: row.hyHostId || 0,
          listPage: this.listQuery.page
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        request({ url: api.itMonitor.agentDeleteHost, data: { hostid: row.hyZhostId, agent: row.agent }}).then(res => {
          if (res.code === 1) {
            this.listQuery.page = 1
            this.$message.success('删除成功')
            this.findHyitHost()
          }
        }).finally(() => {
          this.loading = false
        })
      })
    },
    loadMoreAgent() {
      this.listQuery.page = this.listQuery.page + 1
      this.findHyitAgent()
    },
    openZbxItemsDialog(row) {
      this.handlerHost = row
      this.findZbxItemsHostTag(row)
      this.showZbxItemsDialog = true
    },
    findZbxItems() {
      const params = { ...this.findZbxItemsQuery }
      delete params.total
      request({
        url: api.itMonitor.findZbxItemsHost,
        data: { ...params, agent: this.handlerHost.agent }
      }).then(res => {
        this.listLoading = false
        this.zbxItemsList = res.data
        this.findZbxItemsQuery.total = Number(res.count)
      })
    },
    openZbxTriggersDialog(row) {
      this.handlerHost = row
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
        data: { ...params, agent: this.handlerHost.agent }
      }).then(res => {
        this.listLoading = false
        this.zbxTriggers = res.data
        this.findZbxTriggersQuery.total = Number(res.count)
      })
    },
    openHostTemplateDialog(row) {
      this.handlerHost = row
      this.findZbxTamplateList()
      const idx = this.hostTemplate.findIndex(item => Number(item.zabbixTamplateId) === Number(row.hyDevTypeValue))
      if (idx !== -1) {
        this.editTemplateForm = {
          id: this.hostTemplate[idx].id,
          catDevType: row.hyDevTypeId,
          subDevType: row.hySubdevTypeId,
          cmdbItemSourceType: 2,
          cmdbItemTypeId: row.cmdbItemTypeId
        }
      }
      this.showEditTemplateDialog = true
    },
    findZbxApplicationHost() {
      const params = { ...this.findZbxApplicationHostQuery }
      delete params.total
      request({
        url: api.itMonitor.findZbxApplicationHost,
        data: { ...params, agent: this.handlerHost.agent }
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
        data: { itemid: row.itemid, agent: this.handlerHost.agent }
      }).then(res => {
        if (res.code === 1) {
          const typeIndex = this.zbxItemType.findIndex(item => {
            return item.value === res.model.type
          })
          this.zbxItemsDetail = [
            { label: '监控项名称', value: res.model.name },
            { label: '监控项周期', value: res.model.delay },
            { label: '监控项类型', value: res.model.status },
            { label: '监控项状态', value: typeIndex !== -1 ? this.zbxItemType[typeIndex].label : '' }
          ]
        }
      })
    },
    getZbxTriggers(row) {
      this.showZbxTriggersDetail = true
      request({
        url: api.itMonitor.getZbxTriggersHost,
        data: { triggerid: row.triggerid, agent: this.handlerHost.agent }
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
        data: { itemid: row.itemid, enableItem: row.status, agent: this.handlerHost.agent }
      }).then(res => {
        if (res.code === 1) {
          const messageTxt = row.status === 0 ? '启用成功' : '关闭成功'
          this.$message.success(messageTxt)
          this.findZbxItemsQuery.page = 1
          this.findZbxItems()
        }
      })
    },
    changeZbxTriggersStatus(row) {
      request({
        url: api.itMonitor.agentEnableTrigger,
        data: { triggerid: row.triggerid, enableTrigger: row.status, agent: this.handlerHost.agent }
      }).then(res => {
        if (res.code === 1) {
          const messageTxt = row.status === 0 ? '启用成功' : '关闭成功'
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
    // 获取设备子类型
    loadSubType(n) {
      if (!n) return
      request({
        url: api.common.findSysDictionaryDetail,
        data: { limit: -1, pid: n }
      }).then(res => {
        if (res.code === 1) {
          this.subtypeList = res.data
        }
      })
    },
    findZbxTamplate(zabbixTamplateIds) {
      request({
        url: api.itMonitor.findZbxTamplate,
        data: { zabbixTamplateIds, agent: this.handlerHost.agent, page: 1, limit: -1 }
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
      this.$refs['editTemplateForm'].validate(valid => {
        if (valid) {
          this.dialogLoading = true
          request({
            url: api.itMonitor.updateZbxTamplate,
            data: this.editTemplateForm
          }).then(res => {
            if (res.code === 1) {
              this.dialogLoading = false
              this.showEditTemplateDialog = false
              this.$message.success('编辑成功')
              this.listQuery.page = 1
              this.findHyitHost()
            }
          })
        }
      })
    },
    findZbxTamplateList() {
      request({
        url: api.itMonitor.findZbxTamplate,
        data: { page: 1, limit: -1, agent: this.handlerHost.agent }
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
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      let setPagingSelection = [...this.allSelection, ...val]
      setPagingSelection = setPagingSelection.map((it) => JSON.stringify(it))
      setPagingSelection = [...new Set(setPagingSelection)].map((item) =>
        JSON.parse(item)
      )
      this.allSelection = setPagingSelection
    },
    handleSelect(rows, row) {
      let selected = rows.length && rows.indexOf(row) !== -1
      if (!selected) {
        this.allSelection = this.allSelection.filter(
          (it) => it[this.ideField] !== row[this.ideField]
        )
      }
    },
    initTableSelection() {
      this.$nextTick(() => {
        for (let i = 0; i < this.list.length; i++) {
          const tableEle = this.list[i]
          for (let j = 0; j < this.allSelection.length; j++) {
            const ele = this.allSelection[j]
            if (tableEle[this.ideField] === ele[this.ideField]) {
              this.$refs['table'].toggleRowSelection(tableEle, true)
            }
          }
        }
      })
    },
    handlerBatch(val) {
      if (val === 'org') {
        this.showSetOrgDialog = true
      } else if (val === 'assets') {
        this.onBatchTransferAssets()
      }
    },
    confirmSetOrgDialog() {
      this.$refs['UpdateHyitHostOrgForm'].validate(valid => {
        if (valid) {
          if (this.allSelection.length === 0) {
            this.$message({
              message: '请选择主机',
              type: 'info'
            })
          } else {
            const ids = []
            this.allSelection.forEach(item => {
              ids.push(item.hyHostId)
            })
            this.dialogLoading = true
            request({ url: api.itMonitor.updateHyitHostOrg, data: {
              orgId: this.UpdateHyitHostOrgForm.orgId[this.UpdateHyitHostOrgForm.orgId.length - 1],
              hostIds: ids.toString()
            }})
              .then(res => {
                if (res.code === 1) {
                  this.dialogLoading = false
                  this.showSetOrgDialog = false
                  this.allSelection = []
                  this.$message({
                    type: 'success',
                    message: '分配成功'
                  })
                  this.findHyitHost()
                }
              })
          }
        }
      })
    },
    loadOrgList() {
      request({ url: api.area.findHyitArea, data: {limit: -1}})
        .then(res => {
          this.listLoading = false
          if (res.code === 1) {
            const data = listToTree(res.data, 0, 0, 'hyAreaId', 'hyPid')
            this.areaTreeArr = this.mapTree(data)
            console.log(this.areaTreeArr)
          }
        })
    },
    // 筛选已选择的地址包括父级
    mapTree(arr) {
      let newarr = []
      arr.forEach(item => {
        if (item.isIt === 1) {
          newarr.push(item)
        } else {
          if (item.children && item.children.length > 0) {
            let redata = this.mapTree(item.children)
            if (redata && redata.length > 0) {
              let obj = {
                ...item,
                children: redata
              }
              newarr.push(obj)
            }
          }
        }
      })
      return newarr
    },
    async handleConfig(val) {
      const { data } = await request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_sub_dev_type', limit: -1, ids: val.hySubdevTypeId }
      })
      this.$router.push({
        name: 'HostConfig',
        query: {
          id: val.hyHostId,
          zbxHostId: val.hyZhostId,
          agent: val.agent,
          devTypeId: val.hyDevTypeId,
          isConfig: true,
          subType: data && data.length > 0 ? data[0].dictdataValue : ''
        }
      })
    },
    // 批量转资产
    onBatchTransferAssets() {
      if (this.allSelection.length < 1) {
        this.$message('请选择主机')
        return
      }
      const jsonData = []
      this.allSelection.forEach(item => {
        const valList = {}
        valList.assetsName = item.hyHostName
        valList.cmdbItemTypeId = 12
        valList.systemDeviceId = item.hyHostId
        valList.systemDeviceType = 2
        valList.status = 486
        jsonData.push(valList)
      })
      const jsonList = JSON.stringify(jsonData)
      this.$confirm('确认将所选设备转为资产吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.insertAssetsInfos(jsonList)
      })
    },
    // 批量新增资产
    insertAssetsInfos(data) {
      request({
        url: api.assets.insertAssetsInfos,
        data: { json: data }
      }).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
          this.$refs.table.clearSelection()
          this.findHyitHost()
          this.allSelection = []
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    findHyitAgentData() {
      request({
        url: api.itMonitor.findHyitAgent,
        data: { page: 1, limit: -1, agentTypes: '1,8,10', agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      }).then(res => {
        if (res.code === 1) {
          this.itAgentList = res.data
        }
      })
    },
    // 获取主机网关
    async getHostAgent(ids) {
      const { code, data } = await this.$request({
        url: this.api.itMonitor.findHyitAgent,
        data: { agentGroupId: this.sessionStorageOperation('get', 'agentGroupId'), ids }
      })
      if (code !== 1) return
      this.hostAgent = data
    }
  }
}
</script>
  <style lang="scss" scoped>
//   .filter-container {padding-top: 14px}
  .isSynStyle {margin-left: 50px;}
    .app-container {
      padding: 0;
    }
  </style>

