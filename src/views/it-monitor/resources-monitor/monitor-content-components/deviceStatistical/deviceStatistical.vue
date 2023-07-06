<template>
  <div class="app-container">
    <div class="fault-box">
      <div class="fault-totle">常见故障 TOP5<div class="segment" /></div>
      <div class="fault-totle">故障类型统计<div class="segment" /></div>
    </div>

    <div class="filter-container">
      <div class="filter-top">
        <div v-for="(item,index) in topList" :key="index" :style="{ 'background-color': item.color}" class="top-box">
          <div class="top-title">{{ item.description }}</div>
          <div class="top-num">{{ item.alarmCount }}</div>
        </div>
      </div>
      <div class="filter-station" />
      <div class="filter-box">
        <div class="pieChart">
          <div id="faultStatistics" ref="faultStatistics" style="height: 280px" />
        </div>
        <div class="pieChart">
          <div id="faultType" ref="faultType" style="height: 280px" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  name: 'DeviceStatistical',
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
      topList: [],
      AlarmLogList: [],
      AlarmTypeList: [],
      devStatus: [
        { value: 0, name: '灾难', color: '#f01920', alarmTypeMainId: 1 },
        { value: 0, name: '严重', color: '#fe830c', alarmTypeMainId: 2 },
        { value: 0, name: '一般严重', color: '#00b285', alarmTypeMainId: 3 },
        { value: 0, name: '警告', color: '#268cf2', alarmTypeMainId: 4 },
        { value: 0, name: '信息', color: '#88cefd', alarmTypeMainId: 5 },
        { value: 0, name: '其他', color: '#5B9F71', alarmTypeMainId: 6 }
      ],
      topStatus: [],
      faultType: []
    }
  },
  watch: {
    hostInfo: {
      handler() {
        if (this.hostInfo.hyHostId) this.getAlarmLogDesTop()
      },
      deep: true
    }
  },
  async mounted() {
    // if (this.hostInfo.hyHostId) {
    await this.findSysCat()
    await this.getAlarmLogDesTop()
    await this.showAlarmLogByAll()
    await this.getAlarmLogAlarmType()
    // }
  },
  methods: {
    // 随机生成十六进制颜色
    randomHexColor() {
      var hex = Math.floor(Math.random() * 16777216).toString(16)
      // 生成ffffff以内16进制数
      while (hex.length < 6) {
        // while循环判断hex位数，少于6位前面加0凑够6位
        hex = '0' + hex
      }
      return '#' + hex // 返回‘#'开头16进制颜色
    },
    // 获取故障类型
    async findSysCat() {
      const _this = this
      let { code, data } = await this.$request({
        url: this.api.sys.findSysCat,
        data: {
          page: 1,
          limit: -1,
          systemName: 'userDefine',
          classify: 'userDefine_故障类型',
          parentId: -1,
          module: 2
        }
      })
      if (code !== 1) return
      data.forEach(item => {
        console.log(1)
        let topData = {}
        topData.name = item.catName
        topData.alarmType = item.catId
        topData.color = this.randomHexColor()
        _this.topStatus.push(topData)
      })
      console.log(this.topStatus)
    },
    // top排行
    async getAlarmLogDesTop() {
      const res = await this.$request({ url: this.api.itMonitor.getAlarmLogDesTop, data: { hostid: this.hostInfo.hyHostId, top: 5 }})
      if (res.code !== 1) return
      res.map.top.forEach((item, index) => {
        switch (index) {
          case 0:
            item.color = '#FF636D'
            break
          case 1:
            item.color = '#FEE3E2'
            break
          case 2:
            item.color = '#FEF1F2'
            break
          case 3:
            item.color = '#F5F6F6'
            break
          case 4:
            item.color = '#F5F6F6'
            break
        }
      })
      this.topList = res.map.top
    },
    // 第一个饼图
    async showAlarmLogByAll() {
      console.log(this.hostInfo)
      const res = await this.$request({ url: this.api.automationOperations.showAlarmLogByAll, data: { hostid: this.hostInfo.hyHostId }})
      if (res.code !== 1) return
      console.log(res)
      res.map.num.forEach(resItem => {
        const idx = this.devStatus.findIndex(item => item.alarmTypeMainId === resItem.alevel)
        if (idx !== -1) {
          this.$set(this.devStatus[idx], 'value', resItem.count)
        }
      })
      this.createEcharts()
    },
    createEcharts() {
      const self = this
      const opsChartsObj = echarts.init(self.$refs['faultStatistics'])
      const option = {
        color: ['#f01920', '#fe830c', '#00b285', '#268cf2', '#88cefd', '#5B9F71'],
        graphic: {
          elements: []
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          bottom: '0%',
          left: 'center'
        },
        series: [
          {
            type: 'pie',
            radius: ['80%', '60%'],
            center: ['50%', '40%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 4,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: false,
                fontSize: '40',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: self.devStatus
          }
        ]
      }
      opsChartsObj.setOption(option, true)
    },
    // 第二个饼图
    async getAlarmLogAlarmType() {
      const res = await this.$request({ url: this.api.itMonitor.getAlarmLogAlarmType, data: { hostid: this.hostInfo.hyHostId }})
      if (res.code !== 1) return
      res.map.top.forEach(resItem => {
        console.log(resItem.alarmType)
        const idx = this.topStatus.findIndex(item => +item.alarmType === +resItem.alarmType)
        if (idx !== -1) {
          this.$set(this.topStatus[idx], 'value', resItem.alarmCount)
        }
      })
      this.topStatus.forEach(items => {
        if (!items.value) {
          items.value = 0
        }
      })
      console.log(this.topStatus)
      this.createTopEcharts()
    },
    createTopEcharts() {
      const self = this
      const colorList = []
      this.topStatus.forEach(item => {
        this.$set(colorList, colorList.length, item.color)
      })
      const opsChartsObj = echarts.init(self.$refs['faultType'])
      const option = {
        color: colorList,
        graphic: {
          elements: []
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          bottom: '0%',
          left: 'center'
        },
        series: [
          {
            type: 'pie',
            radius: ['80%', '60%'],
            center: ['50%', '40%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 4,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: false,
                fontSize: '40',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: self.topStatus
          }
        ]
      }
      opsChartsObj.setOption(option, true)
    }
  }
}
</script>

<style lang="scss" scoped>
.fault-box {
  display: flex;
  .fault-totle {
    flex: 1;
    margin: 10px 0 30px;
    font-size: 18px;
    font-weight: bold;
    .segment {
      width: 50px;
      margin-top: 10px;
      border: 2px solid #084095;
    }
  }
}
.filter-container {
  display: flex;
  .filter-top {
    flex: 9;
    .top-box {
    width: 100%;
    height: 30px;
    padding: 0 10px;
    position: relative;
    margin-bottom: 10px;
      .top-title {
      line-height: 30px;
      font-weight: 600;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 40px;
    }
      .top-num {
        position: absolute;
        top: 8px;
        right: 15px;
        font-weight: bold;
        font-size: 15px;
      }
    }
  }
  .filter-station {
    flex: 1;
  }
  .filter-box {
    flex: 10;
    display: flex;
    .pieChart {
      flex: 1;
    }
  }
}

</style>
