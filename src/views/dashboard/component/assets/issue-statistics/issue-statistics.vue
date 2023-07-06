<template>
  <div v-if="isShow || (!isShow && !watchItemShow)" class="dashboard-box-item width-100">
    <div class="box-item-content content-height-300">
      <div class="item-content-header">
        <div class="title">分布统计</div>
        <div class="line"><div class="blo" /></div>
        <div class="item-content">
          <el-switch
            v-if="isShow"
            v-model="modelDefineSwitch"
            @change="changemodelDefine"
          />
        </div>
      </div>
      <div class="item-content-body flexBox align-item-center">
        <div class="echart-box">
          <div id="issueStatisticsEcharts" ref="issueStatisticsEcharts" style="height: 220px" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'IssueStatistics',
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modelDefineSwitch: true,
      modelDefine: 'assetsIssueStatistics',
      watchItemShow: null,
      dashboardType: 4,
      modelShow: '',
      devStatus: [
        { value: 0, name: '广州总部办公室', color: '#ea605c' },
        { value: 0, name: '深圳分公司办公室', color: '#ea8735' },
        { value: 0, name: '广州总部数据中心', color: '#4da88b' },
        { value: 0, name: '深圳分公司机房', color: '#9b999c' }
      ]
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('get-meter-show')
  },
  mounted() {
    this.$EventBus.$on('get-meter-show', (data) => {
      const idx = data.findIndex(item => item.modelDefine === this.modelDefine)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.modelDefineSwitch = Boolean(data[idx].modelShow)
      }
    })
    this.createEcharts()
  },
  methods: {
    // 更改显示配置
    changemodelDefine(val) {
      console.log(val)
      if (val === false) {
        console.log(1, Number(val), '新增')
        // 新增
        this.$EventBus.$emit('change-meter-switch', {
          modelDefine: this.modelDefine,
          type: 1,
          modelShow: Number(val),
          dashboardType: this.dashboardType
        })
      } else {
        // 删除
        console.log(2, Number(val), '删除')
        this.$EventBus.$emit('change-meter-switch', {
          id: this.watchItemShow.id,
          modelDefine: this.modelDefine,
          type: 1,
          modelShow: Number(val),
          dashboardType: this.dashboardType
        })
      }
    },
    createEcharts() {
      const self = this
      const opsChartsObj = echarts.init(self.$refs['issueStatisticsEcharts'])
      const option = {
        color: ['#ea605c', '#ea8735', '#4da88b', '#9b999c'],
        tooltip: {
          trigger: 'item'
        },
        legend: {
          bottom: '0%',
          right: '20%',
          top: '40%',
          width: '200px'
        },
        series: [
          {
            type: 'pie',
            radius: ['80%', '60%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: false,
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
    }
  }
}
</script>

<style lang="scss" scoped>
.item-content {
  float: right;
  margin-top: -35px;
}
.item-content-body {
  .echart-box {
    width: 100%;
  }
}
</style>
