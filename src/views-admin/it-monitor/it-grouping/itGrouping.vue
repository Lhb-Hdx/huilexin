<template>
  <div class="matter app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery" class="mb-0 flex">
        <div class="mr-10">
          <el-button
            type="primary"
            icon="el-icon-plus"
            @click="handleAdd()"
          >新增</el-button>
        </div>
      </el-form>
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        :data="agentList"
        fit
        highlight-current-row
      >

        <el-table-column label="序号" width="80" type="index" />
        <el-table-column label="LOGO" prop="imgUrl" align="center" show-overflow-tooltip>
          <template slot-scope="{row}">
            <el-image
              style="width: 60px; height: 60px"
              :src="row.imgUrl"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column label="项目名称" prop="name">
          <template slot-scope="{row}">
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="backup">
          <template slot-scope="{row}">
            <span>{{ row.backup }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" class-name="small-padding fixed-width" width="400" align="center">
          <template slot-scope="{row}">
            <el-button type="primary" size="mini" @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" size="mini" @click="findHyitAgent(row)">关联</el-button>
            <el-button type="primary" size="mini" @click="handleSee(row.id)">查看</el-button>
            <el-button type="danger" size="mini" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 关联设备 -->
    <el-dialog title="关联网元" :visible.sync="addVideoDvrModal" top="5vh">
      <el-table
        ref="table"
        :data="agentListDialog"
        fit
        :row-key="getRowKeys"
        highlight-current-row
        @selection-change="selectionListChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="项目名称" prop="name">
          <template slot-scope="{row}">
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="IP地址" prop="ip">
          <template slot-scope="{row}">
            <span>{{ row.ip }}</span>
          </template>
        </el-table-column>
        <el-table-column label="版本" prop="version">
          <template slot-scope="{row}">
            <span>{{ row.version }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" prop="version">
          <template slot-scope="{row}">
            <span>{{ setAgentType(row.agentType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="statue">
          <template slot-scope="{row}">
            <el-tag :type="row.statue | statusTagFilter">
              {{ row.statue | statusTextFilter }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="listTotalDialog>0" :auto-scroll="false" :total="listTotalDialog" :page.sync="listQueryDialog.page" :limit.sync="listQueryDialog.limit" @pagination="findHyitAgent" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVideoDvrModal = false">取 消</el-button>
        <el-button :loading="loading" type="primary" @click="onRelation()">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 查看设备 -->
    <el-dialog title="已关联网关" :visible.sync="addVideoDvrModalSee" top="5vh">
      <el-table
        :data="agentListSee"
        fit
        highlight-current-row
      >
        <el-table-column label="网关名称" prop="name">
          <template slot-scope="{row}">
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="IP地址" prop="ip">
          <template slot-scope="{row}">
            <span>{{ row.ip }}</span>
          </template>
        </el-table-column>
        <el-table-column label="版本" prop="version">
          <template slot-scope="{row}">
            <span>{{ row.version }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" prop="version">
          <template slot-scope="{row}">
            <span>{{ setAgentType(row.agentType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="statue">
          <template slot-scope="{row}">
            <el-tag :type="row.statue | statusTagFilter">
              {{ row.statue | statusTextFilter }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="listTotalSee>0" :auto-scroll="false" :total="listTotalSee" :page.sync="listQueryDialog.page" :limit.sync="listQueryDialog.limit" @pagination="findHyitAgent" />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addVideoDvrModalSee = false">确 定</el-button>
        <!-- <el-button type="primary" @click="onRelation()">确 定</el-button> -->
      </div>
    </el-dialog>
    <pagination v-show="listTotal>0" :auto-scroll="false" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findHyitAgentGroup" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'

export default {
  name: 'Matter',
  components: {
    Pagination
  },
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
      loading: false,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        keyword: ''
      },
      listQueryDialog: {
        page: 1,
        limit: 10,
        keyword: ''
      },
      listQueryDialogSee: {
        page: 1,
        limit: 10
      },
      HyitList: [],
      listTotal: 0,
      listTotalDialog: 0,
      listTotalSee: 0,
      agentList: [],
      agentListSee: [],
      agentListSeeList: [],
      agentListDialog: [],
      addVideoDvrModal: false,
      addVideoDvrModalSee: false,
      selectionListChangeValue: '',
      groupIdNum: 0,
      agentTypeList: [
        {id: 1, value: '采集器'},
        {id: 8, value: '下级中心'},
        {id: 10, value: '360采集器'}
      ]
    }
  },
  computed: {
    setAgentType() {
      return function(val) {
        const idx = this.agentTypeList.findIndex(item => Number(item.id) === Number(val))
        if (idx !== -1) return this.agentTypeList[idx].value
      }
    }
  },
  created() {
    this.findHyitAgentGroup()
    this.findHyit()
  },
  methods: {
    // 获取行键
    getRowKeys(row) {
      return row.id
    },
    // 选择IP
    selectionListChange(val) {
      this.selectionListChangeValue = val
    },
    // 新增
    handleAdd() {
      this.$router.push({ name: 'itGroupingCreat' })
    },
    // 编辑
    handleEdit(val) {
      this.$router.push({
        name: 'updateItGroupingCreat',
        query: {
          id: val.id
        }
      })
    },
    // 查询网元
    findHyit() {
      request({
        url: api.itMonitor.findHyitAgent,
        data: { ...this.listQuery, agentTypes: '1,8,10', limit: -1, ids: this.sessionStorageOperation('get', 'agentId'), agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      }).then(res => {
        this.HyitList = res.data
      })
    },
    // 查看
    handleSee(val) {
      this.addVideoDvrModalSee = true
      request({
        url: api.itAgentGroup.findHyitAgentGroupLink,
        data: {
          page: this.listQueryDialogSee.page,
          limit: this.listQueryDialogSee.limit,
          groupId: val
        }
      }).then(res => {
        if (res.code === 1) {
          let seeList = []
          for (let i = 0; i < res.data.length; i++) {
            let val = res.data[i].agentId
            for (let j = 0; j < this.HyitList.length; j++) {
              let num = this.HyitList[j].id
              if (val === num) {
                seeList.push(this.HyitList[j])
              }
            }
          }
          this.agentListSee = seeList
          this.listTotalSee = Number(this.agentListSee.length)
        }
      })
    },
    // 查询已关联网元
    handleSeeList(val) {
      request({
        url: api.itAgentGroup.findHyitAgentGroupLink,
        data: {
          page: this.listQueryDialogSee.page,
          limit: this.listQueryDialogSee.limit,
          groupId: val
        }
      }).then(res => {
        if (res.code === 1) {
          let seeList = []
          for (let i = 0; i < res.data.length; i++) {
            let val = res.data[i].agentId
            for (let j = 0; j < this.HyitList.length; j++) {
              let num = this.HyitList[j].id
              if (val === num) {
                seeList.push(this.HyitList[j])
              }
            }
          }
          this.agentListSeeList = seeList
          console.log('j', this.agentListSee)
        }
      })
    },
    // 关联
    async findHyitAgent(val) {
      await this.handleSeeList(val.id)
      console.log(val)
      this.groupIdNum = val.id
      this.addVideoDvrModal = true
      request({
        url: api.itMonitor.findHyitAgent,
        data: { page: this.listQueryDialog.page, limit: this.listQueryDialog.limit, keyword: this.listQueryDialog.keyword, agentTypes: '1,8,10', agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      }).then(res => {
        this.listLoading = false
        this.agentListDialog = res.data
        console.log(this.agentListDialog)
        this.listTotalDialog = Number(res.count)
        this.$nextTick(() => {
          this.initTableSelection()
        })
      })
    },
    initTableSelection() {
      this.$nextTick(() => {
        for (let i = 0; i < this.agentListDialog.length; i++) {
          const tableEle = this.agentListDialog[i]
          for (let j = 0; j < this.agentListSeeList.length; j++) {
            const ele = this.agentListSeeList[j]
            if (tableEle.id === ele.id) {
              this.$refs['table'].toggleRowSelection(tableEle, true)
            }
          }
        }
      })
    },
    // 删除按钮
    handleDelete(id) {
      this.$confirm('确定删除吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const { code } = await request({
          url: api.itAgentGroup.deleteHyitAgentGroup,
          data: { id }
        })
        if (code !== 1) return this.$message.error('删除失败')
        this.$message.success('删除成功')
        this.$nextTick(() => {
          this.findHyitAgentGroup()
        })
      })
    },
    // 确定关联
    onRelation() {
      this.loading = true
      request({
        url: api.itAgentGroup.deleteHyitAgentGroupLinkByGroupId,
        data: {
          groupId: this.groupIdNum
        }
      }).then(res => {
        this.addVideoDvrModal = false
        this.loading = false
        const agentId = []
        this.selectionListChangeValue.forEach(item => {
          request({
            url: api.itAgentGroup.insertHyitAgentGroupLink,
            data: {
              groupId: this.groupIdNum,
              agentId: item.id
            }
          }).then(res => {
            if (res.code === 1) {
              agentId.push(item.id)
              this.$message({
                message: '关联成功',
                type: 'success'
              })
            } else {
              this.$message({
                message: 'res.msg',
                type: 'error'
              })
            }
          })
        })

        const agentGroupId = this.sessionStorageOperation('get', 'agentGroupId')
        if (+agentGroupId === this.groupIdNum) {
          this.sessionStorageOperation('set', 'agentId', agentId.toString())
        }

        this.loading = false
      })
    },
    // 获取数据
    findHyitAgentGroup() {
      request({
        url: api.itAgentGroup.findHyitAgentGroup,
        data: { ...this.listQuery, ids: this.sessionStorageOperation('get', 'agentGroupId') }
      }).then(res => {
        if (res.code === 1) {
          this.listLoading = false
          this.agentList = res.data
          this.listTotal = Number(res.count)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-form-item{
  margin-bottom: 0px !important;
}
.filter-container{
    margin-bottom: 10px;
    font-size:18px;
    font-weight:700;
}
</style>
