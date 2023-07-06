<template>
  <div class="document">
    <h3 v-if="fileList.length > 0" class="under-line font-16 mb-10">过程文档</h3>
    <el-row :gutter="20">
      <el-col v-for="item in fileList" :key="item.id" :span="6">
        <div class="document-list-item">
          <img src="image/opm/file-default-icon.png" alt="">
          <div class="font-14 linear-1 document-name">{{ item.name }}</div>
          <div class="mt-10 font-14">
            <el-link v-down="item.url" type="primary">下载文档</el-link>
            <el-link type="primary" class="ml-6" @click="onDeleteFile(item)">删除</el-link>
          </div>
        </div>
      </el-col>
      <el-col v-if="info.matter.statue !== 7" :span="6">
        <div class="document-upload">
          <div class="document-upload-main pointer" @click="onUploadDocument">
            <div class="main-button">
              <i class="el-icon-plus font-60" />
              <h2 class="mt-20">上传文档</h2>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <FileUpload
      ref="uploadComponent"
      style="display: none"
      button-text="点击上传"
      upload-type="pic"
      :limit="10"
      :button-disabled="false"
      :is-limit-file-size="true"
      :file-max-size="1"
      button-type="primary"
      @emitFileList="getEmitFileList"
    />
    <!-- <el-empty v-if="!fileList.length" description="暂无过程文档" /> -->
  </div>
</template>

<script>
import FileUpload from '@/components/Upload/file-upload'
import request from '@/utils/request'
import api from '@/api/api'

export default {
  components: {
    FileUpload
  },
  props: {
    info: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      fileList: [],
      loginUser: {}
    }
  },
  computed: {
    id() {
      return this.$route.query.id
    }
  },
  async mounted() {
    this.loginUser = this.localStorageOperation('get', 'userInfo')
    await this.loadFileList()
  },
  methods: {
    // 加载文件列表
    async loadFileList() {
      // userId: this.loginUser.userId,
      let { code, data } = await request({
        url: api.opm.findOpsOrderFile,
        data: { type: 3, orderType: 1, linkId: this.id }
      })
      if (code !== 1) return
      this.fileList = []
      data.forEach(item => {
        this.$set(this.fileList, this.fileList.length, {
          url: item.fileUrl,
          id: item.id,
          name: item.fileName
        })
      })
    },
    // 点击上传文件
    onUploadDocument() {
      // 点击上传按钮去触发上传
      document.querySelector('.file-upload input').click()
    },
    // 上传组件emit方法
    async getEmitFileList(file) {
      if (file.emitType === 'addFile') {
        let { code } = await request({
          url: api.opm.insertOpsOrderFile,
          data: { type: 3, orderType: 1, userId: this.loginUser.userId, linkId: this.id, fileUrl: file.addFile.url, fileName: file.addFile.name }
        })
        if (code !== 1) return
        await this.loadFileList()
        this.$message({
          type: 'success',
          message: '上传成功'
        })
      }
    },
    // 删除文件
    async onDeleteFile(item) {
      this.$confirm('确定删除这个文件吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        let { code } = await request({
          url: api.opm.deleteOpsOrderFile,
          data: { id: item.id }
        })
        if (code !== 1) return
        await this.loadFileList()
        this.$message({
          type: 'success',
          message: '删除成功'
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.document {
  .document-list-item,
  .document-upload {
    text-align: center;
    height: 200px;
    margin: 16px 0;
  }
  .document-list-item {
    .document-icon {
    }
    .document-name {
      margin: 10px 0;
      color: #999;
    }
    .document-action {
      .action-item {
      }
    }
  }
  .document-upload {
    display: flex;
    align-items: center;
    .document-upload-main {
      border: #e5ecf6 3px dotted;
      width: 180px;
      height: 180px;
      color: #999;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
