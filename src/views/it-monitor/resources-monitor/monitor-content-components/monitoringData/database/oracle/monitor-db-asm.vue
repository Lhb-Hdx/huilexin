<template>
  <div
    v-if="isConfig || (!isConfig && !watchItemShow)"
    v-loading="!dataList && !showEmpty"
    class="overview box-border margin-left-15 margin-right-15 margin-top-15"
    element-loading-spinner="el-icon-loading"
  >
    <div class="head-bar head">
      <div class="title">ASM卷空间</div>
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
      <el-row v-if="!showEmpty">
        <el-col :span="8">
          <div class="system-info">
            <div class="info-item flex align-item-center">
              <div class="info-header">
                <div class="info-box">
                  <div class="info-img">
                    <div class="img-box" />
                  </div>
                </div>
                <div class="word-data">
                  <div class="word-title">
                    <span>DATA</span>
                    <span>{{ dataList.usePercentageSize }}{{ dataList.usePercentageUnits }}</span>
                  </div>
                  <div class="progress no-progress-bar-innerText">
                    <el-progress v-if="Number(dataList.usePercentageSize)" :text-inside="true" :stroke-width="10" :percentage="Number(dataList.usePercentageSize)" />
                  </div>
                  <div class="word-size">
                    <span>总大小：{{ dataList.totalSize }}{{ dataList.totalUnits }}</span>
                    <span>已用：{{ dataList.useSize }}{{ dataList.useUnits }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="system-info">
            <div class="info-item flex align-item-center">
              <div class="info-header">
                <div class="info-box">
                  <div class="info-img">
                    <div class="img-box" />
                  </div>
                </div>
                <div class="word-data">
                  <div class="word-title">
                    <span>OCR</span>
                    <span>{{ dataList.ocrUsePercentageSize }}{{ dataList.ocrUsePercentageUnits }}</span>
                  </div>
                  <div class="progress  no-progress-bar-innerText">
                    <el-progress v-if="Number(dataList.ocrUsePercentageSize)" :text-inside="true" :stroke-width="10" :percentage="Number(dataList.ocrUsePercentageSize)" />
                  </div>
                  <div class="word-size">
                    <span>总大小：{{ dataList.ocrTotalSize }}{{ dataList.ocrTotalUnits }}</span>
                    <span>已用：{{ dataList.ocrUseSize }}{{ dataList.ocrUseUnits }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>

      </el-row>
      <el-empty v-else description="暂无数据" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'MonitorDbAsm',
  props: {
    volumeSpace: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      watchItemSwitch: true,
      watchItemKey: 'dbAsm',
      watchItemShow: null,
      dataList: {},
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
    volumeSpace: {
      handler(newVal) {
        console.log(newVal)
        if (newVal) {
          this.dataList = newVal
        }
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
    const that = this
    setTimeout(() => {
      if (!that.dataList) that.showEmpty = true
    }, 10000)
  },
  methods: {
    changeItemSwitch(val) {
      if (val === false) {
        this.$EventBus.$emit('change-item-switch', {
          name: this.watchItemKey,
          type: 1,
          showName: '等待时间',
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
    text-align: left;
    font-weight: 400;
    line-height: 1.5;
  }
}

.info-header {
  width: 100%;
  height: 120px;
  display: flex;
  .info-box {
    width: 30%;
    height: 100%;
    display: flex;
    margin: 0 10px;
    justify-content: center;
    align-items: center;
      .info-img {
        position: relative;
        width: 80px;
        height: 80px;
        background-color: rgb(231,248,244);
        border-radius: 80px;
        .img-box {
          width: 40px;
          height: 40px;
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          right: 0;
          margin: auto;
        }
    }
  }
  .progress {
    margin: 10px 0;
  }
  .word-data {
    width: 70%;
    height: 100%;
    display: flex;
    margin: 0 10px;
    flex-direction: column;
    justify-content: center;
    .word-title {
      display: flex;
      justify-content: space-between;
    }
    .word-size {
       display: flex;
      justify-content: space-between;
    }
  }

}
</style>
