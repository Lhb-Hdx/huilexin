<template>
  <div id="center">
    <div class="up">
      <div v-for="item in titleItem" :key="item.title" class="bg-color-black item">
        <p class="ml-3 colorBlue fw-b">{{ item.title }}</p>
        <div>
          <dv-digital-flop :config="item.number" style="width:1.25rem;height:.625rem;" />
        </div>
      </div>
    </div>
    <div class="down">
      <div class="ranking bg-color-black">
        <span style="color:#5cd9e8">
          <icon name="align-left" />
        </span>
        <span class="fs-xl text mx-2 mb-1">监控项指标故障</span>
        <dv-scroll-ranking-board :config="ranking" style="height:2.75rem" />
      </div>
      <div class="percent">
        <div class="item bg-color-black">
          <span>今日工单完成率</span>
          <CenterChart :id="rate[0].id" :tips="rate[0].tips" :color-obj="rate[0].colorData" />
        </div>
        <div class="item bg-color-black">
          <span>今日故障处理率</span>
          <CenterChart :id="rate[1].id" :tips="rate[1].tips" :color-obj="rate[1].colorData" />
        </div>
        <div class="water">
          <dv-water-level-pond :config="water" style="height: 1.5rem" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CenterChart from '@/components/echart/center/centerChartRate'

export default {
  components: {
    CenterChart
    // centerChart1,
    // centerChart2
  },
  data() {
    return {
      titleItem: [
        {
          title: '今年累计工单建次数',
          number: {
            number: [120],
            toFixed: 1,
            content: '{nt}'
          }
        },
        {
          title: '本月累计工单次数',
          number: {
            number: [18],
            toFixed: 1,
            content: '{nt}'
          }
        },
        {
          title: '今日累计工单次数',
          number: {
            number: [2],
            toFixed: 1,
            content: '{nt}'
          }
        },
        {
          title: '今年失败工单次数',
          number: {
            number: [14],
            toFixed: 1,
            content: '{nt}'
          }
        },
        {
          title: '今年成功工单次数',
          number: {
            number: [106],
            toFixed: 1,
            content: '{nt}'
          }
        },
        {
          title: '今年达标工单个数',
          number: {
            number: [100],
            toFixed: 1,
            content: '{nt}'
          }
        }
      ],
      ranking: {
        data: [
          {
            name: '网络连接',
            value: 55
          },
          {
            name: '数据库连接',
            value: 120
          },
          {
            name: '硬件读取',
            value: 78
          },
          {
            name: '业务通信',
            value: 66
          },
          {
            name: '端口故障',
            value: 80
          },
          {
            name: '流量过高',
            value: 80
          },
          {
            name: 'CPU过高',
            value: 80
          },
          {
            name: '内存过高',
            value: 80
          },
          {
            name: '存储过高',
            value: 80
          },
          {
            name: '网络不通',
            value: 80
          }
        ],
        carousel: 'single',
        unit: '次'
      },
      water: {
        data: [24, 45],
        shape: 'roundRect',
        formatter: '{value}%',
        waveNum: 3
      },
      // 通过率和达标率的组件复用数据
      rate: [
        {
          id: 'centerRate1',
          tips: 60,
          colorData: {
            textStyle: '#3fc0fb',
            series: {
              color: ['#00bcd44a', 'transparent'],
              dataColor: {
                normal: '#03a9f4',
                shadowColor: '#97e2f5'
              }
            }
          }
        },
        {
          id: 'centerRate2',
          tips: 40,
          colorData: {
            textStyle: '#67e0e3',
            series: {
              color: ['#faf3a378', 'transparent'],
              dataColor: {
                normal: '#ff9800',
                shadowColor: '#fcebad'
              }
            }
          }
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
#center {
  display: flex;
  flex-direction: column;
  .up {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    .item {
      border-radius: 0.0625rem;
      padding-top: 0.2rem;
      margin-top: 0.1rem;
      width: 32%;
      height: 0.875rem;
    }
  }
  .down {
    padding: 0.07rem 0.05rem;
    padding-bottom: 0;
    width: 100%;
    display: flex;
    height: 3.1875rem;
    justify-content: space-between;
    .bg-color-black {
      border-radius: 0.0625rem;
    }
    .ranking {
      padding: 0.125rem;
      width: 59%;
    }
    .percent {
      width: 40%;
      display: flex;
      flex-wrap: wrap;
      .item {
        width: 50%;
        height: 1.5rem;
        span {
          margin-top: 0.0875rem;
          display: flex;
          justify-content: center;
        }
      }
      .water {
        width: 100%;
      }
    }
  }
}
</style>
