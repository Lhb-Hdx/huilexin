<template>
  <div class="monitor-header">
    <div class="monitor-header-main">
      <div class="left-action">
        <div class="menu">
          <ul>
            <template v-for="(item, index) in topMenu">
              <li v-if="item.status" :key="index">
                <a href="#" class="pointer" :class="+activeMenuId === +item.menuId ? 'active' : ''" @click="handlerTopMenu(item)">{{ item.menuName }}</a>
              </li>
            </template>
          </ul>
        </div>
        <div class="top-project-bar">
          <div class="switch-btn pointer" @click="scrollBar(1)"><i class="el-icon-arrow-left" /></div>
          <div ref="topProject" class="selmenu">
            <ul :style="{ 'width': allTopProjectItemWidth + 'px', 'margin-left': '-' + topProjectItemLeft + 'px' }">
              <li v-for="(item, index) in topProject" :ref="'topProjectItem' + index" :key="index" class="top-project-item pointer" :class="+activeProjectId === +item[`${topProjectOptions.key}`] ? 'active' : ''" @click="handlerTopProject(item)">
                {{ item[`${topProjectOptions.value}`] }}
              </li>
            </ul>
          </div>
          <div class="switch-btn pointer" @click="scrollBar(2)"><i class="el-icon-arrow-right" /></div>
        </div>
      </div>
      <div class="logo">
        <p>D  A  T  A  V  I  S  U  A  L  I  Z  A  T  I  O  N</p>
        <h1>大 数 据 综 合 管 理 可 视 化</h1>
      </div>
      <div class="right-time">
        <div class="time">
          {{ time }} {{ week }} | [<span class="exit pointer" @click="exit">退出大屏</span>]
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import screenGlobal from '@/views/screen/mixin/screenGlobal'
import {getVuexStorageCurrentRoute} from '@/utils/auth'

export default {
  name: 'ScreenHeader',
  mixins: [screenGlobal],
  props: {
    topProject: {
      type: Array,
      default() {
        return []
      }
    },
    topProjectOptions: {
      type: Object,
      default() {
        return { key: 'id', value: 'name' }
      }
    }
  },
  data() {
    return {
      topMenu: [],
      activeMenuId: '',
      activeProjectId: 1,
      allTopProjectItemWidth: '',
      topProjectItemLeft: 0,
      activeTopProjectItem: {}
    }
  },
  watch: {
    topProject: {
      handler() {
        this.setTopProjectOptions()
      },
      deep: true
    }
  },
  mounted() {
    this.$nextTick(async () => {
      // 初始化菜单
      const findSysMenu = await this.findSysMenu()
      if (findSysMenu.code === 1 && findSysMenu.data && findSysMenu.data.length > 0) {
        this.topMenu = findSysMenu.data
        this.activeMenuId = getVuexStorageCurrentRoute().meta.menuId
      }
    })
  },
  methods: {
    async findSysMenu() {
      return await this.$request({
        url: this.api.sys.findSysMenu,
        data: {
          appId: this.$auth.getUserSession().appId,
          parentId: 9924,
          menuType: 'menu',
          limit: -1,
          version: 1
        }
      })
    },
    handlerTopMenu(val) {
      this.$router.push({
        name: val.coding
      })
    },
    handlerTopProject(item) {
      this.activeTopProjectItem = item
      this.activeProjectId = item[`${this.topProjectOptions.key}`]
      this.$emit('handlerTopProject', this.activeTopProjectItem)
    },
    exit() {
      this.$tool.closeBrowserFullScreen()
      this.$router.push({
        path: '/'
      })
    },
    scrollBar(t) {
      const topProjectWidth = this.$refs.topProject.clientWidth
      if (t === 1) {
        if (this.topProjectItemLeft > topProjectWidth) {
          this.topProjectItemLeft -= topProjectWidth
        } else {
          this.topProjectItemLeft = 0
        }
      } else {
        if (this.allTopProjectItemWidth > topProjectWidth && (this.allTopProjectItemWidth - this.topProjectItemLeft) > topProjectWidth) {
          this.topProjectItemLeft += topProjectWidth
        }
      }
    },
    setTopProjectOptions() {
      setTimeout(() => {
        // 初始化选择项目
        let allTopProjectItemWidth = 0
        if (this.topProject.length > 0) {
          this.activeTopProjectItem = this.topProject[0]
          this.activeProjectId = this.topProject[0][`${this.topProjectOptions.key}`]
          this.$emit('handlerTopProject', this.activeTopProjectItem)
        }
        this.topProject.forEach((item, index) => {
          allTopProjectItemWidth += this.$refs[`topProjectItem${index}`][0].offsetWidth
        })
        this.allTopProjectItemWidth = allTopProjectItemWidth
      }, 1000)
    }
  }
}
</script>

<style lang="scss" scoped>
ul, li {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
.monitor-header {
  width: 100%;
  height: 110px;
  margin-bottom: 20px;
  background: url(/image/screen/head_bg_full.png) repeat-x 0 -14px;
  .monitor-header-main {
    width: 100%;
    height: 110px;
    margin: 0 auto;
    background: url(/image/screen/head_bg.png) no-repeat 50% 100%;
    position: relative;
    .left-action {
      width: 40%;
      position: absolute;
      left: 0;
      top: 0;
      .menu {
        width: 100%;
        height: 60px;
        ul {
          li {
            width: 115px;
            height: 58px;
            float: left;
            text-align: center;
            a {
              display: block;
              height: 59px;
              line-height: 50px;
              transition: all .5s;
              text-decoration: none;
              color: #99CCFF;
              &:hover {
                color: #ffffff;
              }
            }
            .active {
              color: #ffffff;
              font-weight: bold;
              background: url(/image/screen/ico_menu_on.png) no-repeat 50% 100%;
            }
          }
        }
      }
      .top-project-bar {
        display: flex;
        align-items: center;
        margin: 20px;
        max-width: 30vw;
        .switch-btn {
          font-weight: bold;
          font-size: 16px;
          padding: 0 10px;
          background: #0C1A52;
          border: 1px solid #2D72B3;
          opacity: .5;
          text-align: center;
          text-decoration: none;
          transition: all .5s;
          height: 30px;
          line-height: 30px;
          display: inline-block;
          &:hover {
            opacity: 1;
            color: #99CCFF;
          }
        }
        .selmenu {
          //width: 100%;
          overflow: hidden;
          height: 30px;
          ul {
            li {
              margin-left: -1px;
              display: inline-block;
              padding: 0 15px;
              height: 30px;
              line-height: 30px;
              background: #0C1A52;
              border: 1px solid #2D72B3;
              opacity: .5;
              text-align: center;
              text-decoration: none;
              transition: all .5s;
              &:first-of-type {
                margin-left: 0;
              }
              &:hover {
                opacity: 1;
                color: #99CCFF;
              }
            }
            .active {
              opacity: 1;
              color: #99CCFF;
            }
          }
        }
      }
    }
    .logo {
      height: 94px;
      float: left;
      padding-top: 15px;
      text-align: center;
      background-image: -webkit-linear-gradient(bottom,#cccccc,#ffffff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -70%);
    }
    .right-time {
      width: 30%;
      position: absolute;
      right: 2%;
      top: 20%;
      .time {
        width: 100%;
        height: 110px;
        text-align: right;
        .exit {
          color: #99CCFF;
          text-decoration: none;
          transition: all .5s;
          &:hover {
            color: #ffffff;
          }
        }
      }
    }
  }
}
</style>
