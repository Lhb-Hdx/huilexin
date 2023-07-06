<template>
  <div>
    <el-table
      ref="table"
      :data="tableData"
      style="width: 100%;"
      @select="handleSelect"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" :reserve-selection="false" />
      <slot />
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'CheckSelectTable',
  props: {
    // 表格数据
    tableData: {
      type: Array,
      default() {
        return []
      }
    },
    // 表格id
    rowKey: {
      type: String,
      default: ''
    },
    // 选择的id
    selectKeys: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      allSelection: [], // 所有页面选择的
      ideField: 'id',
      PagingSelection: []
    }
  },
  watch: {
    tableData: {
      handler() {
        this.initTableSelection()
      },
      deep: true
    },
    selectKeys: {
      handler() {
        this.allSelection = this.selectKeys
        console.log(this.selectKeys)
        this.initTableSelection()
      },
      deep: true
    }
  },
  methods: {
    handleSelect(rows, row) {
      let selected = rows.length && rows.indexOf(row) !== -1
      if (!selected) this.PagingSelection = this.PagingSelection.filter(it => it[this.rowKey] !== row[this.rowKey])
    },
    initTableSelection() {
      this.$nextTick(() => {
        for (let i = 0; i < this.tableData.length; i++) {
          const tableEle = this.tableData[i]
          for (let j = 0; j < this.allSelection.length; j++) {
            const ele = this.allSelection[j]
            if (tableEle[this.rowKey] === ele[this.rowKey]) {
              this.$refs['table'].toggleRowSelection(tableEle, true)
            }
          }
        }
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      let setPagingSelection = [...this.allSelection, ...val]
      setPagingSelection = setPagingSelection.map(it => JSON.stringify(it))
      setPagingSelection = [...new Set(setPagingSelection)].map((item) => JSON.parse(item))
      this.allSelection = setPagingSelection
      this.$emit('selectData', this.allSelection)
    }
  }
}
</script>
