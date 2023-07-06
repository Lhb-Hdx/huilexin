<template>
  <div>
    <el-table :data="list" stripe>
      <el-table-column prop="date" label="NO" type="index" width="50" />
      <el-table-column prop="hyHostName" label="主机名称" show-overflow-tooltip>
        <template slot-scope="{row}">
          {{ setHost(row.hyHostId) }}
        </template>
      </el-table-column>
      <el-table-column prop="hyDeviceName" label="设备名称" show-overflow-tooltip>
        <template slot-scope="{row}">
          {{ setDevice(row.hyDeviceId) }}
        </template>
      </el-table-column>
      <el-table-column prop="hyLevel" label="告警级别">
        <template slot-scope="{row}">
          <span :style="{ color: setAlarmLevelColor(row.hyLevel) }">{{ setLevel(row.hyLevel) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="hyAlarmDesc" label="描述" show-overflow-tooltip />
      <el-table-column prop="hyCtime" label="发生时间" show-overflow-tooltip />
      <!--      <el-table-column prop="" label="持续时间" show-overflow-tooltip />-->
      <!--      <el-table-column prop="hyRestoreStatus" label="是否恢复" show-overflow-tooltip>-->
      <!--        <template slot-scope="{row}">-->
      <!--          {{ $tool.formatStr(row.hyRestoreStatus,'0:未恢复,1:已恢复') }}-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <!--      <el-table-column prop="" label="是否确认" show-overflow-tooltip>-->
      <!--        <template slot-scope="{row}">-->
      <!--          <el-button v-if="row.hyStatus===0" type="primary" @click="submit(row)">确认</el-button>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
    </el-table>
    <pagination v-show="total>0" :total="total" :auto-scroll="false" :page.sync="findHyitAlarmLogQuery.page" :limit.sync="findHyitAlarmLogQuery.limit" @pagination="findHyitAlarmLog" />
  </div>
</template>

<script>
import logTableMixin from '../mixins/log-table-mixin'
import request from '@/utils/request'
import api from '@/api/api'
export default {
  mixins: [logTableMixin],
  methods: {
    async submit(row) {
      let { code } = await request({ url: api.powerEnv.updateHyitAlarmLog, data: { ...row, hyStatus: 1 }})
      if (code !== 1) return
      this.$message.error('操作成功')
    }
  }
}
</script>

<style>

</style>
