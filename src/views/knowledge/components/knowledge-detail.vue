<template>
  <div>
    <div class="left2">
      <div v-if="showHeader" class="page-nav">
        <!-- <div @click="goKnowLedgeItem()"><i class="el-icon-back" />返回</div> -->
        <el-page-header :content="navTitle" @back="goKnowLedgeItem" />

      </div>
      <div class="leftBox">
        <div class="left_title">{{ getKnowled.hyKnowName }}</div>
        <div class="Subframe">
          <div class="left_type">类别：
            <div v-for="(element1,index1) in knowledgeTypes" :key="index1" class="left_type_text">
              <div v-if="getKnowled.hyKtId == element1.catId">
                {{ element1.catName }}
              </div>
            </div>
          </div>
          <div class="left_time">发表时间：{{ getKnowled.hyUtime }}</div><br>
        </div>
        <div class="left_p" v-html="getKnowled.hyKtxt" />
        <div class="left_p" style="padding-bottom: 0">
          <h3>附件列表</h3>
          <el-table :data="knowFile" fit highlight-current-row style="width: 100%;">
            <el-table-column label="NO" prop="id" type="index" width="60" />
            <el-table-column label="名称" prop="hyFileName" />
            <el-table-column label="大小" prop="hyFileSize" width="100" />
            <el-table-column label="格式" prop="hyFileType" width="100" />
            <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
              <template slot-scope="{row}">
                <el-button class="but" size="mini" type="primary" @click="openDialog(row,$event)">预览</el-button>
                <el-link v-permission="['DownloadAttachment']" target="_blank" :href="row.hyFileAddr" :underline="false">
                  <el-button size="mini" type="primary">下载</el-button>
                </el-link>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="divider" />
        <div class="kewordBox">
          <div class="keyword_title">相关关键词</div>
          <div class="keywords">
            <div v-for="(item,index) in customKeywords" :key="index">
              <div class="keyword">{{ item }}</div>
            </div>
          </div>
        </div>
        <!-- pdf预览 -->
        <el-dialog
          :visible.sync="fileShow"
          :close-on-click-modal="false"
          class="pdfshow-dialog"
          title="预览"
          width="60%"
          top="5vh"
          style="height:100%"
        >
          <div class="tools">
            <el-button :theme="'default'" type="submit" :title="'上一页'" class="mr10" @click.stop="prePage"> 上一页</el-button>
            <el-button :theme="'default'" type="submit" :title="'下一页'" class="mr10" @click.stop="nextPage"> 下一页</el-button>
            <el-button :theme="'default'" type="submit" :title="'顺时针旋转'" class="mr10" @click.stop="clock"> 顺时针旋转</el-button>
            <el-button :theme="'default'" type="submit" :title="'逆时针旋转'" class="mr10" @click.stop="counterClock"> 逆时针旋转</el-button>
            <div class="page">{{ pageNum }}/{{ pageTotalNum }} </div>
          </div>
          <!-- <pdf v-for="i in numPages" :key="i" :src="fileSrc" :page="i" /> -->
          <pdf
            ref="pdf"
            :src="fileSrc"
            :page="pageNum"
            :rotate="pageRotate"
            @progress="loadedRatio = $event"
            @page-loaded="pageLoaded($event)"
            @num-pages="pageTotalNum=$event"
            @error="pdfError($event)"
            @link-clicked="page = $event"
          />
          <span slot="footer" class="dialog-footer">
            <el-button @click="fileShow = false">关 闭</el-button>
          </span>
        </el-dialog>
        <!-- excel预览 -->
        <el-dialog
          :visible.sync="excelShow"
          :close-on-click-modal="false"
          class="pdfshow-dialog"
          title="预览"
          width="60%"
          top="5vh"
          style="height:100%"
        >
          <div v-html="tableau" />
          <span slot="footer" class="dialog-footer">
            <el-button @click="excelShow = false">关 闭</el-button>
          </span>
        </el-dialog>
        <!-- word预览 -->
        <el-dialog
          :visible.sync="wordShow"
          :close-on-click-modal="false"
          class="pdfshow-dialog"
          title="预览"
          width="60%"
          top="5vh"
          style="height:100%"
        >
          <div ref="file" />
          <span slot="footer" class="dialog-footer">
            <el-button @click="wordShow = false">关 闭</el-button>
          </span>
        </el-dialog>
        <!-- ppt预览 -->
        <el-dialog
          :visible.sync="pptShow"
          :close-on-click-modal="false"
          class="pdfshow-dialog"
          title="预览   (无法连接网络，请下载查看)"
          width="60%"
          top="5vh"
          style="height:100%"
        >
          <iframe
            :src="fileSrc"
            width="100%"
            height="700px"
            frameborder="0"
            scrolling="auto"
          />
          <span slot="footer" class="dialog-footer">
            <el-button @click="pptShow = false">关 闭</el-button>
          </span>
        </el-dialog>
        <!-- .doc文件预览 -->
        <el-dialog
          :visible.sync="netFileShow"
          :close-on-click-modal="false"
          class="pdfshow-dialog"
          title="预览   (无法连接网络，请下载查看)"
          width="60%"
          top="5vh"
          style="height:100%"
        >
          <iframe
            :src="fileSrc"
            width="100%"
            height="700px"
            frameborder="0"
            scrolling="auto"
          />
          <!-- style="position:absolute;left: 0px;z-index:1000" -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="netFileShowL = false">关 闭</el-button>
          </span>
        </el-dialog>
      </div>
    </div>
  </div>
</template>
<script>
import request from '@/utils/request'
import api from '@/api/api'
import pdf from 'vue-pdf'
import axios from 'axios'
// import XLSX from 'xlsx'
import * as XLSX from 'xlsx'
const docx = require('docx-preview')
window.JSZip = require('jszip')
// import CMapReaderFactory from 'vue-pdf/src/CMapReaderFactory.js'
export default {
  name: 'Knowledge',
  components: {
    pdf
  },
  props: {
    itemId: {
      type: Number,
      default() {
        return []
      }
    },
    showHeader: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      knowledgeTypes: [],
      getKnowled: [],
      customKeywords: [],
      knowFile: [],
      knowId: '',
      findHyitKnowQuery: {
        keywords: '',
        hyktId: '',
        page: 1,
        limit: 10
      },
      loading: false,
      tableau: null,
      type: 0,
      pageNum: 1,
      pageTotalNum: 1,
      pageRotate: 0,
      // 加载进度
      loadedRatio: 0,
      curPageNum: 0,
      fileShow: false,
      pdfShow: false,
      fileSrc: '',
      numPages: 0,
      excelShow: false,
      wordShow: false,
      pptShow: false,
      pptUrl: '',
      netFileShow: false
    }
  },
  computed: {
    navTitle() {
      return this.$route.meta.title
    }
  },
  watch: {
    itemId: {
      handler() {
        this.loadInternetCafe()
      },
      deep: true
    }
  },
  created() {
    // this.knowId = this.$route.params.id
    this.loadInternetCafe()
  },
  mounted() {
    this.loadKnowFile()
  },
  methods: {
    getfileSrc(file) { // Word,Excel 文件
      this.fileSrc = 'https://view.officeapps.live.com/op/view.aspx?src=' + `http://${window.location.host}` + file.hyFileAddr
    },
    openDialog(row, e) {
      if (/\.(xlsx|xls)$/.test(row.hyFileAddr)) {
        this.excelShow = true
        this.getXLSX(row)
      } else if (/\.(pdf|PDF)$/.test(row.hyFileAddr)) {
        this.fileSrc = row.hyFileAddr
        this.fileShow = true
      } else if (/\.(docx)$/.test(row.hyFileAddr)) {
        this.wordShow = true
        this.preview(row)
      } else if (/\.(pptx|ppt)$/.test(row.hyFileAddr)) {
        this.pptShow = true
        this.getfileSrc(row)
      } else if (/\.(doc)$/.test(row.hyFileAddr)) {
        this.netFileShow = true
        this.getfileSrc(row)
      } else {
        this.$message.error('该格式文件暂不支持预览')
      }
    },
    // 获取excel数据
    getXLSX(row) {
      axios.get(row.hyFileAddr, {
        responseType: 'arraybuffer' // 设置响应体类型为arraybuffer
      }).then(({data}) => {
        let workbook = XLSX.read(new Uint8Array(data), {type: 'array'}) // 解析数据
        var worksheet = workbook.Sheets[workbook.SheetNames[0]] // workbook.SheetNames 下存的是该文件每个工作表名字,这里取出第一个工作表
        this.tableau = XLSX.utils.sheet_to_html(worksheet) // 渲染
      })
    },
    // 获取word数据
    preview(row) {
      axios({
        method: 'get',
        responseType: 'blob', // 设置响应文件格式
        url: row.hyFileAddr
      }).then(({data}) => {
        docx.renderAsync(data, this.$refs.file) // 渲染到页面预览
      })
    },
    // 预览ppt
    viewPPt(file) {
      let _this = this
      let reader = new FileReader()
      reader.readAsDataURL(file) // 文件转换
      reader.onload = function () {
        _this.pptUrl = this.result
      }
    },
    // // 获取pdf页数
    // getTitlePdfurl(url) {
    //   this.pdfSrc = pdf.createLoadingTask({ url: url, CMapReaderFactory })// 解决中文乱码问题
    //   this.pdfSrc.promise.then((pdf) => {
    //     this.numPages = pdf.numPages
    //   })
    // },
    // 上一页函数，
    prePage() {
      var page = this.pageNum
      page = page > 1 ? page - 1 : this.pageTotalNum
      this.pageNum = page
    },
    // 下一页函数
    nextPage() {
      var page = this.pageNum
      page = page < this.pageTotalNum ? page + 1 : 1
      this.pageNum = page
    },
    // 页面顺时针翻转90度。
    clock() {
      this.pageRotate += 90
    },
    // 页面逆时针翻转90度。
    counterClock() {
      this.pageRotate -= 90
    },
    // 页面加载回调函数，其中e为当前页数
    pageLoaded(e) {
      this.curPageNum = e
    },
    // 错误时回调函数。
    pdfError(error) {
      console.error(error)
    },
    // 页面信息
    loadInternetCafe() {
      // 查看知识库点
      request({
        url: api.knowledge.getHyitKnow,
        data: { hyKnowId: this.itemId }
      }).then(res => {
        this.getKnowled = res.model
        this.customKeywords = this.getKnowled.hyKeyword.split(',')
      })

      // 查询知识类型
      request({
        url: api.sys.findSysCat,
        data: { systemName: 'kbms', classify: 'kbms_know_type', pid: 10 }
      }).then(res => {
        res.data.forEach(element => {
          this.knowledgeTypes.push(element)
        })
      })
    },
    loadKnowFile() {
      request({
        url: api.knowledge.findHyitKnowFile,
        data: { hyOid: this.itemId }
      })
        .then(res => {
          this.knowFile = res.data
        })
    },
    getScreenData(val) {
      this.$set(this.findHyitKnowQuery, 'keywords', val.searchWords)
      this.$set(this.findHyitKnowQuery, 'hyktId', val.itemId)
      this.findHyitKnow()
    },
    goKnowLedgeItem() {
      this.$tool.getPageQuery(`${this.$route.name}`)
      this.$emit('goKnowLedgeItem', 1)
    }
  }

}
</script>
<style lang="scss">
.left2{
  .but {
    margin-right: 10px;
    }
  .page-nav{background:#f9f9f9;cursor: pointer;font-size: 20px;margin-right: 1%;}
  .leftBox{padding:10px 20px;background:#f9f9f9;width: 99%;margin-bottom: 2px;height: auto;}
  .left_title{font-size: 24px;margin: 0px 0 25px 20px;}
  .Subframe{
    margin:0 0 25px 0;
    .left_type,.left_time{font-size: 16px;color: #999999;display:inline;padding: 0 20px;float: left;}
    .left_type{.left_type_text{float: right;}}
  }
  .left_p{font-size: 16px;color: #000000;padding: 0 0 35px 20px;line-height:24px;
    -webkit-margin-before: 0em;
    -webkit-margin-after: 0em;
  }
  .kewordBox{padding: 35px 0 0 20px;color: #333333;
    .keyword_title{font-size: 16px;}
    .keywords{display: flex;font-size: 14px;
      .keyword{border-radius: 12px;margin: 20px 10px 0 0;padding: 5px 20px 5px 20px;background-color: rgb(216, 216, 216);width: auto;}
    }

  }
}
</style>
<style>
.leftBox .left_p >p >img{
  display: block;
  /*margin: 0 auto;*/
}
.tools {
  display: flex;
}
.page {
    margin: 10px 0
  }
</style>
