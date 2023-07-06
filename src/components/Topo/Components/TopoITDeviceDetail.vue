<template>
  <el-dialog v-set-dialog-main-height="'80%'" class="dialog-body-scroll dialog-not-footer" append-to-body title="设备详情" :visible.sync="showHostDevice" width="80%" height="50%" top="5vh">
    <div class="dialog-body">
      <MonitorContent
        v-if="showHostDevice"
        :prop-agent="host.agent"
        :prop-dev-type-id="host.hyDevTypeId"
        :prop-zbx-host-id="host.hyZhostId"
        :prop-sub-type-id="host.hySubdevTypeId"
      />
    </div>
  </el-dialog>
</template>

<script>
import MonitorContent from '@/views/it-monitor/resources-monitor/monitor-content'

export default {
  name: 'TopoITDeviceDetail',
  components: { MonitorContent },
  data() {
    return {
      showHostDevice: false,
      host: null
    }
  },
  mounted() {
    this.$EventBus.$on('openHostDevice', (val) => {
      this.host = val
      this.showHostDevice = true
    })
  },
  methods: {}
}
</script>

<style scoped>

</style>
