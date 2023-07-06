<template>
  <div class="used-statistics-container">
    <UsedStatisticsEchart
      v-if="echartElParams !== '' && echartType === 'line'"
      :echart-el="echartElParams"
      :echart-data="echartDataParams"
      :realtime="realtime"
      :show-new-data-tag="showNewDataTag"
      :custom-configuration="customConfiguration"
    />
    <UsedStatisticsDash
      v-if="echartElParams !== '' && echartType === 'dash'"
      :echart-el="echartElParams"
      :echart-data="echartDataParams"
    />
    <UsedStatisticsTable :table-data="tableDataParams" />
  </div>
</template>

<script>
import UsedStatisticsEchart from './used-statistics-echart'
import UsedStatisticsTable from './used-statistics-table'
import UsedStatisticsDash from './used-statistics-dash'

export default {
  name: 'UsedStatisticsContainer',
  components: {
    UsedStatisticsEchart,
    UsedStatisticsTable,
    UsedStatisticsDash
  },
  props: {
    showNewDataTag: {
      type: Boolean,
      default: false
    },
    realtime: {
      type: Boolean,
      default: true
    },
    echartEl: {
      type: String,
      default: ''
    },
    echartData: {
      type: Array,
      default() {
        return {
          options: []
        }
      }
    },
    tableData: {
      type: Array,
      default() {
        return []
      }
    },
    // 示例值：趋势图：line 仪表盘：dash
    echartType: {
      type: String,
      default: 'line'
    },
    customConfiguration: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      echartElParams: '',
      echartDataParams: [],
      tableDataParams: []
    }
  },
  watch: {
    echartData: {
      handler(newVal) {
        this.echartDataParams = newVal
      },
      deep: true
    },
    tableData: {
      handler(newVal) {
        this.tableDataParams = newVal
      },
      deep: true
    }
  },
  mounted() {
    if (this.echartEl) {
      this.echartElParams = this.echartEl
    }
    this.tableDataParams = this.tableData
  }
}
</script>

<style lang="scss" scoped>

</style>
