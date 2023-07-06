<template>
  <div class="table-wrapper width-100">
    <el-table
      :data="moduleData"
    >
      <el-table-column label="温度名称" prop="name" show-overflow-tooltip />
      <el-table-column label="重大告警最高阀值" prop="higherCriticalThresItemValue" show-overflow-tooltip />
      <el-table-column label="重大告警最低阀值" prop="lowerCriticalThresItemValue" show-overflow-tooltip />
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'MonitorServiceTemperature',
  props: {
    moduleData: {
      type: Array,
      default() {
        return []
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/monitor-device.scss";
</style>

