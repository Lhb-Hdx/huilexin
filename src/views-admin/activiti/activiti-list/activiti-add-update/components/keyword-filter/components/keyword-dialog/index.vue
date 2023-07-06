<template>
  <el-dialog
    title="选择关键字"
    :visible.sync="dialogVisible"
    width="width"
  >
    <div class="flex-h-center">
      <el-input v-model="keyword" placeholder="请输入关键字" style="width:200px" />
      <el-button type="success" class="ml-10" @click="onAdd">添加</el-button>
    </div>
    <div class="mt-20">
      <el-tag
        v-for="(item) in keyWordList"
        :key="item.keyId"
        closable
        type="success"
        class="ml-4 my-4 pointer"
        :class="[item.selected?'active':'']"
        @close.stop="deleteKeywordTag(item)"
        @click="onSelect(item)"
      >
        {{ item.keyWords }}
      </el-tag>
    </div>
    <div slot="footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'KeywordDialog',
  props: {
    selectKeyWordList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      keyword: '',
      keyWordList: []
    }
  },
  computed: {
    hyLinkId() {
      return this.$route.query.hyLinkId
    }
  },
  methods: {
    onSubmit() {
      const selection = this.keyWordList.filter(it => it.selected)
      this.$emit('updateKeywordList', selection)
      this.dialogVisible = false
    },
    onSelect(item) {
      this.$set(item, 'selected', !item.selected)
    },
    async deleteKeywordTag(item) {
      try {
        await this.$confirm('确定删除此关键字吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const code = await this.deleteLinkageRulesKeywords(item.keyId)
        if (code === 1) this.$message.success('删除成功')
        else this.$message.error('删除失败')
        await this.initData()
      } catch (error) {
        console.log('error: ', error)
      }
    },
    async open() {
      await this.initData()
      this.dialogVisible = true
    },
    async initData() {
      let keyList = await this.findLinkageRulesKeywords()
      for (const it of keyList) {
        const idx = this.selectKeyWordList.find(item => +it.keyId === +item.keyId)
        if (idx)it.selected = true
      }
      this.keyWordList = keyList
    },
    // !新增关键字
    async onAdd() {
      if (!this.keyword) return this.$message.error('请输入关键字')
      const {code} = await this.insertLinkageRulesKeywords()
      if (code !== 1) this.$message.error('添加失败')
      else this.$message.success('添加成功')
      this.keyword = ''
      this.initData()
    },
    async insertLinkageRulesKeywords() {
      const {model, code} = await this.$request({url: this.api.linkageManage.insertLinkageRulesKeywords, data: {keyWords: this.keyword}})
      if (code === 1) return {model, code}
    },
    async findLinkageRulesKeywords() {
      const {data, code} = await this.$request({url: this.api.linkageManage.findLinkageRulesKeywords, data: {limit: -1}})
      if (code === 1) return data
    },
    async deleteLinkageRulesKeywords(keyId) {
      const { code} = await this.$request({url: this.api.linkageManage.deleteLinkageRulesKeywords, data: {keyId}})
      if (code === 1) return code
    }
  }
}
</script>

<style scoped>
.active{
  border:1px solid #0145ab !important;
}
.pointer{
  user-select:none;
}
</style>
