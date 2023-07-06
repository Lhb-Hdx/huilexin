<template>
  <dv-border-box-12 :color="['#1A728B']">
    <div class="device-aver">
      <h3 class="device-aver-title">机房平均温度</h3>
      <div class="aver-box mt-40 flex">
        <div class="box-content flex mr-50">
          <div class="box-content-left flex-center">
            <img src="image/dashboard/power/ico_wd.png" alt="">
          </div>
          <div class="box-content-right ml-20">
            <h3>平均温度</h3>
            <div class="right-num mt-10 font-weight">{{ temperatureInfo.average }}°</div>
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
          <div class="box-content-left flex-center">
            <img src="image/dashboard/power/ico_sd.png" alt="">
          </div>
          <div class="box-content-right ml-20">
            <h3>平均湿度</h3>
            <div class="right-num wd mt-10 font-weight">{{ humidityInfo.average }}<span class="font-12">%</span> </div>
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
  </dv-border-box-12>
</template>
<script>
import request from '@/utils/request'
import api from '@/api/api'

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
        const deviceValues = await this.findHyitDeviceValue(item.hyDeviceId)
        let { temperature, humidity } = this.reduceNum(deviceValues, valueTypes)
        temperatureList.push(...temperature)
        humidityList.push(...humidity)
      }
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
            if (deviceValue['hyDes'].indexOf('温度') !== -1) {
              temperature.push(str)
            }
            if (deviceValue['hyDes'].indexOf('湿度') !== -1) {
              humidity.push(str)
            }
          }
        }
      }
      return { temperature, humidity }
    }
  }
}
</script>

<style lang="scss" scoped>
 .device-aver{
  padding: 20px;
  box-sizing: border-box;
  .device-aver-title{
  color: #EFEFEF;
    position: relative;
    &:after{
      content: '';
      position: absolute;
      bottom: -15px;
      left: 0;
      width: 50px;
      height: 4px;
      background-color: #EFEFEF;
     }
  }
  .box-content{
    flex-basis: 50%;
  }
  .box-content-left{
    img{
      width: 40px;
    }
  }
  .box-content-right{
    flex:1;
    .el-divider{
      background-color:#666;
      margin: 10px 0;
  }
    h3{
      color: #EFEFEF;
      //font-size: 18px;
      font-size: 12px;
    }
    .right-num{
      color: red;
      font-size: 16px;
    }
    .wd{
      color: green;
    }
    .right-maxmin{
      color: #999;
    }
    .right-maxmin-num{
    color: #EFEFEF;
      font-size: 16px;
  }
  }
}
</style>
