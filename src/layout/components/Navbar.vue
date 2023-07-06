<template>
  <div class="navbar">

    <div class="bar-menu-box">
      <div class="hamburger-container" @click="navigation()">
        <img v-if="logoUrl" :src="logoUrl" alt="" width="">
        <img v-else-if="systemInfo && systemInfo.remark" :src="systemInfo.remark" alt="" width="">
        <!-- <img v-if="systemInfo && systemInfo.remark" :src="systemInfo.remark" alt="" width=""> -->
        <span v-else>
          LOGO
        </span>
      </div>
      <el-menu
        :active-text-color="variables.menuActiveText"
        :background-color="variables.menuBg"
        :collapse-transition="false"
        :default-active="activeMenu"
        :text-color="variables.menuText"
        :unique-opened="false"
        mode="horizontal"
      >
        <sidebar-item
          v-for="route in permission_routes"
          :key="route.path"
          :base-path="route.path"
          :item="route"
        />
      </el-menu>
    </div>
    <div class="right-menu">
      <div class="ws-status" :class="wsStatus === 0 ? 'ws-status-danger' : 'ws-status-success'" />
      <template v-if="device!=='mobile'">
        <!-- 暂时没有做搜索，去掉了  <search id="header-search" class="right-menu-item" />-->
        <!-- <error-log class="errLog-container right-menu-item hover-effect" /> -->
        <!-- <screenfull id="screenfull" class="right-menu-item hover-effect" /> -->
        <!-- <el-tooltip content="全局尺寸" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip> -->
      </template>

      <el-dropdown
        class="avatar-container right-menu-item hover-effect"
        trigger="click"
      >
        <div class="avatar-wrapper">
          <!-- <img :src="avatar" class="user-avatar"> -->
          <span class="name">{{ userName }}</span>
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/">
            <el-dropdown-item>回到首页</el-dropdown-item>
          </router-link>
          <el-dropdown-item
            divided
            @click.native="onChangePassword"
          >
            <span style="display:block;">修改密码</span>
          </el-dropdown-item>
          <el-dropdown-item @click.native="logout">
            <span style="display:block;">注销登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import ErrorLog from '@/components/ErrorLog'
// import Screenfull from '@/components/Screenfull'
// import SizeSelect from '@/components/SizeSelect'
// import Search from '@/components/HeaderSearch'
import SidebarItem from './HeaderMenu/SidebarItem'
import variables from '@/styles/variables.scss'
import { cleanLoginLocalStorage } from '@/utils/auth'
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'Navbar',
  components: {
    // ErrorLog,
    SidebarItem
    // Screenfull,
    // SizeSelect,
    // Search
  },
  data() {
    return {
      userName: '',
      logoUrl: ''
    }
  },
  mounted() {
    const userInfo = this.localStorageOperation('get', 'userInfo')
    const logoUrl = this.localStorageOperation('get', 'logoUrl')
    this.logoUrl = logoUrl
    if (userInfo) this.userName = userInfo.userName
  },
  // eslint-disable-next-line vue/order-in-components
  computed: {
    ...mapGetters([
      'permission_routes',
      'sidebar',
      'avatar',
      'device',
      'name',
      'systemInfo',
      'wsStatus'
      // 'logoUrl'
    ]),
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    variables() {
      return variables
    }
  },
  methods: {
    navigation() {
      // if (process.env.VUE_APP_SAAS === 'true') {
      //   this.$router.push({ path: '/navigat' })
      // } else {
      this.$router.push({ path: '/' })
      // }
    },
    logout() {
      this.$confirm('确认要退出登录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const loginToken = this.localStorageOperation('get', 'loginToken')
        this.sessionStorageOperation('cleanAll')
        cleanLoginLocalStorage()
        request({
          url: api.sys.logOut, data: { token: loginToken }
        }).then(res => {
          if (res.code === 1) {
            this.$store.dispatch('permission/clearRoutes').then(() => {
              window.location.reload()
            })
          }
        })
      }).catch(() => { })
    },
    onChangePassword() {
      this.$router.push({
        name: 'ChangePassword'
      })
    }
  }
}
</script>
<style lang="scss">
.el-menu.el-menu--horizontal {
  display: flex;
}
.el-submenu__title,
.el-menu-item {
  height: 50px;
  line-height: 50px;
}
</style>
<style lang="scss">
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background-color: rgb(1, 69, 171);
  // box-shadow: 0 1px 4px rgba(0,21,41,.08);
  display: flex;
  justify-content: space-between;
  .hamburger-container {
     //width: 200px;
     //@debugmax-width: 300px;
    //padding-left: 20px;
    //padding-top: 10px;
    //padding-bottom: 10px;
   // font-weight: bold;
    //font-size: 24px;
    //color: #fff;
    // line-height: 50px;
    // margin-right: 50px;
    //height: 100%;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
    img{
      //width: 200px;
      //max-width: 300px;
      //height: 70%;
      //width: 220px;
      height: 30px;
      margin: 10px 50px 10px 20px;
    }
  }
  .bar-menu-box {
    display: flex;
    justify-content: flex-start;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    display: flex;
    align-items: center;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #fff;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 10px;

      .avatar-wrapper {
        display: flex;
        align-items: center;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }
        .name {
          padding: 0 5px;
          font-size: 14px;
        }
      }
    }
  }
}
.ws-status {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #e6a23c;
}
.ws-status-success {
  background: #00b285;
}
.ws-status-danger {
  background: red;
}
</style>
