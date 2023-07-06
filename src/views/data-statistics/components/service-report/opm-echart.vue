<template>
  <div v-loading="loading" class="opm-echart flex">
    <div ref="echart" style="height: 100%" class="echart-box" />
    <div class="opm-count">
      <div class="flex-h-center">
        <div v-for="item in opmCountList" :key="item.statue" class="count-item">
          <div class="item-title">{{ item.value }}</div>
          <div class="item-total mt-10">{{ item.count }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import * as echarts from 'echarts'
const audioStatus = [
  // { statue: 1, value: '未提交', color: 'danger' },
  { statue: 1, value: '已确认', color: 'danger', colorCode: '#F56C6C' },
  { statue: 2, value: '审批中', color: 'danger', colorCode: '#F56C6C' },
  { statue: 3, value: '已审批', color: 'success', colorCode: '#67C23A' },
  { statue: 5, value: '待审核', color: 'success', colorCode: '#67C23A' },
  { statue: 7, value: '关闭', color: 'success', colorCode: '#67C23A' },
  { statue: 8, value: '修改', color: 'success', colorCode: '#67C23A' }
]
export default {
  name: 'OpmEchart',
  props: {
    dateQuery: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      opmCountList: [],
      opmTypeOption: [
        // 事项类型
        { name: '故障问题', key: 1, value: 0 },
        { name: '服务请求', key: 2, value: 0 },
        { name: '整改变更', key: 3, value: 0 },
        { name: '日常事务', key: 4, value: 0 },
        { name: '运维登记', key: 5, value: 0 }
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
  mounted() {
    this.initData()
  },
  methods: {
    initData() {
      this.loading = true
      this.initOpmCountListData()
      this.countNumByDateAndType()
      window.setTimeout(() => {
        this.loading = false
      }, 500)
    },
    // echart
    async countNumByDateAndType() {
      const {map, code} = await request({url: api.itMonitor.countNumByDateAndType, data: {limit: -1, ...this.dateQuery }})
      if (code !== 1) return
      map.result.forEach(it => {
        this.opmTypeOption.forEach(item => {
          if (+it['problemType'] === +item['key'])item['value'] = +it['count']
        })
      })
      this.initEchart()
    },
    // 右边
    async initOpmCountListData() {
      const data = await this.countNumByDateAndStatue()
      let list = []
      audioStatus.forEach((it) => {
        const idx = data.find((item) => +item['statue'] === +it['statue'])
        if (idx) list.push({ ...it, ...idx })
      })
      this.opmCountList = list
    },
    async countNumByDateAndStatue() {
      const { map, code } = await request({
        url: api.itMonitor.countNumByDateAndStatue,
        data: { ...this.dateQuery }
      })
      if (code === 1) return map['result']
    },
    initEchart() {
      var chartDom = this.$refs.echart
      var myChart = echarts.init(chartDom)
      var option

      option = {
        tooltip: {
          trigger: 'item'
        },
        legend: [
          {
            bottom: '20%',
            left: '25%',
            data: ['故障问题', '服务请求', '整改变更']
          },
          {
            bottom: '10%',
            left: '25%',
            data: ['日常事务', '运维登记']
          }
        ],
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '35%'],
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
            emphasis: {
              label: {
                show: true,
                fontSize: '16',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: this.opmTypeOption
          }
        ]
      }

      option && myChart.setOption(option)
    }
  }
}
</script>

<style lang="scss" scoped>
.opm-echart {
  height: 100%;
  & > div {
    flex: 1;
    flex-shrink: 0;
  }
  .opm-count {
    & > div {
      flex-wrap: wrap;
      height: auto;
    }
    .count-item {
      box-sizing: border-box;
      margin-top: 14px;
      margin-left: 14px;
      padding: 14px;
      flex-basis: calc(50% - 14px);
      background-color: #fafafa;
      .item-title {
        font-size: 16px;
        color: #6b6565;
      }
      .item-total {
        font-size: 24px;
      }
    }
  }
}
</style>
