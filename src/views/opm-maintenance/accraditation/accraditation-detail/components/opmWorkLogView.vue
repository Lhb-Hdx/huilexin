<template>
  <div>
    <el-row class="log-header mb-10">
      <el-col :span="19"><div class="text-center flex-center">工作描述</div></el-col>
      <el-col :span="5"><div class="text-center flex-center">工作进度</div></el-col>
    </el-row>
    <el-row v-for="item in workLog" :key="item.id" class="log-date">
      <el-col :span="2" class="log-date-item">
        <div class="flex-center flex-colunm log-date-item-left">
          <div class="font-40">{{ item.d }}</div>
          <div style="color: #999">{{ item.m }}</div>
        </div>
      </el-col>
      <el-col :span="17" class="log-date-item textContainer">
        <div class="textAreaWrapper">
          <el-input v-if="item.showInput" v-model="item.workLog" autofocus type="textarea" rows="4" resize="none" placeholder="请输入记录" />
          <div v-else class="workLogContent"><div>{{ item.workLog }}</div></div>
        </div>
      </el-col>
      <el-col :span="5" class="log-date-item">
        <div class="flex-center">
          <el-select v-if="item.showInput" v-model="taskLogStatus" placeholder="请选择">
            <el-option v-for="items in jobStateOption" :key="items.id" :value="items.id" :label="items.key" />
          </el-select>
          <div v-else>{{ setTaskStatus(item.workProgress) }}</div>
        </div>
      </el-col>
    </el-row>
    <el-button :loading="loading" type="primary" class="mt-20" @click="saveWorkLog">保存</el-button>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  props: {
    info: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      text: '',
      plan: '',
      selectOptoin: [{ id: 1, label: '111' }],
      workLog: [],
      jobStateOption: [],
      taskLogStatus: 1,
      loginUser: {},
      loading: false
    }
  },
  computed: {
    id() {
      return this.$route.query.id
    },
    setTaskStatus() {
      return function(workProgress) {
        const idx = this.jobStateOption.findIndex(item => item.id === workProgress)
        return idx === -1 ? '' : this.jobStateOption[idx].key
      }
    }
  },
  mounted() {
    this.initWorkLog()
    this.loginUser = this.localStorageOperation('get', 'userInfo')
    this.jobStateOption = this.$defineData.opmWorkLogStatus()
  },
  methods: {
    async initWorkLog() {
      if (this.info) {
        const getWorkLoData = await this.findOpsOrderWorkLog()
        const s = this.info.matter.createTime.split(' ')[0]
        const e = this.$tool.dateOperator(this.info.matter.createTime.split(' ')[0], 5, '+')
        const workLog = []
        const dateList = this.$tool.getdiffdate(s, e)
        const ymd = this.$tool.dateFormat('YYYY-mm-dd', new Date())
        dateList.forEach(item => {
          const timeSplit = item.split('-')
          const idx = getWorkLoData.findIndex(items => items.workTime === item)
          workLog.push({
            id: this.$tool.guid(),
            workLog: idx === -1 ? '' : getWorkLoData[idx].workLog,
            workTime: item,
            orderId: this.taskId,
            m: timeSplit[0] + '-' + timeSplit[1],
            d: timeSplit[2],
            showInput: new Date(ymd).getTime() === new Date(item).getTime() && idx === -1 && this.info.matter.statue !== 7,
            workProgress: idx === -1 ? '' : getWorkLoData[idx].workProgress
          })
        })
        this.workLog = workLog
      }
    },
    // 查询工作日志
    async findOpsOrderWorkLog() {
      const { code, data } = await request({
        url: api.opm.findOpsOrderWorkLog,
        data: {
          limit: -1,
          orderType: 1,
          orderId: this.id
        }
      })
      if (code !== 1) return
      return data
    },
    // 提交工作认真
    async submitWorkLog(api, data) {
      this.loading = true
      const { code } = await request({
        url: api,
        data
      })
      this.loading = false
      if (code !== 1) return
      return code
    },
    // 点击保存工作日志
    async saveWorkLog() {
      this.loading = true
      const idx = this.workLog.findIndex(item => item.showInput === true)
      if (idx !== -1) {
        console.log({
          orderType: 1,
          orderId: this.id,
          userId: this.loginUser.userId,
          workLog: this.workLog[idx].workLog,
          workTime: this.workLog[idx].workTime,
          workProgress: this.taskLogStatus
        })
        const submitWorkLogRes = await this.submitWorkLog(api.opm.insertOpsOrderWorkLog, {
          orderType: 1,
          orderId: this.id,
          userId: this.loginUser.userId,
          workLog: this.workLog[idx].workLog,
          workTime: this.workLog[idx].workTime,
          workProgress: this.taskLogStatus
        })
        this.loading = false
        if (submitWorkLogRes === 1) await this.initWorkLog()
      } else {
        this.$message({
          type: 'info',
          message: '暂无需要提交的记录'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.log-header {
  height: 40px;
  background-color: #eeeeee;
  font-size: 14px;
  .el-col {
    height: 100%;
    > div {
      height: 100%;
    }
  }
}
.log-date {
  border: 1px solid #eee;
  height: 100px;
  .log-date-item {
    height: 100%;

     .textAreaWrapper{
        // overflow-x: auto;
        // margin: 0 10px;
        padding: 0 10px;
         width: 100%;
          height: 100%;
        // position: relative;
        // display: flex;
        // flex-wrap: wrap;
      .workLogContent{
        height: 100%;
        width: 100%;
        overflow: auto;
        // white-space: pre-line;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;

        // flex: 1;
        // display: flex;
        // display: block;
        //    overflow: auto;
            // white-space: pre-wrap;
      }
        // min-width: 100%;
        //  display: flex;
        //  justify-content: space-around;
        //  align-items: center;

    }
    > div {
      height: 100%;
    }

    .log-date-item-left {
      background-color: #f2f5fb;
      border: 1px solid #f2f5fb;
    }
  }
  .textContainer{
    // overflow: auto;

    display: flex;
    flex-wrap: wrap;
  }
}
</style>
