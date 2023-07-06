<template>
  <div class="group-items">
    <div class="active">
      <div class="chn-search">
        <el-select v-if="showCalendar" v-model="recordType" v-permission="['SelectVideoType']" size="mini" placeholder="请选择" class="width-100" @change="changeRecordType">
          <el-option
            v-for="item in recordTypeOption"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-input
          v-model="treeSearchValue"
          v-permission="['SearchChn']"
          size="mini"
          placeholder="IP或关键字查询"
          suffix-icon="el-icon-search"
          @keyup.enter.native="searchForTree"
        />
      </div>
      <div v-if="isShowGroup" class="video-group-tab flexBox align-item-center">
        <div v-for="item in tabBtns" :key="item.value" class="group-tab-item pointer" :class="activeTab === item.value ? 'active' : ''" @click="handlerTab(item.value)">{{ item.label }}</div>
      </div>
      <div ref="chnMenuContainer" class="menu-container" @scroll="orgTreeScroll">
        <AreaTree
          v-if="activeTab === 1"
          :org-tree-list="orgTreeList"
          :show-calendar="showCalendar"
          :is-dragging="isDragging"
          :tree-item-width="treeItemWidth"
          @chnClick="chnClick"
          @calendarIconClick="calendarIconClick"
          @currentYearMonth="currentYearMonth"
          @currentYearMonthDay="currentYearMonthDay"
          @selectCid="selectCid"
          @selectFlow="selectFlow"
          @draggingEl="draggingEl"
        />
        <video-group-tree
          v-if="activeTab === 2"
          :keyword="searchDvrKeyword"
          @chnClick="chnClick"
          @groupClick="groupClick"
          @draggingEl="draggingEl"
        />
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { listToTree, parseTime } from '@/utils'
import AreaTree from './area-tree'
import VideoGroupTree from './group-tree'
import store from '@/store'

export default {
  name: 'VideoPlayBack',
  components: {
    AreaTree,
    VideoGroupTree
  },
  props: {
    showCalendar: Boolean,
    isDragging: { // 是否可拖拽
      type: Boolean,
      default: false
    },
    isShowGroup: { // 是否显示分组
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      timeSegment: [],
      selectTargetDate: null,
      chnCurrentItem: { cid: 0, cname: '' },
      videoByDay: [],
      orgList: [],
      orgTreeList: [], /** 树状目录data */
      dvrList: [],
      chnList: [],
      yearAndMonth: '',
      treeSearchValue: '',
      delNullDvrTreeResult: [],
      ipcIds: [], // ipc设备id
      recordType: 1,
      recordTypeOption: [
        { value: 1, label: '服务器录像' },
        { value: 2, label: '设备录像' }
      ],
      tabBtns: [
        { label: '区域', value: 1 },
        { label: '分组', value: 2 }
      ],
      activeTab: 1,
      searchDvrKeyword: '',
      treeItemWidth: 0
    }
  },
  created() {
    for (var i = 0; i <= 24; i++) this.timeSegment.push(i)
    this.yearAndMonth = parseTime(new Date(), '{y}-{m}')
    this.selectTargetDate = parseTime(new Date(), '{y}-{m}-{d}')
  },
  mounted() {
    this.treeItemWidth = this.$refs.chnMenuContainer.clientWidth - 22
    this.getDvr()
    this.findHyitDevType()
    const roles = store.getters && store.getters.roles
    const showAreaTabButton = roles.indexOf('AreaTabButton') !== -1
    const showGroupTabButton = roles.indexOf('GroupTabButton') !== -1
    if (!showAreaTabButton) this.tabBtns.splice(0, 1)
    if (!showGroupTabButton) this.tabBtns.splice(1, 1)
  },
  methods: {
    getDvr() {
      request({
        url: api.video.findVideoDvr, data: { keyword: this.treeSearchValue, limit: -1 }
      }).then(res => {
        res.data.forEach(item => {
          item.active = true
          item.chn = []
        })
        this.dvrList = res.data
        this.getChn()
      })
    },
    getChn() {
      var that = this
      request({
        url: api.video.findVideoChn, data: { limit: -1 }
      }).then(res => {
        if (res.data) {
          res.data.forEach(item2 => {
            item2.active = false
            item2.activeDate = new Date() // parseTime(new Date(), '{y}-{m}');
            item2.videoByDay = []
            item2.sources = []
            item2.alarm_sources = []
            item2.label_sources = []
            item2.allVideoByDay = {}
            item2.allSources = {}
            item2.allAlarmSources = {}
            item2.allLabelSources = {}
            that.dvrList.forEach((item, index) => {
              if (item.dvrId === item2.dvrId) {
                item.chn.push(item2)
              }
            })
          })
          this.getOrgTree()
        } else {
          this.orgTreeList = []
        }
      })
    },
    getOrgTree() { // 读取组织结构信息
      const that = this
      request({
        url: api.area.findHyitArea, data: { limit: -1 }
      }).then(res => {
        console.log(res.data)
        console.log(that.dvrList)
        res.data.forEach(item3 => {
          item3.active = true
          item3.dvr = []
          // console.log('dvrList：', that.dvrList)
          // console.log('ipcIds：', this.ipcIds)
          that.dvrList.forEach(item => {
            const devTypeIdIndex = this.ipcIds.indexOf(item.devTypeId)
            if (item3.hyAreaId === item.orgId) {
              if (devTypeIdIndex !== -1) {
                item.isIPC = true
              }
              item3.dvr.push(item)
            }
          })
        })
        this.orgList = res.data
        const data = listToTree(res.data, 0, 0, 'hyAreaId', 'hyPid')
        this.orgTreeList = this.mapTree(data)

        if (this.treeSearchValue !== '') {
          // this.delNullDvrTree(this.orgTreeList)
          // console.log('delNullDvrTreeResult', this.delNullDvrTreeResult)
        }
      })
    },
    // 筛选已选择的地址包括父级
    mapTree(arr) {
      let newarr = []
      arr.forEach(item => {
        if (item.isVideo === 1) {
          newarr.push(item)
        } else {
          if (item.children && item.children.length > 0) {
            let redata = this.mapTree(item.children)
            if (redata && redata.length > 0) {
              let obj = {
                ...item,
                children: redata
              }
              newarr.push(obj)
            }
          }
        }
      })
      return newarr
    },
    searchForTree() {
      this.searchDvrKeyword = this.treeSearchValue
      if (this.activeTab === 1) this.getDvr()
    },
    chnClick(item) { // 点击通道名称
      this.$emit('chnCurrentItem', item)
    },
    calendarIconClick(item) { // 点击日历查询
      if (this.chnCurrentItem && this.chnCurrentItem.cid !== item.cid) { this.chnCurrentItem.active = false }
      this.chnCurrentItem = item
      if (!item.videoByDay || item.videoByDay.length === 0) {
        this.videoByDayData(this.yearAndMonth)
      }
      item.active = !item.active
    },
    videoByDayData(_yearAndMonth) { // 查找某月的记录
      request({
        url: api.video.getVedioByDay, data: { cid: this.chnCurrentItem.cid, yearAndMonth: _yearAndMonth }
      }).then(res => {
        if (res && res.data) {
          this.chnCurrentItem.videoByDay = res.data
          this.chnCurrentItem.allVideoByDay[ _yearAndMonth ] = res.data
          // console.log("allSources",JSON.stringify(this.chnCurrentItem.allVideoByDay))
        }
      })
    },
    currentYearMonth(_date) { // 日历变更月份回调方法，重新请求当月的数据
      const _yearAndMonth = _date.getFullYear().toString() + '-' + (_date.getMonth() + 1 < 10 ? '0' + (_date.getMonth() + 1) : (_date.getMonth() + 1))
      // console.log("日期切换",_date,_yearAndMonth)
      var _videoByDay = this.chnCurrentItem.allVideoByDay[_yearAndMonth]
      if (_videoByDay && _videoByDay.length > 0) {
        this.chnCurrentItem.videoByDay = _videoByDay
      } else {
        this.videoByDayData(_yearAndMonth)
      }
    },
    currentYearMonthDay(item) { // 日历点击返回当前日期
      item.cid = this.chnCurrentItem.cid
      item.cname = this.chnCurrentItem.cname
      this.$emit('currentYearMonthDay', item)
    },
    orgTreeScroll(event) {
      this.chnCurrentItem.active = false
    },
    selectFlow(val) {
      this.$emit('selectFlow', val)
    },
    selectCid(val) {
      this.$emit('selectCid', val)
    },
    findHyitDevType() {
      request({
        url: api.common.findSysDictionaryDetail, data: { dictCode: 'video_dev_type', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          const ipcIds = []
          for (var i = 0; i < res.data.length; i++) {
            if (res.data[i].dictdataName.indexOf('IPC') !== -1 || res.data[i].dictdataName.indexOf('ipc') !== -1) {
              ipcIds.push(res.data[i].id)
            }
          }
          this.ipcIds = ipcIds
        }
      })
    },
    changeRecordType(val) {
      this.$emit('changeRecordType', val)
    },
    draggingEl(val) {
      this.$emit('draggingEl', val)
    },
    handlerTab(value) {
      this.activeTab = value
    },
    // 点击通道
    groupClick(val) {
      this.$emit('groupClickItem', val)
    }
  }
}
</script>

<style lang="scss" scoped>
$h:0px;
.group-items{
  padding-top: $h;
  z-index:99;
  width:100%;

  >div{
    display: none;
    width:100%;
    position: relative;

    .chn-search{
      top:0;
      left:0;
      right:0;
      background: #e9ecf3;
      margin: 10px;
    }
  }
  >div.active{
    display: block;
  }
}
.menu-container {
  width: 100%;
  padding-left:11px;
  padding-right:11px;

  .title {
    padding: 0 14px;
    font-size: 12px;
    line-height: 36px;
    height: 36px;
    font-weight: 500;
    background: #dde3ef;
  }
  >div{
    >div >.org-title{border-bottom: 1px solid rgb(231, 231, 231);}
  }
  .org-title,.dvr-title{
    i{line-height: 36px;font-size: 16px;color: #a2a2a3;}
  }
}
.video-group-tab {
  background: #eeeeee;
  .group-tab-item {
    flex: 1;
    text-align: center;
    border-radius: 4px;
  }
  .active {
    background: #FFFFFF;
  }
}
</style>
