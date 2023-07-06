<template>
  <div>
    <div v-if="wiringList.length > 0" class="table-wrapper">
      <el-table
        ref="table"
        :data="wiringList"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="From" prop="hostFrom" show-overflow-tooltip />
        <el-table-column label="端口号" prop="port" show-overflow-tooltip />
        <el-table-column label="机柜" prop="cabinet2" show-overflow-tooltip />
        <el-table-column label="To" prop="hostTo" show-overflow-tooltip />
        <el-table-column label="端口号" prop="port2" show-overflow-tooltip />
        <el-table-column label="备注" prop="backup" show-overflow-tooltip />
      </el-table>
      <pagination
        v-show="wiringTotal > 0"
        :total="wiringTotal"
        :page.sync="findEsightLineQuery.page"
        :limit.sync="findEsightLineQuery.limit"
        :auto-scroll="false"
        @pagination="findEsightLine"
      />
    </div>
    <el-empty v-else description="暂无数据" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'

export default {
  components: { Pagination },
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
      wiringList: [],
      findEsightLineQuery: {
        keyword: '',
        page: 1,
        limit: 10
      },
      wiringTotal: 0
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$set(this.findEsightLineQuery, 'keyword', this.item.description)
      this.findEsightLine()
    }
    )
  },
  methods: {
    // 查询布线表
    findEsightLine() {
      this.$request({
        url: this.api.itMonitor.findEsightLine,
        data: this.findEsightLineQuery
      }).then(res => {
        if (res.code === 1) {
          this.wiringList = res.data
          this.wiringTotal = +res.count
        }
      })
    }
  }
}

</script>

<style lang="scss" scoped>
  .table-wrapper {
    padding-top: 10px;
  }
</style>

