<template>
  <div class="flex classify-mange">
    <ClassifySidebar @emitParentService="setParentService" />
    <div class="mange-box">
      <div class="box-header">
        <div class="font-22 font-weight">{{ parentService.serviceName || '' }}</div>
        <div class="mt-14 font-14">描述：{{ parentService.remark || '' }}</div>
      </div>

      <div class="filter-container mt-14">
        <el-input v-model="listQuery.serviceName" placeholder="请输入服务名称" style="width: 200px;" class="filter-item" clearable @keyup.enter.native="findOpsOrderProblemService" />
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="findOpsOrderProblemService">查询</el-button>
        <el-button v-permission="['add']" class="filter-item" type="success" icon="el-icon-plus" @click="handleOpenServiceDialog">新增服务</el-button>
        <ListControl :check-list="checkList" @setLists="setLists" />
      </div>

      <div class="table-wrapper">
        <el-table
          v-loading="loading"
          :data="tableData"
          style="width: 100%"
        >
          <el-table-column label="序号" type="index" />
          <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" prop="serviceName" width="250" align="left" label="服务名称" show-overflow-tooltip />
          <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" prop="prop" align="left" label="影响度/严重度/紧急度" show-overflow-tooltip>
            <template v-slot="{row}">
              <el-tag :type="$tool.formatStr(row.effectType, '1:success,2:warning,3:danger') || '0'" effect="dark" size="mini" class="mr-1 ml-1">
                {{ $tool.formatStr(row.effectType, '1:低,2:中,3:高') }}
              </el-tag>
              <el-tag :type="$tool.formatStr(row.severityType, '1:success,2:warning,3:danger') || '0'" effect="dark" size="mini">
                {{ $tool.formatStr(row.severityType, '1:低,2:中,3:高') }}
              </el-tag>
              <el-tag :type="$tool.formatStr(row.urgencyType, '1:success,2:warning,3:danger') || '0'" effect="dark" size="mini" class="ml-1">
                {{ $tool.formatStr(row.urgencyType, '1:低,2:中,3:高') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="left" width="150" prop="handle" label="是否需要处理">
            <template v-slot="{row}">
              <el-switch v-permission="['handleSwitch']" :value="!!row.handle" active-color="#13ce66" @change="changeRowHandle($event, row)" />
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" width="150" align="right" prop="responseTime" label="响应时间">
            <template v-slot="{row}">
              {{ row.responseTime }}分钟
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="right" label="最后编辑时间" show-overflow-tooltip>
            <template v-slot="{row}">
              {{ row.utime || row.ctime }}
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="left" prop="userName" label="编辑人" />
          <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" align="left" prop="groupName" label="运维小组" />
          <el-table-column v-if="lists.length > 0 ? lists[7].ispass : true" align="left" label="操作" fixed="right" width="150">
            <template v-slot="{row}">
              <el-button v-permission="['edit']" size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button v-permission="['delete']" size="small" type="danger" @click="handleDel(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="listQuery.total>0" :auto-scroll="false" :total="listQuery.total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findOpsOrderProblemService" />
      </div>
    </div>

    <ServiceDialog ref="ServiceDialog" :type="2" :parent-service="parentService" @updateData="findOpsOrderProblemService" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import request from '@/utils/request'
import api from '@/api/api'
import ClassifySidebar from './components/classify-sidebar.vue'
import ServiceDialog from './components/service-dialog.vue'
import ListControl from '@/components/ListControl'
export default {
  name: 'ClassifyMange',
  components: {
    ClassifySidebar,
    Pagination,
    ServiceDialog,
    ListControl
  },
  data() {
    return {
      listQuery: {
        page: 1,
        limit: 10,
        total: 0
      },
      tableData: [],
      parentService: {}, // 点击的父类
      loading: false,
      serviceList: [],
      // 显示控制数据 start
      checkList: ['服务名称', '影响度/严重度/紧急度', '是否需要处理', '响应时间', '最后编辑时间', '编辑人', '运维小组', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  watch: {
    parentService: {
      handler() {
        this.findOpsOrderProblemService()
      },
      deep: true
    }
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    async findOpsOrderProblemService() {
      this.loading = true
      const {code, data, count} = await request({url: api.opm.findOpsOrderProblemService, data: {...this.listQuery, pid: this.parentService.serviceId}})
      if (code !== 1) return
      const userList = await this.findSysUser(data.map(it => it.createUserId).filter(Boolean))
      const groupList = await this.findHrUserGroup(data.map(it => it.groupId).filter(Boolean))
      for (const it of data) {
        it['userName'] = this.$tool.matchData(userList, it, 'createUserId', 'realName', 'userId')
        it['groupName'] = this.$tool.matchData(groupList, it, 'groupId', 'groupName')
      }
      setTimeout(() => { this.loading = false }, 500)
      this.listQuery.total = +count
      this.tableData = data
    },
    async findHrUserGroup(ids) {
      const {data, code} = await request({url: api.sys.findHrUserGroup, data: {ids, limit: -1}})
      if (code === 1) return data
    },
    async changeRowHandle(e, row) {
      const data = {...row}
      delete data['ctime']
      delete data['utime']
      const {code} = await request({url: api.opm.updateOpsOrderProblemService, data: {...data, handle: +e}})
      await this.findOpsOrderProblemService()
      if (code === 1) this.$message.success('更新成功')
    },
    async findSysUser(ids) {
      const {data, code} = await request({url: api.sys.findSysUser, data: {ids, companyId: this.$auth.getUserSession().companyId}})
      if (code === 1) return data
    },
    handleEdit(row) {
      this.$refs.ServiceDialog.open(row, this.serviceList, 'edit')
    },
    handleDel(row) {
      this.$confirm('确定删除此条数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {code } = await request({url: api.opm.deleteOpsOrderProblemService, data: {serviceId: row.serviceId}})
        if (code !== 1) return
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.findOpsOrderProblemService()
      })
    },
    handleOpenServiceDialog() {
      this.$refs.ServiceDialog.open(this.parentService, this.serviceList)
    },
    setParentService(item1, item2) {
      this.parentService = item1
      this.serviceList = item2
    }

  }
}
</script>

<style lang="scss" scoped>
.classify-mange{
  height: 100%;
  .mange-box{
    padding: 20px;
    width: 85%;
  }
}
</style>
