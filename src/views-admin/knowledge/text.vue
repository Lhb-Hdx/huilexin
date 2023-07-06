<template>
  <div>
    <quilleditor
      ref="myTextEditor"
      v-model="content"
      :options="editorOption"
      @change="onChange"
    >
      <div id="toolbar" slot="toolbar">
        <select class="ql-size">
          <option value="small" />
          <!-- Note a missing, thus falsy value, is used to reset to default -->
          <option selected />
          <option value="large" />
          <option value="huge" />
        </select>
        <!-- Add subscript and superscript buttons -->
        <span class="ql-formats"><button class="ql-script" value="sub" /></span>
        <span class="ql-formats"><button class="ql-script" value="super" /></span>
        <span class="ql-formats"><button type="button" class="ql-bold" /></span>
        <span class="ql-formats"><button type="button" class="ql-italic" /></span>
        <span class="ql-formats"><button type="button" class="ql-blockquote" /></span>
        <span class="ql-formats"><button type="button" class="ql-list" value="ordered" /></span>
        <span class="ql-formats"><button type="button" class="ql-list" value="bullet" /></span>
        <span class="ql-formats"><button type="button" class="ql-link" /></span>
        <span class="ql-formats">
          <button type="button" style="outline:none" @click="imgClick">
            <svg viewBox="0 0 18 18"> <rect class="ql-stroke" height="10" width="12" x="3" y="4" /> <circle
              class="ql-fill"
              cx="6"
              cy="7"
              r="1"
            /> <polyline
              class="ql-even ql-fill"
              points="5 12 5 11 7 9 8 10 11 7 13 9 13 12 5 12"
            /> </svg>
          </button>
        </span>
        <!-- <span class="ql-formats"><button type="button" class="ql-video"></button></span> -->
      </div>
    </quilleditor>
  </div>
</template>
<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import axios from 'axios'
import { quillEditor } from 'vue-quill-editor'

export default {
  components: {
    'quilleditor': quillEditor
  },
  // name: "v-editor",
  props: {
    // eslint-disable-next-line vue/require-default-prop
    value: {
      type: String
    },
    /* 上传图片的地址*/
    // uploadUrl: {
    //   type: String,
    //   default: 'https://resource.huiyuntc.net:8336/admin/uploadPic'
    // },
    /* 上传图片的file控件name*/
    fileName: {
      type: String,
      default: 'file'
    },
    maxUploadSize: {
      type: Number,
      default: 1024 * 1024 * 500
    }
  },
  data() {
    return {
      content: '',
      editorOption: {
        modules: {
          toolbar: '#toolbar'
        }
      },
      uploadToken: { // 后端这个接口还没有去掉这个必填参数，所以传空就可以
        company_id: '',
        app_id: '',
        app_key: '',
        ver: '',
        timestamp: '',
        sign: ''
      }
    }
  },
  computed: {
    editor() {
      return this.$refs.myTextEditor.quill
    }
  },
  watch: {
    'value'(newVal, oldVal) {
      if (this.editor) {
        if (newVal !== this.content) {
          this.content = newVal
        }
      }
    }
  },
  mounted() {
    this.content = this.value
  },
  methods: {
    onChange() {
      this.$emit('input', this.content)
    },
    /* 选择上传图片切换*/
    onFileChange(e) {
      console.log(e.target.files[0])
      var fileInput = e.target
      if (fileInput.files.length === 0) {
        return
      }
      this.editor.focus()
      if (fileInput.files[0].size > this.maxUploadSize) {
        this.$alert('图片不能大于500KB', '图片尺寸过大', {
          confirmButtonText: '确定',
          type: 'warning'
        })
      }

      var fdata = new FormData()
      fdata.append('file', e.target.files[0])
      console.log(fdata)
      const service = axios.create({
        baseURL: 'https://resource.huiyuntc.net:8336', // url = base url + request url
        withCredentials: true, // send cookies when cross-domain requests
        timeout: 10000 // request timeout
      })

      Object.keys(this.uploadToken).forEach(key => fdata.append(key, (this.uploadToken[key] && this.uploadToken[key] != null && this.uploadToken[key] !== 'null' ? this.uploadToken[key] : '')))
      service.post('/admin/uploadPic', fdata).then(res => {
        if (res.data) {
          console.log(res.data)
          // this.editor.insertEmbed(this.editor.getSelection().index, 'image', res.data)
        }
      })
    },
    /* 点击上传图片按钮*/
    imgClick() {
      // if (!this.uploadUrl) {
      //   console.log('no editor uploadUrl');
      //   return;
      // }
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
