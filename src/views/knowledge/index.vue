<template>
  <div class="full-main">
    <div class="left">
      <div class="content">
        <div class="knowledgeItem">
          <knowledge-item :item-data="findHyitKnowData" @getHyKonwId="getHyKonwId($event)" />
          <pagination v-show="findHyitKnowTotal > 0" :auto-scroll="false" :total="findHyitKnowTotal" :page.sync="findHyitKnowQuery.page" :limit.sync="findHyitKnowQuery.limit" @pagination="findHyitKnow" />
        </div>
        <!-- <div v-if="displayKnowledge== 0" class="knowledgeDetail">
          <knowledge-Detail :item-id="hKonwId" @goKnowLedgeItem="goKnowLedgeItem($event)" />
        </div> -->
      </div>
    </div>
    <div class="right">
      <knowledge-screen :jump-judgment="jumpJudgment" @getScreenData="getScreenData" />
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import KnowledgeItem from './components/knowledge-item'
import Pagination from '@/components/Pagination'
import KnowledgeScreen from './components/knowledge-screen'
// import KnowledgeDetail from './components/knowledge-detail'
export default {
  name: 'Knowledge',
  components: {
    KnowledgeItem, Pagination, KnowledgeScreen
    // , KnowledgeDetail
  },
  data() {
    return {
      findHyitKnowQuery: {
        keywords: '',
        hyktId: '',
        page: 1,
        limit: 10,
        hyStatus: 1
      },
      findHyitKnowTotal: 0,
      findHyitKnowData: [],
      jumpJudgment: 0
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      const queryForm = {}
      Object.keys(this.findHyitKnowQuery).forEach(key => {
        queryForm[key] = pageQuery[key]
      })
      this.findHyitKnowQuery = queryForm
    }
    const hyktId = this.$route.query.hyktId
    const searchWords = this.$route.query.searchWords
    if (hyktId || searchWords) {
      this.$set(this.findHyitKnowQuery, 'hyktId', hyktId)
      this.$set(this.findHyitKnowQuery, 'keywords', searchWords)
    }
  },
  mounted() {
    this.findHyitKnow()
  },
  methods: {
    findHyitKnow() {
      request({
        url: api.knowledge.findHyitKnow,
        data: { ...this.findHyitKnowQuery }
      }).then(res => {
        if (res.code === 1) {
          this.findHyitKnowData = res.data
          this.findHyitKnowTotal = Number(res.count)
        }
      })
    },
    getScreenData(val) {
      this.$set(this.findHyitKnowQuery, 'keywords', val.searchWords)
      this.$set(this.findHyitKnowQuery, 'hyktId', val.hyktId)
      this.findHyitKnow()
    },
    getHyKonwId(e) {
      const data = { ...this.findHyitKnowQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'KnowledgeBaseDetail',
        query: {
          id: Number(e)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
body {
  background-color: #f5f5f5;
}
.full-main {
  .left{
    float: left;
    width: 75%;
    .content{
      padding:10px
    }
  }
  .right{
    background-color:#e9ecf3;
    width: 25%;
    float: right;
    position: fixed;
    right: 0;
    height: 100%;
  }
}
</style>

