<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" type="primary" @click="addCat">新增</el-button>
      <el-input v-model="listQuery.keyword" placeholder="请输入搜索关键词" class="filter-item filter-item-input" />
      <el-select v-model="listQuery.userStatue" placeholder="启用状态" clearable class="filter-item" style="width: 200px">
        <el-option v-for="item in statusOptions" :key="item.id" :label="item.value" :value="item.id" />
      </el-select>
      <el-button class="filter-item" type="primary" @click="findServerCenter">搜索</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div class="table-wrapper">
      <el-table
        :data="dataList"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="序号" type="index" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="上级中心IP" align="left" prop="centerIp" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="上级中心端口" align="left" prop="centerPort" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="上级中心名称" align="left" prop="centerName" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="是否启用" align="left" prop="userStatue" width="180">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.userStatue"
              :active-value="1"
              :inactive-value="0"
              @change="changeUserStatue(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="连接状态" align="left" prop="connectionStatus" show-overflow-tooltip>
          <template slot-scope="{row}">
            <el-tag :type="setConnectStatue('class', row.connectionStatus)">
              {{ setConnectStatue('text', row.connectionStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="left" label="操作">
          <template slot-scope="{row}">
            <el-button size="mini" type="primary" @click="onUpdate(row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :auto-scroll="false" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findServerCenter" />
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import ListControl from '@/components/ListControl'
export default {
  components: { Pagination, ListControl },
  data() {
    return {
      listQuery: {
        keyword: '',
        page: 1,
        limit: 10,
        userStatue: ''
      },
      dataList: [],
      total: 0,
      statusOptions: [
        {id: 0, value: '未启用'},
        {id: 1, value: '启用'}
      ],
      connectStatue: [
        { value: 0, label: '离线', class: 'info' },
        { value: 1, label: '在线', class: 'success' }
      ],
      // 显示控制数据 start
      checkList: ['上级中心IP', '上级中心端口', '上级中心名称', '是否启用', '连接状态', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setConnectStatue() {
      return function(valueType, val) {
        const idx = this.connectStatue.findIndex(item => item.value === val)
        if (idx === -1) {
          if (valueType === 'text') return this.connectStatue[0].label
          if (valueType === 'class') return this.connectStatue[0].class
        } else {
          if (valueType === 'text') return this.connectStatue[1].label
          if (valueType === 'class') return this.connectStatue[1].class
        }
      }
    }
  },
  mounted() {
    this.findServerCenter()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    async findServerCenter() {
      const res = await this.$request({
        url: this.api.itMonitor.findServerCenter,
        data: { ...this.listQuery }
      })
      if (res.code !== 1) return
      this.dataList = res.data
      this.total = Number(res.count)
      const agentData = await this.getOnlineServer()
      if (agentData.length > 0) {
        agentData.forEach(item => {
          res.data.forEach(resItem => {
            if (item === resItem.centerIp) {
              this.$set(resItem, 'connectionStatus', 1)
            }
          })
        })
      }
    },
    async getOnlineServer() {
      const res = await this.$request({
        url: this.api.itMonitor.getOnlineServer
      })
      if (res.code !== 1) return
      return res.data
    },
    addCat() { // 新增
      this.$router.push({
        name: 'SuperiorManagementAdd'
      })
    },
    // 改变启用状态
    async changeUserStatue(row) {
      const res = await this.$request({
        url: this.api.itMonitor.updateServerCenter,
        data: {id: row.id, userStatue: row.userStatue}
      })
      if (res.code !== 1) return
      this.findServerCenter()
    },
    onUpdate(row) {
      this.$router.push({
        name: 'SuperiorManagementAdd',
        query: {
          id: row.id || 0
        }
      })
    },
    async onDelete(row) {
      this.$confirm('是否删除该上级IP？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request({
          url: this.api.itMonitor.deleteServerCenter,
          data: { id: row.id }
        }).then(res => {
          if (res.code === 1) {
            this.$request({url: this.api.itMonitor.disconnetAgent })
            this.findServerCenter()
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
