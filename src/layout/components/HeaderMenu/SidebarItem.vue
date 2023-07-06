<template>
  <div v-if="!item.hidden">
    <template v-if="hasOneShowingChild(item.children,item) && (!onlyOneChild.children||onlyOneChild.noShowingChildren)&&!item.alwaysShow">
      <!--临时设置了unify不在这里应用跳转-->
      <app-link v-if="onlyOneChild.meta && item.menuType != 'unify'" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{'submenu-title-noDropdown':!isNest}">
          <item :icon="onlyOneChild.meta.icon||(item.meta&&item.meta.icon)" :title="onlyOneChild.meta.title" :menu-type="item.menuType" />
        </el-menu-item>
      </app-link>
      <!--临时联合应用的情况进行另一个跳转-->
      <a v-if="onlyOneChild.meta && item.menuType === 'unify'" href="javascript:;" @click="onUnifyEvent(item)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{'submenu-title-noDropdown':!isNest}">
          <item :icon="onlyOneChild.meta.icon||(item.meta&&item.meta.icon)" :title="onlyOneChild.meta.title" :menu-type="item.menuType" />
        </el-menu-item>
      </a>

    </template>

    <el-submenu v-else ref="subMenu" :index="resolvePath(item.path)" popper-append-to-body>
      <template slot="title">
        <item v-if="item.meta" :icon="item.meta && item.meta.icon" :title="item.meta.title" :menu-type="item.menuType" />
      </template>
      <sidebar-item v-for="child in item.children" :key="child.path" :is-nest="true" :item="child" :base-path="resolvePath(child.path)" class="nest-menu" />
    </el-submenu>

    <form v-if="isActionForm === true" ref="unifyForm" style="display:none;" :action="URL" method="post" target="_blank">
      <input type="hidden" name="APPKEY" :value="APPKEY">
      <input type="hidden" name="USERNAME" :value="USERNAME">
      <input type="hidden" name="TIMESTAMP" :value="TIMESTAMP">
      <input type="hidden" name="SIGN" :value="SIGN">
    </form>
  </div>
</template>

<script>
import path from 'path'
import { isExternal } from '@/utils/validate'
import api from '@/api/api'
import Item from './Item'
import AppLink from './Link'
import FixiOSBug from './FixiOSBug'
import request from '@/utils/request'
export default {
  name: 'SidebarItem',
  components: { Item, AppLink },
  mixins: [FixiOSBug],
  props: {
    // route object
    item: {
      type: Object,
      required: true
    },
    isNest: {
      type: Boolean,
      default: false
    },
    basePath: {
      type: String,
      default: ''
    }
  },
  data() {
    // To fix https://github.com/PanJiaChen/vue-admin-template/issues/237
    // TODO: refactor with render function
    this.onlyOneChild = null
    return {
      APPKEY: null, USERNAME: null, TIMESTAMP: null, SIGN: null, URL: null, isActionForm: false
    }
  },
  methods: {
    hasOneShowingChild(children = [], parent) {
      const showingChildren = children.filter(item => {
        if (item.hidden) {
          return false
        } else {
          // Temp set(will be used if only has one showing child)
          this.onlyOneChild = item
          return true
        }
      })

      // When there is only one child router, the child router is displayed by default
      if (showingChildren.length === 1) {
        return true
      }

      // Show parent if there are no child router to display
      if (showingChildren.length === 0) {
        this.onlyOneChild = { ...parent, path: '', noShowingChildren: true }
        return true
      }

      return false
    },
    resolvePath(routePath) {
      if (isExternal(routePath)) {
        return routePath
      }
      if (isExternal(this.basePath)) {
        return this.basePath
      }
      return path.resolve(this.basePath, routePath)
    },
    onUnifyEvent(item) {
      console.log('onUnifyEvent=============', JSON.stringify(item))
      this.isActionForm = true
      var that = this
      if (item.path) {
        request({
          url: api.common.indentificationLoginAuthentication, data: { menuId: item.menuId }
        }).then(res => {
          if (res.model) {
            this.APPKEY = res.model.appkey
            this.USERNAME = res.model.username
            this.TIMESTAMP = res.model.timestamp
            this.SIGN = res.model.sign
            this.URL = res.model.url

            setTimeout(function() {
              that.$refs.unifyForm.submit()
            }, 1000)

            setTimeout(function() {
              that.isActionForm = true
            }, 2000)
          }
        })
      }
    }
  }
}
</script>
