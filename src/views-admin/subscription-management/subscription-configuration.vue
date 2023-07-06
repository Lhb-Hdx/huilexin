<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" type="primary" @click="addCat">新增</el-button>
      <el-input v-model="listQuery.keyword" placeholder="请输入搜索关键词" class="filter-item filter-item-input" />
      <el-button class="filter-item" type="primary" @click="findHyitSubscribe">搜索</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div class="table-wrapper">
      <el-table
        :data="dataList"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="序号" align="left" type="index" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="名称" prop="name" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="left" label="推送地址" prop="url" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="left" label="订阅类型" prop="subscribeType" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ setSubscribeType(row.subscribeType) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="left" label="是否鉴权" prop="isAuth" width="180">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.isAuth"
              :active-value="1"
              :inactive-value="0"
              @change="changeAuthStatue(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="left" label="鉴权码" prop="authToken" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="left" label="是否启用" prop="isUse" width="180">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.isUse"
              :active-value="1"
              :inactive-value="0"
              @change="changeUserStatue(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" label="操作" align="left">
          <template slot-scope="{row}">
            <el-button size="mini" type="primary" @click="onUpdate(row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :auto-scroll="false" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findHyitSubscribe" />
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import ListControl from '@/components/ListControl'
import api from '@/api/api'
export default {
  components: { Pagination, ListControl },
  data() {
    return {
      listQuery: {
        keyword: '',
        page: 1,
        limit: 10
      },
      total: 0,
      dataList: [],
      statusOptions: [
        {id: 0, value: '未启用'},
        {id: 1, value: '启用'}
      ],
      connectStatue: [
        {id: 1, value: '告警订阅'},
        {id: 2, value: '工单订阅'}
      ],
      // 显示控制数据 start
      checkList: ['名称', '推送地址', '订阅类型', '是否鉴权', '鉴权码', '是否启用', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setSubscribeType() {
      return function(val) {
        const idx = this.connectStatue.findIndex(item => item.id === val)
        if (idx !== -1) {
          return this.connectStatue[idx].value
        }
      }
    }
  },
  mounted() {
    this.findHyitSubscribe()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 查
    async findHyitSubscribe() {
      const res = await this.$request({
        url: this.api.subscription.findHyitSubscribe,
        data: { ...this.listQuery }
      })
      if (res.code !== 1) return
      this.dataList = res.data
      this.total = Number(res.count)
    },
    // 新增
    addCat() {
      this.$router.push({
        name: 'SubscriptionConfigurationAdd'
      })
    },
    // 改变启用状态
    async changeAuthStatue(row) {
      const res = await this.$request({
        url: this.api.subscription.updateHyitSubscribe,
        data: {id: row.id, isAuth: row.isAuth}
      })
      if (res.code !== 1) return
      this.findHyitSubscribe()
    },
    // 改变启用状态
    async changeUserStatue(row) {
      const res = await this.$request({
        url: this.api.subscription.updateHyitSubscribe,
        data: {id: row.id, isUse: row.isUse}
      })
      if (res.code !== 1) return
      this.TaskSubscribeChange()
      this.findHyitSubscribe()
    },
    // 编辑
    onUpdate(row) {
      this.$router.push({
        name: 'SubscriptionConfigurationUpdate',
        query: {
          id: row.id || 0
        }
      })
    },
    // 删
    async onDelete(row) {
      this.$confirm('是否删除该上级IP？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request({
          url: this.api.subscription.deleteHyitSubscribe,
          data: { id: row.id }
        }).then(res => {
          if (res.code === 1) {
            this.TaskSubscribeChange()
            this.findHyitSubscribe()
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
    },
    TaskSubscribeChange() {
      this.$request({
        url: api.subscription.TaskSubscribeChange, data: {}
      })
    }
  }
}
</script>
  <style lang="scss" scoped>
  </style>

