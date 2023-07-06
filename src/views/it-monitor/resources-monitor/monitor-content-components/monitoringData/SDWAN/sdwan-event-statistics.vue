<template>
  <div class="ports box-border margin-bottom-15 margin-left-15 margin-right-15">
    <div class="head head-bar">
      <div>
        <div class="title">事件统计</div>
      </div>
    </div>
    <div class="p10">
      <sdwanEventPerEchart />
    </div>
  </div>
</template>

<script>
import sdwanEventPerEchart from './sdwan-event-per-echart'

export default {
  name: 'SDWANEventStatistics',
  components: {
    sdwanEventPerEchart
  },
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
    }
  },
  data() {
    return {}
  },
  computed: {
    // 获取网关id
    agent() {
      if (this.propAgent === 0) {
        return this.$route.query.agent
      } else {
        return String(this.propAgent)
      }
    },
    // 获取zabbix主机id
    zbxHostId() {
      if (this.propZbxHostId === 0) {
        return this.$route.query.zbxHostId
      } else {
        return String(this.propZbxHostId)
      }
    }
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
@import "@/styles/monitor-device.scss";
</style>
