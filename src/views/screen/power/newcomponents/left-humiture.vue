<template>
  <div class="container-humiture" :style="{ 'height': paneHeight + 'px' }">
    <div class="com_title">
      <span class="span_left">温湿度</span>
    </div>
    <div class="thmain">
      <div ref="percentage" class="thbox">
        <div class="thname">室内平均温度</div>
        <div class="percentage">
          <span v-for="(items, indexs) in onlinePercentageTag" :key="indexs" class="percentage_item" :class="items.statue ? 'indoor-light' : ''" :style="{ 'width': itemPercentagTagWidth + 'px' }" />
        </div>
        <div class="th_text text_color">{{ temperatureInfo.average }} <em>℃</em></div>
        <div class="th_hl">
          <dl>
            <dt>最高温度</dt>
            <dd>{{ temperatureInfo.max }}℃</dd>
          </dl>
          <dl>
            <dt>最低温度</dt>
            <dd>{{ temperatureInfo.min }}℃</dd>
          </dl>
        </div>
      </div>
      <div ref="percentage2" class="thbox">
        <div class="thname">室内平均湿度</div>
        <div class="percentage2">
          <span v-for="(items, indexs) in onlinePercentageTag2" :key="indexs" class="percentage_item2" :class="items.statue ? 'outdoor-light' : ''" :style="{ 'width': itemPercentagTagWidth2 + 'px' }" />
        </div>
        <div class="th_text text_color">{{ humidityInfo.average }} <em>%</em></div>
        <div class="th_hl">
          <dl>
            <dt>最高湿度</dt>
            <dd>{{ humidityInfo.max }}%</dd>
          </dl>
          <dl>
            <dt>最低湿度</dt>
            <dd>{{ humidityInfo.min }}%</dd>
          </dl>
        </div>
      </div>
    </div>
    <div v-if="deviceList.length > 0 " class="temperature_sensor">
      <div v-for="item in deviceList" :key="item.hyDeviceId" class="sensor_item">
        <div class="temp_title">
          <a id="title" :title="item.hyDeviceName">{{ item.hyDeviceName }}</a>
          <!-- <span id="icon">{{ '图标' }}</span> -->
        </div>
        <div class="temp_number">
          <!-- 提示值标准：温度：30 湿度：60 -->
          <span :id="item.temperature > 30 ? 'tempWing' :'temp'">{{ item.temperature }} ℃</span>
          <span :id="item.humidity > 60 ? 'percentWing' :'percent'">{{ item.humidity }}%</span>
        </div>
      </div>
    </div>
    <div v-else class="temperature_sensor">
      <div class="sensor_item">
        <div class="temp_title">
          <a id="title" title="暂无数据">{{ '暂无数据' }}</a>
          <span id="icon">{{ '' }}</span>
        </div>
        <div class="temp_number">
          <span id="temp">{{ '0℃' }}</span>
          <span id="percent">{{ '0%' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api/api'
import request from '@/utils/request'

export default {
  name: 'LeftHumiture',
  components: {

  },
  data() {
    return {
      paneHeight: '',
      deviceList: [],
      onlinePercentageTag: [],
      itemPercentagTagWidth: '',
      onlinePercentageTag2: [],
      itemPercentagTagWidth2: '',
      temperatureInfo: {// 温度
        average: 0,
        max: 0,
        min: 0
      },
      humidityInfo: {// 湿度
        average: 0,
        max: 0,
        min: 0
      }
    }
  },
  created() {
    this.findHyitDeviceValue()
    this.findHyitValueType()
    this.findHyitDevice()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.setSize)
  },
  mounted() {
    this.$nextTick(() => {
      this.setSize()
      window.addEventListener('resize', this.setSize)
    })
  },
  methods: {
    // 设置相关尺寸
    setSize() {
      const deviceTypeListWidth = this.$refs.percentage.clientWidth
      this.itemPercentagTagWidth = (deviceTypeListWidth / 20) - 2
      const deviceTypeListWidth2 = this.$refs.percentage2.clientWidth
      this.itemPercentagTagWidth2 = (deviceTypeListWidth2 / 20) - 2

      const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      this.paneHeight = ((windowHeight - 150) / 100) * 30
    },
    openFind(arg) {
      this.findHyitDeviceValue()
      this.findHyitValueType()
      this.findHyitDevice()
    },

    // 查询机房设备
    async findHyitDevice(hyDevTypeValue = 1000) {
      let { code, data } = await request({ url: api.powerEnv.findHyitDevice, data: { hyDevTypeValue } })
      if (code !== 1) return
      const valueTypes = await this.findHyitValueType()
      let temperatureList = []
      let humidityList = []

      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        const deviceValues = await this.findHyitDeviceValue(item.hyDeviceId)
        let { temperature, humidity, tempList, humList } = this.reduceNum(deviceValues, valueTypes)
        temperatureList.push(...temperature)
        humidityList.push(...humidity)

        // 设备温湿度
        item.humidity = 0
        item.temperature = 0
        if (tempList.length > 0) {
          tempList[0].hyDeviceId === item.hyDeviceId ? item.temperature = tempList[0].temp : item.temperature = 0
        }
        if (humList.length > 0) {
          humList[0].hyDeviceId === item.hyDeviceId ? item.humidity = humList[0].hum : item.humidity = 0
        }
      }

      console.table('查询机房设备@', data)
      this.deviceList = data

      if (temperatureList.length > 0 || humidityList.length > 0) {
        this.getMeanData(temperatureList, humidityList)
        // 温度计算
        this.temperatureInfo = {
          average: (temperatureList.reduce((prev, next) => prev + next) / temperatureList.length).toFixed(2),
          max: Math.max(...temperatureList).toFixed(2),
          min: Math.min(...temperatureList).toFixed(2)
        }
        // 湿度计算
        this.humidityInfo = {
          average: (humidityList.reduce((prev, next) => prev + next) / humidityList.length).toFixed(2),
          max: Math.max(...humidityList).toFixed(2),
          min: Math.min(...humidityList).toFixed(2)
        }
      }
    },
    // 统计温度湿度
    reduceNum(deviceValues, valueTypes, type) {
      let temperature = []
      let humidity = []
      let tempList = []
      let humList = []

      for (let k = 0; k < deviceValues.length; k++) {
        const deviceValue = deviceValues[k]
        for (let j = 0; j < valueTypes.length; j++) {
          const valueType = valueTypes[j]
          if ((valueType['hyTypeId'] === deviceValue['hyType'])) {
            const str = deviceValue[this.$tool.humpStr(valueType['hyFieldName'])]

            if (deviceValue['hyDes'].indexOf('温度') !== -1 && str > 0) {
              temperature.push(str)
              tempList.push({'temp': str, 'hyDeviceId': deviceValue['hyDeviceId']})
              // console.log('设备温度@', deviceValue['hyDeviceId'], tempList, deviceValue[this.$tool.humpStr(valueType['hyFieldName'])], this.$tool.humpStr(valueType['hyFieldName']))
            }
            if (deviceValue['hyDes'].indexOf('湿度') !== -1 && str > 0) {
              humidity.push(str)
              humList.push({'hum': str, 'hyDeviceId': deviceValue['hyDeviceId']})
            }
          }
        }
      }
      return { temperature, humidity, tempList, humList}
    },
    // 温度湿度平均值
    getMeanData(temperatureList, humidityList) {
      temperatureList.forEach(items => {
        const onlonePercentage = this.$tool.percentage(items, temperatureList.reduce((prev, next) => prev + next))
        const lightCount = onlonePercentage / (100 / 20)
        const onlinePercentageTag = []
        for (let i = 0; i < 20; i++) {
          onlinePercentageTag.push({ i: i + 1, statue: i + 1 <= lightCount})
        }
        this.onlinePercentageTag = onlinePercentageTag
      })
      humidityList.forEach(items => {
        const onlonePercentage2 = this.$tool.percentage(items, humidityList.reduce((prev, next) => prev + next))
        const lightCount = onlonePercentage2 / (100 / 20)
        const onlinePercentageTag2 = []
        for (let i = 0; i < 20; i++) {
          onlinePercentageTag2.push({ i: i + 1, statue: i + 1 <= lightCount})
        }
        this.onlinePercentageTag2 = onlinePercentageTag2
      })
    },
    // 查询主机设备属性表
    async findHyitDeviceValue(hyDeviceId) {
      let { code, data } = await request({ url: api.powerEnv.findHyitDeviceValue, data: { limit: -1, hyDeviceId } })
      if (code !== 1) return
      return data
    },
    // 获取设备类型数据
    async findHyitValueType(hyType) {
      let { code, data } = await request({ url: api.powerEnv.findHyitValueType, data: { limit: -1, ids: hyType } })
      if (code !== 1) return
      return data
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/views/screen/power/componentallstyle/left-humiture.scss';
</style>

