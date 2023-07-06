export default {
  data() {
    return {
      allSelection: []
      // 页面需要一个keyField变量，用来判断
    }
  },
  mounted() {
    if (this.dynamicList) this.allSelection = [...this.dynamicList]
  },
  methods: {
    submit() {
      this.$emit('update:dynamicList', this.allSelection)
      this.$emit('close', false)
      // this.listQuery.applicationId && this.$emit('applicationId', this.listQuery.applicationId)
    },
    handleSelect(selection, row) { // 单选
      let selected = this.allSelection.some(it => it[this.keyField] === row[this.keyField])
      if (!selected) this.allSelection.push(row)// 列表不存在加进去
      if (selected) this.allSelection = this.allSelection.filter(it => it[this.keyField] !== row[this.keyField])// 列表有的删除
      console.log(this.allSelection)
    },
    handleSelectAll(val) { // 全选去重
      if (!val.length) { // 取消全选
        this[this.listField].forEach(it => {
          const idx = this.allSelection.findIndex(selectit => selectit[this.keyField] === it[this.keyField])
          if (idx !== -1) this.allSelection.splice(idx, 1)
        })
        return
      }
      let setPagingSelection = [...this.allSelection, ...val]
      setPagingSelection = setPagingSelection.map(it => JSON.stringify(it))
      setPagingSelection = [...new Set(setPagingSelection)].map((item) => JSON.parse(item))
      this.allSelection = setPagingSelection
    },
    initTable() { // 勾选初始化
      for (let i = 0; i < this.allSelection.length; i++) {
        for (let j = 0; j < this[this.listField].length; j++) {
          if (+this.allSelection[i][this.keyField] === +this[this.listField][j][this.keyField]) {
            this.$refs.table.toggleRowSelection(this[this.listField][j], true)
          }
        }
      }
    }
  }
}
