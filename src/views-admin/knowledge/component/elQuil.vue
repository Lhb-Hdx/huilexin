<template>
  <div>
    <quilleditor
      ref="myTextEditor"
      v-model="courseInfo.description"
      :options="editorOption"
      style="height:400px;"
      @change="onChange"
    >
      <div id="toolbar" slot="toolbar">

        <!-- <select class="ql-size" title="字体大小">
              <option value="small"></option>
              <option selected></option>
              <option value="large"></option>
              <option value="huge"></option>
            </select> -->

        <!--颜色种类自己添加-->
        <!-- <select class="ql-color" title="字体颜色">
              <option value="red"></option>
              <option value="black" selected></option>
              <option value="yellow"></option>
              <option value="blue"></option>
              <option value="#003366"></option>
              <option value="#148866"></option>
            </select> -->
        <!-- <select class="ql-background" value="background" title="背景颜色"></select> -->
        <!-- <select class="ql-align" value="align" title="对齐"></select> -->

        <!-- 上标和标按钮 -->
        <span class="ql-formats">
          <button type="button" class="ql-bold" title="加粗" />
        </span>
        <span class="ql-formats">
          <button type="button" class="ql-italic" title="斜体" />
        </span>
        <span class="ql-formats">
          <button class="ql-underline" title="下划线" />
        </span>
        <!-- <span class="ql-formats">
            <button class="ql-strike" title="删除线"></button>
            </span> -->
        <span class="ql-formats">
          <button class="ql-script" value="super" title="上标" />
        </span>
        <span class="ql-formats">
          <button class="ql-script" value="sub" title="下标" />
        </span>
        <span class="ql-formats">
          <button type="button" class="ql-blockquote" title="引用" />
        </span>
        <span class="ql-formats">
          <button type="button" class="ql-list" value="ordered" title="有序列表" />
        </span>
        <span class="ql-formats">
          <button type="button" class="ql-list" value="bullet" title="无序列表" />
        </span>
        <span class="ql-formats">
          <button type="button" class="ql-link" title="超链接" />
        </span>
        <!-- <span class="ql-formats">
              <button class="ql-code-block" title="代码"></button>
            </span> -->
        <!-- 图片上传按钮 -->
        <span class="ql-formats" title="上传图片">
          <button type="button" style="outline:none" @click="imgClick">
            <svg viewBox="0 0 18 18">
              <rect class="ql-stroke" height="10" width="12" x="3" y="4" />
              <circle class="ql-fill" cx="6" cy="7" r="1" />
              <polyline
                class="ql-even ql-fill"
                points="5 12 5 11 7 9 8 10 11 7 13 9 13 12 5 12"
              />
            </svg>
          </button>
        </span>
        <!-- 视频上传按钮 -->
        <!-- <span class="ql-formats" title="视频上传">
              <button type="button" class="ql-video"></button>
            </span> -->
      </div>
    </quilleditor>
  </div>
</template>
<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { quillEditor } from 'vue-quill-editor'
import axios from 'axios'

export default {
  name: 'VEditor',
  components: {
    'quilleditor': quillEditor
  },
  props: {
    // eslint-disable-next-line vue/require-default-prop
    value: {
      type: String
    },
    /* 上传图片的file控件name*/
    fileName: {
      type: String,
      default: 'file'
    },
    maxUploadSize: {
      type: Number,
      default: 1024 * 1024
    }
  },
  data() {
    return {
      uploadToken: { // 后端这个接口还没有去掉这个必填参数，所以传空就可以
        company_id: '',
        app_id: '',
        app_key: '',
        ver: '',
        timestamp: '',
        sign: ''
      },
      courseInfo: { // 内容
        description: ''
      },
      editorOption: {
        modules: {
          toolbar: '#toolbar'
        }
      }
    }
  },
  computed: {
    editor() {
      return this.$refs.myTextEditor.quill
    }
  },
  watch: {
    value(newVal, oldVal) { // 视图钩子函数，显示内容
      // console.log(newVal)
      if (this.editor) {
        if (newVal !== this.courseInfo.description) {
          this.courseInfo.description = newVal
        }
      }
    }
  },
  mounted() {
    this.courseInfo.description = this.value
  },
  methods: {
    onChange() { // 组件通讯$on/$emit
      this.$emit('input', this.courseInfo.description)
      // console.log(this.content)
    },
    /* 选择上传图片切换*/
    onFileChange(param) {
      // console.log(param.target.files[0])//获取上传内容，判断排除
      var fileInput = param.target
      if (fileInput.files.length === 0) {
        return
      }
      this.editor.focus()
      if (fileInput.files[0].size > this.maxUploadSize) {
        this.$message.error('图片不能大于1MB')
        return
      }
      var fdata = new FormData()
      fdata.append(this.fileName, fileInput.files[0])
      const service = axios.create({
        baseURL: 'http://resource.huiyuntc.net', // url = base url + request url
        withCredentials: true, // send cookies when cross-domain requests
        timeout: 10000 // request timeout
      })
      // console.log(this.uploadToken)//授权内容
      Object.keys(this.uploadToken).forEach(key => fdata.append(key, (this.uploadToken[key] && this.uploadToken[key] != null && this.uploadToken[key] !== 'null' ? this.uploadToken[key] : '')))
      service.post('/admin/uploadPic', fdata).then(res => {
        // console.log(res.data.map);
        if (res.data) {
          this.editor.insertEmbed(
            this.editor.getSelection().index,
            'image',
            res.data.map.website + res.data.map.original // "url" 对应后台返回的图片地址对应的key
          )
        }
      })
    },
    // /*点击上传图片按钮*/
    imgClick() {
      /* 内存创建input file*/
      var input = document.createElement('input')
      input.type = 'file'
      input.name = this.fileName
      input.accept = 'image/jpeg,image/png,image/jpg,image/gif'
      input.onchange = this.onFileChange
      input.click()
    }
  }
}

</script>
<style>
.ql-editor{
  height: 300px;
}
.ql-container.ql-snow{
  height: 305px;
}
</style>
