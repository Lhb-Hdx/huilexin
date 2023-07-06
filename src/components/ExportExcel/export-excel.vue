
<template>
  <div>
    <el-button type="primary" :size="size" @click="output()">{{ buttonTitle }}</el-button>
  </div>
</template>
<script>
import saveAs from 'file-saver'

export default {
  name: 'OutputExcel',
  props: {
    //   传入的fillterList必须是经过过滤的数组
    fillterList: { type: Array, default: null },
    // excelTitle型如： titel对应表头，dataIndex对应值
    // ExcelTitle: [{
    //     title: '报销单号',
    //     dataIndex: 'reimbursementNo'
    //   }, ]
    excelTitle: { type: Array, default: null },
    fileName: { type: String, default: '未命名' },
    size: { type: String, default: '' },
    buttonTitle: { type: String, default: '导出' }
  },
  methods: {
    async output() {
      console.log(this.fillterList, 'fillterList')
      console.log(this.excelTitle, 'excel')
      // if (this.fillterList.length > 500) {
      //   this.$message.error('所需数据导出大于500条，请联系管理员协助导出')
      // } else {
      const ExcelJS = require('exceljs')
      // Create a Workbook
      const workbook = new ExcelJS.Workbook()
      // Set Workbook Properties
      workbook.creator = 'JSTZGG'
      workbook.lastModifiedBy = 'JSTZGG'
      workbook.created = new Date()
      workbook.modified = new Date()
      workbook.lastPrinted = new Date()
      const fileName = this.fileName
      // 将工作簿添加一个sheet页sheet1
      const sheet1 = workbook.addWorksheet('sheet1')
      // 表头数据添加
      sheet1.columns = this.excelTitle.map(item => ({
        header: item.title,
        key: item.dataIndex,
        width: item.width
      }))

      // 表格数据添加
      this.fillterList.map(item => sheet1.addRow(item))

      // 设置表头样式
      sheet1.getRow(1).fill = {
        type: 'pattern',
        pattern: 'gray125',
        fgColor: { argb: '666666' },
        bgColor: { argb: '666666' },
        color: { argb: 'FFFFFF' },
        family: 2,
        size: 14
      }
      // 设置表头样式
      sheet1.getRow(1).font = {
        bold: false,
        color: {'argb': 'FFFFFFFF'}
      }
      // 设置列宽
      this.excelTitle.forEach((item, i) => {
        const maxWidth = Math.max(...sheet1.columns[i]['values'].filter(Boolean).map((it) => it.toString().length))
        sheet1.getColumn(i + 1).width = maxWidth * 2.5
        sheet1.getColumn(i + 1).alignment = { vertical: 'middle', horizontal: 'center' }
      })
      // 设置列居中
      // this.excelTitle.forEach((item, i) => {
      //   sheet1.getColumn(i + 1).alignment = { vertical: 'middle', horizontal: 'center' }
      // })

      workbook.xlsx.writeBuffer().then(buffer => {
        saveAs(
          new Blob([buffer], { type: 'application/octet-stream' }),
          fileName + '.' + 'xlsx'
        )
      })
      // }
    }
  }
}
</script>
