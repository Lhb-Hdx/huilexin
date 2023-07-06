<template>
  <div class="h-100 flexBox">
    <div class="sideMenu">
      <div class="camera-menu">
        <div class="group-items">
          <div class="active">
            <div class="chn-search">
              <!-- <el-input
                v-model="classifyTreeListQuery.name"
                v-permission="['SearchConfigItemClassify']"
                size="mini"
                placeholder="关键字查询"
                suffix-icon="el-icon-search"
                @keyup.enter.native="findCmdbItemType"
              /> -->
              <div v-if="handlerClickItem.userDefine !== 0" class="filter-container">
                <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
              </div>
            </div>
            <!-- 左侧导航栏 -->
            <div ref="orgTree" class="menu-container">
              <ItemTreeList :org-tree-list="classifyTreeList" @chnClick="chnClick" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="list-content">
      <div class="table-wrapper">
        <el-table
          :data="data"
          row-key="hyAreaId"
          default-expand-all
          fit
          highlight-current-row
          style="width: 100%;"
        >
          <el-table-column label="名称" prop="name" align="left" show-overflow-tooltip />
          <el-table-column label="图片" align="left" show-overflow-tooltip>
            <template slot-scope="{row}">
              <el-image fit="fill" :src="setImg(row.itemImageUrl)" style="width: 20px;height: 20px">
                <div slot="error" class="image-slot el-image-sort no-background" />
              </el-image>
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="remark" align="left" show-overflow-tooltip />
          <el-table-column label="操作" class-name="small-padding fixed-width" width="150" align="center">
            <template slot-scope="{row}">
              <el-button type="primary" size="mini" @click="onEdit(row)">编辑</el-button>
              <el-button type="danger" size="mini" @click="onDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="listTotal>0" :auto-scroll="false" :total="listTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findCmdbItem" />
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { listToTree } from '@/utils'
import ItemTreeList from '@/components/CmdbPageComponent/item-tree-list/item-tree-list'
import { cmdbConfigItemIdInItMonitorId, cmdbConfigItemIdInOpmId } from '@/utils/define-data'
import Pagination from '@/components/Pagination'

export default {
  name: 'ConfigItemListView',
  components: {
    ItemTreeList, Pagination
  },
  data() {
    return {
      classifyTreeList: [],
      classifyTreeListQuery: {
        page: 1,
        limit: -1,
        name: ''
      },
      handlerClickItem: {},
      itMonitorDevTypeProp: 0,
      opmDevTypeProp: 0,
      cmdbItemDevice: [],
      cmdbItemOpm: [],
      data: [],
      listQuery: {
        keyword: null,
        itemTypeId: '',
        page: 1,
        limit: 10
      },
      listTotal: 0
    }
  },
  computed: {
    isItMonitorList() {
      const idx = this.cmdbItemDevice.findIndex(item => item.cmdbItemId === this.handlerClickItem.id)
      return idx !== -1 && this.handlerClickItem.id
    },
    isOpmList() {
      const idx = this.cmdbItemOpm.findIndex(item => item.cmdbItemId === this.handlerClickItem.id)
      return idx !== -1 && this.handlerClickItem.id
    },
    setImg() {
      return function(imgUrl) {
        return imgUrl || ''
      }
    }
  },
  mounted() {
    this.cmdbItemDevice = cmdbConfigItemIdInItMonitorId()
    this.cmdbItemOpm = cmdbConfigItemIdInOpmId()

    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      this.listQuery = pageQuery
      this.findCmdbItem()
    }
    this.findCmdbItemType()
  },
  methods: {
    onEdit(row) {
      this.$router.push({
        name: 'ItemUpdate',
        query: {
          id: row.id || 0
        }
      })
    },
    onDelete(row) {
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.cmdb.deleteCmdbItem,
          data: {
            id: row.id
          }
        }).then(res => {
          if (res.code === 1) {
            this.$message({
              type: 'success',
              message: res.msg
            })
            this.findCmdbItem()
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    },
    // 获取类目列表
    findCmdbItemType() {
      request({
        url: api.cmdb.findCmdbItemType,
        data: this.classifyTreeListQuery
      }).then(res => {
        if (res.code === 1) {
          const systemDefine = []
          const userDefine = []
          const treeData = listToTree(res.data, 0, 0, 'id', 'parentId')
          treeData.forEach(item => {
            if (item.userDefine === 0) {
              systemDefine.push(item)
            } else {
              userDefine.push(item)
            }
          })
          this.classifyTreeList = systemDefine.concat(userDefine)
          this.handlerClickItem = this.classifyTreeList[0]
          // 默认执行导航栏第一行
          this.$set(this.listQuery, 'itemTypeId', this.classifyTreeList[0].id)
          this.findCmdbItem()
        }
      })
    },
    /* 点滴左侧导航栏 */
    chnClick(val) {
      this.$set(this.listQuery, 'itemTypeId', val.id)
      this.findCmdbItem()
      if (val.parentId !== 0) {
        request({
          url: api.cmdb.getCmdbItemType,
          data: {
            id: val.parentId
          }
        }).then(res => {
          this.localStorageOperation('set', 'itemSoureceType', JSON.stringify({ itemSoureceType: val.valueType }))
        })
      } else {
        this.localStorageOperation('set', 'itemSoureceType', JSON.stringify({ itemSoureceType: val.valueType }))
      }
    },
    handleCreate() {
      this.$router.push({
        name: 'ItemCreate'
      })
    },
    handlerClickItemConfig(row, infoField) {
      const queryData = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...queryData, route: this.$route.name
      }))
      this.$router.push({ name: 'CmdbItemConfig' })
      this.localStorageOperation('set', 'cmdbItem', JSON.stringify({ row, infoField }))
    },
    findCmdbItem() {
      request({ url: api.cmdb.findCmdbItem, data: this.listQuery }).then(res => {
        if (res.code === 1) {
          this.listTotal = Number(res.count)// 分页
          this.data = res.data
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$h:0px;
.sideMenu {
  margin-left: 10px;
  width: 240px;
  background: #e9ecf3;
  height: 100%;
  font-size: 14px;
  font-weight: 600;
  line-height: 36px;
  overflow: auto;

  .group-items{
    padding-top: $h;z-index:99;width:100%;

    .active{
      width:100%;
      position: relative;

      .chn-search{
        top:0;
        left:0;
        right:0;
        background: #e9ecf3;
        margin: 10px;
      }

      .menu-container {
        width: 100%;
      }
    }
  }
}

.list-content {
  width: calc(100% - 240px);
  margin: 10px;
}
</style>
