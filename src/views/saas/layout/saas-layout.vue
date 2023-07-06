<template>
  <div class="saas-layout">
    <div class="header">header</div>
    <div class="middle">
      <div class="menu">
        <router-link replace to="index">控制面版</router-link>
        <router-link replace to="app">应用</router-link>
        <router-link replace to="company">企业租户</router-link>
        <router-link replace to="hysaas">开放应用</router-link>
        <router-link replace to="weixin">微信公众号</router-link>
        <router-link replace to="wxapp">微信小程序</router-link>
        <router-link replace to="qywx.self">企业微信(自建)</router-link>
        <router-link replace to="qywx.parent">企业微信(代开发)</router-link>
        <router-link replace to="qywx.3rd">企业微信(第三方)</router-link>
        <router-link replace to="email">邮箱</router-link>
        <router-link replace to="alisms">短信</router-link>
        <router-link replace to="template-weixin">微信公众号消息模板</router-link>
        <!-- <router-link replace to="template-wxapp">微信小程序消息模板</router-link> -->
        <router-link replace to="template-email">邮件消息模板</router-link>
        <router-link replace to="template-alisms">阿里短信消息模板</router-link>
        <router-link replace to="template-qywx.self">企微(自建)模板</router-link>
        <router-link replace to="template-qywx.parent">企微(代建)模板</router-link>
        <router-link replace to="template-qywx.3rd">企微(三方)模板</router-link>
        <router-link replace to="weixin-user">微信公众号用户</router-link>
        <router-link replace to="qywx.self-user">企微(自建)用户</router-link>
        <router-link replace to="qywx.parent-user">企微(代建)用户</router-link>
        <router-link replace to="qywx.3rd-user">企微(三方)用户</router-link>
        <router-link replace to="message-logs">日志审计</router-link>
        <router-link replace to="topo">统计拓扑</router-link>
      </div>
      <div class="main">
        <router-view />
      </div>
    </div>
    <div class="footer" />
  </div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
.saas-layout {
  width: 100%;
  height: 100%;
}
$h: 60px;
.header {
  width: 100%;
  height: $h;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-bottom: 1px solid #ddd;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.05);
  z-index: 1000;
}
.middle {
  position: relative;
  background: #ffffff;
  padding-top: $h;
  width: 100%;
  height: 100%;
  $mwidth: 150px;
  .menu {
    position: fixed;
    top: $h;
    left: 0;
    bottom: 0;
    width: $mwidth;
    overflow-y: scroll;
    background: #ffffff;
    padding-top: 10px;
    a {
      display: block;
      width: 100%;
      height: 38px;
      line-height: 38px;
      text-align: left;
      padding-left: 20px;
    }
  }
  .main {
    padding-left: calc(#{$mwidth} + 4px);
    width: 100%;
    height: 100%;
    background: #ffffff;
  }
}
</style>
