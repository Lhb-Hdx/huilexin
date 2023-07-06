/**
 * @description monitor-service-mixins.js
 * @author linhaojia
 * @date 2022/5/30 15:44:42
 */
// 华三组件
import MonitorServiceCpuByH3C from '../h3c/monitor-service-cpu'
import MonitorServiceDiskByH3C from '../h3c/monitor-service-disk'
import MonitorServiceFanByH3C from '../h3c/monitor-service-fan'
import MonitorServiceMemoryByH3C from '../h3c/monitor-service-memory'
import MonitorServiceNetWorkCardByH3C from '../h3c/monitor-service-network-card'
import MonitorServiceOutlineByH3C from '../h3c/monitor-service-outline'
import MonitorServicePowerByH3C from '../h3c/monitor-service-power'
import MonitorServiceTemperatureByH3C from '../h3c/monitor-service-temperature'

// 戴尔组件
import MonitorServiceCpuByDell from '../dell/monitor-service-cpu'
import MonitorServiceDiskByDell from '../dell/monitor-service-disk'
import MonitorServiceFanByDell from '../dell/monitor-service-fan'
import MonitorServiceMemoryByDell from '../dell/monitor-service-memory'
import MonitorServiceNetWorkCardByDell from '../dell/monitor-service-network-card'
import MonitorServiceInfoByDell from '../dell/monitor-service-info'
import MonitorServicePowerByDell from '../dell/monitor-service-power'
import MonitorServiceTemperatureByDell from '../dell/monitor-service-temperature'

import request from '@/utils/request'
import api from '@/api/api'

export default {
  components: {
    MonitorServiceCpuByH3C,
    MonitorServiceDiskByH3C,
    MonitorServiceFanByH3C,
    MonitorServiceMemoryByH3C,
    MonitorServiceNetWorkCardByH3C,
    MonitorServiceOutlineByH3C,
    MonitorServicePowerByH3C,
    MonitorServiceTemperatureByH3C,
    MonitorServiceCpuByDell,
    MonitorServiceDiskByDell,
    MonitorServiceFanByDell,
    MonitorServiceMemoryByDell,
    MonitorServiceNetWorkCardByDell,
    MonitorServiceInfoByDell,
    MonitorServicePowerByDell,
    MonitorServiceTemperatureByDell
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
    id() { return this.$route.query.id },
    subType() { return this.$route.query.subType || this.propSubTypeId }
  },
  data() {
    return {
      upStatus: 0, // 设备的运行状态
      upTime: '', // 设备的运行时间
      deviceSN: '', // 设备SN
      watchItemSwitch: true,
      watchItemKey: 'serviceData',
      watchItemShow: null,
      diyItem: []
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('get-graph-show,delete-item-switch,add-item-switch')
  },
  mounted() {
    this.findHyitHostGraphShow()
    this.$EventBus.$on('get-graph-show', (data) => {
      const idx = data.findIndex(item => item.name === this.watchItemKey)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.watchItemSwitch = Boolean(data[idx].isShow)
      }
    })
    this.$EventBus.$on('delete-item-switch', () => {
      this.findHyitHostGraphShow()
    })
    this.$EventBus.$on('add-item-switch', () => {
      this.findHyitHostGraphShow()
    })
    this.getHyitHost()
  },
  destroyed() {
    // 组件卸载关闭定时器轮巡
    clearInterval(this.setHyitShowSurveyInterval)
  },
  methods: {
    handlerModule(key) {
      this.moduleKey = key
    },
    // 查询显示配置
    findHyitHostGraphShow() {
      request({
        url: api.itMonitor.findHyitHostGraphShow, data: { hostId: this.id, zhostId: this.zbxHostId, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.$EventBus.$emit('get-graph-show', res.data)
          const diyItem = []
          res.data.forEach(item => {
            if (Number(item.type) === 2) {
              diyItem.push(item)
            }
          })
          this.diyItem = diyItem
        }
      })
    },
    // 显示开关
    changeItemSwitch(val) {
      if (val === false) {
        this.$EventBus.$emit('change-item-switch', {
          name: this.watchItemKey,
          type: 1,
          showName: '监控数据',
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
    },
    // 查看主机
    getHyitHost() {
      request({
        url: api.itMonitor.getHyitHost,
        data: { hyHostId: this.id }
      }).then(res => {
        if (res.code === 1 && res.model) this.upStatus = res.model.hyNetState
      })
    }
  }
}
