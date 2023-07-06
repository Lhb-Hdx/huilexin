<!--
 * @Author: 1834110585@qq.com 13925640643@lhj
 * @Date: 2022-03-31 14:15:05
 * @LastEditors: 1834110585@qq.com 13925640643@lhj
 * @LastEditTime: 2022-07-21 21:57:47
 * @FilePath: /ItMonitoring/src/views-admin/database-backup/database-backup-log.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select
        v-model="findDbBackupLogQuery.agent"
        class="filter-item"
        filterable
        clearable
        placeholder="网关"
      >
        <el-option
          v-for="item in agentList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div class="table-wrapper">
      <el-table
        :data="dbBackupLog"
        fit
        highlight-current-row
      >
        <el-table-column label="序号" width="80" type="index" />
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" label="文件名称" prop="fileName" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="left" label="文件URL" prop="fileUrl" show-overflow-tooltip />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="left" label="备份时间" prop="backupTime" show-overflow-tooltip />
      </el-table>
      <pagination v-show="findDbBackupLogTotal > 0" :auto-scroll="false" :total="findDbBackupLogTotal" :page.sync="findDbBackupLogQuery.page" :limit.sync="findDbBackupLogQuery.limit" @pagination="findLog" />
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import ListControl from '@/components/ListControl'

export default {
  name: 'DatabaseBackupLog',
  components: { Pagination, ListControl },
  data() {
    return {
      dbBackupLog: [],
      findDbBackupLogQuery: {
        page: 1,
        limit: 10,
        agent: ''
      },
      findDbBackupLogTotal: 0,
      agentList: [],
      // 显示控制数据 start
      checkList: ['文件名称', '文件URL', '备份时间'],
      lists: []
      // 显示控制数据 end
    }
  },
  mounted() {
    this.findLog()
    this.findHyitAgent()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 查询日志
    async findLog() {
      const dbBackupLog = await this.findDbBackupLog(this.findDbBackupLogQuery)
      if (dbBackupLog.code === 1) {
        this.dbBackupLog = dbBackupLog.data
        this.findDbBackupLogTotal = Number(dbBackupLog.count)
      }
    },
    // 查询日志请求
    async findDbBackupLog(query) {
      return await request({
        url: api.dbBackup.findDbBackupLog,
        data: query
      })
    },
    // 搜索
    handleFilter() {
      this.$set(this.findDbBackupLogQuery, 'page', 1)
      this.findLog()
    },
    // 获取网关
    findHyitAgent() {
      request({
        url: api.itMonitor.findHyitAgent,
        data: { agentType: 1, agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      }).then(res => {
        if (res.code === 1) {
          this.agentList = res.data
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
