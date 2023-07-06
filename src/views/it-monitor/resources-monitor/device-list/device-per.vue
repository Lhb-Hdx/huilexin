<template>
  <div class="left-tools">
    <div class="left-box">
      <div class="echart-box">
        <div ref="pieBar" class="pieBar" style="height: 200px;" />
      </div>
      <div class="cat-box">
        <div v-for="(item, index) in devTypeList" :key="item.catId" class="dev-type-item" :class="item.active ? 'active':''" @click="handelDevTypeTab(item, index)">
          <div class="title">
            <div class="icon"><img :src="item.thumb" alt=""></div>
            <div>{{ item.dictdataName }}</div>
          </div>
          <div class="count">{{ setHostTypeStatictics(item.id) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'DevicePer',
  props: {
    devTypeList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      hostTypeStatictics: [],
      devStatus: [
        { value: 0, name: '在线设备' },
        { value: 0, name: '离线设备' }
      ]
    }
  },
  computed: {
    // 设置主机类型下的主机数量
    setHostTypeStatictics() {
      return function(id) {
        const hostTypeStaticticsIdx = this.hostTypeStatictics.findIndex(item => item.devType === id)
        if (hostTypeStaticticsIdx !== -1) {
          return this.hostTypeStatictics[hostTypeStaticticsIdx].count
        }
      }
    }
  },
  mounted() {
    this.getHyitHostTypeStatictics()
    this.getHyitHostStatictics()
  },
  methods: {
    // 获取设备状态统计
    getHyitHostStatictics() {
      request({
        url: api.itMonitor.getHyitHostStatictics,
        data: { agents: this.agentsIds }
      }).then(res => {
        if (res.code === 1) {
          this.devStatus[0].value = res.model.onlineCount
          this.devStatus[1].value = res.model.offlineCount
          this.loadEcharts()
        }
      })
    },
    // 加载统计图
    loadEcharts() {
      const self = this
      const myChart = echarts.init(self.$refs['pieBar'])
      const option = {
        color: ['#00b285', '#f4f4f5'],
        tooltip: {
          trigger: 'item'
        },
        legend: {
          bottom: '10%',
          left: 'center'
        },
        series: [
          {
            type: 'pie',
            center: ['50%', '40%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            labelLine: {
              show: false
            },
            data: self.devStatus
          }
        ]
      }
      myChart.setOption(option, true)
    },
    // 获取设备类型下的主机数量
    getHyitHostTypeStatictics() {
      request({
        url: api.itMonitor.getHyitHostTypeStatictics,
        data: { agents: this.agentsIds }
      }).then(res => {
        if (res.code === 1) {
          this.hostTypeStatictics = res.data
        }
      })
    },
    // 选择设备获取主机
    handelDevTypeTab(val, idx) {
      val.id === 0 ? this.devTypeId = '' : this.devTypeId = val.id
      // this.findHyitHostQuery.page = 1
      // this.handelDevTypeId = val.id
      val.dictdataName === '所有' ? this.exportFileName = 'IT资源监控' : this.exportFileName = val.dictdataName
      if (this.devTypeList[idx].active) return
      this.devTypeList.forEach(item => {
        item.active = false
      })
      this.devTypeList[idx].active = true
      this.$nextTick(() => {
        this.$EventBus.$emit('handelDevTypeTab', val)
        // this.assetsDeviceList = []
        // this.findHyitHostQuery.devType = val.id === 0 ? '' : val.id
        // this.findHyitHost()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.left-tools {
  position: fixed;
  // position: absolute;top:0;left:0;bottom: 0;
  width: 240px;height: 100%;
  // min-height: calc(100vh - 146px);
  /*border-right: solid 1px #e6e6e6;*/
  background-color: #E5ECF6;
  overflow-y:scroll;
  overflow-x: hidden;
  .left-box{width: 100%;height: 100%;position: relative;}
  .echart-box{
    width: 240px;
    height: 200px;
    position: fixed;
    background-color: #E5ECF6;
    // top:0;
    // left:0;
    // right:0;
    .pieBar{
      flex: 1;
      width: 80%;
      height: 80%;
      margin: 0 10%;
    }
  }
  .cat-box{
    box-sizing: border-box;z-index: 50;padding-top:200px;
    .dev-type-item{
      padding:0 20px;box-sizing: border-box;cursor: pointer;
      height:45px;width:100%;line-height:45px;
      display:flex;justify-content: space-between;
      font-size: 14px;
      >div:first-child{
        display: flex;justify-content: flex-start;
        img{width:16px;height: 16px;margin-right: 10px; margin-top:15px}
      }
      .count{color: #999;}
    }
    .dev-type-item:hover,.dev-type-item.active {
      background:#B7CBE7;
    }
  }

}
</style>
