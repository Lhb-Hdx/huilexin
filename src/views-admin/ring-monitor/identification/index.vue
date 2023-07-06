<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['create']" class="filter-item" icon="el-icon-plus" type="primary" @click="onCreate">新增</el-button>
      <div v-permission="['search']" style="display:inline-block">
        <el-input v-model="query.hyIp" class="filter-item" clearable placeholder="请输入设备ip地址" style="width: 200px;" @clear="onFilter" />
        <el-input v-model="query.hyHostName" class="filter-item" clearable placeholder="请输入设备名字" style="width: 200px;" @clear="onFilter" />
        <el-button class="filter-item" icon="el-icon-search" type="primary" @click="onFilter">查询</el-button>
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
        <el-table-column label="序号" type="index" width="120" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="设备名称" prop="hyHostName" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="right" label="设备端口" prop="hyPort" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="left" label="设备网关" prop="agent" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ setagent(row.agent) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="right" label="设备ip地址" prop="hyIp" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="left" label="设备权限" prop="isPublic" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ $tool.formatStr(row.isPublic,'0:私有,1:公有') }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="left" label="设备状态" prop="hyStatus" show-overflow-tooltip>
          <template slot-scope="{row}">
            <!-- {{ $tool.formatStr(row.hyStatus,'0:启用,1:禁用,4:停用,3:待审') }} -->
            <el-switch :active-value="1" :inactive-value="0" :value="row.hyStatus" @change="statusChange($event,row)" />
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" align="left" fixed="right" label="操作" prop="priority" width="300">
          <template slot-scope="{row}">
            <el-button size="mini" type="primary" @click="openDialog(row),hyHostId = row['hyHostId']">绑定门禁</el-button>
            <el-button v-permission="['edit']" size="mini" type="primary" @click="onEdit(row)">编辑</el-button>
            <el-button v-permission="['delete']" size="mini" type="danger" @click="handleDelete(row.hyHostId)">删除</el-button>
          </template>
        </el-table-column>

      </el-table>
    </div>
    <pagination v-show="query.total > 0" :auto-scroll="false" :limit.sync="query.limit" :page.sync="query.page" :total="query.total" @pagination="findHyitHost" />

    <el-dialog :visible.sync="dialogVisible" title="">
      <el-table :data="deviceList">
        <el-table-column label="门禁设备" prop="hyDeviceName" show-overflow-tooltip />
        <el-table-column label="权限">
          <template v-slot="{row}">
            <el-checkbox v-for="access in row['access']" :key="access['hyVid']" :value="access.selected" @change="changeSelect(row,access)">{{ access.hyDes }}</el-checkbox>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer">
        <el-button type="primary" @click="dialogVisible=false">关闭</el-button>
      </div>
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
      listLoading: false,
      query: {
        hyHostName: '',
        hyIp: '',
        page: 1,
        limit: 10,
        hyDevTypeValue: 185,
        total: 0
      },
      list: [],
      agentlist: [],
      dialogVisible: false,
      hyHostId: '',
      deviceList: [],
      // 显示控制数据 start
      checkList: ['设备名称', '设备端口', '设备网关', '设备ip地址', '设备权限', '设备状态', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setagent() {
      return function(agent) {
        const idx = this.agentlist.findIndex(item => item.id === agent)
        if (idx !== -1) {
          return this.agentlist[idx].name
        }
      }
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    console.log(pageQuery)
    if (pageQuery) {
      delete pageQuery.route
      this.query = pageQuery
    }
  },
  async mounted() {
    await this.findHyitHost()
    await this.findHyitAgent()
    this.deviceList = await this.findHyitDevice()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    async openDialog(row) {
      this.dialogVisible = true
      const newDeviceList = [...this.deviceList]
      for (const device of newDeviceList) {
        device['access'] = await this.findHyitDeviceValue(device['hyDeviceId'])// 查门禁列表
        const premission = await this.findHyitHostDeviceMap(device['hyDeviceId'])// 查门禁是否选择
        for (const access of device['access']) {
          const idx = premission.find(it => it['hyVid'] === access['hyVid'])// 门禁列表是否有选择过的
          if (idx) {
            access['selected'] = true
            access['hyid'] = idx['hyId']
          }
        }
      }
      this.deviceList = newDeviceList
    },
    async changeSelect(row, access) {
      const trueFalse = access['selected']
      console.log(trueFalse)
      if (trueFalse) {
        let { msg, code } = await request({ url: api.powerEnv.deleteHyitHostDeviceMap, data: { hyId: access['hyid'] }})
        if (code === 1) this.$message.success(msg)
        // eslint-disable-next-line require-atomic-updates
        access['selected'] = false
      } else {
        let { msg, code } = await request({ url: api.powerEnv.insertHyitHostDeviceMap, data: {
          hyHostId: this.hyHostId,
          hyDeviceId: row['hyDeviceId'],
          hyVid: access['hyVid'],
          hyType: access['hyType']

        }})
        if (code === 1) this.$message.success(msg)
        // eslint-disable-next-line require-atomic-updates
        access['selected'] = true
      }
      await this.openDialog(this.hyHostId)
    },
    async findHyitDevice() {
      let { data, code } = await request({ url: api.powerEnv.findHyitDevice, data: { hyDevTypeValue: 105 }})
      if (code === 1) return data
    },
    async findHyitDeviceValue(hyDeviceId) {
      let { data, code } = await request({ url: api.powerEnv.findHyitDeviceValue, data: { hyDeviceId, hyType: 6 }})
      if (code === 1) return data
    },
    async findHyitHostDeviceMap(hyDeviceId) {
      let { data, code } = await request({ url: api.powerEnv.findHyitHostDeviceMap, data: { hyDeviceId }})
      if (code === 1) return data
    },
    async statusChange(status, row) {
      console.log(status)
      let { code } = await request({ url: api.powerEnv.updateHyitHost, data: { ...row, hyStatus: status ? 1 : 0 }})
      if (code !== 1) return
      this.$message.success('修改成功')
      this.findHyitHost()
    },
    async findHyitHost() {
      let { code, data, count } = await request({ url: api.powerEnv.findHyitHost, data: this.query })
      if (code !== 1) return
      this.list = data
      this.query.total = +count
    },
    async findHyitAgent() {
      let { code, data } = await request({ url: api.itMonitor.findHyitAgent, data: {}})
      if (code !== 1) return
      this.agentlist = data
    },
    onCreate() {
      const data = { ...this.query }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'identification-add' })
    },
    onEdit(row) {
      const data = { ...this.query }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'identification-update',
        query: {
          id: row.hyHostId || 0
        }
      })
    },
    submit() {},

    onFilter() {
      this.query.page = 1
      this.findHyitHost()
    },
    handleDelete(hyHostId) {
      this.$confirm('确定删除吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const { code } = await request({
          url: api.powerEnv.deleteHyitHost,
          data: { hyHostId }
        })
        if (code !== 1) return this.message.error('删除失败')
        this.$message.success('删除成功')
        this.$nextTick(() => {
          this.findHyitHost()
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
