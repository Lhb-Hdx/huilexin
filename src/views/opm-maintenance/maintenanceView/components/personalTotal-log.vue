<template>
  <div class="container_personalTotal">
    <!-- 列表头部：按钮区 -->
    <div class="btns_box">
      <div class="block">
        <!-- <el-date-picker
          v-model="valTime"
          type="date"
          placeholder="所有时间"
          format="yyyy 年 MM 月 dd 日"
          value-format="yyyy-MM-dd"
          @change="changeTime"
        /> -->
        <el-date-picker
          v-model="valTime"
          type="month"
          format="yyyy 年 MM 月"
          value-format="yyyy-MM"
          placeholder="选择月"
          @change="changeTime"
        />
      </div>
      <div class="btns">
        <el-button type="primary" @click="search">查询</el-button>
      </div>
    </div>
    <!-- 列表区域 -->
    <div class="tables_box">
      <div class="tables_list">
        <div class="Progress">
          <div class="Progress_matter">
            <h5 id="title">事项: {{ getProblem() }}</h5>
            <div class="lineBox">
              <div id="line1" :style="[ statelevel.problem_state_green === 0 ? {flex:0} : {flexRow:1,flexShrink:1,flexBasis: statelevel.problem_state_green +'0%'}]" />
              <div id="line3" :style="[ statelevel.problem_state_grey === 0 ? {flex:0} : {flexRow:1,flexShrink:1,flexBasis: statelevel.problem_state_grey +'0%'}]" />
              <div id="line2" :style="[ statelevel.problem_state_red === 0 ? {flex:0} : {flexRow:1,flexShrink:1,flexBasis: statelevel.problem_state_red +'0%'}]" />
            </div>
            <span>{{ `已完成${ statelevel.problem_state_green}，待处理${statelevel.problem_state_grey}，处理失败${statelevel.problem_state_red}` }}</span>
          </div>
          <div class="Progress_matter">
            <h5 id="title">作业: {{ getTask() }}</h5>
            <div class="lineBox">
              <a id="line1" :title="'已完成'+ statelevel.task_state_green" :style="[ statelevel.task_state_green === 0 ? {flex:0} : {flexRow:1,flexShrink:1,flexBasis: statelevel.task_state_green +'0%'}]" />
              <a id="line3" :title="'待完成' + statelevel.task_state_grey" :style="[ statelevel.task_state_grey === 0 ? {flex:0} : {flexRow:1,flexShrink:1,flexBasis: statelevel.task_state_grey +'0%'}]" />
              <a id="line2" :title="statelevel.task_state_red" :style="[ statelevel.task_state_red === 0 ? {flex:0} : {flexRow:1,flexShrink:1,flexBasis: statelevel.task_state_red +'0%'}]" />
            </div>
            <span>{{ `已完成${ statelevel.task_state_green}，待处理${statelevel.task_state_grey}，处理失败${statelevel.task_state_red}` }}</span>
          </div>
        </div>

        <div class="Rate_modle">
          <div class="synthesize">
            <p>{{ getRateValTotle }}</p>
            <h5 id="title2">{{ '综合评分' }}</h5>
            <span>
              <el-rate v-model="getRateValTotle" disabled :max="5" />
            </span>
          </div>

          <div class="container_Rate">
            <div class="Rate">
              <h5 id="title">{{ '星级评分' }}</h5>
              <el-rate v-model="newRateVal.problem_assess_level_0" disabled :max="5" :high-threshold="rateVal.problem_assess_level_0 + 1" />
              <span>{{ rateVal.problem_assess_level_0 }}</span>
            </div>
            <div class="Rate">
              <h5 id="title">{{ '星级评分' }}</h5>
              <el-rate v-model="newRateVal.problem_assess_level_1" disabled :max="5" :high-threshold="rateVal.problem_assess_level_1 + 1" />
              <span>{{ rateVal.problem_assess_level_1 }}</span>
            </div>
            <div class="Rate">
              <h5 id="title">{{ '星级评分' }}</h5>
              <el-rate v-model="newRateVal.problem_assess_level_2" disabled :max="5" :high-threshold="rateVal.problem_assess_level_2 + 1" />
              <span>{{ rateVal.problem_assess_level_2 }}</span>
            </div>
            <div class="Rate">
              <h5 id="title">{{ '星级评分' }}</h5>
              <el-rate v-model="newRateVal.problem_assess_level_3" disabled :max="5" :high-threshold="rateVal.problem_assess_level_3 + 1" />
              <span>{{ rateVal.problem_assess_level_3 }}</span>
            </div>
            <div class="Rate">
              <h5 id="title">{{ '星级评分' }}</h5>
              <el-rate v-model="newRateVal.problem_assess_level_4" disabled :max="5" :high-threshold="rateVal.problem_assess_level_4 + 1" />
              <span>{{ rateVal.problem_assess_level_4 }}</span>
            </div>
            <div class="Rate">
              <h5 id="title">{{ '星级评分' }}</h5>
              <el-rate v-model="newRateVal.problem_assess_level_5" disabled :max="5" :high-threshold="rateVal.problem_assess_level_5 + 1" />
              <span>{{ rateVal.problem_assess_level_5 }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 饼图 -->
      <div class="tables_Echarts">
        <div ref="chartsleft" class="charts_left">
          <div id="newSeverChartObj" ref="newSeverChartObj" style="height:240px;width:434px;" />
        </div>
        <div ref="chartsright" class="charts_right">
          <div id="newSeverChartObj2" ref="newSeverChartObj2" style="height:240px;width:434px;" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import * as echarts from 'echarts'
export default {
  name: 'PersonalTotal',
  data() {
    return {
      valTime: '', // 时间选择
      percentageVal: 60, // 进度条
      rateVal: [], // 评分 null
      newRateVal: {
        problem_assess_level_0: 0,
        problem_assess_level_1: 1,
        problem_assess_level_2: 2,
        problem_assess_level_3: 3,
        problem_assess_level_4: 4,
        problem_assess_level_5: 5
      }, // 评分 null
      statelevel: {}, // 事项作业数
      taskProcessCount: {}, // 工作进度
      taskNameList: [
        { value: 0, name: '已完成', cnum: null },
        { value: 1, name: '处理中', cnum: null }
      ],
      listQuery: {
        page: 1
      },
      echartsWidth: [], // 画布宽高
      echartsHeight: 0,
      newSeverChartObj: null,
      newSeverChartObj2: null,
      servicecountList: [], // 分析数据
      serviceAnalyzeTitle: [], // 分析数据标题
      serviceAnalyzeTitle2: [], // 分析数据标题
      serviceAnalyzeResult: [], // 分析数据所占数值
      serviceAnalyzeResult2: [] // 分析数据所占数值
    }
  },
  computed: {
    userInfo() {
      const userInfo = this.localStorageOperation('get', 'userInfo')
      return userInfo
    },
    getProblem() {
      return function() {
        let data = this.statelevel
        let X = data.problem_state_green
        let Y = data.problem_state_grey
        let Z = data.problem_state_red
        let burmmy = Number(X) + Number(Y) + Number(Z)/* 事项总数 */
        let result = isNaN(burmmy) ? 0 : burmmy
        return result
      }
    },
    getTask() {
      return function() {
        let data = this.statelevel
        let X = data.task_state_green
        let Y = data.task_state_grey
        let Z = data.task_state_red
        let burmmy = Number(X) + Number(Y) + Number(Z) /* 作业总数 */
        let result = isNaN(burmmy) ? 0 : burmmy
        return result
      }
    },
    getRateValTotle: {
      get: function() {
        let data = this.rateVal
        let level0 = data.problem_assess_level_0
        let level1 = data.problem_assess_level_1
        let level2 = data.problem_assess_level_2
        let level3 = data.problem_assess_level_3
        let level4 = data.problem_assess_level_4
        let level5 = data.problem_assess_level_5

        // 评分加权平均数
        let weightedAverage = 0
        const sum = (level0 + level1 + level2 + level3 + level4 + level5)
        if (sum !== 0) {
          weightedAverage = (
            level0 * (level0 / sum) +
            level1 * (level1 / sum) +
            level2 * (level2 / sum) +
            level3 * (level3 / sum) +
            level4 * (level4 / sum) +
            level5 * (level5 / sum)
          )
        }

        let maen = 0
        if (weightedAverage <= 100) {
          maen = (weightedAverage * 0.01) * 6
        }
        if (weightedAverage > 100 && weightedAverage <= 1000) {
          maen = (weightedAverage * 0.001) * 6
        }
        return maen !== null ? Number(maen) : 0
      },
      set: function(res) {
        // console.log('getRateValTotle@res', res)
      }

    }
  },
  mounted() {
    this.findPersonWorkCount()
    this.echarts1()
    this.echarts2()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeHandlePieOne)
    window.removeEventListener('resize', this.resizeHandlePieTow)
    this.newSeverChartObj.dispose()
    this.newSeverChartObj2.dispose()
  },
  methods: {
    // 接收ref转过来的数据
    initToatl(age) {
      if (age.select === 'select') {
        this.listQuery.userId = age.userId
      } else {
        console.log('statelevel', age)
        this.listQuery.userId = age.userId
      }
      this.listQuery.sdate = age.sdate
      this.listQuery.edate = age.edate
      this.findPersonWorkCount()
    },
    // 获取统计数据
    findPersonWorkCount() {
      let DATA = this.listQuery
      request({ url: api.opm.findPersonWorkCount, data: DATA }).then(res => {
        if (res.code === 1) {
          this.servicecountList = res.map.servicecount
          this.rateVal = res.map.statelevel
          this.statelevel = res.map.statelevel
          this.taskProcessCount = res.map.task_process_count

          this.getTitleList()
        } else {
          if (res.msg) {
            /* 找不到时重置数据 */
            this.serviceAnalyzeResult2 = [{ name: '以完成', value: 0 }, { name: '处理中', value: 0 }]
            this.echarts2()
          }
        }
      })
    },
    // 选择的时间
    changeTime() {
      this.listQuery.sdate = ''
      this.listQuery.edate = this.valTime
      console.log('@选择的时间', this.valTime)
    },
    // 查询按钮
    search() {
      // console.log('@查询的时间', this.valTime)
      this.findPersonWorkCount()
    },
    format(percentage) {
      return percentage < 100 ? '' : `${percentage}%`
    },
    // 获取环形图数据title、value
    getTitleList() {
      let titleTmp = []
      let titleTmp2 = []
      let resultTmp = []
      let taskPCount = []
      this.servicecountList.forEach(item => {
        // if (item['serviceName'] !== '') {
        //   titleTmp.push(item['serviceName'])
        // }
        // if (item['cnum'] !== '' && item['serviceName'] !== '') {
        //   resultTmp.push({
        //     value: item['cnum'],
        //     name: item['serviceName']
        //   })
        // }
        if (item['dic_name'] !== '') {
          titleTmp.push(item['dic_name'])
        }
        if (item['cnum'] !== '' && item['dic_name'] !== '') {
          resultTmp.push({
            value: item['cnum'],
            name: item['dic_name']
          })
        }
      })

      /* echarts :title、value */
      if (titleTmp.length > 0 && resultTmp.length > 0) {
        this.serviceAnalyzeTitle = titleTmp
        this.serviceAnalyzeResult = resultTmp
        console.log('serviceAnalyzeTitle', this.serviceAnalyzeResult, titleTmp)
      }
      /* echarts2 :title、value */
      for (let key in this.taskProcessCount) {
        taskPCount.push({
          value: this.taskProcessCount[key]
        })
      }
      /* echarts2:tatil */
      for (let index = 0; index < taskPCount.length; index++) {
        const element = taskPCount[index]
        for (let itemR of this.taskNameList) {
          titleTmp2.push(itemR.name)
          if (index === itemR.value) {
            element.name = itemR.name
          }
        }
      }

      if (titleTmp.length > 0 && taskPCount.length > 0) {
        this.serviceAnalyzeTitle2 = titleTmp2
        this.serviceAnalyzeResult2 = taskPCount
      }
      /* 调用图像函数 */
      this.echarts1()
      this.echarts2()
    },
    echarts1() {
      this.newSeverChartObj = echarts.init(document.getElementById('newSeverChartObj'))
      this.newSeverChartObj.setOption({
        color: ['#ffc626', '#00ae7f', '#0145ab', '#ff9326', '#ae2900', '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          right: 10,
          top: 'center',
          bottom: 20,
          data: this.serviceAnalyzeTitle.length !== 0 ? this.serviceAnalyzeTitle : [
            '暂无数据'
          ] // 动态数据
        },
        series: [
          {
            name: '服务类型占比',
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['24%', '50%'],
            // center: ['center', 'center'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'center',
              formatter: ' {b}: {d}% '
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '16' // 中间文字
              }
            },
            labelLine: {
              show: false
            },
            data: this.serviceAnalyzeResult.length !== 0 ? this.serviceAnalyzeResult : [{ value: 0, name: '暂无数据' }]// 动态数据
          }
        ]
      })
      window.addEventListener('resize', () => {
        this.resizeHandlePieOne()
      })
    },
    resizeHandlePieOne() {
      if (this.newSeverChartObj) {
        this.newSeverChartObj.resize()
      }
    },
    echarts2() {
      this.newSeverChartObj2 = echarts.init(document.getElementById('newSeverChartObj2'))
      this.newSeverChartObj2.setOption({
        color: ['#00ae7f', '#0145ab'],
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          top: 'center',
          right: '16%',
          orient: 'vertical',
          itemGap: 20,
          data: this.serviceAnalyzeTitle2 // 动态数据
        },
        series: [
          {
            name: '服务类型占比',
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['24%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'center',
              formatter: ' {b}: {d}% '
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '16' // 中间文字
              }
            },
            labelLine: {
              show: false
            },
            data: this.serviceAnalyzeResult2 // 动态数据
          }
        ]
      })
      window.addEventListener('resize', () => {
        this.resizeHandlePieTow()
      })
    },
    resizeHandlePieTow() {
      if (this.newSeverChartObj2) {
        this.newSeverChartObj2.resize()
      }
    }
  }

}
</script>

<style lang="scss" scoped>
.container_personalTotal {
  padding: 10px;

  .btns_box {
    display: flex;

    .btns {
      margin: 0 10px;
    }
  }

  #title {
    color: #787878;
    padding: 0 10px 0 0;
  }

  .tables_box {
    .tables_list {
      display: flex;
      padding: 20px 0;

      .Progress {
        flex: 1;
        display: flex;
        flex-direction: column;

        .Progress_matter {
          margin: 0 0 30px 0;
          .mater_title{
            color: #787878;
            padding: 0 0 4px 0;
          }

          & span {
            color: rgba(0,0,0,.45);
          }

          & div {
            font-size: 16px;
            margin: 8px 0;
          }

          .lineBox {
            height: 20px;
            display: flex;
            border-radius: 8px;
            background: rgba(204, 204, 204, 0.688);
            overflow: hidden;
            #line1 {
              margin: 0;
              border-radius: 8px 0 0 8px;
              background: #00ae7f;
              &:hover{
                box-shadow:  0 2px 12px 0 #00ae8086;
              }
            }

            #line2 {
              margin: 0;
              background: #ae2900;
              &:hover{
                box-shadow:  0 2px 12px 0 #ae290086;
              }
            }

            #line3 {
              margin: 0;
              background: #0046ae;
              &:hover{
                padding: 1px 0;
                box-shadow:  0 2px 12px 0 #0046ae7c;
              }
            }
          }
        }
      }

      .Rate_modle {
        flex: 1;
        margin-left: 60px;
        display: flex;
        // flex-direction: column;
        // border: 1px solid #e1e1e1;
        border-radius: 4px;
        // background-color: #00ae7f;
        .container_Rate{
          border: 1px solid #e1e1e1;
          border-left: none;
          border-radius: 0 8px 8px 0;
          padding: 0 30px 0 0;
        }
        .Rate {
          display: flex;
          // justify-content: space-around;
          align-items: center;
          border-bottom: 1px solid #e1e1e1;
          padding: 0 0 0 10px;

          &:last-child {
            border-bottom: 0;
          }

          .el-rate {
            height: 22px;

            &::v-deep .el-rate__icon {
              font-size: 20px;
            }
          }
        }
      }

      .synthesize {
        // flex: 1;
        text-align: center;
        line-height: 54px;
        padding: 30px;
        border: 1px solid #e1e1e1;
        border-radius: 8px 0 0 8px ;
        p{
          font-size: 24px;
          font-weight: 600;
          color: #787878;
        }
        #title2{
          color: #787878;
        }
        &:hover{
          box-shadow: 0 2px 12px 0 rgba(0,0,0,.09);
        }
      }
    }

    .tables_Echarts {
      display: flex;
      justify-content: space-around;
      // width: 1026px; //固定宽度
      margin: 20px 0 0 0;

      .charts_left {
        flex: 1;
        height: 240px;
      }

      .charts_right {
        flex: 1;
        height: 240px;
      }
    }
  }
}
</style>
<style  lang="scss" scoped>
// ui组件样式
/* 进度掉 */
::v-deep .el-progress-bar__outer{
 border-radius:0;
}
::v-deep .el-progress-bar__inner{
 border-radius:0;
}
</style>
