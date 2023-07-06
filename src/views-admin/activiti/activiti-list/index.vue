<template>
  <div class="wrp">
    <div class="headerBox">
      <el-button v-permission="['create']" class="mr-10" type="primary" icon="el-icon-plus" @click="onAdd()">新增</el-button>
      <div v-permission="['search']">
        <el-input v-model="listQuery.hyLinkName" placeholder="请输入联动名称" clearable @change="handleSearch" />
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
      </div>
      <div class="val">
        <ListControl :check-list="checkList" @setLists="setLists" />

      </div>
    </div>
    <div class="table-wrapper">
      <el-table :data="data" style="width: 100%">
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" prop="hyLinkName" width="400" label="联动名称" show-overflow-tooltip align="left" />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" prop="hyTid" label="时间模板" show-overflow-tooltip align="left">
          <template slot-scope="{row}">
            {{ $tool.matchData(hyitTimes,row,'hyTid','hyTname') }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="事件" show-overflow-tooltip align="left">
          <template slot-scope="{row}">
            {{ sethyitEvent(row.hyLinkId) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="事件源(数量)" show-overflow-tooltip align="right">
          <template slot-scope="{row}">
            <el-link type="primary" @click="onEdit(row)">
              {{ sethyitEventSource(row) }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" prop="time" label="过滤时间(秒)" show-overflow-tooltip align="right" />
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" prop="hyActionClassId" label="动作" show-overflow-tooltip align="left">
          <template slot-scope="{row}">
            {{ sethyitAction(row.hyLinkId) }}
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[6].ispass : true" prop="hyActionSrcName" label="动作源(数量)" show-overflow-tooltip align="right">
          <template slot-scope="{row}">
            <el-link type="primary" @click="onEdit(row)">
              {{ sethyitActionSource(row) }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[7].ispass : true" label="操作" width="250" align="left">
          <template slot-scope="{row}">
            <el-button v-permission="['edit']" type="primary" size="mini" @click="onEdit(row)">编辑</el-button>
            <el-button v-permission="['delete']" type="danger" size="mini" @click="onDelete(row.hyLinkId)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="listCount > 0" :auto-scroll="false" :total="listCount" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="init" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import ListControl from '@/components/ListControl'

export default {
  name: 'ActivitiList',
  components: {
    Pagination, ListControl
  },
  data() {
    return {
      listQuery: {
        hyLinkName: '',
        page: 1,
        limit: 10
      },
      listCount: 0,
      data: [],
      hyitTimes: [],
      hyitEvent: [], // 事件
      hyitLinkSrc: [],
      actions: [],
      actionSource: [], // 动作源
      eventSource: [], // 事件源
      thresholdIdList: [],
      // 显示控制数据 start
      checkList: ['联动名称', '时间模板', '事件', '事件源(数量)', '过滤时间(秒)', '动作', '动作源(数量)', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    sethyitEvent() {
      return function(linkid) {
        let res = this.hyitLinkSrc.find(it => it.hyLinkId === linkid)
        if (!res) return
        if (res.type === 0) {
          let list = []
          for (const event of this.hyitEvent) {
            for (const hyEventId of res.hyEventIds.split(',')) {
            // 只从event['hyEventId']找?
              if (+hyEventId === +event['hyEventId']) {
                console.log(event)
                list.push(event.hyEventName)
              }
            }
          }
          return list.join(',')
        } else {
          let list = []
          for (const event of this.thresholdIdList) {
            for (const hyEventId of res.hyEventIds.split(',')) {
            // 只从event['hyEventId']找?
              if (+hyEventId === +event['conditionId']) {
                console.log(event)
                list.push(event.name)
              }
            }
          }
          return list.join(',')
        }
      }
    },
    sethyitEventSource() {
      return function(row) {
        let res = this.hyitLinkSrc.filter(it => it.hyLinkId === row.hyLinkId)
        return res && res.length
      }
    },
    sethyitActionSource() {
      return function(row) {
        let res = this.actionSource.filter(it => it.hyLinkId === row.hyLinkId)
        return res && res.length
      }
    },
    sethyitAction() {
      return function(linkid) {
        let res = this.actionSource.filter(it => it.hyLinkId === linkid).map(it => it.hyAid)
        if (!res.length) return
        let action = this.actions.filter(it => res.includes(it.hyAid))
        if (action) return action.map(it => it.hyActionName).join(',')
      }
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.listQuery = pageQuery
    }
  },
  mounted() {
    this.init()
    this.findHyitTime()
    this.findHyitEvent()
    this.findHyitLinkSrc()
    this.findHyitAction()
    this.findHyitLinkAction()
    this.findLinkageThresholdCondition()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    async init() {
      console.log('7777777777777777777777777777')
      let { data, code, ...res } = await request({
        url: api.linkageManage.findHyitLink,
        data: this.listQuery
      })
      if (code !== 1) return
      this.data = data
      console.log(JSON.stringify(this.data))
      this.listCount = Number(res.count)
      // this.$set(this.listQuery, 'count', +res.count)
    },
    handleSearch() {
      this.$set(this.listQuery, 'page', 1)
      this.init()
    },
    onAdd() {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({ name: 'ActivitiAdd' })
    },
    onEdit(row) {
      const data = { ...this.listQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      let id = this.hyitLinkSrc.find(it => it.hyLinkId === row.hyLinkId)
      const query = { hyLinkId: row.hyLinkId}
      if (id) query.hyLinkSrcId = id.hyLinkSrcId
      this.$router.push({ name: 'ActivitiEdit', query})
    },
    async onDelete(hyLinkId) {
      this.$confirm('确认删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.linkageManage.deleteHyitLink,
          data: { hyLinkId }
        }).then(({ code }) => {
          if (code !== 1) return
          this.$message.success('删除成功')
          request({ url: api.linkageManage.updateLocalCache, data: { b: false }})
          this.init()
        }, () => {
          this.$message.error('删除失败')
        })
      }).catch(() => {})
    },
    async findHyitTime() { // 时间模板
      let { data, code } = await request({
        url: api.video.findHyitTime
      })
      if (code !== 1) return
      this.hyitTimes = data
    },
    async findHyitEvent() { // 事件
      let { data, code } = await request({
        url: api.linkageManage.findHyitEvent,
        data: { limit: -1 }
      })
      if (code !== 1) return
      this.hyitEvent = data
    },
    async findHyitLinkSrc(ids) { // 用来匹配列表的其他字段
      let { data, code } = await request({
        url: api.linkageManage.findHyitLinkSrc,
        data: { limit: -1, ids }
      })
      if (code !== 1) return
      if (this.hyitLinkSrc.length) return data
      this.hyitLinkSrc = data
    },
    async findHyitAction() { // 动作
      let { data, code } = await request({
        url: api.linkageManage.findHyitAction, data: { limit: -1}
      })
      if (code !== 1) return
      this.actions = data
    },
    async findHyitLinkAction() { // 动作源字段匹配
      let { data, code } = await request({
        url: api.linkageManage.findLinkageActionMap,
        data: { limit: -1 }
      })
      if (code !== 1) return
      if (this.actionSource.length) return data
      this.actionSource = data
    },
    // 查找阈值类型列表
    async findLinkageThresholdCondition() {
      console.log(this.listQuery, '1111')
      let { data, code } = await request({
        url: api.linkageManage.findLinkageThresholdCondition,
        data: this.listQuery
      })
      if (code !== 1) return
      // this.listCount = Number(count)
      // this.$set(this.listQuery, 'count', +count)
      this.thresholdIdList = data
      // console.log(data, code, count)
    }
  }
}
</script>
<style lang="scss" scoped>
.val {
  position: absolute;
  right: 10px;
}
</style>

