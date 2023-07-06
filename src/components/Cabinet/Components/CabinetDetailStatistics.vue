<template>
  <div class="cabinet-item-config">
    <div class="title">{{ cabinet.name }}</div>
    <div class="config-main">
      <div class="echart-box">
        <div id="uUseEcharts" ref="uUseEcharts" style="height: 220px" />
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'CabinetItemConfig',
  data() {
    return {
      cabinet: {},
      cabinetItem: {}
    }
  },
  mounted() {
    // 监听获取机柜数据
    this.$EventBus.$on('get-cabinet', (res) => {
      this.cabinet = this.$tool.deepCopy(res)
    })
    // 监听获取机柜设备数据
    this.$EventBus.$on('get-cabinet-item', (res) => {
      this.cabinetItem = this.$tool.deepCopy(res)
      this.setCabinetItemEcharts()
    })
  },
  methods: {
    // 设置U位使用情况统计图
    setCabinetItemEcharts() {
      if (!this.$refs['uUseEcharts']) return
      let useCount = 0
      this.cabinetItem.forEach(item => {
        useCount += item.itemSize
      })
      const self = this
      const chartsObj = echarts.init(self.$refs['uUseEcharts'])
      const option = {
        color: ['#5b71bd', '#9bc983'],
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
            data: [
              { value: this.cabinet.capacity - useCount, name: '可用' },
              { value: useCount, name: '已用' }
            ]
          }
        ]
      }
      chartsObj.setOption(option, true)
    }
  }
}
</script>

<style lang="scss" scoped>
.cabinet-item-config {
    padding: 10px;
    background: #fff;
    height: 100%;
    .title {
        font-size: 16px;
        font-weight: bold;
    }
    .config-main {
        margin-top: 20px;
        .config-main-item {
            padding-bottom: 10px;
            .main-item-label {
                font-size: 14px;
                padding-bottom: 10px;
                display: inline-block;
                width: 20%;
            }
            .main-item-label-btn {
                width: 100% !important;
                display: flex !important;
                align-items: center;
                justify-content: space-between;
            }
            .main-item-value {
                display: inline-block;
                width: 80%;
            }
            .main-item-list {
              .item {
                margin: 10px 0;
                border: 1px solid transparent;
                border-radius: 5px;
                padding: 10px;
                img {
                  width: 100%;
                }
                .footer {
                  padding: 10px 0 0 0;
                  display: flex;
                  align-items: center;
                  .name {
                    width: 60%;
                  }
                  .btns {
                    width: 40%;
                    text-align: right;
                  }
                }
              }
              .active {
                border: 1px solid #0145ab;
                color: #0145ab;
              }
            }
        }
    }
}
</style>
