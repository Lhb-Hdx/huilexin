import * as auth from '@/utils/auth'
import * as defineData from '@/utils/define-data'

const state = {
  /**
   * @description typeTabs对象参数注释
   * @param {string}type 类型
   * @param {object[]}statisticsCountParams tab统计数量查询配置
   * @param {string}statisticsCountParams.api tab统计数量查询接口
   * @param {string}statisticsCountParams.key tab统计数量查询接口状态参数名称
   * @param {string}statisticsCountParams.value tab统计数量查询接口状态值参数名称
   * @param {string}statisticsCountParams.findMyKey 我的统计数量接口用户查询条件参数名称
   * @param {object[]}tabsList tab项
   * @param {string}tabsList.value tab项显示名称
   * @param {string}tabsList.count tab项数据数量
   * @param {string}tabsList.code tab项唯一值
   * @param {string}tabsList.stateField tab项状态参数名称
   * @param {object}tabsList.query 查询事项数据状态值
   * @param
   */
  typeTabs: [
    {
      type: 'submission',
      statisticsCountParams: [{ api: '/admin/findOpsOrderProblemProcessStateStatistics', key: 'processState', value: 'processStateCount', inTabStateField: 'processState', findMyKey: 'userId' }],
      tabsList: [
        { statue: 0, value: '待受理', count: 0, code: 'todoHandle', stateField: 'processState', query: { processState: 0 }, tabQuery: { processState: 0 } },
        { statue: '', value: '处理中', count: 0, code: 'handling', stateField: 'processState', query: { processState: 1 }, tabQuery: { processState: 1 } },
        { statue: '', value: '待确认', count: 0, stateField: 'processState', code: 'todoComfirm', query: { processState: 5 }, tabQuery: { processState: 5 } },
        { value: '待安排', count: 0, code: 'waitPlan', stateField: 'processState', query: { processState: 4 }, tabQuery: { processState: 4 } },
        { value: '成功处理', count: 0, code: 'successHandle', stateField: 'processState', query: { processState: 2 }, tabQuery: { processState: 2 } },
        { value: '处理失败', count: 0, code: 'failHandle', stateField: 'processState', query: { processState: 3 }, tabQuery: { processState: 3 } },
        { value: '已撤回', count: 0, code: 'rollBack', stateField: 'processState', query: { processState: 6 }, tabQuery: { processState: 6 } }
      ]
    },
    {
      type: 'todo-handle',
      statisticsCountParams: [{ api: '/admin/findOpsOrderProblemProcessStateStatistics', key: 'processState', value: 'processStateCount', inTabStateField: 'processState', findMyKey: 'groupIds' }],
      tabsList: [
        { statue: 0, value: '待处理', count: 0, code: 'todoHandle', stateField: 'processState', query: { processState: 0 }, tabQuery: { processState: 0 } },
        { statue: '', value: '处理中', count: 0, code: 'handling', stateField: 'processState', query: { processState: 1 }, tabQuery: { processState: 1 } },
        { statue: '', value: '待确认', count: 0, stateField: 'processState', code: 'todoComfirm', query: { processState: 5 }, tabQuery: { processState: 5 } },
        { statue: '', value: '事项升级', count: 0, code: 'upLevel', stateField: 'processState', query: { processState: 4 }, tabQuery: { processState: 4 } },
        { statue: '', value: '成功处理', count: 0, code: 'successHandle', stateField: 'processState', query: { processState: 2 }, tabQuery: { processState: 2 } },
        { statue: '', value: '处理失败', count: 0, code: 'failHandle', stateField: 'processState', query: { processState: 3 }, tabQuery: { processState: 3 } }
      ]
    },
    {
      type: 'todo-plan',
      statisticsCountParams: [
        { api: '/admin/findOpsOrderProblemProcessStateStatistics', key: 'processState', value: 'processStateCount', inTabStateField: 'processState', findMyKey: 'groupIds' },
        {
          api: '/admin/findNewOaApproveLogStatistics',
          key: 'approveStatue',
          value: 'statueCount',
          inTabStateField: 'statue',
          query: {
            approveType: defineData.projectActivityProcessDefine('matter', 'key', 'id')
          }
        }
      ],
      tabsList: [
        { statue: 5, value: '待计划', count: 0, stateField: 'processState', query: { processState: 4 }, tabQuery: { processState: 4 } },
        { statue: 2, value: '审批中', count: 0, stateField: 'statue', query: { statue: 2 }, tabQuery: { statue: 2 } },
        { statue: 3, value: '待确认', count: 0, stateField: 'processState', code: 'todoComfirm', query: { processState: 5 }, tabQuery: { processState: 5 } },
        { statue: 4, value: '被驳回', count: 0, code: 'reject', stateField: 'statue', query: { statue: 4 }, tabQuery: { statue: 4 } },
        { statue: '', value: '成功处理', count: 0, code: 'successHandle', stateField: 'processState', query: { processState: 2 }, tabQuery: { processState: 2 } },
        { statue: '', value: '处理失败', count: 0, code: 'failHandle', stateField: 'processState', query: { processState: 3 }, tabQuery: { processState: 3 } }
      ]
    },
    {
      type: 'todo-approve',
      statisticsCountParams: [
        {
          api: '/admin/findNewOaApproveLogStatistics',
          key: 'approveStatue',
          value: 'statueCount',
          findMyKey: 'approveUserId',
          inTabStateField: 'approveStatue',
          query: {
            approveType: defineData.projectActivityProcessDefine('matter', 'key', 'id')
          }
        }
      ],
      tabsList: [
        { statue: 2, value: '待审批', code: 'approve', count: 0, stateField: 'approveStatue', findMyKey: 'userId', query: { approveStatue: '' }, tabQuery: { approveStatue: '' } },
        { statue: 1, value: '已通过', code: 'pass', count: 0, stateField: 'approveStatue', findMyKey: 'approveUserId', query: { approveStatue: 1 }, tabQuery: { approveStatue: 1 } },
        { statue: 1, value: '已驳回', code: 'reject', count: 0, stateField: 'approveStatue', findMyKey: 'approveUserId', query: { approveStatue: 6 }, tabQuery: { approveStatue: 6 } },
        { statue: 1, value: '不通过', code: 'failApprove', count: 0, stateField: 'approveStatue', findMyKey: 'approveUserId', query: { approveStatue: 2 }, tabQuery: { approveStatue: 2 } }
      ]
    },
    // 我的流程|我的申请
    // 586-审批流程类型 type: 1 我的流程
    {
      type: 'my-apply',
      statisticsCountParams: [
        {
          api: '/admin/findOpsOrderProblemProcessStateStatistics',
          key: 'statue',
          value: 'statueCount',
          findMyKey: 'userId',
          inTabStateField: 'statue',
          query: {
            // approveType: defineData.projectActivityProcessDefine('accraditation', 'key', 'id')
            // userId: 1,
            type: 1
          }
        }
      ],
      // statue =2 为审批中，=3 为通过，=4 为驳回，=5 为不通过
      tabsList: [
        // {
        //   statue: 2,
        //   value: '审批中',
        //   code: 'approving',
        //   count: 0,
        //   stateField: 'statue',
        //   findMyKey: 'userId',
        //   query: { approveStatue: '', statue: 2, processState: 1, type: 1 },
        //   tabQuery: { statue: 2 }
        // },
        {
          statue: 2,
          value: '审批中',
          code: 'approving',
          count: 0,
          stateField: 'processState',
          findMyKey: 'userId',
          query: { approveStatue: '', statue: 2, processState: 1, type: 1 },
          tabQuery: { processState: 1, statue: 2 }
        },
        { statue: 3, value: '申请通过', code: 'pass', count: 0, stateField: 'statue', findMyKey: 'approveUserId', query: { statue: 3, type: 1 }, tabQuery: { statue: 3 } },
        { statue: 5, value: '不通过', code: 'failApprove', count: 0, stateField: 'statue', findMyKey: 'approveUserId', query: { statue: 5, type: 1 }, tabQuery: { statue: 5 } },
        { statue: 4, value: '申请驳回', code: 'reject', count: 0, stateField: 'statue', findMyKey: 'approveUserId', query: { statue: 4, type: 1 }, tabQuery: { statue: 4 } },
        { processState: 6, value: '已撤回', code: 'rollBack', count: 0, stateField: 'processState', findMyKey: 'approveUserId', query: { processState: 6, type: 1 }, tabQuery: { processState: 6 } }
      ]
    },
    // 我的流程|我的审批
    {
      type: 'my-accraditation',
      statisticsCountParams: [
        {
          api: '/admin/findNewOaApproveLogStatistics',
          key: 'approveStatue',
          value: 'statueCount',
          findMyKey: 'approveUserId',
          inTabStateField: 'approveStatue',
          query: {
            approveType: defineData.projectActivityProcessDefine('accraditation', 'key', 'id')
          }
        }
      ],
      tabsList: [
        { statue: 2, value: '待审批', code: 'approve', count: 0, stateField: 'approveStatue', findMyKey: 'userId', query: { approveStatue: '' }, tabQuery: { approveStatue: '' } },
        { statue: 1, value: '申请通过', code: 'pass', count: 0, stateField: 'approveStatue', findMyKey: 'approveUserId', query: { approveStatue: 1 }, tabQuery: { approveStatue: 1 } },
        { statue: 2, value: ' 不通过', code: 'failApprove', count: 0, stateField: 'approveStatue', findMyKey: 'approveUserId', query: { approveStatue: 2 }, tabQuery: { approveStatue: 2 } },
        { statue: 1, value: '申请驳回', code: 'reject', count: 0, stateField: 'approveStatue', findMyKey: 'approveUserId', query: { approveStatue: 6 }, tabQuery: { approveStatue: 6 } }
      ]
    }
  ], // opmtabs 导航选择
  tabsList: [], // 选中的导航
  opmPlanFlag: false,
  isManageFlag: false,
  opmTaskList: [], // 计划任务
  opsProblemName: '',
  hostDeviceList: [],
  relatedBusinessList: [],
  approveList: [],
  tableData: [],
  tableDataQuery: {
    // 表格参数
    type: '',
    title: '',
    ctime: '',
    page: 1,
    limit: 10,
    statue: null, // 待处理
    processState: '',
    userId: ''
  },
  approveTableDataQuery: {
    // 待审批表格参数
    page: 1,
    limit: 10
  },
  approveTableCount: 0,
  tableCount: 0,
  approveCode: '',
  tabsItemStatus: '',
  createUser: [], // 提交人
  doTaskUser: [], // 打工人
  UserOrgInfoList: [], // 部门
  LockUsers: [], // 锁定人
  tabsItemCode: '',
  managerId: ''
}

const mutations = {
  SET_STATE(state, payload) {
    state[`${payload.stateName}`] = payload.stateData
  },
  setHostDeviceList(state, payload) {
    state.hostDeviceList = payload
  },
  setRelatedBusinessList(state, payload) {
    state.relatedBusinessList = payload
  },
  setOpmPlanFlag(state, payload) {
    state.opmPlanFlag = payload
  },
  setOpsProblemName(state, payload) {
    state.opsProblemName = payload
  },
  setTaskList(state, payload) {
    state.opmTaskList = payload || []
    // 看看payload是否是数组，是就看看是否是初始化
    // if (Array.isArray(payload) && state.opmTaskList.length === 0) {
    //   state.opmTaskList = [...payload, ...state.opmTaskList]
    // } else if (!Array.isArray(payload)) {
    //   state.opmTaskList.push(payload)
    // }
  },
  resetTaskList(state) {
    state.opmTaskList = []
  },
  spliceOpmTaskList(state, index) {
    state.opmTaskList.splice(index, 1)
  },
  setApproveList(state, payload) {
    state.approveList = payload
  },
  deleteTableType(state, payload) {
    state.tableDataQuery.problemType = ''
    state.tableDataQuery.serviceType = ''
  },
  setTabsItemStatus(state, payload) {
    state.tabsItemStatus = payload
  },
  setManagerId(state, payload) {
    state.managerId = payload
  }
}

const actions = {
  setState({ commit }, payload) {
    commit('SET_STATE', payload)
  },
  getTypeTabs({ state }, payload) {
    return new Promise((resolve) => {
      if (!payload.type) return state.typeTabs
      const idx = state.typeTabs.findIndex((item) => item.type === payload.type)
      resolve(idx !== -1 ? { tabsList: state.typeTabs[idx].tabsList, statisticsCountParam: state.typeTabs[idx].statisticsCountParams } : {})
    })
  },
  setHostDeviceListAc({ commit, list }) {
    commit('setHostDeviceList', list)
  },
  async findApproveAc({ commit, payload }) {
    const { code, data } = await this._vm.$request({ url: this._vm.api.approve.findApprove })
    if (code !== 1) return
    commit('setApproveList', data || [])
  },
  async findOpsOrderProblem({ commit, state }, payload) {
    return await this._vm.$request({ url: this._vm.api.opm.findOpsOrderProblem, data: payload })
  },
  // 查找运维小组
  async getOpsOrderProblemService({ commit, state }, payload) {
    return await this._vm.$request({ url: this._vm.api.opm.getOpsOrderProblemService, data: { serviceId: payload } })
  },
  // 查找运维小组
  async findOpsOrderProblemService({ commit, state }, payload) {
    return await this._vm.$request({ url: this._vm.api.opm.findOpsOrderProblemService, data: { ids: payload } })
  },
  // 查找任务数
  async findOpsOrderWorkTask({ commit, state }, payload) {
    return await this._vm.$request({ url: this._vm.api.opm.findOpsOrderWorkTask, data: { orderProblemIds: payload } })
  },
  async findApprove({ commit, state, dispatch }, payload) {
    const findApproveQuery = { ...payload, approveType: 496 }
    if (state.routerDefineQuery.tableDataType === 2) {
      findApproveQuery.approveUserId = auth.getUserSession().userId
    }
    return await this._vm.$request({ url: this._vm.api.approve.findApprove, data: findApproveQuery })
  },
  async findNewOaApproveLog({ commit, dispatch }, payload) {
    return await this._vm.$request({
      url: this._vm.api.approveLog.findNewOaApproveLog,
      data: { ...payload }
    })
  }
}
const getters = {
  isManageFlag: () => {
    return auth.getVuexStoragePermission('SubmitComplete') > 0
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
