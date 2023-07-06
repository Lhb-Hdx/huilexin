<template>
  <div class="container_TransctionLog">
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
      <div id="Echarts" class="Echarts1">
        <div id="newEchartsLineObj" ref="newEchartsLineObj" />
      </div>
    </div>
    <!-- 列表区 -->
    <div class="Tables_box">
      <!-- 表头按钮 -->
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
    </div>
    <!-- 列表内容区域 -->
    <el-table
      :data="tableData1"
      border
      row-key="createTime"
      default-expand-all
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column label="任务安排时间" prop="createTime">
        <template slot-scope="{row}">
          {{ getCreateTime( row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="事项名称" prop="name" />
      <el-table-column label="事项类型" prop="problemType">
        <template slot-scope="{ row }">
          <!-- {{ row.serviceTypeName }} -->
          {{ getServiceType(row.serviceType) }}
        </template>
      </el-table-column>
      <el-table-column label="完成时间" prop="solveEtime" />
      <el-table-column label="评价" prop="assessLevel">
        <template slot-scope="{row}">
          <el-rate v-if="row.child === true" :v-model="row.assessLevel" disabled />
        </template>
      </el-table-column>
      <el-table-column label="处理结果" align="center" width="100">
        <template slot-scope="{row}">
          <div v-if="row.child === true">
            <el-tag
              :type="row.tag=== '未开始' ? 'info'
                : row.tag=== '未提交' ? 'info'
                  : row.tag=== '审核中' ? 'primary'
                    :row.tag=== '已审核' ? 'success'
                      :row.tag=== '驳回' ? 'danger'
                        :row.tag=== '未分配' ? 'info'
                          :row.tag=== '处理中' ? 'primary'
                            :row.tag=== '关闭' ? 'warning' :'danger'"
            >{{ row.tag }}</el-tag>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <pagination v-show="total > 0" :auto-scroll="false" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findOpsOrderProblem" />

  </div>
</template>

<script>
import api from '@/api/api'
import request from '@/utils/request'
import * as echarts from 'echarts'
import OutputExcel from '@/components/outputExcel/index.vue'
import Pagination from '@/components/Pagination' // 分页组件

const outputOptions = [
  { title: '任务安排时间', dataIndex: 'createTime' },
  { title: '事项名称', dataIndex: 'name' },
  { title: '事项类型', dataIndex: 'serviceTypeName' },
  { title: '完成时间', dataIndex: 'solveEtime' },
  { title: '评价', dataIndex: 'assessLevelName' },
  { title: '处理结果', dataIndex: 'tag' }
]

export default {
  name: 'PersonalTransactions',
  components: {
    Pagination, OutputExcel
  },
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
      nowDate: new Date(),
      parentData: null, // 父组件props
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
      subTypes: [], // 服务类型
      statusList: [ // 选择列表处理状态
        { value: 0, label: '未开始', type: '' },
        { value: 1, label: '未提交', type: 'info' },
        { value: 2, label: '审核中', type: 'warning' },
        { value: 3, label: '已审核', type: 'success' },
        { value: 4, label: '驳回', type: 'danger' },
        { value: 5, label: '未分配', type: 'warning' },
        { value: 6, label: '处理中', type: 'warning' },
        { value: 7, label: '关闭', type: 'warning' }
      ],
      typeOption: [ // 事项类型
        { label: '故障问题', value: 1 },
        { label: '服务请求', value: 2 },
        { label: '整改变更', value: 3 },
        { label: '日常事务', value: 4 },
        { label: '运维登记', value: 5 }
      ],
      // 分页相关属性
      total: 0,
      listQuery: {
        page: 1,
        limit: 10
      },
      tableData: [],
      tableData1: [],
      newEchartsLineObj: null,
      selectTime: false
    }
  },
  computed: {
    getCreateTime() {
      return function(time) {
        let TIMEL = time.length
        if (TIMEL > 10) return time.slice(10)
        return time
      }
    },
    newNowDate() { // 当天
      return this.$tool.dateFormat('YYYY-mm-dd', new Date())
    },
    // 事项服务类型
    getServiceType() {
      return function(serviceType) {
        const tidx = this.subTypes.findIndex(t => Number(t.serviceId) === Number(serviceType))
        return tidx !== -1 ? this.subTypes[tidx].serviceName : ''
      }
    }
  },
  mounted() {
    this.parentData = this.message
    this.findOpsOrderProblem()
    this.newCeateEcharts()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeHandleOne)
    this.newEchartsLineObj.dispose()
  },
  methods: {
    // 导出Excel
    async exprotExcelSubmit(excelQuery) {
      const data = await this.findOpsOrderProblem(excelQuery)// 获取列表数据
      this.$refs.outputExcel.output(outputOptions, data) // 调用选择表头方法导出Excal
    },

    // 接收ref转过来的数据
    submit(age) {
      this.listQuery.lockUserId = age.userId

      if (this.DateTypeVal === 0) { // 0:年
        delete this.listQuery.sTime
        delete this.listQuery.eTime
        this.findOpsOrderProblemSelectYear(age.userId)
      } else {
        this.listQuery.sTime = age.sdate
        this.listQuery.eTime = age.edate
      }
      this.findOpsOrderProblem()
    },
    // 选择年
    async findOpsOrderProblemSelectYear(lockUserId) {
      const DATA = { limit: -1, lockUserId}
      const res = await request({ url: api.opm.findOpsOrderProblem, data: DATA })
      if (res.code === 1 && res.data.length > 0) {
        this.tableData = res.data // 用于图形原数据计算
        this.newYear()
        this.EchartsYTotal()
      }
    },

    // 获取事项列表
    async findOpsOrderProblem(excelQuery) {
      let DATA = { ...this.listQuery, ...excelQuery, lockUserId: this.listQuery.lockUserId}
      const res = await request({ url: api.opm.findOpsOrderProblem, data: DATA })
      if (res.code === 1) {
        this.total = Number(res.count)

        if (this.DateTypeVal === 1) { // 选择1:月用于图形原数据计算
          this.tableData = res.data
        }
        let DATA = res.data
        let SUM = []
        let pids = []

        // 以时间为行健值row-key
        DATA.forEach(itemY => {
          pids.push(itemY.serviceType)
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
        })

        // 列表赋值
        let tagName = ''
        this.tableData1 = SUM
        /* 2.子类型时间：HH:mm:ss */
        this.tableData1.forEach(items => {
          items.children.forEach(itemC => {
            // 子类型状态标记
            this.$set(itemC, 'child', itemC.child = true)
            this.statusList.forEach(r => {
              if (itemC.statue === r.value) {
                tagName = r.label
              } else if (itemC.statue === null) {
                tagName = '暂无状态'
              }
            })
            this.$set(itemC, 'tag', tagName)

            // 事项服务类型
            const tidx = this.subTypes.findIndex(t => Number(t.serviceId) === Number(itemC.serviceType))
            const serviceTypeName = tidx !== -1 ? this.subTypes[tidx].serviceName : ''
            this.$set(itemC, 'serviceTypeName', serviceTypeName)
          })
        })

        this.findSysCatServeType(pids)
        this.EchartsYTotal()
      } else {
        this.$message.error(res.msg)
      }
      return res.data
    },
    // 服务类型
    async findSysCatServeType(ids) {
      let { code, data } = await request({ url: api.opm.findOpsOrderProblemService, data: { limit: -1, ids: ids } })
      if (code !== 1) return
      this.subTypes = data
      return data
    },

    // 选择列表处理状态
    selectStatus() {
      this.listQuery.statue = this.statusVal
      this.findOpsOrderProblem()
    },
    // 查询按钮
    serchTransactions() {
      if (this?.selectTableTimeVal) {
        this.listQuery.sTime = this.selectTableTimeVal // 选择的开始时间
      } else {
        if (this.DateTypeVal === 0) { // 0:年,1:月
          delete this.listQuery.sTime
          delete this.listQuery.eTime
        } else {
          this.listQuery.sTime = this.param.sTime
          this.listQuery.eTime = this.param.eTime
        }
      }

      if (this?.statusVal) {
        this.listQuery.statue = this.statusVal
      }
      this.findOpsOrderProblem()
    },

    // 选择日期类型[0:年,1:月]
    selectDateype() {
      if (this.DateTypeVal === 1) {
        this.selectType = 1
        this.listQuery.sTime = this.param.sTime
        this.listQuery.eTime = this.param.eTime
        this.findOpsOrderProblem()
      } else if (this.DateTypeVal === 0) {
        this.selectType = 0
        this.findOpsOrderProblemSelectYear(this.message.userId)
        delete this.listQuery.sTime
        delete this.listQuery.eTime
        this.findOpsOrderProblem()
      } else {
        this.selectType
      }
      this.newCeateEcharts()
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
      this.newCeateEcharts()
    },

    // 计算图像Y值
    EchartsYTotal() {
      const Time = []
      let Date = this.tableData
      Date.forEach((item, val) => {
        if (item !== null && item.createTime !== null) {
          Time.push(item.createTime)
        }
      })

      let mDataVals = [] // 按月值 ：(31) [0,0,0,...]
      let yDataVals = [] // 按年单独12个月(12)[0, 0, 0, ...]
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

      if (this.listQuery.select !== undefined || this.selectTime) {
        selecT = this.selectYear /* 手动选择时间*/
      } else if (this.listQuery?.sTime) {
        selecT = this.listQuery.sTime.slice(0, 7) /* 第一次默认时间 */
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
        if (element1 === selectMonth) { // 手动选择的月份 mm
          getMonth.push(M)
          const element3 = M.slice(8, 10)

          totalDate[element3] = totalDate[element3] ? totalDate[element3] + 1 : 1
        }
        if (newSelectY === Number(element2)) { // 手动选择的年份 yyyy
          totalMonth[element1] = totalMonth[element1] ? totalMonth[element1] + 1 : 1
        }
      }

      // 按月--指定月份某日的具体值
      for (let item in totalDate) {
        for (let m = 1; m <= mDataVals.length; m++) {
          if (m === Number(item)) {
            mDataVals[m - 1] = totalDate[item]
          }
        }
      }

      // 按年--指定月份的值
      for (let key in totalMonth) {
        for (let y = 1; y <= yDataVals.length; y++) {
          if (y === Number(key)) {
            yDataVals[y - 1] = totalMonth[key]
          }
        }
      }
      this.yDataVal = yDataVals// 年 ["月份":次数 ...]
      this.mDataVal = mDataVals// 月 ["某天":次数 ...]

      this.newCeateEcharts()
    },

    // 折线图
    newCeateEcharts() {
      // console.log('事项折线图')
      let totalDay = []
      let dayArr = []
      let TotalLine = []

      if (this.DateTypeVal === 1) {
        if (this.DateTypeVal === 1 && this.selectYear !== null) { // 选择类型为月份
          let newYear = this.selectYear.slice(0, 4) // 年份
          let newMonth = this.selectYear.slice(5) // 月份
          let A = new Date(newYear, newMonth, 0)
          totalDay = A.getDate()// 当月的总天数
        } else if (this.DateTypeVal === 1) {
          let newYear = this.nowDate.getFullYear()
          let newMonth = this.nowDate.getMonth() + 1 // (默认)当前月份
          let B = new Date(newYear, newMonth, 0)
          totalDay = B.getDate()
        }
        for (let k = 1; k <= totalDay; k++) {
          dayArr.push(k + '号')
        }
      }

      let newtotalDay = this.DateTypeVal === 1 ? (totalDay !== '' ? 31 : totalDay) : 12
      for (let m = 0; m <= newtotalDay; m++) {
        TotalLine.push({ xAxis: m })
      }

      const xDataVal = TotalLine // y轴线数
      const monthVal = dayArr // x抽天数
      const yearsVal = this.arrYearList // 计算的年份

      const yDataVals = this.yDataVal // 年
      const mDataVals = this.mDataVal // 月

      // 选择0:年、1:月份
      const yearORmonthVal = this.selectType === 1 ? monthVal : yearsVal // x轴数
      const yearDataVal = this.selectType === 1 ? mDataVals : yDataVals// y轴值

      this.newEchartsLineObj = echarts.init(document.getElementById('newEchartsLineObj'))

      this.newEchartsLineObj.setOption({
        xAxis: {
          min: 0,
          type: 'category',
          alignTicks: true,
          boundaryGap: false,
          data: yearORmonthVal
        },
        yAxis: {
          // min: 0,
          type: 'value',
          alignTicks: true
        },
        grid: {
          show: false,
          top: '4%',
          bottom: '10%',
          left: '4%',
          right: '2%'
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
      // 自适宽高监听
      window.addEventListener('resize', () => {
        this.resizeHandleOne()
      })
    },
    resizeHandleOne() {
      if (this.newEchartsLineObj) {
        this.newEchartsLineObj.resize()
      }
    },
    initDocumentBox() {
      const container = document.getElementById('Echarts')
      const charts = document.getElementById('newEchartsLineObj')
      this.chartssize(container, charts)
    }
  }
}
</script>

<style lang="scss" scoped>
.container_TransctionLog{
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
    .Echarts1{
      margin: 10px 0 30px ;
      border-color: #333;
      & div{
        margin:0;
        text-align: center;
      }
    }
  }
  .Tables_box{
    display: flex;
    flex-direction: column;
  }
}

/* echarts-container */
#newEchartsLineObj{
  width: 100%;
  min-height: 30vh;
}
</style>
