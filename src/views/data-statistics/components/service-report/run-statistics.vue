<template>
  <div v-loading="loading" class="dataWrapper">
    <div class="dataTop">
      <div class="dataContent">
        <div class="title">设备总数</div>
        <div class="number">{{ deviceTotal }}</div>
      </div>
      <div class="dataContent">
        <div class="title">故障总数</div>
        <div class="number">{{ failTotal }}</div>
      </div>
      <div class="dataContent">
        <div class="title">故障响应平均时间</div>
        <div class="number">139</div>
      </div>
      <div class="dataContent">
        <div class="title">设备平均运行时长</div>
        <div class="number">139</div>
      </div>
    </div>
    <div class="dataBottom">
      <div v-for="item in stateCatData" :key="item.value" class="dataContent">
        <div class="title">{{ item.label }}</div>
        <div class="number">{{ item.count }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
export default {
  name: 'RunStatistics',
  props: {
    dateQuery: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      deviceTotal: 0,
      failTotal: 0,
      stateCatData: [
        { label: '待处理', value: 0, color: 'red', coun: 0 },
        { label: '已处理', value: 1, color: 'green', count: 0},
        { label: '自动恢复', value: 3, color: 'grey', count: 0},
        { label: '处理中', value: 4, color: 'grey', count: 0}
      ],
      loading: false
    }
  },
  watch: {
    dateQuery: {
      handler() {
        this.initData()
      },
      deep: true
    }
  },
  created() {
    this.initData()
  },
  methods: {
    initData() {
      this.loading = true
      this.countDeviceNum()
      this.countNumByDate()
      this.countNumByStatus()
      window.setTimeout(() => {
        this.loading = false
      }, 500)
    },
    // 设备总数
    async countDeviceNum() {
      const {map, code} = await request({url: api.itMonitor.countDeviceNum, data: {limit: -1, ...this.dateQuery }})
      if (code === 1) this.deviceTotal = map?.result || 0
    },
    // 故障总数
    async countNumByDate() {
      const {map, code} = await request({url: api.itMonitor.countNumByDate, data: {limit: -1, ...this.dateQuery}})
      if (code === 1) this.failTotal = map.result.reduce((total, next) => +total + +next['count'], 0)
    },
    // 底部四个
    async countNumByStatus() {
      const {map, code} = await request({url: api.itMonitor.countNumByStatus, data: {limit: -1, ...this.dateQuery}})
      if (code !== 1) return
      const {result} = map
      this.stateCatData = this.stateCatData.map(it => {
        const idx = result.find(item => +item.status === +it.value)
        if (idx) return {...it, count: idx.count}
        else return {...it, count: 0}
      })
    }
  }
}
</script>

<style lang="scss">
 .dataWrapper {
            .dataTop {
              // margin-top: 10px;
              display: flex;
              justify-content: space-between;
              .dataContent {
                width: 24%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 10px;
                background-color: #fafafa;
                .title {
                  color: #6b6565;
                  font-size: 16px;
                }
                .number {
                  color: black;
                  font-size: 24px;
                  margin-top: 10px;
                }
              }
            }
            .dataBottom {
              margin-top: 10px;
              display: flex;
              justify-content: space-between;
              .dataContent {
                width: 24%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 14px;
                background-color: #fafafa;
                .title {
                  color: #6b6565;
                  font-size: 16px;
                }
                .number {
                  color: black;
                  font-size: 24px;
                  margin-top: 10px;
                }
              }
            }
          }
</style>
