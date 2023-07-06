<template>
  <div class="box">
    <div class="box-item">
      <div class="box-item-top">
        <div v-for="(item,index) in it8Data" :key="index" class="block">
          <div class="p">
            <div class="f">
              <div class="name">{{ item.catName }}</div>
              <div class="el-icon-more-outline" />
            </div>
            <div class="f s">
              <div class="status1">{{ item.status1 }}</div>
              <div class="status0">{{ item.status0 }}</div>
            </div>
            <div class="proess">
              <el-progress :percentage="item.percentage" :show-text="false" />
            </div>
          </div>
        </div>
      </div>
      <div class="box-item-alarm-echarts">
        <div>
          <div class="title">今日告警统计</div>
          <div class="line"><div class="blo" /></div>
          <div ref="alarmBoxEcharts" class="echarts-boxs">
            <div id="alarmEcharts" ref="alarmEcharts" :style="{width:widthAlarm+'px',height:heightAlarm+'px'}" />
          </div>
        </div>
      </div>
      <div class="box-item-alarm-list">
        <div>
          <div v-for="(item,index) in alarmList" :key="'alarm-'+index" class="items">
            <div class="intro">
              <div class="title">[{{ item.catName }}]{{ item.title }}</div>
              <div class="time">{{ item.time }}</div>
            </div>
            <div class="icon-ops">
              <div class="el-icon-more-outline i" />
              <div class="btn-ops-ground">
                <div>查看</div>
                <div>确认</div>
                <div>关闭</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="box-item">
      <div class="box-item-topo">
        <div>
          <div class="title">动环能耗</div>
          <div class="line"><div class="blo" /></div>
          <div ref="powerBoxEcharts" class="echarts-boxs">
            <div id="powerEcharts" ref="powerEcharts" :style="{width:widthpower+'px',height:heightpower+'px'}" />
          </div>
        </div>
      </div>
      <div class="box-item-itcm">
        <div>
          <div class="title">近一周运维管理</div>
          <div class="line"><div class="blo" /></div>
          <div ref="itcmBoxEcharts" class="echarts-boxs">
            <div id="itcmEcharts" ref="itcmEcharts" :style="{width:widthItcm+'px',height:heightItcm+'px'}" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
// import G6 from '@antv/g6'
export default {
  name: 'Dashboard',
  components: {
  },
  data() {
    return {
      show: false, it8Data: [], alarmList: [], alarmLineData: [], alarmLineHours: [], itcmLineData: [], itcmLineWeeks: [],
      widthAlarm: 0, heightAlarm: 0, widthpower: 0, heightpower: 0, widthItcm: 0, heightItcm: 0,
      alarmEchartObject: null, itcmEchartObject: null, powerEchartObject: null
    }
  },
  mounted() {
    this.it8Data.push({ catName: '服务设备', status1: 25, status0: 5, percentage: 10 })
    this.it8Data.push({ catName: '操作系统', status1: 47, status0: 5, percentage: 20 })
    this.it8Data.push({ catName: '存储设备', status1: 13, status0: 5, percentage: 15 })
    this.it8Data.push({ catName: '网络设备', status1: 42, status0: 5, percentage: 48 })
    this.it8Data.push({ catName: '虚拟资源', status1: 63, status0: 5, percentage: 22 })
    this.it8Data.push({ catName: '应用软件', status1: 44, status0: 5, percentage: 58 })
    this.it8Data.push({ catName: '数据库', status1: 38, status0: 5, percentage: 19 })
    this.it8Data.push({ catName: '中间件', status1: 74, status0: 5, percentage: 78 })

    this.alarmList.push({ catName: '中间件', title: '交换机通信失败，无法ping通', level: 1, time: '2021-05-24 05:12:45' })
    this.alarmList.push({ catName: '操作系统', title: '交换机通信失败，无法ping通', level: 1, time: '2021-05-24 05:12:45' })
    this.alarmList.push({ catName: '虚拟资源', title: '交换机通信失败，无法ping通', level: 1, time: '2021-05-24 05:12:45' })
    this.alarmList.push({ catName: '中间件', title: '交换机通信失败，无法ping通', level: 1, time: '2021-05-24 05:12:45' })

    this.alarmLineHours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
    this.alarmLineData = [15, 51, 46, 21, 54, 58, 59, 23, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    this.itcmLineWeeks = [1, 2, 3, 4, 5, 6, 7]
    this.itcmLineData = [34, 56, 23, 16, 87, 45, 23]

    this.widthAlarm = this.$refs.alarmBoxEcharts.offsetWidth
    this.heightAlarm = this.widthAlarm * 0.35

    this.widthpower = this.$refs.powerBoxEcharts.offsetWidth
    this.heightpower = this.widthpower * 0.45
    this.widthItcm = this.$refs.itcmBoxEcharts.offsetWidth
    this.heightItcm = this.widthItcm * 0.45

    var that = this
    setTimeout(function() {
      that.alarmEcharts()
      that.itcmEcharts()
      that.powerEcharts()
    }, 1000)
  },
  methods: {
    alarmEcharts() {
      var that = this
      const hexToRgba = (hex, opacity) => {
        let rgbaColor = ''
        const reg = /^#[\da-f]{6}$/i
        if (reg.test(hex)) {
          rgbaColor = `rgba(${parseInt('0x' + hex.slice(1, 3))},${parseInt(
            '0x' + hex.slice(3, 5)
          )},${parseInt('0x' + hex.slice(5, 7))},${opacity})`
        }
        return rgbaColor
      }
      this.alarmEchartObject = echarts.init(document.getElementById('alarmEcharts'), 'light')
      this.alarmEchartObject.setOption({
        color: '#87DEAF',
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            return `${params[0].name}小时检测结果为${params[0].data}`
          }
        },
        grid: {
          top: '10%',
          left: '2%',
          right: '5%',
          bottom: '2%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            formatter: '{value}',
            textStyle: {
              color: '#333'
            }
          },
          axisLine: {
            lineStyle: {
              color: '#D9D9D9'
            }
          },
          axisTick: {
            show: false
          },
          data: that.alarmLineHours
        }],
        yAxis: [{
          type: 'value',
          axisLabel: {
            textStyle: {
              color: '#666'
            }
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#E9E9E9'
            }
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#D9D9D9'
            }
          },
          axisTick: {
            show: false
          }
        }],
        series: [{
          name: '今日告警',
          type: 'line',
          smooth: true,
          symbolSize: 8,
          zlevel: 3,
          lineStyle: {
            normal: {
              color: '#87DEAF',
              shadowBlur: 3,
              shadowColor: hexToRgba('#87DEAF', 0.5),
              shadowOffsetY: 8
            }
          },
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(
                0,
                0,
                0,
                1,
                [{
                  offset: 0,
                  color: hexToRgba('#87DEAF', 0.3)
                },
                {
                  offset: 1,
                  color: hexToRgba('#87DEAF', 0)
                }
                ],
                false
              ),
              shadowColor: hexToRgba('#87DEAF', 0.8),
              shadowBlur: 10
            }
          },
          data: that.alarmLineData

        }]

      })
    },
    powerEcharts() {
      var that = this
      const hexToRgba = (hex, opacity) => {
        let rgbaColor = ''
        const reg = /^#[\da-f]{6}$/i
        if (reg.test(hex)) {
          rgbaColor = `rgba(${parseInt('0x' + hex.slice(1, 3))},${parseInt(
            '0x' + hex.slice(3, 5)
          )},${parseInt('0x' + hex.slice(5, 7))},${opacity})`
        }
        return rgbaColor
      }
      this.powerEchartObject = echarts.init(document.getElementById('powerEcharts'), 'light')
      this.powerEchartObject.setOption({
        color: '#87DEAF',
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            return `${params[0].name}能耗值${params[0].data}`
          }
        },
        grid: {
          top: '10%',
          left: '2%',
          right: '5%',
          bottom: '2%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            formatter: '{value}',
            textStyle: {
              color: '#333'
            }
          },
          axisLine: {
            lineStyle: {
              color: '#D9D9D9'
            }
          },
          axisTick: {
            show: false
          },
          data: that.itcmLineWeeks
        }],
        yAxis: [{
          type: 'value',
          axisLabel: {
            textStyle: {
              color: '#666'
            }
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#E9E9E9'
            }
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#D9D9D9'
            }
          },
          axisTick: {
            show: false
          }
        }],
        series: [{
          name: '今日告警',
          type: 'line',
          smooth: true,
          symbolSize: 8,
          zlevel: 3,
          lineStyle: {
            normal: {
              color: '#87DEAF',
              shadowBlur: 3,
              shadowColor: hexToRgba('#87DEAF', 0.5),
              shadowOffsetY: 8
            }
          },
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(
                0,
                0,
                0,
                1,
                [{
                  offset: 0,
                  color: hexToRgba('#87DEAF', 0.3)
                },
                {
                  offset: 1,
                  color: hexToRgba('#87DEAF', 0)
                }
                ],
                false
              ),
              shadowColor: hexToRgba('#87DEAF', 0.8),
              shadowBlur: 10
            }
          },
          data: that.itcmLineData

        }]

      })
    },
    itcmEcharts() {
      var that = this
      const hexToRgba = (hex, opacity) => {
        let rgbaColor = ''
        const reg = /^#[\da-f]{6}$/i
        if (reg.test(hex)) {
          rgbaColor = `rgba(${parseInt('0x' + hex.slice(1, 3))},${parseInt(
            '0x' + hex.slice(3, 5)
          )},${parseInt('0x' + hex.slice(5, 7))},${opacity})`
        }
        return rgbaColor
      }
      this.itcmEchartObject = echarts.init(document.getElementById('itcmEcharts'), 'light')
      this.itcmEchartObject.setOption({
        color: '#87DEAF',
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            return `${params[0].name}小时检测结果为${params[0].data}`
          }
        },
        grid: {
          top: '10%',
          left: '2%',
          right: '5%',
          bottom: '2%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            formatter: '{value}',
            textStyle: {
              color: '#333'
            }
          },
          axisLine: {
            lineStyle: {
              color: '#D9D9D9'
            }
          },
          axisTick: {
            show: false
          },
          data: that.itcmLineWeeks
        }],
        yAxis: [{
          type: 'value',
          axisLabel: {
            textStyle: {
              color: '#666'
            }
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#E9E9E9'
            }
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#D9D9D9'
            }
          },
          axisTick: {
            show: false
          }
        }],
        series: [{
          name: '今日告警',
          type: 'line',
          smooth: true,
          symbolSize: 8,
          zlevel: 3,
          lineStyle: {
            normal: {
              color: '#87DEAF',
              shadowBlur: 3,
              shadowColor: hexToRgba('#87DEAF', 0.5),
              shadowOffsetY: 8
            }
          },
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(
                0,
                0,
                0,
                1,
                [{
                  offset: 0,
                  color: hexToRgba('#87DEAF', 0.3)
                },
                {
                  offset: 1,
                  color: hexToRgba('#87DEAF', 0)
                }
                ],
                false
              ),
              shadowColor: hexToRgba('#87DEAF', 0.8),
              shadowBlur: 10
            }
          },
          data: that.itcmLineData
        }]
      })
    }
  }

}

</script>
<style lang="scss" scoped>

.box{display: flex;
overflow-y: scroll;height:100%;background: #F0F3FA;
  .title{
    font-size: 16px;color: #333;
  }
  .line{margin:20px 0;
    .blo{
      width: 30px;
      height: 3px;
      background: #0145AB;
      border-radius: 1px 1px 1px 1px;
    }
  }

  .box-item{
    width: 50%;height: 100%;

    .box-item-top{
      background: #F0F3FA;
      display: flex;justify-content: flex-start;flex-wrap:wrap;padding:10px 0 0 10px;
      .block{width: 25%;padding-right:10px;padding-bottom:10px;
        .p{background: #fff;width: 100%;height: 115px;padding: 10px;color: #ccc;}
        .f{display: flex;justify-content: space-between;line-height: 35px;
          .name{font-size: 16px;color: #333;}
          .status1{font-size: 24px;color: #333;}
          .status2{font-size: 24px;color: #ccc;}
        }
        .proess{padding-top: 12px;}
      }
    }
    .box-item-alarm-echarts,.box-item-topo,.box-item-itcm,.box-item-alarm-list{
      padding: 0 10px 10px;
      >div{background: #ffffff;padding:10px;}
    }
    .box-item-topo{padding-left:0;padding-top:10px;}
    .box-item-itcm{padding-left:0;}

    .alarm-echarts{
      width: 100%;
    }
    .box-item-alarm-list{
      .items{
        border-left: 3px solid #F01920;height: 45px;margin-bottom: 24px;padding-left:12px;line-height: 22px;
        display: flex; justify-content: space-between;
        .time{font-size: 12px;color: #999;}
        .icon-ops{position: relative;padding:0 10px;
          .i{cursor: pointer;}
          .i:hover{color: #0145AB;}
          .btn-ops-ground{display: none;position: absolute;right: 98%;top: -5px;cursor: pointer;border: 1px solid #F0F3FA;width: 60px;text-align: center;
            >div{border-bottom: 1px solid #F0F3FA;padding:3px 0}
            >div:last-child{border-bottom: 0;}
          }
        }
        .icon-ops:hover{
          .btn-ops-ground{display: block;}
        }
      }
    }
  }
}
</style>
