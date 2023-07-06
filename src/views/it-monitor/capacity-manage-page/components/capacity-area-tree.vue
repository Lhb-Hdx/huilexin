<template>
  <div class="area-tree-box">
    <div v-for="(item,index) in getOrgTreeList" :key="index" class="area-tree-box">
      <div class="org-title" @click="orgNameClick(item,index)">
        <el-tooltip class="item overflow-text-a" effect="dark" :content="item.hyAreaName" placement="right">
          <div :style="{'margin-left':item.level * 10 +'px'}" :class="item.level !== 0 ? 'org-title-content' : ''" class="box">
            <span class="dvr-icon">
              <img v-if="item.imgUrl" :src="item.imgUrl" alt="">
              <img v-else src="image/ip-manage/group-default-icon.png" alt="">
            </span>
            <span class="overflow-text-a">{{ item.hyAreaName }}</span>
          </div>
        </el-tooltip>
        <div v-if="((item.children.length > 0 || item.dvr.length > 0) && item.active === true)"><i class="el-icon-caret-bottom" /></div>
        <div v-if="((item.children.length > 0 || item.dvr.length > 0) && item.active === false)"><i class="el-icon-caret-top" /></div>
      </div>
      <div class="dvr-list" :class="item.active === true ? 'active' : ''">
        <div v-for="(dvrItem , dvrIndex) in item.dvr" :key="dvrIndex+'dvr'">
          <div class="dvr-title" @click="clickDetail(dvrItem)">
            <div class="dvr-title-container" :style="{'margin-left':(item.level + 1) * 10 +'px'}">
              <div class="dvr-icon">
                <img class="tree-item-icon" :src="dvrItem.icon">
              </div>
              <el-tooltip class="item normal font-14 overflow-text-a" effect="dark" :content="dvrItem.name" placement="right">
                <div>{{ dvrItem.name }}</div>
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>
      <div class="org-children" :class="item.active === true ? 'active' : ''">
        <CapacityAreaTree
          :org-tree-list="$tool.deepCopy(item.children)"
          @click-directory="clickdirectory"
          @click-detail="onDetail"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CapacityAreaTree',
  props: {
    orgTreeList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      active: false,
      getOrgTreeList: []
    }
  },
  computed: {

  },
  watch: {
    orgTreeList() {
      this.getOrgTreeList = this.$tool.deepCopy(this.orgTreeList)
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.getOrgTreeList = this.$tool.deepCopy(this.orgTreeList)
    })
  },
  methods: {
    // 点击区域的树形结构
    orgNameClick(item, idx) {
      this.$set(this.getOrgTreeList[idx], 'active', !this.getOrgTreeList[idx].active)
      this.$emit('click-directory', item.hyAreaId)
      // this.orgTreeList = Object.assign([], this.getOrgTreeList)
    },
    // 点击机柜的树形结构
    clickDetail(item) {
      this.$emit('click-detail', item)
    },
    // 点击子级树状结构
    clickdirectory(item) {
      this.$emit('click-directory', item)
    },
    // 进入机柜详情
    onDetail(item) {
      this.$emit('click-detail', item)
    }
  }
}
</script>

<style lang="scss" scoped>
.area-tree-box{
    width: 100%;
}
.box {
    display: flex;
    align-content: center;
    justify-content: center;
}
.org-title, .dvr-title, .chn-title{
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  align-items: center;
  .org-title-content, .chn-title-container, .dvr-title-container {
    display: flex;
    justify-content: flex-start;
    .org-dvr-count, .chn-icon, .dvr-icon {
      padding-left: 5px;
    }
  }
}
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
.tree-item-icon {margin: 9px 5px 0 0;}
</style>
