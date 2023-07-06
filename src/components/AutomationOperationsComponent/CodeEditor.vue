<template>
  <textarea :ref="el" />
</template>

<script>
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/hint/show-hint.css'
const CodeMirror = require('codemirror/lib/codemirror')
require('codemirror/addon/edit/matchbrackets')
require('codemirror/addon/selection/active-line')
require('codemirror/mode/sql/sql')
require('codemirror/addon/hint/show-hint')
require('codemirror/addon/hint/sql-hint')
import 'codemirror/theme/lesser-dark.css'

export default {
  name: 'CodeEditor',
  props: {
    el: {
      type: String,
      default: 'edit'
    },
    width: {
      type: [Number, String],
      default: '100%'
    },
    height: {
      type: [Number, String],
      default: 400
    },
    readOnly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      codeMirror: null
    }
  },
  methods: {
    async initCodeMirror() {
      if (!this.$refs[`${this.el}`]) return
      this.codeMirror = CodeMirror.fromTextArea(this.$refs[`${this.el}`], {
        theme: 'lesser-dark',
        indentWithTabs: true,
        smartIndent: true,
        lineNumbers: true,
        matchBrackets: true,
        readOnly: this.readOnly ? 'nocursor' : ''
      })
      this.codeMirror.setSize(this.width, this.height)
    }
  }
}
</script>
