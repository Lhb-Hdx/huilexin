<template>
  <div>
    <template v-if="!showNull">
      <DetailedInformation :device="portDevice" :show-back="false" />
    </template>
    <template v-else>
      <el-empty description="该设备暂无配置端口界面">
        <el-button type="text" @click="onToConfigPortView">点击配置</el-button>
      </el-empty>
    </template>
  </div>
</template>

<script>
import DetailedInformation from '@/views/port-manage/component/detailed-information'

export default {
  name: 'DevicePort',
  components: { DetailedInformation },
  props: {
    hostInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      portDevice: {},
      showNull: true,
      hostList: []
    }
  },
  watch: {
    hostInfo: {
      handler() {
        if (this.hostInfo.hyZhostId) this.findPortDevice()
      },
      deep: true
    }
  },
  mounted() {
    if (this.hostInfo.hyZhostId) this.findPortDevice()
  },
  methods: {
    findPortDevice() {
      this.$request({ url: this.api.port.findPortDevice, data: { limit: -1, zhostid: this.hostInfo.hyZhostId }}).then(async res => {
        if (res.code === 1) {
          if (res.data && res.data.length > 0) {
            // ====== 查询在线状态 开始 =====
            const ids = []
            res.data.forEach(item => {
              ids.push(item.hostid)
            })
            await this.$request({
              url: this.api.itMonitor.findHyitHost,
              data: { ids }
            }).then(res => {
              if (res.code === 1) {
                this.hostList = res.data
              }
            })
            res.data.forEach(item => {
              this.hostList.forEach(lostItem => {
                if (Number(item.hostid) === Number(lostItem.hyHostId)) {
                  console.log(lostItem.hyNetState)
                  this.$set(item, 'hyNetState', lostItem.hyNetState)
                }
              })
            })
            // ====== 查询在线状态 结束 =====
            this.portDevice = res.data[0]
            this.showNull = false
          } else {
            this.showNull = true
          }
        }
      })
    },
    onToConfigPortView() {
      this.$router.push({
        name: 'PortManage'
      })
    }
  }
}
</script>

<style scoped>

</style>
