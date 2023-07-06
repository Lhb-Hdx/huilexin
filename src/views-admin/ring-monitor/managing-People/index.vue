<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['create']" class="filter-item" icon="el-icon-plus" type="primary" @click="onCreate">新增
      </el-button>
      <div v-permission="['search']" style="display:inline-block">
        <el-input
          v-model="query.ownerName"
          class="filter-item"
          clearable
          placeholder="请输入人员姓名"
          style="width: 200px;"
          @clear="onFilter"
        />
        <el-button class="filter-item" icon="el-icon-search" type="primary" @click="onFilter">查询</el-button>
      </div>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div class="table-wrapper">
      <el-table
        :data="list"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="序号" show-overflow-tooltip type="index" width="120" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="人员姓名" prop="ownerName" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="left" label="性别" prop="sex" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ $tool.formatStr(row.sex, '0:女,1:男') }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="left" label="所属房产" prop="roomId" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ $tool.matchData(roomList, row, 'roomId', 'hyRoomNo', 'hyRoomId') }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="left" label="人员类型" prop="ownerType" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ $tool.formatStr(row.ownerType, '0:业主,1:业主家属') }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="right" label="联系电话" prop="tel" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="right" label="身份证号码" prop="ownerCode" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" align="left" label="人员照片" prop="ownerCode">
          <template slot-scope="{row}">
            <el-image :lazy="true" :src="row.faceImgUrl || ''" style="width:80px;height:80px;object-fit:cover" />
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[7].ispass : true" align="left" label="备注" prop="remark" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[8].ispass : true" align="left" label="操作" width="300">
          <template slot-scope="{row}">
            <el-button v-permission="['permission']" size="mini" type="primary" @click="openDialog(row)">权限</el-button>
            <el-button v-permission="['edit']" size="mini" type="primary" @click="onEdit(row)">编辑</el-button>
            <el-button v-permission="['delete']" size="mini" type="danger" @click="handleDelete(row.ownerId)">删除
            </el-button>
          </template>
        </el-table-column>

      </el-table>
    </div>
    <pagination
      v-show="listTotal> 0"
      :limit.sync="query.limit"
      :page.sync="query.page"
      :total="listTotal"
      :auto-scroll="false"
      @pagination="findEsOwner"
    />

    <el-dialog
      :visible.sync="dialogShow"
      title="人员关联人脸设备权限"
      width="30%"
    >
      <div v-loading="permissionLoading" element-loading-spinner="el-icon-loading">
        <el-checkbox
          v-for="(item) in hostList"
          :key="item.hyHostId+Math.random().toString(16).slice(2)"
          :checked="item.checked"
          :indeterminate="false"
          @change="ownerPrimission($event, item.hyHostId,item.hySbId)"
        >{{ item.hyHostName }}
        </el-checkbox>
      </div>
      <!--      <span slot="footer">-->
      <!--        <el-button @click="dialogShow = false">确定</el-button>-->
      <!--      </span>-->
    </el-dialog>

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
      query: {
        ownerName: '',
        hyIp: '',
        page: 1,
        limit: 10,
        hyDevTypeValue: 185
      },
      listTotal: 0,
      list: [],
      roomList: [],
      hostList: [],
      dialogShow: false,
      permissionLoading: false,
      owner: {},
      // 显示控制数据 start
      checkList: ['人员姓名', '性别', '所属房产', '人员类型', '联系电话', '身份证号码', '人员照片', '备注', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setRoom() {
      return function(roomId) {
        const idx = this.roomList.findIndex(item => item.hyRoomId === roomId)
        if (idx !== -1) {
          return this.roomList[idx].hyContract
        }
      }
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.query = pageQuery
    }
  },
  mounted() {
    this.findEsOwner()
    this.findEsRoom()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    async openDialog(row) {
      this.owner = row
      this.dialogShow = true
      await this.findHyitHost()
    },
    async findHyitHostDeviceMap(hostId) {
      let { data, code } = await request({ url: api.powerEnv.findHyitHostDeviceMap, data: { hostId }})
      if (code === 1) return data
    },
    async findHyitDeviceValue(ids) {
      let { data, code } = await request({ url: api.powerEnv.findHyitDeviceValue, data: { ids }})
      if (code === 1) return data
    },
    async ownerPrimission(state, hostIds, hySbId) {
      try {
        this.permissionLoading = true
        let { code, data } = await request({ url: api.powerEnv.findHyitAgentSubsystem, data: { sbId: hySbId, type: 2 }})
        let { code: faceCode, data: faceData } = await request({ url: api.powerEnv.findHyitAgentSubsystem, data: { sbId: hySbId, type: 5 }})

        const agentId = data?.[0]?.['agentId']
        const faceAgentId = faceData?.[0]?.['agentId']
        if (code !== 1 || faceCode !== 1 || !agentId || !faceAgentId) {
          this.permissionLoading = false
          return
        }
        // 查出所有vid数据
        const deviceMap = await this.findHyitHostDeviceMap(hostIds)
        const deviceValueList = await this.findHyitDeviceValue(deviceMap.map(it => it.hyVid).filter(Boolean))
        for (const item of deviceMap) {
          const idx = deviceValueList.find(it => +it.hyVid === +item.hyVid)
          if (idx)item.hyZitemid = idx.hyZitemid
        }
        const queryStrs = deviceMap.map(it => `${it.hyDeviceId}-${it.hyVid}-${it.hyZitemid}`).join(',')
        console.log('queryStrs: ', queryStrs)
        if (state) {
          await this.addEsOwnerPermission(faceAgentId, hostIds)
          if (deviceMap.length) await this.addDHUserPower(hySbId, agentId, queryStrs)
          this.permissionLoading = false
          await this.addDHUserFaceSerialNum(this.owner.ownerId, hySbId, agentId)
          setTimeout(async() => {
            let { isover, synerr } = await this.getSyncProgress(hySbId, agentId)
            if (isover !== 1 && synerr <= 0) return
            await this.resyncCard(hySbId, agentId)
          }, 5000)
        } else {
          await this.deleteEsOwnerPermission(faceAgentId, hostIds)
          let ownerCards = await this.findEsCard(this.owner.ownerId)
          const peCardIds = ownerCards.map(it => it.peCardId).filter(Boolean).join(',')
          if (deviceMap.length) await this.deleteDHUserPower(hySbId, agentId, queryStrs, peCardIds)
          this.permissionLoading = false
          await this.deleteDHUserFaceSerialNum(this.owner.ownerId, hySbId, agentId)
          setTimeout(async() => {
            let { isover, synerr } = await this.getSyncProgress(hySbId, agentId)
            if (isover !== 1 && synerr <= 0) return
            await this.resyncCard(hySbId, agentId)
          }, 5000)
        }
        await this.findHyitHost()
        this.$forceUpdate()
      } catch (error) {
        this.permissionLoading = false
      }
    },
    async findEsCard(ownerId) {
      const {data, code} = await request({url: api.powerEnv.findEsCard, data: {ownerId, limit: -1}})
      if (code === 1) return data
    },
    async addDHUserPower(sbId, agentId, ids) {
      let { data, code } = await request({
        url: api.powerEnv.addDHUserPower,
        data: {
          sbId,
          agentId,
          peUserId: this.owner.peUserId,
          ids
        }
      })
      if (code === 1) return data
    },
    async deleteDHUserPower(sbId, agentId, ids, peCardIds) {
      let { data, code } = await request({
        url: api.powerEnv.deleteDHUserPower,
        data: {
          sbId,
          agentId,
          peUserId: this.owner.peUserId,
          ids,
          peCardIds
        }
      })
      if (code === 1) return data
    },
    async findEsOwner() {
      let { code, data, count } = await request({ url: api.powerEnv.findEsOwner, data: this.query })
      if (code !== 1) return
      this.list = data
      this.listTotal = Number(count)
    },
    async findEsRoom() {
      let { code, data } = await request({ url: api.powerEnv.findEsRoom, data: { limit: -1 }})
      if (code !== 1) return
      this.roomList = data
    },
    async findHyitHost() {
      let { code, data } = await request({ url: api.powerEnv.findHyitHost, data: { hyDevTypeValue: 185 }})
      if (code !== 1) return
      let permissionData = await this.getEsOwnerPermission()
      // eslint-disable-next-line no-return-assign
      data.map(it => it['checked'] = false)
      permissionData.forEach((item) => {
        const idx = data.findIndex(hostItem => hostItem.hyHostId === item.hostId)

        if (idx !== -1) data[idx]['checked'] = true
      })
      this.hostList = data
      this.$forceUpdate()
    },
    async getEsOwnerPermission(ownerId) {
      let { code, data } = await request({ url: api.powerEnv.getEsOwnerPermission, data: { ownerId: this.owner.ownerId }})
      if (code !== 1) return
      return data
    },
    async addEsOwnerPermission(agentId, hostIds) {
      let { code } = await request({
        url: api.powerEnv.addEsOwnerPermission,
        data: { ownerId: this.owner.ownerId, agentId, hostIds: '' + hostIds }
      })
      if (code === 1) return this.$message.success('添加成功')
      if (code !== 1) return this.$message.error('添加失败')
    },
    async deleteEsOwnerPermission(agentId, hostIds) {
      let { code } = await request({
        url: api.powerEnv.deleteEsOwnerPermission,
        data: { ownerId: this.owner.ownerId, agentId, hostIds: '' + hostIds }
      })
      if (code === 1) return this.$message.success('删除成功')
      if (code !== 1) return this.$message.error('删除失败')
    },
    async addDHUserFaceSerialNum(ownerId, sbId, agentId) {
      let { data, code } = await request({ url: api.powerEnv.addDHUserFaceSerialNum, data: { ownerId, sbId, agentId }})
      if (code === 1) return data
    },
    async deleteDHUserFaceSerialNum(ownerId, sbId, agentId) {
      let { data, code } = await request({ url: api.powerEnv.deleteDHUserFaceSerialNum, data: { ownerId, sbId, agentId }})
      if (code === 1) return data
    },
    async getSyncProgress(sbId, agentId) {
      let { data, code } = await request({ url: api.powerEnv.getSyncProgress, data: { sbId, agentId }})
      if (code === 1) return data
    },
    async resyncCard(sbId, agentId) {
      let { data, code } = await request({ url: api.powerEnv.resyncCard, data: { sbId, agentId }})
      if (code === 1) return data
    },
    onCreate() {
      const data = { ...this.query }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'managing-add' })
    },
    onEdit(row) {
      const data = { ...this.query }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'managing-update',
        query: {
          id: row.ownerId || 0
        }
      })
    },
    onFilter() {
      this.query.page = 1
      this.findEsOwner()
    },
    handleDelete(ownerId) {
      this.$confirm('确定删除吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const { code } = await request({
          url: api.powerEnv.deleteEsOwner,
          data: { ownerId }
        })
        if (code !== 1) return this.message.error('删除失败')
        this.$message.success('删除成功')
        this.$nextTick(() => {
          this.findEsOwner()
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
