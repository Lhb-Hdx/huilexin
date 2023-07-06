<template>
  <div class="create-register">
    <div class="title">{{ wordRecordTitle }}</div>
    <div class="register-container">
      <div class="leftWrapper">
        <div class="first-content">
          <table style="width: 100%" cellspacing="0" cellpadding="0" class="tableStyle">
            <tr>
              <td style="width: 10%; text-align: center" :class="['name', seeFlag?'':'addRedStar']">名称</td>
              <td style="width: 40%"><input v-model="workRecordForm.name" type="text" :disabled="seeFlag"></td>
              <td style="width: 10%; text-align: center" :class="['name', seeFlag?'':'addRedStar']">发起人</td>
              <td style="width: 40%"><input v-model="workRecordName" type="text" disabled></td>
            </tr>
            <tr>
              <td style="width: 10%; text-align: center" :class="['name', seeFlag?'':'addRedStar']">日期</td>
              <td style="width: 40%">
                <el-date-picker
                  v-model="workRecordForm.createTime"
                  :picker-options="pickerOptions"
                  class="otherDatePicker disableDate"
                  type="date"
                  placeholder="选择日期"
                  style="width: 100%"
                  value-format="yyyy-MM-dd"
                  :disabled="seeFlag"
                />
              </td>
              <td style="width: 10%; text-align: center" :class="['name', seeFlag?'':'addRedStar']">类型</td>
              <td style="width: 40%">
                <el-select v-model="workRecordForm.classify" placeholder="请选择" :disabled="seeFlag" style="width: 100%" class="select" @change="changeSelect">
                  <el-option v-for="item in workOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </td>
            </tr>
            <tr>
              <td style="width: 10%; text-align: center" :class="['name', seeFlag?'':'addRedStar']">共享给</td>
              <td style="width: 40%">
                <el-select
                  v-if="!seeFlag"
                  v-model="workRecordFormUserId"
                  multiple
                  :disabled="seeFlag"
                  placeholder="请选择共享人，共享后对方可以查看你的记录"
                  style="width: 100%"
                  class="select"
                  @focus="getUserList"
                >
                  <el-option v-for="item in userList" :key="Number(item.userId)" :label="`${item.realName || ''} ${item.tel || ''}`" :value="Number(item.userId)" />
                </el-select>
                <input v-else :value="setUserInfo(workRecordFormUserId)" type="text" :disabled="seeFlag">
              </td>
              <td style="width: 10%; text-align: center" :class="['name', seeFlag?'':'addRedStar']">共享方式</td>
              <td style="width: 40%; padding: 0 0 0 10px" :class="seeFlag?'setWhiteBg':''">
                <!-- <el-checkbox v-model="checked">站内</el-checkbox> -->
                <el-checkbox v-model="workRecordForm.isWeixin" :disabled="seeFlag">微信</el-checkbox>
                <el-checkbox v-model="workRecordForm.isMail" :disabled="seeFlag">邮件</el-checkbox>
              </td>
            </tr>
          </table>
        </div>

        <div class="second-content">
          <el-card class="box-card" header="工作内容">
            <table style="width: 100%" class="tableStyle">
              <tr>
                <td style="width: 5%; text-align: center; height: 40px; background: #f8f8f8" class="name">序号</td>
                <td style="width: 25%; background: #f8f8f8" :class="seeFlag?'':'addRedStar'">工作内容</td>
                <td style="width: 20%; text-align: center; background: #f8f8f8" class="name">任务</td>
                <td style="width: 10%; background: #f8f8f8" :class="seeFlag?'':'addRedStar'">状态</td>
                <td style="width: 10%; background: #f8f8f8">完成进度(%)</td>
                <td style="width: 10%; background: #f8f8f8" :class="seeFlag?'':'addRedStar'">工时</td>
                <td style="width: 20%; background: #f8f8f8">预计完成时间</td>
              </tr>
              <tr v-for="(item, index) in workContentArrayForm" :key="index">
                <td style="width: 5%; text-align: center; height: 60px; background: #f8f8f8" class="name">{{ index + 1 }}</td>
                <td style="width: 25%"><input v-model="item.workContent" type="text" :disabled="seeFlag"></td>
                <td style="width: 20%; text-align: center" class="name">
                  <input v-model="item.task" type="text" :disabled="seeFlag">
                </td>
                <td style="width: 10%">
                  <el-select v-if="!seeFlag" v-model="item.state" placeholder="请选择" :disabled="seeFlag" style="width: 100%" class="select customDisabled">
                    <el-option v-for="item2 in workContentOptions" :key="item2.value" :label="item2.label" :value="item2.value" />
                  </el-select>
                  <input v-else :value="setStateInfo(item.state)" type="text" :disabled="seeFlag">
                </td>
                <td style="width: 10%">
                  <el-input-number v-if="!seeFlag" v-model="item.progress" :min="1" :disabled="seeFlag" :max="100" label="描述文字" @change="setProgerss" />
                  <input v-else :value="item.progress" type="text" style="text-align: center" :disabled="seeFlag">
                </td>
                <td style="width: 10%">
                  <el-select v-if="!seeFlag" v-model="item.workingHours" :disabled="seeFlag" placeholder="请选择" style="width: 100%" class="select customDisabled">
                    <el-option v-for="(item3, index2) in 24" :key="index2" :label="index2 + 1" :value="index2 + 1" />
                  </el-select>
                  <input v-else :value="item.workingHours" type="text" style="text-align: center" :disabled="seeFlag">
                </td>
                <td style="width: 20%">
                  <el-date-picker
                    v-if="!seeFlag"
                    v-model="item.endTime"
                    :picker-options="pickerFutureOptions"
                    class="otherDatePicker customDisabled"
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%"
                    value-format="yyyy-MM-dd"
                    :disabled="seeFlag"
                  />
                  <input v-else :value="setDateFormat(item.endTime)" type="text" style="text-align: center" :disabled="seeFlag">
                </td>
              </tr>
              <tr v-for="(item, index) in addWorkContentArrayForm" :key="index + 'tr'">
                <td style="width: 5%; text-align: center; height: 60px; background: #f8f8f8" class="name">{{ workContentArrayForm.length + 1 + index }}</td>
                <td style="width: 25%"><input v-model="item.workContent" type="text" :disabled="seeFlag"></td>
                <td style="width: 20%; text-align: center" class="name">
                  <input v-model="item.task" type="text" :disabled="seeFlag">
                </td>
                <td style="width: 10%">
                  <el-select v-if="!seeFlag" v-model="item.state" placeholder="请选择" :disabled="seeFlag" style="width: 100%" class="select customDisabled">
                    <el-option v-for="item2 in workContentOptions" :key="item2.value" :label="item2.label" :value="item2.value" />
                  </el-select>
                  <input v-else :value="setStateInfo(item.state)" type="text" :disabled="seeFlag">
                </td>
                <td style="width: 10%">
                  <el-input-number v-if="!seeFlag" v-model="item.progress" :min="1" :disabled="seeFlag" :max="100" label="描述文字" @change="setProgerss" />
                  <input v-else :value="item.progress" style="text-align: center" type="text" :disabled="seeFlag">
                </td>
                <td style="width: 10%">
                  <el-select v-if="!seeFlag" v-model="item.workingHours" :disabled="seeFlag" placeholder="请选择" style="width: 100%" class="select customDisabled">
                    <el-option v-for="(item3, index2) in 24" :key="index2" :label="index2 + 1" :value="index2 + 1" />
                  </el-select>
                  <input v-else :value="item.workingHours" style="text-align: center" type="text" :disabled="seeFlag">
                </td>
                <td style="width: 20%">
                  <el-date-picker
                    v-if="!seeFlag"
                    v-model="item.endTime"
                    :picker-options="pickerFutureOptions"
                    class="otherDatePicker customDisabled"
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%"
                    value-format="yyyy-MM-dd"
                    :disabled="seeFlag"
                  />
                  <input v-else :value="setDateFormat(item.endTime)" style="text-align: center" type="text" :disabled="seeFlag">
                </td>
              </tr>
            </table>
          </el-card>

          <div class="btn">
            <el-button v-if="!seeFlag" size="small" type="primary" :disabled="seeFlag" @click="addWorkContentLine">增加一行</el-button>
          </div>
        </div>
        <div class="third-content">
          <el-card class="box-card" header="接下来的计划">
            <table style="width: 100%" cellspacing="0" cellpadding="0" class="tableStyle">
              <tr>
                <td style="width: 5%; text-align: center; height: 40px; background: #f8f8f8" class="name">序号</td>
                <td style="width: 25%; background: #f8f8f8" :class="seeFlag?'':'addRedStar'">工作内容</td>
                <td style="width: 20%; text-align: center; background: #f8f8f8" class="name">任务</td>
                <td style="width: 15%; background: #f8f8f8">计划完成时间</td>
              </tr>
              <tr v-for="(item, index) in workPlanArrayForm" :key="index">
                <td style="width: 5%; text-align: center; height: 60px; background: #f8f8f8" class="name">{{ index + 1 }}</td>
                <td style="width: 40%"><input v-model="item.workContent" type="text" :disabled="seeFlag"></td>
                <td style="width: 35%; text-align: center" class="name">
                  <input v-model="item.task" :disabled="seeFlag" type="text">
                </td>
                <td style="width: 20%">
                  <el-date-picker
                    v-if="!seeFlag"
                    v-model="item.endTime"
                    :picker-options="pickerFutureOptions"
                    class="otherDatePicker customDisabled"
                    :disabled="seeFlag"
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%"
                    value-format="yyyy-MM-dd"
                  />
                  <input v-else :value="setDateFormat(item.endTime)" style="text-align: center" type="text" :disabled="seeFlag">
                </td>
              </tr>
              <tr v-for="(item, index) in addWorkPlanArrayForm" :key="index + 'str'">
                <td style="width: 5%; text-align: center; height: 60px; background: #f8f8f8" class="name">{{ workPlanArrayForm.length + 1 + index }}</td>
                <td style="width: 40%"><input v-model="item.workContent" type="text" :disabled="seeFlag"></td>
                <td style="width: 35%; text-align: center" class="name">
                  <input v-model="item.task" :disabled="seeFlag" type="text">
                </td>
                <td style="width: 20%">
                  <el-date-picker
                    v-if="!seeFlag"
                    v-model="item.endTime"
                    :picker-options="pickerFutureOptions"
                    class="otherDatePicker customDisabled"
                    :disabled="seeFlag"
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%"
                    value-format="yyyy-MM-dd"
                  />
                  <input v-else :value="setDateFormat(item.endTime)" style="text-align: center" type="text" :disabled="seeFlag">
                </td>
              </tr>
            </table>
          </el-card>
          <div class="btn">
            <el-button v-if="!seeFlag" size="small" type="primary" :disabled="seeFlag" @click="addWorkPlanLine">增加一行</el-button>
          </div>
        </div>

        <div class="forth-content">
          <el-card header="其他问题及反馈">
            <div class="textArea">
              <el-input v-model="workRecordForm.problem" :disabled="seeFlag" type="textarea" :autosize="autoFlag" />
            </div>
          </el-card>
        </div>
        <div class="fifth-content">
          <el-card header="附件">
            <table style="width: 100%" cellspacing="0" cellpadding="0" class="tableStyle">
              <tr>
                <td style="width: 5%; text-align: center; height: 40px; background: #f8f8f8" class="name">序号</td>
                <td style="width: 70%; background: #f8f8f8" :class="seeFlag?'':'addRedStar'">文件名称</td>
                <td style="width: 25%; background: #f8f8f8">操作</td>
              </tr>
              <tr>
                <td style="width: 5%; text-align: center; height: 60px; background: #f8f8f8" class="name">1</td>
                <td style="width: 70%"><input v-model="workRecordsFile.fileName" type="text" :disabled="seeFlag"></td>
                <td style="width: 40%">
                  <!-- <el-button type="text" size="mini">查看</el-button>
                  <el-button type="text" size="mini">删除</el-button>
                  <el-button type="text" size="mini">下载</el-button> -->
                  <div class="file-box">
                    <FileUpload
                      v-if="!seeFlag"
                      button-size="mini"
                      :limit="9"
                      button-text="上传附件"
                      :button-disabled="seeFlag"
                      :is-limit-file-size="true"
                      :file-max-size="1"
                      upload-type="doc"
                      :file-url-list="fileList"
                      @emitFileList="getEmitFileList"
                    />
                  </div>
                </td>
              </tr>
              <!-- <tr>
                <td style="width: 5%; text-align: center; height: 60px; background: #f8f8f8" class="name" />
                <td style="width: 70%; text-align: left; padding: 0 0 0 10px">
                  <FileUpload
                    v-if="!seeFlag"
                    button-size="mini"
                    :limit="9"
                    button-text="上传附件"
                    :button-disabled="seeFlag"
                    :is-limit-file-size="true"
                    :file-max-size="1"
                    upload-type="doc"
                    :file-url-list="fileList"
                    @emitFileList="getEmitFileList"
                  />
                </td>
                <td style="width: 40%" />
              </tr> -->
            </table>
          </el-card>
        </div>

        <div class="submitBtn">
          <el-button v-if="!seeFlag" type="success" @click="submitAllForm">保存提交</el-button>
          <el-button v-if="!seeFlag" type="info" @click="resetAllForm">重置</el-button>
        </div>
      </div>
      <div class="rightWrapper">
        <div class="card-wrapper">
          <el-card header="我的工作">
            <div class="select-box">
              <!-- <el-select id="dateSelect" v-model="value" placeholder="选择时间段">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
              </el-select> -->
              <div v-show="searchType === 1">
                <el-date-picker
                  v-model="myWorkTime"
                  type="date"
                  :picker-options="pickerOptions"
                  class="dateSelect"
                  placeholder="选择日期"
                  value-format="timestamp"
                  :append-to-body="false"
                  @change="changeWorkTime"
                />
              </div>

              <div v-show="searchType === 2">
                <el-date-picker
                  v-model="myWorkLongTime"
                  class="dateSelect"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  type="daterange"
                  value-format="timestamp"
                  :picker-options="pickerOptions"
                  :append-to-body="false"
                  unlink-panels
                  @change="findWorkRecordsMsg"
                />
              </div>
            </div>
            <div class="echart-wrapper">
              <div class="myTrouble">
                <div class="top-title">我处理的故障</div>
                <TroubleEchart :trouble-echart-data="troubleEchartData" />
              </div>
              <div class="myOpm">
                <div class="top-title">我处理的运维事项</div>
                <OpmEchart :ops-order-problem-echart-data="opsOrderProblemEchartData" />
              </div>
              <div class="myOrderWork">
                <div class="top-title">我的工单作业</div>
                <OrderWorkEchart :ops-order-work-task-echart-data="opsOrderWorkTaskEchartData" />
              </div>
            </div>
            <div class="workShow">
              <el-tabs v-model="activeName" @tab-click="tabsChange">
                <el-tab-pane label="故障" name="trouble">
                  <el-tabs v-if="activeName === 'trouble'" v-model="troubleActive" type="card" @tab-click="troubleTabsChange">
                    <el-tab-pane label="全部" name="all">
                      <!-- <el-table :data="opsOrderProblemTableData">
                        <el-table-column label="编号" />
                      </el-table> -->
                      <TroubleTable v-if="troubleActive === 'all'" ref="allTroubleTable" />
                    </el-tab-pane>
                    <el-tab-pane label="待处理" name="todoHandle">
                      <!-- <el-table :data="opsOrderProblemTableData">
                        <el-table-column label="编号" />
                      </el-table> -->
                      <TroubleTable v-if="troubleActive === 'todoHandle'" ref="todoHandleTroubleTable" />
                    </el-tab-pane>
                    <el-tab-pane label="已处理" name="handled">
                      <TroubleTable v-if="troubleActive === 'handled'" ref="handledTroubleTable" />
                    </el-tab-pane>
                    <el-tab-pane label="自动恢复" name="autoRecovery">
                      <TroubleTable v-if="troubleActive === 'autoRecovery'" ref="autoRecoveryTroubleTable" />
                    </el-tab-pane>
                    <el-tab-pane label="处理中" name="handling">
                      <TroubleTable v-if="troubleActive === 'handling'" ref="handlingTroubleTable" />
                    </el-tab-pane>
                  </el-tabs>
                </el-tab-pane>
                <el-tab-pane label="事项" name="matter">
                  <el-tabs v-if="activeName === 'matter'" v-model="matterActive" type="card" @tab-click="matterTabsChange">
                    <el-tab-pane label="待处理" name="todoHandle">
                      <MatterTable v-if="matterActive === 'todoHandle'" ref="todoHandleMatterTable" />
                    </el-tab-pane>
                    <el-tab-pane label="处理中" name="handling">
                      <MatterTable v-if="matterActive === 'handling'" ref="handlingMatterTable" />
                    </el-tab-pane>
                    <el-tab-pane label="成功处理" name="successHandle">
                      <MatterTable v-if="matterActive === 'successHandle'" ref="successHandleMatterTable" />
                    </el-tab-pane>
                    <el-tab-pane label="处理失败" name="failHandle">
                      <MatterTable v-if="matterActive === 'failHandle'" ref="failHandleMatterTable" />
                    </el-tab-pane>
                  </el-tabs>
                </el-tab-pane>
                <el-tab-pane label="作业" name="task">
                  <el-tabs v-if="activeName === 'task'" v-model="taskActive" type="card" @tab-click="taskTabsChange">
                    <el-tab-pane label="待处理" name="todoHandle">
                      <TaskTable v-if="taskActive === 'todoHandle'" ref="todoHandleTaskTable" />
                    </el-tab-pane>
                    <el-tab-pane label="处理中" name="handling">
                      <TaskTable v-if="taskActive === 'handling'" ref="handlingTaskTable" />
                    </el-tab-pane>
                    <el-tab-pane label="成功处理" name="successHandle">
                      <TaskTable v-if="taskActive === 'successHandle'" ref="successHandleTaskTable" />
                    </el-tab-pane>
                    <el-tab-pane label="处理失败" name="failHandle">
                      <TaskTable v-if="taskActive === 'failHandle'" ref="failHandleTaskTable" />
                    </el-tab-pane>
                  </el-tabs>
                </el-tab-pane>
              </el-tabs>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import OpmEchart from './components/opm-echart'
import MatterTable from './components/matter-table'
import TaskTable from './components/task-table'
import TroubleTable from './components/trouble-table'
// import TaskTable from './components/task-table'
import TroubleEchart from './components/trouble-echart'
import OrderWorkEchart from './components/orderWork-echart'
import FileUpload from '@/components/Upload/file-upload.vue'
export default {
  name: 'CreateRegister',
  components: {
    OpmEchart,
    OrderWorkEchart,
    TroubleEchart,
    FileUpload,
    TaskTable,
    MatterTable,
    TroubleTable
  },
  data() {
    return {
      workRecordForm: {
        name: '',
        userId: this.$auth.getUserSession().userId,
        isMail: 0,
        isWeixin: 0,
        createTime: '',
        classify: '',
        problem: ''
      },
      workRecordFormUserId: [],
      isWeixin: false,
      isMail: false,
      createTime: '',
      startCLock: '',
      endClock: '',
      addWorkContentArrayForm: [
        {
          workContent: '',
          task: '',
          state: '', // 状态：0未开始，1进行中，2已完成
          progress: '', // double%?
          workingHours: '',
          endTime: ''
        }
      ],
      workContentArrayForm: [],
      workContentForm: {
        workContent: '',
        task: '',
        state: '', // 状态：0未开始，1进行中，2已完成
        progress: '', // double%?
        workingHours: '',
        endTime: ''
      },
      addWorkPlanArrayForm: [
        {
          workContent: '',
          task: '',
          endTime: ''
        }
      ],
      workPlanArrayForm: [],
      workPlanForm: {
        workContent: '',
        task: '',
        endTime: ''
      },
      queryId: '',
      matterTableLoading: false,
      workContentOptions: [
        {
          value: 0,
          label: '未开始'
        },
        {
          value: 1,
          label: '进行中'
        },
        {
          value: 2,
          label: '已完成'
        }
      ],
      opsOrderState: [
        { code: 'todoHandle', query: { processState: 0 } },
        { code: 'handling', query: { processState: 1 } },
        { code: 'successHandle', query: { processState: 2 } },
        { code: 'failHandle', query: { processState: 3 } }
      ],
      workRecordName: '',
      rules: {
        name: [],
        userId: []
      },
      myWorkTime: '',
      myWorkLongTime: '',
      workRecordsFile: {
        fileName: '',
        url: '',
        fileType: ''
      },
      userList: [],
      autoFlag: false,
      groupIds: [],
      workOptions: [
        {
          value: 'day',
          label: '工作日报'
        },
        {
          value: 'week',
          label: '工作周报'
        },
        {
          value: 'month',
          label: '工作月报'
        },
        {
          value: 'season',
          label: '季度报告'
        },
        {
          value: 'year',
          label: '年度报告'
        }
      ],
      searchType: 1,
      opsOrderProblemTableData: [],
      troubleEchartData: [],
      opsOrderProblemEchartData: [],
      opsOrderWorkTaskEchartData: [],
      value: '',
      workValue: '',
      checked: '',
      checked2: '',
      checked3: '',
      textAreaV: '',
      activeName: '',
      matterActive: 'todoHandle',
      troubleActive: 'all',
      troubleTabItem: [
        { name: 'all', query: '' },
        { name: 'todoHandle', query: '0' },
        { name: 'handled', query: '1' },
        { name: 'autoRecovery', query: '3' },
        { name: 'handling', query: '4' }
      ],
      matterTabItem: [
        { name: 'todoHandle', query: '0' },
        { name: 'handling', query: '1' },
        { name: 'successHandle', query: '2' },
        { name: 'failHandle', query: '3' }
      ],
      taskTabItem: [
        { name: 'todoHandle', query: '' },
        { name: 'handling', query: '1' },
        { name: 'successHandle', query: '3' },
        { name: 'failHandle', query: '2' }
      ],
      taskActive: 'todoHandle',
      loginUser: '',
      listQuery: {
        page: 1,
        limit: 10
      },
      tableCount: 0,
      toDayDate: '',
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      },
      pickerFutureOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now()
        }
      },
      reportId: '',
      fileList: [],
      fileId: [],
      updateFlag: '',
      seeFlag: false
    }
  },
  computed: {
    menuQuery() {
      return this.$route.meta.menuQuery
    },
    setStateInfo() {
      return function(state) {
        const idx = this.workContentOptions.findIndex(item => Number(state) === state)
        if (idx !== -1) {
          return this.workContentOptions[idx].label
        }
      }
    },
    setUserInfo() {
      return function(userId) {
        console.log(userId)
        if (userId.length > 0) {
          let result = ''
          userId.forEach(v => {
            const idx = this.userList.findIndex(item => Number(item.userId) === Number(v))
            console.log(idx)
            console.log(this.userList)
            if (idx !== -1) {
              result += result ? '、' + this.userList[idx].realName : this.userList[idx].realName
            }
          })
          return result
        }
      }
    },
    setDateFormat() {
      return function(time) {
        if (time) {
          return this.$tool.dateFormat('YYYY-mm-dd', new Date(time))
        } else {
          return ''
        }
      }
    },
    wordRecordTitle() {
      return this.$route.meta.title
    },
    routerReportId() {
      return this.$route.query.reportId
    }
  },
  created() {
    console.log(this.menuQuery)
    console.log(this.$route)
    this.loginUser = this.localStorageOperation('get', 'userInfo')
    if (this.menuQuery.update) {
      this.updateFlag = true
      this.addWorkContentArrayForm = []
      this.addWorkPlanArrayForm = []
      this.getOpsOrderWorkRecords()
      this.findOpsOrderWorkPlan()
      this.findOpsOrderWorkContent()
      this.findOpsOrderWorkRecordsFile()
      this.findRelatedSysUser()
    } else if (this.menuQuery.see) {
      this.seeFlag = true
      this.getOpsOrderWorkRecords()
      this.findOpsOrderWorkPlan()
      this.findOpsOrderWorkContent()
      this.findOpsOrderWorkRecordsFile()
      this.findRelatedSysUser()
    } else {
      this.workRecordName = this.loginUser.realName
    }
  },
  async mounted() {
    // this.initialOpsOrderProblem()
    this.activeName = 'trouble'
  },
  methods: {
    async getUserList() {
      if (this.userList.length > 0) return
      const userQuery = {
        companyId: this.$auth.getUserSession().companyId,
        limit: -1
      }
      const { data } = await this.$request({ url: this.api.sys.findSysUser, data: userQuery })
      // 暂时先全部，看看懒加载
      if (data.length > 0) {
        this.userList = data
      }
    },
    async findRelatedSysUser() {
      const userQuery = {
        companyId: this.$auth.getUserSession().companyId,
        limit: -1
      }
      const { data } = await this.$request({ url: this.api.sys.findSysUser, data: userQuery })
      if (data.length > 0) {
        this.userList = data
        const relatedUserId = await this.$request({ url: this.api.opm.findOpsOrderWorkRecordsUserMap, data: { reportId: this.routerReportId } })
        if (relatedUserId.code !== -1 && relatedUserId.data.length > 0) {
          const workRecordFormUserId = relatedUserId.data.map(item => item.userId)
          this.workRecordFormUserId = workRecordFormUserId
        }
      }
    },
    async getOpsOrderWorkRecords() {
      const { model, code } = await this.$request({ url: this.api.opm.getOpsOrderWorkRecords, data: { reportId: this.routerReportId } })
      if (code !== -1) {
        let { classify, createTime, isMail, isWeixin, name, problem, userId } = model
        const { data, code: userCode } = await this.$request({ url: this.api.sys.findSysUser, data: { ids: userId, companyId: this.$auth.getUserSession().companyId } })
        if (userCode === -1) {
          this.$message({ type: 'error', message: '获取发起人错误' })
        }
        this.workRecordName = data[0].realName
        console.log(this.workRecordName)
        this.workRecordForm = {
          classify,
          createTime,
          isMail: !!isMail,
          isWeixin: !!isWeixin,
          name,
          problem,
          userId
        }
      }
    },
    async findOpsOrderWorkPlan() {
      const { data, code } = await this.$request({ url: this.api.opm.findOpsOrderWorkPlan, data: { reportId: this.routerReportId } })
      if (code !== -1) {
        this.workPlanArrayForm = data
      }
    },
    async findOpsOrderWorkContent() {
      const { data, code } = await this.$request({ url: this.api.opm.findOpsOrderWorkContent, data: { reportId: this.routerReportId } })
      if (code !== -1) {
        this.workContentArrayForm = data
        // this.contentId = data.length > 0 ? data[0].contentId : ''
      }
    },
    async findOpsOrderWorkRecordsFile() {
      const { data, code } = await this.$request({ url: this.api.opm.findOpsOrderWorkRecordsFile, data: { reportId: this.routerReportId } })
      if (code !== -1) {
        if (data.length > 0) {
          const fileList = data.map(item => {
            if (item.url) {
              return JSON.parse(item.url)
            } else {
              return ''
            }
          })
          this.fileList = fileList.some(item => item === '') ? [] : fileList
          console.log(fileList, 'filelisst')
          this.workRecordsFile.fileName = data[0].fileName
          this.fileId = data.map(item => JSON.parse(item.fileId))

          console.log(this.fileList, 'filelist')
        }
      } else {
        this.fileList = []
      }
    },
    tabsChange() {
      if (this.searchType === 1 && this.myWorkTime) {
        let startCLock = ''
        let endClock = ''
        let sTime = this.$tool.formatTime(new Date(this.myWorkTime))
        let eTime = this.$tool.formatTime(new Date(this.myWorkTime + 86399000))
        let createStime = this.$tool.formatTime(new Date(this.myWorkTime))
        let createEtime = this.$tool.formatTime(new Date(this.myWorkTime + 86399000))
        console.log(sTime, eTime)
        startCLock = parseInt(this.myWorkTime / 1000)
        // 目前日期的时间戳
        endClock = parseInt((this.myWorkTime + 86399000) / 1000)
        switch (this.activeName) {
          case 'trouble':
            this.troubleActive = 'all'
            this.$nextTick(() => {
              this.$refs.allTroubleTable.initTroubleLog({ status: '', startCLock, endClock })
            })
            break
          case 'matter':
            this.matterActive = 'todoHandle'
            this.$nextTick(() => {
              this.$refs.todoHandleMatterTable.initTroubleLog({ processState: 0, sTime, eTime })
            })
            break
          case 'task':
            this.taskActive = 'todoHandle'
            this.$nextTick(() => {
              this.$refs.todoHandleTaskTable.initTroubleLog({ statue: '', createStime, createEtime })
            })
            break
        }
      } else {
        if (this.myWorkLongTime.length <= 0) return
        let startCLock = ''
        let endClock = ''
        let sTime = this.$tool.formatTime(new Date(this.myWorkLongTime[0]))
        let eTime = this.$tool.formatTime(new Date(this.myWorkLongTime[1] + 86399000))
        let createStime = this.$tool.formatTime(new Date(this.myWorkLongTime[0]))
        let createEtime = this.$tool.formatTime(new Date(this.myWorkLongTime[1] + 86399000))

        startCLock = parseInt(this.myWorkLongTime[0] / 1000)
        // 目前日期的时间戳
        endClock = parseInt((this.myWorkLongTime[1] + 86399000) / 1000)
        switch (this.activeName) {
          case 'trouble':
            this.troubleActive = 'all'
            this.$nextTick(() => {
              this.$refs.allTroubleTable.initTroubleLog({ status: '', startCLock, endClock })
            })
            break
          case 'matter':
            this.matterActive = 'todoHandle'
            console.log('matter')
            this.$nextTick(() => {
              this.$refs.todoHandleMatterTable.initTroubleLog({ processState: 0, sTime, eTime })
            })
            break
          case 'task':
            this.taskActive = 'todoHandle'
            this.$nextTick(() => {
              this.$refs.todoHandleTaskTable.initTroubleLog({ statue: '', createStime, createEtime })
            })
            break
        }
      }
    },
    changeSelect(item) {
      if (item !== 'day') {
        this.searchType = 2
      } else {
        this.searchType = 1
        // const date = new Date()
        // this.toDayDate = this.$tool.dateFormat('YYYY-mm-dd', date)
        // this.startCLock = this.$tool.getTimeF(this.toDayDate) + ''
        // this.$refs.TroubleTable.initTroubleLog({ startCLock: this.startCLock })
        // console.log(this.startCLock, 'this.starts')
      }
      console.log(item)
    },
    // 事项选项卡事件
    matterTabsChange() {
      // console.log(this.activeName)
      // console.log(this.myWorkLongTime)
      // console.log(this.myWorkTime)
      // console.log(this.$tool.dateFormat('YYYY-mm-dd', new Date(this.myWorkTime)))
      // switch(){

      // }
      // this.initialOpsOrderProblem()
      let sTime
      let eTime
      const idx = this.matterTabItem.findIndex(item => item.name === this.matterActive)
      if (this.searchType === 1) {
        if (!this.myWorkTime) return
        sTime = this.myWorkTime ? this.$tool.dateFormat('YYYY-mm-dd', new Date(parseInt(this.myWorkTime))) : ''
        // 目前日期的时间戳
        console.log(sTime, 'stime')
        eTime = this.$tool.dateFormat('YYYY-mm-dd', new Date())
        console.log(eTime, 'eTime')
        if (idx !== -1) {
          // const name = `${this.troubleActive}TroubleTable`
          switch (this.matterActive) {
            case 'todoHandle':
              console.log(1)
              this.$nextTick(() => {
                this.$refs.todoHandleMatterTable.initTroubleLog({ processState: this.matterTabItem[idx].query, sTime, eTime })
              })
              break
            case 'handling':
              // console.log();
              console.log(2)
              this.$nextTick(() => {
                this.$refs.handlingMatterTable.initTroubleLog({ processState: this.matterTabItem[idx].query, sTime, eTime })
              })
              break
            case 'successHandle':
              console.log(3)
              this.$nextTick(() => {
                this.$refs.successHandleMatterTable.initTroubleLog({ processState: this.matterTabItem[idx].query, sTime, eTime })
              })
              break
            case 'failHandle':
              console.log(4)
              this.$nextTick(() => {
                this.$refs.failHandleMatterTable.initTroubleLog({ processState: this.matterTabItem[idx].query, sTime, eTime })
              })
              break
          }
          // this.$refs.TroubleTable.initTroubleLog({ status: this.troubleTabItem[idx].query, startCLock, endClock })
        }
      } else {
        if (this.myWorkLongTime.length <= 0) return
        console.log(this.myWorkLongTime, 'longtime')
        sTime = this.myWorkLongTime[0] ? this.$tool.dateFormat('YYYY-mm-dd', new Date(parseInt(this.myWorkLongTime[0]))) : ''
        // 目前日期的时间戳
        eTime = this.myWorkLongTime[1] ? this.$tool.dateFormat('YYYY-mm-dd', new Date(parseInt(this.myWorkLongTime[1]))) : ''
        if (idx !== -1) {
          switch (this.matterActive) {
            case 'todoHandle':
              this.$nextTick(() => {
                this.$refs.todoHandleMatterTable.initTroubleLog({ processState: this.matterTabItem[idx].query, sTime, eTime })
              })
              break
            case 'handling':
              this.$nextTick(() => {
                this.$refs.handlingMatterTable.initTroubleLog({ processState: this.matterTabItem[idx].query, sTime, eTime })
              })
              break
            case 'successHandle':
              this.$nextTick(() => {
                this.$refs.successHandleMatterTable.initTroubleLog({ processState: this.matterTabItem[idx].query, sTime, eTime })
              })
              break
            case 'failHandle':
              this.$nextTick(() => {
                this.$refs.failHandleMatterTable.initTroubleLog({ processState: this.matterTabItem[idx].query, sTime, eTime })
              })
              break
          }
          // this.$refs.TroubleTable.initTroubleLog({ status: this.troubleTabItem[idx].query, startCLock, endClock })
        }
      }
    },
    // 故障选项卡事件
    troubleTabsChange() {
      console.log(this.troubleActive, 'troubleActive')
      let startCLock
      let endClock
      const idx = this.troubleTabItem.findIndex(item => item.name === this.troubleActive)
      if (this.searchType === 1) {
        if (!this.myWorkTime) return
        startCLock = parseInt(this.myWorkTime / 1000)
        // 目前日期的时间戳
        endClock = parseInt(Date.parse(new Date()) / 1000)
        if (idx !== -1) {
          // const name = `${this.troubleActive}TroubleTable`
          switch (this.troubleActive) {
            case 'all':
              this.$nextTick(() => {
                this.$refs.allTroubleTable.initTroubleLog({ status: this.troubleTabItem[idx].query, startCLock, endClock })
              })
              break
            case 'todoHandle':
              // console.log();
              this.$nextTick(() => {
                this.$refs.todoHandleTroubleTable.initTroubleLog({ status: this.troubleTabItem[idx].query, startCLock, endClock })
              })
              break
            case 'handled':
              this.$nextTick(() => {
                this.$refs.handledTroubleTable.initTroubleLog({ status: this.troubleTabItem[idx].query, startCLock, endClock })
              })
              break
            case 'autoRecovery':
              this.$nextTick(() => {
                this.$refs.autoRecoveryTroubleTable.initTroubleLog({ status: this.troubleTabItem[idx].query, startCLock, endClock })
              })
              break
            case 'handling':
              this.$nextTick(() => {
                this.$refs.handlingTroubleTable.initTroubleLog({ status: this.troubleTabItem[idx].query, startCLock, endClock })
              })
              break
          }
          // this.$refs.TroubleTable.initTroubleLog({ status: this.troubleTabItem[idx].query, startCLock, endClock })
        }
      } else {
        if (this.myWorkLongTime.length <= 0) return
        console.log(this.myWorkLongTime, 'longtime')
        startCLock = parseInt(this.myWorkLongTime[0] / 1000)
        // 目前日期的时间戳
        endClock = parseInt(this.myWorkLongTime[1] / 1000)
        if (idx !== -1) {
          switch (this.troubleActive) {
            case 'all':
              this.$nextTick(() => {
                this.$refs.allTroubleTable.initTroubleLog({ status: this.troubleTabItem[idx].query, startCLock, endClock })
              })
              break
            case 'todoHandle':
              this.$nextTick(() => {
                this.$refs.todoHandleTroubleTable.initTroubleLog({ status: this.troubleTabItem[idx].query, startCLock, endClock })
              })
              break
            case 'handled':
              this.$nextTick(() => {
                this.$refs.handledTroubleTable.initTroubleLog({ status: this.troubleTabItem[idx].query, startCLock, endClock })
              })
              break
            case 'autoRecovery':
              this.$nextTick(() => {
                this.$refs.autoRecoveryTroubleTable.initTroubleLog({ status: this.troubleTabItem[idx].query, startCLock, endClock })
              })
              break
            case 'handling':
              this.$nextTick(() => {
                this.$refs.handlingTroubleTable.initTroubleLog({ status: this.troubleTabItem[idx].query, startCLock, endClock })
              })
              break
          }
          // this.$refs.TroubleTable.initTroubleLog({ status: this.troubleTabItem[idx].query, startCLock, endClock })
        }
      }
    },
    // 作业选项卡事件
    taskTabsChange() {
      let createStime
      let createEtime
      const idx = this.taskTabItem.findIndex(item => item.name === this.taskActive)
      console.log(this.taskActive, 'activ')
      if (this.searchType === 1) {
        if (!this.myWorkTime) return
        createStime = this.myWorkTime ? this.$tool.dateFormat('YYYY-mm-dd', new Date(parseInt(this.myWorkTime))) : ''
        // 目前日期的时间戳
        // console.log(sTime, 'stime')
        createEtime = this.$tool.dateFormat('YYYY-mm-dd', new Date())
        // console.log(eTime, 'eTime')
        if (idx !== -1) {
          // const name = `${this.troubleActive}TroubleTable`
          switch (this.taskActive) {
            case 'todoHandle':
              this.$nextTick(() => {
                this.$refs.todoHandleTaskTable.initTroubleLog({ statue: this.matterTabItem[idx].query, createStime, createEtime })
              })
              break
            case 'handling':
              // console.log();
              this.$nextTick(() => {
                this.$refs.handlingTaskTable.initTroubleLog({ statue: this.matterTabItem[idx].query, createStime, createEtime })
              })
              break
            case 'successHandle':
              this.$nextTick(() => {
                this.$refs.successHandleTaskTable.initTroubleLog({ statue: this.matterTabItem[idx].query, createStime, createEtime })
              })
              break
            case 'failHandle':
              this.$nextTick(() => {
                this.$refs.failHandleTaskTable.initTroubleLog({ statue: this.matterTabItem[idx].query, createStime, createEtime })
              })
              break
          }
          // this.$refs.TroubleTable.initTroubleLog({ status: this.troubleTabItem[idx].query, startCLock, endClock })
        }
      } else {
        if (this.myWorkLongTime.length <= 0) return
        console.log(this.myWorkLongTime, 'longtime')
        createStime = this.myWorkLongTime[0] ? this.$tool.dateFormat('YYYY-mm-dd', new Date(parseInt(this.myWorkLongTime[0]))) : ''
        // 目前日期的时间戳
        createEtime = this.myWorkLongTime[1] ? this.$tool.dateFormat('YYYY-mm-dd', new Date(parseInt(this.myWorkLongTime[1]))) : ''
        if (idx !== -1) {
          switch (this.taskActive) {
            case 'todoHandle':
              this.$nextTick(() => {
                this.$refs.todoHandleTaskTable.initTroubleLog({ statue: this.matterTabItem[idx].query, createStime, createEtime })
              })
              break
            case 'handling':
              this.$nextTick(() => {
                this.$refs.handlingTaskTable.initTroubleLog({ statue: this.matterTabItem[idx].query, createStime, createEtime })
              })
              break
            case 'successHandle':
              this.$nextTick(() => {
                this.$refs.successHandleTaskTable.initTroubleLog({ statue: this.matterTabItem[idx].query, createStime, createEtime })
              })
              break
            case 'failHandle':
              this.$nextTick(() => {
                this.$refs.failHandleTaskTable.initTroubleLog({ statue: this.matterTabItem[idx].query, createStime, createEtime })
              })
              break
          }
          // this.$refs.TroubleTable.initTroubleLog({ status: this.troubleTabItem[idx].query, startCLock, endClock })
        }
      }
    },
    addWorkContentLine() {
      console.log(this.addWorkContentArrayForm.length)
      console.log(this.workContentArrayForm.length)
      // this.workContentArrayForm.push(this.workContentForm)
      const uniqueObject = this.$tool.deepCopy(this.workContentForm)

      this.$set(this.addWorkContentArrayForm, this.addWorkContentArrayForm.length, uniqueObject)
    },
    addWorkPlanLine() {
      // this.workPlanArrayForm.push(this.workPlanForm)
      const uniqueObject = this.$tool.deepCopy(this.workPlanForm)
      this.$set(this.addWorkPlanArrayForm, this.addWorkPlanArrayForm.length, uniqueObject)
    },
    setProgerss(item) {
      console.log(item)
    },
    getCurrentQuery() {
      const idx = this.opsOrderState.findIndex(item => item.code === this.matterActive)
      return this.opsOrderState[idx].query
    },
    async findOpsOrderWorkTaskToEchart(createStime, createEtime) {
      const workTask = await this.$request({
        url: this.api.opm.findOpsOrderWorkTask,
        data: {
          userId: this.$auth.getUserSession().userId,
          limit: -1,
          createStime,
          createEtime
        }
      })
      const opsOrderWorkTaskEchartData = [
        { name: '待处理', value: 0 },
        { name: '处理中', value: 0 },
        { name: '成功处理', value: 0 },
        { name: '处理失败', value: 0 }
      ]
      console.log(workTask, 'workTask')
      if (workTask.data.length > 0) {
        console.log(workTask, 'workTask')
        workTask.data.forEach(item => {
          switch (item.statue) {
            case null:
              console.log('zheshinull')
              opsOrderWorkTaskEchartData[0].value++
              break
            case 1:
              opsOrderWorkTaskEchartData[1].value++
              break
            case 2:
              opsOrderWorkTaskEchartData[2].value++
              break
            case 3:
              opsOrderWorkTaskEchartData[3].value++
              break
          }
        })
        this.opsOrderWorkTaskEchartData = this.$tool.deepCopy(opsOrderWorkTaskEchartData)
      } else {
        this.opsOrderWorkTaskEchartData = this.$tool.deepCopy(opsOrderWorkTaskEchartData)
      }
    },
    //  事项Echart数据
    async findOpsOrderProblemToEchart(sTime, eTime) {
      // 查询当前用户小组事项
      const groupIds = []
      const opsOrderProblemEchartData = [
        { name: '待处理', value: 0 },
        { name: '处理中', value: 0 },
        { name: '成功处理', value: 0 },
        { name: '处理失败', value: 0 }
      ]
      console.log('事项Echart数据')
      const findHrUserGroupMap = await this.findHrUserGroupMap({ userId: this.$auth.getUserSession().userId, limit: -1 })
      if (findHrUserGroupMap && findHrUserGroupMap.data && findHrUserGroupMap.data.length > 0) {
        findHrUserGroupMap.data.forEach(item => groupIds.push(item.groupId))
      } else {
        this.opsOrderProblemEchartData = this.$tool.deepCopy(opsOrderProblemEchartData)
      }

      if (groupIds.length > 0) {
        const findOpsOrderProblem = await this.findOpsOrderProblem({ sTime, eTime, groupIds: this.$tool.uniqueArray(groupIds).toString() })

        if (findOpsOrderProblem.data.length > 0 && findOpsOrderProblem) {
          findOpsOrderProblem.data.forEach(item => {
            switch (item.processState) {
              case 0:
                opsOrderProblemEchartData[0].value++
                break
              case 1:
                opsOrderProblemEchartData[1].value++
                break
              case 2:
                opsOrderProblemEchartData[2].value++
                break
              case 3:
                opsOrderProblemEchartData[3].value++
                break
            }
          })
          //  this.tableData = findOpsOrderProblem.map.problem
          console.log(opsOrderProblemEchartData)
          this.opsOrderProblemEchartData = this.$tool.deepCopy(opsOrderProblemEchartData)
        } else {
          this.opsOrderProblemEchartData = this.$tool.deepCopy(opsOrderProblemEchartData)
        }
      }
    },
    async initialOpsOrderProblem() {
      this.matterTableLoading = true
      console.log(this.getCurrentQuery(), '1222222222')
      const groupIds = []
      if (this.groupIds.length === 0) {
        // 查询当前用户小组事项
        const findHrUserGroupMap = await this.findHrUserGroupMap({ userId: this.$auth.getUserSession().userId, limit: -1 })
        if (findHrUserGroupMap && findHrUserGroupMap.data && findHrUserGroupMap.data.length > 0) {
          findHrUserGroupMap.data.forEach(item => groupIds.push(item.groupId))
          this.groupIds = groupIds
        } else {
          this.opsOrderProblemTableData = []
        }
      }
      // 用分组ids查事项列表
      if (this.groupIds.length > 0) {
        const findOpsOrderProblem = await this.findOpsOrderProblem({ groupIds: this.$tool.uniqueArray(this.groupIds).toString(), ...this.listQuery, ...this.getCurrentQuery() })
        if (findOpsOrderProblem.data && findOpsOrderProblem) {
          //  this.tableData = findOpsOrderProblem.map.problem
          this.opsOrderProblemTableData = findOpsOrderProblem.data
          this.tableCount = +findOpsOrderProblem.count
          console.log(this.tableCount, 'tablecount')
        }
      }
      this.matterTableLoading = false
    },
    // 用户关联人员分组
    async findHrUserGroupMap(query) {
      const { code, data, count } = await this.$request({
        url: this.api.sys.findHrUserGroupMap,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    // 查询事项
    async findOpsOrderProblem(query) {
      let { code, data, count } = await this.$request({
        url: this.api.opm.findOpsOrderProblem,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    changeWorkTime(item) {
      console.log(item)
      console.log(this.activeName)
      console.log(this.$tool.formatTime(new Date(item)))
      console.log(this.$tool.formatTime(new Date(item + 86399000)))
      let startCLock = ''
      let endClock = ''
      let sTime = this.$tool.formatTime(new Date(item))
      let eTime = this.$tool.formatTime(new Date(item + 86399000))
      let createStime = this.$tool.formatTime(new Date(item))
      let createEtime = this.$tool.formatTime(new Date(item + 86399000))
      this.activeName = 'trouble'
      this.troubleActive = 'all'
      startCLock = parseInt(item / 1000)
      // 目前日期的时间戳
      endClock = parseInt((item + 86399000) / 1000)
      this.troubleActive = 'all'
      this.$nextTick(() => {
        this.$refs.allTroubleTable.initTroubleLog({ startCLock, endClock })
      })

      this.findZbxAlarmLogToEchart(startCLock, endClock)
      this.findOpsOrderProblemToEchart(sTime, eTime)
      this.findOpsOrderWorkTaskToEchart(createStime, createEtime)
      // switch (this.activeName) {
      //   case 'trouble':
      //     console.log(this.$refs.TroubleTable)
      //     // 选择的时间戳
      //     startCLock = parseInt(item / 1000)
      //     // 目前日期的时间戳
      //     endClock = parseInt(Date.parse(new Date()) / 1000)
      //     this.troubleActive = 'all'
      //     this.$nextTick(() => {
      //       this.$refs.allTroubleTable.initTroubleLog({ startCLock, endClock })
      //     })
      //     break
      //   case 'matter':
      //     console.log(this.$refs.TroubleTable)
      //     break
      //   case 'task':
      //     console.log(this.$refs.TroubleTable)
      //     break
      // }
    },
    // 查找故障数据，过滤给echarts
    async findZbxAlarmLogToEchart(startCLock, endClock) {
      // let startCLock
      // let endClock
      const agentsIds = this.sessionStorageOperation('get', 'agentId')
      const query = { limit: -1, userId: this.loginUser.userId, agents: agentsIds, startCLock, endClock }
      const { data, code } = await this.$request({ url: this.api.opm.findZbxAlarmLog, data: query })
      const troubleEchartData = [
        { name: '已确认', value: 0 },
        { name: '关闭', value: 0 }
      ]
      if (code === 1 && data.length > 0) {
        data.forEach(item => {
          if (item.status === 4) {
            troubleEchartData[0].value++
          }
          if (item.status === 1) {
            troubleEchartData[1].value++
          }
        })
        this.troubleEchartData = this.$tool.deepCopy(troubleEchartData)
        console.log(data)
      } else {
        this.troubleEchartData = this.$tool.deepCopy(troubleEchartData)
      }
    },
    findWorkRecordsMsg(item) {
      if (!item) return
      let startCLock = ''
      let endClock = ''
      let sTime = this.$tool.formatTime(new Date(item[0]))
      let eTime = this.$tool.formatTime(new Date(item[1] + 86399000))
      let createStime = this.$tool.formatTime(new Date(item[0]))
      let createEtime = this.$tool.formatTime(new Date(item[1] + 86399000))
      this.activeName = 'trouble'
      this.troubleActive = 'all'
      startCLock = parseInt(item[0] / 1000)
      // 目前日期的时间戳
      endClock = parseInt((item[1] + 86399000) / 1000)
      this.troubleActive = 'all'
      this.$nextTick(() => {
        this.$refs.allTroubleTable.initTroubleLog({ startCLock, endClock })
      })

      this.findZbxAlarmLogToEchart(startCLock, endClock)
      this.findOpsOrderProblemToEchart(sTime, eTime)
      this.findOpsOrderWorkTaskToEchart(createStime, createEtime)
    },
    async insertOpsOrderWorkRecords() {
      this.workRecordForm.isMail = this.workRecordForm.isMail ? 1 : 0
      this.workRecordForm.isWeixin = this.workRecordForm.isWeixin ? 1 : 0
      this.workRecordForm.createTime = this.$tool.dateFormat('YYYY-mm-dd', new Date(this.workRecordForm.createTime))
      // console.log(this.workRecordForm, 'workrecoredform')
      return await this.$request({
        url: this.updateFlag ? this.api.opm.updateOpsOrderWorkRecords : this.api.opm.insertOpsOrderWorkRecords,
        data: { ...this.workRecordForm, reportId: this.updateFlag ? this.routerReportId : '' }
      })
    },
    // 新增工作计划
    async insertOpsOrderWorkPlan() {
      for (let i = 0; i < this.addWorkPlanArrayForm.length; i++) {
        const workPlanForm = this.addWorkPlanArrayForm[i]
        workPlanForm.endTime = workPlanForm.endTime ? this.$tool.dateFormat('YYYY-mm-dd', new Date(workPlanForm.endTime)) : ''
        this.$request({
          url: this.api.opm.insertOpsOrderWorkPlan,
          data: {
            reportId: this.reportId,
            ...workPlanForm
          }
        })
      }
      // return await this.$request({ url: this.api.opm.insertOpsOrderWorkPlan, data:  })
    },
    updateOpsOrderWorkPlan() {
      if (this.workPlanArrayForm.length <= 0) return
      for (let i = 0; i < this.workPlanArrayForm.length; i++) {
        const workPlanForm = this.workPlanArrayForm[i]
        workPlanForm.endTime = workPlanForm.endTime ? this.$tool.dateFormat('YYYY-mm-dd', new Date(workPlanForm.endTime)) : ''
        this.$request({
          url: this.api.opm.updateOpsOrderWorkPlan,
          data: {
            reportId: this.reportId,
            ...workPlanForm
          }
        })
      }
    },
    // 新增工作内容
    async insertOpsOrderWorkContent() {
      // const filterContentArrayForm = this.workContentArrayForm.filter(item => !item.contentId)
      for (let i = 0; i < this.addWorkContentArrayForm.length; i++) {
        const workContentForm = this.addWorkContentArrayForm[i]
        workContentForm.endTime = workContentForm.endTime ? this.$tool.dateFormat('YYYY-mm-dd', new Date(workContentForm.endTime)) : ''
        await this.$request({
          url: this.api.opm.insertOpsOrderWorkContent,
          data: {
            reportId: this.reportId,
            ...workContentForm
          }
        })
      }
    },
    // 修改工作内容
    async updateOpsOrderWorkContent() {
      console.log('updateOpsOrderWorkContent')
      console.log(this.workContentArrayForm)
      // const filterContentArrayForm = this.workContentArrayForm.filter(item => !item.contentId)
      if (this.workContentArrayForm.length <= 0) return
      for (let i = 0; i < this.workContentArrayForm.length; i++) {
        const workContentForm = this.workContentArrayForm[i]
        workContentForm.endTime = workContentForm.endTime ? this.$tool.dateFormat('YYYY-mm-dd', new Date(workContentForm.endTime)) : ''
        await this.$request({
          url: this.api.opm.updateOpsOrderWorkContent,
          data: {
            reportId: this.reportId,
            ...workContentForm
          }
        })
      }
    },
    // 新增共享用户id
    async changeOpsOrderWorkRecordsUserMap() {
      // query ={userIds,reportId}

      console.log(this.workRecordFormUserId)
      const query = { userIds: this.workRecordFormUserId.join(), reportId: this.reportId }
      return await this.$request({ url: this.updateFlag ? this.api.opm.changeOpsOrderWorkRecordsUserMap : this.api.opm.changeOpsOrderWorkRecordsUserMap, data: query })
    },
    // 新增汇报附件
    async insertOpsOrderWorkRecordsFile(query) {
      // query ={userIds,reportId}
      if (!this.fileList.length) {
        await this.$request({
          url: this.updateFlag ? this.api.opm.updateOpsOrderWorkRecordsFile : this.api.opm.insertOpsOrderWorkRecordsFile,
          data: {
            fileId: this.updateFlag ? this.fileId[0] : '',
            reportId: this.reportId,
            fileName: this.workRecordsFile.fileName
          }
        })
        return
      }
      console.log(JSON.stringify(this.fileList[0]), 'JSON.stringify(this.fileList[0])')
      for (let i = 0; i < this.fileList.length; i++) {
        const fileArray = this.fileList[i]
        await this.$request({
          url: this.updateFlag ? this.api.opm.updateOpsOrderWorkRecordsFile : this.api.opm.insertOpsOrderWorkRecordsFile,
          data: {
            reportId: this.reportId,
            fileName: this.workRecordsFile.fileName,
            fileType: 'doc',
            fileId: this.updateFlag ? this.fileId[i] : '',
            url: JSON.stringify(fileArray)
          }
        })
      }
    },
    // 上传的附件
    getEmitFileList(files) {
      console.log(files)
      this.fileList = files.fileList
    },
    // 获取附件
    async findAttachment() {
      let res = await this.request({
        url: this.api.opm.findOpsOrderProblemFile,
        data: {
          orderProblemId: this.queryId
        }
      })
      for (const it of res.data) {
        if (!it.fileUrl) continue
        this.fileList.push(JSON.parse(it.fileUrl))
      }
    },
    isRequired() {
      // console.log(Object.values(this.workRecordForm))
      const workRecordForm = this.$tool.deepCopy(this.workRecordForm)
      delete workRecordForm.problem
      if (workRecordForm.isWeixin || workRecordForm.isMail) {
        workRecordForm.isWeixinMail = true
        delete workRecordForm.isWeixin
        delete workRecordForm.isMail
      }
      const flag = Object.values(workRecordForm).some(item => item === false || item === '' || item === 0)
      if (flag) {
        console.log(1)
        this.$message({ type: 'error', message: '请先填写带*必填项' })
        return false
      }

      const workContentArray = this.workContentArrayForm.map(item => {
        return { workContent: item.workContent, state: item.state, workingHours: item.workingHours }
      })
      for (let index = 0; index < workContentArray.length; index++) {
        const flag = Object.values(workContentArray[index]).some(item => item === false || item === '')
        if (flag) {
          console.log(2)
          this.$message({ type: 'error', message: '请先填写带*必填项' })
          return false
        }
      }

      if (this.workContentArrayForm.length <= 0) {
        const addWorkContentArray = this.addWorkContentArrayForm.map(item => {
          return { workContent: item.workContent, state: item.state, workingHours: item.workingHours }
        })
        for (let index = 0; index < addWorkContentArray.length; index++) {
          const flag = Object.values(addWorkContentArray[index]).some(item => item === false || item === '')
          if (flag) {
            console.log(2)
            this.$message({ type: 'error', message: '请先填写带*必填项' })
            return false
          }
        }
      }

      const workPlanArray = this.workPlanArrayForm.map(item => {
        return { workContet: item.workContet }
      })
      for (let index = 0; index < workPlanArray.length; index++) {
        const flag = Object.values(workPlanArray[index]).some(item => item === false || item === '' || item === 0)
        if (flag) {
          console.log(3)
          this.$message({ type: 'error', message: '请先填写带*必填项' })
          return false
        }
      }

      if (this.workPlanArrayForm.length <= 0) {
        const addWorkPlanArray = this.workPlanArrayForm.map(item => {
          return { workContet: item.workContet }
        })
        for (let index = 0; index < addWorkPlanArray.length; index++) {
          const flag = Object.values(addWorkPlanArray[index]).some(item => item === false || item === '' || item === 0)
          if (flag) {
            console.log(3)
            this.$message({ type: 'error', message: '请先填写带*必填项' })
            return false
          }
        }
      }

      if (this.workRecordsFile.fileName === '' || this.workRecordsFile.fileName === false) {
        this.$message({ type: 'error', message: '请先填写带*必填项' })
        return false
      }
      return true
    },
    resetAllForm() {
      this.workRecordForm = {
        name: '',
        userId: this.$auth.getUserSession().userId,
        isMail: 0,
        isWeixin: 0,
        createTime: '',
        classify: '',
        problem: ''
      }
      this.addWorkContentArrayForm = [
        {
          workContent: '',
          task: '',
          state: '', // 状态：0未开始，1进行中，2已完成
          progress: '', // double%?
          workingHours: '',
          endTime: ''
        }
      ]
      this.workContentArrayForm = []
      this.addWorkPlanArrayForm = [
        {
          workContent: '',
          task: '',
          endTime: ''
        }
      ]
      this.workPlanArrayForm = []
      this.workRecordsFile = {
        fileName: '',
        url: '',
        fileType: ''
      }
      this.fileList = []
      this.workRecordFormUserId = []
    },
    async submitAllForm() {
      const isRequired = this.isRequired()
      if (!isRequired) {
        return
      }
      console.log(this.workRecordForm)
      console.log(this.workContentArrayForm, 'workcontentarraform')
      console.log(this.addWorkContentArrayForm, 'addworkcontentarraform')
      console.log(this.workPlanArrayForm, 'workplan')
      console.log(this.myWorkTime, 'myWorkTime1')
      console.log(this.myWorkLongTime, 'myWorkLongTime')
      try {
        const { model, code } = await this.insertOpsOrderWorkRecords()
        if (code !== -1) {
          this.reportId = this.updateFlag ? this.routerReportId : model.reportId

          this.changeOpsOrderWorkRecordsUserMap() // 分享者
          this.insertOpsOrderWorkContent() // 增加内容
          this.updateOpsOrderWorkContent() // 修改内容
          this.updateOpsOrderWorkPlan() // 修改明天计划
          this.insertOpsOrderWorkPlan() // 增加明天计划
          this.insertOpsOrderWorkRecordsFile() // 增加附件
          this.$router.back()
          this.updateFlag ? this.$message({ type: 'success', message: '修改成功' }) : this.$message({ type: 'success', message: '新增成功' })
        }
      } catch (error) {
        this.$message({ type: 'error', message: error })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-select.select .el-input__inner {
  border: 0;
}
::v-deep .customDisabled .el-input__inner {
  height: 60px;
}
.el-card.is-always-shadow,
.el-card.is-hover-shadow:focus,
.el-card.is-hover-shadow:hover {
  box-shadow: none;
}
::v-deep .el-select .el-input .el-input__inner#dateSelect {
  border: 1 !important;
}
::v-deep .otherDatePicker.el-date-editor .el-input__inner {
  border: 0;
}
::v-deep .dateSelect.el-date-editor {
  .el-input__inner {
    // .el-input__inner {}
    border: 1 !important;
    // height: 60px;
    // width: 150px;
  }
}
::v-deep .el-tabs__nav-wrap::after {
  position: static !important;
}
::v-deep .el-card .el-card__body {
  padding: 0;
  .el-input--medium {
    height: 100%;
    .el-textarea__inner {
      height: 100% !important;
    }
  }
}
::v-deep .el-input-number {
  height: 60px;
  .el-input-number__increase {
    line-height: 58px;
  }
  .el-input-number__decrease {
    line-height: 58px;
  }
  .el-input {
    .el-input__inner {
      height: 60px;
      border: 0;
    }
  }
}

// 禁用状态样式修改
input[disabled],input:disabled,input.disabled{
     background: #FFFFFF;

    -webkit-opacity:1;
    opacity: 1;
}

::v-deep .disableDate.is-disabled .el-input__inner{
  background-color: #FFFFFF;
}
::v-deep .el-select .is-disabled .el-input__inner{
    background-color: #FFFFFF;
}
::v-deep .el-textarea.is-disabled .el-textarea__inner{
   background-color: #FFFFFF;
}
.setWhiteBg{
   background-color: #FFFFFF;
}

.create-register {
  padding: 10px;
  width: 100%;
  min-height: 100%;
  background-color: rgba(249, 249, 249, 1);
  .addRedStar:after {
    content: '*';
    color: red;
    font-size: 14px;
  }
  .title {
    position: relative;
    font-size: 20px;
    font-weight: bold;
    padding: 0 0 10px 0;
    margin: 0 0 10px 0;
    &::after {
      position: absolute;
      content: '';
      left: 0;
      bottom: 0;
      width: 50px;
      height: 5px;
      background-color: rgba(1, 69, 171, 1);
      border: solid 1px rgba(121, 121, 121, 1);
    }
  }
  .register-container {
    display: flex;
    .leftWrapper {
      flex: 6;
      .first-content {
        // box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        .tableStyle {
          border-collapse: collapse !important;
          tr td {
            border: 1px solid #ccc !important;
          }
          .name {
            font-size: 14px;
            height: 40px;
            background: #f8f8f8;
          }
          input {
            width: 100%;
            height: 40px;
            outline: none;
            border: 0;
            font-size: 14px;
            padding: 0 0 0 10px;
          }
        }
      }
      .second-content {
        margin: 10px 0 0 0;

        table {
          border-collapse: collapse !important;
          tr td {
            border: 1px solid #ccc !important;
            text-align: center;
          }

          input {
            width: 100%;
            height: 60px;
            font-size: 14px;
            border: none;
            padding: 0 0 0 10px;
          }
        }

        .btn {
          margin: 8px 0 10px 0;
        }
      }
      .third-content {
        .tableStyle {
          border-collapse: collapse;
          // border: solid 1px rgba(215, 215, 215, 1);
          td {
            text-align: center;
            input {
              width: 100%;
              height: 60px;
              font-size: 14px;
              padding: 0 0 0 10px;
              border: 0;
              outline: none;
            }
          }
        }
        tr td {
          border-collapse: collapse;
          border: solid 1px rgba(215, 215, 215, 1) !important;
        }
        .btn {
          margin: 8px 0 10px 0;
        }
      }
      .forth-content {
        .textArea {
          height: 225px;
          font-size: 14px;
          background-color: #f8f8f8;
        }
      }
      .fifth-content {
        margin: 10px 0 10px 0;
        .file-box {
          display: flex;
          padding-top: 10px;
          // align-items: center;
          justify-content: center;
        }
        .tableStyle {
          border-collapse: collapse;
          border: solid 1px rgba(215, 215, 215, 1);
          tr td {
            border-collapse: collapse;
            border: 1px solid #ccc !important;
            outline: none;
          }
          td {
            text-align: center;
            input {
              width: 100%;
              height: 60px;
              outline: none;
              border: 0;
              font-size: 14px;
              padding: 0 0 0 10px;
            }
          }
        }
      }
      .submitBtn {
        margin: 0 0 10px 0;
        display: flex;
        align-content: center;
        justify-content: center;
      }
    }

    .rightWrapper {
      flex: 4;
      margin-left: 6px;
      .card-wrapper {
        .select-box {
          margin: 10px 0 10px 10px;
        }
        .echart-wrapper {
          display: flex;
          margin: 0 0 10px 0;
          .top-title {
            text-align: center;
            font-size: 14px;
          }
          .myTrouble {
            flex: 1;
            height: 188px;
          }

          .myOpm {
            flex: 1;
            height: 188px;
          }
          .myOrderWork {
            flex: 1;
            height: 188px;
          }
        }
        .workShow {
          margin: 0 10px 0 20px;
        }
      }
    }
  }
}
</style>
