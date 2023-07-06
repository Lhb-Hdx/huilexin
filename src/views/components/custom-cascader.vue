<template>
  <el-cascader
    :value="value2"
    :options="options"
    :props="props2"
    :placeholder="placeholder"
    style="width: 100%;"
    clearable
    filterable
    @change="change"
  />
</template>

<script>

/**
 * 为IT3.0监控系统定制的奇葩级联组件
 * created on 2020.11.15
 */
export default {
  props: {
    options: {
      type: Array,
      default: () => []
    },
    value: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: ''
    },
    props: {
      type: Object,
      default: () => ({})
    },
    cusProps: {
      type: Object,
      default: () => ({
        id: 'id',
        pid: 'pid'
      })
    }
  },
  computed: {
    props2() {
      return Object.assign({ multiple: true }, this.props)
    },
    treeMap() {
      if (!this.options.length) return null
      const map = {}
      const loop = (data) => {
        data.forEach(item => {
          map[item[this.cusProps.id]] = item
          if (item[this.props.children || 'children']) {
            loop(item[this.props.children || 'children'])
          }
        })
      }
      loop(this.options)
      return map
    },
    value2() {
      if (!this.treeMap) return []
      const loop = (node, arr) => {
        if (node[this.cusProps.pid] !== 0) {
          const parent = this.treeMap[node[this.cusProps.pid]]
          arr.unshift(parent[this.cusProps.id])
          loop(parent, arr)
        }
      }
      const arr = this.value.map(id => {
        if (!id) return []
        const node = this.treeMap[id]
        const subArr = []
        if (!node[this.props.children || 'children']) {
          subArr.unshift(node[this.cusProps.id])
          loop(node, subArr)
        }
        return subArr
      })
      return arr.filter(item => item.length)
    }
  },
  methods: {
    change(val) {
      const values = Array.from(new Set(val.flat()))
      this.$emit('input', values)
      if (this.$listeners.change) {
        this.$emit('change', values)
      }
    }
  }
}
</script>
