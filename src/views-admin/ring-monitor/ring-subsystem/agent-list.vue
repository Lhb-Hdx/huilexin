<template>
  <div class="app-container">
    <el-card shadow="never">

      <div v-permission="['search']" class="filter-container">
        <el-input v-model="listQuery.keyword" class="filter-item" clearable placeholder="请输入网关名称" style="width: 200px;" @keyup.enter.native="handleFilter" />
        <el-button v-waves class="filter-item" icon="el-icon-search" type="primary" @click="handleFilter">查询</el-button>
        <ListControl :check-list="checkList" @setLists="setLists" />

      </div>
      <div v-loading="listLoading" class="table-wrapper">
        <el-table
          :data="agentList"
          :row-key="getRowKeys"
          fit
          highlight-current-row
        >
          <el-table-column label="序号" type="index" width="80" />
          <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="网关名称" prop="name" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span>{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="right" label="IP地址" prop="ip" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span>{{ row.ip }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="right" label="版本" prop="version" show-overflow-tooltip>
            <template slot-scope="{row}">
              <span>{{ row.version }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="left" label="状态" prop="statue">
            <template slot-scope="{row}">
              <el-tag :type="row.statue | statusTagFilter">
                {{ row.statue | statusTextFilter }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="left" class-name="small-padding fixed-width" label="操作" width="400">
            <template slot-scope="{row}">
              <el-button v-permission="['binding']" size="mini" type="primary" @click="openBindSubSystem(row)">绑定子系统</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <pagination v-show="listQuery.total>0" :auto-scroll="false" :limit.sync="listQuery.limit" :page.sync="listQuery.page" :total="listQuery.total" @pagination="findHyitAgent" />
      <el-dialog :visible.sync="showDialog" title="绑定子系统" top="5vh" width="60%">
        <div class="equipment_table">
          <el-table ref="subSystemTable" :data="subSystemList" :row-key="getRowKeys" fit highlight-current-row style="width: 100%;" @select="tableSelect">
            <el-table-column show-overflow-tooltip type="selection" width="55" />
            <el-table-column label="NO" prop="id" type="index" width="120" />
            <el-table-column label="子系统名称" prop="hySbName" show-overflow-tooltip />
            <el-table-column label="所在区域" prop="hyOrgId">
              <template slot-scope="item">
                {{ setAreaName(item.row.hyOrgId) }}
              </template>
            </el-table-column>
            <el-table-column label="IP" prop="hyIp" show-overflow-tooltip />
            <el-table-column label="端口" prop="hyPort" show-overflow-tooltip />
            <el-table-column label="子系统状态">
              <template slot-scope="item">
                <div :class="item.row.hyStatus === 1 ? 'success' : 'danger'">
                  <i :class="item.row.hyStatus === 1 ? 'el-icon-success' : 'el-icon-error'" />
                  {{ item.row.hyStatus === 1 ? '在线' : '离线' }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="更新时间" prop="hyUtime" show-overflow-tooltip />
          </el-table>
          <pagination v-show="query.total > 0" :auto-scroll="false" :limit.sync="query.limit" :page.sync="query.page" :total="query.total" @pagination="findHyitSubSystemList" />
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="showDialog = false">关闭</el-button>
          <!-- <el-button class="filter-item" type="primary" @click="comfirm">确 定</el-button> -->
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'
import request from '@/utils/request'
import api from '@/api/api' // secondary package based on el-pagination
// import { arrItemObjectExist } from '@/utils/utils'
import ListControl from '@/components/ListControl'

export default {
  name: 'RingAgentList',
  components: { Pagination, ListControl },
  directives: { waves },
  filters: {
    statusTextFilter(status) {
      const statusMap = {
        '0': '离线',
        '1': '在线'
      }
      return statusMap[status] || '未知'
    },
    statusTagFilter(status) {
      const statusMap = {
        '0': 'info',
        '1': 'success'
      }
      return statusMap[status] || ''
    }
  },
  data() {
    return {
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        total: 0
      },
      agentList: [],
      asyncId: '',
      showDialog: false,
      areaList: [],
      query: {
        keyword: '',
        page: 1,
        limit: 10,
        total: 0
      },
      subSystemList: [],
      agentId: '',
      getAgentSubsystemValue: [],
      multipleSelectionAll: [
        { cid: 1 },
        { cid: 4 },
        { cid: 3 }
      ], // 所有选中的数据包含跨页数据
      multipleSelection: [], // 当前页选中的数据
      idKey: 'cid', // 标识列表数据中每一行的唯一键的名称(需要按自己的数据改一下)
      // ideField: 'wid', // 匹配的字段，用id
      // allSelection: [], // 所有页面选择的
      agentType: '',
      // 显示控制数据 start
      checkList: ['网关名称', 'IP地址', '版本', '状态', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setAreaName() {
      return function(hyOrgId) {
        const idx = this.areaList.findIndex(item => item.hyOrgId === hyOrgId)
        if (idx !== -1) {
          return this.areaList[idx].hyOrgName
        }
      }
    }
  },
  created() {
    this.findHyitAgent()
    this.findHyitOrg()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    findHyitAgent() {
      request({
        url: api.itMonitor.findHyitAgent,
        data: { page: this.listQuery.page, limit: this.listQuery.limit, keyword: this.listQuery.keyword, agentType: 2 }
      }).then(res => {
        this.listLoading = false
        this.agentList = res.data
        this.listQuery.total = Number(res.count)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.findHyitAgent()
    },
    openBindSubSystem(row) {
      this.agentId = row.id
      this.agentType = row.agentType
      this.showDialog = true
      this.findHyitSubSystemList()
    },
    findHyitSubSystemList() {
      this.findHyitSubSystem().then(res => {
        this.subSystemList = res.data
        this.query.total = Number(res.count)
        this.findHyitAgentSubsystem()
      })
    },
    findHyitOrg() {
      request({
        url: api.org.findHyitOrg,
        data: {}
      }).then(res => {
        if (res.code === 1) {
          this.areaList = res.data
        }
      })
    },
    tableSelect(selection, row) {
      if (selection.includes(row)) {
        this.submitHyitAgentSubsystem({
          agentId: this.agentId,
          sbId: '' + row.hySbId,
          type: this.agentType
        }, api.powerEnv.insertHyitAgentSubsystem)
      } else {
        this.submitHyitAgentSubsystem({
          agentId: this.agentId,
          sbId: '' + row.hySbId
        }, api.powerEnv.deleteHyitAgentSubsystem)
      }
    },
    comfirm() {
      // const selectAttribute = this.$refs.subSystemTable.selection
      // const deleteDeviceValue = arrItemObjectExist(this.getAgentSubsystemValue, selectAttribute, 'hySbId')
      // const addDeviceValue = arrItemObjectExist(selectAttribute, this.getAgentSubsystemValue, 'hySbId')

      // console.log({
      // deleteDeviceValue,
      // addDeviceValue
      // })
      // if (deleteDeviceValue.length > 0) {
      //   const ids = []
      //   deleteDeviceValue.forEach(item => {
      //     ids.push(item.hySbId)
      //   })
      //   this.submitHyitAgentSubsystem({
      //     agentId: this.agentId,
      //     sbIds: ids.toString()
      //   }, api.powerEnv.deleteHyitAgentSubsystem)
      // }
      // if (addDeviceValue.length > 0) {
      //   const ids = []
      //   addDeviceValue.forEach(item => {
      //     ids.push(item.hySbId)
      //   })
      //   this.submitHyitAgentSubsystem({
      //     agentId: this.agentId,
      //     sbIds: ids.toString()
      //   }, api.powerEnv.insertHyitAgentSubsystem)
      // }
    },
    getRowKeys(row) {
      return row.hySbId
    },
    submitHyitAgentSubsystem(data, api) {
      request({
        url: api,
        data
      }).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async findHyitSubSystem() {
      return await request({
        url: api.powerEnv.findHyitSubSystem,
        data: this.query
      }).then(res => {
        if (res.code === 1) {
          return res
        }
      })
    },
    findHyitAgentSubsystem() {
      request({
        url: api.powerEnv.findHyitAgentSubsystem,
        data: {
          agentId: this.agentId,
          page: 1,
          limit: -1
        }
      }).then(res => {
        if (res.code === 1) {
          res.data.forEach(item => {
            item.hySbId = item.sbId
          })
          this.getAgentSubsystemValue = [...res.data]
          this.initTableSelection()
        }
      })
    },
    initTableSelection() {
      this.$nextTick(() => {
        for (let i = 0; i < this.getAgentSubsystemValue.length; i++) {
          const tableEle = this.getAgentSubsystemValue[i]
          for (let j = 0; j < this.subSystemList.length; j++) {
            const ele = this.subSystemList[j]
            if (tableEle['sbId'] === ele['hySbId']) {
              console.log(454545454)
              this.$refs['subSystemTable'].toggleRowSelection(ele, true)
            }
          }
        }
      })
    }

  }
}
</script>
<style lang="scss" scoped>
    .el-card ::v-deep .el-card__body {
      padding: 10px;
    }
</style>
