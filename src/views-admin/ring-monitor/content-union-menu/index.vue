<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button
        v-permission="['create']"
        class="filter-item"
        icon="el-icon-plus"
        type="primary"
        @click="onCreate"
      >新增</el-button>
      <div
        v-permission="['search']"
        style="display:inline-block"
      >
        <el-input
          v-model="query.columnName"
          class="filter-item"
          clearable
          placeholder="请输入栏目名称"
          style="width: 200px;"
          @clear="findHyitDhMenu"
        />
        <el-button
          class="filter-item"
          icon="el-icon-search"
          type="primary"
          @click="onFilter"
        >查询</el-button>
      </div>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div
      v-loading="listLoading"
      class="table-wrapper"
    >
      <el-table
        :data="list"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column
          label="NO"
          prop="id"
          type="index"
          width="120"
        />
        <el-table-column
          v-if="lists.length > 0 ? lists[0].ispass : true"
          align="left"
          label="栏目名称"
          prop="columnName"
        />
        <el-table-column
          v-if="lists.length > 0 ? lists[1].ispass : true"
          label="类型"
          align="left"
          prop="typeId"
        >
          <template slot-scope="{row}">
            {{ setdevtype(row.typeId) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="left" label="设备名称">
          <template slot-scope="{row}">
            {{ setDevice(row.deviceId) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="left" label="设备别名(地址)">
          <template slot-scope="{row}">
            {{ setDeviceValue(row.deviceId) || '' }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="lists.length > 0 ? lists[4].ispass : true"
          label="样式"
          align="left"
          prop="displayType"
        >
          <template slot-scope="{row}">
            {{ $tool.formatStr(row.displayType,'0:数值,1:历史曲线,2:仪表盘,3:开关,4:多数据柱状图') }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="lists.length > 0 ? lists[5].ispass : true"
          label="优先级"
          align="right"
          prop="priority"
        />
        <el-table-column
          v-if="lists.length > 0 ? lists[6].ispass : true"
          label="操作"
          align="left"
          prop="priority"
        >
          <template slot-scope="{row}">
            <el-button
              v-permission="['edit']"
              size="mini"
              type="primary"
              @click="onEdit(row)"
            >编辑</el-button>
            <el-button
              v-permission="['delete']"
              size="mini"
              type="danger"
              @click="handleDelete(row.id)"
            >删除</el-button>
          </template>
        </el-table-column>

      </el-table>
    </div>
    <pagination
      v-show="listTotal > 0"
      :limit.sync="query.limit"
      :page.sync="query.page"
      :total="listTotal"
      :auto-scroll="false"
      @pagination="findHyitDhMenu"
    />
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
        columnName: '',
        page: 1,
        limit: 10
      },
      listTotal: 0,
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
      devicevalueList: [],
      // 显示控制数据 start
      checkList: ['栏目名称', '类型', '设备名称', '设备别名(地址)', '样式', '优先级', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setdevtype() {
      return function(typeId) {
        const idx = this.devTypeList.findIndex(item => item.hyDevTypeId === typeId)
        if (idx !== -1) {
          return this.devTypeList[idx].hyDevTypeName
        }
      }
    },
    setDevice() {
      return function(id) {
        const idx = this.contentUnionHostList.findIndex(item => item.hyDeviceId === id)
        if (idx !== -1) {
          return this.contentUnionHostList[idx].hyDeviceName
        }
      }
    },
    setDeviceValue() {
      return function(id) {
        const idx = this.contentUnionHostList.findIndex(item => item.hyDeviceId === id)
        console.log(idx)
        if (idx !== -1) {
          return (this.contentUnionHostList[idx].hyAlias || '') + `(${this.contentUnionHostList[idx]['hyAddr']})`
        }
      }
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.query = pageQuery

      console.log(this.query, 'this.query ')
    }
  },
  async mounted() {
    await this.findHyitDhMenu()
    // await this.findHyitDevicevalue()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    async findHyitDevicevalue() {
      let { code, data } = await request({
        url: api.powerEnv.findHyitDeviceValue, data: { limit: -1 }
      })
      if (code !== 1) return
      this.devicevalueList = data
    },
    async findHyitDhMenu() {
      let { code, data, count } = await request({ url: api.powerEnv.findHyitDhMenu, data: this.query })
      if (code !== 1) return
      if (data.length) {
        await this.findHyitDevice(data.map(it => it.deviceId).filter(Boolean))
        await this.findHyitDevType(data.map(it => it.typeId).filter(Boolean))
      }
      this.list = data
      this.listTotal = Number(count)
    },
    onCreate() {
      const data = { ...this.query }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'menu-add-update' })
    },
    onEdit(row) {
      const data = { ...this.query }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'menu-add-edit',
        query: {
          id: row.id || 0
        }
      })
    },
    submit() { },
    async findHyitDevice(ids) {
      let { code, data } = await request({
        url: api.powerEnv.findHyitDevice, data: { limit: -1, ids}
      })
      if (code !== 1) return
      this.contentUnionHostList = data
      this.listLoading = false
      return data
    },
    findHyitDevType(ids) {
      request({
        url: api.powerEnv.findHyitDevType,
        data: { limit: -1, ids }
      }).then(res => {
        if (res.code === 1) {
          this.devTypeList = res.data
        }
      })
    },
    async findHyitDeviceValue(hyDeviceId) {
      let { code, data } = await request({ url: api.powerEnv.findHyitDeviceValue, data: { hyDeviceId }})
      if (code !== 1) return
      this.list = data
    },
    onFilter() {
      this.query.page = 1
      this.findHyitDhMenu()
    },
    handleDelete(id) {
      this.$confirm('确定删除吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const { code } = await request({
          url: api.powerEnv.deleteHyitDhMenu,
          data: { id }
        })
        if (code !== 1) return this.message.error('删除失败')
        this.$message.success('删除成功')
        this.$nextTick(() => {
          this.findHyitDhMenu()
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
