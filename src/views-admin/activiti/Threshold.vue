<template>
  <div class="app-container">
    <div class="flex-h-center mb-20">
      <el-button
        v-permission="['create']"
        class="mr-10"
        type="primary"
        icon="el-icon-plus"
        @click="handleAdd()"
      >新增</el-button>
      <el-form
        ref="form"
        v-permission="['search']"
        inline
        :model="listQuery"
        class="flex-h-center"
      >
        <el-form-item>
          <el-input
            v-model="listQuery.name"
            placeholder="请输入阈值名称"
            clearable
            @change="handleSearch"
          />
        </el-form-item>
        <!--        <el-form-item>-->
        <!--          <el-select v-model="listQuery.hyActionClassId" placeholder="全部模板类型" clearable @click="handleSearch">-->
        <!--            <el-option v-for="item in setSearchType" :key="item.hyActionClassId" :label="item.hyActionClassName" :value="item.hyActionClassId" />-->
        <!--          </el-select>-->
        <!--        </el-form-item>-->
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="handleSearch"
          >查询</el-button>
        </el-form-item>
      </el-form>
      <div class="cal">
        <ListControl :check-list="checkList" @setLists="setLists" />
      </div>

    </div>
    <div class="table-wrapper">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column
          v-if="lists.length > 0 ? lists[0].ispass : true"
          label="阈值条件名称"
          align="left"
          prop="name"
          show-overflow-tooltip
        />
        <el-table-column
          v-if="lists.length > 0 ? lists[1].ispass : true"
          label="类型"
          prop="hyActionType"
          show-overflow-tooltip
          align="left"
        >
          <template slot-scope="{ row }">
            {{ setType(row.hyEventClassId) }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="lists.length > 0 ? lists[2].ispass : true"
          label="级别"
          prop="level"
          show-overflow-tooltip
          align="left"
        >
          <template slot-scope="{ row }">
            {{
              $tool.matchData(levelList, row, "level", "hyLevelName", "hyLevel")
            }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="lists.length > 0 ? lists[3].ispass : true"
          label="条件"
          prop="level"
          show-overflow-tooltip
          align="left"
        >
          <template slot-scope="{ row }">
            {{ $tool.formatStr(row.condType, "-1:&lt;小于,0:=等于,1:&gt;大于")
            }}{{ row.alarmValue }}{{ row.unit }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="适用对象" show-overflow-tooltip align="center">
          <template slot-scope="{ row }">
            {{ setTypeParent(row.hyEventClassId) }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="lists.length > 0 ? lists[5].ispass : true"
          prop="alarmName"
          label="告警标题名称"
          show-overflow-tooltip
          align="left"
        />
        <!--        <el-table-column-->
        <!--          prop="hyUtime"-->
        <!--          label="配置时间"-->
        <!--          show-overflow-tooltip-->
        <!--          align="center"-->
        <!--        />-->
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" label="配置人" show-overflow-tooltip align="center">
          <template slot-scope="{ row }">
            {{ $tool.matchData(userList, row, "userId", "userName") }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="lists.length > 0 ? lists[7].ispass : true"
          v-permission="['status']"
          prop="hyStatus"
          label="启用状态"
          show-overflow-tooltip
          align="left"
        >
          <template slot-scope="{ row }">
            <el-switch
              :value="!!row.status"
              @change="hyStatusChange($event, row)"
            />
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[8].ispass : true" align="left" width="300px" label="操作">
          <template slot-scope="{ row }">
            <el-button
              v-permission="['edit']"
              type="primary"
              size="mini"
              @click="handleEdit(row.conditionId)"
            >编辑</el-button>
            <el-button
              v-permission="['delete']"
              type="danger"
              size="mini"
              @click="handleDelete(row.conditionId)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination
      v-show="listCount > 0"
      :auto-scroll="false"
      :total="listCount"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="findLinkageThresholdCondition"
    />
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
        name: '',
        HyEventClassId: '',
        // count: 1,
        page: 1,
        limit: 10
      },
      listCount: 1,
      tableData: [{}],
      hyEventClassid: [
        { label: '无效', value: 0 },
        { label: '有效', value: 1 }
      ],
      levelList: [],
      EventClassList: [],
      userList: [],
      // 显示控制数据 start
      checkList: ['阈值条件名称', '类型', '级别', '条件', '适用对象', '告警标题名称', '配置人', '启用状态', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setType() {
      return (HyEventClassId) => {
        const child = this.EventClassList.find(
          (it) => it['hyEventClassid'] === HyEventClassId
        )
        if (!child) return ''
        if (!child.pid) return child['hyEventClassname'] // 没有pid的表示已经是父了，不用往下找
        const parent = this.EventClassList.find(
          (it) => it['hyEventClassid'] === child['pid']
        )
        if (!parent) return ''
        const type = this.EventClassList.find(
          (it) => it['hyEventClassid'] === parent['pid']
        )
        if (type) return type['hyEventClassname']
      }
    },
    setSearchType() {
      return this.EventClassList.filter((it) => it['pid'] === null)
    },
    setTypeParent() {
      return (HyEventClassId) => {
        const parent = this.EventClassList.find(
          (it) => it['hyEventClassid'] === HyEventClassId
        )
        if (parent) return parent['hyEventClassname']
      }
    }
  },
  async created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.listQuery = pageQuery
    }
    await this.hyitAlarmLevel()
    await this.findLinkageActionClass()
    await this.findSysUser()
    await this.findLinkageThresholdCondition()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    async findSysUser() {
      let { data, code } = await request({
        url: api.sys.findSysUser,
        data: { limit: -1, companyId: this.$auth.getUserSession().companyId }
      })
      if (code === 1) this.userList = data
    },
    async hyitAlarmLevel() {
      let { code, data } = await request({
        url: api.powerEnv.findHyitAlarmLevel,
        data: {}
      })
      if (code !== 1) return
      this.levelList = data
      return data
    },
    async findLinkageActionClass() {
      let { data, code } = await request({
        url: api.linkageManage.findLinkageEventClass
      })
      if (code !== 1) return
      this.EventClassList = data
    },
    handleSearch() {
      this.$set(this.listQuery, 'page', 1)
      this.findLinkageThresholdCondition()
    },
    handleAdd() {
      const data = { ...this.listQuery }
      this.localStorageOperation(
        'set',
        'pageQuery',
        JSON.stringify({
          ...data,
          route: this.$route.name
        })
      )
      this.$router.push({ name: 'AddThreshold' })
    },
    handleEdit(conditionId) {
      const data = { ...this.listQuery }
      this.localStorageOperation(
        'set',
        'pageQuery',
        JSON.stringify({
          ...data,
          route: this.$route.name
        })
      )
      this.$router.push({ name: 'EditThreshold', query: { conditionId } })
    },
    handleDelete(conditionId) {
      this.$confirm('确定删除吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.linkageManage.deleteLinkageThresholdCondition,
          data: { conditionId }
        }).then(
          ({ code }) => {
            this.$message.success('删除成功')
            this.$nextTick(() => {
              this.findLinkageThresholdCondition()
            })
          },
          () => {
            this.$message.error('删除失败')
          }
        )
      })
    },
    async hyStatusChange(flag, row) {
      row.status = flag
      const { ...data } = row
      let { code } = await request({
        url: api.linkageManage.updateLinkageThresholdCondition,
        data: { ...data, status: +data.status }
      })
      if (code !== 1) return
      this.$message.success('修改成功')
      await this.findLinkageThresholdCondition()
    },
    async findLinkageThresholdCondition() {
      console.log(this.listQuery, '1111')
      let { data, code, count } = await request({
        url: api.linkageManage.findLinkageThresholdCondition,
        data: this.listQuery
      })
      if (code !== 1) return
      this.listCount = Number(count)
      // this.$set(this.listQuery, 'count', +count)
      this.tableData = data
    }
  }
}
</script>

<style scoped>
.el-form-item {
  margin-bottom: 0;
}
.cal {
  position: absolute;
  right: 20px;
}
</style>
