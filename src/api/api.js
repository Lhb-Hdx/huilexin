export default {
  // 公共
  common: {
    insertSysDictionaryDetail: '/admin/insertSysDictionaryDetail', // 新增系统字典
    findSysDictionaryDetail: '/admin/findSysDictionaryDetail', // 查询系统字典
    getSysDictionaryDetail: '/admin/getSysDictionaryDetail', // 查看系统字典
    updateSysDictionaryDetail: '/admin/updateSysDictionaryDetail', // 编辑字典数据接口
    findLoginPic: '/filter/findLoginPic',
    findSysWorkLog: '/admin/findSysWorkLog', // 操作日志查询接口
    findSysUserLoginLog: '/admin/findSysUserLoginLog', // 查询登录日志接口
    indentificationLoginAuthentication: '/admin/indentificationLoginAuthentication' // 第三方登录跳转请求验证数据接口
  },
  // 知识库
  knowledge: {
    // 分类
    findHyitKnowType: '/admin/findHyitKnowType',
    getHyitKnowType: '/admin/getHyitKnowType',
    // 知识点
    findHyitKnow: '/admin/findHyitKnow',
    getHyitKnow: '/admin/getHyitKnow',
    // 附件
    findHyitKnowFile: '/admin/findHyitKnowFile',
    getHyitKnowFile: '/admin/getHyitKnowFile',
    // 获取操作用户
    getSysUser: '/admin/getSysUser',
    findSysUser: '/admin/findSysUser',
    // 获取历史搜索关键字
    findHyitKeyword: '/admin/findHyitKeyword',
    addHyitKnowType: '/admin/addHyitKnowType',
    updateHyitKnowType: '/admin/updateHyitKnowType',
    deleteHyitKnowType: '/admin/deleteHyitKnowType',
    addHyitKnow: '/admin/addHyitKnow',
    updateHyitKnow: '/admin/updateHyitKnow',
    deleteHyitKnow: '/admin/deleteHyitKnow',
    addHyitKnowFile: '/admin/addHyitKnowFile',
    updateHyitKnowFile: '/admin/updateHyitKnowFile',
    deleteHyitKnowFile: '/admin/deleteHyitKnowFile',
    AuthUploadToken: '/admin/AuthUploadToken',
    uploadPic: 'https://resource.huiyuntc.net:8336/admin/uploadPic'
  },
  // 视频
  video: {
    updateOrgId: '/admin/updateOrgId',
    findVideoChn: '/admin/findVideoChn', // 查询摄像头通道列表
    findVideoDvr: '/admin/findVideoDvr', // 查询摄像头列表
    getVedioByDay: '/admin/getVedioByDay', // 查看某天的录像
    findVideos: '/admin/findVideos', // 查询所有录像列表
    findAlaramVideo: '/admin/findAlaramVideo', // 查询告警录像列表
    findLabelVideos: '/admin/findLabelVideos', // 查询标记录像列表
    lableVideo: '/admin/lableVideo', // 插入标记录像
    getLive: '/admin/getLive', // 获取实时预览流
    getVideoBindWidthRealTime: '/admin/getVideoBindWidthRealTime', // 获取网关设备带宽/内存/cpu使用情况
    findVideoGateway: '/admin/findVideoGateway', // 查询存储网关列表
    findVideoGatewayDisk: '/admin/findVideoGatewayDisk', // 查询存储网关列表
    getVideoGateway: '/admin/getVideoGateway', // 查看存储网关
    getVideoDvrDetail: '/admin/getVideoDvrDetail', // 查看摄像头
    getVideoDvr: '/admin/getVideoDvr', // 查看摄像头
    playRecord: '/admin/playRecord', // 获取设备录像流
    getVideoAlarmLogCount: '/admin/getVideoAlarmLogCount', // 查询视频监控告警日志统计数量
    getVideoAlarmLogDayStatic: '/admin/getVideoAlarmLogDayStatic', // 查询视频监控告警趋势
    getVideoAlarmLogDayHourStatic: '/admin/getVideoAlarmLogDayHourStatic', // 查询视频监控事件发生时间段
    getVideoAlarmLogAreaStatic: '/admin/getVideoAlarmLogAreaStatic', // 查询视频监控时间高发区
    findVideoAlarmLog: '/admin/findVideoAlarmLog', // 视频监控告警日志
    getVideoAlarmLogTypeStatic: '/admin/getVideoAlarmLogTypeStatic', // 查询视频监控告警日志类型
    findVideoPlan: '/admin/findVideoPlan', // 获取存储策略列表
    getVideoPlan: '/admin/getVideoPlan', // 查看存储策略
    deleteVideoPlan: '/admin/deleteVideoPlan', // 删除存储策略
    delPlan: '/admin/video/delPlan', // 删除存储策略（废弃）
    activeOrDisable: '/admin/activeOrDisable', // 更新存储策略（废弃）
    insertVideoPortMap: '/admin/insertVideoPortMap', // 新增端口映射
    updateVideoPortMap: '/admin/updateVideoPortMap', // 更新端口映射
    findVideoPortMap: '/admin/findVideoPortMap', // 查询端口映射列表
    deleteVideoPortMap: '/admin/deleteVideoPortMap', // 删除端口映射
    // 电视墙
    findVideoTvwall: '/admin/findVideoTvwall', // 查询电视墙列表
    insertVideoTvwall: '/admin/insertVideoTvwall', // 新增电视墙
    updateVideoTvwall: '/admin/updateVideoTvwall', // 更新电视墙
    deleteVideoTvwall: '/admin/deleteVideoTvwall', // 删除电视墙
    getVideoTvwall: '/admin/getVideoTvwall', // 查看电视墙
    insertVideoTvwallPlayer: '/admin/insertVideoTvwallPlayer', // 新增电视墙播放窗口
    deleteVideoTvwallPlayer: '/admin/deleteVideoTvwallPlayer', // 删除电视墙播放窗口
    updateVideoTvwallPlayer: '/admin/updateVideoTvwallPlayer', // 更新电视墙播放窗口
    getVideoTvwallPlayer: '/admin/getVideoTvwallPlayer', // 查看电视墙播放窗口
    findVideoTvwallPlayer: '/admin/findVideoTvwallPlayer', // 查询电视墙播放窗口列表
    findVideoGatewayEx: '/admin/findVideoGatewayEx', // 获取电视墙窗口播放网关信息
    // 时间模板
    findHyitTime: '/admin/findHyitTime', // 时间模板
    addHyitTime: '/admin/insertHyitTime', // 新增时间模板
    deleteHyitTime: '/admin/deleteHyitTime', // 删除时间模板
    getHyitTime: '/admin/getHyitTime', // 查看时间模板
    updateHyitTime: '/admin/updateHyitTime', // 更新时间模板
    addHyitTimeDetail: '/admin/insertHyitTimeDetail', // 添加时间模板时间段
    deleteHyitTimeDetailByTid: '/admin/deleteHyitTimeDetailByTid', // 根据时间模板id删除时间模板时间段
    findHyitTimeDetail: '/admin/findHyitTimeDetail', // 查询时间模板时间段列表
    // 视频分组
    findVideoGroup: '/admin/findVideoGroup', // 查询视频分组列表
    insertVideoGroup: '/admin/insertVideoGroup', // 新增视频分组
    updateVideoGroup: '/admin/updateVideoGroup', // 更新视频分组
    deleteVideoGroup: '/admin/deleteVideoGroup', // 删除视频分组
    findVideoDisk: '/admin/findVideoDisk', // 查询存储网关磁盘列表
    addVideoGatewayDisk: '/admin/addVideoGatewayDisk', // 添加存储网关磁盘
    updateVideoGatewayDiskNew: '/admin/updateVideoGatewayDiskNew', // 更新存储网关磁盘
    addVideoDvr: '/admin/addVideoDvr', // 新增摄像头
    updateVideoDvr: '/admin/updateVideoDvr', // 更新摄像头
    deleteVideoChn: '/admin/deleteVideoChn', // 删除摄像头通道
    deleteVideoDvr: '/admin/deleteVideoDvr', // 删除摄像头
    updateVideoChn: '/admin/updateVideoChn', // 更新摄像头通道
    addVideoPlan: '/admin/addVideoPlan', // 新增存储策略
    updateVideoPlan: '/admin/updateVideoPlan', // 更新存储策略
    closeRecord: '/admin/closeRecord', // 关闭设备录像流
    importDevice: '/admin/importDevice', // 导入摄像头
    findVideoPlanChn: '/admin/findVideoPlanChn', // 查询存储策略通道
    addVideoPlanChn: '/admin/addVideoPlanChn', // 新增存储策略通道
    updateVideoPlanChn: '/admin/updateVideoPlanChn', // 更新存储策略通道
    deleteVideoPlanChn: '/admin/deleteVideoPlanChn', // 删除存储策略通道
    insertVideoGroupChannel: '/admin/insertVideoGroupChannel', // 新增分组通道
    deleteVideoGroupChannelByIds: '/admin/deleteVideoGroupChannelByIds', // 批量根据通道id删除分组通道
    findVideoGroupChannel: '/admin/findVideoGroupChannel', // 查询分组通道列表
    deleteVideoPlanChnByChannelId: '/admin/deleteVideoPlanChnByChannelId', // 删除网关后需要调用一下
    deleteVideoPlanChnByChannelIds: '/admin/deleteVideoPlanChnByChannelIds', // 批量删除网关后需要调用一下
    deleteVideoLable: '/admin/deleteVideoLable', // 删除标记录像
    updateVideoLable: '/admin/updateVideoLable' // 更新设备录像
  },
  devops: {
    addHyitApproval: '/admin/addHyitApproval'
  },
  // 自动化运维
  automationOperations: {
    // 脚本-询找增改删进入
    findHyitOpsScript: '/admin/findHyitOpsScript', // 查询脚本列表
    getHyitOpsScript: '/admin/getHyitOpsScript', // 查看脚本
    insertHyitOpsScript: '/admin/insertHyitOpsScript', // 新增脚本
    updateHyitOpsScript: '/admin/updateHyitOpsScript', // 更新脚本
    deleteHyitOpsScript: '/admin/deleteHyitOpsScript', // 删除脚本
    ExecScript: '/admin/ExecScript', // 执行脚本

    // 脚本类型
    findHyitOpsScriptType: '/admin/findHyitOpsScriptType', // 查询脚本类型列表
    getHyitOpsScriptType: '/admin/getHyitOpsScriptType', // 查看脚本类型
    insertHyitOpsScriptType: '/admin/insertHyitOpsScriptType', // 新增脚本类型
    updateHyitOpsScriptType: '/admin/updateHyitOpsScriptType', // 更新脚本类型
    deleteHyitOpsScriptType: '/admin/deleteHyitOpsScriptType', // 删除脚本 类型

    // 脚本结果匹配表达式
    insertHyitOpsResultExpression: '/admin/insertHyitOpsResultExpression', // 新增脚本结果匹配表达式
    deleteHyitOpsResultExpression: '/admin/deleteHyitOpsResultExpression', // 删除脚本结果匹配表达式
    updateHyitOpsResultExpression: '/admin/updateHyitOpsResultExpression', // 更新脚本结果匹配表达式
    findHyitOpsResultExpression: '/admin/findHyitOpsResultExpression', // 查询脚本结果匹配表达式列表
    getHyitOpsResultExpression: '/admin/getHyitOpsResultExpression', // 查看脚本结果匹配表达式

    // 服务器管理-询找增改删进入
    findHyitOpsServer: '/admin/findHyitOpsServer', // 查询运维服务器列表
    getHyitOpsServer: '/admin/getHyitOpsServer', // 查看运维服务器
    insertHyitOpsServer: '/admin/insertHyitOpsServer', // 新增运维服务器
    updateHyitOpsServer: '/admin/updateHyitOpsServer', // 更新运维服务器
    deleteHyitOpsServer: '/admin/deleteHyitOpsServer', // 删除运维服务器
    exportHyitOpsServer: '/admin/exportHyitOpsServer', // 导出运维服务器
    importHyitOpsServer: '/admin/importHyitOpsServer', // 导入运维服务器

    // 作业管理-增删改查执行
    insertHyitOpsTask: '/admin/insertHyitOpsTask', // 添加作业
    deleteHyitOpsTask: '/admin/deleteHyitOpsTask', // 删除作业
    updateHyitOpsTask: '/admin/updateHyitOpsTask', // 修改作业
    findHyitOpsTask: '/admin/findHyitOpsTask', // 作业列表
    getHyitOpsTask: '/admin/getHyitOpsTask', // 查看作业
    ExecTask: '/admin/ExecTask', // 执行作业
    TaskChange: '/admin/TaskChange', // 编辑或者删除作业后需要调用这个接口更新一下作业

    // 作业管理-添加运行的脚本设备
    insertHyitOpsTaskLink: '/admin/insertHyitOpsTaskLink', // 添加作业的脚本记录
    deleteHyitOpsTaskLink: '/admin/deleteHyitOpsTaskLink', // 删除作业的脚本记录
    updateHyitOpsTaskLink: '/admin/updateHyitOpsTaskLink', // 编辑作业的脚本记录
    findHyitOpsTaskLink: '/admin/findHyitOpsTaskLink', // 作业要运行的脚本列表
    getHyitOpsTaskLink: '/admin/getHyitOpsTaskLink', // 查看作业要运行的脚本

    // 作业运行日志
    findHyitOpsExecuteLog: '/admin/findHyitOpsExecuteLog', // 作业运行日志列表
    getHyitOpsExecuteLog: '/admin/getHyitOpsExecuteLog', // 查看作业运行日志
    findHyitOpsExecuteAnalysis: '/admin/findHyitOpsExecuteAnalysis', // 查看日志分析结果
    findHyitOpsExecuteLogByGroup: '/admin/findHyitOpsExecuteLogByGroup', // 作业运行日志列表 根据日期
    getHyitOpsExecuteLogReport: '/admin/getHyitOpsExecuteLogReport', // 查看执行报告

    execHyitOpsTask: '/admin/ExecHyitOpsTask', // 执行作业
    showDayAlarmLogByHour: '/admin/showDayAlarmLogByHour', // IT运维告警趋势
    showAlarmLogByAll: '/admin/showAlarmLogByAll', // 所有运维告警日志

    // 脚本白名单
    findHyitOpsScriptWhiteList: '/admin/findHyitOpsScriptWhiteList', // 查询脚本白名单
    insertHyitOpsScriptWhiteList: '/admin/insertHyitOpsScriptWhiteList', // 新增脚本白名单
    deleteHyitOpsScriptWhiteList: '/admin/deleteHyitOpsScriptWhiteList', // 删除脚本白名单
    updateHyitOpsScriptWhiteList: '/admin/updateHyitOpsScriptWhiteList', // 编辑脚本白名单

    // 脚本黑名单
    findHyitOpsScriptBlackList: '/admin/findHyitOpsScriptBlackList',
    insertHyitOpsScriptBlackList: '/admin/insertHyitOpsScriptBlackList',
    getHyitOpsScriptBlackList: '/admin/getHyitOpsScriptBlackList',
    updateHyitOpsScriptBlackList: '/admin/updateHyitOpsScriptBlackList',
    deleteHyitOpsScriptBlackList: '/admin/deleteHyitOpsScriptBlackList',

    // 脚本白名单关联角色
    insertHyitOpsRoleScriptWhite: '/admin/insertHyitOpsRoleScriptWhite', // 新增脚本白名单关联角色
    findHyitOpsRoleScriptWhite: '/admin/findHyitOpsRoleScriptWhite', // 查询脚本白名单关联角色
    deleteHyitOpsRoleScriptWhite: '/admin/deleteHyitOpsRoleScriptWhite', // 删除脚本白名单关联角色
    deleteHyitOpsRoleScriptWhite2: '/admin/deleteHyitOpsRoleScriptWhite2', // 批量删除脚本白名单关联角色
    insertHyitOpsRoleScriptWhite2: '/admin/insertHyitOpsRoleScriptWhite2', // 批量新增脚本白名单关联角色
    findHyitOpsScriptWhiteListUnauthByRoleId: '/admin/findHyitOpsScriptWhiteListUnauthByRoleId', // 查询角色未授权的白名单
    getHyitOpsScriptSceneTypeCount: '/admin/getHyitOpsScriptSceneTypeCount', // 获取脚本适用场景数量汇总

    findHyitOpsScriptGroup: '/admin/findHyitOpsScriptGroup', // 查询目录分组
    getHyitOpsScriptGroup: '/admin/getHyitOpsScriptGroup', // 查看目录分组
    insertHyitOpsScriptGroup: '/admin/insertHyitOpsScriptGroup', // 新增目录分组
    deleteHyitOpsScriptGroup: '/admin/deleteHyitOpsScriptGroup', // 删除目录分组
    updateHyitOpsScriptGroup: '/admin/updateHyitOpsScriptGroup', // 编辑目录分组

    findHyitOpsTamplate: '/admin/findHyitOpsTamplate', // 查询作业模板
    insertHyitOpsTamplate: '/admin/insertHyitOpsTamplate', // 新增作业模板
    updateHyitOpsTamplate: '/admin/updateHyitOpsTamplate', // 编辑作业模板
    deleteHyitOpsTamplate: '/admin/deleteHyitOpsTamplate', // 删除作业模板
    getHyitOpsTamplate: '/admin/getHyitOpsTamplate', // 查看作业模板

    findHyitOpsTag: '/admin/findHyitOpsTag', // 标签查询

    insertHyitOpsTamplateScript: '/admin/insertHyitOpsTamplateScript', // 新增模板脚本关联
    deleteHyitOpsTamplateScript: '/admin/deleteHyitOpsTamplateScript', // 删除模板脚本关联
    findHyitOpsTamplateScript: '/admin/findHyitOpsTamplateScript', // 查询模板脚本关联

    insertHyitOpsTamplateScripts: '/admin/insertHyitOpsTamplateScripts', // 批量关联作业脚本
    deleteHyitOpsTamplateScriptByTamplateId: '/admin/deleteHyitOpsTamplateScriptByTamplateId', // 批量删除作业脚本

    findLastHyitOpsExecuteLog: '/admin/findLastHyitOpsExecuteLog', // 查询作业最新的执行记录

    deleteHyitOpsTaskLinks: '/admin/deleteHyitOpsTaskLinks', // 批量删除作业关联
    updateHyitOpsTaskLinks: '/admin/updateHyitOpsTaskLinks', // 批量新增作业关联
    insertHyitOpsTaskLinks: '/admin/insertHyitOpsTaskLinks', // 批量编辑作业关联

    insertHyitOpsExecuteLogSend: '/admin/insertHyitOpsExecuteLogSend', // 插入执行日志发送
    findHyitOpsExecuteLogSend: '/admin/findHyitOpsExecuteLogSend', // 查询执行日志发送
    updateHyitOpsExecuteLogSend: '/admin/updateHyitOpsExecuteLogSend', // 编辑执行日志发送

    updateHyitOpsScriptGroupIndex: '/admin/updateHyitOpsScriptGroupIndex'
  },
  // 学历
  education: {
    educationList: '/admin/find-education-SysCat', // 查询学历列表
    educationInfo: '/admin/get-education-SysCat', // 查看学历
    educationInsert: '/admin/insert-education-SysCat', // 新增学历
    educationUpdate: '/admin/update-education-SysCat', // 更新学历
    educationDelete: '/admin/delete-education-SysCat' // 删除学历
  },
  // 部门
  department: {
    departmentList: '/admin/find-department-SysCat', // 查询部门列表
    departmentInfo: '/admin/get-department-SysCat', // 查看部门
    departmentInsert: '/admin/insert-department-SysCat', // 新增部门
    departmentUpdate: '/admin/update-department-SysCat', // 更新部门
    departmentDelete: '/admin/delete-department-SysCat' // 删除部门
  },
  // 资产
  assets: {
    insertAssetsInfos: '/admin/insertAssetsInfos', // 批量新增资产
    deleteAssetsInfos: '/admin/deleteAssetsInfos', // 批量删除资产
    findAssetsInfo: '/admin/findAssetsInfo', // 查询资产列表
    getAssetsInfo: '/admin/getAssetsInfo', // 查看资产
    insertAssetsInfo: '/admin/insertAssetsInfo', // 新增资产信息
    insertAssetsPurchase: '/admin/insertAssetsPurchase', // 新增资产采购
    insertAssetsUse: '/admin/insertAssetsUse', // 新增资产使用
    deleteAssetsInfo: '/admin/deleteAssetsInfo', // 删除资产信息
    deleteAssetsPurchase: '/admin/deleteAssetsPurchase', // 删除资产采购
    deleteAssetsUse: '/admin/deleteAssetsUse', // 删除资产使用
    findAssetsPurchase: '/admin/findAssetsPurchase', // 查询资产采购列表
    findAssetsUse: '/admin/findAssetsUse', // 查询资产使用列表
    getAssetsUse: '/admin/getAssetsUse', // 查看资产使用
    getAssetsPurchase: '/admin/getAssetsPurchase', // 查看资产采购
    findAssetsChangeLog: '/admin/findAssetsChangeLog', // 查看资产记录
    updateAssetsInfo: '/admin/updateAssetsInfo', // 更新资产信息
    updateAssetsPurchase: '/admin/updateAssetsPurchase', // 更新资产采购
    updateAssetsUse: '/admin/updateAssetsUse', // 更新资产使用
    insertAssetsChangeLog: '/admin/insertAssetsChangeLog', // 新增资产记录
    deleteAssetsUseMap: '/admin/deleteAssetsUseMap', // 删除资产绑定使用人
    insertAssetsUseMap: '/admin/insertAssetsUseMap', // 资产绑定使用人
    findAssetsUseMap: '/admin/findAssetsUseMap', // 查询资产绑定人
    insertAssetsPurchaseMap: '/admin/insertAssetsPurchaseMap', // 正常和采购单绑定
    findAssetsPurchaseMap: '/admin/findAssetsPurchaseMap', // 查询资产绑定采购单
    insertAssetsSupplier: '/admin/insertAssetsSupplier', // 新增资产供应商
    deleteAssetsSupplier: '/admin/deleteAssetsSupplier', // 删除资产供应商
    updateAssetsSupplier: '/admin/updateAssetsSupplier', // 更新资产供应商
    getAssetsSupplier: '/admin/getAssetsSupplier', // 查看资产供应商
    findAssetsSupplier: '/admin/findAssetsSupplier', // 查询资产供应商列表
    insertAssetsSupplierEmploye: '/admin/insertAssetsSupplierEmploye', // 新增资产供应商人员
    deleteAssetsSupplierEmploye: '/admin/deleteAssetsSupplierEmploye', // 删除资产供应商人员
    updateAssetsSupplierEmploye: '/admin/updateAssetsSupplierEmploye', // 更新资产供应商人员
    getAssetsSupplierEmploye: '/admin/getAssetsSupplierEmploye', // 查看资产供应商人员
    findAssetsSupplierEmploye: '/admin/findAssetsSupplierEmploye', // 查询资产供应商人员列表
    insertAssetsIdsUse: '/admin/insertAssetsIdsUse',
    // countAssetByType: '/admin/countAssetByType', // 统计设备类别
    countAssetByDeviceType: '/admin/countAssetByDeviceType', // 统计设备类别
    countAssetByHyAreaId: '/admin/countAssetByHyAreaId', // 根据区域统计资产
    countAssetByUseStatus: '/admin/countAssetByUseStatus' // 根据使用状态统计资产
  },
  // 系统
  sys: {
    findSysRoleService: '/admin/findSysRoleService', // 角色与服务类型关联表--查询
    insertSysRoleService: '/admin/insertSysRoleService', // 角色与服务类型关联表--新增
    batchInsertSysRoleService: '/admin/batchInsertSysRoleService', // 角色与服务类型关联表--新增多个
    updateSysRoleService: '/admin/updateSysRoleService', // 角色与服务类型关联表--更新
    deleteSysRoleService: '/admin/deleteSysRoleService', // 角色与服务类型关联表--删除
    findSysCat: '/admin/findSysCat', // 查询系统类型
    getSysCat: '/admin/getSysCat', // 获取系统类型
    insertSysCat: '/admin/insertSysCat', // 新增系统类型
    updateSysCat: '/admin/updateSysCat', // 修改系统类型
    deleteSysCat: '/admin/deleteSysCat', // 删除系统类型
    findSysUser: '/admin/findSysUser', // 获取用户
    getSysUser: '/admin/getSysUser', // 查看用户
    infoSysAdmin: '/admin/infoSysAdmin', // 查询用户
    insertSysUser: '/admin/insertSysUser', // 新增用户
    updateSysUser: '/admin/updateSysUser', // 更新用户
    deleteSysUser: '/admin/deleteSysUser', // 删除用户
    findRoleByUser: '/admin/findRoleByUser2', // 获取用户角色
    insertSysUserRole: '/admin/insertSysUserRole', // 新增用户角色
    deleteSysUserRole: '/admin/deleteSysUserRole', // 删除用户角色
    getSysUserRole: '/admin/getSysUserRole',
    findSysUserRole: '/admin/findSysUserRole',
    findSysRole: '/admin/findSysRole', // 获取角色列表
    getSysRole: '/admin/getSysRole', // 查看角色
    insertSysRole: '/admin/insertSysRole', // 新增角色
    updateSysRole: '/admin/updateSysRole', // 更新角色
    deleteSysRole: '/admin/deleteSysRole', // 删除角色
    saveRoleByUser: '/admin/saveRoleByUser', // 保存用户的角色数据
    logOut: '/admin.logout', // 退出用户登录
    login: '/admin.login3', // 用户登录
    editAdminPassword: '/admin/modifyPw.admin', // 修改管理员密码
    editUserPassword: '/admin/modifyPw.user', // 修改用户密码
    findSysMenu: '/admin/findSysMenu', // 查询菜单列表
    menuRoleData: '/admin/menuRoleData', // 获取角色菜单
    menuRoleBatchSave: '/admin/menuRoleBatchSave', // 保存角色菜单
    findSysRoleApp: '/admin/findSysRoleApp', // 查询角色绑定的应用
    deleteSysRoleApp: '/admin/deleteSysRoleApp', // 删除角色绑定应用
    findSysAppMenu: '/admin/findSysAppMenu', // 查询应用菜单
    updateSysAppMenu: '/admin/updateSysAppMenu', // 更新应用菜单
    findSysAppCompany: '/admin/findSysAppCompany', // 查询公司应用
    insertSysAppCompany: '/admin/insertSysAppCompany', // 新增公司应用
    updateSysAppCompany: '/admin/updateSysAppCompany', // 更新公司应用
    deleteSysAppCompany: '/admin/deleteSysAppCompany', // 删除公司应用
    getSysAppCompany: '/admin/getSysAppCompany', // 查看公司应用
    resetPassword: '/admin/resetPassword', // 重置密码
    copySysAppCompanyData: '/admin/copySysAppCompanyData', // 数据拷贝
    copyCmdbItemType: '/admin/copyCmdbItemType', // 数据拷贝
    insertHrUserGroup: '/admin/insertHrUserGroup', // 新增人员分组
    updateHrUserGroup: '/admin/updateHrUserGroup',
    findHrUserGroup: '/admin/findHrUserGroup', // 查询人员分组
    findHrUserGroupMap: '/admin/findHrUserGroupMap', // 查询分组人员关系
    insertHrUserGroupMap: '/admin/insertHrUserGroupMap', // 新增分组关系
    deleteHrUserGroupMap: '/admin/deleteHrUserGroupMap', // 新增分组关系
    deleteHrUserGroup: '/admin/deleteHrUserGroup', // 删除分组
    updateBatchHrUserGroupMap: '/admin/updateBatchHrUserGroupMap', // 批量更新分组人员关联表
    importSysUser: '/admin/importSysUser', // 批量导入用户管理
    getHrUserGroupMapCount: '/admin/getHrUserGroupMapCount', // 分组人员数量统计
    findWinxinUser: '/admin/findWinxinUser'
  },
  // it资源监控
  itMonitor: {
    // 系统维护
    importUpdateFile: '/admin/importUpdateFile', // 上传文件
    // 变更设备
    insertEsightChange: '/admin/insertEsightChange', // 新增变更设备
    deleteEsightChange: '/admin/deleteEsightChange', // 删除变更设备
    updateEsightChange: '/admin/updateEsightChange', // 修改变更设备
    SynEsightChange: '/admin/SynEsightChange', // 查询变更设备
    findEsightChange: '/admin/findEsightChange', // 查询变更设备
    getEsightChange: '/admin/getEsightChange', // 查看变更设备
    // 布线表
    insertEsightLine: '/admin/insertEsightLine',
    deleteEsightLine: '/admin/deleteEsightLine',
    updateEsightLine: '/admin/updateEsightLine',
    deleteEsightLines: '/admin/deleteEsightLines', // 批量删除接口
    findEsightLine: '/admin/findEsightLine',
    getEsightLine: '/admin/getEsightLine',
    importEsightLine: '/admin/importEsightLine', // 导入
    exportEsightLine: '/admin/exportEsightLine', // 导出
    // CMDB表
    insertEsightCmdb: '/admin/insertEsightCmdb',
    deleteEsightCmdb: '/admin/deleteEsightCmdb',
    updateEsightCmdb: '/admin/updateEsightCmdb',
    deleteEsightCmdbs: '/admin/deleteEsightCmdbs', // 批量删除接口
    findEsightCmdb: '/admin/findEsightCmdb',
    getEsightCmdb: '/admin/getEsightCmdb',
    importEsightCmdb: '/admin/importEsightCmdb',
    exportEsightCmdb: '/admin/exportEsightCmdb',
    // 网关监控
    findHyitAgent: '/admin/findHyitAgent', // 网关列表
    deleteHyitAgent: '/admin/deleteHyitAgent',
    agentGetTamplate: '/admin/agentGetTamplate', // 同步模板
    centerGetHost: '/admin/centerGetHost',
    // zbx模板
    findZbxTamplate: '/admin/findZbxTamplate', // 模板列表
    importZbxTamplate: '/admin/importZbxTamplate', // 导入模板
    agentDeleteTamplate: '/admin/agentDeleteTamplate', // 删除模板
    findZbxItems: '/admin/findZbxItems', // 查询模板监控项
    getZbxItems: '/admin/getZbxItems', // 查看监控项
    findZbxTriggers: '/admin/findZbxTriggers', // 查询模板触发器
    getZbxTriggers: '/admin/getZbxTriggers', // 查看触发器
    agentEnableTrigger: '/admin/agentEnableTrigger', // 开启/关闭触发器
    agentEnableItem: '/admin/agentEnableItem', // 开启/关闭监控项
    updateZbxTamplate: '/admin/updateZbxTamplate', // 编辑模板
    // 群组
    findZbxHstgrp: '/admin/findZbxHstgrp', // 查询群组
    agentAddGroup: '/admin/agentAddGroup', // 新增群组
    agentUpdateGroup: '/admin/agentUpdateGroup', // 修改群组
    agentDeleteGroup: '/admin/agentDeleteGroup', // 删除群组
    getZbxHstgrp: '/admin/getZbxHstgrp', // 查看群组
    agentGetGroup: '/admin/agentGetGroup', // 同步群组
    // 主机
    findHyitHost: '/admin/findHyitHost', // 查询主机
    getHyitHost: '/admin/getHyitHost', // 查看主机
    agentAddHost: '/admin/agentAddHost', // 新增主机
    agentUpdateHost: '/admin/agentUpdateHost1', // 编辑主机
    agentGetHost: '/admin/agentGetHost', // 同步主机
    agentDeleteHost: '/admin/agentDeleteHost', // 删除主机
    findZbxApplicationHost: '/admin/findZbxApplicationHost', // 查询主机应用集
    findZbxItemsHost: '/admin/findZbxItemsHost', // 查询主机监控项
    getZbxItemsHost: '/admin/getZbxItemsHost', // 查看主机监控项
    findZbxTriggersHost: '/admin/findZbxTriggersHost', // 查询主机触发器
    getZbxTriggersHost: '/admin/getZbxTriggersHost', // 查看主机触发器
    findZbxItemsTag: '/admin/findZbxItemsTag', // 查询监控项类别
    findZbxItemsHostTag: '/admin/findZbxItemsHostTag',
    agentGetHostInterface: '/admin/agentGetHostInterface',
    updateHyitHostOrg: '/admin/UpdateHyitHostOrg',
    agentUpdateProblem: '/admin/agentUpdateProblem',
    // 拓扑
    findHyitTopology: '/admin/findHyitTopology', // 查询拓扑
    insertHyitTopology: '/admin/insertHyitTopology', // 新增拓扑
    updateHyitTopology: '/admin/updateHyitTopology', // 编辑拓扑
    agentGetTopStatic: '/admin/agentGetTopStatic', // 拓扑设备&链路统计
    // 拓扑图
    insertHyitTopologyInfo: '/admin/insertHyitTopologyInfo', // 新增拓扑图信息
    deleteHyitTopologyInfo: '/admin/deleteHyitTopologyInfo', // 删除拓扑图信息
    updateHyitTopologyInfo: '/admin/updateHyitTopologyInfo', // 更新拓扑图信息
    findHyitTopologyInfo: '/admin/findHyitTopologyInfo', // 查询拓扑图列表
    getHyitTopologyInfo: '/admin/getHyitTopologyInfo', // 查看拓扑图信息
    // drawio拓扑图
    insertHyTopologyDrawio: '/admin/insertHyTopologyDrawio', // 新增拓扑图信息
    deleteHyTopologyDrawio: '/admin/deleteHyTopologyDrawio', // 删除拓扑图信息
    getHyTopologyDrawio: '/admin/getHyTopologyDrawio', // 查看拓扑图列表
    findHyTopologyDrawio: '/admin/findHyTopologyDrawio', // 查询拓扑图列表
    updateHyTopologyDrawio: '/admin/updateHyTopologyDrawio', // 更新拓扑图信息
    importHyTopologyDrawio: '/admin/importHyTopologyDrawio', // 导入拓扑图信息
    exportHyTopologyDrawio: '/admin/exportHyTopologyDrawio', // 导出拓扑图信息
    // 拓扑节点
    insertHyitTopologyItem: '/admin/insertHyitTopologyItem', // 新增拓扑节点
    deleteHyitTopologyItem: '/admin/deleteHyitTopologyItem', // 删除拓扑节点
    updateHyitTopologyItem: '/admin/updateHyitTopologyItem', // 更新拓扑节点
    findHyitTopologyItem: '/admin/findHyitTopologyItem', // 查询拓扑节点列表
    getHyitTopologyItem: '/admin/getHyitTopologyItem', // 查看拓扑节点
    // 拓扑连接关系
    insertHyitTopologyItemLink: '/admin/insertHyitTopologyItemLink', // 新增拓扑连线
    deleteHyitTopologyItemLink: '/admin/deleteHyitTopologyItemLink', // 删除拓扑连线
    updateHyitTopologyItemLink: '/admin/updateHyitTopologyItemLink', // 更新拓扑连线
    findHyitTopologyItemLink: '/admin/findHyitTopologyItemLink', // 查询拓扑连线列表
    getHyitTopologyItemLink: '/admin/getHyitTopologyItemLink', // 查看拓扑连线
    deleteHyitTopologyItemLinkByIds: '/admin/deleteHyitTopologyItemLinkByIds', // 删除多个线条
    findHyitTopologyItemGroup: '/admin/findHyitTopologyItemGroup', // 查询拓扑节点分组
    insertHyitTopologyItemGroup: '/admin/insertHyitTopologyItemGroup', // 新增拓扑节点分组
    deleteHyitTopologyItemGroup: '/admin/deleteHyitTopologyItemGroup', // 删除分组
    updateHyitTopologyItemGroup: '/admin/updateHyitTopologyItemGroup', // 更新分组
    updateHyitTopologyItemGroupValue: '/admin/updateHyitTopologyItemGroupValue', // 批量修改拓扑节点数据
    updateHyitTopologyItemXY: '/admin/updateHyitTopologyItemXY', // 批量修改拓扑节点x、y轴位置（统一把节点的x y轴加或者减）
    updateHyitTopologyItemXY2: '/admin/updateHyitTopologyItemXY2', // 批量修改拓扑节点x、y轴位置
    // 监控数据获取
    agentGetHostData: '/admin/agentGetHostData', // 获取网关主机数据
    getHyitHostTypeStatictics: '/admin/getHyitHostTypeStatictics', // 获取八大类设备统计信息
    getHyitHostAlarmCountStatictics: '/admin/getHyitHostAlarmCountStatictics',
    agentGetHostPort: '/admin/agentGetHostPort', // 获取网关主机监控项数据
    getHyitHostStatictics: '/admin/getHyitHostStatictics', // 获取设备状态统计
    agentGetRealTimeData: '/admin/agentGetRealTimeData', // 根据监控项获取设备实时数据
    agentGetTrendData: '/admin/agentGetTrendData', // 根据监控项获取设备历史统计表格
    getZbxApplicationHostStatictics: '/admin/getZbxApplicationHostStatictics', // 获取应用集
    agentGetHistoryData: '/admin/agentGetHistoryData', // 获取历史统计
    getHyitShowItem: '/admin/getHyitShowItem', // 获取监控项数据
    agentGetValueMap: '/admin/agentGetValueMap', // 获取状态值对应关系
    // 故障管理
    getZbxAlarmLogStatictics: '/admin/getZbxAlarmLogStatictics', // 获取故障日志统计
    getZbxAlarmLogStatictics2: '/admin/getZbxAlarmLogStatictics2', // 获取故障日志统计(新)
    findZbxAlarmLog: '/admin/findZbxAlarmLog', // 获取告警日志
    getZbxAlarmLog: '/admin/getZbxAlarmLog', // 查看告警日志
    updateZbxAlarmLog: '/admin/updateZbxAlarmLog', // 编辑告警日志
    insertOpsOrderAlarmLog: '/admin/insertOpsOrderAlarmLog', // 新增告警处理日志
    findOpsOrderAlarmLog: '/admin/findOpsOrderAlarmLog', // 获取告警处理日志
    findZbxAlarmLogByItemid: '/admin/findZbxAlarmLogByItemid', // 通过itemId获取告警处理日志
    getAlarmLogTypeCount: '/admin/getAlarmLogTypeCount', // 分时段查询告警类型数量信息接口

    // 业务监控（后面会重整）
    findHyitBusinessSystem: '/admin/findHyitBusinessSystem',
    findHyitBusinessSystemFlow: '/admin/findHyitBusinessSystemFlow',
    updateHyitBusinessSystemXy: '/admin/updateHyitBusinessSystemXy',
    findHyitBusinessSystemXy: '/admin/findHyitBusinessSystemXy',
    findHyitDevType: '/admin/findHyitDevType',
    addIotSubSystem: '/admin/addIotSubSystem',
    updateIotSubSystem: '/admin/updateIotSubSystem',
    deleteIotSubSystem: '/admin/deleteIotSubSystem',
    agentGetHostShow: '/admin/agentGetHostShow',
    // sdwan事件
    agentGetSdwanEventSeverityStatistics: '/admin/agentGetSdwanEventSeverityStatistics', // 事件数量统计饼图
    agentGetSdwanEventStatistics: '/admin/agentGetSdwanEventStatistics', // 事件详细统计
    agentGetSdwanEvent: '/admin/agentGetSdwanEvent', // 事件列表
    // 主机图形显示
    insertHyitHostGraphShow: '/admin/insertHyitHostGraphShow', // 新增图形显示
    findHyitHostGraphShow: '/admin/findHyitHostGraphShow', // 查询图形显示
    deleteHyitHostGraphShow: '/admin/deleteHyitHostGraphShow', // 删除图形显示
    updateHyitHostGraphShow: '/admin/updateHyitHostGraphShow', // 更新图形显示
    // 设备运行统计
    getHyitHostRunTimeStatictics: '/admin/getHyitHostRunTimeStatictics',
    getLastAlarmLogByHost: '/admin/getLastAlarmLogByHost',

    // 上级中心服务配置
    insertServerCenter: '/admin/insertServerCenter',
    deleteServerCenter: '/admin/deleteServerCenter',
    updateServerCenter: '/admin/updateServerCenter',
    findServerCenter: '/admin/findServerCenter',
    getServerCenter: '/admin/getServerCenter',
    disconnetAgent: '/admin/disconnetAgent',

    getOnlineAgent: '/admin/getOnlineAgent',
    getOnlineServer: '/admin/getOnlineServer',

    getAlarmLogDesTop: '/admin/getAlarmLogDesTop', // 设备告警Top
    getAlarmLogAlarmType: '/admin/getAlarmLogAlarmType', // 告警类型统计

    findEsightAlarm: '/admin/findEsightAlarm',

    getAlarmLogStatueCount: '/admin/getAlarmLogStatueCount', // 查询告警状态数量信息

    // 设备运行统计
    countNumByDateAndStatue: '/admin/countNumByDateAndStatue',
    countNumByStatus: '/admin/countNumByStatus',
    countNumByLevel: '/admin/countNumByLevel',
    countNumByDate: '/admin/countNumByDate ',
    countDeviceNum: '/admin/countDeviceNum', // 查询设备总数接口
    countNumByDateAndType: '/admin/countNumByDateAndType',

    findZbxAlarmLogKnow: '/admin/findZbxAlarmLogKnow', // 告警和知识点关联

    // 负载均衡配置
    importRadWare: '/admin/importRadWare',
    insertRadwareUrl: '/admin/insertRadwareUrl',
    updateRadwareUrl: '/admin/updateRadwareUrl',
    deleteRadwareUrl: '/admin/deleteRadwareUrl',
    findRadwareUrl: '/admin/findRadwareUrl',
    sendDataRadWare: '/admin/sendDataRadWare', // 下发网关

    EsightUpdateAlarm: '/admin/EsightUpdateAlarm',

    insertZbxAlarmLogKnow: '/admin/insertZbxAlarmLogKnow',
    findZbxFlowSummary: '/admin/findZbxFlowSummary', // 流量数据统计
    findZbxFlowStatistics: '/admin/findZbxFlowStatistics', // 流量汇总

    getHostAlarmLogCount: '/admin/getHostAlarmLogCount'
  },
  // 人员
  hr: {
    findHrUserInfo: '/admin/findHrUserInfo', // 获取人员列表
    saveHrUserInfo: '/admin/saveHrUserInfo', // 保存人员
    getHrUserInfo: '/admin/getHrUserInfo', // 查看人员
    deleteHrUserInfo: '/admin/deleteHrUserInfo', // 删除人员
    updateHrUserInfo: '/admin/updateHrUserInfo' // 更新人员
  },
  // 动环
  powerEnv: {
    updateHyitAlarmLog: '/pe/updateHyitAlarmLog',
    findHyitDevice: '/pe/findHyitDevice',
    newShowDayDeviceValueLog: '/pe/showDayDeviceValueLog',
    showDayDeviceValueLog: '/pe/showDayDeviceValueLogByType',
    showDayDeviceValueLogByIds: '/pe/showDayDeviceValueLogByIds',
    findHyitDeviceValue: '/pe/findHyitDeviceValue', // 查询设备值
    findHyitDeviceMap: '/pe/findHyitDeviceMap',
    findHyitValueType: '/pe/findHyitValueType',
    findHyitValueTypeByIds: '/pe/findHyitValueTypeByIds',
    showDayDeviceValueNumber: '/pe/showDayDeviceValueNumber',
    showDayDeviceValueNumberByIds: '/pe/showDayDeviceValueNumberByIds',
    findHyitOrg: '/pe/findHyitOrg',
    findHyitDeviceValueLog: '/pe/findHyitDeviceValueLog',
    findHyitDeviceValueByDev: '/pe/findHyitDeviceValueByDev',
    findHyitDeviceForDH: '/pe/findHyitDeviceForDH',
    findHyitDeviceForValue: '/pe/findHyitDeviceForValue',
    findEstateCard: '/pe/findEstateCard',
    findHyitSubSystem: '/pe/findHyitSubSystem',
    insertHyitHost: '/pe/insertHyitHost',
    updateHyitHost: '/pe/updateHyitHost',
    deleteHyitHost: '/pe/deleteHyitHost',
    findHyitHost: '/pe/findHyitHost',
    getHyitHost: '/pe/getHyitHost',
    findHyitDevType: '/pe/findHyitDevType',
    insertHyitDevice: '/pe/insertHyitDevice',
    updateHyitDevice: '/pe/updateHyitDevice',
    getHyitDevice: '/pe/getHyitDevice',
    getServerPushConfig: '/admin/getServerPushConfig',
    restartSystem: '/admin/restartSystem',
    deleteHyitDeviceMap: '/pe/deleteHyitDeviceMap',
    insertHyitDeviceMap: '/pe/insertHyitDeviceMap',
    insertHyitHostDeviceMap: '/admin/insertHyitHostDeviceMap',
    findHyitHostDeviceMap: '/admin/findHyitHostDeviceMap',
    deleteHyitHostDeviceMap: '/admin/deleteHyitHostDeviceMap',
    deleteHyitDevice: '/pe/deleteHyitDevice',
    updateHyitDeviceValue: '/pe/updateHyitDeviceValue',
    getHyitDeviceValue: '/pe/getHyitDeviceValue',
    findHyitDeviceValueAlarmRule: '/pe/findHyitDeviceValueAlarmRule',
    insertHyitDeviceValueAlarmRule: '/pe/insertHyitDeviceValueAlarmRule',
    deleteHyitDeviceValueAlarmRule: '/pe/deleteHyitDeviceValueAlarmRule',
    deleteHyitDeviceValue: '/pe/deleteHyitDeviceValue',
    getHyitSubSystem: '/pe/getHyitSubSystem',
    deleteHyitSubSystem: '/pe/deleteHyitSubSystem',
    insertHyitSubSystem: '/pe/insertHyitSubSystem',
    updateHyitSubSystem: '/pe/updateHyitSubSystem',
    findHyitDeviceValueMappings: '/pe/findHyitDeviceValueMappings',
    insertHyitDeviceValueMappings: '/pe/insertHyitDeviceValueMappings',
    deleteHyitDeviceValueMappings: '/pe/deleteHyitDeviceValueMappings',
    updateHyitDeviceValueMappings: '/pe/updateHyitDeviceValueMappings',
    findHyitEvent: '/pe/findHyitEvent',
    findHyitAlarmLevel: '/pe/findHyitAlarmLevel',
    findHyitAgentSubsystem: '/pe/findHyitAgentSubsystem',
    insertHyitAgentSubsystem: '/pe/insertHyitAgentSubsystem',
    deleteHyitAgentSubsystem: '/pe/deleteHyitAgentSubsystem',
    getHyitAgentSubsystem: '/pe/getHyitAgentSubsystem',
    syncDongHuanSystem: '/admin/syncDongHuanSystem',
    // ic卡管理
    addDHUser: '/admin/addDHUser',
    deleteDHUser: '/admin/deleteDHUser',
    addDHUserCard: '/admin/addDHUserCard',
    deleteDHUserCard: '/admin/deleteDHUserCard',
    insertEsCardSystemAgent: '/admin/insertEsCardSystemAgent',
    updateEsCardSystemAgent: '/admin/updateEsCardSystemAgent',
    findEsCardSystemAgent: '/admin/findEsCardSystemAgent',
    deleteEsCardSystemAgent: '/admin/deleteEsCardSystemAgent',

    findPowerEnvUser: '/pe/findPowerEnvUser',
    insertPowerEnvUser: '/pe/insertPowerEnvUser',
    updatePowerEnvUser: '/pe/updatePowerEnvUser',
    deletePowerEnvUser: '/pe/deletePowerEnvUser',
    findPowerEnvCard: '/pe/findPowerEnvCard',
    deletePowerEnvCard: '/pe/deletePowerEnvCard',
    updatePowerEnvCard: '/pe/updatePowerEnvCard',
    insertPowerEnvCard: '/pe/insertPowerEnvCard',
    countPeUserCardNum: '/pe/countPeUserCardNum',
    getAllCradController: '/pe/getAllCardController',
    addDHUserPower: '/admin/addDHUserPower', // 添加门禁权限
    deleteDHUserPower: '/admin/deleteDHUserPower',
    syncDHUser: '/admin/syncDHUser', // 同步门禁用户
    findEsVisitor: '/admin/findEsVisitor', // 查看访客记录
    insertEsVisitor: '/admin/insertEsVisitor', // 新增访客
    updateEsVisitor: '/admin/updateEsVisitor',
    findHyitDhMenuValue: '/admin/findHyitDhMenuValue', // 动环
    insertHyitDhMenuValue: '/admin/insertHyitDhMenuValue', // 新增动环样式
    updateHyitDhMenuValue: '/admin/updateHyitDhMenuValue',
    deleteHyitDhMenuValue: '/admin/deleteHyitDhMenuValue',
    insertHyitDhMenu: '/admin/insertHyitDhMenu', // 新增动环栏目
    findHyitDhMenu: '/admin/findHyitDhMenu', // 查询动环栏目
    getHyitDhMenu: '/admin/getHyitDhMenu',
    updateHyitDhMenu: '/admin/updateHyitDhMenu',
    deleteHyitDhMenu: '/admin/deleteHyitDhMenu',
    showDayDHAlarmLogByHour: '/pe/showDayDHAlarmLogByHour',
    showDHAlarmLogByAll: '/pe/showDHAlarmLogByAll',
    findHyitAlarmLog: '/pe/findHyitAlarmLog',
    findDeviceNumAndState: '/pe/findDeviceNumAndState',
    findHostNumAndState: '/pe/findHostNumAndState',
    showHourDeviceValueLog: '/pe/showHourDeviceValueLog',
    showTimeDeviceValueLog: '/pe/showTimeDeviceValueLog',
    // findHyitSubSystem: 'pe/findHyitSubSystem', // 子系统下拉
    // findHyitAgentSubsystem: 'pe/findHyitAgentSubsystem'// 子系统对应网关
    showDayDeviceValueLogDoor: '/pe/showDayDeviceValueLogDoor',
    findEsBuild: '/admin/findEsBuild', // 楼宇
    findEsFloor: '/admin/findEsFloor', //
    findEsRoom: '/admin/findEsRoom',
    insertEsRoom: '/admin/insertEsRoom',
    getEsRoom: '/admin/getEsRoom',
    deleteEsRoom: '/admin/deleteEsRoom',
    updateEsRoom: '/admin/updateEsRoom',
    insertEsCard: '/admin/insertEsCard', // 新增ic卡
    deleteEsCard: '/admin/deleteEsCard', // 删除ic卡
    getEsCard: '/admin/getEsCard',
    updateEsCard: '/admin/updateEsCard',
    findEsCard: '/admin/findEsCard', // 查询ic卡
    findEsOwner: '/admin/findEsOwner',
    getEsOwner: '/admin/getEsOwner',
    updateEsOwner: '/admin/updateEsOwner',
    deleteEsOwner: '/admin/deleteEsOwner',
    insertEsOwner: '/admin/insertEsOwner',
    deleteEsOwnerPermission: '/admin/deleteEsOwnerPermission',
    addEsOwnerPermission: '/admin/addEsOwnerPermission',
    getEsOwnerPermission: '/admin/getEsOwnerPermission',
    addDHUserFaceSerialNum: '/admin/addDHUserFaceSerialNum',
    deleteDHUserFaceSerialNum: '/admin/deleteDHUserFaceSerialNum',
    getSyncProgress: '/admin/getSyncProgress',
    resyncCard: '/admin/resyncCard',
    getEsRoomHost: '/admin/getEsRoomHost',
    findEsRoomHost: '/admin/findEsRoomHost',
    findHyitHkHostLog: '/admin/findHyitHkHostLog',
    findOwnerNumByHour: '/admin/findOwnerNumByHour',
    findPowerAccessLog: '/admin/findPowerAccessLog',
    setVal: '/admin/setVal',
    inspectionDongHuan: '/admin/inspectionDongHuan',
    findPowerEnvInspectionReport: '/admin/findPowerEnvInspectionReport',
    updatePowerEnvInspectionReport: '/admin/updatePowerEnvInspectionReport',
    getPowerEnvInspectionReport: '/admin/getPowerEnvInspectionReport',
    findPowerEnvInspectionReportPicture: '/admin/findPowerEnvInspectionReportPicture',
    insertPowerEnvInspectionReportPicture: '/admin/insertPowerEnvInspectionReportPicture',
    deletePowerEnvInspectionReportPicture: '/admin/deletePowerEnvInspectionReportPicture',
    findPowerEnvInspectionReportDetail: '/admin/findPowerEnvInspectionReportDetail',
    findPowerEnvInspectionReportAlarm: '/admin/findPowerEnvInspectionReportAlarm',
    getPowerEnvInspectionReportDetail: '/admin/getPowerEnvInspectionReportDetail',
    insertLinkageThresholdConditionClassMap: '/admin/insertLinkageThresholdConditionClassMap',
    deleteLinkageThresholdConditionClassMap: '/admin/deleteLinkageThresholdConditionClassMap',
    findLinkageThresholdConditionClassMap: '/admin/findLinkageThresholdConditionClassMap',
    findSysMobileUser: '/admin/findSysMobileUser',
    findSysMobileApplication: '/admin/findSysMobileApplication',
    showDayDHAlarmLogByDay: '/pe/showDayDHAlarmLogByDay',
    selectDeviceNumByOrgId: '/pe/selectDeviceNumByOrgId'
  },
  // 系统菜单
  sysMenu: {
    findSysMenu: '/admin/findSysMenu', // 查询系统菜单列表
    getSysMenu: '/admin/getSysMenu', // 查看系统菜单
    deleteSysMenu: '/admin/deleteSysMenu' // 删除系统菜单
  },
  // 系统应用
  sysApp: {
    insertSysApp: '/admin/insertSysApp', // 新增app
    findSysApp: '/admin/findSysApp', // 查询app列表
    getSysApp: '/admin/getSysApp', // 查看app
    updateSysApp: '/admin/updateSysApp', // 更新app
    deleteSysApp: '/admin/deleteSysApp' // 删除pp
  },
  // 公司
  company: {
    insertSysCompany: '/admin/insertSysCompany', // 新增公司
    deleteSysCompany: '/admin/deleteSysCompany', // 删除公司
    getSysCompany: '/admin/getSysCompany', // 查看公司
    findSysCompany: '/admin/findSysCompany', // 查询公司列表
    updateSysCompany: '/admin/updateSysCompany' // 更新公司
  },
  // 工单
  opm: {
    findDashboardShow: '/admin/findDashboardShow', // 仪表盘显示配置 - 查询接口
    insertDashboardShow: '/admin/insertDashboardShow', // 仪表盘显示配置 - 新增接口
    deleteDashboardShow: '/admin/deleteDashboardShow', // 仪表盘显示配置 - 删除接口
    updateDashboardShow: '/admin/updateDashboardShow', // 仪表盘显示配置 - 编辑接口
    findTask: '/admin/findTask', // 获取审批信息
    getTaskListByInstanceId: '/admin/getTaskListByInstanceId', // 获取审批信息
    getProcessState: '/admin/getProcessState', // 获取审批流程状态。参数,processState
    updateOpsOrderProblemContactBatch: '/admin/updateOpsOrderProblemContactBatch',
    findOpsOrderProblemContact: '/admin/findOpsOrderProblemContact',
    myOpmMaintenanceTaskCount: '/admin/myOpmMaintenanceTaskCount', // 仪表盘 工单我的事项
    getPersonProblemWorkCount: '/admin/getPersonProblemWorkCount', // 仪表盘 巡查报告时间
    pendOpmMaintenanceCount: '/admin/pendOpmMaintenanceCount', // 仪表盘 工单待审批工单
    transactOpmMaintenanceCount: '/admin/transactOpmMaintenanceCount', // 仪表盘 工单待处理工单
    findOpmMaintenance: '/admin/findOpmMaintenance', // 仪表盘 工单运行信息
    OpmMaintenanceStatusCount: '/admin/OpmMaintenanceStatusCount', // 仪表盘 工单类型
    insertOmRequest: '/admin/insertOmRequest', // 新增事项
    getOmRequest: '/admin/getOmRequest', // 查看事项
    findOmRequest: '/admin/findOmRequest', // 查询事项,
    deleteOmRequest: '/admin/deleteOpsOrderProblem', // 删除事项
    findHyitBusinessSystem: '/admin/findHyitBusinessSystem', // 关联业务
    findOmRequestHost: '/admin/findOmRequestHost', // 查看关联设备
    getOmRequestHost: '/admin/getOmRequestHost', // 查看关联设备
    insertOmRequestHost: '/admin/insertOmRequestHost', // 提交关联设备
    findHrUserInfo: '/admin/findHrUserInfo', // 查看联系人
    getHrUserInfo: '/admin/getHrUserInfo', // 查看联系人
    insertOmRequestNotify: '/admin/insertOmRequestNotify', // 提交反馈联系人
    getSingleAttachment: '/admin/getSingleAttachment', // 查看附件 tId=requestId
    insertOpsOrderProblem: 'admin/insertOpsOrderProblem', // 新增运维工单
    findOpsOrderProblem: 'admin/findOpsOrderProblem', // 编辑运维工单
    insertOpsOrderProblemDevice: 'admin/insertOpsOrderProblemDevice', // 提交关联设备
    insertOpsOrderProblemFile: 'admin/insertOpsOrderProblemFile', // 新增运维工单 事项附件表
    insertOpsOrderProblemContact: 'admin/insertOpsOrderProblemContact', // 新增运维工单 事项联系人表
    findOpsOrderProblemBs: 'admin/findOpsOrderProblemBs', // 查询业务数据
    insertOpsOrderProblemBs: 'admin/insertOpsOrderProblemBs', // 提交关联业务
    getOpsOrderProblem: 'admin/getOpsOrderProblem', // 查看运维工单 事项表
    updateOpsOrderProblem: 'admin/updateOpsOrderProblem', // 编辑运维工单 事项表
    updateOpsOrderProblemFile: 'admin/updateOpsOrderProblemFile', // 编辑运维工单 事项附件表
    updateOpsOrderProblemBs: 'admin/updateOpsOrderProblemBs', //  编辑运维工单 事项业务系统关联表
    updateOpsOrderProblemBsByIds: 'admin/updateOpsOrderProblemBsByIds', //  编辑运维工单 事项业务系统关联表
    updateOpsOrderProblemDevice: 'admin/updateOpsOrderProblemDevice', // 编辑运维工单 事项设备关联表
    updateOpsOrderProblemDeviceByIds: 'admin/updateOpsOrderProblemDeviceByIds', // 编辑运维工单 事项设备关联表
    updateOpsOrderProblemContact: 'admin/updateOpsOrderProblemContact', // 编辑运维工单 事项联系人表
    getOpsOrderProblemBs: 'admin/getOpsOrderProblemBs', // 查看业务系统关联表
    getOpsOrderProblemDevice: 'admin/getOpsOrderProblemDevice', // 查看运维工单 事项设备关联表
    getOpsOrderProblemContact: 'admin/getOpsOrderProblemContact', // 查看运维工单 事项联系人表
    getOpsOrderProblemFile: 'admin/getOpsOrderProblemFile', // 查看运维工单 事项附件表
    findOpsOrderProblemFile: '/admin/findOpsOrderProblemFile', // 查询事项附件
    findOpsOrderProblemDevice: '/admin/findOpsOrderProblemDevice', // 查询事项关联设备
    insertOpsOrderAnalysis: '/admin/insertOpsOrderAnalysis', // 新增工单分析&总结
    deleteOpsOrderAnalysis: '/admin/deleteOpsOrderAnalysis', // 删除工单分析
    findOpsOrderAnalysis: '/admin/findOpsOrderAnalysis', // 查询工单分析&总结
    insertOpsOrderFile: '/admin/insertOpsOrderFile', // 新增工单附件
    findOpsOrderFile: '/admin/findOpsOrderFile', // 查询工单附件
    deleteOpsOrderFile: '/admin/deleteOpsOrderFile', // 删除工单附件
    insertOpsOrderKbms: '/admin/insertOpsOrderKbms', // 新增事项关联知识点
    deleteOpsOrderKbms: '/admin/deleteOpsOrderKbms', // 删除事项关联知识点
    findOpsOrderKbms: '/admin/findOpsOrderKbms', // 查询事项关联知识点
    updateOpsOrderKbmsBatch: '/admin/updateOpsOrderKbmsBatch', // 批量新增/编辑事项知识点
    insertOpsOrderChange: '/admin/insertOpsOrderChange', // 新增变更
    findOpsOrderChange: '/admin/findOpsOrderChange', // 查询变更
    insertOpsOrderWorkTask: '/admin/insertOpsOrderWorkTask',
    insertOpsOrderWorkTaskDevice: 'admin/insertOpsOrderWorkTaskDevice',
    deleteOpsOrderWorkTask: '/admin/deleteOpsOrderWorkTask',
    findOpsOrderWorkTaskDevice: '/admin/findOpsOrderWorkTaskDevice',
    getOpsOrderWorkTask: '/admin/getOpsOrderWorkTask',
    insertOpsOrderWorkLog: '/admin/insertOpsOrderWorkLog',
    updateOpsOrderWorkTask: '/admin/updateOpsOrderWorkTask',
    findOpsOrderWorkCountLog: '/admin/findOpsOrderWorkCountLog', // 运维视图：获取工作--事项列表数据
    findOpsOrderWorkLog: '/admin/findOpsOrderWorkLog', // 运维视图：获取工作--事项列表数据
    findOpsOrderWorkLogLoadCount: '/admin/findOpsOrderWorkLogLoadCount', // 运维视图： 负荷统计
    findOpsOrderWorkLogAnalyzeCount: '/admin/findOpsOrderWorkLogAnalyzeCount', //  运维视图：分析统计
    findOpsUserList: '/admin/findOpsUserList', //  运维视图：人员详情--人员列表
    findSysUser: '/admin/findSysUser', // 运维视图：人员
    getSysUser: '/admin/getSysUser', //  运维视图：人员详情--获取用户信息
    findOpsOrderWorkTask: '/admin/findOpsOrderWorkTask', // 运维视图：人员详情--获取作业列表
    findPersonWorkCount: '/admin/findPersonWorkCount', //  运维视图：人员详情--获取个人统计数据
    insertOpsOrderProblemLog: '/admin/insertOpsOrderProblemLog', // 新增运维工单 事项操作记录表
    getOpsOrderProblemLog: '/admin/getOpsOrderProblemLog', // 查看运维工单 事项操作记录表
    findOpsOrderProblemLog: '/admin/findOpsOrderProblemLog', // 查询运维工单 事项操作记录表
    deleteOpsOrderChange: '/admin/deleteOpsOrderChange',
    countNumByDateAndServiceType: '/admin/countNumByDateAndServiceType', // 查询统计
    countNumByDateAndProcessState: '/admin/countNumByDateAndProcessState', // 查询事项数量统计
    countNumByDateAndStatue: '/admin/countNumByDateAndStatue', // 查询事项数量统计

    // 值班
    insertHyitDutyDay: '/admin/insertHyitDutyDay', // 增
    getHyitDutyDay: '/admin/getHyitDutyDay', // 查
    findHyitDutyDay: '/admin/findHyitDutyDay', // 列表
    updateHyitDutyDay: '/admin/updateHyitDutyDay', // 编辑
    deleteHyitDutyDay: '/admin/deleteHyitDutyDay', // 删
    insertHyitDutyDays: '/admin/insertHyitDutyDays', // 批量增
    deleteHyitDutyDays: '/admin/deleteHyitDutyDays', // 批量删

    // 值班人员
    insertHyitDutyDayUser: '/admin/insertHyitDutyDayUser', // 增
    deleteHyitDutyDayUser: '/admin/deleteHyitDutyDayUser', // 删
    updateHyitDutyDayUser: '/admin/updateHyitDutyDayUser', // 编辑
    findHyitDutyDayUser: '/admin/findHyitDutyDayUser', // 列表
    getHyitDutyDayUser: '/admin/getHyitDutyDayUser', // 查
    deleteHyitDutyDayUsers: '/admin/deleteHyitDutyDayUsers', // 批量删
    insertHyitDutyDayUsers: '/admin/insertHyitDutyDayUsers', // 批量增

    // 请假
    insertHyitDutyLeave: '/admin/insertHyitDutyLeave',
    deleteHyitDutyLeave: '/admin/deleteHyitDutyLeave',
    updateHyitDutyLeave: '/admin/updateHyitDutyLeave',
    getHyitDutyLeave: '/admin/getHyitDutyLeave',
    findHyitDutyLeave: '/admin/findHyitDutyLeave',
    findHyitDutyLeaveSummary: '/admin/findHyitDutyLeaveSummary',

    // 加班
    insertHyitDutyOverTime: '/admin/insertHyitDutyOverTime',
    deleteHyitDutyOverTime: '/admin/deleteHyitDutyOverTime',
    updateHyitDutyOverTime: '/admin/updateHyitDutyOverTime',
    getHyitDutyOverTime: '/admin/getHyitDutyOverTime',
    findHyitDutyOverTime: '/admin/findHyitDutyOverTime',

    // 服务类型
    insertOpsOrderProblemService: '/admin/insertOpsOrderProblemService',
    getOpsOrderProblemService: '/admin/getOpsOrderProblemService',
    updateOpsOrderProblemService: '/admin/updateOpsOrderProblemService',
    findOpsOrderProblemService: '/admin/findOpsOrderProblemService',
    deleteOpsOrderProblemService: '/admin/deleteOpsOrderProblemService',
    findOpsOrderProblemGroupMap: '/admin/findOpsOrderProblemGroupMap',

    findHyitDutyOverTimeSummary: '/admin/findHyitDutyOverTimeSummary',

    findHyitDutySummary: '/admin/findHyitDutySummary',
    insertOpsOrderProblemGroupMap: '/admin/insertOpsOrderProblemGroupMap',
    deleteOpsOrderProblemGroupMap: '/admin/deleteOpsOrderProblemGroupMap',

    findOpsOrderProblemProcessStateStatistics: '/admin/findOpsOrderProblemProcessStateStatistics', // 事项处理状态统计
    findOpsOrderProblemEx: '/admin/findOpsOrderProblemEx', // 根据查询小组事项

    findOpsOrderProblemEvaluate: '/admin/findOpsOrderProblemEvaluate',
    insertOpsOrderProblemEvaluate: '/admin/insertOpsOrderProblemEvaluate',

    // 工作汇报
    insertOpsOrderWorkRecords: '/admin/insertOpsOrderWorkRecords',
    insertOpsOrderWorkPlan: '/admin/insertOpsOrderWorkPlan',
    insertOpsOrderWorkContent: '/admin/insertOpsOrderWorkContent',
    insertOpsOrderWorkRecordsFile: '/admin/insertOpsOrderWorkRecordsFile',
    getOpsOrderWorkRecords: '/admin/getOpsOrderWorkRecords',
    findOpsOrderWorkPlan: '/admin/findOpsOrderWorkPlan',
    findOpsOrderWorkContent: '/admin/findOpsOrderWorkContent',
    findOpsOrderWorkRecordsFile: '/admin/findOpsOrderWorkRecordsFile',
    updateOpsOrderWorkRecords: '/admin/updateOpsOrderWorkRecords',
    updateOpsOrderWorkPlan: '/admin/updateOpsOrderWorkPlan',
    updateOpsOrderWorkContent: '/admin/updateOpsOrderWorkContent',
    updateOpsOrderWorkRecordsFile: '/admin/updateOpsOrderWorkRecordsFile',
    getOpsOrderWorkPlan: '/admin/getOpsOrderWorkPlan',
    changeOpsOrderWorkRecordsUserMap: '/admin/changeOpsOrderWorkRecordsUserMap',
    deleteOpsOrderWorkRecords: '/admin/deleteOpsOrderWorkRecords',
    findOpsOrderWorkRecords: '/admin/findOpsOrderWorkRecords',
    findOpsOrderWorkRecordsUserMap: '/admin/findOpsOrderWorkRecordsUserMap', // 汇报分享人员关联表
    findZbxAlarmLog: '/admin/findZbxAlarmLog', // 故障

    countOpsOrderProblemByGroup: '/admin/countOpsOrderProblemByGroup',
    messageSendToPlatform: '/admin/messageSendToPlatform', // 事项推送
    getOpsOrderProblemServiceMap: '/admin/getOpsOrderProblemServiceMap', // 服务类型关联动作类型
    updateOpsOrderProblemServiceMap: '/admin/updateOpsOrderProblemServiceMap', // 服务类型关联动作类型
    findOpsOrderProblemServiceMap: '/admin/findOpsOrderProblemServiceMap', // 服务类型关联动作类型
    insertOpsOrderProblemServiceMap: '/admin/insertOpsOrderProblemServiceMap', // 服务类型关联动作类型
    deleteOpsOrderProblemServiceMap: '/admin/deleteOpsOrderProblemServiceMap', // 服务类型关联动作类型
    changeOpsOrderProblemServiceMap: '/admin/changeOpsOrderProblemServiceMap'
  },
  // 文件上传
  file: {
    AuthUploadToken: '/admin/AuthUploadToken', // 获取文件上传凭证
    uploadPic: '/resource/uploadPic', // 上传图片
    uploadDocument: '/resource/uploadDocument', // 上传文件
    saveBatchAttachment: '/admin/saveBatchAttachment', // 保存附件
    findHyAttachment: '/admin/findHyAttachment' // 获取附件
  },
  // 网络配置
  networkConfig: {
    getIpConfig: '/admin/getIpConfig', // 查看网络配置
    setIpConfig: '/admin/setIpConfig' // 设置网络配置
  },
  // 区域
  area: {
    findHyitArea: '/admin/findHyitArea', // 获取区域列表
    insertHyitArea: '/admin/insertHyitArea', // 新增区域
    deleteHyitArea: '/admin/deleteHyitArea', // 删除区域
    getHyitArea: '/admin/getHyitArea', // 查看区域
    updateHyitArea: '/admin/updateHyitArea' // 更新区域
  },
  // 组织机构
  org: {
    insertHyitOrg: '/admin/insertHyitOrg', // 新增组织机构
    deleteHyitOrg: '/admin/deleteHyitOrg', // 删除组织机构
    updateHyitOrg: '/admin/updateHyitOrg', // 更新组织机构
    getHyitOrg: '/admin/getHyitOrg', // 查看组织机构
    findHyitOrg: '/admin/findHyitOrg' // 查询组织机构列表
  },
  // cmdb
  cmdb: {
    // 关系管理
    insertCmdbRelationshipType: '/admin/insertCmdbRelationshipType', // 新增关系
    deleteCmdbRelationshipType: '/admin/deleteCmdbRelationshipType', // 删除关系
    updateCmdbRelationshipType: '/admin/updateCmdbRelationshipType', // 更新关系
    findCmdbRelationshipType: '/admin/findCmdbRelationshipType', // 查询关系列表
    getCmdbRelationshipType: '/admin/getCmdbRelationshipType', // 查看关系
    // 配置项类型
    insertCmdbItemType: '/admin/insertCmdbItemType', // 新增配置项类型
    deleteCmdbItemType: '/admin/deleteCmdbItemType', // 删除配置项类型
    updateCmdbItemType: '/admin/updateCmdbItemType', // 更新配置项类型
    findCmdbItemType: '/admin/findCmdbItemType', // 查询配置项类型列表
    getCmdbItemType: '/admin/getCmdbItemType', // 查看配置项类型
    // 配置项关联关系
    insertCmdbItemTypeRelationship: '/admin/insertCmdbItemTypeRelationship', // 新增配置项关联关系
    deleteCmdbItemTypeRelationship: '/admin/deleteCmdbItemTypeRelationship', // 删除配置项关联关系
    updateCmdbItemTypeRelationship: '/admin/updateCmdbItemTypeRelationship', // 更新配置项关联关系
    findCmdbItemTypeRelationship: '/admin/findCmdbItemTypeRelationship', // 查询配置项关联关系列表
    getCmdbItemTypeRelationship: '/admin/getCmdbItemTypeRelationship', // 查看配置项关联关系
    // 配置项
    insertCmdbItem: '/admin/insertCmdbItem', // 新增配置项
    updateCmdbItem: '/admin/updateCmdbItem', // 更新配置项
    findCmdbItem: '/admin/findCmdbItem', // 查询配置项列表
    deleteCmdbItem: '/admin/deleteCmdbItem', // 删除配置项
    getCmdbItem: '/admin/getCmdbItem', // 查看配置项
    // 配置项关联关系
    insertCmdbItemMaps: '/admin/insertCmdbItemMaps', // 批量新增
    insertCmdbItemMap: '/admin/insertCmdbItemMap', // 增
    deleteCmdbItemMap: '/admin/deleteCmdbItemMap', // 删
    findCmdbItemMap: '/admin/findCmdbItemMap', // 查询列表
    // cmdb配置
    findCmdbTable: '/admin/findCmdbTable', // cmdb类型实体列表
    AutoCmdb: '/admin/AutoCmdb', // cmdb 自动化
    findtablecolumn: '/admin/findtablecolumn', // 类型实体新增-----关系---字段
    deleteCmdbTable: '/admin/deleteCmdbTable' // 删除--表单
  },
  // 设备授权
  deviceAuth: {
    insertDeviceAuth: '/admin/insertDeviceAuth', // 新增设备授权
    deleteDeviceAuth: '/admin/deleteDeviceAuth', // 删除设备授权
    updateDeviceAuth: '/admin/updateDeviceAuth', // 更新设备授权
    findDeviceAuth: '/admin/findDeviceAuth', // 查询设备授权列表
    getDeviceAuth: '/admin/getDeviceAuth', // 查看设备授权列表
    deleteDeviceAuthByIds: '/admin/deleteDeviceAuthByIds' // 根据id批量删除设备授权
  },
  // 联动配置
  linkageManage: {
    // 移动应用管理
    insertSysMobileApplication: '/admin/insertSysMobileApplication', // 新增移动应用
    findSysMobileApplication: '/admin/findSysMobileApplication', // 查询移动应用
    getSysMobileApplication: '/admin/getSysMobileApplication', // 查看移动应用
    updateSysMobileApplication: '/admin/updateSysMobileApplication', // 编辑移动应用
    deleteSysMobileApplication: '/admin/deleteSysMobileApplication', // 删除移动应用

    auditSysMobileUser: '/admin/auditSysMobileUser', //  审核移动端用户管理
    findSysMobileUser: '/admin/findSysMobileUser', // 查询移动端用户管理

    getHyitEvent: '/admin/getLinkageEvent', // 查看事件类型
    findHyitEvent: '/admin/findLinkageEvent', // 查询事件类型列表
    getHyitEventClass: '/admin/getLinkageEventClass', // 查看事件分类
    findHyitEventClass: '/admin/findLinkageEventClass', // 查询事件分类列表
    getHyitLinkSrc: '/admin/getLinkageSrc', // 查看事件源
    findHyitLinkSrc: '/admin/findLinkageSrc', // 查询事件源列表
    findHyitAlarmLevel: '/admin/findHyitAlarmLevel', // 查询报警等级

    findHyitActionClass: '/admin/findLinkageActionClass', // 动作类型
    getHyitAction: '/admin/getLinkageAction', // 搜索动作
    findHyitAction: '/admin/findLinkageActionTemplate', // 查询动作列表 联动规则列表
    deleteHyitAction: '/admin/deleteLinkageAction', // 删除动作
    insertHyitAction: '/admin/insertLinkageAction', // 新增动作
    updateHyitAction: '/admin/updateLinkageAction', // 编辑动作
    getDynamicSelectData: '/admin/getDynamicSelectData', // 动作源,根据动作接口查询
    findDynamicSelectData: '/admin/getDynamicSelectData', // 动作源,根据动作接口查询

    insertHyitLinkSrc: '/admin/insertLinkageLinkSrc', // 提交事件
    insertHyitLink: '/admin/insertLinkageRules', // 提交联动配置
    insertHyitLinkAction: '/admin/insertLinkageLinkAction', // 提交动作，此步调用上两个接口一起提交，并把提交联动的主键给到1,3
    updateHyitLinkSrc: '/admin/updateLinkageLinkSrc',
    updateHyitLink: '/admin/updateLinkageRules',
    insertLinkageRules: '/admin/insertLinkageRules',
    updateLinkageRules: '/admin/updateLinkageRules',

    updateHyitLinkAction: '/admin/updateHyitLinkAction',
    deleteHyitLinkAction: '/admin/deleteHyitLinkAction',
    changeHyitLinkSrc: '/admin/changeLinkSrc',
    changeHyitLinkAction: '/admin/changeHyitLinkAction',
    getHyitLink: '/admin/getLinkageRules',
    findHyitLink: '/admin/findLinkageRules', // 联动配置管理
    deleteHyitLink: '/admin/deleteLinkageRules', // 联动配置删除
    findHyitLinkAction: '/admin/findLinkageActionTemplate',
    getHyitLinkAction: '/admin/getLinkageActionTemplate',
    findPlatformMessageTemplate: '/admin/findPlatformMessageTemplate', // 动作关联消息模板
    // 关键字过滤
    insertLinkageRulesKeywords: '/admin/insertLinkageRulesKeywords',
    findLinkageRulesKeywords: '/admin/findLinkageRulesKeywords',
    deleteLinkageRulesKeywords: '/admin/deleteLinkageRulesKeywords',
    insertLinkageRulesKeywordsMap: '/admin/insertLinkageRulesKeywordsMap',
    changeLinkageRulesKeywordsMap: '/admin/changeLinkageRulesKeywordsMap',

    findLinkageRulesKeywordsMap: '/admin/findLinkageRulesKeywordsMap',
    deleteLinkageRulesKeywordsMap: '/admin/deleteLinkageRulesKeywordsMap',

    // 关联联系人
    findPlatformMobileApplication: '/admin/findPlatformMobileApplication', // 查询公众号
    findPlatformUser: '/admin/findPlatformUser', // 查询公众号用户

    findAllHyitLinkSrc: '/admin/findAllLinkageLinkSrc', // 联动配置列表事件源匹配
    findAllHyitLinkAction: '/admin/findAllLinkageLinkAction', // 联动配置列表动作源匹配
    updateLocalCache: '/admin/updateLocalCache',
    findSysDictionaryDetail: '/admin/findSysDictionaryDetail',
    // 邮件
    insertComSendMailNo: '/admin/insertComSendMailNo', // 新增邮件
    deleteComSendMailNo: '/admin/deleteComSendMailNo', // 删除邮件
    updateComSendMailNo: '/admin/updateComSendMailNo', // 编辑邮件
    findComSendMailNo: '/admin/findComSendMailNo', // 邮件列表
    getComSendMailNo: '/admin/getComSendMailNo',

    // 发送公众号
    findWeixinConfig: '/admin/findWeixinConfig',
    insertWeixinConfig: '/admin/insertWeixinConfig',
    updateWeixinConfig: '/admin/updateWeixinConfig',
    deleteWeixinConfig: '/admin/deleteWeixinConfig',
    getWeixinConfig: '/admin/getWeixinConfig',

    // 接收联系人
    findWeixinbook: '/admin/findWeixinbook', // 通讯录
    updateWeixinbook: '/admin/updateWeixinbook',
    getWeixinbook: '/admin/getWeixinbook',
    findHyitBook: '/admin/findHyitBook',
    insertHyitBook: '/admin/insertHyitBook',
    updateHyitBook: '/admin/updateHyitBook',
    getHyitBook: '/admin/getHyitBook',
    deleteHyitBook: '/admin/deleteHyitBook',
    bookBindWechat: '/admin/bookBindWechat',
    syncWeixinLRbook: '/admin/syncWeixinLRbook',

    // 联动内容模板
    findHyitModelHtml: '/admin/findHyitModelHtml',
    updateHyitModelHtml: '/admin/updateHyitModelHtml',
    insertHyitModelHtml: '/admin/insertHyitModelHtml',
    deleteHyitModelHtml: '/admin/deleteHyitModelHtml',
    getHyitModelHtml: '/admin/getHyitModelHtml',

    // 流程配置
    insertOmProcessModel: '/admin/insertOmProcessModel', // 新增流程配置
    findOmProcessModel: '/admin/findOmProcessModel', // 流程配置列表
    getOmProcessModel: '/admin/getOmProcessModel',
    updateOmProcessModel: '/admin/updateOmProcessModel',
    deleteOmProcessModel: '/admin/deleteOmProcessModel',
    modelDeploy: '/admin/deploy', // 部署流程admin/deploy/{modelId}
    // 阈值
    insertLinkageThresholdCondition: '/admin/insertLinkageThresholdCondition',
    findLinkageThresholdCondition: '/admin/findLinkageThresholdCondition',
    getLinkageThresholdCondition: '/admin/getLinkageThresholdCondition',
    findLinkageEventClass: '/admin/findLinkageEventClass',
    updateLinkageThresholdCondition: '/admin/updateLinkageThresholdCondition',
    deleteLinkageThresholdCondition: '/admin/deleteLinkageThresholdCondition',
    findLinkageThresholdSrcMap: '/admin/findLinkageThresholdSrcMap',
    changeLinkageThresholdSrc: '/admin/changeLinkageThresholdSrc',
    // 监控模板
    insertLinkageMonitorTemplate: '/admin/insertLinkageMonitorTemplate',
    findLinkageMonitorTemplate: '/admin/findLinkageMonitorTemplate',
    getLinkageMonitorTemplate: '/admin/getLinkageMonitorTemplate',
    deleteLinkageMonitorTemplate: '/admin/deleteLinkageMonitorTemplate',
    updateLinkageMonitorTemplate: '/admin/updateLinkageMonitorTemplate',
    insertLinkageThresholdMonitorMap: '/amdin/insertLinkageThresholdMonitorMap',
    findLinkageThresholdMonitorMap: '/amdin/findLinkageThresholdMonitorMap',
    // 动作模板
    findLinkageActionTemplate: '/admin/findLinkageActionTemplate',
    getLinkageActionTemplate: '/admin/getLinkageActionTemplate',
    deleteLinkageActionTemplate: '/admin/deleteLinkageActionTemplate',
    updateLinkageActionTemplate: '/admin/updateLinkageActionTemplate',
    insertLinkageActionTemplate: '/admin/insertLinkageActionTemplate',
    findLinkageActionClass: '/admin/findLinkageActionClass',
    findLinkageActionMap: '/admin/findLinkageActionMap',
    deleteLinkageActionMap: '/admin/deleteLinkageActionMap',
    changeLinkActionMap: '/admin/changeLinkActionMap',
    findLinkageSrc: '/admin/findLinkageSrc',

    insertLinkageAlramFilter: '/admin/insertLinkageAlramFilter', // 新增联动过滤
    deleteLinkageAlramFilter: '/admin/deleteLinkageAlramFilter', // 删除联动过滤
    updateLinkageAlramFilter: '/admin/updateLinkageAlramFilter', // 编辑联动过滤
    findLinkageAlramFilter: '/admin/findLinkageAlramFilter' // 联动过滤列表
  },
  // 业务系统
  bsTopSystem: {
    // 业务系统
    insertBsTopSystem: '/admin/insertBsTopSystem', // 增
    deleteBsTopSystem: '/admin/deleteBsTopSystem', // 删
    updateBsTopSystem: '/admin/updateBsTopSystem', // 改
    findBsTopSystem: '/admin/findBsTopSystem', // 列表
    getBsTopSystem: '/admin/getBsTopSystem', // 详情
    // 业务系统 节点
    insertBsTopItem: '/admin/insertBsTopItem', // 增
    deleteBsTopItem: '/admin/deleteBsTopItem', // 删
    updateBsTopItem: '/admin/updateBsTopItem', // 改
    findBsTopItem: '/admin/findBsTopItem', // 列表
    getBsTopItem: '/admin/getBsTopItem', // 详情
    updateBsTopItemXY: '/admin/updateBsTopItemXY', // 根据业务系统id批量编辑业务拓扑xy坐标
    updateBsTopItemXY2: '/admin/updateBsTopItemXY2', // 批量编辑业务拓扑xy坐标
    // 业务系统 节点链路
    insertBsTopItemLink: '/admin/insertBsTopItemLink', // 增
    deleteBsTopItemLink: '/admin/deleteBsTopItemLink', // 删
    updateBsTopItemLink: '/admin/updateBsTopItemLink', // 改
    findBsTopItemLink: '/admin/findBsTopItemLink', // 列表
    getBsTopItemLink: '/admin/getBsTopItemLink', // 详情
    deleteBsTopItemLinkByIds: '/admin/deleteBsTopItemLinkByIds', // 根据id批量删除链路
    // 业务系统日志
    insertBsTopSystemLog: '/admin/insertBsTopSystemLog', // 增
    deleteBsTopSystemLog: '/admin/deleteBsTopSystemLog', // 删
    updateBsTopSystemLog: '/admin/updateBsTopSystemLog', // 改
    findBsTopSystemLog: '/admin/findBsTopSystemLog', // 列表
    getBsTopSystemLog: '/admin/getBsTopSystemLog', // 详情
    findBsTopSystemLogTopOne: '/admin/findBsTopSystemLogTopOne', // 批量查询业务系统最新的日志
    // 业务系统 节点日志
    insertBsTopItemLog: '/admin/insertBsTopItemLog', // 增
    deleteBsTopItemLog: '/admin/deleteBsTopItemLog', // 删
    updateBsTopItemLog: '/admin/updateBsTopItemLog', // 改
    findBsTopItemLog: '/admin/findBsTopItemLog', // 列表
    getBsTopItemLog: '/admin/getBsTopItemLog' // 详情
  },
  // 组态图 新
  diagram: {
    // 组态图
    insertDiagram: '/admin/insertDiagram', // 增
    deleteDiagram: '/admin/deleteDiagram', // 删
    updateDiagram: '/admin/updateDiagram', // 改
    findDiagram: '/admin/findDiagram', // 列表
    getDiagram: '/admin/getDiagram', // 详情
    // 机柜
    insertDiagramCabinet: 'admin/insertDiagramCabinet',
    findDiagramCabinet: 'admin/findDiagramCabinet',
    deleteDiagramCabinet: 'admin/deleteDiagramCabinet',
    getDiagramCabinet: 'admin/getDiagramCabinet',
    updateDiagramCabinet: 'admin/updateDiagramCabinet',
    insertDiagramCabinetItem: '/admin/insertDiagramCabinetItem',
    findDiagramCabinetItem: '/admin/findDiagramCabinetItem',
    deleteDiagramCabinetItem: '/admin/deleteDiagramCabinetItem',
    updateDiagramCabinetItem: '/admin/updateDiagramCabinetItem',
    findDiagramDevicePicture: '/admin/findDiagramDevicePicture',
    updateDiagramDevicePicture: '/admin/updateDiagramDevicePicture',
    insertDiagramDevicePicture: '/admin/insertDiagramDevicePicture',
    getDiagramDevicePicture: '/admin/getDiagramDevicePicture',
    deleteDiagramDevicePicture: '/admin/deleteDiagramDevicePicture',
    insertDiagramModel: '/admin/insertDiagramModel',
    findDiagramModel: '/admin/findDiagramModel',
    updateDiagramModel: '/admin/updateDiagramModel',
    deleteDiagramModel: '/admin/deleteDiagramModel',
    // 组态图节点
    insertDiagramItem: '/admin/insertDiagramItem', // 增
    deleteDiagramItem: '/admin/deleteDiagramItem', // 删
    updateDiagramItem: '/admin/updateDiagramItem', // 改
    findDiagramItem: '/admin/findDiagramItem', // 列表
    updateDiagramItemXY: '/admin/updateDiagramItemXY', // 根据业务系统id批量编辑业务拓扑xy坐标
    updateDiagramItemXY2: '/admin/updateDiagramItemXY2', // 批量编辑业务拓扑xy坐标
    // 组态图链路
    insertDiagramItemLink: '/admin/insertDiagramItemLink', // 增
    deleteDiagramItemLink: '/admin/deleteDiagramItemLink', // 删
    deleteDiagramItemLinkByIds: '/admin/deleteDiagramItemLinkByIds', // 批量删除链路
    findDiagramItemLink: '/admin/findDiagramItemLink', // 列表
    insertDiagramManageField: '/admin/insertDiagramManageField', // 机房数据
    updateDiagramManageField: '/admin/updateDiagramManageField', // 机房数据
    findDiagramManageField: '/admin/findDiagramManageField', // 机房数据
    // 机柜分组
    insertDiagramCabinetGroup: '/admin/insertDiagramCabinetGroup', // 新增
    deleteDiagramCabinetGroup: '/admin/deleteDiagramCabinetGroup', // 删除
    updateDiagramCabinetGroupIndex: '/admin/updateDiagramCabinetGroupIndex', // 批量更新下标
    updateDiagramCabinetGroup: '/admin/updateDiagramCabinetGroup', // 编辑
    findDiagramCabinetGroup: '/admin/findDiagramCabinetGroup', // 查询
    getDiagramCabinetGroup: '/admin/getDiagramCabinetGroup', // 查看

    updateDiagramCabinetItemIndex: '/admin/updateDiagramCabinetItemIndex', // 批量修改机柜设备unum
    getDiagramCabinetStatistics: '/admin/getDiagramCabinetStatistics' // 机柜统计
  },
  // activity流程
  activity: {
    findNewOaActivity: '/admin/findNewOaActivity',
    insertNewOaActivity: '/admin/insertNewOaActivity',
    deleteNewOaActivity: '/admin/deleteNewOaActivity',
    updateNewOaActivity: '/admin/updateNewOaActivity',
    startActivity: '/admin/startActivity',
    completeActivity: '/admin/completeActivity',
    deleteInstance: '/admin/deleteInstance',
    getNewOaActivity: '/admin/getNewOaActivity',
    deleteDeployment: '/admin/deleteDeployment', // 删除一个部署的流程
    getOrderProblemKey: '/admin/getOrderProblemKey', // 获取事项表字段
    getOpsOrderWorkTaskKey: '/admin/getOpsOrderWorkTaskKey', // 获取任务表字段
    getHyitDutyLeaveKey: '/admin/getHyitDutyLeaveKey', // 请假表字段
    getHyitDutyOverTimeKey: '/admin/getHyitDutyOverTimeKey' // 加班表字段
  },
  // 申请
  apply: {
    findApply: '/admin/findApply'
  },
  // 审批
  approve: {
    findApprove: '/admin/findApprove'
  },
  // 审核日志
  approveLog: {
    findNewOaApproveLog: '/admin/findNewOaApproveLog',
    insertNewOaApproveLog: '/admin/insertNewOaApproveLog',
    deleteNewOaApproveLog: '/admin/deleteNewOaApproveLog',
    updateNewOaApproveLog: '/admin/updateNewOaApproveLog',
    findNewOaApproveLogEx: '/admin/findNewOaApproveLogEx'
  },
  // 数据汇总表
  Summary: {
    findZbxTrendStatistics: '/admin/findZbxTrendStatistics', // 查询统计记录 数据汇总表
    findZbxTrendHostFlowStatistics: '/admin/findZbxTrendHostFlowStatistics' // 查询主机流量 数据汇总表
  },
  // 下载模板
  download: {
    downloadZabbixHostTamplate: '/export/downloadZabbixHostTamplate' // 导出 it监控主机模板接口
  },
  // 导入
  upload: {
    importHost: '/admin/importHost', // 导入it hosts表
    importDiagramCabinetGroup: '/admin/importDiagramCabinetGroup' // 导入机柜接口
  },
  // it地址管理
  ipAddressManage: {
    // 子网分组
    insertOpsIpGroup: '/admin/insertOpsIpGroup', // 新增
    updateOpsIpGroup: '/admin/updateOpsIpGroup', // 编辑
    findOpsIpGroup: '/admin/findOpsIpGroup', // 查询
    deleteOpsIpGroup: '/admin/deleteOpsIpGroup', // 删除
    getOpsIpGroup: '/admin/getOpsIpGroup', // 查看
    // 子网ip
    insertOpsIpAddress: '/admin/insertOpsIpAddress', // 新增
    findOpsIpAddress: '/admin/findOpsIpAddress', // 查询
    calculationOpsIpAddress: '/admin/calculationOpsIpAddress', // 计算ip
    getOpsIpAddress: '/admin/getOpsIpAddress', // 查看
    updateOpsIpAddress: '/admin/updateOpsIpAddress', // 编辑
    autoBindOpsIpAddress: '/admin/autoBindOpsIpAddress',
    deleteOpsIpAddress: '/admin/deleteOpsIpAddress',
    // ip详情
    updateOpsIpAddressDetail: '/admin/updateOpsIpAddressDetail', // 编辑ip详情
    findOpsIpAddressDetail: '/admin/findOpsIpAddressDetail', // 查询ip详情
    getOpsIpAddressDetail: '/admin/getOpsIpAddressDetail', // 查看ip详情
    getOpsIpAddressDetailUsage: '/admin/getOpsIpAddressDetailUsage',
    // ip日志
    insertOpsIpAddressLog: '/admin/insertOpsIpAddressLog', // 新增日志
    findOpsIpAddressLog: '/admin/findOpsIpAddressLog', // 查询日志
    // 网段
    findOpsIpAddressNetSegment: '/admin/findOpsIpAddressNetSegment',
    getOpsIpAddressNetSegment: '/admin/getOpsIpAddressNetSegment',
    updateOpsIpAddressNetSegment: '/admin/updateOpsIpAddressNetSegment',
    deleteOpsIpAddressNetSegment: '/admin/deleteOpsIpAddressNetSegment',

    updateOpsIpAddressDetailAgent: '/admin/updateOpsIpAddressDetailAgent', // 选中网关更新到ip信息表

    updateOpsIpGroupIndex: '/admin/updateOpsIpGroupIndex', // 批量修改分组下标

    findOpsIpAddressDetailCount: '/admin/findOpsIpAddressDetailCount'
  },
  // 数据库备份
  dbBackup: {
    // 数据库备份
    findDbBackup: '/admin/findDbBackup',
    insertDbBackup: '/admin/insertDbBackup',
    updateDbBackup: '/admin/updateDbBackup',
    deleteDbBackup: '/admin/deleteDbBackup',
    getDbBackup: '/admin/getDbBackup',
    DbTaskChange: '/admin/DbTaskChange', // 增删改数据库备份的时候需要调用
    // 数据库备份日志
    findDbBackupLog: '/admin/findDbBackupLog'
  },
  // 信息模板
  message: {
    findMessageVariable: '/admin/findMessageVariable', // 查询变量
    saveMessageTemplateVariables: '/admin/saveMessageTemplateVariables',
    getMessageTemplate: '/admin/getMessageTemplate',
    findMessageTemplateVariables: '/admin/findMessageTemplateVariables',
    updateMessageTemplate: '/admin/updateMessageTemplate'
  },
  // 模板
  template: {
    findWeiXinTemplate: '/admin/findWeiXinTemplate',
    insertMessageTemplate: '/admin/insertMessageTemplate',
    findMessageTemplate: '/admin/findMessageTemplate',
    deleteMessageTemplate: '/admin/deleteMessageTemplate'
  },
  // 流量监控
  flowMonitor: {
    findHyitHostOrgStatistics: '/admin/findHyitHostOrgStatistics',
    findZbxFlowStatisticsGroupTime: '/admin/findZbxFlowStatisticsGroupTime',
    findZbxFlowStatisticsMaxGroupTime: '/admin/findZbxFlowStatisticsMaxGroupTime'
  },
  // 首页配置
  configuration: {
    findSysDictionaryDetail: '/admin/findSysDictionaryDetail', // 查询
    updateSysDictionaryDetail: '/admin/updateSysDictionaryDetail' // 更新
  },
  // 网关
  itAgentGroup: {
    // 网关分组表接口
    insertHyitAgentGroup: '/admin/insertHyitAgentGroup',
    deleteHyitAgentGroup: '/admin/deleteHyitAgentGroup',
    updateHyitAgentGroup: '/admin/updateHyitAgentGroup',
    findHyitAgentGroup: '/admin/findHyitAgentGroup',
    getHyitAgentGroup: '/admin/getHyitAgentGroup',
    // 分组网关关联表
    insertHyitAgentGroupLink: '/admin/insertHyitAgentGroupLink',
    deleteHyitAgentGroupLink: '/admin/deleteHyitAgentGroupLink',
    updateHyitAgentGroupLink: '/admin/updateHyitAgentGroupLink',
    findHyitAgentGroupLink: '/admin/findHyitAgentGroupLink',
    getHyitAgentGroupLink: '/admin/getHyitAgentGroupLink',
    deleteHyitAgentGroupLinkByGroupId: '/admin/deleteHyitAgentGroupLinkByGroupId', // 根据分组id删除分组网关关联表接口
    // 网关分组授权表接口
    insertHyitAgentGroupAuth: '/admin/insertHyitAgentGroupAuth',
    deleteHyitAgentGroupAuth: '/admin/deleteHyitAgentGroupAuth',
    updateHyitAgentGroupAuth: '/admin/updateHyitAgentGroupAuth',
    findHyitAgentGroupAuth: '/admin/findHyitAgentGroupAuth',
    getHyitAgentGroupAuth: '/admin/getHyitAgentGroupAuth',
    deleteHyitAgentGroupAuthByRoleId: '/admin/deleteHyitAgentGroupAuthByRoleId' // 根据分组id删除网关分组授权表接口
  },
  // 端口设备
  port: {
    // 端口设备分组
    insertPortDeviceGroup: '/admin/insertPortDeviceGroup', // 增
    deletePortDeviceGroup: '/admin/deletePortDeviceGroup', // 删
    updatePortDeviceGroup: '/admin/updatePortDeviceGroup', // 改
    findPortDeviceGroup: '/admin/findPortDeviceGroup', // 查
    getPortDeviceGroup: '/admin/getPortDeviceGroup', // 查
    // 端口设备
    insertPortDevice: '/admin/insertPortDevice', // 增
    deletePortDevice: '/admin/deletePortDevice', // 删
    updatePortDevice: '/admin/updatePortDevice', // 改
    findPortDevice: '/admin/findPortDevice', // 查
    getPortDevice: '/admin/getPortDevice', // 查
    // 端口信息
    insertPortInfo: '/admin/insertPortInfo', // 增
    deletePortInfo: '/admin/deletePortInfo', // 删
    updatePortInfo: '/admin/updatePortInfo', // 改
    findPortInfo: '/admin/findPortInfo', // 查
    getPortInfo: '/admin/getPortInfo', // 查
    // 端口设备板卡
    insertPortDeviceCard: '/admin/insertPortDeviceCard', // 增
    deletePortDeviceCard: '/admin/deletePortDeviceCard',
    updatePortDeviceCard: '/admin/updatePortDeviceCard',
    findPortDeviceCard: '/admin/findPortDeviceCard',
    getPortDeviceCard: '/admin/getPortDeviceCard',
    importPortDeviceCard: '/admin/importPortDeviceCard', // 导入
    exportPortDeviceCard: '/admin/exportPortDeviceCard', // 导出

    updatePortDeviceGroupIndex: '/admin/updatePortDeviceGroupIndex' // 批量更新分组下标
  },
  // esight系统信息
  esight: {
    insertEsightSystemInfo: '/admin/insertEsightSystemInfo', // 增
    deleteEsightSystemInfo: '/admin/deleteEsightSystemInfo', // 删
    updateEsightSystemInfo: '/admin/updateEsightSystemInfo', // 改
    findEsightSystemInfo: '/admin/findEsightSystemInfo', // 查
    getEsightSystemInfo: '/admin/getEsightSystemInfo' // 查
  },
  // 登录首页配置
  hyitIndex: {
    findHyitIndex: '/admin/findHyitIndex',
    insertHyitIndex: '/admin/insertHyitIndex',
    deleteHyitIndex: '/admin/deleteHyitIndex',
    updateHyitIndex: '/admin/updateHyitIndex'
  },
  // 批量修改ip使用状态
  updateOpsIp: {
    updateOpsIpAddressDetailUse: '/admin/updateOpsIpAddressDetailUse'
  },
  // 订阅管理
  subscription: {
    insertHyitSubscribe: '/admin/insertHyitSubscribe',
    deleteHyitSubscribe: '/admin/deleteHyitSubscribe',
    updateHyitSubscribe: '/admin/updateHyitSubscribe',
    findHyitSubscribe: '/admin/findHyitSubscribe',
    getHyitSubscribe: '/admin/getHyitSubscribe',
    findSysDictionaryDetail: '/admin/findSysDictionaryDetail',
    TaskSubscribeChange: '/admin/TaskSubscribeChange'
  },
  // 用户自定义表单
  userDefineForm: {
    insertUserDefineForm: '/admin/insertUserDefineForm', // 新增用户表单
    deleteUserDefineForm: '/admin/deleteUserDefineForm', // 删除用户表单
    updateUserDefineForm: '/admin/updateUserDefineForm', // 编辑用户表单
    findUserDefineForm: '/admin/findUserDefineForm', // 查询用户表单
    getUserDefineForm: '/admin/getUserDefineForm', // 查看用户表单

    findUserDefineFormValue: '/admin/findUserDefineFormValue', // 查询表单值
    insertUserDefineFormValues: '/admin/insertUserDefineFormValues' // 批量插入表单值
  },
  wx: {
    sendWXMsg: '/admin/sendWXMsg'
  }
}
