<template>
  <div>
    <div class="left2">
      <div class="page-nav">
        <el-page-header :content="navTitle" @back="goBack" />
      </div>
      <div class="leftBox">
        <div class="left_title">{{ getKnowled.hyKnowName }}</div>
        <div class="Subframe">
          <div class="left_type">类别：
            <div v-for="(element1,index1) in knowledgeTypes" :key="index1" class="left_type_text">
              <div v-if="getKnowled.hyKtId == element1.catId">
                {{ element1.catName }}
              </div>
            </div>
          </div>
          <div class="left_time">发表时间：{{ getKnowled.hyUtime }}</div><br>
        </div>
        <div class="left_p" v-html="getKnowled.hyKtxt" />
        <div class="left_p" style="padding-bottom: 0">
          <h3>附件列表</h3>
          <el-table :data="knowFile" fit highlight-current-row style="width: 100%;">
            <el-table-column label="NO" prop="id" type="index" width="60" />
            <el-table-column label="名称" prop="hyFileName" />
            <el-table-column label="大小" prop="hyFileSize" width="100" />
            <el-table-column label="格式" prop="hyFileType" width="100" />
            <el-table-column label="操作" align="center" width="120" class-name="small-padding fixed-width">
              <template slot-scope="{row}">
                <el-link v-permission="['DownloadAttachment']" target="_blank" :href="row.hyFileAddr" :underline="false">
                  <el-button size="mini" type="primary">下载</el-button>
                </el-link>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="divider" />
        <div class="kewordBox">
          <div class="keyword_title">相关关键词</div>
          <div class="keywords">
            <div v-for="(item,index) in customKeywords" :key="index">
              <div class="keyword">{{ item }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'KnowledgeSee',
  data() {
    return {
      knowledgeTypes: [], getKnowled: [], customKeywords: [], knowFile: [], knowId: '',
      findHyitKnowQuery: {
        keywords: '',
        hyktId: '',
        page: 1,
        limit: 10
      }
    }
  },
  computed: {
    navTitle() {
      return this.$route.meta.title
    },
    itemId() {
      return this.$route.query.hyKnowId
    }
  },
  created() {
    // this.knowId = this.$route.params.id
    this.loadInternetCafe()
  },
  mounted() {
    this.loadKnowFile()
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    // 页面信息
    loadInternetCafe() {
      // 查看知识库点
      request({
        url: api.knowledge.getHyitKnow,
        data: { hyKnowId: this.itemId }
      }).then(res => {
        this.getKnowled = res.model
        this.customKeywords = this.getKnowled.hyKeyword.split(',')
      })

      // 查询知识类型
      request({
        url: api.sys.findSysCat,
        data: { systemName: 'kbms', classify: 'kbms_know_type', pid: 10 }
      }).then(res => {
        res.data.forEach(element => {
          this.knowledgeTypes.push(element)
        })
      })
    },
    loadKnowFile() {
      request({
        url: api.knowledge.findHyitKnowFile,
        data: { hyOid: this.itemId }
      })
        .then(res => {
          this.knowFile = res.data
        })
    },
    getScreenData(val) {
      this.$set(this.findHyitKnowQuery, 'keywords', val.searchWords)
      this.$set(this.findHyitKnowQuery, 'hyktId', val.itemId)
      this.findHyitKnow()
    },
    goKnowLedgeItem() {
      this.$tool.getPageQuery(`${this.$route.name}`)
      this.$emit('goKnowLedgeItem', 1)
    }
  }

}
</script>
<style lang="scss">
.left2{
  .page-nav{background:#f9f9f9;cursor: pointer;font-size: 20px;margin-right: 1%;}
  .leftBox{padding:10px 20px;background:#f9f9f9;width: 99%;margin-bottom: 2px;height: auto;}
  .left_title{font-size: 24px;margin: 0px 0 25px 20px;}
  .Subframe{
    margin:0 0 25px 0;
    .left_type,.left_time{font-size: 16px;color: #999999;display:inline;padding: 0 20px;float: left;}
    .left_type{.left_type_text{float: right;}}
  }
  .left_p{font-size: 16px;color: #000000;padding: 0 0 35px 20px;line-height:24px;
    -webkit-margin-before: 0em;
    -webkit-margin-after: 0em;
  }
  .kewordBox{padding: 35px 0 0 20px;color: #333333;
    .keyword_title{font-size: 16px;}
    .keywords{display: flex;font-size: 14px;
      .keyword{border-radius: 12px;margin: 20px 10px 0 0;padding: 5px 20px 5px 20px;background-color: rgb(216, 216, 216);width: auto;}
    }

  }
}
</style>
<style>
.leftBox .left_p >p >img{
  display: block;
  margin: 0 auto;
}
</style>
