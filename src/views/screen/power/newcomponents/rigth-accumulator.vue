<template>
  <div class="container-RigthAccumulator" :style="{ 'height': paneHeight + 'px' }">
    <div class="com_title ">
      <span class="span_left">蓄电池</span>
      <span class="span_right sel_data">
        <a v-for="(itemU ,index) in unitList " :key="index" :class=" index === selectUnitIndex ? 'a_on': '' " @click="onChangeUnit(itemU,index)">
          {{ itemU.lable }}
        </a>
      </span>
    </div>
    <div class="tabbox m_t15">
      <i class="onturnleft el-icon-arrow-left" @click="onScroll('left')" />
      <div ref="scrollBox" class="tab_head">
        <div v-for="(item,index) in switchBoardRoomList" :key="index" class="batteryitem" @click="onChangeBatteryGroup(item,index)">
          <a :title="item.hyAlias" :class="index === selectBatteryIndex ? 'hover':''">{{ item.hyAlias }}</a>
        </div>
        <a v-if="switchBoardRoomList.length <= 0" title="暂无设备数据">暂无设备数据</a>
      </div>
      <i class="onturnrigth el-icon-arrow-right" @click="onScroll('right')" />
    </div>
    <RigthAccumulatorEcharts ref="AccumulatorEcharts" style="height:100%;" />
  </div>
</template>

<script>
import api from '@/api/api'
import request from '@/utils/request'
import RigthAccumulatorEcharts from './rigth-accumulator-echarts'

export default {
  name: 'RigthAccumulator',
  components: {
    RigthAccumulatorEcharts
  },
  data() {
    return {
      paneHeight: '',
      DeviceNum: 0,
      selectUnitIndex: 0,
      selectBatteryIndex: 0,
      switchBoardRoomList: [],
      voltageArr: [],
      resistanceArr: [],
      temperatureArr: [],
      unitList: [
        {value: 0, lable: '电压' },
        {value: 1, lable: '内阻' },
        {value: 2, lable: '温度' }
      ]
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
    setSize() {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      this.paneHeight = ((windowHeight - 150) / 100) * 30
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
    // 选择电压|电刘|温度
    onChangeUnit(items, index) {
      this.selectUnitIndex = index
      this.onSelectUnit()
    },
    // 选择电池组
    async onChangeBatteryGroup(items, index) {
      this.selectBatteryIndex = index
      this.getDeviceValue(items)
    },
    // 获取蓄电池组设备属性
    async getDeviceValue(params) {
      let hyType = []
      const attributeArr = await this.findHyitDeviceValue(params.hyDeviceId)
      if (attributeArr.length > 0) {
        for (let i = 0; i < attributeArr.length; i++) {
          const element = attributeArr[i]
          hyType.push(element.hyType)
        }
      }

      const ids = Array.from(...[new Set(hyType)]).sort()
      const deviceValues = attributeArr
      const valueTypes = await this.findHyitValueType(ids)
      const {voltageArr, resistanceArr, temperatureArr} = this.reduceNum(deviceValues, valueTypes)
      this.voltageArr = voltageArr
      this.resistanceArr = resistanceArr
      this.temperatureArr = temperatureArr
      this.onSelectUnit(voltageArr, resistanceArr, temperatureArr)
    },
    // 判断是选择电压|电阻|电流
    onSelectUnit(voltageArr, resistanceArr, temperatureArr) {
      let yAxisData = []
      const selectLabe = this.unitList[ this.selectUnitIndex ].lable
      if (selectLabe === '电压') {
        yAxisData = voltageArr || this.voltageArr
      }
      if (selectLabe === '内阻') {
        yAxisData = resistanceArr || this.resistanceArr
      }
      if (selectLabe === '温度') {
        yAxisData = temperatureArr || this.temperatureArr
      }
      this.$refs.AccumulatorEcharts.openFind(yAxisData, selectLabe)
    },
    // 获取蓄电池
    async findHyitDevice(params) {
      const requestLsit = {
        hyDevTypeValue: 10058,
        hyAreaId: params?.hyAreaId,
        limit: -1
      }
      let { code, data } = await request({ url: api.powerEnv.findHyitDevice, data: { ...requestLsit } })
      if (code !== 1) return
      if (data.length > 0) {
        this.switchBoardRoomList = data
        this.DeviceNum = Number(data.length)
        this.getDeviceValue(data[0])
      }
      return data
    },
    // 获取设备属性
    async findHyitDeviceValue(hyDeviceId) {
      let { code, data } = await request({ url: api.powerEnv.findHyitDeviceValue, data: { limit: -1, hyDeviceId } })
      if (code !== 1) return
      return data
    },
    // 获取设备状态值
    async findHyitValueType(hyType) {
      let { code, data } = await request({ url: api.powerEnv.findHyitValueType, data: { limit: -1, ids: hyType } })
      if (code !== 1) return
      return data
    },
    // 获取电压|电阻|温度
    reduceNum(deviceValues, valueTypes) {
      let voltageArr = []
      let resistanceArr = []
      let temperatureArr = []
      for (let k = 0; k < deviceValues.length; k++) {
        const deviceValue = deviceValues[k]
        for (let j = 0; j < valueTypes.length; j++) {
          const valueType = valueTypes[j]
          if ((valueType['hyTypeId'] === deviceValue['hyType'])) {
            const str = deviceValue[this.$tool.humpStr(valueType['hyFieldName'])]

            if (deviceValue['hyDes'].indexOf('电压') !== -1 && str > 0) {
              voltageArr.push(str)
            }
            if (deviceValue['hyDes'].indexOf('内阻') !== -1 && str > 0) {
              resistanceArr.push(str)
            }
            if (deviceValue['hyDes'].indexOf('温度') !== -1) {
              temperatureArr.push(str)
            }
          }
        }
      }
      return { voltageArr, resistanceArr, temperatureArr}
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/views/screen/power/componentallstyle/rigth-accumulator.scss';
</style>
