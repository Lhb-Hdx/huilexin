import { getBrowserHost } from '@/utils/utils'

/**
 * @description websocket调用命令
 */

export default {
  // 请求地址
  host: {
    default: `/${process.env.NODE_ENV === 'production' ? getBrowserHost() : process.env.VUE_APP_HOST_NAME}/ws` // 默认地址 有新增地址可以继续加入
  },
  // 公共
  common: {
    login: 'login', // 登录websocket
    heat: 'heat' // 心跳
  },
  // 自动化运维
  automationOperations: {
    execScript: 'execScript-websocket', // 执行脚本
    execTask: 'execTask-websocket', // 执行作业
    sshLogin: 'ssh-login-websocket', // ssh登录
    sshCommand: 'ssh-command-websocket', // 执行ssh命令
    sshLogOut: 'ssh-logout-websocket', // ssh退出登录
    sshPing: 'ssh-ping-websocket', // ssh ping命令
    telnetLogin: 'telnet-login-websocket', // telnet登录
    telnetCommand: 'telnet-command-websocket', // 执行telnet命令
    telnetLogOut: 'telnet-logout-websocket', // telnet退出登录
    // 诊断工具
    toolPing: 'tool-ping-websocket', // ping
    toolPort: 'tool-port-websocket', // 端口监测
    stopExecScript: 'stopExecScript-websocket', // 停止执行脚本
    debugScript: 'debugScript-websocket'
  },
  // IT监控
  itMonitor: {
    itAgentGetHostPort: 'it-agentGetHostPort-websocket', // 获取流量
    itAgentGetHostShow: 'it-agentGetHostShow-websocket', // 获取主机数据1
    itAgentGetHostData: 'it-agentGetHostData-websocket', // 获取主机数据2
    itAgentGetValueMap: 'it-agentGetValueMap-websocket', // 获取值映射
    itAgentGetRealTimeData: 'it-agentGetRealTimeData-websocket', // 获取主机数据3
    itAgentGetHostPortTotal: 'it-agentGetHostPortTotal-websocket',
    itAgentGetStorageData: 'it-agentGetStorageData-websocket', // 获取存储设备数据
    itAgentGetMiddlewareData: 'it-agentGetMiddlewareData-websocket', // 获取中间件数据
    itAgentGetDBData: 'it-agentGetDBData-websocket', // 获取数据库数据
    ansiblePingIp: 'ansible-ping-ip-websocket',
    agentUpdateHostPort: 'it-agentUpdateHostPort-websocket', // 更新端口数据
    itAgentGetCenterHost: 'it-agentGetCenterHost-websocket', // 级联同步数据
    itAgentGetHost: 'it-agentGetHost-websocket' // 同步网关数据
  },
  // 系统维护
  sysMaintain: {
    restartServer: 'common-restartServer-websocket', // 重启服务
    restartSystem: 'common-restartSystem-websocket', // 重启系统
    downloadLog: 'common-downloadLog-websocket', // 下载日志
    rollback: 'common-rollback-websocket'
  }
}
