<template>
  <div class="el-autocomplete">
    <div class="el-input el-input--medium el-input--prefix el-input--suffix" :class="disabled ? 'is-disabled':''">
      <input v-model="value" type="hidden">
      <input
        ref="input"
        v-model="name"
        type="text"
        autocomplete="off"
        class="el-input__inner"
        prefix-icon="el-icon-edit"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @clear="handleClear"
        @keydown.enter="handleKeyEnter"
        @keydown.tab="close"
        @keyup.up="highlightSubtract"
        @keyup.down="highlightPlus"
        @keyup.delete="handleClear"
      >
      <span v-if="icon" class="el-input__prefix"><i class="el-input__icon el-icon-edit" /></span>
    </div>

    <div
      class="el-autocomplete-suggestion el-popper autocomplete-box"
      :class="isActivity ? 'activity' : ''"
      :style="{ top: top + 'px', left: left + 'px' }"
    >
      <div class="el-scrollbar">
        <div class="el-autocomplete-suggestion__wrap el-scrollbar-wrap">
          <ul class="el-scrollbar__view el-autocomplete-suggestion__list">
            <li
              v-for="(item, index) in searchData"
              :key="index"
              :class="index == highlightedIndex ? 'highlighted' : ''"
              @click="onSearchClick(index)"
            >
              <label role="radio" tabindex="0" class="el-radio" :class="index == highlightedIndex ? 'is-checked' : ''">
                <span class="el-radio__input" :class="index == highlightedIndex ? 'is-checked' : ''">
                  <span class="el-radio__inner" />
                  <input type="radio" aria-hidden="true" tabindex="-1" class="el-radio__original">
                </span>
                <span class="el-radio__label">
                  <span />
                </span>
              </label>

              {{ item[field.name] }}
            </li>
          </ul>
        </div>
      </div>
      <!-- <div class="el-popper-arrow"></div> -->
      <div x-arrow="" class="popper__arrow" />
    </div>
  </div>
</template>
<script>
import request from '@/utils/request'
export default {
  name: 'AutocompleteInput',
  components: {},
  props: {
    value: { type: Number, default: 0 },
    field: { type: Object, default: null }, // {id:null,name:null}
    text: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    infoapi: { type: String, default: '' },
    remote: { type: String, default: '' },
    param: { type: Object, default: null },
    list: { type: Array, default: null },
    icon: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      highlightedIndex: 0,
      isActivity: false,
      id: 0,
      name: '',
      timer: null,
      searchData: [],
      top: 0,
      left: 0,
      page: 1,
      rows: 10,
      loading: false,
      isChange: true
    }
  },
  computed: {},
  watch: {
    text() {
      this.name = this.text
    },
    param() {
      this.paramData = this.param
    },
    value() {
      if (this.value && this.infoapi && (!this.name || this.name === null || this.name === '')) {
        this.getInfoData()
      }
    },
    list() {
      if (this.data && this.data.length > 0) {
        this.data.forEach((item) => {
          if (this.value === item[this.field.id]) { this.name = item[this.field.name] }
        })
      }
    }
  },
  mounted() {
    this.name = this.text
    this.paramData = this.param
    if (this.value && !this.name && this.infoapi) {
      this.getInfoData()
    }
  },

  beforeDestroy() {
    //   this.$refs.suggestions.$destroy();
  },
  methods: {
    getName() { // 用于直接返回此文本值  this.$refs.**.getName();
      return this.name
    },
    getInfoData() {
      if (this.infoapi) {
        var data = { page: this.page, rows: this.rows, keyword: this.name }
        if (this.paramData) {
          data = Object.assign(data, this.paramData)
        }
        data[this.field.id] = parseFloat(this.value)
        request({
          url: this.infoapi,
          data: data
        }).then((res) => {
          if (res.model) {
            this.name = res.model[this.field.name]
            this.$emit('change', res.model)
          }
        })
      }
    },
    requestRemote() {
      if (!this.remote || this.remote === '') return
      var data = { page: this.page, rows: this.rows, keyword: this.name }
      if (this.paramData) {
        data = Object.assign(data, this.paramData)
      }
      // 远程请求
      request({
        url: this.remote,
        data: data
      }).then((res) => {
        this.highlightedIndex = 0
        if (res.data) {
          this.searchData = res.data
          if (this.searchData.length > 0) {
            this.isActivity = true
          } else {
            this.isActivity = false
          }
        }
      })
    },
    handleInput(e) {
      this.isChange = true
      //   console.log("handleInput",e.target.value);
      this.searchData = []
      this.id = 0
      // this.$emit('input', value);
      var that = this
      if (this.timer) clearTimeout(this.timer)
      this.timer = setTimeout(function() {
        that.rows = -1
        that.requestRemote()
      }, 800)

      this.$emit('handleInput', e.target.value)
    },
    handleChange(e) {
      // this.$emit('change', value);
      // console.log("handleChange",value)
    //   console.log("handleChange",e.target.value);

      var that = this
      if (this.searchData && this.searchData.length > 0) {
        this.searchData.forEach((item) => {
          if (item[that.field.name] === that.name) { that.id = parseFloat(item[that.field.id]) }
          this.$emit('change', item)
          return
        })
      } else {
        var changeValue = {}
        changeValue[this.field.id] = 0
        changeValue[this.field.name] = e.target.value
        this.$emit('change', changeValue)
      }
    },
    handleFocus() {
      // this.$emit('focus', event);
      // console.log("handleFocus",event)
      // console.log("handleFocus",e.target.value);
      if (this.searchData && this.searchData.length > 0) this.isActivity = true

      // 算出鼠标相对元素的位置

      this.top = this.$refs.input.getBoundingClientRect().top + 40
      this.left = this.$refs.input.getBoundingClientRect().left
      // console.log("clientTop..clientLeft",this.top,this.left);
      // this.rows = 10;
      if (!this.value || this.value === 0 || !this.name || this.name === null || this.name === '') this.requestRemote()
    },
    handleBlur(e) {
      // this.$emit('blur', event);
    //   console.log("失去焦点返回",e.target.value);
      var that = this
      setTimeout(function() {
        that.isActivity = false
        // console.log("handleBlur",e.target.value,that.isChange,that.id,that.name);
        if (that.isChange === true) {
          var changeValue = {}
          changeValue[that.field.id] = 0
          changeValue[that.field.name] = e.target.value
          that.$emit('blur', changeValue)
        }
      }, 300)
    },
    handleClear() {
      this.$emit('clear')
      // console.log("handleClear");
      // this.id = 0;
    },
    close() {
      this.$emit('close')
      // this.activated = false;
      // console.log("close",e);
    },
    onSearchClick(index) {
      this.isChange = false
      //   console.log("onSearchClick",index);
      this.highlightedIndex = index
      this.id = parseFloat(this.searchData[this.highlightedIndex][this.field.id])
      this.name = this.searchData[this.highlightedIndex][this.field.name]
      this.isActivity = false
      this.$emit('input', this.id)
      this.$emit('change', this.searchData[this.highlightedIndex])
    },
    handleKeyEnter() {
      this.isChange = false
      // console.log("handleKeyEnter",e.target.value,this.searchData.length);
      this.id = this.searchData[this.highlightedIndex][this.field.id]
      this.name = this.searchData[this.highlightedIndex][this.field.name]
      this.isActivity = false
      this.$emit('input', this.id)
      this.$emit('change', this.searchData[this.highlightedIndex])
      // this.$emit('change', this.name);
    },
    highlightPlus() {
      // console.log("highlight",this.highlightedIndex);
      if (
        this.searchData &&
        this.searchData.length > 0 &&
        this.highlightedIndex < this.searchData.length - 2
      ) {
        this.highlightedIndex += 1
      } else {
        this.highlightedIndex = 0
      }
    },
    highlightSubtract() {
      // console.log("highlight",this.highlightedIndex);
      if (
        this.searchData &&
        this.searchData.length > 0 &&
        this.highlightedIndex > 0
      ) {
        this.highlightedIndex -= 1
      } else {
        this.highlightedIndex = this.searchData.length - 1
      }
    },
    getInput() {
      // return this.$refs.input.getInput();
    }
  }
}
</script>

<style lang="scss" scoped>
.autocomplete-box {
  display: none;
  position: fixed;
  z-index: 1000;
}
.autocomplete-box.activity {
  display: block;
}
.el-scrollbar-wrap:hover::-webkit-scrollbar{
    width: 0 !important;
}
.popper__arrow{left: 35px;top:-13px;z-index:3000;}
.popper__arrow::after {
    top: 1px;
    margin-left: -6px;
    border-top-width: 0;
    border-bottom-color: #FFFFFF;
}
</style>

<style lang="scss" scoped>

.el-input--prefix .el-input__inner {
    /* padding-left: 15px; */
    //padding-right: 15px;
}
.el-scrollbar-wrap:hover::-webkit-scrollbar{
    width: 0 !important;
}
</style>
