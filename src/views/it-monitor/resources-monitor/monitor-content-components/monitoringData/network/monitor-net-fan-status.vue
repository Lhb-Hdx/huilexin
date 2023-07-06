<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" ref="monitorVirtualMemory" class="chuck-box">
    <div
      v-loading="fanStatus.length < 1 && !showEmpty"
      element-loading-spinner="el-icon-loading"
      class="chuck-box-conten box-border margin-left-7-5 margin-right-7-5 margin-top-15"
    >
      <div class="head-bar head">
        <div class="title">风扇状态</div>
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
      <div class="device-list">
        <el-empty v-if="fanStatus.length === 0 || showEmpty" :image-size="100" description="暂无数据" />
        <template v-else>
          <div v-for="item of fanStatus" :key="item.itemid" class="device-item" @mousemove="mousemoveBoardCard($event, item)" @mouseleave="mouseleaveBoardCard()">
            <div class="device-item-header">
              <div class="item-header-icon">
                <div class="header-icon-tag" :class="item.valueStatus ? '' : 'error-tag'" />
                <i :class="item.valueStatus ? 'el-icon-success' : 'el-icon-warning'" :style="{ 'color': item.valueStatus ? '' : 'red !important' }" />
                <img src="image/it-monitor/ico_fs.png">
              </div>
              <div class="item-header-name overflow-text-a">{{ item.name }}</div>
            </div>
            <div
              v-if="showTip"
              class="tip-box"
              :style="{ top: tipY + 'px', left: tipX + 'px' }"
            >
              {{ tipText }}
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    fanStatus: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      loading: true,
      showTip: false,
      tipText: '',
      tipX: 0,
      tipY: 0,
      watchItemSwitch: true,
      watchItemKey: 'networkFan',
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
  watch: {
    fanStatus: {
      handler(newVal) {
        if (newVal) {
          this.loading = false
        }
      },
      deep: true
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('get-graph-show')
  },
  mounted() {
    this.hostId = this.$route.params.id
    this.sbId = this.$route.params.sbid
    this.$EventBus.$on('get-graph-show', (data) => {
      const idx = data.findIndex(item => item.name === this.watchItemKey)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.watchItemSwitch = Boolean(data[idx].isShow)
      }
    })
    const that = this
    setTimeout(() => {
      if (that.fanStatus.length < 1) that.showEmpty = true
    }, 10000)
  },
  methods: {
    mousemoveBoardCard(e, value) {
      this.tipX = e.x + 15
      this.tipY = e.y
      this.tipText = `${value.name}：${value.valueText}`
      this.showTip = true
    },
    mouseleaveBoardCard() {
      this.showTip = false
    },
    changeItemSwitch(val) {
      if (val === false) {
        this.$EventBus.$emit('change-item-switch', {
          name: this.watchItemKey,
          type: 1,
          showName: '风扇状态',
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
.device-item {
  width: 25% !important;
  padding: 30px 0 !important;
  cursor: pointer;
}
.tip-box {
  position: fixed;
  background: #fff;
  padding: 5px;
  color: #646464;
  border: 1px solid #ddd;
  z-index: 9;
}
</style>
