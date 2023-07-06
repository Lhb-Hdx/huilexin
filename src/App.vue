<template>
  <div id="app">
    <router-view v-if="isScreen" :key="fullpath" />
    <router-view v-else />
  </div>
</template>

<script>
// import { asyncRoutes } from '@/router/index'
// import router from '@/router/index'
import {localStorageOperation} from '@/utils/browser-storage'

export default {
  name: 'App',
  computed: {
    // 加key解决大屏加载时白屏问题
    fullpath: function() {
      return this.$route.path
    },
    isScreen: function() {
      return this.$route.path.split('/')[1] === 'screen'
    }
  },
  created() {
    /* 如果项目不使用从后端获取菜单权限就把下面取消注释 */
    // this.$store.dispatch('permission/initRoutes')
    // router.addRoutes(asyncRoutes)
    /**/
    localStorageOperation('clean', 'pageQuery')
  }
}
</script>
