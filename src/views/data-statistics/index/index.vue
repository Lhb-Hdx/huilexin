<template>
  <div class="app-container">
    <div v-permission="['Search']" class="filter-container">
      <el-select class="filter-item" />
      <el-input class="filter-item filter-item-input" placeholder="搜索关键词" />
      <el-button class="filter-item" type="primary">查询</el-button>
    </div>
    <div class="table-wrapper">
      <el-table :data="internetCafeData" style="width: 100%">
        <el-table-column
          prop="hyCafeName"
          label="机房名称"
        />
        <el-table-column
          prop="hyCafeAddr"
          label="机房地址"
        />
        <el-table-column
          prop="hyCafeHostNum"
          label="设备数量"
        />
        <el-table-column
          prop="hyCafeMaxBandwidth"
          label="最高速率限制"
        />
        <el-table-column
          prop="hyCafeUpBandwidth"
          label="上行速度"
        />
        <el-table-column
          prop="hyCafeDownBandwidth"
          label="下行速度"
        />
        <el-table-column
          prop="hyUtime"
          label="记录时间"
        />
        <el-table-column
          prop="hyStatus"
          label="状态"
        />
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FlowMonitor',
  components: {

  },
  data() {
    return {
      page: 1, limit: 10, isMore: true, keyword: '', catId: 0, internetCafeData: [],
      left_list: [], right_search: [], right_list: []
    }
  },
  computed: {

  },
  created() {},
  mounted() {
    this.loadInternetCafe()
    this.left_list()
  },
  methods: {
    loadInternetCafe() {
      if (!this.isMore) return
      this.isMore = false
      /* findHyitInternetCafe({ page: this.page, limit: this.limit, keyword: this.keyword, catId: this.catId }).then(res => {
        res.data.forEach(element => {
          that.internetCafeData.push(element)
        })
        if (res.data.length === that.limit) {
          that.isMore = true
          that.page += 1
        }
      }).catch(err => {
        console.log(err)
        that.isMore = true
      }) */
    }
  }
}
</script>

