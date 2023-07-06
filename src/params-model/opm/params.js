export default {
  // 加班类型
  otType: [
    { value: 1, label: '算补休' },
    { value: 2, label: '算绩效' }
  ],
  // 请假类型
  leaveType: [
    { value: 1, label: '事假' },
    { value: 2, label: '年假' },
    { value: 3, label: '病假' },
    { value: 4, label: '婚假' },
    { value: 5, label: '产假' },
    { value: 6, label: '丧假' },
    { value: 7, label: '补休' }
  ],
  // 作业状态
  workTaskType: [
    { statue: 1, label: '未提交', color: '#909399' },
    { statue: 2, label: '审核中', color: '#ff5500' },
    { statue: 3, label: '已审核', color: '#1989fa' },
    { statue: 4, label: '驳回', color: '#909399' },
    // {statue: 5, label: '未分配',color:'#f56c6c'},
    { statue: 6, label: '处理中', color: '#fe830c' },
    { statue: 7, label: '处理失败', color: '#fe4d4e' },
    { statue: 8, label: '成功处理', color: '#00b285' }
  ],
  infoPushList: {
    1: '您收到了一条新的待处理事项',
    2: '您有一条事项被领取',
    3: '您有一条事项被解锁',
    4: '您收到了一条新的待计划事项',
    // 5: '待主管审核',
    6: '您有一条事项被成功处理',
    7: '您有一条事项处理失败',
    8: '事项被指派',
    9: '作业已完成'
  },
  infoStatusList: {
    0: '待受理',
    1: '处理中',
    2: '成功处理',
    3: '处理失败',
    4: '待计划',
    5: '待确认',
    6: '撤回'
  }
}
