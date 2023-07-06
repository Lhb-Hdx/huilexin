<template>
  <div class="editor">
    <codemirror
      :ref="el"
      :value="editorValue"
      :options="cmOptions"
      @changes="onCmCodeChanges"
      @blur="onCmBlur"
      @keydown.native="onKeyDown"
      @mousedown.native="onMouseDown"
      @paste.native="OnPaste"
    />
    <!--    <div class="toolbar pointer">-->
    <!--      <div class="toolbar-item" @click="handlerTheme('showTheme')">-->
    <!--        {{ getCmTheme === 'default' ? '选择主题' : getCmTheme }}-->
    <!--      </div>-->
    <!--      <div class="toolbar-item" @click="handlerMode('showMode')">-->
    <!--        {{ getCmMode === 'default' ? '选择开发语言' : getCmMode }}-->
    <!--      </div>-->
    <!--    </div>-->
    <!--    <div v-if="showTheme" class="select-list">-->
    <!--      <div v-for="(item, index) in cmThemeOptions" :key="index" class="list-item pointer" @click="handlerThemeItem(item)">{{ item }}</div>-->
    <!--    </div>-->
    <!--    <div v-if="showMode" class="select-list">-->
    <!--      <div v-for="(item, index) in cmModeOptions" :key="index" class="list-item pointer" @click="handlerModeItem(item)">{{ item }}</div>-->
    <!--    </div>-->
  </div>
</template>
<script>

import { codemirror } from 'vue-codemirror'
import 'codemirror/theme/blackboard.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/xml/xml.js'
import 'codemirror/mode/htmlmixed/htmlmixed.js'
import 'codemirror/mode/css/css.js'
import 'codemirror/mode/yaml/yaml.js'
import 'codemirror/mode/sql/sql.js'
import 'codemirror/mode/python/python.js'
import 'codemirror/mode/shell/shell.js'
import 'codemirror/mode/markdown/markdown.js'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/javascript-hint.js'
import 'codemirror/addon/hint/xml-hint.js'
import 'codemirror/addon/hint/css-hint.js'
import 'codemirror/addon/hint/html-hint.js'
import 'codemirror/addon/hint/sql-hint.js'
import 'codemirror/addon/hint/anyword-hint.js'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/addon/lint/lint.js'
import 'codemirror/addon/lint/json-lint'
require('script-loader!jsonlint')
import 'codemirror/addon/lint/javascript-lint.js'
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/addon/fold/xml-fold.js'
import 'codemirror/addon/fold/comment-fold.js'
import 'codemirror/addon/fold/markdown-fold.js'
import 'codemirror/addon/fold/indent-fold.js'
import 'codemirror/addon/edit/closebrackets.js'
import 'codemirror/addon/edit/closetag.js'
import 'codemirror/addon/edit/matchtags.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/search/jump-to-line.js'
import 'codemirror/addon/dialog/dialog.js'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/search/searchcursor.js'
import 'codemirror/addon/search/search.js'
import 'codemirror/addon/display/autorefresh.js'
import 'codemirror/addon/selection/mark-selection.js'
import 'codemirror/addon/search/match-highlighter.js'

// 语言模式和js文件配置
const modeCode = [
  { mode: 'python', code: 'python' },
  { mode: 'shell', code: 'shell' },
  { mode: 'sql', code: 'sql' },
  { mode: 'javascript', code: 'javascript' },
  { mode: 'xml', code: 'xml' },
  { mode: 'css', code: 'css' },
  { mode: 'html', code: 'htmlmixed' },
  { mode: 'yaml', code: 'yaml' },
  { mode: 'markdown', code: 'markdown' },
  { mode: 'json', code: 'application/json' }
]

export default {
  name: 'Editor',
  components: {
    codemirror
  },
  props: {
    el: {
      type: String,
      default: 'edit'
    },
    cmTheme: {
      type: String,
      default: 'default'
    },
    cmMode: {
      type: String,
      default: 'default'
    },
    cmThemeOptions: {
      type: Array,
      default() {
        return [
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
        ]
      }
    },
    cmModeOptions: {
      type: Array,
      default() {
        return [
          'default',
          // 'json',
          // 'sql',
          // 'javascript',
          // 'css',
          // 'xml',
          // 'html',
          // 'yaml',
          // 'markdown',
          'python',
          'shell'
        ]
      }
    },
    autoFormatJson: {
      type: Boolean,
      default: false
    },
    jsonIndentation: {
      type: Number,
      default: 2
    },
    isReadOnly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      editorValue: '',
      cmOptions: {
        theme: !this.cmTheme || this.cmTheme === 'default' ? 'blackboard' : this.cmTheme,
        mode: !this.cmMode || this.cmMode === 'default' ? 'application/text' : this.cmMode,
        lineWrapping: true,
        lineNumbers: true,
        autofocus: true,
        smartIndent: false,
        autocorrect: true,
        spellcheck: true,
        readOnly: this.isReadOnly,
        extraKeys: {
          // Tab: 'autocomplete',
          'Ctrl-Alt-L': () => {
            try {
              if (
                this.cmOptions.mode === 'application/json' &&
                this.editorValue
              ) {
                this.editorValue = this.formatStrInJson(
                  this.editorValue
                )
              }
            } catch (e) {
              this.$message.error(
                '格式化代码出错：' + e.toString()
              )
            }
          }
        },
        lint: true,
        gutters: [
          'CodeMirror-lint-markers',
          'CodeMirror-linenumbers',
          'CodeMirror-foldgutter'
        ],
        foldGutter: true,
        autoCloseBrackets: true,
        autoCloseTags: true,
        matchTags: { bothTags: true },
        matchBrackets: true,
        styleActiveLine: true,
        autoRefresh: true,
        highlightSelectionMatches: {
          minChars: 2,
          style: 'matchhighlight',
          showToken: true
        },
        styleSelectedText: true,
        enableAutoFormatJson: this.autoFormatJson == null ? true : this.autoFormatJson,
        defaultJsonIndentation: !this.jsonIndentation || typeof this.jsonIndentation !== typeof 1 ? 2 : this.jsonIndentation
      },
      enableAutoFormatJson: this.autoFormatJson == null ? true : this.autoFormatJson,
      defaultJsonIndentation: !this.jsonIndentation || typeof this.jsonIndentation !== typeof 1 ? 2 : this.jsonIndentation,
      showTheme: false,
      showMode: false,
      getCmTheme: 'default',
      getCmMode: 'default'
    }
  },
  watch: {
    cmTheme: function(newValue, oldValue) {
      this.getCmTheme = this.cmTheme
      this.switchCmTheme()
    },
    cmMode: function(newValue, oldValue) {
      this.getCmMode = this.cmMode
      this.switchCmMode()
    }
  },
  created() {
    try {
      if (!this.editorValue) {
        this.cmOptions.lint = false
        return
      }
      if (this.cmOptions.mode === 'application/json') {
        if (!this.enableAutoFormatJson) {
          return
        }
        this.editorValue = this.formatStrInJson(this.editorValue)
      }
    } catch (e) {
      console.log('初始化codemirror出错：' + e)
    }
  },
  methods: {
    resetLint() {
      if (!this.$refs[`${this.el}`].codemirror.getValue()) {
        this.$nextTick(() => {
          this.$refs[`${this.el}`].codemirror.setOption('lint', false)
        })
        return
      }
      this.$refs[`${this.el}`].codemirror.setOption('lint', false)
      this.$nextTick(() => {
        this.$refs[`${this.el}`].codemirror.setOption('lint', true)
      })
    },
    resetFoldGutter() {
      this.$refs[`${this.el}`].codemirror.setOption('foldGutter', false)
      this.$nextTick(() => {
        this.$refs[`${this.el}`].codemirror.setOption('foldGutter', true)
      })
    },
    // 修改编辑框样式
    setStyle(style) {
      try {
        this.$nextTick(() => {
          let cm = this.$refs[`${this.el}`].$el.querySelector('.CodeMirror')
          if (cm) {
            cm.style.cssText = style
          } else {
            this.$message.error('未找到编辑器元素，修改编辑器样式失败')
          }
        })
      } catch (e) {
        this.$message.error('修改编辑器样式失败：' + e.toString())
      }
    },
    // 获取值
    getValue() {
      try {
        return this.$refs[`${this.el}`].codemirror.getValue()
      } catch (e) {
        let errorInfo = e.toString()
        this.$message.error('获取编辑框内容失败：' + errorInfo)
        return errorInfo
      }
    },
    // 修改值
    setValue(value) {
      try {
        if (typeof value !== typeof '') {
          this.$message.error('修改编辑框内容失败：编辑宽内容只能为字符串')
          return
        }
        if (this.cmOptions.mode === 'application/json') {
          this.editorValue = this.formatStrInJson(value)
        } else {
          this.editorValue = value
        }
      } catch (e) {
        console.log(e)
        this.$message.error('修改编辑框内容失败：' + e.toString())
      }
    },
    // 黏贴事件处理函数
    OnPaste(event) {
      if (this.cmOptions.mode === 'application/json') {
        try {
          this.editorValue = this.formatStrInJson(this.editorValue)
        } catch (e) {
          // 啥都不做
        }
      }
    },
    // 失去焦点时处理函数
    onCmBlur(cm, event) {
      try {
        let editorValue = cm.getValue()
        if (this.cmOptions.mode === 'application/json' && editorValue) {
          if (!this.enableAutoFormatJson) {
            return
          }
          this.editorValue = this.formatStrInJson(editorValue)
        }
      } catch (e) {
        // 啥也不做
      }
    },
    // 按下键盘事件处理函数
    onKeyDown(event) {
      const keyCode = event.keyCode || event.which || event.charCode
      const keyCombination = event.ctrlKey || event.altKey || event.metaKey
      if (!keyCombination && keyCode > 64 && keyCode < 123 && !this.isReadOnly) {
        this.$refs[`${this.el}`].codemirror.showHint({ completeSingle: false })
      }
    },
    // 按下鼠标时事件处理函数
    onMouseDown(event) {
      this.$refs[`${this.el}`].codemirror.closeHint()
    },
    onCmCodeChanges(cm, changes) {
      this.editorValue = cm.getValue()
      this.resetLint()
    },
    // 格式化字符串为json格式字符串
    formatStrInJson(strValue) {
      return JSON.stringify(JSON.parse(strValue), null, this.defaultJsonIndentation)
    },
    // 打开主题
    handlerTheme() {
      this.showTheme = true
      this.showMode = false
    },
    // 打开模式
    handlerMode() {
      this.showMode = true
      this.showTheme = false
    },
    // 选择主题
    handlerThemeItem(i) {
      const cmThemeIndex = this.cmThemeOptions.findIndex(el => el === i)
      if (i !== -1) this.getCmTheme = this.cmThemeOptions[cmThemeIndex]
      this.switchCmTheme()
      this.showTheme = false
    },
    // 选择语言
    handlerModeItem(i) {
      const modeCodeIndex = modeCode.findIndex(el => el.mode === i)
      if (modeCodeIndex !== -1) this.getCmMode = modeCode[modeCodeIndex].code
      this.switchCmMode()
      this.showMode = false
    },
    // 切换主题
    switchCmTheme() {
      try {
        let theme = this.getCmTheme === 'default' ? 'blackboard' : this.getCmTheme
        require('codemirror/theme/' + theme + '.css')
        this.cmOptions.theme = theme
        this.resetLint()
      } catch (e) {
        this.$message.error('切换编辑器主题出错：' + e.toString())
      }
    },
    switchCmMode() {
      this.$set(this.cmOptions, 'mode', this.getCmMode)
      this.resetLint()
      this.resetFoldGutter()
    }
  }
}
</script>
<style lang="scss" scoped>
.CodeMirror-selected {
  background-color: blue !important;
}
.CodeMirror-selectedtext {
  color: white !important;
}
.cm-matchhighlight {
  background-color: #ae00ae;
}
.editor {
  position: relative;
}
.toolbar {
  background: #0b5fb6;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  .toolbar-item {
    padding: 8px 10px;
    font-weight: bold;
    &:hover {
      background: #2b74c8;
    }
  }
  .active {
    background: #2b74c8;
  }
}
.select-list {
  background: #0b5fb6;
  color: #fff;
  position: absolute;
  top: 2%;
  height: 70%;
  overflow: auto;
  width: 50%;
  left: 50%;
  transform: translateX(-50%);
  padding: 5px 0;
  .list-item {
    padding: 5px 10px;
    &:hover {
      background: #2b74c8;
    }
  }
  .active {
    background: #2b74c8;
  }
}
</style>
