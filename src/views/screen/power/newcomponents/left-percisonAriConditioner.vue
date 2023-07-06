<template>
  <div class="container-percisonAri" :style="{ 'height': paneHeight + 'px' }">
    <div class="com_title">
      <span class="span_left">精密空调</span>
    </div>
    <div class="tabbox m_t15">
      <i class="onturnleft el-icon-arrow-left" @click="onScroll('left')" />
      <div ref="scrollBox" class="tab_head">
        <div v-for="(itema,index) in airPatternData" :key="index" class="airitem" @click="onchangeAir(itema,index)">
          <a :title="itema.hyDeviceName" :class="index === selecAirlindex ? 'hover':''">{{ itema.hyDeviceName }}</a>
        </div>
        <a v-if="airPatternData.length <= 0" title="暂无设备">暂无设备</a>
      </div>
      <i class="onturnrigth el-icon-arrow-right" @click="onScroll('right')" />
    </div>

    <div class="air_pattern">
      <ul>
        <!-- 给空调模式 选择: class="onhover" 无该模式：class="btn_no" -->
        <li v-for="(item,index) in airPatternList" :key="index" :class="item.isHave ? ( item.isOff ? 'onhover' : '') : 'btn_no'">
          <div class="item-pattern" @click="onChengeModle(item,index)">
            <em :class="item.icon" />
            <p style="margin:6px 0;">{{ item.name }}</p>
          </div>
        </li>
      </ul>
    </div>
    <LefHumitureEcharts ref="lefHumitureEchartsRef" />
  </div>
</template>

<script>
import api from '@/api/api'
import request from '@/utils/request'
import LefHumitureEcharts from './left-humiture-echarts.vue'

export default {
  name: 'LefPercisonAriConditioner',
  components: {
    LefHumitureEcharts
  },
  data() {
    return {
      paneHeight: '',
      DeviceNum: 0,
      selecAirlindex: 0,
      itemPercentagTagWidth: '',
      DeviceValueList: [],
      airPatternData: [],
      airPatternList: [
        { val: 0, isHave: false, isOff: false, name: '制冷', label: 'cold', icon: 'ico_cold'},
        { val: 1, isHave: false, isOff: false, name: '加热', label: 'hot', icon: 'ico_hot'},
        { val: 2, isHave: false, isOff: false, name: '送风', label: 'air', icon: 'ico_air'},
        { val: 3, isHave: false, isOff: false, name: '加湿', label: 'addwet', icon: 'ico_addwet'},
        { val: 4, isHave: false, isOff: false, name: '除湿', label: 'delwet', icon: 'ico_delwet'}
      ],
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
    openFind(arg) {
      this.findHyitDevice(arg)
    },
    // 设置相关尺寸
    setSize() {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      this.paneHeight = ((windowHeight - 150) / 100) * 44
    },
    // 左右滑动事件
    onScroll(type) {
      const num = this.DeviceNum
      const scrollWidth = this.$refs.scrollBox.clientWidth
      if (type === 'left') {
        this.$refs.scrollBox.scrollLeft -= (scrollWidth / num) + 20 || 100
      }
      if (type === 'right') {
        this.$refs.scrollBox.scrollLeft += (scrollWidth / num) + 20 || 100
      }
    },
    // 获取精密空调 | 10060
    async findHyitDevice(params) {
      const requestLsit = {
        hyDevTypeValue: 10060,
        hyAreaId: params?.hyAreaId,
        limit: -1
      }
      let { code, data } = await request({ url: api.powerEnv.findHyitDevice, data: { ...requestLsit } })
      if (code !== 1) return
      this.airPatternData = data
      this.DeviceNum = Number(data.length)

      if (data.length > 0) { // 默认选择
        const hyVidData = await this.findHyitDeviceValue(data[0].hyDeviceId)
        const HyVid = await this.getHyVid(hyVidData)
        this.$refs.lefHumitureEchartsRef.openInitFind(HyVid)
        await this.getshowDayDeviceValueNumber(HyVid)
      }
      return data
    },
    // 选择空调
    async onchangeAir(items, index) {
      this.selecAirlindex = index
      const hyVidData = await this.findHyitDeviceValue(items.hyDeviceId)
      const HyVid = await this.getHyVid(hyVidData)
      this.$refs.lefHumitureEchartsRef.openInitFind(HyVid)
      await this.getshowDayDeviceValueNumber(HyVid)
    },
    // 获取设备属性ID
    async getHyVid(hyVidData) {
      let humidityHyVid = null
      let temperatureHyVid = null
      const deviceArr = hyVidData
      if (deviceArr.length > 0) {
        for (let item = 0; item < deviceArr.length; item++) {
          const element = deviceArr[item]
          if (element['hyDes'].indexOf('温度') !== -1) {
            temperatureHyVid = element['hyVid']
          }
          if (element['hyDes'].indexOf('湿度') !== -1) {
            humidityHyVid = element['hyVid']
          }
        }
      }
      return {temperatureHyVid, humidityHyVid }
    },
    // 空调模式开关|设备属性：hyType:6 可下达指令
    async onChengeModle(item, index) {
      this.airPatternList[index].isOff = !item.isOff
      const nowhyVal = this.airPatternList[index].isOff ? 0 : 1 // 0启动
      const data = await this.hyItAgentSubsystem(item)

      if (data.length > 0 && this.isHave) {
        let agentId = data[0]?.agentId ? data[0].agentId : null
        if (item.hyType === 6) {
          const code = await this.setValHyitDevice(item, agentId, nowhyVal)
          if (code !== 1) {
            this.airPatternList[index].isOff = !item.isOff
          }
        }
      } else {
        this.airPatternList[index].isOff = !item.isOff
        this.$message({message: '无设备权限', type: 'warning'})
      }
    },

    // 获取某台空调温湿度|功能[制冷|送风]
    async findHyitDeviceValue(hyDeviceId) {
      const requestLsit = {
        limit: -1, hyDeviceId
      }
      let { code, data } = await request({ url: api.powerEnv.findHyitDeviceValue, data: { ...requestLsit } })
      if (code !== 1) return
      let hyType = []
      const temperatureList = []
      const humidityList = []
      if (data.length > 0) {
        data.forEach(item => {
          hyType.push(item.hyType)
        })
      }

      // 判断知否拥有指定功能&&启动状态
      this.getEableState(data)

      // 获取空调温湿度
      const ids = Array.from(...[new Set(hyType)]).sort()
      const deviceValues = data
      const valueTypes = await this.findHyitValueType(ids)

      let { temperature, humidity } = this.reduceNum(deviceValues, valueTypes)
      temperatureList.push(...temperature)
      humidityList.push(...humidity)

      // 空调目前温湿度
      if (temperatureList.length > 0 || humidityList.length > 0) {
        this.$EventBus.$emit('broAirDeviceList', {
          nowTemperature: temperatureList,
          nowhumidity: humidityList
        })
      }
      this.DeviceValueList = data
      return data
    },
    // 获取设备类型数据
    async findHyitValueType(hyType) {
      let { code, data } = await request({ url: api.powerEnv.findHyitValueType, data: { limit: -1, ids: hyType } })
      if (code !== 1) return
      return data
    },
    // 空调启动状态
    async getEableState(data) {
      const airPatternArr = this.airPatternList
      for (let item = 0; item < data.length; item++) {
        const nowData = data[item]

        for (let itemF = 0; itemF < airPatternArr.length; itemF++) {
          const element = airPatternArr[itemF]
          if (element.name === nowData['hyDes']) {
            const offStatus = await this.findHyitDeviceValueMappings(nowData.hyVal, nowData.hyVid)
            if (offStatus.length > 0) { // 空调模式启动状态
              offStatus.map(itemS => {
                if (itemS['hyValName'].includes('正常')) {
                  this.$set(element, 'isOff', true)
                }
                if (itemS['hyValName'].includes('关闭')) {
                  this.$set(element, 'isOff', false)
                }
              })
            }
            this.$set(element, 'isHave', true)
            this.$set(element, 'hyType', nowData['hyType'])
            this.$set(element, 'hyVid', nowData['hyVid'])
            this.$set(element, 'hySbId', nowData['hySbId'])
            this.$set(element, 'hyHostId', nowData['hyHostId'])
            this.$set(element, 'hyDeviceId', nowData['hyDeviceId'])
          }
        }
      }
    },
    // 启动状态查询
    async findHyitDeviceValueMappings(hyVal, hyVid) {
      let {code, data} = await request({ url: api.powerEnv.findHyitDeviceValueMappings, data: { hyVid, hyVal } })
      if (code !== 1) return
      return data
    },
    // 空调模式更新
    async setValHyitDevice(params, agentId, nowhyVal) {
      let {code} = await request({
        url: api.powerEnv.setVal,
        data: {
          agentId,
          value: nowhyVal, // 设备属性值
          sbId: params.hySbId,
          dhVid: params.hyVid,
          deviceId: params.hyDeviceId
        }
      })
      if (code !== 1) return
      return code
    },
    // 子系统对应网关
    async hyItAgentSubsystem(params) {
      let {code, data} = await request({
        url: api.powerEnv.findHyitAgentSubsystem,
        data: { sbId: params.hySbId }
      })
      if (code !== 1) return
      return data
    },
    // 统计温度湿度|(设备数据,类型数据)
    reduceNum(deviceValues, valueTypes) {
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
            if (deviceValue['hyDes'].indexOf('湿度') !== -1 && str > 0) {
              humidity.push(str)
            }
          }
        }
      }
      return { temperature, humidity }
    },
    // 获取某台空调当天均温湿
    async getshowDayDeviceValueNumber(params) {
      let temperatureData = await this.showDayDeviceValueNumber(params.temperatureHyVid)
      let humidityData = await this.showDayDeviceValueNumber(params.humidityHyVid)
      if (temperatureData?.numberList || humidityData?.numberList) {
        const meanParams = {
          temperatureData: temperatureData.numberList,
          humidityData: humidityData.numberList
        }
        this.$EventBus.$emit('meanParamsList', meanParams)
      }
    },
    // 获取某台空调当天的温湿度
    async showDayDeviceValueNumber(hyVid) {
      const { Y, M, D } = this.$tool.getNowDate('object')
      const time = `${Y}-${M}-${D}`
      let { code, map } = await request({ url: api.powerEnv.showDayDeviceValueNumber, data: { limit: -1, vid: hyVid, time} })
      if (code !== 1) return
      return map
    }

  }
}
</script>

<style lang="scss" scoped>
@import '@/views/screen/power/componentallstyle/left-precisionAirConditioner.scss';
</style>

