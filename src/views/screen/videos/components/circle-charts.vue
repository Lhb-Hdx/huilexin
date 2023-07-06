<!--  -->
<template>
  <div class="circle-charts-container">
    <div id="circle-charts" ref="circleCharts" class="circle-charts" style="width: 90%; height: 90%" />
    <div class="total">设备总数：{{ totalDevice || 0 }}</div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  components: {},
  props: {
    // percentData: {
    //   type: Number,
    //   default() {
    //     return {}
    //   }
    // }
  },
  data() {
    return {
      echartObj: '',
      totalDevice: 0,
      DvrInterval: ''
    }
  },
  computed: {},
  watch: {
    // percentData: {
    //   handler: function(now) {
    //     this.initEchart(now)
    //   },
    //   deep: true
    // }
  },
  created() {},
  destroyed() {
    clearInterval(this.DvrInterval)
  },
  mounted() {
    this.getVideoDvrDetail()
    // this.DvrInterval = setInterval(() => {
    //   this.getVideoDvrDetail()
    // }, 8000)
    this.initEchart()
  },
  methods: {
    async getVideoDvrDetail() {
      // 获取在线离线
      const { code, model } = await this.$request({
        url: this.api.video.getVideoDvrDetail,
        data: {}
      })
      if (code === 1) {
        let onlinePercent
        if (model) {
          onlinePercent = Number(((model.onlineCount / model.deviceCount) * 100).toFixed(2))
          this.totalDevice = model.deviceCount
        } else {
          onlinePercent = 0
        }
        this.initEchart(onlinePercent)
        // const onlineData = [
        //   { value: res.model.onlineCount, name: '在线设备' },
        //   { value: res.model.offlineCount, name: '离线设备' }
        // ]
        // this.getOnline(onlineData)
        // this.config = Object.assign({}, { number: res.model.deviceCount, ...this.config })
        // this.config.number.splice(0, 1, res.model.deviceCount)
        // this.config = { ...this.config, number: [model.deviceCount] }
        // this.onlineCount = model.onlineCount
        // this.offlineCount = model.offlineCount
        // this.deviceCount = model.deviceCount
      }
    },
    initEchart(now) {
      console.log(now)
      // var valdata = [100]
      // let angle = 0 // 角度，用来做简单的动画效果的
      let value = now || '' // 图上角度数据
      const option = {
        backgroundColor: 'transparent',
        title: {
          text: '{a|在线率} ',
          subtext: '{a|' + value + '}{c|%}',
          x: 'center',
          y: '40px',
          subtextStyle: {
            rich: {
              a: {
                fontSize: '28',
                color: '#1BD9FB',
                fontWeight: 'bold'
              },
              c: {
                fontSize: 14,
                color: '#ffffff',
                fontWeight: 'normal'
              }
            }
          },
          textStyle: {
            rich: {
              a: {
                fontSize: 14,
                color: '#ffffff'
              }
            }
          }
        },
        series: [
          // 外环
          {
            name: '',
            type: 'pie',
            radius: ['95%', '90%'],
            silent: true,
            clockwise: true,
            startAngle: 90,
            z: 0,
            zlevel: 0,
            label: {
              normal: {
                position: 'center'
              }
            },
            data: [
              {
                value: value,
                name: '',
                itemStyle: {
                  normal: {
                    // 外环发光
                    borderWidth: 0.5,
                    shadowBlur: 2,
                    borderColor: '#4bf3f9',
                    shadowColor: '#9bfeff',
                    color: {
                      // 圆环的颜色
                      colorStops: [
                        {
                          offset: 0,
                          color: '#4bf3f9' // 0% 处的颜色
                        },
                        {
                          offset: 1,
                          color: '#4bf3f9' // 100% 处的颜色
                        }
                      ]
                    }
                  }
                }
              },
              {
                value: 100 - value,
                name: '',
                label: {
                  normal: {
                    show: false
                  }
                },
                itemStyle: {
                  normal: {
                    color: '#173164'
                  }
                }
              }
            ]
          }
        ]
      }

      // if (this.echartObj != null && this.echartObj !== '' && this.echartObj !== undefined) {
      //   this.echartObj.dispose()// 销毁
      // }

      this.echartObj = echarts.init(this.$refs.circleCharts)
      this.echartObj.setOption(option, true)
    }
  }
}
</script>
<style lang="scss" scoped>
.circle-charts-container {
  .total {
    margin: 10px 0 0 0;
    text-align: center;
  }
}
</style>
