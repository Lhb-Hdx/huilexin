/**
 * @description 定义返回固定数据的方法 一些前端预定义的数据在多个地方用到就写在这里
 */

// IT拓扑连接线类型
export function connectLineTypeList() {
  return [
    {
      value: 1,
      label: '虚拟链路',
      style: {
        stroke: '#406ab6',
        lineDash: [5, 5],
        borderType: 'dashed'
      }
    },
    {
      value: 2,
      label: '聚合链路',
      style: {
        stroke: '#406ab6',
        lineDash: [],
        borderType: 'solid'
      }
    },
    {
      value: 3,
      label: '100G光纤',
      style: {
        stroke: '#3dbb99',
        lineDash: [],
        borderType: 'solid'
      }
    },
    {
      value: 4,
      label: '10G光纤',
      style: {
        stroke: '#3af800',
        lineDash: [],
        borderType: 'solid'
      }
    },
    {
      value: 5,
      label: '1G光纤',
      style: {
        stroke: '#9a9a9b',
        lineDash: [],
        borderType: 'solid'
      }
    }
  ]
}

// IT拓扑端口缩写
export function topoPortAbbreviations() {
  return [
    { fullName: 'Ten-GigabitEthernet', abbreviations: 'TE' },
    { fullName: 'GigabitEthernet', abbreviations: 'GE' },
    { fullName: 'Vlan-interface', abbreviations: 'Vlan' }
  ]
}

// IT拓扑自定义节点
export function topoDiyLabel() {
  return [
    {
      thumb: `image/topo/topo_diyLabel.png`,
      dictdataName: '自定义节点',
      devType: 'diyLabel',
      active: false,
      hostList: [
        { hyHostId: 'diy-1', hyMarkName: '标签', diyLabelType: 1, typeValue: 'image', isDiy: true },
        { hyHostId: 'diy-2', hyMarkName: '文本', diyLabelType: 2, typeValue: 'rect', isDiy: true }
      ]
    }
  ]
}

// IT拓扑分组属性
export function topoShape() {
  return [
    { value: 1, label: '圆形', shapeTypeValue: 'circle', style: { width: '15px', height: '15px', border: '1px solid #0145AB', 'border-radius': '100%' } },
    { value: 2, label: '方形', shapeTypeValue: 'rect', style: { width: '25px', height: '15px', border: '1px solid #0145AB' } }
  ]
}

// cmdb配置项类目id对应it监控设备id
export function cmdbConfigItemIdInItMonitorId() {
  return [
    { cmdbItemId: 6, deviceClassifyId: 0 },
    // 虚拟资源
    { cmdbItemId: 37, deviceClassifyId: 478 },
    // 操作系统
    { cmdbItemId: 31, deviceClassifyId: 484 },
    // 数据库
    { cmdbItemId: 32, deviceClassifyId: 483 },
    // 中间件
    { cmdbItemId: 33, deviceClassifyId: 482 },
    // 网络设备
    { cmdbItemId: 34, deviceClassifyId: 481 },
    // 应用软件
    { cmdbItemId: 35, deviceClassifyId: 480 },
    // 服务设备
    { cmdbItemId: 36, deviceClassifyId: 479 },
    // 虚拟资源
    { cmdbItemId: 37, deviceClassifyId: 478 },
    // 存储设备
    { cmdbItemId: 38, deviceClassifyId: 477 }
  ]
}

// cmdb配置项类目id对应运维设备id
export function cmdbConfigItemIdInOpmId() {
  return [
    // window系统
    { cmdbItemId: 39, deviceClassifyId: 489 },
    // Linux服务器
    { cmdbItemId: 40, deviceClassifyId: 476 },
    // 思科交换机
    { cmdbItemId: 41, deviceClassifyId: 475 },
    // 华为交换机
    { cmdbItemId: 42, deviceClassifyId: 474 },
    // 华三交换机
    { cmdbItemId: 43, deviceClassifyId: 473 }
  ]
}

// it监控磁盘类型
export function diskType() {
  return [
    { value: '1', newvalue: 'Unknown' },
    { value: '2', newvalue: 'HDD' },
    { value: '3', newvalue: 'SSD' }
  ]
}

// 组态图节点图标
export function diagramItemIcon() {
  return [
    { userDefineType: 2, devTypeId: 484, nodeIcon: 'image/it-monitor/it-monitor-type-icon-484-w.png', listIcon: 'image/it-monitor/it-monitor-type-icon-484.png' }, // 操作系统
    { userDefineType: 2, devTypeId: 483, nodeIcon: 'image/it-monitor/it-monitor-type-icon-483-w.png', listIcon: 'image/it-monitor/it-monitor-type-icon-483.png' }, // 数据库
    { userDefineType: 2, devTypeId: 482, nodeIcon: 'image/it-monitor/it-monitor-type-icon-482-w.png', listIcon: 'image/it-monitor/it-monitor-type-icon-482.png' }, // 中间件
    { userDefineType: 2, devTypeId: 481, nodeIcon: 'image/it-monitor/it-monitor-type-icon-481-w.png', listIcon: 'image/it-monitor/it-monitor-type-icon-481.png' }, // 网络设备
    { userDefineType: 2, devTypeId: 480, nodeIcon: 'image/it-monitor/it-monitor-type-icon-480-w.png', listIcon: 'image/it-monitor/it-monitor-type-icon-480.png' }, // 应用软件
    { userDefineType: 2, devTypeId: 479, nodeIcon: 'image/it-monitor/it-monitor-type-icon-479-w.png', listIcon: 'image/it-monitor/it-monitor-type-icon-479.png' }, // 服务设备
    { userDefineType: 2, devTypeId: 478, nodeIcon: 'image/it-monitor/it-monitor-type-icon-478-w.png', listIcon: 'image/it-monitor/it-monitor-type-icon-478.png' }, // 虚拟资源
    { userDefineType: 2, devTypeId: 477, nodeIcon: 'image/it-monitor/it-monitor-type-icon-477-w.png', listIcon: 'image/it-monitor/it-monitor-type-icon-477.png' }, // 存储设备
    { userDefineType: 2, devTypeId: 490, nodeIcon: 'image/it-monitor/it-monitor-type-icon-481-w.png', listIcon: 'image/it-monitor/it-monitor-type-icon-481.png' }, // sdwan
    { userDefineType: 1, devTypeId: 0, nodeIcon: 'image/configuration/node_item_icon_video.png', listIcon: 'image/configuration/list_item_icon_video.png' },
    { userDefineType: 4, devTypeId: 0, nodeIcon: 'image/configuration/node_item_icon_ups.png', listIcon: 'image/configuration/list_item_icon_ups.png' }
  ]
}

/**
 * @description 工单状态
 * @param status 状态key
 * @returns {{name: string}}
 */
export function opmStatus(status) {
  if (status === 'init') return { name: '草稿', color: '#d4d32e' }
  if (status === 'flow') return { name: '待处理', color: '#FE4D4E' }
  if (status === 'receive') return { name: '处理中', color: '#FF7F00' }
  if (status === 'finish') return { name: '处理完成', color: '#00B285' }
  if (status === 'fail') return { name: '处理失败', color: '#999999' }
}

// 流程审核状态
export function processStatus(id, getKey) {
  const data = [
    { key: '通过', id: 1, color: 'success' },
    { key: '不通过', id: 2, color: 'danger' },
    { key: '审核中', id: 3, color: 'danger' },
    { key: '新建', id: 4, color: 'success' },
    { key: '提交', id: 5, color: 'success' },
    { key: '驳回', id: 6, color: 'success' },
    { key: '编辑', id: 7, color: 'success' }
  ]
  if (id) {
    const idx = data.findIndex((item) => item.id === id)
    return idx !== -1 ? (getKey ? data[idx][getKey] : data[idx].key) : null
  } else {
    return data
  }
}

// 运维工单工作日志状态
export function opmWorkLogStatus(id) {
  const data = [
    { key: '未完成', id: 1, color: '#E9E8EA' },
    { key: '处理中', id: 2, color: '#FBBD7B' },
    { key: '处理完成', id: 3, color: '#00B285' },
    { key: '处理失败', id: 4, color: '#cccccc' }
  ]
  if (id) {
    const idx = data.findIndex((item) => item.id === id)
    return idx !== -1 ? data[idx].key : null
  } else {
    return data
  }
}

/**
 * @description 项目activity相关定义
 * @param getAttrValue 获取的属性值
 * @param getByAttr 根据某个属性获取
 * @param getResultAttr 指定结果返回
 */
export function projectActivityProcessDefine(getAttrValue, getByAttr, getResultAttr) {
  /**
   * id: 流程类型id
   * key: 别名
   * tableKeyApi: 获取对应流程申请表字段api
   * resetStatueApi: 重置申请状态api
   */
  const data = [
    // 事项申请
    {
      id: 496,
      key: 'matter',
      tableKeyApi: '/admin/getOrderProblemKey',
      resetStatueApi: '/admin/resetOpsOrderProblemStatue'
    },
    // 流程申请
    {
      id: 586,
      key: 'accraditation',
      tableKeyApi: '/admin/getOrderProblemKey',
      resetStatueApi: '/admin/resetOpsOrderProblemStatue'
    },
    // 作业申请
    {
      id: 497,
      key: 'task',
      tableKeyApi: '/admin/getOpsOrderWorkTaskKey',
      resetStatueApi: '/admin/resetOpsOrderWorkTaskStatue'
    },
    // 运维管理 加班申请
    {
      id: 572,
      key: 'opmOvertime',
      tableKeyApi: '/admin/getHyitDutyOverTimeKey',
      resetStatueApi: '/admin/resetHyitDutyOverTimeStatue'
    },
    // 运维管理 请假申请
    {
      id: 571,
      key: 'opmLeave',
      tableKeyApi: '/admin/getHyitDutyLeaveKey',
      resetStatueApi: '/admin/resetHyitDutyLeaveStatue'
    }
  ]
  // 查询方法
  if (getByAttr && getAttrValue) {
    const idx = data.findIndex((item) => item[getByAttr] === getAttrValue)
    return idx !== -1 ? (getResultAttr ? data[idx][getResultAttr] : data[idx]) : null
  } else {
    return data
  }
}

// 值对应类型数据 正常值
const mapDefine = [
  { value: 'OK', type: 'normal' },
  { value: 'Ready', type: 'normal' },
  { value: 'Online', type: 'normal' },
  { value: 'Non-RAID', type: 'normal' },
  { value: 'Removed', type: 'normal' },
  { value: 'Up', type: 'normal' },
  { value: 'present', type: 'normal' }
]

/**
 * @description it监控值对应数据正常值判断方法（传递agentGetValueMap接口获取的到的值，就可以获取出这个值是否为正常的值，type是normal代表是一个正常的状态）
 * @param type
 * @param value
 * @returns {[{type: string, value: string},{type: string, value: string},{type: string, value: string},{type: string, value: string},{type: string, value: string},null]|*[]|null|{type: string, value: string}|{type: string, value: string}|{type: string, value: string}|{type: string, value: string}|{type: string, value: string}}
 */
export function valueMapDefine(type, value) {
  // 没有传类型返回全部
  if (!type) return mapDefine
  // 传递了类型没有传递具体值
  if (type && !value) {
    const res = []
    mapDefine.forEach((item) => {
      if (item.type === type) res.push(item)
    })
    return res
  } else if (value && !type) {
    const res = []
    mapDefine.forEach((item) => {
      if (item.value.toLocaleLowerCase() === value.toLocaleLowerCase()) res.push(item)
    })
    return res
  } else {
    const idx = mapDefine.findIndex((item) => item.value.toLocaleLowerCase() === value.toLocaleLowerCase() && item.type === type)
    return idx === -1 ? null : mapDefine[idx]
  }
}

// 拓扑图节点图标
const topoDefineIcon = [
  { name: '3d-3DWAN', url: 'image/topo/topo_item_define_icon/3d-3DWAN.png' },
  { name: '3D-存储', url: 'image/topo/topo_item_define_icon/3D-存储.png' },
  { name: '3D-防火墙', url: 'image/topo/topo_item_define_icon/3D-防火墙.png' },
  { name: '3D-服务器2', url: 'image/topo/topo_item_define_icon/3D-服务器2.png' },
  { name: '3d-核心交换机', url: 'image/topo/topo_item_define_icon/3d-核心交换机.png' },
  { name: '3D-交换机', url: 'image/topo/topo_item_define_icon/3D-交换机.png' },
  { name: '3D-交换机2', url: 'image/topo/topo_item_define_icon/3D-交换机2.png' },
  { name: '3D-路由器', url: 'image/topo/topo_item_define_icon/3D-路由器.png' },
  { name: '3D-网桥', url: 'image/topo/topo_item_define_icon/3D-网桥.png' },
  { name: '3D-虚拟资源', url: 'image/topo/topo_item_define_icon/3D-虚拟资源.png' },
  { name: '3D—服务器', url: 'image/topo/topo_item_define_icon/3D—服务器.png' },
  { name: '堡垒机', url: 'image/topo/topo_item_define_icon/堡垒机.png' },
  { name: '3D-堡垒机', url: 'image/topo/topo_item_define_icon/3D-堡垒机.png' },
  { name: '边缘交换机', url: 'image/topo/topo_item_define_icon/边缘交换机.png' },
  { name: '磁盘阵列', url: 'image/topo/topo_item_define_icon/磁盘阵列.png' },
  { name: '存储', url: 'image/topo/topo_item_define_icon/存储.png' },
  { name: '堆叠交换机', url: 'image/topo/topo_item_define_icon/堆叠交换机.png' },
  { name: '防火墙', url: 'image/topo/topo_item_define_icon/防火墙.png' },
  { name: '服务器', url: 'image/topo/topo_item_define_icon/服务器.png' },
  { name: '负载均衡', url: 'image/topo/topo_item_define_icon/负载均衡.png' },
  { name: '核心交换机', url: 'image/topo/topo_item_define_icon/核心交换机.png' },
  { name: '核心交换机2', url: 'image/topo/topo_item_define_icon/核心交换机2.png' },
  { name: '汇聚交换机', url: 'image/topo/topo_item_define_icon/汇聚交换机.png' },
  { name: '交换机', url: 'image/topo/topo_item_define_icon/交换机.png' },
  { name: '路由器', url: 'image/topo/topo_item_define_icon/路由器.png' },
  { name: '网桥', url: 'image/topo/topo_item_define_icon/网桥.png' },
  { name: '虚拟资源', url: 'image/topo/topo_item_define_icon/虚拟资源.png' },
  { name: '云', url: 'image/topo/topo_item_define_icon/云.png' },
  { name: 'sdwan', url: 'image/topo/topo_item_define_icon/sdwan.png' }
]

export function getTopoDefineIcon() {
  return topoDefineIcon
}

/**
 * @description 菜单类型
 */
export function getSysMenuType() {
  return [
    { label: 'PC', value: 'pc', menuType: 'menu' },
    { label: '公众号', value: 'weixin', menuType: 'menu' },
    { label: '小程序', value: 'wxapp', menuType: 'menu' },
    { label: '企业微信', value: 'qywx', menuType: 'menu' }
  ]
}

// 自动化运维使用场景
const opsSceneType = [
  { value: 1, label: '快速巡检' },
  { value: 2, label: '设备备份' }
]
export function getOpsSceneType() {
  return opsSceneType
}

// 机柜设备默认图片
// picId组成 设备类型id + 设备u位 + 索引，比如it监控设备（设备id是478）3u的第一张设备图片，picId就是 47831

const cabinetDefaultPic = [
  // 虚拟资源
  {
    type: 0,
    deviceClassifyId: 478,
    pic: []
  },
  // 操作系统
  {
    type: 0,
    deviceClassifyId: 484,
    pic: []
  },
  // 数据库
  {
    type: 0,
    deviceClassifyId: 483,
    pic: []
  },
  // 中间件
  {
    type: 0,
    deviceClassifyId: 482,
    pic: []
  },
  // 网络设备
  {
    type: 0,
    deviceClassifyId: 481,
    pic: [
      { picId: 48111, url: 'image/cabinet/481/网络设备1.png', name: '网络设备1U', dataType: 'define', capacity: 1 },
      { picId: 48112, url: 'image/cabinet/481/交换机-H3C1U.png', name: '网络设备1U', dataType: 'define', capacity: 1 },
      { picId: 48113, url: 'image/cabinet/481/交换机-华为1U.png', name: '网络设备1U', dataType: 'define', capacity: 1 },
      { picId: 48114, url: 'image/cabinet/481/交换机-DELL1U.png', name: '网络设备1U', dataType: 'define', capacity: 1 },
      { picId: 48115, url: 'image/cabinet/481/LHS-业务负载均衡-1u_.png', name: '网络设备1U', dataType: 'define', capacity: 1 },
      { picId: 48116, url: 'image/cabinet/481/H3C-S5500网管交换机-1u.png', name: '网络设备1U', dataType: 'define', capacity: 1 },
      { picId: 48117, url: 'image/cabinet/481/Brocade6510-san交换机-2-1u.png', name: '网络设备1U', dataType: 'define', capacity: 1 },
      { picId: 48118, url: 'image/cabinet/481/绿盟防火墙-1u.png', name: '网络设备1U', dataType: 'define', capacity: 1 },
      { picId: 48119, url: 'image/cabinet/481/LHS-XS5130 网管交换机-1u.png', name: '网络设备1U', dataType: 'define', capacity: 1 },
      { picId: 481120, url: 'image/cabinet/481/SX-X-SDWAN-2-1u.png', name: '网络设备1U', dataType: 'define', capacity: 1 },
      { picId: 481121, url: 'image/cabinet/481/绿盟堡垒机-1u.png', name: '网络设备1U', dataType: 'define', capacity: 1 },
      { picId: 481122, url: 'image/cabinet/481/ADC-负载均衡-1u.png', name: '网络设备1U', dataType: 'define', capacity: 1 },
      { picId: 481123, url: 'image/cabinet/481/Dell-NX3340-1u.png', name: '网络设备1U', dataType: 'define', capacity: 1 },
      { picId: 481124, url: 'image/cabinet/481/感知SIP-1u.png', name: '网络设备1U', dataType: 'define', capacity: 1 },
      { picId: 481125, url: 'image/cabinet/481/探针STA-1u.png', name: '网络设备1U', dataType: 'define', capacity: 1 },
      { picId: 481126, url: 'image/cabinet/481/Fortinet-FG-600D-1u.png', name: '网络设备1U', dataType: 'define', capacity: 1 },
      { picId: 481127, url: 'image/cabinet/481/H3C-5554C-1U.png', name: '网络设备1U', dataType: 'define', capacity: 1 },
      { picId: 481128, url: 'image/cabinet/481/S5110外网出口交换机-1u.png', name: '网络设备1U', dataType: 'define', capacity: 1 },
      { picId: 481129, url: 'image/cabinet/481/戴尔EMC-R230-1u_.png', name: '网络设备1U', dataType: 'define', capacity: 1 },
      { picId: 481130, url: 'image/cabinet/481/LLB5208-1U.png', name: '网络设备1U', dataType: 'define', capacity: 1 },
      { picId: 481131, url: 'image/cabinet/481/交换机-DELL1U.png', name: '网络设备1U', dataType: 'define', capacity: 1 },
      { picId: 48121, url: 'image/cabinet/481/网络设备1.png', name: '网络设备2U', dataType: 'define', capacity: 2 },
      { picId: 48122, url: 'image/cabinet/481/交换机-DELL2U.png', name: '网络设备2U', dataType: 'define', capacity: 2 },
      { picId: 48123, url: 'image/cabinet/481/慧乐信-2u.png', name: '网络设备2U', dataType: 'define', capacity: 2 },
      { picId: 48124, url: 'image/cabinet/481/网闸-2u.png', name: '网络设备2U', dataType: 'define', capacity: 2 },
      { picId: 48125, url: 'image/cabinet/481/Radware全局负载均衡Alteon-FV-GSLB-40G-2u.png', name: '网络设备2U', dataType: 'define', capacity: 2 },
      { picId: 48126, url: 'image/cabinet/481/应急容灾爱数CDP-s2600-2u.png', name: '网络设备2U', dataType: 'define', capacity: 2 },
      { picId: 48127, url: 'image/cabinet/481/爱数备份VX1210-1-2u.png', name: '网络设备2U', dataType: 'define', capacity: 2 },
      { picId: 48128, url: 'image/cabinet/481/DL380-2u.png', name: '网络设备2U', dataType: 'define', capacity: 2 },
      { picId: 48129, url: 'image/cabinet/481/SX-备份一体机-2u.png', name: '网络设备2U', dataType: 'define', capacity: 2 },
      { picId: 481210, url: 'image/cabinet/481/SX-X-SDWAN-2u.png', name: '网络设备2U', dataType: 'define', capacity: 2 },
      { picId: 481211, url: 'image/cabinet/481/SCV300-13-2u.png', name: '网络设备2U', dataType: 'define', capacity: 2 },
      { picId: 481212, url: 'image/cabinet/481/爱数一体机-2u_.png', name: '网络设备2U', dataType: 'define', capacity: 2 },
      { picId: 481213, url: 'image/cabinet/481/宏杉MS2000-2u_.png', name: '网络设备2U', dataType: 'define', capacity: 2 },
      { picId: 481214, url: 'image/cabinet/481/MOFS网关-NS2300-2u.png', name: '网络设备2U', dataType: 'define', capacity: 2 },
      { picId: 481215, url: 'image/cabinet/481/3Par8440存储主控-2u.png', name: '网络设备2U', dataType: 'define', capacity: 2 },
      { picId: 481215, url: 'image/cabinet/481/DAS-A1000-2U.png', name: '网络设备2U', dataType: 'define', capacity: 2 },
      { picId: 481215, url: 'image/cabinet/481/WAF-NX3-P1000B-2u.png', name: '网络设备2U', dataType: 'define', capacity: 2 },
      { picId: 481215, url: 'image/cabinet/481/DAS-LOG-500-2U_.png', name: '网络设备2U', dataType: 'define', capacity: 2 },
      { picId: 481215, url: 'image/cabinet/481/GSLB6024-2u.png', name: '网络设备2U', dataType: 'define', capacity: 2 },
      { picId: 481215, url: 'image/cabinet/481/NGAP5000-2u.png', name: '网络设备2U', dataType: 'define', capacity: 2 },
      { picId: 48131, url: 'image/cabinet/481/网络设备-海康威视-3u.png', name: '网络设备3U', dataType: 'define', capacity: 3 },
      { picId: 48132, url: 'image/cabinet/481/SCV3000-3u.png', name: '网络设备3U', dataType: 'define', capacity: 3 },
      { picId: 48133, url: 'image/cabinet/481/宏杉DSU1616-3u_.png', name: '网络设备3U', dataType: 'define', capacity: 3 },
      { picId: 48141, url: 'image/cabinet/481/交换机-华为4U.png', name: '网络设备4U', dataType: 'define', capacity: 4 },
      { picId: 48142, url: 'image/cabinet/481/宏杉MS2000-4u_.png', name: '网络设备4U', dataType: 'define', capacity: 4 },
      { picId: 48143, url: 'image/cabinet/481/交换机-H3C4U.png', name: '网络设备4U', dataType: 'define', capacity: 4 },
      { picId: 481111, url: 'image/cabinet/481/SX-S12500F-1-11U.png', name: '网络设备11U', dataType: 'define', capacity: 11 },
      { picId: 481121, url: 'image/cabinet/481/H3C-S12500F-3-12u.png', name: '网络设备12U', dataType: 'define', capacity: 12 },
      { picId: 481131, url: 'image/cabinet/481/S7606-2 B核心交换机-13u_.png', name: '网络设备13U', dataType: 'define', capacity: 13 },
      { picId: 481132, url: 'image/cabinet/481/SX-M9000-13u.png', name: '网络设备13U', dataType: 'define', capacity: 13 },
      { picId: 481133, url: 'image/cabinet/481/H3C-S12500-3核心交换机-13u.png', name: '网络设备13U', dataType: 'define', capacity: 13 },
      { picId: 481141, url: 'image/cabinet/481/网络设备-14u.png', name: '网络设备14U', dataType: 'define', capacity: 14 },
      { picId: 481171, url: 'image/cabinet/481/网络设备-17u.png', name: '网络设备17U', dataType: 'define', capacity: 17 },
      { picId: 481201, url: 'image/cabinet/481/H3C-M9010-20U.png', name: '网络设备20U', dataType: 'define', capacity: 20 }
    ]
  },
  // 应用软件
  {
    type: 0,
    deviceClassifyId: 480,
    pic: []
  },
  // 服务设备
  {
    type: 0,
    deviceClassifyId: 479,
    pic: [
      { picId: 47911, url: 'image/cabinet/479/服务设备3.png', name: '服务设备1', dataType: 'define', capacity: 1 },
      { picId: 47912, url: 'image/cabinet/479/服务器-DELL1U.png', name: '服务设备2', dataType: 'define', capacity: 1 },
      { picId: 47913, url: 'image/cabinet/479/服务器-H3C1U_.png', name: '服务设备3', dataType: 'define', capacity: 1 },
      { picId: 47914, url: 'image/cabinet/479/等保服务器-1u.png', name: '服务设备4', dataType: 'define', capacity: 1 },
      { picId: 47915, url: 'image/cabinet/479/华为1u服务器.png', name: '服务设备5', dataType: 'define', capacity: 1 },
      { picId: 47921, url: 'image/cabinet/479/服务设备2.png', name: '服务设备6', dataType: 'define', capacity: 2 },
      { picId: 47922, url: 'image/cabinet/479/服务器-华为2U.png', name: '服务设备7', dataType: 'define', capacity: 2 },
      { picId: 47923, url: 'image/cabinet/479/服务器-DELL2U.png', name: '服务设备8', dataType: 'define', capacity: 2 },
      { picId: 47924, url: 'image/cabinet/479/服务器-H3C2U.png', name: '服务设备9', dataType: 'define', capacity: 2 },
      { picId: 47925, url: 'image/cabinet/479/Dell-R740-服务器-2u.png', name: '服务设备10', dataType: 'define', capacity: 2 },
      { picId: 47926, url: 'image/cabinet/479/实体服务器-H3C 2U_.png', name: '服务设备11', dataType: 'define', capacity: 2 },
      { picId: 47931, url: 'image/cabinet/479/服务设备1.png', name: '服务设备12', dataType: 'define', capacity: 3 },
      { picId: 47932, url: 'image/cabinet/479/Dell-R740-服务器-1-3u.png', name: '服务设备13', dataType: 'define', capacity: 3 },
      { picId: 47941, url: 'image/cabinet/479/服务器-华为4U.png', name: '服务设备14', dataType: 'define', capacity: 4 },
      { picId: 47942, url: 'image/cabinet/479/服务器-DELL4U.png', name: '服务设备15', dataType: 'define', capacity: 4 },
      { picId: 47943, url: 'image/cabinet/479/服务器-H3C4U.png', name: '服务设备16', dataType: 'define', capacity: 4 },
      { picId: 47945, url: 'image/cabinet/479/DL580-3 CDR数据服务器-4U.png', name: '服务设备17', dataType: 'define', capacity: 4 }
    ]
  },
  // 虚拟资源
  {
    type: 0,
    deviceClassifyId: 478,
    pic: []
  },
  // 存储设备
  {
    type: 0,
    deviceClassifyId: 477,
    pic: [
      { picId: 47711, url: 'image/cabinet/477/存储设备-DELL1U.png', name: '存储设备1U', dataType: 'define', capacity: 1 },
      { picId: 47712, url: 'image/cabinet/477/存储设备-H3C1U.png', name: '存储设备1U', dataType: 'define', capacity: 1 },
      { picId: 47721, url: 'image/cabinet/477/存储设备-华为2U.png', name: '存储设备2U', dataType: 'define', capacity: 2 },
      { picId: 47722, url: 'image/cabinet/477/存储设备-DELL2U.png', name: '存储设备2U', dataType: 'define', capacity: 2 },
      { picId: 47723, url: 'image/cabinet/477/存储设备-H3C2U.png', name: '存储设备2U', dataType: 'define', capacity: 2 },
      { picId: 47724, url: 'image/cabinet/477/存储设备-DELL2U2.png', name: '存储设备2U', dataType: 'define', capacity: 2 },
      { picId: 47731, url: 'image/cabinet/477/存储设备-华为3U.png', name: '存储设备3U', dataType: 'define', capacity: 3 },
      { picId: 47741, url: 'image/cabinet/477/存储设备-华为4U.png', name: '存储设备4U', dataType: 'define', capacity: 4 },
      { picId: 477171, url: 'image/cabinet/477/存储设备-17u.png', name: '存储设备17U', dataType: 'define', capacity: 17 }
    ]
  },
  // sdwan
  {
    type: 0,
    deviceClassifyId: 490,
    pic: [
      { picId: 49011, url: 'image/cabinet/490/CitrixSDWAN-1U.png', name: 'SDWAN1U', dataType: 'define', capacity: 1 },
      { picId: 49011, url: 'image/cabinet/490/SDWAN-1u.png', name: 'SDWAN1U', dataType: 'define', capacity: 1 }
    ]
  }
]
/**
 * @description 根据设备类型获取前端定义的设备类型图片
 * @param {*} query 查询参数
 */
/**
 * query.type: 类型来源0 IT设备，1动环设备，2视频设备，3资产设备
 * query.deviceClassifyId: 类型id
 * query.picIds: 图片ids
 */
export function getCabinetDefaultPic(query) {
  if (!query) return cabinetDefaultPic // 没有参数返回一整个结构
  if (query.picIds) {
    const picIds = query.picIds.split(',')
    const res = []
    if (picIds.length > 0) {
      cabinetDefaultPic.forEach((item) => {
        item.pic.forEach((picItem) => {
          const picIdsIdx = picIds.indexOf(String(picItem.picId))
          if (picIdsIdx !== -1) res.push(picItem)
        })
      })
      return res
    } else {
      return []
    }
  }
  if (query.type !== undefined && query.deviceClassifyId === undefined) {
    const res = []
    cabinetDefaultPic.forEach((item) => {
      if (+item.type === +query.type) {
        res.push(item)
      }
    })
  }
  if (query.type === undefined && query.deviceClassifyId !== undefined) {
    const res = []
    cabinetDefaultPic.forEach((item) => {
      if (+item.deviceClassifyId === +query.deviceClassifyId) {
        res.push(item)
      }
    })
  }
  if (query.type !== undefined && query.deviceClassifyId !== undefined) {
    const idx = cabinetDefaultPic.findIndex((item) => +item.deviceClassifyId === +query.deviceClassifyId && +item.type === +query.type)
    if (idx !== -1) {
      return cabinetDefaultPic[idx].pic
    } else {
      return []
    }
  }
}
