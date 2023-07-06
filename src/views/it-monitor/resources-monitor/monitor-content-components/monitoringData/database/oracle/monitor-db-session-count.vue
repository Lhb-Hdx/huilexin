<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" class="overview box-border margin-left-15 margin-right-15 margin-top-15">
    <div class="head-bar head">
      <div class="title">会话TOP10</div>
      <div class="chunk-opts">
        <div v-if="isConfig" class="chunk-opts-select">
          <el-switch
            v-model="watchItemSwitch"
            @change="changeItemSwitch"
          />
        </div>
      </div>
    </div>
    <div ref="systemInfoRef">
      <el-row>
        <el-col v-for="(item,index) in sessionList" :key="index" :span="8">
          <div class="system-info">
            <div class="info-item flex align-item-center">
              <div class="info-label">{{ item }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>

export default {
  name: 'MonitorDbSessionCount',
  components: {
  },
  props: {
    sessionCount: {
      type: String,
      default() {
        return ''
      }
    }
  },
  data() {
    return {
      watchItemSwitch: true,
      watchItemShow: null,
      sessionList: []
    }
  },
  computed: {
    isConfig() { return this.$route.query.isConfig },
    devTypeId() { return this.$route.query.devTypeId },
    id() { return this.$route.query.id },
    zbxHostId() { return this.$route.query.zbxHostId }
  },
  watch: {
    sessionCount: {
      handler(newVal) {
        this.setSession(newVal)
      },
      deep: true
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('get-graph-show')
  },
  mounted() {
    this.$EventBus.$on('get-graph-show', (data) => {
      const idx = data.findIndex(item => item.name === this.watchItemKey)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.watchItemSwitch = Boolean(data[idx].isShow)
      }
    })
  },
  methods: {
    setSession(val) {
      console.log(val)
      let num = val.substr(1)
      let data = num.substring(0, num.length - 1)
      let a = data.split(')\n(')
      this.sessionList = a
    },
    changeItemSwitch(val) {
      if (val === false) {
        this.$EventBus.$emit('change-item-switch', {
          name: this.watchItemKey,
          type: 1,
          showName: '系统概要',
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
.system-info {
  position: relative;
  .info-item {
    //border-right: 1px solid #dddddd;
    text-align: left;
    font-weight: 400;
    line-height: 1.5;
    .info-label {
      padding: 10px;
      color: #606266;
      // width: 150px;
    }
    .info-value {
      color: #0CB68B;
    }
  }
}
</style>

