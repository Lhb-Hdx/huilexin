<template>
  <div class="group-tree">
    <div v-for="gitem in videoGroup" :key="gitem.id" class="group-tree-content">
      <div
        class="pointer tree-content-title flexBox align-item-center space-between"
        :draggable="true"
        @dragstart="dragGroupItem($event, gitem)"
      >
        <div class="title overflow-text-a" @click="onGroup(gitem)">{{ gitem.name }}</div>
        <i v-if="gitem.active === true" class="el-icon-caret-top" @click="openChildren(gitem.id, false)" />
        <i v-if="gitem.active === false" class="el-icon-caret-bottom" @click="openChildren(gitem.id, true)" />
      </div>
      <div v-if="gitem.active" class="tree-content-children">
        <div
          v-for="citem in gitem.children"
          :key="citem.cid"
          :draggable="true"
          class="content-children-item normal pointer overflow-text-a"
          @click="onGroupChnItem(citem)"
          @dragstart="dragChnItem($event, citem)"
        >
          <img v-if="citem.status === 1" class="tree-item-icon" src="image/video/tree_ipc_online_icon.png" alt="">
          <img v-if="citem.status === 0 || citem.status === -1" class="tree-item-icon" src="image/video/tree_ipc_downline_icon.png" alt="">
          {{ setTableField(citem.dvrId, 'title') }} {{ citem.cname }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { getUserSession } from '@/utils/auth'

export default {
  name: 'VideoGroupTree',
  props: {
    keyword: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      videoGroup: [],
      userSession: getUserSession(),
      chnDvrListByGroup: [],
      dragging: null
    }
  },
  computed: {
    // 设置字段内容
    setTableField() {
      const that = this
      return function(dvrId, field) {
        const idx = that.chnDvrListByGroup.findIndex(item => item.dvrId === dvrId)
        if (idx !== -1) {
          return that.chnDvrListByGroup[idx][`${field}`]
        }
      }
    }
  },
  watch: {
    keyword(newVal) {
      console.log(newVal)
      if (newVal) {
        this.getPropKeyword(newVal)
      }
    }
  },
  mounted() {
    this.findVideoGroup()
  },
  methods: {
    // 获取分组
    findVideoGroup() {
      request({ url: api.video.findVideoGroup, data: { page: 1, limit: -1, userId: this.userSession.userId }}).then(res => {
        if (res.code === 1) {
          res.data.forEach(item => {
            item.children = []
            item.active = false
          })
          this.videoGroup = res.data
        }
      })
    },
    // 获取分组通道
    async findVideoGroupChannel(data) {
      return new Promise(resolve => {
        return request({ url: api.video.findVideoGroupChannel, data }).then(res => {
          if (res.code === 1) {
            return resolve(res)
          }
        })
      })
    },
    // 获取通道
    async findVideoChn(data) {
      return new Promise(resolve => {
        request({
          url: api.video.findVideoChn,
          data
        })
          .then(res => {
            if (res.code === 1) {
              resolve(res)
            }
          })
      })
    },
    // 获取通道dvr
    async findVideoDvr(ids, keyword) {
      return new Promise(resolve => {
        const data = {
          page: 1, limit: -1
        }
        if (ids) data.ids = ids.toString()
        if (keyword) data.keyword = keyword
        request({
          url: api.video.findVideoDvr,
          data
        })
          .then(res => {
            if (res.code === 1) {
              resolve(res)
            }
          })
      })
    },
    // 打开子级
    openChildren(groupId, tag) {
      const videoGroupIdx = this.videoGroup.findIndex(item => item.id === groupId) // 查找出当前折展开的是第几个分组
      if (tag) {
        this.$set(this.videoGroup[videoGroupIdx], 'active', true)
        if (this.keyword === '') this.findVideoGroupChannelData(groupId, videoGroupIdx)
      } else {
        this.$set(this.videoGroup[videoGroupIdx], 'active', false)
      }
    },
    // 获取分组通道
    async findVideoGroupChannelData(groupId, videoGroupIdx) {
      // 查询分组里面的通道
      const videoGroupChannelRes = await this.findVideoGroupChannel({
        groupId: groupId,
        page: 1,
        limit: -1
      })
      if (!videoGroupChannelRes.data) return
      // 存储分组关联dvrid和通道id
      const cIds = []
      const dvrIds = []
      videoGroupChannelRes.data.forEach(item => {
        cIds.push(item.channelId)
        dvrIds.push(item.dvrId)
      })
      // 批量获取通道
      const videoChnRes = await this.findVideoChn({
        ids: cIds.toString(),
        page: 1,
        limit: -1
      })
      if (!videoChnRes.data) return
      // 获取出分组关联的通道id
      const groupChnIds = []
      videoGroupChannelRes.data.forEach(item => {
        groupChnIds.push(item.channelId)
      })
      // 用分组关联的通道id去匹配批量获取的通道信息
      const groupChnList = []
      videoChnRes.data.forEach(item => {
        const idx = groupChnIds.findIndex(items => items === item.cid)
        if (idx !== -1) {
          groupChnList.push(item)
        }
      })
      this.$set(this.videoGroup[videoGroupIdx], 'children', groupChnList) // 将匹配完成的通道插入到分组的子表格中
      // 批量获取通道对应的dvr信息
      const videoDvrRes = await this.findVideoDvr(dvrIds)
      if (!videoDvrRes.data) return
      videoDvrRes.data.forEach(item => {
        const idx = this.chnDvrListByGroup.findIndex(items => items.dvrId === item.dvrId)
        if (idx === -1) {
          this.$set(this.chnDvrListByGroup, this.chnDvrListByGroup.length, item)
        }
      })
    },
    // 点击分组
    onGroup(item) {
      const groupItem = { ...item } // 这样可以重新创建对象，直接赋值 item 的话这个变量的引用地址是不会变的，会影响到原对象
      this.onGetGroupChnData(groupItem, 'groupClick')
    },
    // 点击通道
    onGroupChnItem(item) {
      const groupItem = { ...item }
      this.onGetChnData(groupItem, 'chnClick')
    },
    // 结束拖拽生成分组
    handleChnDragEnd(e, item) {
      const groupItem = { ...item } // 这样可以重新创建对象，直接赋值 item 的话这个变量的引用地址是不会变的，会影响到原对象
      this.onGetChnData(groupItem, 'draggingEl', true)
    },
    async onGetGroupChnData(groupItem, emitEvent, isGroup) {
      // 查询分组里面的通道
      const videoGroupChannelRes = await this.findVideoGroupChannel({
        groupId: groupItem.id,
        page: 1,
        limit: -1
      })
      if (!videoGroupChannelRes.data) return
      const chnIds = []
      const dvrIds = []
      videoGroupChannelRes.data.forEach(item => {
        chnIds.push(item.channelId)
        dvrIds.push(item.dvrId)
      })
      if (chnIds.length === 0) return this.$message('分组暂无设备')
      // 批量获取通道
      const videoChnRes = await this.findVideoChn({
        ids: chnIds.toString(),
        page: 1,
        limit: -1
      })
      const videoDvrRes = await this.findVideoDvr(dvrIds)
      if (!videoDvrRes.data) return
      videoChnRes.data.forEach(videoChnResItem => {
        const idx = videoDvrRes.data.findIndex(videoDvrResItem => videoDvrResItem.dvrId === videoChnResItem.dvrId)
        if (idx !== -1) {
          videoChnResItem.beDvr = Object.assign({}, videoDvrRes.data[idx])
        }
      })
      const propGroupItem = groupItem
      propGroupItem.children = [...videoChnRes.data]
      if (emitEvent === 'groupClick') this.$emit('groupClick', propGroupItem)
      if (emitEvent === 'draggingEl') {
        propGroupItem.dataType = isGroup ? 'group' : 'channel'
        this.DataTransfer.setData('chn', JSON.stringify(propGroupItem))
      }
    },
    async onGetChnData(groupItem, emitEvent) {
      // 查询通道信息
      const videoChnRes = await this.findVideoChn({
        ids: groupItem.cid,
        page: 1,
        limit: -1
      })
      if (!videoChnRes.data) return
      // 查询通道dvr
      const videoDvrRes = await this.findVideoDvr([groupItem.dvrId])
      if (!videoChnRes.data) return
      videoChnRes.data.forEach(videoChnResItem => {
        const idx = videoDvrRes.data.findIndex(videoDvrResItem => videoDvrResItem.dvrId === videoChnResItem.dvrId)
        if (idx !== -1) {
          videoChnResItem.beDvr = videoDvrRes.data[idx]
        }
      })
      const propGroupItem = groupItem
      propGroupItem.children = videoChnRes.data
      if (emitEvent === 'chnClick') this.$emit('chnClick', propGroupItem.children[0])
      if (emitEvent === 'draggingEl') {
        propGroupItem.children[0].dataType = 'channel'
        this.DataTransfer.setData('chn', JSON.stringify(propGroupItem.children[0]))
      }
    },
    async getPropKeyword(keyword) {
      // 根据关键词获取dvr
      await this.cleanGroupChildrenChn()
      const findVideoDvrResult = await this.findVideoDvr(false, keyword)
      if (findVideoDvrResult.data.length === 0) return
      this.chnDvrListByGroup = findVideoDvrResult.data
      const dvrIds = []
      findVideoDvrResult.data.forEach(dvrItem => {
        dvrIds.push(dvrItem.dvrId)
      })
      // 使用关键词搜索的dvr去查询分组里面有这个dvr的分组通道
      const videoGroupChannelRes = await this.findVideoGroupChannel({ dvrIds: dvrIds.toString(), page: 1, limit: -1 })
      const cIds = []
      videoGroupChannelRes.data.forEach(groupChnItem => {
        const idx = cIds.findIndex(item => item === groupChnItem.channelId)
        if (idx === -1) {
          cIds.push(groupChnItem.channelId)
        }
      })
      const findVideoChnResult = await this.findVideoChn({ ids: cIds.toString(), page: 1, limit: -1 })
      this.videoGroup.forEach((groupItem, groupIndex) => {
        const idx = videoGroupChannelRes.data.findIndex(item => Number(item.groupId) === Number(groupItem.id))
        if (idx !== -1) {
          const childrenChn = []
          findVideoChnResult.data.forEach(chnItem => {
            if (Number(chnItem.cid) === Number(videoGroupChannelRes.data[idx].channelId)) {
              childrenChn.push(chnItem)
            }
          })
          this.$set(this.videoGroup[groupIndex], 'active', true)
          this.$set(this.videoGroup[groupIndex], 'children', childrenChn)
        } else {
          this.$set(this.videoGroup[groupIndex], 'active', false)
          this.$set(this.videoGroup[groupIndex], 'children', [])
        }
      })
    },
    // 清空并关闭分组通道列表
    async cleanGroupChildrenChn() {
      return new Promise(resolve => {
        this.videoGroup.forEach((item, index) => {
          this.$set(this.videoGroup[index], 'active', false)
          this.$set(this.videoGroup[index], 'children', [])
        })
        resolve(true)
      })
    },
    // 拖拽分组
    async dragGroupItem(e, item) {
      const groupItem = { ...item }
      const videoGroupChannelRes = await this.findVideoGroupChannel({
        groupId: groupItem.id,
        page: 1,
        limit: -1
      })
      if (!videoGroupChannelRes.data) return
      groupItem.children = videoGroupChannelRes.data
      this.onGetGroupChnData(groupItem, 'draggingEl', true)
    },
    // 拖拽通道
    dragChnItem(e, item) {
      const groupItem = { ...item } // 这样可以重新创建对象，直接赋值 item 的话这个变量的引用地址是不会变的，会影响到原对象
      this.onGetChnData(groupItem, 'draggingEl', true)
    }
  }
}
</script>

<style lang="scss" scoped>
.group-tree {
  .group-tree-content {
    .tree-content-title {}
    .tree-content-children {
      .content-children-item {
        text-indent: 10px;
        .tree-item-icon {
          margin: 9px 5px 0 0;
        }
      }
    }
  }
}
</style>
