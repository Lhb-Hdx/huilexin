<template>
  <div class="file-upload">
    <el-upload :accept="fileType" :http-request="handleRequestUpload" :show-file-list="false" action class="upload-demo">
      <template>
        <el-button :disabled="isDisabled" :size="buttonSize" :type="buttonType">{{ buttonText }}</el-button>
      </template>
    </el-upload>
    <div v-if="showFileUrlList" class="file-list">
      <template v-if="fileUrlListType === 'text' && fileList.length > 0">
        <div v-for="item in fileList" :key="item.id" class="file-list-item text-list pointer flexBox flex-h-center">
          <div class="overflow-text-a file-name">{{ item.name }}</div>
          <div class="file-list-action">
            <i class="el-icon-download pointer" @click="downFile(item)" />
            <i class="el-icon-close pointer ml-2" @click="removeFile(item.id)" />
          </div>
        </div>
      </template>
      <template v-if="fileUrlListType === 'picture' && fileList.length > 0">
        <div v-for="item in fileList" :key="item.id" class="file-list-item picture">
          <img v-if="fileIsPic(item.url) === true" :src="item.url" alt="" style="width: 100%">
          <div v-else class="file-ext">
            <i class="el-icon-paperclip" />
            {{ getFileExt(item.url) }}
          </div>
          <div class="hover-bg">
            <div class="bg-main">
              <i class="el-icon-download pointer" @click="downFile(item)" />
              <i class="el-icon-delete pointer" @click="removeFile(item.id)" />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'FileUpload',
  props: {
    // 限制文件个数
    limit: {
      type: Number,
      default: 1
    },
    // 按钮文案
    buttonText: {
      type: String,
      default: '点击上传'
    },
    // 是否禁用
    buttonDisabled: {
      type: Boolean,
      default: false
    },
    // 是否要限制文件大小
    isLimitFileSize: {
      type: Boolean,
      default: false
    },
    // 限制文字大小 M
    fileMaxSize: {
      type: Number,
      default: 1
    },
    // 文件列表
    fileUrlList: {
      type: Array,
      default() {
        return []
      }
    },
    // 文件格式
    fileType: {
      type: String,
      default: ''
    },
    // 上传按钮大小尺寸 参照el-button size参数
    buttonSize: {
      type: String,
      default: ''
    },
    // 上传按钮类型 参照el-button type参数
    buttonType: {
      type: String,
      default: 'primary'
    },
    // 文件列表类型 text picture
    fileUrlListType: {
      type: String,
      default: 'text'
    },
    showFileUrlList: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isDisabled: false, // 禁用按钮
      fileList: [], // 显示上传文件
      map: [],
      picTypes: ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'psd', 'svg', 'tiff'],
      isPic: false
    }
  },
  computed: {
    fileIsPic() {
      const that = this
      return function (name) {
        // 获取最后一个.的位置
        const index = name.lastIndexOf('.')
        // 获取后缀
        const ext = name.substr(index + 1)
        return that.picTypes.findIndex(item => item === ext) !== -1
      }
    },
    getFileExt() {
      return function (name) {
        // 获取最后一个.的位置
        const index = name.lastIndexOf('.')
        // 获取后缀
        return name.substr(index + 1)
      }
    }
  },
  watch: {
    limit(newVal) {
      this.limit = newVal
    },
    buttonDisabled(newVal) {
      this.isDisabled = newVal
    },
    fileUrlList(newVal) {
      console.log(newVal)
      if (newVal.length > 0) {
        this.setFileList()
      }
    }
  },
  mounted() {
    if (this.buttonDisabled) this.isDisabled = true
    this.setFileList()
  },
  methods: {
    // 设置文件列表
    setFileList() {
      if (this.fileUrlList.length > this.limit) {
        const propFileList = this.fileUrlList.slice(0, this.limit)
        const fileList = []
        propFileList.forEach(fileItem => {
          fileList.push({
            id: fileItem.id ? fileItem.id : this.guid(),
            url: fileItem.url,
            name: fileItem.name
          })
        })
        this.fileList = fileList
      } else {
        const fileList = []
        this.fileUrlList.forEach(fileItem => {
          fileList.push({
            id: fileItem.id ? fileItem.id : this.guid(),
            url: fileItem.url,
            name: fileItem.name
          })
        })
        this.fileList = fileList
      }
    },
    // 删除文件
    removeFile(fileId) {
      setTimeout(() => {
        const idx = this.fileList.findIndex(fileiItem => fileiItem.id === fileId)
        console.log(this.fileList)
        let deleteFile = {}
        if (idx !== -1) {
          deleteFile = this.fileList[idx]
          this.fileList.splice(idx, 1)
        }
        this.$emit('emitFileList', {
          emitType: 'deleteFile',
          deleteFile,
          fileList: this.fileList
        })
      }, 100)
    },
    // 上传文件
    async handleRequestUpload(params) {
      if (this.fileList.length === this.limit) {
        this.$message({
          message: `最多只能上传${this.limit}个文件，请删除文件之后再尝试上传`,
          type: 'warning'
        })
        return
      }
      if (this.isLimitFileSize) {
        // 验证文件大小
        if (params.file.size / 1024 / 1024 > this.fileMaxSize) {
          this.fileList = []
          this.$message({
            message: `上传文件大小不能超过${this.fileMaxSize}M!`,
            type: 'warning'
          })
          return false
        }
      }
      const fileData = new FormData()
      fileData.append('file', params.file)
      let apiName = ''

      // 获取最后一个.的位置
      const index = params.file.name.lastIndexOf('.')
      // 获取后缀
      const ext = params.file.name.substr(index + 1)
      this.isPic = this.picTypes.findIndex(item => item === ext) !== -1
      if (this.isPic) {
        apiName = api.file.uploadPic
      } else {
        apiName = api.file.uploadDocument
      }
      const uploadTokenData = {
        // 后端这个接口还没有去掉这个必填参数，所以传空就可以
        company_id: '',
        app_id: '',
        app_key: '',
        ver: '',
        timestamp: '',
        sign: ''
      }
      request({
        url: apiName,
        data: uploadTokenData,
        form: fileData
      }).then(res => {
        if (res.code === 1) {
          const fileUrl = !this.isPic ? res.map.original : res.map.img
          const fileNameArr = fileUrl.split('/')
          const addFile = {
            id: this.guid(),
            url: !this.isPic ? res.map.original : this.isPic ? res.map.original : '',
            name: res.map.upFileName || fileNameArr[fileNameArr.length - 1]
          }
          this.$set(this.fileList, this.fileList.length, addFile)
          this.$set(this.map, this.map.length, { ...res.map, ...addFile })
          this.$emit('emitFileList', {
            emitType: 'addFile',
            addFile,
            fileList: this.fileList,
            map: this.map
          })
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    /**
     * @description 生成uuid
     * @returns {string}
     */
    guid() {
      return this.S4() + this.S4() + '-' + this.S4() + '-' + this.S4() + '-' + this.S4() + '-' + this.S4() + this.S4() + this.S4()
    },
    S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    },
    downFile(file) {
      const link = document.createElement('a')
      const url = file.url
      // 这里是将url转成blob地址，
      fetch(url)
        .then(res => res.blob())
        .then(blob => {
          // 将链接地址字符内容转变成blob地址
          link.href = URL.createObjectURL(blob)
          console.log(link.href)
          link.download = ''
          document.body.appendChild(link)
          link.click()
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.file-list {
  max-height: 200px;
  overflow-y: auto;
  .file-list-item {
    margin-top: 5px;
    font-size: 14px;
    display: inline-block;
    .file-name {
      width: 70%;
    }
  }
  .text-list {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px;
    &:last-of-type {
      margin-top: 0;
    }
    &:hover {
      background-color: #dee1e7;
    }
  }
  .picture {
    width: 148px;
    height: 148px;
    line-height: 148px;
    img {
      width: 148px;
      height: fit-content;
    }
  }
  .picture {
    background-color: #fff;
    border: 1px solid #c0ccda;
    border-radius: 6px;
    overflow: hidden;
    margin-top: 5px !important;
    margin-right: 5px;
    position: relative;
    .file-ext {
      font-size: 30px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #777777;
    }
    .hover-bg {
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.4);
      color: #fff;
      font-size: 20px;
      .bg-main {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      i {
        margin: 0 2px;
      }
    }
    &:hover .hover-bg {
      display: block;
    }
  }
}
</style>
