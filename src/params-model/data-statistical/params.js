export default {
  /**
   * value：唯一值
   * label：报表类型名称
   * permissionsName：按钮权限控制标识
   * componentName：组件名称，定义在statement-content里面的组件
   */
  statementType: [
    {
      value: 1,
      label: '设备类',
      statement: [
        { value: 1, label: '故障报表', permissionsName: 'AlarmStatement', componentName: 'AlarmStatement' },
        { value: 2, label: 'IT设备清单', permissionsName: 'ITDeviceTodo', componentName: 'ItDeviceStatement' },
        { value: 3, label: '资产报表', permissionsName: 'AssetsReport', componentName: 'AssetsReport' },
        { value: 4, label: '流量报表', permissionsName: 'FlowStatement', componentName: 'FlowStatement' },
        { value: 5, label: 'IP资源报表', permissionsName: 'IPResourceStatement', componentName: 'IpResourceStatement' },
        { value: 6, label: '设备端口资源报告', permissionsName: 'DevicePortResourceStatement', componentName: 'PortResourceStatement' },
        { value: 7, label: '机房容量报告', permissionsName: 'RoomStorageStatement' },
        { value: 8, label: '机柜容量报告', permissionsName: 'CabinetStorageStatement' }
      ]
    },
    {
      value: 2,
      label: '运维服务类',
      statement: [
        { value: 1, label: '故障处理报告', permissionsName: 'AlarmDealStatement', componentName: 'AlarmDealStatement' },
        { value: 2, label: '事项服务报告', permissionsName: 'MatterServiceStatement', componentName: 'MatterServiceStatement' },
        { value: 3, label: '作业报告', permissionsName: 'TaskStatement', componentName: 'TaskStatement'},
        { value: 4, label: '运维人员报告', permissionsName: 'OpmUserStatement', componentName: 'OpmUserStatement' },
        { value: 5, label: '运维小组报告', permissionsName: 'OpmGroupStatement' }
      ]
    }
  ]
}
