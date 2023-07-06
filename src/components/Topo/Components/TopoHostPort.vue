<template>
  <el-dialog v-set-dialog-main-height="'80%'" class="dialog-body-scroll dialog-not-footer" append-to-body title="端口详情" :visible.sync="showHostPortDevice" width="80%" height="50%" top="5vh">
    <div class="dialog-body">
      <template v-if="!showNull">
        <DetailedInformation v-if="showHostPortDevice" :device="portDevice" :show-back="false" />
      </template>
      <template v-else>
        <el-empty description="暂无数据" />
      </template>
    </div>
  </el-dialog>
</template>

<script>
import DetailedInformation from '@/views/port-manage/component/detailed-information'

export default {
  name: 'TopoHostPort',
  components: { DetailedInformation },
  data() {
    return {
      portDevice: null,
      showHostPortDevice: false,
      showNull: false
    }
  },
  mounted() {
    this.$EventBus.$on('openHostPortDevice', (val) => {
      this.showHostPortDevice = true
      if (val) {
        this.showNull = false
        this.portDevice = val
      } else {
        this.showNull = true
      }
    })
  }
}
</script>
