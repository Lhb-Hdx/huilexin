<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" ref="monitorVirtualMemory" class="chuck-box margin-left-15 margin-right-15 margin-top-15">
    <div
      v-loading="boardCardStatus.length < 1 && !showEmpty"
      element-loading-spinner="el-icon-loading"
      class="chuck-box-content box-border"
    >
      <div class="head-bar head">
        <div class="title">板卡状态</div>
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
        <el-empty v-if="boardCardStatus.length === 0 || showEmpty" :image-size="100" description="暂无数据" />
        <template v-else>
          <div v-for="item in boardCardStatus" :key="item.itemid" :ref="'deviceItem' + item.itemid" class="device-item" @click="selectBoardCard(item)" @mousemove="mousemoveBoardCard($event, item)" @mouseleave="mouseleaveBoardCard()">
            <div class="device-item-header">
              <div class="item-header-icon">
                <div class="header-icon-tag" :class="item.valueStatus ? '' : 'error-tag'" />
                <i :class="item.valueStatus ? 'el-icon-success' : 'el-icon-warning'" :style="{ 'color': item.valueStatus ? '' : 'red !important' }" />
                <img src="image/it-monitor/ico_bk.png" alt="">
              </div>
              <div class="item-header-name">{{ item.name }}</div>
            </div>
            <div class="device-item-info">
              <div class="item-info-data">
                <div class="info-data-title">温度：</div>
                <div class="info-data-value">{{ item.TemperatureSensor }}℃</div>
              </div>
              <div class="item-info-data">
                <div class="info-data-title">内存使用率：</div>
                <div class="info-data-value">{{ item.MemoryUsage }}%</div>
              </div>
              <div class="item-info-data">
                <div class="info-data-title">CPU使用率：</div>
                <div class="info-data-value">{{ item.CPUUsage }}%</div>
              </div>
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
    <UsedDetailDialog
      v-if="showUsedDetailDialog"
      :echart-params="detailParams"
      :table-params="tableParams"
      :is-tab-echart="true"
      :show-dialog="showUsedDetailDialog"
      @closeUsedDetailDialog="closeUsedDetailDialog"
    />
  </div>
</template>

<script>
import UsedDetailDialog from '../component/used-detail-dialog'

export default {
  components: {
    UsedDetailDialog
  },
  props: {
    boardCardStatus: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      showUsedDetailDialog: false,
      detailParams: [],
      tableParams: [],
      loading: true,
      showTip: false,
      tipText: '',
      tipX: 0,
      tipY: 0,
      watchItemSwitch: true,
      watchItemKey: 'networkBoard',
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
    boardCardStatus: {
      handler(newVal, oldVal) {
        console.log(oldVal)
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
    this.$EventBus.$on('get-graph-show', (data) => {
      const idx = data.findIndex(item => item.name === this.watchItemKey)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.watchItemSwitch = Boolean(data[idx].isShow)
      }
    })
    const that = this
    setTimeout(() => {
      if (that.boardCardStatus.length < 1) that.showEmpty = true
    }, 10000)
  },
  methods: {
    selectBoardCard(row) {
      this.showUsedDetailDialog = true
      this.detailParams = [
        {
          unit: '℃',
          itemid: row.TemperatureSensorItemId,
          valueType: row.TemperatureSensorValueType,
          name: '温度',
          color: '#87DEAF',
          echartType: 'value',
          data: [],
          units: [],
          time: []
        },
        {
          unit: '%',
          itemid: row.MemoryUsageItemId,
          valueType: row.MemoryUsageValueType,
          name: '内存使用率',
          color: '#87DEAF',
          echartType: 'value',
          data: [],
          units: [],
          time: []
        },
        {
          unit: '%',
          itemid: row.CPUUsageItemId,
          valueType: row.CPUValueType,
          name: 'CPU使用率',
          color: '#87DEAF',
          echartType: 'value',
          data: [],
          units: [],
          time: []
        }
      ]
      this.tableParams = [
        {
          label: ['最高温度', '平均温度'],
          value: 0,
          unit: '℃',
          itemid: row.TemperatureSensorItemId,
          valueType: row.TemperatureSensorValueType,
          type: ['max', 'min']
        },
        {
          label: ['最高内存', '平均内存'],
          value: 0,
          unit: '%',
          itemid: row.MemoryUsageItemId,
          valueType: row.MemoryUsageValueType,
          type: ['max', 'min']
        },
        {
          label: ['最高CPU', '平均CPU'],
          value: 0,
          unit: '%',
          itemid: row.CPUUsageItemId,
          valueType: row.CPUValueType,
          type: ['max', 'min']
        }
      ]
    },
    // 关闭图表
    closeUsedDetailDialog() {
      this.showUsedDetailDialog = false
    },
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
          showName: '板卡状态',
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
  cursor: pointer;
}
.item-header-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
