<template>
  <div class="device-area-list">
    <div class="echart-box">
      <div ref="pieBar" class="pieBar" style="height: 200px;" />
    </div>
    <div class="cat-box">
      <div v-for="(item, index) in area" :key="item.hyOrgId" class="dev-type-item" :class="item.active ? 'active':''" @click="handlerArea(item.hyOrgId, index)">
        <div class="title overflow-text-a">
          {{ item.hyAreaName }}
        </div>
        <div v-if="setOrgHostStatue(item.hyOrgId) && item.hyOrgId !== ''" class="org-statue" />
        <div class="count">{{ item.orgCount }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import * as echarts from 'echarts'

export default {
  name: 'DeviceAreaList',
  data() {
    return {
      agentsIds: '',
      area: [],
      handelAreaTypeId: '',
      devStatus: [],
      orgHostStatue: [],
      allOrgCount: 0
    }
  },
  computed: {
    setOrgHostStatue() {
      return function(orgId) {
        if (!orgId) return
        if (orgId === '') {
          let status = true
          this.orgHostStatue.forEach(item => {
            if (!status && !item.status) status = false
          })
          return !status
        } else {
          const idx = this.orgHostStatue.findIndex(item => Number(item.orgId) === Number(orgId))
          return idx !== -1 ? !this.orgHostStatue[idx].status : ''
        }
      }
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('watch-org-host-statue')
  },
  mounted() {
    this.agentsIds = this.sessionStorageOperation('get', 'agentId')
    this.findHyitHostOrgStatistics()
    this.$EventBus.$on('watch-org-host-statue', (msg) => {
      this.orgHostStatue = msg
    })
  },
  methods: {
    findHyitHostOrgStatistics() {
      request({
        url: api.flowMonitor.findHyitHostOrgStatistics,
        data: { limit: -1, agents: this.agentsIds }
      }).then(res => {
        if (res.code === 1 && res.model) {
          const data = JSON.parse(res.model)
          const devStatus = []
          let allOrgCount = 0
          data.forEach(item => {
            item.active = false
            devStatus.push({
              value: item.orgCount,
              name: item.hyAreaName,
              active: false
            })
            allOrgCount += item.orgCount
          })
          this.area = [
            {
              hyAreaName: '全部',
              hyOrgId: '',
              active: true,
              orgCount: allOrgCount
            },
            ...data
          ]
          this.devStatus = devStatus
          this.allOrgCount = allOrgCount
          this.loadEcharts()
        }
      })
    },
    findHyitArea() {
      request({
        url: api.area.findHyitArea,
        data: { limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          res.data.forEach(item => {
            item.active = false
          })
          res.data[0].active = true
          this.area = res.data
        }
      })
    },
    handlerArea(id, idx) {
      this.handelAreaTypeId = id
      if (this.area[idx].active) return
      this.area.forEach(item => {
        item.active = false
      })
      this.area[idx].active = true
      this.$EventBus.$emit('handler-area', { id })
    },
    // 加载统计图
    loadEcharts() {
      const self = this
      const myChart = echarts.init(self.$refs['pieBar'])
      const option = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          bottom: '10%',
          left: 'center',
          show: false
        },
        series: [
          {
            type: 'pie',
            center: ['50%', '50%'],
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
    }
  }
}
</script>

<style lang="scss" scoped>
.device-area-list {
  width: 100%;
  height: 100%;
  position: relative;
}
.echart-box {
  width: 240px;
  height: 200px;
  position: fixed;
  background-color: #E5ECF6;
  .pieBar {
    flex: 1;
    width: 80%;
    height: 80%;
    margin: 0 10%;
  }
}
.cat-box {
  box-sizing: border-box;
  z-index: 50;
  padding-top: 200px;
  .dev-type-item {
    padding:0 20px;
    box-sizing: border-box;
    cursor: pointer;
    height:45px;
    width:100%;
    line-height:45px;
    display:flex;
    justify-content: space-between;
    font-size: 14px;
    position: relative;
    >div:first-child {
      width: 80%;
      img {
        width:16px;
        height: 16px;
        margin-right: 10px;
        margin-top:15px
      }
    }
    .count {
      color: #999;
    }
    .org-statue {
      //background: red;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      position: absolute;
      top: 22%;
      left: 180px;
    }
  }
  .dev-type-item:hover,.dev-type-item.active {
    background:#B7CBE7;
  }
}
</style>
