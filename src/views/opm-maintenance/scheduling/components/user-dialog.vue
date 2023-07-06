<template>
  <el-dialog :title="dialogTitle" :visible.sync="showDialog" width="60%" top="5vh">
    <div class="dialog-body">
      <div class="table-wrapper">
        <el-table :data="leave">
          <el-table-column label="请假时间" show-overflow-tooltip width="300">
            <template slot-scope="{row}">{{ row.leaveStartTime }} - {{ row.leaveEndTime }}</template>
          </el-table-column>
          <el-table-column label="请假类型" show-overflow-tooltip>
            <template slot-scope="{row}">{{ setOTType(row.leaveType) }}</template>
          </el-table-column>
          <el-table-column label="请假时长(小时)" prop="totalHour" width="120" show-overflow-tooltip />
          <el-table-column label="审核状态" show-overflow-tooltip>
            <template slot-scope="{row}">
              <div :class="setAuditStatusColorClass(row.statue)">{{ setAuditStatus(row.statue) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="状态" show-overflow-tooltip>
            <template slot-scope="{row}">
              <div :class="setStatusColorClass(row.log.approveStatue)">{{ setStatus(row.log.approveStatue) }}</div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'UserDialog',
  data() {
    return {
      dialogTitle: '',
      showDialog: false,
      leave: [],
      leaveTypes: this.$paramsModel.opm.get('leaveType'),
      audioStatus: this.$paramsModel.common.get('audioStatus')
    }
  },
  computed: {
    setOTType() {
      return function (value) {
        const getItem = this.leaveTypes.filter(ele => +ele.value === +value)
        return getItem.length > 0 ? getItem[0].label : ''
      }
    },
    setStatus() {
      return function(approveStatue) {
        if (!approveStatue) return ''
        return this.$defineData.processStatus(approveStatue)
      }
    },
    setStatusColorClass() {
      return function(approveStatue) {
        if (!approveStatue) return ''
        return this.$defineData.processStatus(approveStatue, 'color')
      }
    },
    setAuditStatus() {
      return function(statue) {
        const getItem = this.audioStatus.findIndex((item) => Number(item.statue) === Number(statue))
        return getItem !== -1 ? this.audioStatus[getItem].value : ''
      }
    },
    setAuditStatusColorClass() {
      return function(statue) {
        const getItem = this.audioStatus.findIndex((item) => Number(item.statue) === Number(statue))
        return getItem !== -1 ? this.audioStatus[getItem].color : ''
      }
    }
  },
  methods: {
    // 打开
    open(options) {
      if (options) {
        this.dialogTitle = `查看${options.realName}${options.tel}请假记录`
        this.showDialog = true
        this.leave = options.leave
      }
    }
  }
}
</script>
