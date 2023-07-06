<template>
  <div class="area-tree-box">
    <!-- <div v-for="(item,index) in orgTreeList" :key="index" class="area-tree-box-chil">
      <div class="org-title">
        <div>
          <div :style="{'text-indent':item.level * 20 +'px'}" class="ontitleclass" @click="chnClick(item)">
            <img v-if="item.imageUrl" class="tree-item-icon" :src="setIcon(item.imageUrl)" alt="">
            {{ item.name }}
          </div>
        </div>
        <div @click="orgNameClick(item)">
          <div v-if="(item.children.length > 0) && item.expand === false"><i class="el-icon-caret-bottom" /></div>
          <div v-if="(item.children.length > 0) && item.expand === true"><i class="el-icon-caret-top" /></div>
        </div>
      </div>
      <div class="org-children" :class="item.expand === true ? 'active' : ''">
        <CmdbItemTreeList :org-tree-list="item.children" @chnClick="chnClick" />
      </div>
    </div> -->

    <!-- new -->
    <!-- <el-container style=" border: 1px solid #eee"> -->
    <el-aside width="100%" style="background-color: rgb(238, 241, 246)">
      <el-menu
        v-for="(item,index) in orgTreeList"
        :key="index"
        class="el-menu-vertical-demo"
        active-text-color="#409EFF"
        @open="handleOpen(item)"
        @close="handleClose(item)"
      >
        <el-submenu :index="(item.id).toString()">
          <template slot="title">
            <!-- item.imageUrl ||  -->
            <el-image style="width: 14px; height: 14px" class="mr-10" :src="item.imageUrl || 'image/cmdb/cmdb_default.png'" />
            <span>{{ item.name }}</span>
            <i :class="[item.children.length > '0' ? 'el-icon-arrow-down' : '']" />
          </template>
          <el-menu-item v-for="(item2,indexchil) in item.children" :key="indexchil" @click="handleOpenChild(item2)">
            <el-image v-if="item2.imageUrl" style="width: 14px; height: 14px" :src="item2.imageUrl" class="mr-10" />
            <span slot="title">{{ item2.name }}</span>
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>
    <!-- </el-container> -->
  </div>
</template>

<script>
export default {
  name: 'CmdbItemTreeList',
  props: {
    orgTreeList: {
      type: Array,
      default() {
        return []
      }
    },
    showCalendar: Boolean,
    isDragging: { // 是否可拖拽
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      treeData: [],
      dvrData: [],
      chnData: [],
      calendarTop: 0,
      currentCalendarItem: null,
      resetDay: false,
      dragging: null
    }
  },
  computed: {
    setIcon() {
      return function(imgUrl) {
        return imgUrl || ''
      }
    }
  },
  watch: {
    orgTreeList() {
      return this.orgTreeList
    }
  },
  methods: {
    orgNameClick(item) { // 点击标题名称
      item.expand = !item.expand
    },
    chnClick(item) {
      this.$emit('chnClick', item)
      this.resetDay = true
    },
    // 展开
    handleOpen(item, key) {
      this.chnClick(item)
    },
    // 收缩
    handleClose(item, key) {
      this.chnClick(item)
    },
    // 子类型
    handleOpenChild(item2) {
      this.chnClick(item2)
    }
  }
}
</script>
<style>
/* .area-tree-box .sideMenu{
  background-color: red;
  margin-left: 10px;
}
.area-tree-box .menu-container{
  padding-left: 0 !important;
  padding-right: 0 !important;
} */
</style>
<style lang="scss" scoped>

.area-tree-box{
  width: 100%;
}
.org-title,.dvr-title,.chn-title{
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  align-items: center;
  >div{display: flex;justify-content: flex-start;
    //>div{padding-left: 5px;}
  }
}
// .chn-title{position: relative;}
.chn-title >.chn-calendar{position: fixed;display: none;z-index: 2000;
  left: 240px;top:50%;width: 250px;height: 280px;background: #fff;
}
.chn-title >.chn-calendar.active{
  display: block;
}
.org-children,.dvr-list,.dvr-children{display: none;}
.org-children.active,.dvr-list.active,.dvr-children.active{display: block;}
.el-icon-date{line-height: 34px;color: #a2a2a3;}
.el-icon-date.online{color:rgb(1, 55, 137);}
.tree-item-icon {margin: 11px 5px 0 0; width: 14px; height: 14px}

// 点击标题显示颜色
.el-aside{
  padding: 0;
  overflow: hidden;
   .el-menu{

    .el-submenu{
      &::v-deep .el-submenu__icon-arrow{
        display: none;
      }
      .el-icon-arrow-down{
        position: absolute;
        top: 50%;
        right: 10px;
        z-index: 999;
        color: rebeccapurple;
        margin-top: -7px;
        -webkit-transition: -webkit-transform .3s;
        transition: -webkit-transform .3s;
        transition: transform .3s;
        transition: transform .3s, -webkit-transform .3s;
        font-size: 12px;
      }
    }

  }
}

</style>
