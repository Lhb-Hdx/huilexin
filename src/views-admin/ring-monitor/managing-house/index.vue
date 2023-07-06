<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['create']" class="filter-item" type="primary" icon="el-icon-plus" @click="onCreate">新增</el-button>
      <div v-permission="['search']" style="display:inline-block">
        <el-input v-model="query.hyContract" placeholder="请输入房产联系人" style="width: 200px;" class="filter-item" clearable @clear="onFilter" />
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="onFilter">查询</el-button>
      </div>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        :data="list"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="序号" type="index" width="50" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="联系人" prop="hyContract" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="left" label="区域" prop="hyOrgId" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ $tool.matchData(area,row,'hyOrgId','hyAreaName','hyAreaId') }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="right" label="所在楼层" prop="hyFloor" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="right" label="房号" prop="hyRoomNo" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="right" label="联系电话" prop="hyTel" show-overflow-tooltip />
        <!--          <el-table-column label="状态" prop="hyState" show-overflow-tooltip>-->
        <!--            <template slot-scope="{row}">-->
        <!--              {{ $tool.formatStr(row.hyState,'0:未售,1:已售') }}-->
        <!--            </template>-->
        <!--          </el-table-column>-->
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="right" label="IC卡数量" prop="hyCardNum" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" align="right" label="人员数量" prop="hyOwnerNum" show-overflow-tooltip />
        <!--          <el-table-column label="车位数量" prop="hyParkingSpaceNum" show-overflow-tooltip />-->
        <!--          <el-table-column label="车数量" prop="hyCarNum" show-overflow-tooltip />-->
        <el-table-column v-if="lists.length > 0 ? lists[7].ispass : true" align="left" label="操作">
          <template slot-scope="{row}">
            <el-button v-permission="['edit']" type="primary" size="mini" @click="onEdit(row)">编辑</el-button>
            <el-button v-permission="['delete']" type="danger" size="mini" @click="handleDelete(row.hyRoomId)">删除</el-button>
          </template>
        </el-table-column>

      </el-table>
    </div>
    <pagination v-show="listTotal > 0" :auto-scroll="false" :total="listTotal" :page.sync="query.page" :limit.sync="query.limit" @pagination="findEsRoom" />

  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import ListControl from '@/components/ListControl'

export default {
  name: 'ContentUnionDeviceList',
  components: { Pagination, ListControl },
  data() {
    return {
      listLoading: false,
      query: {
        hyContract: '',
        page: 1,
        limit: 10
      },
      listTotal: 0,
      list: [],
      area: [],
      // 显示控制数据 start
      checkList: ['联系人', '区域', '所在楼层', '房号', '联系电话', 'IC卡数量', '人员数量', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.query = pageQuery
    }
    this.findEsRoom()
    this.findHyitArea()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    async findEsRoom() {
      let { code, data, count } = await request({ url: api.powerEnv.findEsRoom, data: this.query })
      if (code !== 1) return
      this.list = data
      this.listTotal = Number(count)
    },
    async findHyitArea() {
      let { code, data } = await request({ url: api.area.findHyitArea, data: { limit: -1 }})
      if (code !== 1) return
      this.area = data
    },
    onCreate() {
      const data = { ...this.query }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'house-add' })
    },
    onEdit(row) {
      const data = { ...this.query }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'house-update',
        query: {
          id: row.hyRoomId || 0
        }
      })
    },
    onFilter() {
      this.query.page = 1
      this.findEsRoom()
    },
    handleDelete(hyRoomId) {
      this.$confirm('确定删除吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const { code } = await request({
          url: api.powerEnv.deleteEsRoom,
          data: { hyRoomId }
        })
        if (code !== 1) return this.message.error('删除失败')
        this.$message.success('删除成功')
        this.$nextTick(() => {
          this.findEsRoom()
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
