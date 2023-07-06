<template>
  <div
    v-if="isConfig || (!isConfig && !watchItemShow)"
    v-loading="!performanceStatus.cpuUsed && !performanceStatus.memoryUsed && !performanceStatus.diskUsed && !showEmpty"
    element-loading-spinner="el-icon-loading"
    class="performance chuck-box box-border margin-left-15 margin-right-15 margin-top-15"
  >
    <div class="head-bar head">
      <div class="title">运行性能</div>
      <div class="chunk-opts">
        <div class="chunk-opts-select">
          <el-switch
            v-if="isConfig"
            v-model="watchItemSwitch"
            @change="changeItemSwitch"
          />
        </div>
      </div>
    </div>
    <div class="charts">
      <template v-if="!showEmpty">
        <div>
          <div class="piex">
            <el-progress type="circle" :stroke-width="14" :percentage="performanceStatus.cpuUsed > 100 ? 100 : +performanceStatus.cpuUsed.toFixed(0)" :width="140" color="#00b285" />
          </div>
          <div class="used">
            <div class="item-title">CPU使用情况</div>
          </div>
        </div>
        <div>
          <div class="piex">
            <el-progress type="circle" :stroke-width="14" :percentage="performanceStatus.memoryUsed > 100 ? 100 : +performanceStatus.memoryUsed.toFixed(0)" :width="140" color="#00b285" />
          </div>
          <div class="used">
            <div class="item-title">内存使用情况</div>
          </div>
        </div>
        <div>
          <div class="piex">
            <el-progress type="circle" :stroke-width="14" :percentage="performanceStatus.diskUsed > 100 ? 100 : +performanceStatus.diskUsed.toFixed(0)" :width="140" color="#00b285" />
          </div>
          <div class="used">
            <div class="item-title">磁盘使用情况</div>
          </div>
        </div>
      </template>
      <el-empty v-else description="暂无数据" />
    </div>
  </div>
</template>

<script>

export default {
  name: 'MonitorSysPerformance',
  props: {
    performanceStatus: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      watchItemSwitch: true,
      watchItemKey: 'sysPerformance',
      watchItemShow: null,
      showEmpty: false
    }
  },
  computed: {
    isConfig() { return this.$route.query.isConfig },
    devTypeId() { return this.$route.query.devTypeId },
    id() { return this.$route.query.id },
    zbxHostId() { return this.$route.query.zbxHostId }
  },
  mounted() {
    this.$EventBus.$on('get-graph-show', (data) => {
      const idx = data.findIndex(item => item.name === this.watchItemKey)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.watchItemSwitch = Boolean(data[idx].isShow)
      }
    })
    const that = this
    setTimeout(() => {
      if (!this.performanceStatus.cpuUsed && !this.performanceStatus.memoryUsed && !this.performanceStatus.diskUsed) that.showEmpty = true
    }, 10000)
  },
  methods: {
    changeItemSwitch(val) {
      if (val === false) {
        this.$EventBus.$emit('change-item-switch', {
          name: this.watchItemKey,
          type: 1,
          showName: '运行性能',
          isShow: Number(val),
          devType: this.devTypeId,
          hostId: this.id,
          zhostId: this.zbxHostId,
          graphType: 1
        })
      } else {
        this.$EventBus.$emit('change-item-switch', {
          id: this.watchItemShow.id,
          type: 1,
          isShow: Number(val),
          name: this.watchItemKey
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/monitor-device.scss";
.used {
  margin: 20px 0;
  .item-title {
    font-size: 14px;
    font-weight: 400;
    color: #333333;
  }
}
</style>
