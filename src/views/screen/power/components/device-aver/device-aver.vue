<template>
  <!--  <dv-border-box-12 :color="['#1A728B']">-->
  <div class="device-aver">
    <h3 class="device-aver-title">机房平均温度</h3>
    <div class="aver-box mt-30 flex">
      <div class="box-content flex mr-20">
        <div class="box-content-left wd flex-center">
          <div class="content-left-value">
            <div :style="{height:temperatureInfo.average+'%'}" class="content-left-value-value" />
          </div>
        </div>
        <div class="box-content-right ml-10">
          <h3>平均温度</h3>
          <div class="right-num mt-10">{{ temperatureInfo.average }}°</div>
          <el-divider />
          <div class="flex-v-between">
            <div class="">
              <div class="right-maxmin ">今日最高</div>
              <div class="right-maxmin-num mt-10">{{ temperatureInfo.max }}°</div>
            </div>
            <div class="">
              <div class="right-maxmin ">今日最低</div>
              <div class="right-maxmin-num mt-10">{{ temperatureInfo.min }}°</div>
            </div>
          </div>

        </div>
      </div>
      <div class="box-content flex">
        <div class="box-content-left sd flex-center">
          <div id="chart" ref="chart" />
          <!--          <img alt="" src="image/dashboard/power/ico_sd.png">-->
        </div>
        <div class="box-content-right ml-10">
          <h3>平均湿度</h3>
          <div class="right-num wd mt-10 ">{{ humidityInfo.average }}<span class="font-12">%</span> </div>
          <el-divider />
          <div class="flex-v-between">
            <div class="">
              <div class="right-maxmin">今日最高</div>
              <div class="right-maxmin-num mt-10">{{ humidityInfo.max }}<span class="font-12">%</span></div>
            </div>
            <div class="">
              <div class="right-maxmin ">今日最低</div>
              <div class="right-maxmin-num mt-10">{{ humidityInfo.min }}<span class="font-12">%</span></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
<!--  </dv-border-box-12>-->
</template>
<script>
import request from '@/utils/request'
import api from '@/api/api'
import * as echarts from 'echarts'
import 'echarts-liquidfill'
export default {
  name: 'DeviceAver',
  data() {
    return {
      temperatureInfo: {
        average: 0,
        max: 0,
        min: 0
      },
      humidityInfo: {
        average: 0,
        max: 0,
        min: 0
      }
    }
  },
  created() {
    this.findHyitDevice()
    this.findHyitDeviceValue()
    this.findHyitValueType()
  },
  methods: {
    async findHyitDeviceValue(hyDeviceId) {
      let { code, data } = await request({
        url: api.powerEnv.findHyitDeviceValue,
        data: { limit: -1, hyDeviceId }
      })
      if (code !== 1) return
      return data
    },
    // 获取设备类型数据
    async findHyitValueType(hyType) {
      let { code, data } = await request({
        url: api.powerEnv.findHyitValueType,
        data: { limit: -1, ids: hyType }
      })
      if (code !== 1) return
      return data
    },
    async findHyitDevice(hyDevTypeValue = 1000) {
      let { code, data } = await request({
        url: api.powerEnv.findHyitDevice,
        data: { hyDevTypeValue }
      })
      if (code !== 1) return
      const valueTypes = await this.findHyitValueType()
      let temperatureList = []
      let humidityList = []
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        if (![206, 192, 183, 182, 181, 180, 179, 178].includes(item['hyDeviceId'])) continue
        const deviceValues = await this.findHyitDeviceValue(item.hyDeviceId)
        let { temperature, humidity } = this.reduceNum(deviceValues, valueTypes)
        temperatureList.push(...temperature)
        humidityList.push(...humidity)
      }

      console.log('findHyitDeviceValue', valueTypes)
      this.temperatureInfo = {
        average: (temperatureList.reduce((prev, next) => prev + next) / temperatureList.length).toFixed(2),
        max: Math.max(...temperatureList).toFixed(2),
        min: Math.min(...temperatureList).toFixed(2)
      }
      this.humidityInfo = {
        average: (humidityList.reduce((prev, next) => prev + next) / humidityList.length).toFixed(2),
        max: Math.max(...humidityList).toFixed(2),
        min: Math.min(...humidityList).toFixed(2)
      }
      this.ionViewDidEnter(this.humidityInfo.average / 100)
    },
    reduceNum(deviceValues, valueTypes, type) {
      let temperature = []
      let humidity = []
      for (let k = 0; k < deviceValues.length; k++) {
        const deviceValue = deviceValues[k]
        for (let j = 0; j < valueTypes.length; j++) {
          const valueType = valueTypes[j]
          if ((valueType['hyTypeId'] === deviceValue['hyType'])) {
            const str = deviceValue[this.$tool.humpStr(valueType['hyFieldName'])]
            if (deviceValue['hyDes'].indexOf('温度') !== -1 && str > 0) {
              temperature.push(str)
            }
            if (deviceValue['hyDes'].indexOf('湿度') !== -1 && str > 0) {
              humidity.push(str)
            }
          }
        }
      }
      return { temperature, humidity }
    },
    ionViewDidEnter(num) {
      num = +num.toFixed(2)
      console.log('num', num)
      var ec = echarts.init(this.$refs.chart)
      ec.setOption({
        series: [{
          type: 'liquidFill',
          label: {
            show: false
          },
          center: ['49%', '60%'],
          radius: '100%',
          backgroundStyle: {
            color: '#030E27'
          },
          outline: {
            show: true,
            borderDistance: 0,
            itemStyle: {
              color: 'rgba(255,0,0,0.1)',
              borderColor: 'none',
              borderWidth: 1,
              shadowBlur: 0,
              shadowColor: 'rgba(0, 0, 0, 0.25)'
            }
          },
          data: [num || 0.5],
          color: ['#00b285']
        }]
      })
    }
  }
}
</script>

<style lang="scss" scoped>
 .device-aver{
  padding: 20px 30px;
  box-sizing: border-box;
   margin-bottom:30px;
  .device-aver-title{
  color: #9EE6FF;
    position: relative;
    &:after{
      content: '';
      position: absolute;
      bottom: -15px;
      left: 0;
      width: 50px;
      height: 3px;
      background-color: #9EE6FF;
     }
  }
  .box-content{
    flex-basis: 50%;
  }
  .box-content-left{
    position: relative;
    &.wd{
    width: 50px;
    height:80px;
    margin: auto 0;
      background: url(data:image/png;base64,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);
      background-size: 91% 80px !important;
    }
    &.sd{
      width:50px;
      height:80px;
      margin: auto 0;
      background: url(data:image/png;base64,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);
      background-size: 99% 70px !important;
      position: relative;
      #chart{
        position: absolute;
        bottom: 6px;
        left:6px;
        width: 75%;
        height: 75%;
      }
    }
    &.wd,&.sd{
      background-size: 100% 80px;
      background-position: center center;
      background-repeat: no-repeat !important;
    }
    .content-left-value{
      position: absolute;
      left: -2px;
      right: 0;
      bottom: 26px;
      //background:blue;
      margin: 0 auto;
      width: 9px;
      height:47px;
      border-radius: 10px 10px 0 0;
      .content-left-value-value{
       position: absolute;
        bottom: 0;
        width: 100%;
        background-color: #FF4D4D;
      }
    }
  }
  .box-content-right{
    flex:1;
    .el-divider{
      background-color:#666;
      margin: 10px 0 15px;
  }
    h3{
      color: var(--power-srceen-text-color);
      //font-size: 18px;
      font-size: 12px;
    }
    .right-num{
      color: #ff4c4c;
      font-size: 26px;
      font-weight: 500;
    }
    .wd{
      color: #00b285;
    }
    .right-maxmin{
      color: #999;
      font-size: 12px;
    }
    .right-maxmin-num{
    color: var(--power-srceen-text-color);
      font-size: 12px;
  }
  }
}
</style>
