
<template>
  <div>
    <el-button :loading="loading" type="primary" :size="size" @click="outputList()">{{ buttonTitle }}</el-button>
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
    buttonTitle: { type: String, default: '导出' },
    wrapList: { type: Array, default: null }, // 需换行的列
    title: { type: String, default: '' }, // 标题
    mergeNum: { type: Number, default: 2 }, // 需合并的行数
    loading: { type: Boolean, default: false },
    headerColor: { type: String, default: '006BBA' }, // 页眉背景色
    headerFontSize: { type: Number, default: 16 }, // 页眉字体大小
    headerFontColor: { type: String, default: 'FFFFFF' }, // 页眉颜色
    rowHeight: { type: Array, default: null}, // 各行行高
    content: {type: Number, default: 3 }, // 从第几行开始渲染表格内容
    base64: {type: Array, default: null} // echarts的base64图片
  },
  watch: {
    fillterList() {
      this.output()
    }
  },
  methods: {
    outputList() {
      this.$emit('sendRequest')
    },
    async output() {
      console.log(this.fillterList, 'fillterList')
      console.log(this.excelTitle, 'excel')
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

      // 垂直插值
      this.setDesc = function (numberLines, value) {
        let item = null
        for (let i = 0, length = value.length; i < length; i++) {
          item = value[i]
          sheet1.getCell(`A${i + 1}`).value = item
        }
        return this
      }

      // 设置header
      this.setHeader = function (numberLines, value) {
        let keys = []
        for (let i = 0, length = value.length; i < length; i++) {
          let currentLines = numberLines || sheet1.rowCount + 1
          let columnsChar = String.fromCharCode(64 + i + 1)
          let cellNumbers = `${columnsChar}${currentLines}`
          let item = value[i]
          keys.push({
            key: item.dataIndex,
            width: item.width
          })
          sheet1.getCell(cellNumbers).value = item.title
        }
        sheet1.columns = keys
        return this
      }

      // 合并单元格
      this.setMerge = function (rows, columns) {
        let char = String.fromCharCode(64 + columns)
        for (let i = 1; i <= rows; i++) {
          sheet1.mergeCells(`A${i}:${char}${i}`)
        }
        return this
      }

      // 设置表格边框
      this.setBorderStyle = function (columns, fillterList, row) {
        for (let i = 1; i <= columns; i++) {
          for (let j = 1; j <= fillterList; j++) {
            sheet1.getRow(j + row).getCell(i).border = { // 为单元格添加边框
              top: {style: 'thin'},
              left: {style: 'thin'},
              bottom: {style: 'thin'},
              right: {style: 'thin'}
            }
          }
        }
        return this
      }

      // 设置表头背景色
      this.setBackgroundColor = function (cell, color) {
        sheet1.getCell(cell).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {
            argb: `FF${color}`
          }
        }
        return this
      }

      // 设置字体
      this.setFontSize = function (cell, size, color) {
        sheet1.getCell(cell).font = {
          color: { argb: `FF${color}` },
          family: 2,
          size: size,
          bold: true
        }
        return this
      }
      // 自动换行
      this.setWrapText = function (cell, length) {
        sheet1.getCell(`${cell}${length}`).alignment = { wrapText: true }
        return this
      }

      let word = []
      let title = `${this.title}`
      let time = `导出时间：${this.$tool.formatTime(new Date())}`
      word[0] = title
      word[1] = time
      // 添加1 2行表头 垂直插值
      this.setDesc(1, word)
      // 合并单元格
      this.setMerge(this.mergeNum, this.excelTitle.length)
      // 设置header
      this.setHeader(this.content, this.excelTitle)
      // 添加内容
      this.fillterList.map(item => sheet1.addRow(item))
      // 设置表格边框
      this.setBorderStyle(this.excelTitle.length, this.fillterList.length, this.content)
      // 设置页眉背景色
      this.setBackgroundColor('A1', this.headerColor)
      // 设置页眉字体
      this.setFontSize('A1', this.headerFontSize, this.headerFontColor)
      // 设置行头样式
      this.excelTitle.forEach((item, index) => {
        let char = String.fromCharCode(64 + index + 1)
        let data = char + this.content // this.content 指给第几行设置颜色
        this.setBackgroundColor(data, '111111') // 背景色
        this.setFontSize(data, 11, 'FFFFFF') // 字体样式
      })
      // 设置内容背景色 循环给单元格添加背景色
      let arr = []
      for (let i = 1; i < this.fillterList.length; i++) {
        if (i % 2 === 0) { // 被2整除
          arr.push(i)
        }
      }
      let colorData = arr.map(it => it + this.content)
      this.excelTitle.forEach((items, index) => {
        colorData.forEach(item => {
          let char = String.fromCharCode(64 + index + 1)
          let data = char + item
          this.setBackgroundColor(data, 'F3F3F3')
        })
      })
      // 设置列居中
      this.excelTitle.forEach((item, i) => {
        sheet1.getColumn(i + 1).alignment = { vertical: 'middle', horizontal: 'center' }
      })
      // 设置行高
      this.rowHeight.forEach(item => {
        sheet1.getRow(item.num).height = item.height
      })
      // 自动换行 单元格内换行位置需加上'\n'
      if (this.wrapList) {
        const wrap = this.fillterList.map((item, index) => index + 4)
        this.wrapList.forEach(wrapItem => {
          wrap.forEach(item => {
            this.setWrapText(wrapItem, item)
          })
        })
      }
      // 导出echarts图片
      if (this.base64) {
        if (this.base64.length === 1) {
          const imageId2 = workbook.addImage({
            base64: this.base64[0].base,
            extension: 'png'
          })
          sheet1.addImage(imageId2, {
            tl: { col: this.base64[0].length, row: 2 },
            ext: { width: 200, height: 200 }
          })
        } else if (this.base64.length > 1) {
          this.base64.forEach((item, index) => {
            const data = workbook.addImage({
              base64: item.base,
              extension: 'png'
            })
            sheet1.addImage(data, {
              tl: { col: item.length, row: 2 },
              ext: { width: 200, height: 200 }
            })
          })
        }
      }

      workbook.xlsx.writeBuffer().then(buffer => {
        saveAs(
          new Blob([buffer], { type: 'application/octet-stream' }),
          fileName + '.' + 'xlsx'
        )
      })
    }
  }

}
</script>

