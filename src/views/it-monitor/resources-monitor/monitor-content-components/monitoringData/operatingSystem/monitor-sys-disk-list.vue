<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" class="chuck-box file-system margin-left-15 margin-right-15 margin-top-15">
    <template v-if="!showEmpty">
      <div
        v-loading="diskDiskList.length === 0 && !showEmpty"
        element-loading-spinner="el-icon-loading"
        class="box-border margin-top-15"
      >
        <div class="head head-bar">
          <div class="title">文件系统</div>
          <div class="chunk-opts">
            <div v-if="isConfig" class="chunk-opts-select">
              <el-switch
                v-model="watchItemSwitch"
                :disabled="disabledSwitch"
                @change="changeItemSwitch"
              />
            </div>
          </div>
        </div>
        <div class="disk-list" :style="{ padding: diskDiskList.length === 0 ? '20px 0' : '' }">
          <div v-for="(item, index) in diskDiskList" :key="index" class="disk-list-content pointer" @click="openUsedDetailDialog(item.usedItemId)">
            <div class="disk-icon">
              <img src="image/it-monitor/ico_yp.png" alt="">
            </div>
            <div class="disk-info">
              <div class="disk-info-header">
                <div class="disk-name">{{ item.fsName }}</div>
                <div class="disk-percentage">{{ item.usedPercentage }}{{ item.usedPercentageUnit }}</div>
              </div>
              <el-progress v-if="item && item.usedPercentage && item.usedPercentage > 0" :text-inside="true" :stroke-width="10" :percentage="item.usedPercentage" />

              <div class="disk-info-footer">
                {{ item.remaining }}{{ item.remainingUnit }}可用，共{{ item.total }}{{ item.totalUnit }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <el-empty v-else description="暂无数据" />
    <UsedDetailDialog
      v-if="showUsedDetailDialog"
      :echart-params="detailParams"
      :table-params="tableParams"
      :show-dialog="showUsedDetailDialog"
      :custom-configuration="customConfiguration"
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
    diskDiskList: {
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
      watchItemSwitch: true,
      watchItemKey: 'sysDisk',
      watchItemShow: null,
      disabledSwitch: false,
      showEmpty: false,
      customConfiguration: {
        yAxisLabelUnit: 'GB'
      }
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
      if (that.diskDiskList.length === 0) that.showEmpty = true
    }, 10000)
  },
  methods: {
    openUsedDetailDialog(id) {
      const idx = this.diskDiskList.findIndex(item => +item.usedItemId === +id)
      if (idx !== -1) {
        console.log('this.diskDiskList[idx].usedItemId', this.diskDiskList[idx].usedItemId, idx)
        this.showUsedDetailDialog = true
        this.detailParams = [
          {
            itemid: this.diskDiskList[idx].usedItemId,
            valueType: this.diskDiskList[idx].usedValueType,
            name: '当前空间使用',
            color: '#87DEAF',
            unit: this.diskDiskList[idx].usedPercentageUnit,
            echartType: 'value',
            isConversion: true,
            conversionUnitType: 'data',
            isAssignUnit: true,
            assignUnit: 'GB',
            data: [],
            units: [],
            time: [],
            toFixed: 2
          }
        ]
        this.tableParams = [
          {
            label: ['最高使用', '平均使用', '最低使用'],
            value: 0,
            unit: this.diskDiskList[idx].usedPercentageUnit,
            itemid: this.diskDiskList[idx].usedItemId,
            valueType: this.diskDiskList[idx].usedValueType,
            isConversion: true,
            conversionUnitType: 'data',
            type: ['max', 'avg', 'min'],
            isAssignUnit: true,
            assignUnit: 'GB',
            fixed: 2
          }
        ]
      }
    },
    closeUsedDetailDialog() {
      this.showUsedDetailDialog = false
    },
    changeItemSwitch(val) {
      // this.disabledSwitch = true
      if (val === false) {
        this.$EventBus.$emit('change-item-switch', {
          name: this.watchItemKey,
          type: 1,
          showName: '文件系统',
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
.disk-list {
  display: flex;
  flex-wrap: wrap;
  .disk-list-content, .disk-info-header {
    display: flex;
  }
  .disk-info-footer, .disk-percentage {
    color: #979797;
    // font-size: .1rem;
  }
  .disk-list-content {
    padding: 20px 40px;
    align-items: center;
    width: 33%;
    display: flex;
    justify-content: flex-start;
    .disk-icon {
      width: 30%;
      text-align: center;
      img {
        width: 50px;
      }
    }
    .disk-info {
      width: 70%;
      .disk-info-header {
        align-items: flex-end;
        justify-content: space-between;
        padding-bottom: 5px;
        .disk-name {
          font-size: 16px;
        }
        .disk-percentage {}
      }
      .disk-info-footer {
        padding-top: 5px;
      }
    }
  }
}
</style>
