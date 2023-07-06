<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['create']" class="filter-item" type="primary" icon="el-icon-plus" @click="onCreate">新增</el-button>
      <div v-permission="['search']" style="display: inline-block">
        <el-input v-model="query.cardNo" placeholder="请输入卡号" style="width: 200px" class="filter-item" clearable @clear="onFilter" />
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="onFilter">查询</el-button>
      </div>
      <ListControl :check-list="checkList" @setLists="setLists" />

    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table :data="list" fit highlight-current-row style="width: 100%">
        <el-table-column label="序号" type="index" width="120" align="left" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="卡号" prop="cardNo" show-overflow-tooltip align="right" />
        <!-- <el-table-column label="梯控卡号" prop="displayPercentage" show-overflow-tooltip /> -->
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="所属房产" prop="priority" show-overflow-tooltip align="right">
          <template slot-scope="{ row }">
            {{ row.room.hyRoomNo }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="所属人员" prop="useUser" show-overflow-tooltip align="left">
          <template slot-scope="{ row }">
            {{ row.owner.ownerName }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="left" prop="prop" label="是否动环用户">
          <template v-slot="{ row }">
            <span v-if="row.owner.peUserId" style="color: #3CA170">是</span>
            <span v-else style="color: #EB4C4C">否</span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="状态" prop="state" show-overflow-tooltip align="left">
          <template slot-scope="{ row }">
            <span :style="{ color: $tool.formatStr(row.state, '1:#3CA170,0:#EB4C4C') }">
              {{ $tool.formatStr(row.state, '1:在用,0:闲置') }}
            </span>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" label="操作" align="left">
          <template slot-scope="{ row }">
            <el-button size="mini" type="primary" @click="openSubumitGuardRole(row)">权限管理</el-button>
            <el-button v-permission="['edit']" type="primary" size="mini" @click="onEdit(row.cardId)">编辑</el-button>
            <el-button v-permission="['delete']" type="danger" size="mini" @click="handleDelete(row.cardId)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="query.total > 0" :auto-scroll="false" :total="query.total" :page.sync="query.page" :limit.sync="query.limit" @pagination="findEsCard" />

    <IcCard ref="card" @update="onFilter" />
    <PowerDialog ref="PowerDialog" :form="form" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import IcCard from './ic-update.vue'
import Pagination from '@/components/Pagination'
import PowerDialog from './components/power-dialog.vue'
import ListControl from '@/components/ListControl'
export default {
  name: 'ContentUnionDeviceList',
  components: { IcCard, Pagination, PowerDialog, ListControl },
  data() {
    return {
      listLoading: false,
      query: {
        cardNo: '',
        page: 1,
        limit: 10,
        total: 0
      },
      findHyitHostQuery: {
        hyDevTypeId: 2
      },
      contentUnionHostList: [],
      areaList: [],
      hostList: [],
      devTypeList: [],
      subSystemList: [],
      list: [],
      dialogVisible: true,
      room: [],
      owner: [],
      form: {},
      // 显示控制数据 start
      checkList: ['卡号', '所属房产', '所属人员', '是否动环用户', '状态', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  mounted() {
    this.findEsCard()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 打开权限弹窗
    openSubumitGuardRole(row) {
      // if (!row.sbId || !row.agentId) {
      //   return this.$message.error('请先配置子系统')
      // }
      this.form = row
      this.$refs.PowerDialog.open(row)
    },
    async findEsRoom(roomIds) {
      let { code, data } = await request({ url: api.powerEnv.findEsRoom, data: { ids: roomIds } })
      if (code === 1) return data
    },
    async findEsOwner(ownerIds) {
      let { code, data } = await request({ url: api.powerEnv.findEsOwner, data: { ids: ownerIds } })
      if (code === 1) return data
    },
    async findEsCard() {
      let { code, data, count } = await request({ url: api.powerEnv.findEsCard, data: this.query })
      if (code !== 1) return
      // 取出房产和业主
      const ownerIds = [...new Set(data.map((item) => item.ownerId))]
      const ownerList = await this.findEsOwner(ownerIds)
      const roomIds = [...new Set(data.map((item) => item.roomId))]
      const roomList = await this.findEsRoom(roomIds)
      for (const it of data) {
        const owner = ownerList.find((item) => item.ownerId === it.ownerId)
        it['owner'] = owner || {}
        const room = roomList.find((item) => item.hyRoomId === it.roomId)
        it['room'] = room || {}
      }
      this.list = data
      this.query.total = Number(count)
    },
    onCreate() {
      this.$refs.card.open()
    },
    onEdit(cardId) {
      this.$refs.card.open(cardId)
    },
    submit() {},
    onFilter() {
      this.query.page = 1
      this.findEsCard()
    },
    handleDelete(cardId) {
      this.$confirm('确定删除吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code } = await request({
          url: api.powerEnv.deleteEsCard,
          data: { cardId }
        })
        if (code !== 1) return this.message.error('删除失败')
        this.$message.success('删除成功')
        this.$nextTick(() => {
          this.findEsCard()
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
