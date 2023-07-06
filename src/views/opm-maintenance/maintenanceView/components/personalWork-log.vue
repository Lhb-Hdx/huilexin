<template>
  <div class="container_personalWork">
    <!-- 折线图区 -->
    <div class="Echarts_box">
      <!-- 折线图头部按钮 -->
      <div class="btns">
        <!-- Select -->
        <el-select v-model="DateTypeVal" clearable placeholder="请选择日期类型" @change="selectDateype">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <!-- Date -->
        <div class="block">
          <el-date-picker
            v-model="selectYear"
            :format=" DateTypeVal === 0 ? 'yyyy 年 ' : 'yyyy 年 MM 月'"
            :value-format=" DateTypeVal === 0 ?'yyyy' : 'yyyy-MM'"
            :type=" DateTypeVal === 0 ? 'year' : 'month' "
            :placeholder=" DateTypeVal==='' ? '选择年份':DateTypeVal === 0 ?'选择年份':'选择月份'"
            @change="selectDate"
          />
        </div>
      </div>
      <!-- 折线图 -->
      <div id="Echarts2" ref="Echarts2" class="Echarts2">
        <!-- <div id="workEchartsLineObj" ref="workEchartsLineObj" :style="{width: echartsWidth+'px', height: '250px'}" /> -->
        <div id="workEchartsLineObj" ref="workEchartsLineObj" />
      </div>
    </div>
    <!-- 列表区 -->
    <div class="Tables_box">
      <!-- 按钮 -->
      <el-form :inline="true" class="btns2">
        <el-form-item>
          <el-date-picker
            v-model="selectTableTimeVal"
            type="date"
            format=" yyyy 年 MM 月 dd 日"
            value-format="yyyy-MM-dd"
            placeholder="所有时间"
          />
        </el-form-item>
        <el-form-item>
          <el-select v-model="statusVal" clearable placeholder="选择状态" @change="selectStatus">
            <el-option
              v-for="item in statusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="serchTransactions">查询</el-button>
        </el-form-item>
        <el-form-item>
          <OutputExcel ref="outputExcel" size="small" class="ml-10" @submitQuery="exprotExcelSubmit" />
        </el-form-item>
      </el-form>
      <!-- 列表内容区域 -->
      <div class="worktable">
        <el-table
          :data="tableData2"
          style="width: 100%"
          row-key="createTime"
          border
          default-expand-all
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        >

          <el-table-column label="任务安排时间" prop="createTime">
            <template slot-scope="{row}">
              {{ getCreateTime( row.createTime) }}
            </template>
          </el-table-column>

          <el-table-column label="作业名称">
            <template slot-scope="{row}">
              <span>{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="分配时间">
            <template slot-scope="{row}">
              <span>{{ row.workStime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="完成时间">
            <template slot-scope="{row}">
              <span>{{ row.workEtime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="分配天数">
            <template slot-scope="{row}">
              <span>{{ row.planStime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="实际完成天数">
            <template slot-scope="{row}">
              <span>{{ row.planEtime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="处理结果" align="center" width="100">
            <template slot-scope="{row}">
              <div v-if="row.child === true">
                <el-tag
                  :type="row.tag=== '处理中' ? 'warning'
                    : row.tag=== '处理失败' ? 'danger'
                      : row.tag=== '处理成功' ? 'success' :'info'"
                >{{ row.tag }}</el-tag>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 分页组件 -->
      <pagination v-show="total>0" :auto-scroll="false" :total="total" :page.sync="listRequest.page" :limit.sync="listRequest.limit" @pagination="findOpsOrderWorkTask" />
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import api from '@/api/api'
import request from '@/utils/request'
import Pagination from '@/components/Pagination'
import OutputExcel from '@/components/outputExcel/index.vue'

const outputOptions = [
  { title: '任务安排时间', dataIndex: 'createTime' },
  { title: '作业名称', dataIndex: 'name' },
  { title: '分配时间', dataIndex: 'workStime' },
  { title: '完成时间', dataIndex: 'workEtime' },
  { title: '分配天数', dataIndex: 'planStime' },
  { title: '实际完成天数', dataIndex: 'planEtime' },
  { title: '处理结果', dataIndex: 'tag' }
]

export default {
  name: 'PersonalWork',
  components: { Pagination, OutputExcel },
  inject: ['userId', 'param'],
  props: {
    message: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      echartsWidth: '',
      nowDate: new Date(),
      DateTypeVal: 1, // 选择日期类型
      selectType: 1, // 选择日期类型
      selectYear: '', // 选择年份/月份
      nowYears: '',
      newselectYear: [],
      arrYearList: [],
      selectTableTimeVal: '', // 列表日期选择
      yDataVal: [], // Y抽值(按年)
      mDataVal: [], // Y抽值(按月)
      options: [
        { value: 0, label: '按年' },
        { value: 1, label: '按月' }
      ],
      statusVal: null,
      statusList: [ // 选择列表处理状态
        { value: 1, label: '处理中', type: 'warning' },
        { value: 2, label: '处理失败', type: 'danger' },
        { value: 3, label: '处理成功', type: 'success' }
      ],
      // 列表先关属性
      selectTime: false,
      tableData2: [],
      tableData: [],
      total: 0,
      listRequest: {
        page: 1,
        limit: 10,
        userId: this.message.userId
      }
    }
  },
  computed: {
    getCreateTime() {
      return function(time) {
        let TIMEL = time.length
        if (TIMEL > 10) return time.slice(10)
        return time
      }
    }
  },
  mounted() {
    this.findOpsOrderWorkTask()
    this.newCeateEchartsTow()
    // this.EchartsYTotal()
    // this.newYear()
  },
  beforeDestroy() {
    // 自适宽高监听销毁
    window.removeEventListener('resize', this.resizeHandleTow)
    this.workEchartsLineObj.dispose()
  },
  methods: {

    // 导出Excel
    async exprotExcelSubmit(excelQuery) {
      const data = await this.findOpsOrderWorkTask(excelQuery)// 获取列表数据
      this.$refs.outputExcel.output(outputOptions, data) // 调用选择表头方法导出Excal
    },
    // 接收ref转过来的数据
    initWork(age) {
      this.listRequest.userId = age.userId

      if (this.DateTypeVal === 0) { // 0:年
        delete this.listRequest.createStime
        delete this.listRequest.createEtime
        this.findOpsOrderWorkTaskSelectYears(age.userId)
      } else {
        this.listRequest.createStime = age.sdate
        this.listRequest.createEtime = age.edate
      }
      this.findOpsOrderWorkTask()
    },
    // 选择日期类型[0:年,1:月]
    selectDateype() {
      if (this.DateTypeVal === 1) {
        this.selectType = 1
        this.listRequest.createStime = this.param.sTime
        this.listRequest.createEtime = this.param.eTime
        this.findOpsOrderWorkTask()
      } else if (this.DateTypeVal === 0) {
        this.selectType = 0
        this.findOpsOrderWorkTaskSelectYears(this.message.userId)
        delete this.listRequest.createStime
        delete this.listRequest.createEtime
        this.findOpsOrderWorkTask()
      } else {
        this.selectType
      }
      this.newCeateEchartsTow()
      this.EchartsYTotal()
    },

    // 选择的日期
    selectDate() {
      this.selectTime = true
      if (this?.selectYear) {
        const condition = this.selectYear.split('-')
        if (condition.length > 0) {
          this.newselectYear = Number(condition[0])
        } else {
          this.newselectYear = Number(this.selectYear)
        }
      }
      this.newYear()
      this.EchartsYTotal()
    },
    // 选择年
    async findOpsOrderWorkTaskSelectYears(userId) {
      const DATA = { limit: -1, userId }
      const res = await request({ url: api.opm.findOpsOrderWorkTask, data: DATA })
      if (res.code === 1 && res.data.length > 0) {
        this.tableData = res.data
        this.newYear()
        this.EchartsYTotal()
      }
    },
    // 获取作业列表
    async findOpsOrderWorkTask(excelQuery) {
      const DATA = { ...this.listRequest, ...excelQuery}
      const res = await request({ url: api.opm.findOpsOrderWorkTask, data: DATA })
      if (res.code === 1) {
        let Data = res.data
        this.total = Number(res.count)
        if (this.DateTypeVal === 1) { // 选择1:月用于图形原数据计算
          this.tableData = res.data
        }
        /* 1. 以时间为行健值row-key */
        let SUM = []
        Data.forEach(itemY => {
          if (itemY.createTime !== null) {
            let burmmy = itemY.createTime.slice(0, 10)
            const idx = SUM.findIndex(itemS => new Date(itemS.createTime).getTime() === new Date(burmmy).getTime())
            if (idx !== -1) {
              SUM[idx].children.push(itemY)
            } else {
              SUM.push({
                createTime: burmmy,
                children: [itemY]
              })
            }
          }
        })
        /* 列表赋值 */
        let tagName = ''
        this.tableData2 = SUM
        /* 2.子类型时间：HH:mm:ss */
        this.tableData2.forEach(items => {
          items.children.forEach(itemC => {
            this.$set(itemC, 'child', itemC.child = true) // table子类型标记
            this.statusList.forEach(r => {
              if (itemC.statue === r.value) {
                tagName = r.label
              } else if (itemC.statue === null) {
                tagName = '待处理'
              }
            })
            this.$set(itemC, 'tag', tagName) // table子类型状态标记
          })
        })

        this.EchartsYTotal()
      }
      return res.data
    },

    // 选择列表处理状态
    selectStatus() {
      this.listRequest.statue = this.statusVal
      this.findOpsOrderWorkTask()
    },

    // 查询按钮
    serchTransactions() {
      if (this?.selectTableTimeVal) {
        this.listRequest.createStime = this.selectTableTimeVal// 选择的开始时间
      } else {
        if (this.DateTypeVal === 0) { // 0:年,1:月
          delete this.listRequest.createStime
          delete this.listRequest.createEtime
        } else {
          this.listRequest.createStime = this.param.sTime
          this.listRequest.createEtime = this.param.eTime
        }
      }
      this.findOpsOrderWorkTask()
    },

    // X轴年份标签计算
    newYear() {
      let date = this.nowDate
      let YearsT = []
      let arrYear = []
      let newselectYear = this.newselectYear
      let DateTypeVal = this.DateTypeVal
      let monthT = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

      if (DateTypeVal === 0 && newselectYear.length === 0 || newselectYear === 0) {
        YearsT.push(date.getFullYear())
      } else if (DateTypeVal === 0 && newselectYear !== '') {
        YearsT.push(newselectYear)
      }

      monthT.forEach((m, mval) => {
        arrYear.push(YearsT.toString().slice(2, 4) + '年' + m + '月')
      })
      this.arrYearList = arrYear
      this.newCeateEchartsTow()
    },

    // Y轴数值计算
    EchartsYTotal() {
      let Date = this.tableData
      const Time = []
      Date.forEach((item, val) => {
        if (item !== null && item.createTime !== null) {
          Time.push(item.createTime) // all time
        }
      })

      let mDataVals = [] // 按月值 ：(31) [0,0,0,0,0,....]
      let yDataVals = [] // 按年单独12个月(12)[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      for (let D = 1; D < 32; D++) {
        mDataVals.push(0)
        if (D < 13) {
          yDataVals.push(0)
        }
      }

      // 月份提取
      let month = Time
      let selecT = ''
      let selectMonth = ''

      if (this.selectTime) { // 手动选择的月份
        selecT = this.selectYear
      } else if (this.listRequest?.createStime) { // 第一次默认时间
        selecT = this.listRequest.createStime.slice(0, 7)
      }

      let monthDay = this.nowDate.getMonth() + 1
      if (selecT !== null && selecT !== undefined) {
        selectMonth = selecT.slice(5)
      } else {
        selectMonth = (monthDay > 9 ? monthDay : `0${monthDay}`)
      }

      let getMonth = [] // 选择的指定月份
      let totalMonth = [] //  统计某年内月份某天的出现次数
      let totalDate = [] // 统计某月份某天的出现次数

      for (let M of month) {
        const element1 = M.slice(5, 7) // mm
        const element2 = M.slice(0, 4) // yyyy
        const newSelectY = this.selectYear === '' ? this.nowDate.getFullYear() : this.newselectYear
        if (element1 === selectMonth.toString()) { // 手动选择的月份 mm
          getMonth.push(M)
          const element3 = M.slice(8, 10)
          totalDate[element3] = totalDate[element3] ? totalDate[element3] + 1 : 1
        }

        if (newSelectY === Number(element2)) { // 手动选择的年份 yyyy
          totalMonth[element1] = totalMonth[element1] ? totalMonth[element1] + 1 : 1
        }
      }

      // 按月--指定月份某日的具体值|1-31
      for (let item in totalDate) {
        for (let m = 1; m <= mDataVals.length; m++) {
          if (m === Number(item)) {
            mDataVals[m - 1] = totalDate[item]
          }
        }
      }
      // 按年--指定月份的值|1-12月
      for (let key in totalMonth) {
        for (let y = 1; y <= yDataVals.length; y++) {
          if (y === Number(key)) {
            yDataVals[y - 1] = totalMonth[key]
          }
        }
      }

      this.yDataVal = yDataVals// 年 ["月份":次数 ...]
      this.mDataVal = mDataVals// 月 ["某天":次数 ...]
      this.newCeateEchartsTow()
    },

    // 折线图
    newCeateEchartsTow(e) {
      let totalDay = []
      let dayArr = []
      let TotalLine = []

      if (this.DateTypeVal === 1) {
        if (this.DateTypeVal === 1 && this.selectYear !== null) { // 选择类型为月份
          let newYear = this.selectYear.slice(0, 4)
          let newMonth = this.selectYear.slice(5)
          var A = new Date(newYear, newMonth, 0)
          totalDay = A.getDate()// 当月的总天数
        } else if (this.DateTypeVal === 1) {
          let newYear = this.nowDate.getFullYear()
          let newMonth = this.nowDate.getMonth() + 1 // (默认)当前月份
          let B = new Date(newYear, newMonth, 0)
          totalDay = B.getDate()
        }
        for (var k = 1; k <= totalDay; k++) {
          dayArr.push(k + '号')
        }
      }

      let newtotalDay = this.DateTypeVal === 1 ? (totalDay !== '' ? 31 : totalDay) : 12
      for (var m = 0; m <= newtotalDay; m++) {
        TotalLine.push({ xAxis: m })
      }

      const xDataVal = TotalLine // y轴线数
      const monthVal = dayArr // x抽天数
      const yearsVal = this.arrYearList // 计算的年份

      const yDataVals = this.yDataVal // 年
      const mDataVals = this.mDataVal // 月

      // 0:年,1:月份
      const yearORmonthVal = this.selectType === 1 ? monthVal : yearsVal // x轴数
      const yearDataVal = this.selectType === 1 ? mDataVals : yDataVals// y轴值

      this.workEchartsLineObj = echarts.init(document.getElementById('workEchartsLineObj'))
      this.workEchartsLineObj.setOption({
        xAxis: {
          min: 0,
          type: 'category',
          alignTicks: true,
          boundaryGap: false,
          data: yearORmonthVal
        },
        yAxis: {
          type: 'value',
          alignTicks: true
        },
        grid: {
          show: false,
          top: '4%',
          bottom: '10%',
          left: '4%',
          right: '1.8%'
        },
        series: [
          {
            data: yearDataVal,
            type: 'line',
            smooth: true, // 是否为平滑曲线
            symbol: 'emptyCircle',
            symbolSize: 8,
            boundaryGap: false,
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: '#c4d4eb' // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: '#f8fafd' // 100% 处的颜色
                  }
                ],
                global: false // 缺省为 false
              }
            },
            markLine: {
              symbol: ['none', 'none'],
              label: { show: false },
              lineStyle: {
                width: 1,
                color: ' #c4d4eb',
                type: 'solid'
              },
              emphasis: {
                lineStyle: {
                  width: 1,
                  color: ' #c4d4eb',
                  type: 'dashed'
                }
              },
              data: xDataVal
            },
            emphasis: {
              label: {
                show: true
              }
            }
          }
        ]
      })
      /* 自适应宽度 */
      window.addEventListener('resize', () => {
        this.resizeHandleTow()
      })
    },
    resizeHandleTow() {
      if (this.workEchartsLineObj) {
        this.workEchartsLineObj.resize()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.container_personalWork{
  .Echarts_box{
    display: flex;
    flex-direction: column;
    .btns{
      display: flex;
      margin: 10px 0 20px;
      .block{
        margin-left: 10px;
      }

    }
    .Echarts2{
      margin: 10px 0 30px ;
      border-color: #333;
    }
  }
  .Tables_box{
    display: flex;
    flex-direction: column;
    .worktable{
      display: flex;
    }
  }
}
/* echarts-container */
#workEchartsLineObj{
  width: 100%;
  min-height: 30vh;
}
</style>
