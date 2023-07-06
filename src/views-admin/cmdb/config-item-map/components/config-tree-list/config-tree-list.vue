<template>
  <div class="area-tree-box">
    <div v-for="(item,index) in orgTreeList" :key="index" class="area-tree-box">
      <div class="org-title">
        <div>
          <div :style="{'text-indent':item.level * 20 +'px'}" @click="chnClick(item)">
            <img v-if="item.imageUrl" class="tree-item-icon" :src="setIcon(item.imageUrl)" alt="">{{ item.name }}
          </div>
        </div>
        <div @click="onExpand(item, 'aaa')">
          <div v-if="item.expand === false"><i class="el-icon-caret-bottom" /></div>
          <div v-if="item.expand === true"><i class="el-icon-caret-top" /></div>
        </div>
      </div>
      <div class="org-children" :class="item.expand === true ? 'active' : ''">
        <CmdbConfigTreeList :org-tree-list="item.children" />
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api/api'
import request from '@/utils/request'
import { cmdbConfigItemIdInOpmId, cmdbConfigItemIdInItMonitorId } from '@/utils/define-data'

export default {
  name: 'CmdbConfigTreeList',
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
      dragging: null,
      // cmdb配置项类目
      classifyTreeApi: [
        { classifyId: 12, api: api.assets.findAssetsInfo, nameField: 'assetsName', idField: 'assetsId' }, // 资产
        { classifyId: 11, api: api.area.findHyitArea, nameField: 'hyAreaName', idField: 'hyAreaId' }, // 区域
        { classifyId: 10, api: api.org.findHyitOrg, nameField: 'hyOrgName', idField: 'hyOrgId' }, // 组织机构
        { classifyId: 9, api: api.hr.findHrUserInfo, nameField: 'userRealName', idField: 'id' }, // 人员
        { classifyId: 8, api: api.powerEnv.findHyitHost, query: { hyDevTypeId: 2 }, nameField: 'hyHostName', idField: 'hyHostId' }, // 动环
        {
          classifyId: 7, // 配置项id
          children: true, // 是否有子级
          api: api.automationOperations.findHyitOpsServer, // api接口
          nameField: 'serverName', // 名称字段
          idField: 'id', // id字段
          childrenIdField: 'deviceTypeCatId',
          dataSource: 'cmdbItemIdInItOpm' // 子级数据源
        }, // 运维设备
        {
          classifyId: 6,
          children: true,
          api: api.itMonitor.findHyitHost,
          query: { hostType: 1 }, // 请求参数
          nameField: 'hyMarkName',
          idField: 'hyHostId',
          childrenIdField: 'devType',
          dataSource: 'cmdbItemIdInItMonitor'
        }, // it监控
        { classifyId: 1, api: api.video.findVideoDvr, nameField: 'title', idField: 'dvrId' } // 视频
      ],
      // it监控cmdb配置项类目对应的it监控设备类型id
      cmdbItemIdInItMonitor: [],
      cmdbItemIdInItOpm: []
    }
  },
  computed: {
    setIcon() {
      return function(imgUrl) {
        return imgUrl || ''
      }
    }
  },
  mounted() {
    this.cmdbItemIdInItMonitor = cmdbConfigItemIdInItMonitorId()
    this.cmdbItemIdInItOpm = cmdbConfigItemIdInOpmId()
  },
  methods: {
    onExpand(item) {
      const getClassifyTreeApi = this.$tool.findDataItemByAttr(this.classifyTreeApi, 'classifyId', item.parentId === 0 ? item.id : item.parentId)
      if (!getClassifyTreeApi) return
      if (!(getClassifyTreeApi.children && item.parentId === 0)) {
        let data = {}
        if (getClassifyTreeApi.query) data = getClassifyTreeApi.query
        if (getClassifyTreeApi.children) {
          const getCmdbItemIdInItMonitor = this.$tool.findDataItemByAttr(this[`${getClassifyTreeApi.dataSource}`], 'cmdbItemId', item.id)
          data[`${getClassifyTreeApi.childrenIdField}`] = getCmdbItemIdInItMonitor.deviceClassifyId
        }
        this.requestClassifyChildren(getClassifyTreeApi.api, data, res => {
          res.forEach(resItem => {
            resItem.name = resItem[`${getClassifyTreeApi.nameField}`]
            resItem.level = item.level + 1
          })
          item.children = res
        })
      }
      item.expand = !item.expand
    },
    chnClick(item) {
      console.log(item)
    },
    // 请求类目下的数据
    requestClassifyChildren(api, data, callback) {
      let requestData = { page: 1, limit: -1, ...data }
      request({
        url: api,
        data: requestData
      }).then(res => {
        if (res.code === 1) {
          callback(res.data)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.area-tree-box{width: 100%;}
.org-title,.dvr-title,.chn-title{
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  align-items: center;
  >div{
    display: flex;
    justify-content: flex-start;
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
.tree-item-icon {margin: 11px 5px 0 0; width: 14px; height: 14px}
</style>
