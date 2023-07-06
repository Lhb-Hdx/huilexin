<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['Add']" class="filter-item" type="primary" icon="el-icon-plus" @click="onCreate">新增</el-button>
      <el-input v-model="findHyitTopologyInfoQuery.keyword" v-permission="['Search']" placeholder="请输入业务系统名称" style="width: 200px;" class="filter-item" />
      <el-button v-permission="['Search']" class="filter-item" type="primary" icon="el-icon-search" @click="onFilter">查询</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        :data="topoList"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="NO" prop="id" type="index" width="120" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="业务系统名称" prop="name" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="right" label="健康度">
          <template slot-scope="item">
            {{ setSystemLogData(item.row.healthy) }}%
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="right" label="可用度">
          <template slot-scope="item">
            {{ setSystemLogData(item.row.available) }}%
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="right" label="繁忙度">
          <template slot-scope="item">
            {{ setSystemLogData(item.row.busy) }}%
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="left" label="状态" prop="statues" width="200">
          <template slot-scope="item">
            <div :class="item.row.statue === 1 ? 'success' : 'danger'">
              <i :class="item.row.statue === 1 ? 'el-icon-success' : 'el-icon-error'" />
              {{ item.row.statue === 1 ? '正常' : '异常' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="left" label="操作" width="300" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-permission="['ConfigTopo']" size="mini" type="primary" @click="onConfig(row)">
              配置拓扑
            </el-button>
            <el-button v-permission="['Edit']" size="mini" type="primary" @click="onEdit(row)">
              编辑
            </el-button>
            <el-button v-permission="['Delete']" size="mini" type="danger" @click="onDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination
      background
      :current-page.sync="findHyitTopologyInfoQuery.page"
      :page-sizes="[10, 20, 30, 50, 100, 200, 300, 500]"
      :page-size="findHyitTopologyInfoQuery.limit"
      layout="total,sizes, prev, pager, next, jumper"
      :total="listTotal"
      class="mt-10"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <el-dialog :title="dialogTitle" :visible.sync="showDialog" width="40%" top="5vh">
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="业务系统名称" prop="name">
          <el-input v-model.trim="form.name" placeholder="请输入业务系统名称" />
        </el-form-item>
        <el-form-item label="状态" prop="statue">
          <el-select v-model="form.statue" placeholder="请选择">
            <el-option
              v-for="item of statuesList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="confirmDialog">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import ListControl from '@/components/ListControl'

export default {
  name: 'TopoList',
  components: {
    ListControl
  },
  data() {
    return {
      agentsIds: '',
      agentGroupId: '',
      findHyitTopologyInfoQuery: {
        keyword: '',
        page: 1,
        limit: 10
        // total: 0
      },
      listTotal: 0,
      topoList: [],
      listLoading: true,
      showDialog: false,
      statuesList: [
        { value: 1, label: '正常' },
        { value: 0, label: '异常' }
      ],
      dialogTitle: '新增业务系统信息',
      form: {
        name: '',
        statue: '',
        remark: ''
      },
      formId: '',
      rules: {
        name: [
          { required: true, message: '请输入业务系统名称', trigger: 'blur' }
        ],
        statue: [
          { required: true, message: '请选择状态', trigger: 'blur' }
        ]
      },
      // 显示控制数据 start
      checkList: ['业务系统名称', '健康度', '可用度', '繁忙度', '状态', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setSystemLogData() {
      return function(value) {
        return value ? value.toFixed(2) : 0
      }
    }
  },
  created() {
    this.agentGroupId = this.sessionStorageOperation('get', 'agentGroupId')
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.findHyitTopologyInfoQuery = pageQuery
    }
  },
  mounted() {
    this.loadTopoList()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    loadTopoList() {
      request({
        url: api.bsTopSystem.findBsTopSystem, data: { ...this.findHyitTopologyInfoQuery }
      }).then(res => {
        this.listLoading = false
        if (res.code === 1) {
          this.topoList = res.data
          this.listTotal = Number(res.count)
        }
      })
    },
    handleSizeChange(val) {
      this.findHyitTopologyInfoQuery.limit = val
    },
    handleCurrentChange(val) {
      this.findHyitTopologyInfoQuery.page = val
      this.loadTopoList()
    },
    onCreate() {
      this.dialogTitle = '新增业务系统信息'
      this.showDialog = true
      Object.keys(this.form).forEach(key => {
        this.$set(this.form, `${key}`, '')
      })
    },
    onEdit(row) {
      this.formId = row.id
      Object.keys(row).forEach(key => {
        this.form[key] = row[key]
      })
      this.showDialog = true
      this.dialogTitle = '编辑业务系统信息'
    },
    onConfig(row) {
      const data = { ...this.findHyitTopologyInfoQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'BusinessSystemTopoConfig',
        query: {
          id: row.id
        }
      })
    },
    onFilter() {
      this.findHyitTopologyInfoQuery.page = 1
      this.loadTopoList()
    },
    onDelete(row) {
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.bsTopSystem.deleteBsTopSystem,
          data: {
            id: row.id
          }
        }).then(res => {
          if (res.code === 1) {
            this.$message({
              type: 'success',
              message: res.msg
            })
            this.loadTopoList()
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    },
    confirmDialog() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const requestTopologyInfoApi = this.formId ? api.bsTopSystem.updateBsTopSystem : api.bsTopSystem.insertBsTopSystem
          const requestTopologyInfoParams = { ...this.form, agentGroupId: this.agentGroupId }
          if (this.id) {
            requestTopologyInfoParams.id = this.formId
          }
          request({
            url: requestTopologyInfoApi,
            data: requestTopologyInfoParams
          }).then(res => {
            if (res.code === 1) {
              this.$message({
                type: 'success',
                message: res.msg
              })
              this.showDialog = false
              this.loadTopoList()
            }
          })
        }
      })
    }
  }
}
</script>

