<template>
  <div v-if="isConfig || (!isConfig && !watchItemShow)" ref="chuckBox" class="chuck-box">
    <div
      v-loading="echartData[0].data.length < 2 && !showEmpty"
      element-loading-spinner="el-icon-loading"
      class="chuck-box-one box-border margin-left-7-5 margin-right-7-5"
    >
      <div class="head head-bar">
        <div class="title">内存</div>
        <div class="chunk-opts">
          <div v-if="isConfig" class="chunk-opts-select">
            <el-switch
              v-model="watchItemSwitch"
              @change="changeItemSwitch"
            />
          </div>
          <div class="chunk-opts-select margin-left-7-5">
            <img v-permission="['GetDataMonitorDetail']" src="image/common/ico_char.png" alt="" @click="openUsedDetailDialog">
          </div>
        </div>
      </div>
      <UsedStatisticsContainer v-if="!showEmpty" echart-el="memoryChart" :custom-configuration="customConfiguration" :echart-data="echartData" :table-data="tableData" />
      <el-empty v-else description="暂无数据" />
    </div>
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
import { dateFormat, sizeUnitsTransform } from '@/utils/utils'
import UsedStatisticsContainer from '../component/used-statistics-container'
import UsedDetailDialog from '../component/used-detail-dialog'
import MonitorDataMixin from '@/views/it-monitor/resources-monitor/mixins/monitor-data-mixin'

export default {
  name: 'MonitorVirtualMemory',
  components: {
    UsedStatisticsContainer,
    UsedDetailDialog
  },
  mixins: [MonitorDataMixin],
  props: {
    propAgent: {
      type: Number,
      default() {
        return 0
      }
    },
    propZbxHostId: {
      type: Number,
      default() {
        return 0
      }
    },
    upDataDirectiveId: {
      type: String,
      default() {
        return ''
      }
    },
    memoryData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      echartData: [
        {
          color: '#87DEAF',
          name: '已使用',
          data: [],
          units: [],
          time: [],
          yAxisMax: null,
          toFixed: 2,
          isConversion: true,
          conversionUnitType: 'data',
          isAssignUnit: true, // 指定转换单位
          assignUnit: 'GB'
        }
      ],
      tableData: [
        {
          col: [
            { label: '总大小', value: 0, unit: '' }
          ]
        }
      ],
      showUsedDetailDialog: false,
      detailParams: [{
        itemid: '',
        valueType: '',
        name: '已使用',
        color: '#87DEAF',
        unit: '',
        echartType: 'value',
        isConversion: true,
        conversionUnitType: 'data',
        originalUnit: '',
        toFixed: 2,
        data: [],
        units: [],
        time: [],
        yAxisMax: null,
        isAssignUnit: true, // 指定转换单位
        assignUnit: 'GB'
      }],
      tableParams: [],
      itemGuid: null,
      watchItemSwitch: true,
      watchItemKey: 'virtualMemory',
      watchItemShow: null,
      showEmpty: false,
      initGetMonitorItemHistoryData: false,
      customConfiguration: {
        yAxisLabelUnit: 'GB'
      }
    }
  },
  computed: {
    agent() {
      return this.$route.query.agent
    },
    zbxHostId() {
      return this.$route.query.zbxHostId
    },
    itMonitorRequireAgreement() {
      return process.env.VUE_APP_HY_IT_MONITOR_REQUIRE_AGREEMENT
    },
    isConfig() { return this.$route.query.isConfig },
    devTypeId() { return this.$route.query.devTypeId },
    id() { return this.$route.query.id }
  },
  watch: {
    upDataDirectiveId: {
      handler() {
        this.watchAgentGetHostData()
      },
      deep: true
    },
    memoryData: {
      handler() {
        this.watchAgentGetHostData()
      },
      deep: true
    }
  },
  mounted() {
    this.watchAgentGetHostData()
    this.$EventBus.$on('get-graph-show', (data) => {
      const idx = data.findIndex(item => item.name === this.watchItemKey)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.watchItemSwitch = Boolean(data[idx].isShow)
      }
    })
    const that = this
    setTimeout(() => {
      if (this.echartData[0].data.length === 0) that.showEmpty = true
    }, 10000)
  },
  methods: {
    async watchAgentGetHostData() {
      const getItemVMMemoryInfoData = this.memoryData
      if (getItemVMMemoryInfoData.method === 'getItemVMMemoryInfoData') {
        const currentAllMonitorItemIds = []
        const currentAllMonitorItemValueTypes = []
        const virtualInfoData = getItemVMMemoryInfoData.data
        const getUsageItem = virtualInfoData.findIndex(item => item.itemName.indexOf('Guest memory usage') !== -1)
        if (getUsageItem !== -1) {
          const conversionDataResult = sizeUnitsTransform(virtualInfoData[getUsageItem].units, 'GB', Number(virtualInfoData[getUsageItem].itemValue))
          if (this.echartData[0].data.length === 2) {
            this.$set(this.echartData[0].data, 0, conversionDataResult.size.toFixed(2))
          }
          this.$set(this.echartData[0].data, this.echartData[0].data.length, conversionDataResult.size.toFixed(2))
          this.$set(this.echartData[0].units, this.echartData[0].units.length, 'GB')
          this.$set(this.echartData[0], 'itemId', virtualInfoData[getUsageItem].itemid)
          this.$set(this.detailParams[0], 'itemid', virtualInfoData[getUsageItem].itemid)
          this.$set(this.detailParams[0], 'valueType', virtualInfoData[getUsageItem].valueType)
          this.$set(this.detailParams[0], 'unit', 'GB')
          this.$set(this.detailParams[0], 'assignUnit', 'GB')
          this.$set(this.detailParams[0], 'originalUnit', virtualInfoData[getUsageItem].units)
          this.$set(this.detailParams[0], 'isAssignUnit', true)
          if (!this.initGetMonitorItemHistoryData) {
            currentAllMonitorItemIds.push(virtualInfoData[getUsageItem].itemid)
            currentAllMonitorItemValueTypes.push(virtualInfoData[getUsageItem].valueType)
          }
          const clock = new Date()
          this.$set(this.echartData[0].time, this.echartData[0].time.length, `${dateFormat('YYYY-mm-dd HH:MM:SS', clock)}`)
        }
        const getSizeItem = virtualInfoData.findIndex(item => item.itemName.indexOf('Memory size') !== -1)
        if (getSizeItem !== -1) {
          const conversionDataResult = sizeUnitsTransform(virtualInfoData[getSizeItem].units, 'GB', Number(virtualInfoData[getSizeItem].itemValue))
          this.$set(this.echartData[0], 'yAxisMax', conversionDataResult.size.toFixed(2))
          this.$set(this.detailParams[0], 'yAxisMax', conversionDataResult.size.toFixed(2))
          this.$set(this.tableData[0].col[0], 'value', conversionDataResult.size.toFixed(2))
          this.$set(this.tableData[0].col[0], 'unit', 'GB')
        }
        if (!this.initGetMonitorItemHistoryData) {
          this.initGetMonitorItemHistoryData = true
          this.getMonitorItemHistoryData(this.agent, currentAllMonitorItemIds.toString(), currentAllMonitorItemValueTypes.toString())
        }
      }
    },
    closeUsedDetailDialog() {
      this.showUsedDetailDialog = false
    },
    openUsedDetailDialog() {
      this.showUsedDetailDialog = true
    },
    changeItemSwitch(val) {
      if (val === false) {
        this.$EventBus.$emit('change-item-switch', {
          name: this.watchItemKey,
          type: 1,
          showName: '内存',
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
</style>

