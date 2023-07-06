<template>
  <div>
    <div v-if="bindKnowListData.length > 0" class="related">
      <div v-for="items in bindKnowListData" :key="items.hyKnowId" class="related-item">
        <el-row :gutter="20">
          <el-col :span="4">
            <el-image fit="cover" :src="items.hyTitleImageUrl" />
          </el-col>
          <el-col :span="20">
            <div class="font-18">{{ items.hyKnowName }}</div>
            <div style="color: #999" class="mt-10 mb-10">{{ items.hyCtime }}</div>
            <div class="related-item-subtitle">{{ items.knowRemark }}</div>
            <el-button class="mt-14" size="small" @click="showDetail(items)">查看全文</el-button>
          </el-col>
        </el-row>
      </div>
      <pagination
        v-show="alarmLogKnowTotal > 0"
        :total="alarmLogKnowTotal"
        :page.sync="findZbxAlarmLogKnowQuery.page"
        :limit.sync="findZbxAlarmLogKnowQuery.limit"
        :auto-scroll="false"
        @pagination="findZbxAlarmLogKnow"
      />
    </div>

    <el-empty v-else description="暂无数据" />
    <el-dialog class="abow_dialog" title="知识点详情" :visible.sync="showBindKnowDetailDialog" width="80%" top="5vh">
      <div class="dialog-body">
        <knowledge-Detail :item-id="onKnow" :show-header="false" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import KnowledgeDetail from '@/views/knowledge/components/knowledge-detail'

export default {
  components: { Pagination, KnowledgeDetail },
  props: {
    item: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      bindKnowListData: [],
      findZbxAlarmLogKnowQuery: {
        page: 1,
        limit: 10
      },
      alarmLogKnowTotal: 0,
      onKnow: '',
      showBindKnowDetailDialog: false
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.findZbxAlarmLogKnow(this.item.id)
    }
    )
  },
  methods: {
    // 打开详情
    showDetail(item) {
      this.onKnow = item.hyKnowId
      this.showBindKnowDetailDialog = true
    },
    // 告警和知识点关联
    async findZbxAlarmLogKnow(logId) {
      const alarmLogKnow = await this.$request({
        url: this.api.itMonitor.findZbxAlarmLogKnow,
        data: {
          logId: logId,
          ...this.findZbxAlarmLogKnowQuery
        }
      })
      if (alarmLogKnow.code === 1 && alarmLogKnow.data) {
        this.alarmLogKnowTotal = +alarmLogKnow.count
        const ids = []
        alarmLogKnow.data.forEach(item => ids.push(item.knowId))
        if (ids.length > 0) {
          const findHyitKnow = await this.$request({
            url: this.api.knowledge.findHyitKnow,
            data: { ids: ids.toString(), limit: -1 }
          })
          if (findHyitKnow.code === 1 && findHyitKnow.data) {
            this.bindKnowListData = findHyitKnow.data
          }
        }
      }
    }
  }
}

</script>

  <style lang="scss" scoped>
.related-item {
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  .related-item-subtitle {
    display: -webkit-box;
    line-height: 24px;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
  </style>

