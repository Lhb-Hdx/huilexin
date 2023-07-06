<!--
  设备变更轮播，电信定制需求
-->

<template>
  <div v-if="isShow || (!isShow && !watchItemShow)" v-loading="loading" class="dashboard-box-item width-100">
    <div class="box-item-content">
      <div class="item-content-header">
        <div class="title">设备变更</div>
        <div class="line"><div class="blo" /></div>
        <div class="item-content">
          <el-switch
            v-if="isShow"
            v-model="modelDefineSwitch"
            @change="changemodelDefine"
          />
        </div>
      </div>
      <div class="item-content-body">
        <el-table
          :data="deviceChangeData"
          fit
          highlight-current-row
          style="width: 100%;"
          border
        >
          <el-table-column label="申请单位" prop="company" show-overflow-tooltip />
          <el-table-column label="变更设备IP" prop="deviceIp" show-overflow-tooltip />
          <el-table-column label="影响设备IP" prop="influenceDeviceIp" show-overflow-tooltip />
          <el-table-column label="开始时间" prop="changeStartTime" show-overflow-tooltip />
          <el-table-column label="结束时间" prop="changeEndTime" show-overflow-tooltip />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeviceChangeShow',
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      watchItemShow: null,
      loading: false,
      modelDefineSwitch: true,
      modelDefine: 'deviceChangeShow',
      deviceChangeData: [],
      deviceChangeDataTotal: 0,
      getDeviceChangeInterval: null,
      currentSelectPage: 1
    }
  },
  mounted() {
    this.$EventBus.$on('get-meter-show', (data) => {
      const idx = data.findIndex(item => item.modelDefine === this.modelDefine)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.modelDefineSwitch = Boolean(data[idx].modelShow)
      }
    })
    this.findEsightChange()
    this.getDeviceChangeInterval = setInterval(() => {
      const pageCount = Math.ceil(this.deviceChangeDataTotal / 10)
      if (pageCount === 0) {
        this.currentSelectPage = 1
      } else {
        if (this.currentSelectPage >= pageCount) {
          this.currentSelectPage = 1
        } else {
          ++this.currentSelectPage
        }
      }
      this.findEsightChange()
    }, 60000)
  },
  beforeDestroy() {
    this.batchOffEventBus('get-meter-show\'')
    clearInterval(this.getDeviceChangeInterval)
    this.getDeviceChangeInterval = null
  },
  methods: {
    // 更改显示配置
    changemodelDefine(val) {
      if (val === false) {
        // 新增
        this.$EventBus.$emit('change-meter-switch', {
          modelDefine: this.modelDefine,
          type: 1,
          modelShow: Number(val),
          dashboardType: 1
        })
      } else {
        // 删除
        this.$EventBus.$emit('change-meter-switch', {
          id: this.watchItemShow.id,
          modelDefine: this.modelDefine,
          type: 1,
          modelShow: Number(val),
          dashboardType: 1
        })
      }
    },
    // 查询设备变更
    findEsightChange() {
      const sTime = `${this.$tool.getFirstDay().text} 00:00:00`
      const eTime = `${this.$tool.getLastDay().text} 23:59:59`
      this.$request({
        url: this.api.itMonitor.findEsightChange,
        data: { page: this.currentSelectPage, limit: 10, sTime, eTime, cleared: 1 }
      }).then(res => {
        if (res.code === 1) {
          this.deviceChangeDataTotal = +res.count
          this.deviceChangeData = res.data
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.item-content {
  float: right;
  margin-top: -35px;
}
.item-content-body {
  padding-top: 20px;
}
</style>
