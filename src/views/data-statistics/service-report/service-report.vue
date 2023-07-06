<template>
  <!-- 服务报告.html  设备运行统计 -->
  <div class="app-container">
    <div class="filterWrapper mb-10">
      <el-select v-model="selectType" @change="selectTypeChange">
        <el-option label="按年查询" :value="0" />
        <el-option label="按月查询 " :value="1" />
      </el-select>
      <el-date-picker
        v-model="dateQuery[selectType === 0?'year' : 'month']"
        :type="selectType === 0 ? 'year' : 'month'"
        placeholder="选择"
        :value-format="selectType === 0 ? 'yyyy' : 'yyyy-MM'"
      />
    </div>
    <div class="contentBox flex">
      <el-card class="leftWrapper">
        <div slot="header" class="clearfix">
          <div class="header">设备管理</div>
        </div>
        <div class="contentWrapper">
          <!-- <div class="contentTop"> -->
          <!-- <div class="echartWrapper"> -->
          <div style="height:35%">
            <DeviceChart :date-query="dateQuery" />
          </div>
          <!-- </div> -->
          <div style="height:25%">
            <RunStatistics :date-query="dateQuery" />
          </div>
          <!-- </div> -->
          <div class="contentBottom" style="height:40%">
            <RankChart :date-query="dateQuery" />
            <PieChart :date-query="dateQuery" />
          </div>
        </div>
      </el-card>
      <el-card class="rightWrapper">
        <div slot="header" class="clearfix">
          <div class="header">运维服务</div>
        </div>
        <div class="contentWrapper">
          <div class="contentTop" style="height: 40%">
            <OpmEchart :date-query="dateQuery" />
          </div>
          <div class="contentBottom" style="height: 60%">
            <InspectionRecords :date-query="dateQuery" />
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
// import * as echarts from 'echarts'
// import { formatTime, dateFormat, hexToRgba } from '@/utils/screen-itms.js'
import DeviceChart from '../components/service-report/device-chart'
import RankChart from '../components/service-report/rank-chart'
import PieChart from '../components/service-report/pie-chart'
import OpmEchart from '../components/service-report/opm-echart'
import InspectionRecords from '../components/service-report/inspection-records'
import RunStatistics from '../components/service-report/run-statistics'
export default {
  name: 'ServiceReport',
  components: {
    DeviceChart,
    RankChart,
    PieChart,
    OpmEchart,
    InspectionRecords,
    RunStatistics
  },
  data() {
    return {
      statisticsData: [],
      selectType: 0,
      dateQuery: {},
      form: {
        page: 1,
        limit: 10,
        keyword: '',
        status: '',
        orderBy: 'hy_alarm_count', //  run_time ，hy_alarm_count
        orderByDesc: '2' // 1升序 2降序
      },
      pingStatue: [
        { value: 1, label: '在线', class: 'success' },
        { value: 2, label: '异常', class: 'danger' },
        { value: 0, label: '离线', class: 'info' }
      ],
      total: 0,
      operationData: {},
      statusOptions: [
        { id: 0, value: '离线' },
        { id: 1, value: '在线' }
      ]
    }
  },
  computed: {},
  created() {
    this.$set(this.dateQuery, 'year', '' + new Date().getFullYear())
  },
  methods: {
    selectTypeChange(e) {
      this.dateQuery = {
        [e === 0 ? 'year' : 'month']: e === 0
          ? this.$tool.dateFormat('YYYY', new Date())
          : this.$tool.dateFormat('YYYY-mm', new Date())
      }
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-loading-spinner .path{
  stroke: #0145ab !important;
}
.app-container {
  min-height: 100%;
  .contentBox {
    width: 100%;
    height: 95%;
    overflow: hidden;
    .leftWrapper {
      width: 50%;
      height: 100%;
      margin-right: 10px;
      .header {
        margin: 4px 0;
        font-size: 16px;
        // background-color: black;
      }
      .contentWrapper {
        height: 100%;
        .contentTop {
          .echartWrapper {
            width: 100%;
            height: 300px;
          }
        }

        .contentBottom {
          height: 100%;
          display: flex;
          &>div{
            flex: 1;
          }
        }
      }
    }

    .rightWrapper {
      width: 50%;
      margin-left: 10px;
      .contentWrapper {
        height: 100%;
      }
      .header {
        margin: 4px 0;
        font-size: 16px;
      }
    }
  }
}
::v-deep .el-card__body {
  height: calc(100% - 47px);
  padding: 10px;
}
</style>
