<template>
  <div class="code-mirror-div">
    <code-mirror-editor />
  </div>
</template>
<script>
import CodeMirrorEditor from '@/components/CodeMirrorEditor/Editor.vue'

export default {
  name: 'EditorView',
  components: {
    CodeMirrorEditor
  },
  data() {
    return {
      cmTheme: 'default', // codeMirror主题
      // codeMirror主题选项
      cmThemeOptions: [
        'default',
        '3024-day',
        '3024-night',
        'abcdef',
        'ambiance',
        'ayu-dark',
        'ayu-mirage',
        'base16-dark',
        'base16-light',
        'bespin',
        'blackboard',
        'cobalt',
        'colorforth',
        'darcula',
        'dracula',
        'duotone-dark',
        'duotone-light',
        'eclipse',
        'elegant',
        'erlang-dark',
        'gruvbox-dark',
        'hopscotch',
        'icecoder',
        'idea',
        'isotope',
        'lesser-dark',
        'liquibyte',
        'lucario',
        'material',
        'material-darker',
        'material-palenight',
        'material-ocean',
        'mbo',
        'mdn-like',
        'midnight',
        'monokai',
        'moxer',
        'neat',
        'neo',
        'night',
        'nord',
        'oceanic-next',
        'panda-syntax',
        'paraiso-dark',
        'paraiso-light',
        'pastel-on-dark',
        'railscasts',
        'rubyblue',
        'seti',
        'shadowfox',
        'solarized dark',
        'solarized light',
        'the-matrix',
        'tomorrow-night-bright',
        'tomorrow-night-eighties',
        'ttcn',
        'twilight',
        'vibrant-ink',
        'xq-dark',
        'xq-light',
        'yeti',
        'yonce',
        'zenburn'
      ],
      cmEditorMode: 'default', // 编辑模式
      // 编辑模式选项
      cmEditorModeOptions: [
        'default',
        'json',
        'sql',
        'javascript',
        'css',
        'xml',
        'html',
        'yaml',
        'markdown',
        'python',
        'shell'
      ],
      cmMode: 'application/json', // codeMirror模式
      jsonIndentation: 2, // json编辑模式下，json格式化缩进 支持字符或数字，最大不超过10，默认缩进2个空格
      autoFormatJson: true // json编辑模式下，输入框失去焦点时是否自动格式化，true 开启， false 关闭
    }
  },
  methods: {
    // 切换编辑模式事件处理函数
    onEditorModeChange(value) {
      switch (value) {
        case 'json':
          this.cmMode = 'application/json'
          break
        case 'sql':
          this.cmMode = 'sql'
          break
        case 'javascript':
          this.cmMode = 'javascript'
          break
        case 'xml':
          this.cmMode = 'xml'
          break
        case 'css':
          this.cmMode = 'css'
          break
        case 'html':
          this.cmMode = 'htmlmixed'
          break
        case 'yaml':
          this.cmMode = 'yaml'
          break
        case 'markdown':
          this.cmMode = 'markdown'
          break
        case 'python':
          this.cmMode = 'python'
          break
        case 'shell':
          this.cmMode = 'shell'
          break
        default:
          this.cmMode = 'application/json'
      }
    },
    // 获取内容
    getValue() {
      let content = this.$refs.cmEditor.getValue()
      console.log(content)
    },
    // 修改内容
    setValue() {
      let jsonValue = {
        name: 'laiyu',
        addr: '广东省深圳市',
        other: 'nothing',
        tel: '168888888',
        intro: [{ item1: 'item1' }]
      }
      this.$refs.cmEditor.setValue(JSON.stringify(jsonValue))
    }
  }
}
</script>

<style>
/*.CodeMirror {*/
/*   position: absolute;*/
/*   top: 80px;*/
/*   left: 2px;*/
/*   right: 5px;*/
/*   bottom: 0px;*/
/*   padding: 2px;*/
/*   height: auto;*/
/*   overflow-y: auto;*/
/*}*/

</style>
<style lang="scss" scoped>
.code-mirror-div {
   //position: absolute;
   //top: 0px;
   //left: 2px;
   //right: 5px;
   //bottom: 0px;
   padding: 2px;
   .tool-bar {
    top: 20px;
    margin: 30px 2px 0px 20px;
   }
}
</style>
