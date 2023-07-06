<template>
  <div class="app-container">
    <div v-permission="['Search']" class="filter-container">
      <el-input v-model="listQuery.keyword" placeholder="请输入关键字" style="width: 200px;" class="filter-item" clearable />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="search">查询</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div class="table-wrapper">
      <el-table ref="authDeviceTable" :data="list" fit highlight-current-row style="width: 100%">
        <el-table-column type="index" align="left" label="NO" width="50" />
        <!--        <el-table-column label="过滤名称" prop="fliterName" show-overflow-tooltip />-->
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="过滤设备IP" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ row.ip === '*' ? '全部设备IP' : row.ip }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="right" label="过滤开始时间" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ $tool.dateFormat('YYYY-mm-dd HH:MM:SS', new Date(row.startTime)) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="right" label="过滤结束时间">
          <template slot-scope="{row}">
            {{ $tool.dateFormat('YYYY-mm-dd HH:MM:SS', new Date(row.endTime)) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="left" label="是否过期">
          <template slot-scope="{row}">
            <div :class="setOutColor(row)">
              {{ setOut(row) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="left" label="创建人" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ setUser(row.userId) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="right" label="创建时间" prop="createTime" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" align="left" width="400" label="描述" prop="description" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[7].ispass : true" align="left" label="操作" width="140" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-permission="['Delete']" size="mini" type="danger" @click="handlerDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="listTotal >0" :auto-scroll="false" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="pagination" />
  </div>
</template>

<script>
import pagination from '@/components/Pagination'
import request from '@/utils/request'
import api from '@/api/api'
import ListControl from '@/components/ListControl'

export default {
  name: 'MaskingAlarmPushList',
  components: {
    pagination, ListControl
  },
  data() {
    return {
      list: [],
      listQuery: {
        page: 1,
        limit: 10,
        keyword: ''
      },
      listTotal: 0,
      listUser: [],
      // 显示控制数据 start
      checkList: ['过滤设备IP', '全部设备IP', '过滤开始时间', '过滤结束时间', '是否过期', '创建人', '创建时间', '描述', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setOut() {
      return function(item) {
        return new Date(item.endTime).getTime() < new Date().getTime() ? '已过期' : '未过期'
      }
    },
    setOutColor() {
      return function(item) {
        return new Date(item.endTime).getTime() < new Date().getTime() ? 'info' : 'success'
      }
    },
    setUser() {
      return function(userId) {
        const idx = this.listUser.findIndex(item => +item.userId === +userId)
        return idx === -1 ? '' : this.listUser[idx].realName
      }
    }
  },
  mounted() {
    this.findLinkageAlramFilter()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    findLinkageAlramFilter() {
      this.$request({
        url: this.api.linkageManage.findLinkageAlramFilter,
        data: this.listQuery
      }).then(res => {
        if (res.code === 1) {
          this.list = res.data
          this.listTotal = +res.count
          const userIds = []
          res.data.forEach(item => {
            if (item.userId) userIds.push(item.userId)
          })
          if (userIds.length > 0) {
            this.findSysUser(this.$tool.uniqueArray(userIds).toString())
          }
        }
      })
    },
    pagination() {
      this.findLinkageAlramFilter()
    },
    search() {
      this.$set(this.listQuery, 'page', 1)
      this.findLinkageAlramFilter()
    },
    handlerDelete(row) {
      this.$confirm('确定删除吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request({
          url: this.api.linkageManage.deleteLinkageAlramFilter, data: { filterId: row.filterId }
        }).then(res => {
          if (res.code === 1) {
            this.$message.success('删除成功')
            if (this.list.length === 1) this.$set(this.listQuery, 'page', --this.listQuery.page)
            this.findLinkageAlramFilter()
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    },
    async findSysUser(ids) {
      let { data, code } = await request({ url: api.sys.findSysUser, data: { limit: -1, companyId: this.$auth.getUserSession().companyId, ids }})
      if (code === 1) this.listUser = data
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
