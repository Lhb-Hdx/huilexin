export default {
  // 审核状态
  audioStatus: [
    { statue: 1, value: '未提交', color: 'danger', code: '#f56c6c' },
    { statue: 2, value: '审核中', color: 'danger', code: '#f56c6c' },
    { statue: 3, value: '已审核', color: 'success', code: '#999999' },
    { statue: 8, value: '修改', color: 'success', code: '#999999' },
    { statue: 7, value: '撤回', color: 'danger', code: '#f56c6c' }
  ],
  // 审批状态 给下拉框用的筛选条件 type用来做过滤条件，statue就是匹配展示用的 select就是下拉框筛选用
  approveStatue: [
    { key: '通过', id: 1, color: 'success', type: ['statue', 'select'] },
    { key: '不通过', id: 2, color: 'danger', type: ['statue', 'select'] },
    { key: '审批中', id: 3, color: 'danger', type: ['statue', 'select'] },
    { key: '新建', id: 4, color: 'success', type: ['statue'] },
    { key: '提交', id: 5, color: 'success', type: ['statue'] },
    { key: '驳回', id: 6, color: 'success', type: ['statue', 'select'] },
    { key: '编辑', id: 7, color: 'success', type: ['statue'] }
  ],
  // 角色类型
  roleTypes: [
    { value: 'admin', label: '超级管理员' },
    { value: 'governor', label: '主管' },
    { value: 'engineer', label: '工程师' },
    { value: 'user', label: '普通用户' }
  ]
}
