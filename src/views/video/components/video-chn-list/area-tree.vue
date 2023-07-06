<template>
  <div class="area-tree-box">
    <div v-for="(item,index) in orgTreeList" :key="index" class="area-tree-box">
      <div class="org-title" @click="orgNameClick(item)">
        <el-tooltip class="item overflow-text-a" effect="dark" :content="item.hyAreaName" placement="right">
          <div :style="{'margin-left':item.level * 10 +'px'}" :class="item.level !== 0 ? 'org-title-content' : ''">
            <span class="overflow-text-a">{{ item.hyAreaName }}</span>
            <template v-if="item.level !== 0">
              <div class="org-dvr-count">
                <span>(</span>
                <span>{{ setOrgDvrCount(item.level, item.dvr) }}</span>
                <span>/</span>
                <span style="color: #00B285">{{ setOnlineDvrCount(item.level, item.dvr) }}</span>
                <span>)</span>
              </div>
            </template>
          </div>
        </el-tooltip>

        <div v-if="(item.children.length > 0 || item.dvr.length > 0) && item.active == false"><i class="el-icon-caret-bottom" /></div>
        <div v-if="(item.children.length > 0 || item.dvr.length > 0) && item.active == true"><i class="el-icon-caret-top" /></div>
      </div>
      <div class="dvr-list" :class="item.active == true ? 'active' : ''">
        <div v-for="(dvrItem , dvrIndex) in item.dvr" :key="dvrIndex+'dvr'">
          <div v-if="!dvrItem.isIPC" class="dvr-title" @click="orgNameClick(dvrItem)">
            <div class="dvr-title-container" :style="{ 'width': treeItemWidth + 'px' }">
              <div :style="{'margin-left':(item.level + 1) * 10 +'px'}" class="dvr-icon">
                <img v-if="dvrItem.status == 1" class="tree-item-icon" src="image/video/tree_nvr_online_icon.png">
                <img v-if="dvrItem.status == 0 || dvrItem.status == -1" class="tree-item-icon" src="image/video/ico_downline.png">
              </div>
              <el-tooltip class="item normal font-12 overflow-text-a" effect="dark" :content="dvrItem.title + ' ' + dvrItem.ip" placement="right">
                <div>{{ dvrItem.title }}</div>
              </el-tooltip>
            </div>
            <div v-if="dvrItem.active == false"><i class="el-icon-caret-bottom" /></div>
            <div v-if="dvrItem.active == true"><i class="el-icon-caret-top" /></div>
          </div>
          <div class="dvr-children" :class="(dvrItem.isIPC || dvrItem.active) == true ? 'active' : ''">
            <div v-for="(chnItem , chnIndex) in dvrItem.chn" :key="chnIndex+'chn'" class="chn-title">
              <div class="chn-title-container" :style="{ width: treeItemWidth + 'px' }">
                <div :style="{'margin-left':dvrItem.isIPC === true ? '20px' :(item.level + 2) * 10 +'px'}" class="chn-icon">
                  <img v-if="chnItem.status == 1" class="tree-item-icon" src="image/video/tree_ipc_online_icon.png">
                  <img v-if="chnItem.status == 0 || chnItem.status == -1" class="tree-item-icon" src="image/video/tree_ipc_downline_icon.png">
                </div>
                <el-tooltip class="item" effect="dark" :content="setChnTitle(chnItem, dvrItem)" placement="right">
                  <div
                    class="normal font-12 overflow-text-a"
                    :draggable="isDragging"
                    @click="chnClick({ ...chnItem, beDvr: dvrItem, cname: chnItem.cname })"
                    @contextmenu.prevent="selectCid({ ...chnItem, beDvr: dvrItem, cname: chnItem.cname })"
                    @contextmenu="showMenu(index)"
                    @dragstart="dragChnItem($event, { ...chnItem, beDvr: dvrItem, cname: chnItem.cname })"
                  >
                    {{ dvrItem.isIPC === true ? dvrItem.title : '' }} {{ chnItem.cname }}
                  </div>
                </el-tooltip>
              </div>
              <div v-if="showCalendar" :id="'calendar-'+chnItem.cid" @click="calendarIconClick(chnItem)" @mouseup="calendarIconMouseUp">
                <i class="el-icon-date" :class="chnItem.active == true ? 'online' : 'downline'" />
              </div>
              <div class="chn-calendar" :class="chnItem.active == true ? 'active' : ''" :style="{top:calendarTop+'px'}">
                <hyVideoCalendar :date="chnItem.activeDate" :video-by-day="chnItem.videoByDay" :reset-day="resetDay" @currentYearMonth="currentYearMonth" @currentYearMonthDay="currentYearMonthDay" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="org-children" :class="item.active == true ? 'active' : ''">
        <vue-context-menu :context-menu-data="contextMenuData" @selectFlow="selectFlow" />
        <hyAreaTree
          :org-tree-list="item.children"
          :show-calendar="showCalendar"
          :is-dragging="isDragging"
          :tree-item-width="treeItemWidth"
          @chnClick="chnClick"
          @calendarIconClick="calendarIconClick"
          @currentYearMonth="currentYearMonth"
          @currentYearMonthDay="currentYearMonthDay"
          @selectFlow="getSelectFlow"
          @selectCid="selectCid"
        />
      </div>
    </div>
  </div>
</template>

<script>
import hyVideoCalendar from './player-calendar'
export default {
  name: 'HyAreaTree',
  components: { hyVideoCalendar },
  props: {
    orgTreeList: {
      type: Array,
      default() {
        return []
      }
    },
    showCalendar: {
      type: Boolean,
      default: true
    },
    isDragging: { // 是否可拖拽
      type: Boolean,
      default: false
    },
    treeItemWidth: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      treeData: [],
      dvrData: [],
      chnData: [],
      calendarTop: 0,
      currentCalendarItem: null,
      contextMenuData: {
        menuName: 'flow',
        axis: {
          x: null,
          y: null
        },
        menulists: [
          {
            btnName: '主码流',
            value: 1,
            fnHandler: 'selectFlow'
          },
          {
            btnName: '子码流',
            value: 2,
            fnHandler: 'selectFlow'
          },
          {
            btnName: '第三流',
            value: 3,
            fnHandler: 'selectFlow'
          }
        ]
      },
      resetDay: false,
      dragging: null
    }
  },
  computed: {
    setChnTitle() { // 设置通道提示名称 名称+ip
      return function(chn, dvr) {
        return `${dvr.title}${chn.cname} ${dvr.ip}`
      }
    },
    setOrgDvrCount() { // 所有摄像头个数
      return function(level, dvr) {
        return `${dvr.length}`
      }
    },
    setOnlineDvrCount() { // 在线的摄像头个数
      return function(level, dvr) {
        let count = 0
        for (let i = 0; i < dvr.length; i++) {
          if (dvr[i].status === 1) {
            count++
          }
        }
        return `${count}`
      }
    }
  },
  watch: {
    orgTreeList() {
      return this.orgTreeList
    },
    treeItemWidth(newVal) {
      console.log('treeItemWidthWatch', newVal)
    }
  },
  methods: {
    orgNameClick(item) { // 点击标题名称
      item.active = !item.active
    },
    chnClick(item) {
      this.$emit('chnClick', item)
      this.resetDay = true
    },
    calendarIconClick(item) { // console.log("calendarIconClick....",JSON.stringify(item))
      // 当前的坐标
      this.$emit('calendarIconClick', item)
      this.currentCalendarItem = item
      // document.addEventListener("mouseup",this.handleCloseCalendar);
    },
    handleCloseCalendar() {
      this.currentCalendarItem.active = false
      // document.removeEventListener("mouseup",this.handleCloseCalendar);
    },
    currentYearMonth(item) {
      this.$emit('currentYearMonth', item)
    },
    currentYearMonthDay(item) { // console.log("中间currentYearMonthDay",item.year,item.month,item.date)
      this.$emit('currentYearMonthDay', item)
      this.currentCalendarItem.active = false
    },
    calendarIconMouseUp(event) {
      const x = event.pageX
      let y = event.pageY
      const clientHeight = document.documentElement.clientHeight
      if (y > (clientHeight - 280)) y = clientHeight - 280
      this.calendarTop = y
      console.log('calendarIconMouseUp', x, y)
    },
    showMenu() {
      if (this.showCalendar === false) {
        event.preventDefault()
        const x = event.clientX
        const y = event.clientY
        this.contextMenuData.axis = { x, y }
      }
    },
    selectFlow(val) {
      this.$emit('selectFlow', val.value)
    },
    getSelectFlow(val) {
      this.$emit('selectFlow', val.value)
    },
    selectCid(cid) {
      this.$emit('selectCid', cid)
    },
    dragChnItem(e, item) {
      item.dataType = 'channel'
      e.dataTransfer.setData('chn', JSON.stringify(item))
    }
  }
}
</script>

<style lang="scss" scoped>
.area-tree-box{width: 100%;}
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
