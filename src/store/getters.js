const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  userInfo: state => state.user.userInfo,
  introduction: state => state.user.introduction,
  // 角色
  roles: state => state.user.roles,
  // 权限路由
  permission_routes: state => state.permission.routes,
  // 动态路由
  addRouters: state => state.permission.addRoutes,
  // 所有路由
  vueFileRoutes: state => state.permission.vueFileRoutes,
  // 缓存列表查询参数
  pageTableQuery: state => state.app.pageTableQuery,
  systemInfo: state => state.app.systemInfo,
  // activity信息
  bpmnModelInfo: state => state.bpmn.bpmnModelInfo,
  // websocket端口
  wsPort: state => state.app.systemWs,
  // 登录首页
  loginIndex: state => state.permission.loginIndex,
  // websocket链接状态
  wsStatus: state => state.app.wsStatus,
  // 当前路由
  currentRoute: state => state.permission.currentRoute,
  // 拓扑信息
  currentTopoInfo: state => state.screen.currentTopoInfo,
  // 拓扑链路
  currentTopoMapEdges: state => state.screen.currentTopoMapEdges,
  // 拓扑节点
  currentTopoMapNodes: state => state.screen.currentTopoMapNodes,
  topoRightPaneHeight: state => state.screen.topoRightPaneHeight,
  alarmPaneHeight: state => state.screen.alarmPaneHeight,
  alarmCountHeight: state => state.screen.alarmCountHeight,
  alarmEchartHeight: state => state.screen.alarmEchartHeight
}
export default getters
