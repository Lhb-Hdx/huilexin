<template>
  <div class="dashboard-box">
    <div class="dashboard-box-left">
      <!-- 系统概况 -->
      <system-situation :is-show="isShow" />
      <div class="flexBox">
        <div class="dashboard-box-group-item width-50">
          <!-- 资产价值TOP -->
          <assets-cost-top :is-show="isShow" />
        </div>
        <div class="dashboard-box-group-item width-50">
          <!-- 出入库统计 -->
          <OutPutStatistics :is-show="isShow" />
          <!-- 设备管理统计 -->
          <device-manage-statistics :is-show="isShow" />
        </div>
      </div>
    </div>
    <div class="dashboard-box-right">
      <!-- 资产统计 -->
      <assets-statistics :is-show="isShow" />
      <!-- 状态统计 -->
      <status-statistics :is-show="isShow" />
      <!-- 分布统计 -->
      <issue-statistics :is-show="isShow" />
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import AssetsCostTop from './component/assets/assets-cost-top/assets-cost-top'
import AssetsStatistics from './component/assets/assets-statistics/assets-statistics'
import IssueStatistics from './component/assets/issue-statistics/issue-statistics'
import OutPutStatistics from './component/assets/out-put-statistics/out-put-statistics'
import StatusStatistics from './component/assets/status-statistics/status-statistics'
import SystemSituation from './component/assets/system-situation/system-situation'
import DeviceManageStatistics from './component/assets/device-manage-statistics/device-manage-statistics'

export default {
  name: 'AssetsDashboard',
  components: {
    AssetsCostTop,
    AssetsStatistics,
    IssueStatistics,
    OutPutStatistics,
    StatusStatistics,
    SystemSituation,
    DeviceManageStatistics
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
    this.findDashboardShow()
  },
  methods: {
    // 查询显示配置
    findDashboardShow() {
      request({
        url: api.opm.findDashboardShow, data: { page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          console.log(res)
          this.$EventBus.$emit('get-meter-show', res.data)
        }
      })
    }
  }
}
</script>
