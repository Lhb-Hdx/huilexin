<template>
  <div className="el-autocomplete">
    <div className="el-input el-input--medium el-input--prefix el-input--suffix">
      <el-cascader
        :value="bindValue"
        prefix-icon="el-icon-document"
        change-on-select
        :placeholder="placeholder"
        :options="catTreeList"
        :props="treeProps"
        :disabled="disabled"
        clearable
        filterable
        class="e-cascader"
        @change="handleChange"
        @focus="handleFocus"
      />

    </div>

  </div>

</template>
<script>
import request from '@/utils/request'
import { listToTree } from 'vue-auto-input-search/src/vue-auto-data'

export default {
  name: 'VueAutoInputTree',
  components: {},
  props: {
    configurationData: { type: Number, default: 0 },
    value: { type: Number, default: 0 },
    field: { type: Object, default: null }, // {id:null,name:null}
    placeholder: { type: String, default: '请选择' },
    remote: { type: String, default: '' },
    param: { type: Object, default: null },
    catData: { type: Array, default: null },
    infoapi: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    levelStartNum: { type: Number, default: 0 }, // 一级序号  默认为0
    bindValue: { type: Number, default: 9425 }, // 绑定值
    mountedRequire: { type: Boolean, default: true }, // 是否在mounted生命周期触发的时候调用接口
    dataReloadKey: { type: String, default: '' } // 数据刷新key值
  },
  data() {
    return {
      id: 0,
      name: '',
      timer: null,
      catTreeList: [],
      treeValue: 0,
      treeProps: null
    }
  },
  computed: {},
  watch: {
    param() {
      this.paramData = this.param
    },
    value() {
      if (!this.treeValue && this.value && this.value > 0) {
        this.requestRemote()
        this.treeValue = this.value
      }
    },
    catData() {
      if (this.catData && this.catData.length > 0) this.catTreeList = listToTree(this.catData, 0, 0, this.field.id, this.field.parent)
    },
    dataReloadKey(newVal, oldVal) {
      if (newVal) this.requestRemote()
    }
  },
  mounted() {
    // let $input = this.getInput();
    // console.log("进入mounted",this.field,this.value);
    // console.log("mounted.value",this.value);
    this.paramData = this.param
    if (this.mountedRequire) this.requestRemote()
    this.treeValue = this.value
    if (this.field) this.treeProps = { checkStrictly: true, value: this.field.id, label: this.field.name }
    if (this.catData && this.catData.length > 0) this.catTreeList = listToTree(this.catData, 0, 0, this.field.id, this.field.parent)
  },

  beforeDestroy() {
    //   this.$refs.suggestions.$destroy();
  },
  methods: {
    requestRemote() {
      if (!this.remote || this.remote === '') return
      var data = { page: this.page, rows: this.rows, keyword: this.name }
      if (this.paramData) {
        data = Object.assign(data, this.paramData)
      }
      // 远程请求
      request({
        url: this.remote, data: data
      }).then(res => {
        this.highlightedIndex = 0
        if (res.data) {
          if (this.field.parent) {
            this.catTreeList = listToTree(res.data, this.levelStartNum, 0, this.field.id, this.field.parent)
          } else {
            res.data.forEach(item => {
              this.catTreeList.push(item)
            })
          }
        }
      })
    }, handleFocus() {
      // console.log("焦点蟹发",JSON.stringify(this.catTreeList));
      if (!this.catTreeList || this.catTreeList.length === 0) {
        this.requestRemote()
      }
    },
    handleChange(val) {
      // console.log("handleChange",JSON.stringify(val),JSON.stringify(this.treeValue));
      if (val && val.length > 0) {
        //   this.treeValue = val[val.length - 1];
        this.$emit('input', val[val.length - 1])
        this.$emit('change', val[val.length - 1])
      } else {
        this.clear()
      }
    },
    clear() {
      this.treeValue = this.levelStartNum || 0
      this.$emit('input', this.levelStartNum || 0)
      this.catTreeList = []
    }

  }
}
</script>

<style lang="scss" scoped>
.el-input--prefix .el-input__inner {
  padding-right: 15px;
}

.el-autocomplete {
  width: 100%;
}
</style>
<style lang="scss" scoped>
.autocomplete-box {
  display: none;
  position: fixed;
  z-index: 1000;
}

.autocomplete-box.activity {
  display: block;
}

.e-cascader {
  width: 100%;

  > div {
    width: 100%;

    > input.el-input__inner {
      width: 100% !important;
    }
  }
}

</style>
