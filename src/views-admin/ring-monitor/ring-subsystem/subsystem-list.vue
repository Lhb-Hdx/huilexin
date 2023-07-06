<template>
  <div class="app-container">
    <el-card shadow="never">

      <div class="filter-container">
        <el-button v-permission="['create']" class="filter-item" type="primary" icon="el-icon-plus" @click="onCreate">新增</el-button>
        <el-input v-model="subSystemListQuery.keyword" v-permission="['search']" placeholder="请输入子系统名称" style="width: 200px;" class="filter-item" />
        <el-button v-permission="['search']" class="filter-item" type="primary" icon="el-icon-search" @click="onFilter">查询</el-button>
        <ListControl :check-list="checkList" @setLists="setLists" />
      </div>
      <div v-loading="listLoading" class="table-wrapper">
        <el-table
          :data="subSystemList"
          fit
          highlight-current-row
          style="width: 100%;"
        >
          <el-table-column label="NO" prop="id" type="index" width="120" />
          <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="子系统名称" prop="hySbName" show-overflow-tooltip />
          <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="left" label="所在区域" prop="hyOrgId">
            <template slot-scope="item">
              {{ setAreaName(item.row.hyOrgId) }}
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="right" label="IP" prop="hyIp" show-overflow-tooltip />
          <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="right" label="端口" prop="hyPort" show-overflow-tooltip />
          <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="left" label="子系统状态">
            <template slot-scope="item">
              <div :class="item.row.hyStatus === 1 ? 'success' : 'danger'">
                <i :class="item.row.hyStatus === 1 ? 'el-icon-success' : 'el-icon-error'" />
                {{ item.row.hyStatus === 1 ? '在线' : '离线' }}
              </div>
            </template>
          </el-table-column>
          <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="right" label="更新时间" prop="hyUtime" show-overflow-tooltip />
          <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" align="left" label="操作" width="400" class-name="small-padding fixed-width">
            <template slot-scope="{row}">
              <el-button v-permission="['edit']" size="mini" type="primary" @click="onEdit(row)">
                编辑
              </el-button>
              <el-button v-permission="['sync']" size="mini" type="primary" @click="onSync(row)">
                同步数据
              </el-button>
              <el-button v-permission="['push']" size="mini" type="primary" @click="onPushConfig(row)">
                推送配置
              </el-button>
              <el-button v-permission="['remove']" size="mini" type="danger" @click="onDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <pagination v-show="listTotal > 0" :auto-scroll="false" :total="listTotal" :page.sync="subSystemListQuery.page" :limit.sync="subSystemListQuery.limit" @pagination="findHyitSubSystem" />
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import ListControl from '@/components/ListControl'

export default {
  name: 'RingSubSystemList',
  components: { Pagination, ListControl },
  data() {
    return {
      listLoading: false,
      subSystemListQuery: {
        keyword: '',
        page: 1,
        limit: 10
        // total: 0
      },
      listTotal: 0,
      subSystemList: [],
      areaList: [],
      hostList: [
        { id: 1, name: '动环监控物联主机' }
      ],
      // 显示控制数据 start
      checkList: ['子系统名称', '所在区域', 'IP', '端口', '子系统状态', '更新时间', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setAreaName() {
      return function(hyOrgId) {
        const idx = this.areaList.findIndex(item => item.hyAreaId === hyOrgId)
        if (idx !== -1) {
          return this.areaList[idx].hyAreaName
        }
      }
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.subSystemListQuery = pageQuery
    }
  },
  mounted() {
    this.findHyitOrg()
    this.findHyitSubSystem()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    onCreate() {
      const data = { ...this.subSystemListQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'AddSubSystem' })
    },
    onEdit(row) {
      const data = { ...this.subSystemListQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'UpdateSubSystem',
        query: {
          id: row.hySbId || 0
        }
      })
    },
    onFilter() {
      this.subSystemListQuery.page = 1
      this.findHyitSubSystem()
    },
    handleSizeChange() {},
    handleCurrentChange() {},
    findHyitSubSystem() {
      request({
        url: api.powerEnv.findHyitSubSystem,
        data: this.subSystemListQuery
      }).then(res => {
        if (res.code === 1) {
          this.subSystemList = res.data
          this.listTotal = Number(res.count)
        }
      })
    },
    findHyitOrg() {
      request({
        url: api.area.findHyitArea,
        data: {}
      }).then(res => {
        if (res.code === 1) {
          this.areaList = res.data
        }
      })
    },
    onDelete(row) {
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        request({ url: api.powerEnv.deleteHyitSubSystem, data: { hySbId: row.hySbId }}).then(res => {
          if (res.code === 1) {
            this.subSystemListQuery.page = 1
            this.$message.success('删除成功')
            this.findHyitSubSystem()
          }
        })
      })
    },
    async getHyitSubSystem(hySbId) {
      return await request({ url: api.powerEnv.getHyitAgentSubsystem, data: { sbId: hySbId }}).then(res => {
        if (res.code === 1) {
          return res.data[0]
        }
      })
    },
    onPushConfig(row) {
      this.$confirm('确认推送配置吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        this.getHyitSubSystem(row.hySbId).then(res => {
          request({ url: api.powerEnv.getServerPushConfig, data: { agentId: res.agentId, sbId: row.hySbId }}).then(res => {
            if (res.code === 1) {
              this.$message.success(res.msg)
            }
          })
        })
      })
    },
    onSync(row) {
      this.$confirm('确认同步子系统吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        this.getHyitSubSystem(row.hySbId).then(res => {
          request({ url: api.powerEnv.syncDongHuanSystem, data: { agentId: res.agentId, sbId: row.hySbId }}).then(res => {
            if (res.code === 1) {
              this.$message.success('同步成功')
            }
          })
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-card ::v-deep .el-card__body {
      padding: 10px;
    }
</style>
