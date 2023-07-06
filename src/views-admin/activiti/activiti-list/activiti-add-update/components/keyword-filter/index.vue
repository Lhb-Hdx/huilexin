<template>
  <div class="py-20">
    <el-divider content-position="left" class="mb-40">
      关键字
      <el-button icon="el-icon-plus" class="ml-10" type="primary" size="small" @click="openKeywordDialog"> 添加关键字,选择关键字 </el-button>
    </el-divider>
    <div class="keyword-select-box mt-20" @click="openKeywordDialog">
      <span v-if="!keyWordList.length" style="color: #999">请选择</span>
      <template v-else>
        <el-tag v-for="(item, index) in keyWordList" :key="item.keyId" closable type="success" class="ml-4 my-4 pointer" @close.stop="deleteKeywordTag(index)">
          {{ item.keyWords }}
        </el-tag>
      </template>
    </div>
    <KeywordDialog ref="KeywordDialog" :select-key-word-list="keyWordList" @updateKeywordList="keyWordList = $event" />
  </div>
</template>

<script>
import KeywordDialog from './components/keyword-dialog'
export default {
  name: 'KeywordFilter',
  components: {
    KeywordDialog
  },
  data() {
    return {
      keyWordList: []
    }
  },
  computed: {
    hyLinkId() {
      return this.$route.query.hyLinkId
    }
  },
  created() {
    this.initData()
  },
  methods: {
    async submit(hyLinkId) {
      try {
        if (this.keyWordList.length) {
          await this.changeLinkageRulesKeywordsMap(this.keyWordList.map(it => it.keyId).filter(Boolean), hyLinkId)
        }
      } catch (error) {
        console.log('error: ', error)
      }
      // const {addList, deleteList} = this.$tool.tableAddDeleteList(this.oldMapList, selection, 'keyId')
      // if (addList.length) await this.changeLinkageRulesKeywordsMap(addList.map(it => it.keyId).filter(Boolean))
      // if (deleteList.length) {
      //   for (const it of deleteList) {
      //     await this.deleteLinkageRulesKeywordsMap(it.keyId)
      //   }
      // }
    },
    async changeLinkageRulesKeywordsMap(keyIds, linkId) {
      const { code } = await this.$request({ url: this.api.linkageManage.changeLinkageRulesKeywordsMap, data: { keyIds, linkId } })
      if (code === 1) return code
    },
    openKeywordDialog() {
      this.$refs.KeywordDialog.open()
    },
    async deleteKeywordTag(index) {
      this.keyWordList.splice(index, 1)
    },
    async initData() {
      if (!this.hyLinkId) return
      const keyList = await this.findLinkageRulesKeywordsMap()
      if (keyList.length) await this.findLinkageRulesKeywords(keyList.map(it => it.keyId).filter(Boolean))
    },
    async findLinkageRulesKeywordsMap() {
      const { data, code } = await this.$request({ url: this.api.linkageManage.findLinkageRulesKeywordsMap, data: { linkId: this.hyLinkId, limit: -1 } })
      if (code === 1) return data
    },
    async findLinkageRulesKeywords(ids) {
      const { data, code } = await this.$request({ url: this.api.linkageManage.findLinkageRulesKeywords, data: { ids, limit: -1 } })
      if (code === 1) this.keyWordList = data
    },
    async deleteLinkageRulesKeywordsMap(keyId) {
      const { code } = await this.$request({ url: this.api.linkageManage.deleteLinkageRulesKeywordsMap, data: { keyId, linkId: this.hyLinkId } })
      if (code === 1) return code
    }
  }
}
</script>

<style scoped lang="scss">
.keyword-select-box {
  border: 1px solid #0145ab;
  border-radius: 5px;
  padding: 8px;
  cursor: pointer;
}
</style>
