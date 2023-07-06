<template>
  <div class="container-rigth-inAndout" :style="{ 'height': paneHeight + 'px' }">
    <div class="inAndout">
      <div class="com_title">
        <span class="span_left">出入记录</span>
        <span class="span_right sel_data ">
          <a v-for="(item ,index) in DayList " :key="index" :class=" index === selectDaysIndex ? 'a_on': '' " @click="onChangeDays(item,index)">
            {{ item.lable }}
          </a>
        </span>
      </div>
      <div class="m_t15">
        <div class="tab_head">
          <em class="line" />
          <div v-for="(itemr,index) in list" :key="index" class="devicRoomitem" @click="onChangeRoomType(itemr,index)">
            <a :title="itemr.name" :class="index === selectRoomIndex ? 'hover':''">{{ itemr.name }}</a>
          </div>
        </div>
      </div>
      <RigthinAndoutLogEcharts ref="inAndoutRefs" />
    </div>
  </div>
</template>

<script>
import RigthinAndoutLogEcharts from './rigth-inAndoutLog-echarts'

export default {
  name: 'RigthinAndoutLog',
  components: {
    RigthinAndoutLogEcharts
  },
  data() {
    return {
      paneHeight: '',
      typeIndex: 0,
      hyDeviceId: 215,
      selectDaysIndex: 0,
      selectRoomIndex: 0,
      dataTime: '',
      list: [{ name: '机房前门监控入口', hyDeviceId: 215 }, { name: '机房后门监控入口', hyDeviceId: 193 }],
      DayList: [
        {value: 0, lable: '今天' },
        {value: 1, lable: '昨天' },
        {value: 2, lable: '前天' }
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
    setSize() {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      this.paneHeight = ((windowHeight - 150) / 100) * 35
    },
    // 选择今天|昨天|前天
    onChangeDays(items, index) {
      this.selectDaysIndex = index
      const day1 = new Date()
      let dateTime = ''

      if (index === 0) {
        dateTime = day1.getFullYear() + '-' + (day1.getMonth() + 1) + '-' + day1.getDate()
      }
      // 昨天的时间
      if (index === 1) {
        day1.setDate(day1.getDate() - 1)
        dateTime = day1.getFullYear() + '-' + (day1.getMonth() + 1) + '-' + day1.getDate()
      }
      // 前天的时间
      if (index === 2) {
        const day2 = new Date()
        day2.setDate(day2.getDate() - 2)
        dateTime = day2.getFullYear() + '-' + (day2.getMonth() + 1) + '-' + day2.getDate()
      }
      this.dataTime = dateTime
      this.goToEchart()
    },
    // 选择出入记录前后门
    async onChangeRoomType(items, index) {
      this.selectRoomIndex = index
      this.hyDeviceId = items.hyDeviceId
      this.typeIndex = index
      this.goToEchart()
    },
    // 初始化数据
    async goToEchart() {
      await this.$refs.inAndoutRefs.openInitFind(this.hyDeviceId, this.typeIndex, this.dataTime)
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/views/screen/power/componentallstyle/rigth-inAndout-log.scss';
</style>

