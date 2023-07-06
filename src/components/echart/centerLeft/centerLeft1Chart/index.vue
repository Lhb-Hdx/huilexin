<template>
  <div>
    <Chart :cdata="cdata" />
  </div>
</template>

<script>
import Chart from './chart.vue'
export default {
  components: {
    Chart
  },
  data() {
    return {
      cdata: {
        xData: ['服务器', '交换机', '存储设备', '网络设备', '数据库', '业务系统'],
        seriesData: [
          { value: 10, name: '服务器' },
          { value: 5, name: '交换机' },
          { value: 15, name: '存储设备' },
          { value: 25, name: '网络设备' },
          { value: 20, name: '数据库' },
          { value: 35, name: '业务系统' }
        ]
      }
    }
  },
  mounted() {
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
</style>
