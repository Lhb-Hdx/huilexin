<template>
  <div class="main video-live">
    <div v-permission="['SearchChn']" class="sideMenu">
      <VideoAreaList :show-calendar="false" @chnCurrentItem="chnCurrentItem" @selectCid="selectCid" />
    </div>
    <div class="main-content">
      <div v-permission="['Search']" class="filter-container alarm_header">
        <el-select v-model="alarmTypeValue" placeholder="报警类型" class="filter-item" clearable @change="changeAlarmType">
          <el-option
            v-for="item in alarmType"
            :key="item.dictdataValue"
            :label="item.dictdataName"
            :value="item.dictdataValue"
          />
        </el-select>
        <el-select v-model="alarmValue" placeholder="报警级别" class="filter-item" clearable @change="changeAlarmLevel">
          <el-option
            v-for="item in alarmLevel"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-date-picker
          v-model="valueTime"
          class="filter-item"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="yyyy-MM-dd HH:mm:ss"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
        />
        <el-button type="primary" class="filter-item" @click="onFilter()">查询</el-button>
      </div>
      <div class="alarm_content table-wrapper">
        <el-table :data="tableData" style="width: 100%">
          <el-table-column width="55" />
          <el-table-column prop="date" label="NO" type="index" width="50" />
          <el-table-column prop="title" label="设备名称" width="120" show-overflow-toolti>
            <template slot-scope="{row}">
              {{ setDvr(row.dvrId) }}
            </template>
          </el-table-column>
          <el-table-column prop="ipcIp" label="IP" width="120" show-overflow-toolti />
          <el-table-column prop="channel" label="通道" show-overflow-toolti>
            <template slot-scope="{row}">
              {{ setChn(row.dvrId) }}
            </template>
          </el-table-column>
          <el-table-column prop="alarmType" label="报警类型" show-overflow-toolti>
            <template slot-scope="{row}">
              <p v-for="item in alarmType" :key="item.dictdataValue">
                <span v-if="item.dictdataValue == row.alarmType">{{ item.dictdataName }}</span>
              </p>
            </template>
          </el-table-column>
          <el-table-column prop="alarmTime" label="报警时间" width="180" show-overflow-toolti />
          <el-table-column prop="level" label="报警级别" show-overflow-toolti>
            <template slot-scope="{row}">
              <p v-for="item in alarmLevel" :key="item.level">
                <span v-if="item.value == row.level">{{ item.label }}</span>
              </p>
            </template>
          </el-table-column>
          <el-table-column prop="imgSize" label="图片大小" show-overflow-toolti />
          <el-table-column label="图片" align="center" class-name="small-padding fixed-width">
            <template slot-scope="{row}">
              <el-button v-show="row.imgSize > 0" size="mini" type="primary" @click="seeIma(row)">
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total>0" :total="total" :auto-scroll="false" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="onFilter" />
      </div>

    </div>

    <el-dialog
      :visible.sync="dialogVisible"
      width="70%"
    >
      <el-image
        style="width: 99%; height: 80%"
        :src="imgUrl"
        :fit="fit"
      />
    </el-dialog>
  </div>
</template>

<script>
// import GlobalDrawer from '@/components/GlobalDrawer'
import MyVideoPlayer from './components/player-content/live-player-content'
import Pagination from '@/components/Pagination'
import draggable from 'vuedraggable'
import VideoAreaList from './components/video-chn-list/video-chn-list'
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'Dashboard',
  components: {
    // GlobalDrawer
    // eslint-disable-next-line vue/no-unused-components
    draggable,
    // eslint-disable-next-line vue/no-unused-components
    MyVideoPlayer,
    Pagination,
    VideoAreaList
  },
  data() {
    return {
      isStream: 1, // 1是主码流，2是子码流、3是第三流
      show: false,
      activeName: 'area',
      isCollapse: false,
      monitor_search_input: '',
      monitorSearchType: '1', // 搜索类型
      show_controller: true, // 云操控展开
      video_display_type: 4, // 监控排版模式
      videoDivs: [], // 所有监控格子共9个
      curVideoDivs: [], // 当前排版下可用的格子 9个、6个、4个 或者1个
      orgTreeData: [], // 树状目录data
      devData: [], // 设备列表
      dialogVisible: false,
      imgUrl: 'https://p0.itc.cn/images01/20210327/7cb85cd4e803400f82f2c1329a45285e.jpeg',
      fit: 'fill',
      activeMonitorTabs: [], // 左侧目录高亮item
      tableData: [], // 报警日志数据
      elTreeKeyDefine: {
        children: 'children',
        label: 'text'
      },
      groupTree: [],
      total: 0,
      listQuery: {
        ipcID: '',
        alarmType: '',
        level: '',
        sTime: '',
        eTime: '',
        page: 1,
        limit: 10
      },
      alarmLevel: [
        { value: 0, label: '所有报警' },
        { value: 1, label: '信息' },
        { value: 2, label: '警告' },
        { value: 3, label: '一般严重' },
        { value: 4, label: '严重' },
        { value: 5, label: '灾难' }
      ],
      alarmType: [
        { value: 0, label: '所有类型' },
        { value: 100, label: '设备掉线' },
        { value: 101, label: '设备上线' },
        { value: 1004, label: '区域入侵' }
      ],
      alarmValue: '',
      alarmTypeValue: '',
      valueTime: '',
      controller: {
        ipcID: '',
        ptzValue: '',
        ptxSpeed: 50
      },
      cid: '',
      chnList: [],
      dvrList: []
    }
  },
  computed: {
    setChn() {
      const that = this
      return function(dvrId) {
        const idx = that.chnList.findIndex(item => item.dvrId === dvrId)
        if (idx !== -1) {
          return that.chnList[idx].cname
        }
      }
    },
    setDvr() {
      const that = this
      return function(dvrId) {
        const idx = that.dvrList.findIndex(item => item.dvrId === dvrId)
        if (idx !== -1) {
          return that.dvrList[idx].title
        }
      }
    }
  },
  created() {
    // this.initVideoDivs()
    this.onFilter()
    this.findAlarmType()
  },
  mounted() {
    this.getChn()
    this.findVideoDvr()
  },
  methods: {
    handleNodeClick(data, isStream) {
      if (data.children.length) {
        console.log('有子集')
        return
      }
      console.log('选择了设备', data.id)
      var id = data.id
      if (id.length > 1) {
        id = id.substring(1)
        this.listQuery.ipcID = id
      }
      console.log('handleNodeClick', id)
      // this.onFilterIpc()
      // this.handelSelectMonitor(id, isStream)
    },
    handleGroupNodeClick(data) {
      const cid = `c${data.cid}`
      this.handelSelectMonitor(cid)
    },
    handleClick(tab, event) {
      // console.log(tab, event);
    },
    async searchForTree() {
      this.activeName = 'area'
      // eslint-disable-next-line no-unused-vars
      let params = {}
      if (this.monitorSearchType === 1) {
        params = { name: this.monitor_search_input }
        console.log('通道搜索')
      } else if (this.monitorSearchType === 2) {
        params = { ip: this.monitor_search_input }
        console.log('ip搜索')
      }
      // console.log('搜索结果', res)
      // eslint-disable-next-line no-undef
      if (res.code === 1) {
        // eslint-disable-next-line no-undef
        this.orgTreeData = this.makeOrgTree(res.data)
      }
    },
    async onFilter() {
      const _this = this
      var params = {}
      // params = { page: _this.listQuery.page, limit: _this.listQuery.limit}
      // _this.listQuery.ipcID = ''
      params = _this.listQuery
      if (_this.valueTime.toString().length > 0) {
        _this.listQuery.sTime = _this.valueTime[0]
        _this.listQuery.eTime = _this.valueTime[1]
      }
      request({
        url: api.video.findVideoAlarmLog, data: params
      }).then(res => {
        _this.tableData = res.data
        _this.total = Number(res.count)
      })
    },
    async onFilterIpc() {
      const _this = this
      var params = {}
      params = _this.listQuery
      if (_this.valueTime.toString().length > 0) {
        _this.listQuery.sTime = _this.valueTime[0]
        _this.listQuery.eTime = _this.valueTime[1]
      }
      request({
        url: api.video.findVideoAlarmLog, data: params
      }).then(res => {
        _this.tableData = res.data
        _this.total = Number(res.count)
      })
    },
    changeAlarmType(val) {
      const _this = this
      _this.listQuery.alarmType = val === 0 ? '' : val
    },
    changeAlarmLevel(val) {
      const _this = this
      _this.listQuery.level = val === 0 ? '' : val
    },
    seeIma(val) {
      const _this = this
      _this.dialogVisible = true
      _this.imgUrl = val.imageUrl
    },
    makeOrgTree(data) {
      let tree = []
      const departments = []
      const devices = []
      const channels = []
      data.forEach(ele => {
        const id = ele.id
        if (id.startsWith('p')) {
          departments.push(ele)
        } else if (id.startsWith('d')) {
          devices.push(ele)
        } else if (id.startsWith('c')) {
          channels.push(ele)
        }
      })

      devices.forEach(dev => {
        const parentId = dev.id
        channels.forEach(channel => {
          if (channel.parentId === parentId) {
            dev.children.push(channel)
          }
        })
      })

      departments.forEach(depart => {
        const parentId = depart.id
        devices.forEach(dev => {
          if (dev.parentId === parentId) {
            depart.children.push(dev)
          }
        })
      })

      tree = [...departments]
      console.log('获得梳妆列表数据', tree)

      return tree
    },

    handleSelectControl(cid) {
      this.controller.ipcID = cid
    },
    handleCancelControl() {
      this.controller.ipcID = ''
    },
    selectCid(val) {
      this.cid = val
    },
    chnCurrentItem(val) {
      this.cid = val.cid
      this.$set(this.listQuery, 'ipcID', val.cid)
      console.log(this.cid)
      this.onFilter()
    },
    findAlarmType() {
      request({
        url: api.common.findSysDictionaryDetail, data: { dictCode: 'video_alarm_type', limit: -1 }
      }).then(res => {
        this.alarmType = res.data
      })
    },
    // 获取通道
    getChn() {
      request({
        url: api.video.findVideoChn, data: { limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.chnList = res.data
        }
      })
    },
    findVideoDvr() {
      request({
        url: api.video.findVideoDvr, data: { limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.dvrList = res.data
        }
      })
    }
  }

}

</script>
<style lang="scss" scoped>
.app-main {
  height: 200vh;
}

.alarm_header{
  margin: 10px 10px 0;
}
/*.alarm_content{
  margin: 10px;
}*/
.alarm_header_select{
  padding-left:10px;
  padding-right:10px;
}
.main.video-live {
  display: flex;
  height: 100%;

  // div {
  //   flex: 1;
  // }W
}
.sideMenu {
  width: 240px;
  background: #e9ecf3;
  height: 100%;
  font-size: 14px;
  font-weight: 600;
  line-height: 36px;
  overflow: auto;
}

.video-live .camera-menu {
  border-top: #A3BADD 2px solid;
}
.camera-menu {
  .search-area {
    margin: 8px 11px;
    display: flex;
    align-items: center;

    .el-select input {
      height: 32px;
      width: 65px;
      padding: 8px;
    }
    .el-input-group__append {
      padding: 6px 8px;
    }
    .el-input-group--append .el-input__inner {
      padding-right: 10px;
    }
  }

  .el-tabs--card > .el-tabs__header .el-tabs__item {
    border-bottom: none !important;
    font-weight: 500 !important;
  }
  .el-tabs__item {
    font-weight: 500;
  }
  .el-tabs__item.is-active,.el-tabs__item:hover {
    color: #000;
  }
  .menu-container {
    height: 100%;
    width: 245px;
    margin-right: -5px;

    .title {
      padding: 0 14px;
      font-size: 12px;
      line-height: 36px;
      height: 36px;
      font-weight: 500;
      background: #dde3ef;
    }
  }
  .el-tabs__nav {
    width: 100%;
    display: flex;

    >div {
      flex: 1;
      text-align: center;
    }
  }
  .el-submenu__title {
    border-bottom: 1px solid rgb(226, 226, 226);
  }
  .el-tabs__header {
    margin: 0;
  }
  .el-tabs__item {
    background: #dde3ef;
  }
  .el-tabs__item.is-active {
    background: #e9ecf3;
  }
  .el-menu {
    background: #e9ecf3;
    margin: 0 14px;
    border-right: none;
  }
  .el-submenu__title,.el-menu-item {
    font-size: 12px;
    padding: 0!important;
    // .title-border-bottom {
    //   border-bottom: solid 1px #fff;
    // }
  }
  .el-menu-item {
    height: 36px;
    line-height: 36px;
  }
  .el-submenu__title {
    font-weight: 500;
    height: 36px;
    line-height: 36px;
  }
  .el-menu-item {
    padding: 0!important;
    font-weight: 500;
  }
  .el-submenu.is-active .el-submenu__title {
    border-bottom: 1px solid #e2e2e2;
  }

  .el-menu-item.is-active {
    color: #303133;
  }
  .el-menu-item.my-active {
    color: #0145ab;
  }
  .menu-item-title {
    display: flex;
  }
  .el-tree-node__content {
    background: #E9ECF3!important;
    padding-top: 9px;
    padding-bottom: 13px;
    height: 35px;
    font-weight: 500;
  }

  .el-tree > div > .el-tree-node__content {
    background: #DDE3EF !important;
  }
  .tree-node-icon {
    width:16px;
    height:16px;
    margin-right: 5px;
  }
  .tree-node-title {
    display: flex;
    align-items: center;

    .active {
      color: #0145ab;
      font-weight: 600;
    }
  }

}
.main-content {
  .content-head {
    background: #fff;
    position: relative;
    z-index: 1;
  }
  background: #ffffff;
  margin: 10px;
  flex: 1;
  overflow: auto;
  padding: 10px;
  .switch-btn {
    width: 20px;
    height: 20px;
    margin: 9px;
    filter:grayscale(1);
    opacity: .78;
  }
  .switch-btn:hover {
    filter:hue-rotate(24deg);
    opacity: 1;
  }
  .switch-btn.active {
    filter:hue-rotate(24deg);
    opacity: 1;
  }
  .content-box {
    background: #f5f5f7;
    height: 100%;
    padding: 8px;
    padding-top: 50px;
    margin-top: -42px;
    overflow-y: scroll;

    .videos-wrap {
      // height: 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      position: relative;
      .video-container-live {
        // background: #fff;
        transition: all .2s;
        position: relative;
        .aspectration {
          width: 100%;
          padding-top: 56.25%;
          background: #fff;
          position: relative;
        }

        .video-playing {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
        }

        .no-video {
          height: 100%;
          display: flex;
          flex-flow: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          color: #666666;
          font-size: 20px;
          font-weight: 400;
          position: absolute;
          top: 0;
          left: 0;
        }
      }
    }

    .videos-wrap.one-block {
      .video-container-live {
        width: 100% !important;
        // height: 100% !important;
        // padding-top: 56.25%;
      }
      .video-container-live:nth-child(n+2) {
        display: none;
      }
    }
    .videos-wrap.four-block {
      .video-container-live {
        width: 49.6% !important;
        margin-bottom: 10px;
        // height: 49% !important;
      }
      .video-container-live:nth-child(n+5) {
        display: none;
      }
    }
    .videos-wrap.six-block {
      .video-container-live {
        width: 33% !important;
        margin-bottom: 6px;
        // height: 32.5% !important;
      }
      .video-container-live:nth-child(1) {
        width: 66.5% !important;
        // height: 65.9% !important;
      }

      .video-container-live:nth-child(n+7) {
        display: none;
      }
      .video-container-live:nth-child(3) {
        position: absolute;
        right: 0;
        top: 33.4% !important;
      }
      // .video-container-live:nth-child(2) {
      //   .no-video {
      //     height: 50%;
      //   }
      // }
    }
    .videos-wrap.nine-block {
      .video-container-live {
        width: 33% !important;
        margin-bottom: 5px;
        // height: 32.5% !important;
      }
      // .video-container-live:nth-child(n+2) {
      //   display: none;
      // }
    }
  }
}
.el-slider__runway {
  background: #B8BABD;
  height: 5px;
}
.el-slider__bar {
  height: 5px;
}
.el-slider__button {
  border-color:  #B8BABD;
  width: 12px;
  height: 12px;
  border-radius: 6px;
}
</style>
