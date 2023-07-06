<template>
  <div class="cc-calendar">
    <calendarHeader
      v-if="options.headStyle.show"
      :head-options="headOptions"
      @handlePrevMonth="handlePrevMonth"
      @handleNextMonth="handleNextMonth"
      @handleToday="handleToday"
    />
    <ul class="calendar-week">
      <li v-for="(item, index) in calendarTitleArr" :key="index" class="week-item">{{ item }}</li>
    </ul>
    <ul class="calendar-view">
      <li
        v-for="(item, index) in visibleCalendar"
        :key="index"
        class="date-view"
        :class="[
          {'month-class': !isCurrentMonth(item.date)},
          {todayBg: isCurrentDay(item.date)},
          {handleDay: options.viewStyle.activeStaue && item.clickDay}
        ]"
        :style="{ height: (options.viewStyle.height || 120) + 'px' }"
        @click="handleClickDay(item)"
      >
        <slot v-if="options.slot.dateDayItem" name="dateDayItem" :item="item" />
        <template v-else>
          <span
            class="date-day"
            :style="dayStyle"
            :class="[{'opacity-class': !isCurrentMonth(item.date)}]"
          >
            {{ item.day }}
          </span>
          <span class="calendar-num">
            {{ item.calendarNum }}
          </span>
        </template>
      </li>
    </ul>
  </div>
</template>

<script>
import calendarHeader from './canlendar-head.vue'

const englishMonthList = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec'
]

const getNewDate = (date) => {
  let year = date.getFullYear()
  let month = date.getMonth()
  let day = date.getDate()
  return {year, month, day}
}

const getDate = (year, month, day) => {
  return new Date(year, month, day)
}

const englishMonth = (month) => {
  let engMonth

  englishMonthList.map(() => {
    engMonth = englishMonthList[month]
  })

  return engMonth
}

// const formatDate = (date) => {
//   date = Number(date)
//   return date < 10 ? `0${date}` : date
// }

export default {
  name: 'CcCalendar',
  componentName: 'cc-calendar',
  components: {
    calendarHeader
  },
  props: {
    options: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    let {year, month, day} = getNewDate(new Date())
    return {
      headOptions: {
        type: this.options.type,
        style: this.options.headStyle,
        date: ''
      },
      calendarTitleArr: [
        '星期一',
        '星期二',
        '星期三',
        '星期四',
        '星期五',
        '星期六',
        '星期天'
      ],
      time: {year, month, day},
      calendarList: []
    }
  },
  computed: {
    dayStyle: function () {
      return {
        textAlign: this.options.viewStyle.day
      }
    },
    visibleCalendar() {
      let calendatArr = []
      let {year, month} = getNewDate(getDate(this.time.year, this.time.month, 1))
      let currentFirstDay = getDate(year, month, 1)
      // 获取当前月第一天星期几
      let weekDay = currentFirstDay.getDay()
      if (weekDay === 0) {
        weekDay += 7
      }
      let startTime = currentFirstDay - (weekDay - 1) * 24 * 60 * 60 * 1000
      let monthDayNum
      if (weekDay === 5 || weekDay === 6) {
        monthDayNum = 42
      } else {
        monthDayNum = 35
      }

      let isPast = true

      for (let i = 0; i < monthDayNum; i++) {
        const date = new Date(startTime + i * 24 * 60 * 60 * 1000)
        const ymdTimestamp = new Date(`${year}-${date.getMonth() + 1}-${new Date(startTime + i * 24 * 60 * 60 * 1000).getDate()}`).getTime()

        if (isPast) {
          isPast = !this.isCurrentDay(new Date(startTime + i * 24 * 60 * 60 * 1000))
        }

        if (this.isFutureDay(ymdTimestamp)) {
          isPast = false
        }
        const tmp = {
          date: new Date(startTime + i * 24 * 60 * 60 * 1000),
          year: year,
          month: date.getMonth() + 1,
          day: new Date(startTime + i * 24 * 60 * 60 * 1000).getDate(),
          clickDay: false,
          ymdTimestamp,
          isPast
        }
        tmp.isCurrentMonth = this.isCurrentMonth(tmp.date)
        calendatArr.push(tmp)
      }

      //   this.headOptions.date = `${englishMonth(month)} ${year}`
      return calendatArr
    }
  },
  watch: {
    options: {
      handler() {
        if (this.options.dataOptions.month) this.$set(this.time, 'month', this.options.dataOptions.month - 1)
        if (this.options.dataOptions.year) this.$set(this.time, 'year', this.options.dataOptions.year)
        if (this.options.dataOptions.day) this.$set(this.time, 'day', this.options.dataOptions.day)
      },
      deep: true
    }
  },
  created () {
    this.calendarList = this.visibleCalendar
    this.calendarType = this.options.calendarType
  },
  methods: {
    // 是否是当前月
    isCurrentMonth (date) {
      let {year: currentYear, month: currentMonth} = getNewDate(getDate(this.time.year, this.time.month, 1))
      let {year, month} = getNewDate(date)
      return currentYear === year && currentMonth === month
    },
    // 是否是今天
    isCurrentDay (date) {
      let {year: currentYear, month: currentMonth, day: currentDay} = getNewDate(new Date())
      let {year, month, day} = getNewDate(date)
      return currentYear === year && currentMonth === month && currentDay === day
    },
    // 是否是未来
    isFutureDay(timestamp) {
      const { year, month, day } = getNewDate(new Date())
      return new Date(`${year}-${month + 1}-${day} 00:00:00`).getTime() < timestamp
    },
    // 上一个月
    handlePrevMonth () {
      let prevMonth = getDate(this.time.year, this.time.month, 1)
      prevMonth.setMonth(prevMonth.getMonth() - 1)
      this.time = getNewDate(prevMonth)
      this.headOptions.date = `${englishMonth(this.time.month)} ${this.time.year}`
      this.$emit('handlePrevMonth')
    },
    // 下一个月
    handleNextMonth () {
      let nextMonth = getDate(this.time.year, this.time.month, 1)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      this.time = getNewDate(nextMonth)
      this.headOptions.date = `${englishMonth(this.time.month)} ${this.time.year}`
      this.$emit('handleNextMonth')
    },
    // 点击回到今天
    handleToday () {
      this.time = getNewDate(new Date())
      // this.returnDate();
      this.$emit('handleToday')
    },
    // 点击某一天
    handleClickDay (item) {
      this.$forceUpdate()
      this.$emit('handleClickDay', item)
      this.$set(item, 'clickDay', true)
    }
  }
}
</script>

<style lang="scss" scoped>
  .cc-calendar {
    // padding: 23px 30px 30px;
    width: 100%;
    height: 100%;
    background: #F9FAFC;
    box-sizing: border-box;
    .calendar-week {
      display: flex;
      width: 100%;
      height: 46px;
      line-height: 46px;
      border: 1px solid #E4E7EA;
      border-right: none;
      margin-bottom: 0 !important;
      padding-left: 0 !important;
      .week-item {
        width: 14.285%;
        text-align: center;
        font-size: 14px;
        color: #424953;
        border-right: 1px solid #E4E7EA;
        font-weight: 600;
        list-style-type: none;
      }
    }
    .calendar-view {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
      border-left: 1px solid #E4E7EA;
      margin-top: 0 !important;
      padding-left: 0 !important;
      .date-view {
        width: 14.285%;
        border-right: 1px solid #E4E7EA;
        border-bottom: 1px solid #E4E7EA;
        box-sizing: border-box;
        list-style-type: none;
        cursor: pointer;
        .date-day {
          padding: 8px 8px 0;
          display: block;
          width: 100%;
          font-size: 14px;
          color: #7F8794;
        }
        .calendar-num {
          margin-top: 6px;
          display: block;
          width: 100%;
          text-align: center;
          font-size: 30px;
          color: #424953;
        }
      }
      .opacity-class {
        opacity: .5;
      }
      .month-class {
        background-image: linear-gradient(45deg,rgba(000, 000, 000, .03) 25%,transparent 25%,transparent 50%,rgba(000, 000, 000, .03) 50%,rgba(000, 000, 000, .03) 75%,transparent 75%,transparent);
        background-size: 20px 20px;
      }
      .todayBg {
        background: #FFFDEF;
      }
      .handleDay {
        background: #2061FF !important;
        .date-day {
          color: #BCCFFF !important;
        }
        .calendar-num {
          color: #fff !important;
        }
      }
    }
  }
</style>
