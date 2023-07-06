<template>
  <div class="app-container">
    <div class="flex-h-center mb-20">
      <el-button v-permission="['create']" type="primary" class="mr-10" icon="el-icon-back" @click="handleAdd()">新增</el-button>
      <el-form ref="form" v-permission="['search']" inline :model="listQuery" class="flex-h-center">
        <el-form-item>
          <el-input v-model="listQuery.hyActionName" placeholder="请输入名称" clearable @change="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>
      <div class="data">
        <ListControl :check-list="checkList" @setLists="setLists" />
      </div>

    </div>
    <div class="table-wrapper">
      <el-table
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="动作名称" prop="hyActionName" show-overflow-tooltip align="left" />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="动作类型" prop="hyActionType" show-overflow-tooltip align="left">
          <template slot-scope="{row}">
            {{ $tool.matchData(actionClassList,row,'hyActionType','hyActionClassName','hyActionClassId') }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="对象设备类型" prop="hyActionClassId" show-overflow-tooltip align="left">
          <template slot-scope="{row}">
            {{ $tool.matchData(actionClassList,row,'hyActionClassId','hyActionClassName') }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="动作指令" show-overflow-tooltip align="left">
          <template slot-scope="{row}">
            {{ row.setValue || $tool.formatStr(row['hyAct'],'0:关闭,1:开启') }}
          </template>
        </el-table-column>
        <!--        <el-table-column label="配置时间" prop="hyCtime" show-overflow-tooltip align="center" />-->
        <el-table-column
          v-if="lists.length > 0 ? lists[4].ispass : true"
          label="配置人"
          show-overflow-tooltip
          align="left"
        >
          <template slot-scope="{row}">
            {{ $tool.matchData(userList,row,'userId','userName') }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" label="状态" prop="hyStatus" show-overflow-tooltip align="left">
          <template slot-scope="{row}">
            <el-switch v-permission="['status']" :value="!!row.hyStatus" active-color="#0145ab" inactive-color="#f5f5f5" @change="changeStatus($event,row)" />
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" align="left" label="操作" width="200px">
          <template slot-scope="{row}">
            <el-button v-permission="['edit']" type="primary" size="mini" @click="handleEdit(row)">编辑</el-button>
            <el-button v-permission="['delete']" type="danger" size="mini" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="listCount > 0" :auto-scroll="false" :total="listCount" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findLinkageActionTemplate" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import ListControl from '@/components/ListControl'

export default {
  components: {
    Pagination, ListControl
  },
  data() {
    return {
      listQuery: {
        hyActionName: '',
        page: 1,
        limit: 10
      },
      listCount: 1,
      tableData: [],
      actionClass: [],
      actionClassList: [],
      userList: [],
      // 显示控制数据 start
      checkList: ['动作名称', '动作类型', '对象设备类型', '动作指令', '配置人', '状态', '操作'],
      lists: [],
      storageVal: 'ip-address-manage-history' // 存入localStorageOperation的名字
      // 显示控制数据 end
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.listQuery = pageQuery
    }
    this.findSysUser()
    this.findLinkageActionTemplate()
    this.findLinkageActionClass()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    async findSysUser() {
      let { data, code } = await request({ url: api.sys.findSysUser, data: { limit: -1, companyId: this.$auth.getUserSession().companyId }})
      if (code === 1) this.userList = data
    },
    async changeStatus(e, row) {
      delete row['hyCtime']
      let { code } = await request({
        url: api.linkageManage['updateLinkageActionTemplate'],
        data: { ...row, hyStatus: +e }
      })
      if (code !== 1) return
      this.$message.success('修改成功')
      this.findLinkageActionTemplate()
    },
    async findLinkageActionClass() {
      let { data, code } = await request({
        url: api.linkageManage.findLinkageActionClass
      })
      if (code !== 1) return
      this.actionClassList = data
    },
    handleSearch() {
      this.$set(this.listQuery, 'page', 1)
      this.findLinkageActionTemplate()
    },
    handleAdd() {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'AddActionTemplate' })
    },
    handleEdit(row) {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'EditActionTemplate', query: { hyAid: row.hyAid }})
    },
    handleDelete({ hyAid }) {
      this.$confirm('确定删除这个动作吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.linkageManage.deleteLinkageActionTemplate,
          data: { hyAid }
        }).then(({ code }) => {
          this.$message.success('删除成功')
          this.findLinkageActionTemplate()
        }, () => {
          this.$message.error('删除失败')
        })
      })
    },
    async findLinkageActionTemplate() {
      let { data, code, ...res } = await request({
        url: api.linkageManage.findLinkageActionTemplate,
        data: this.listQuery
      })
      if (code !== 1) return
      this.tableData = data
      this.listCount = Number(res.count)
      // this.$set(this.listQuery, 'count', +res.count)
    },
    async findHyitActionClass() {
      let { data, code } = await request({
        url: api.linkageManage.findHyitActionClass
      })
      if (code !== 1) return
      this.actionClass = data
    }
  }
}
</script>

<style scoped>
.el-form-item {
    margin-bottom: 0;
}
.data {
  position: absolute;
  right: 15px;
}
</style>
