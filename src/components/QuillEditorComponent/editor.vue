<template>
  <div>
    <!-- 图片上传组件辅助-->
    <el-upload
      id="quill-upload"
      class="avatar-uploader"
      accept=".png,.jpg"
      action
      :http-request="upload"
      name="img"
      :show-file-list="false"
      multiple
      style="display: none"
    />
    <!--富文本编辑器组件-->
    <quill-editor
      ref="myQuillEditor"
      v-model="editorContent"
      :options="editorOption"
      @change="onEditorChange($event)"
    />
  </div>
</template>
<script>
import { quillEditor } from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import api from '@/api/api'
import request from '@/utils/request'

// 工具栏配置
const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'], // toggled buttons
  ['blockquote', 'code-block'],
  [{ 'header': 1 }, { 'header': 2 }], // custom button values
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  [{ 'script': 'sub' }, { 'script': 'super' }], // superscript/subscript
  [{ 'indent': '-1' }, { 'indent': '+1' }], // outdent/indent
  [{ 'direction': 'rtl' }], // text direction
  [{ 'size': ['small', false, 'large', 'huge'] }], // custom dropdown
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'color': [] }, { 'background': [] }], // dropdown with defaults from theme
  [{ 'font': [] }],
  [{ 'align': [] }],
  ['link', 'image'],
  ['clean'] // remove formatting button
]

export default {
  components: { quillEditor },
  props: {
    placeholder: { type: String, default: '' }
  },
  data() {
    return {
      editorContent: '', // 富文本内容
      editorOption: {
        placeholder: this.placeholder,
        theme: 'snow', // or 'bubble'
        modules: {
          toolbar: {
            container: toolbarOptions, // 工具栏
            handlers: {
              'image': function(value) {
                if (value) {
                  document.querySelector('#quill-upload input').click()
                } else {
                  this.quill.format('image', false)
                }
              }
            }
          }
        }
      },
      uploadToken: { // 后端这个接口还没有去掉这个必填参数，所以传空就可以
        company_id: '',
        app_id: '',
        app_key: '',
        ver: '',
        timestamp: '',
        sign: ''
      },
      BASE_API: process.env.VUE_APP_BASE_API
    }
  },
  watch: {
    '$attrs.value'(n) {
      if (!n) {
        this.editorContent = ''
      }
      this.editorContent = n
    }
  },
  methods: {
    // 派发输入内容
    onEditorChange() {
      this.$emit('input', this.editorContent)
    },
    // 上传图片
    upload(obj) {
      const form = new FormData()
      form.append('file', obj.file)
      request({
        url: api.file.uploadPic, data: this.uploadToken, form: form
      }).then(res => {
        // res为图片服务器返回的数据
        // 获取富文本组件实例
        console.log(this.BASE_API)
        const quill = this.$refs.myQuillEditor.quill
        // 如果上传成功
        if (res.code === 1) {
          // 获取光标所在位置
          const length = quill.getSelection().index
          // 插入图片  res.info为服务器返回的图片地址
          quill.insertEmbed(length, 'image', this.BASE_API + res.map.original)
          // 调整光标到最后
          quill.setSelection(length + 1)
        } else {
          this.$message.error('图片插入失败')
        }
      })
    }
  }
}
</script>
