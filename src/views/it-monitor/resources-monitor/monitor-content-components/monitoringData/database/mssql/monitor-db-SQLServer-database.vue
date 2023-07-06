<template>
  <div
    v-if="isConfig || (!isConfig && !watchItemShow)"
    v-loading="!dataList && !showEmpty"
    class="overview box-border margin-left-15 margin-right-15 margin-top-15"
    element-loading-spinner="el-icon-loading"
  >
    <div class="head-bar head">
      <div class="title">数据库数据文件</div>
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
        <el-col v-for="(item,index) in database" :key="index" :span="8">
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
                    <span>{{ item.name }} 数据文件</span>
                  </div>
                  <div class="progress no-progress-bar-innerText" />
                  <div class="word-size">
                    <span>大小：{{ conversionUnit(item.itemValue) }}</span>
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
  name: 'SQLServerDatabase',
  props: {
    database: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      watchItemSwitch: true,
      watchItemKey: 'SQLServerDatabase',
      watchItemShow: null,
      dataList: {},
      showEmpty: false
    }
  },
  computed: {
    isConfig() { return this.$route.query.isConfig },
    devTypeId() { return this.$route.query.devTypeId },
    id() { return this.$route.query.id },
    zbxHostId() { return this.$route.query.zbxHostId },
    conversionUnit() {
      return function(val) {
        const data = this.$tool.sizeUnitsConversion(val)
        return data.size > 0 ? data.size + data.units : 0
      }
    }
  },
  watch: {
    database: {
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
          showName: '数据库',
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
