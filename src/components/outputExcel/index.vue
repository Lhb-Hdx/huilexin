<template>
  <div class="filter-item out-put-excel">
    <el-input v-if="type === 'limit'" v-model.number="limit" placeholder="条数" type="number" />
    <el-select v-if="type === 'page'" v-model="page" placeholder="页数">
      <el-option v-for="item in pageOption" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>
    <el-button v-if="toggle" icon="el-icon-s-operation" class="toggle-btn" @click="onToggle" />
    <el-button class="out-put-btn" :loading="loading" @click="submitQuery">导出Excel</el-button>
  </div>
</template>
<script>
import saveAs from 'file-saver'
const ExcelJS = require('exceljs')

export default {
  name: 'OutputExcel',
  props: {
    /**
     * @description 传入的fillterList必须是经过过滤的数组
     */
    fillterList: {
      type: Array,
      default: () => []
    },
    /**
     * @description 行配置
     */
    /* ExcelTitle: [{
      title: '报销单号', // 表头
      dataIndex: 'reimbursementNo' // 对应值
    }] */
    excelTitle: {
      type: Array,
      default: null
    },
    /**
     * @description 页码方式切换
     */
    toggle: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      page: -1,
      limit: 10,
      pageOption: [
        { label: '全部', value: -1 },
        { label: '1页', value: 1 },
        { label: '2页', value: 2 },
        { label: '4页', value: 4 },
        { label: '6页', value: 6 },
        { label: '8页', value: 8 },
        { label: '10页', value: 10 }
      ],
      type: 'page', // page选择页数，limit输入条数
      loading: false
    }
  },
  watch: {
    fillterList() {
      this.output()
    }
  },
  methods: {
    submitQuery() {
      this.loading = true
      let data = {}
      if (this.type === 'page') {
        if (this.page === -1) {
          data = { page: 1, limit: -1 }
        } else {
          data = { page: 1, limit: this.page * 10 }
        }
      }
      if (this.type === 'limit') {
        data = { page: 1, limit: this.limit }
      }
      this.$emit('submitQuery', data)
    },
    onToggle() {
      this.type = this.type === 'page' ? 'limit' : 'page'
    },
    async output(excelTitle, excelList) {
      if (excelList !== undefined) {
        // if (excelList.length > 500) {
        //   this.$message.error('所需数据导出大于500条，请联系管理员协助导出')
        // } else {
        if (this.type === 'limit' && !this.limit) {
          this.loading = false
          return this.$message.warning('请输入条数')
        }
        // Create a Workbook
        const workbook = new ExcelJS.Workbook()
        // Set Workbook Properties
        workbook.creator = 'JSTZGG'
        workbook.lastModifiedBy = 'JSTZGG'
        workbook.created = new Date()
        workbook.modified = new Date()
        workbook.lastPrinted = new Date()
        const fileName = '表格数据'
        // 将工作簿添加一个sheet页sheet1
        const sheet1 = workbook.addWorksheet('sheet1')
        // 表头数据添加
        sheet1.columns = excelTitle.map((item) => ({
          header: item.title,
          key: item.dataIndex
        }))

        // 表格数据添加
        excelList.map((item) => sheet1.addRow(item))

        // 设置列宽
        excelTitle.forEach((item, i) => {
          const maxWidth = Math.max(...sheet1.columns[i]['values'].filter(Boolean).map((it) => it.toString().length))
          sheet1.getColumn(i + 1).width = maxWidth * 2.5
          sheet1.getColumn(i + 1).alignment = { vertical: 'middle', horizontal: 'center' }
        })

        // 设置表头
        sheet1.getRow(1).fill = {
          type: 'pattern',
          pattern: 'gray125',
          fgColor: { argb: '666666' },
          bgColor: { argb: '666666' },
          color: { argb: 'FFFFFF' },
          family: 2,
          size: 14
        }
        sheet1.getRow(1).font = {
          color: { argb: 'FFFFFF' },
          family: 2,
          size: 12
        }

        workbook.xlsx.writeBuffer().then((buffer) => {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), fileName + '.' + 'xlsx')
        })
        this.loading = false
        // }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.out-put-excel ::v-deep {
  display: inline-flex;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  .el-input {
    width: 80px;
  }
  .el-input__inner,
  .toggle-btn {
    border-top-right-radius: 0px !important;
    border-bottom-right-radius: 0px !important;
    border: 0;
    border-right: 1px solid #dcdfe6 !important;
  }
  .toggle-btn {
    padding: 10px 6px;
  }
  .out-put-btn {
    border-top-left-radius: 0px !important;
    border-bottom-left-radius: 0px !important;
    margin: 0;
    background-color: #f5f7fa;
    color: #909399;
    border: 0;
    padding: 10px 10px;
  }
}
</style>
