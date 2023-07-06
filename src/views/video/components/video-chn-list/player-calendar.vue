<template>
  <div ref="hyCalendar" class="hyCalendarWrp">
    <div class="hyCalendarHead">
      <i class="el-icon-arrow-left" @click="prevMonth" />
      <div>{{ year }}-{{ month }}</div>
      <i class="el-icon-arrow-right" @click="nextMonth" />
    </div>
    <div class="hyCalendar">
      <div v-for="item in week" :key="item.index" :style="{width:width+'px',height:width+'px','line-height':width+'px'}">{{ item }}</div>
      <div v-for="(item,index) in calendar" :key="index" :style="{width:width+'px',height:width+'px','line-height':width+'px'}" class="calendar-day" @click="onClickDay(item)">
        <div>
          <div :class="item.isToday ? 'active' : 0">{{ item.date }}</div>
        </div>
        <div class="point">
          <div v-for="item2 in videoData" :key="item2.date+'video'">
            <div v-if="(item2.date.toString() === (item.year.toString()+item.month.toString()+item.date.toString())) && item2.num > 0" class="video" />
          </div>
          <div v-for="item2 in videoData" :key="item2.date+'alarm'">
            <div v-if="(item2.date.toString() === (item.year.toString()+item.month.toString()+item.date.toString())) && item2.alarm > 0" class="alarm" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    date: { type: Date, default: new Date() },
    // data:{ type:Array, default:[] },
    // eslint-disable-next-line vue/require-valid-default-prop
    videoByDay: { type: Array, default: [] },
    resetDay: { type: Boolean, default: false }
  },
  data() {
    return {
      prevCalendar: [],
      calendar: [],
      nextCalendar: [],
      width: 0,
      week: ['日', '一', '二', '三', '四', '五', '六'],
      year: 0,
      month: 0,
      day: 0,
      currentDate: null,
      prevDate: null,
      nextDate: null,
      videoData: [],
      currentYearMonthDay: ''
    }
  },
  watch: {
    videoByDay() {
      this.videoData = this.videoByDay
    },
    resetDay() {
      if (this.resetDay) {
        this.currentYearMonthDay = ''
        this.loadCalendar()
      }
    }
  },
  created() {

  },
  mounted() {
    var hyCalendarW = this.$refs.hyCalendar.offsetWidth
    if (hyCalendarW < 240) hyCalendarW = 240
    this.width = hyCalendarW / 7
    this.currentDate = this.date
    this.loadCalendar()
  },
  methods: {
    loadCalendar() {
      this.calendar = []
      this.year = this.currentDate.getFullYear()
      this.month = this.currentDate.getMonth() + 1
      this.day = this.currentDate.getDate()
      var today = this.currentYearMonthDay === '' ? new Date() : new Date(this.currentYearMonthDay)
      // 当前月开始日
      var startDate = new Date(this.year, this.month - 1, 1)
      // eslint-disable-next-line no-unused-vars
      var startDay = startDate.getDay()
      // 当前月结束日
      var endDate = new Date(this.year, this.month, 0)
      var endDay = endDate.getDay()
      // 上月
      this.prevDate = new Date(this.year, this.month - 1, 0)
      var prevDay = this.prevDate.getDay()
      // 下月
      this.nextDate = new Date(this.year, this.month, 1)
      // eslint-disable-next-line no-unused-vars
      var nextDay = this.nextDate.getDay()

      // 上月日历
      for (var i = -prevDay; i <= 0; i++) {
        this.calendar.push({ year: this.prevDate.getFullYear(), month: this.prevDate.getMonth() + 1, date: this.prevDate.getDate() + i, isToday: false })
      }

      // 当月日历
      // eslint-disable-next-line no-redeclare
      for (var i = 1; i <= endDate.getDate(); i++) {
        this.calendar.push({
          year: startDate.getFullYear(), month: (startDate.getMonth() + 1) < 10 ? '0' + (startDate.getMonth() + 1) : startDate.getMonth() + 1, date: i < 10 ? '0' + i : i, isToday: (!!(this.year === today.getFullYear() && this.month === (today.getMonth() + 1) && i === today.getDate()))
        })
      }

      // 下月日历
      // eslint-disable-next-line no-redeclare
      for (var i = 1; i < (7 - endDay); i++) {
        this.calendar.push({ year: this.nextDate.getFullYear(), month: this.nextDate.getMonth() + 1, date: i, isToday: false })
      }
    },
    prevMonth() {
      this.currentDate = this.prevDate
      this.loadCalendar()
      this.$emit('currentYearMonth', this.currentDate)
    },
    nextMonth() {
      this.currentDate = this.nextDate
      this.loadCalendar()
      this.$emit('currentYearMonth', this.currentDate)
    },
    onClickDay(item) {
      this.currentYearMonthDay = `${item.year}-${item.month}-${item.date} 00:00:00`
      this.loadCalendar()
      this.$emit('currentYearMonthDay', item)
    }
  }
}
</script>

<style lang="scss" scoped>
    $wrpWH : 240px;
    .hyCalendarHead{
        display: flex;
        justify-content: center;
        background: #f5f5f5;
        i{line-height: 35px;padding: 0 20px;cursor: pointer;}
    }
    .hyCalendar{
        display: flex;flex-wrap: wrap;margin-left:5px;width:$wrpWH;height:$wrpWH;
        >div{
            text-align: center;border: 1px solid #f5f5f5; margin-left: -1px;margin-top: -1px; background: #ffffff;
        }
    }
    .calendar-day{
        position: relative;cursor: pointer;
        .point{
            position:absolute;top: 0;right: 0;
            .video,.alarm{width: 5px;height: 5px;border-radius: 50%;}
            .video{background: #59b101;}
            .alarm{background: #0145ab;}
        }
        .active{background: #0145ab;color: #fff;}
    }
    .calendar-day:hover{background: #0145ab;color: #fff;}
</style>
