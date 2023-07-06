<template>
  <div id="card" ref="shellWindow" class="shell-window" :style="{ 'max-height': adaptHeight ? adaptHeightValue + 'px' : '', 'min-height': adaptHeight ? adaptHeightValue + 'px' : '' }" @click="autofocus">
    <div ref="cmdInput" class="cmd-input">
      <ul id="ul">
        <li v-for="(i,b) in total" :key="b">{{ i }}<br></li>
      </ul>
      <el-input
        v-if="showInput"
        ref="cmdTextInput"
        v-model="command"
        v-loading="loading"
        type="text"
        class="input_text"
        resize="none"
        autofocus="autofocus"
        @keyup.enter.native="enter()"
      >
        <span slot="prepend" style="font-size:18px">></span>
      </el-input>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShellWindow',
  directives: {
    focus: {
      inserted: function(el, { value }) {
        console.log(el, { value })
        if (value) {
          el.focus()
        }
      }
    }
  },
  props: {
    loginServerInfo: {
      type: Object,
      default() {
        return {}
      }
    },
    shellResultMsg: {
      type: String,
      default: ''
    },
    showInput: {
      type: Boolean,
      default: true
    },
    adaptHeight: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      command: '',
      loading: false,
      total: [],
      adaptHeightValue: 0
    }
  },
  watch: {
    shellResultMsg: {
      handler(newVal, oldVal) {
        if (newVal) this.$set(this.total, this.total.length, `${newVal}`)
        this.$nextTick(() => {
          this.$refs.shellWindow.scrollTop = this.$refs.cmdInput.offsetHeight + 40
        })
      },
      deep: true
    }
  },
  mounted() {
    if (this.adaptHeight) {
      this.adaptHeightValue = (window.innerHeight - this.$refs.shellWindow.offsetTop) - 10
    }
    if (this.showInput) this.$set(this.total, this.total.length, `登录中`, ' ')
    this.$nextTick(() => {
      if (this.showInput) this.$refs.cmdTextInput.focus()
    })
  },
  methods: {
    enter() {
      this.$emit('shellEnter', this.command)
      this.$set(this.total, this.total.length, `> ${this.command}`)
      this.command = ''
    },
    autofocus() {
      if (this.showInput) this.$refs.cmdTextInput.focus()
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
