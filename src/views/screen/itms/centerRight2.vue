<template>
  <div id="centerRight2">
    <div class="bg-color-black">
      <div class="d-flex pt-2 pl-2">
        <span style="color:#5cd9e8">
          <icon name="align-left" />
        </span>
        <span class="fs-xl text mx-2">运维工单类别分析</span>
      </div>
      <div class="d-flex jc-center body-box" style=" margin-top: 0;">
        <dv-capsule-chart :config="config" style="width: 100%;height:2rem" />
        <centerRight2Chart1 />
      </div>
    </div>
  </div>
</template>

<script>
import centerRight2Chart1 from '@/components/echart/centerRight/centerRightChart'

export default {
  components: { centerRight2Chart1 },
  data() {
    return {
      config: {
        data: [
          {
            name: 'IT设备',
            value: 167
          },
          {
            name: '业务系统',
            value: 67
          },
          {
            name: '网络设备',
            value: 123
          },
          {
            name: '存储设备',
            value: 55
          },
          {
            name: '后勤设备',
            value: 98
          }
        ]
      }
    }
  },
  mounted() {},
  methods: {}
}
</script>

<style lang="scss">
#centerRight2 {
  padding: 0.0625rem;
  height: 5rem;
  min-width: 3.75rem;
  border-radius: 0.0625rem;
  .bg-color-black {
    padding: 0.0625rem;
    height: 5.0625rem;
    border-radius: 0.125rem;
  }
  .text {
    color: #c3cbde;
  }
  .body-box {
    border-radius: 0.125rem;
    overflow: hidden;
  }
}
</style>
