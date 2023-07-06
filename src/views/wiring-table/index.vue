<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
      <el-input v-model="listQuery.keyword" placeholder="请输入搜索关键词" class="filter-item filter-item-input" />
      <el-button class="filter-item" type="primary" @click="findEsightLine">查询</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-upload2" @click="openImportFileDialog">导入</el-button>
      <el-button class="filter-item" type="danger" @click="deleteEsightLine">批量删除</el-button>
      <el-dropdown :hide-on-click="false" class="filter-item screen">
        <i class="icon el-icon-s-operation" />
        <el-dropdown-menu slot="dropdown">
          <el-scrollbar style="height: 60vh">
            <el-checkbox-group v-model="wiringItems">
              <el-dropdown-item v-for="(item,index) in checkList" :key="index"><el-checkbox :key="item" :label="item" />
              </el-dropdown-item>
            </el-checkbox-group>
          </el-scrollbar>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="table-wrapper">
      <el-table
        ref="table"
        :data="dataList"
        fit
        highlight-current-row
        style="width: 100%;"
        @select="handleSelect"
        @selection-change="handleSelectionChange"
      >
        <el-table-column label="序号" type="selection" />
        <el-table-column v-if="lists[0].ispass" align="left" width="150" label="线缆名称" prop="name" show-overflow-tooltip />
        <el-table-column v-if="lists[1].ispass" align="left" label="规格程式" prop="specifications" show-overflow-tooltip />
        <el-table-column v-if="lists[2].ispass" align="left" width="150" label="机柜" prop="cabinet" show-overflow-tooltip />
        <el-table-column v-if="lists[3].ispass" align="left" width="150" label="From" prop="hostFrom" show-overflow-tooltip />
        <el-table-column v-if="lists[4].ispass" align="right" label="端口号" prop="port" show-overflow-tooltip />
        <el-table-column v-if="lists[5].ispass" align="left" width="150" label="机柜2" prop="cabinet2" show-overflow-tooltip />
        <el-table-column v-if="lists[6].ispass" align="left" label="To" prop="hostTo" show-overflow-tooltip />
        <el-table-column v-if="lists[7].ispass" align="right" label="端口号2" prop="port2" show-overflow-tooltip />
        <el-table-column v-if="lists[8].ispass" align="left" label="布放方式" prop="lineType" show-overflow-tooltip />
        <el-table-column v-if="lists[9].ispass" align="right" label="条数" prop="lineCount" show-overflow-tooltip width="50" />
        <el-table-column v-if="lists[10].ispass" align="right" width="130" label="平均条长（米）" prop="avgLine" show-overflow-tooltip />
        <el-table-column v-if="lists[11].ispass" align="right" label="数量（米）" prop="lineLong" show-overflow-tooltip />
        <el-table-column v-if="lists[12].ispass" align="left" label="备注" prop="backup" show-overflow-tooltip />
        <el-table-column label="操作" align="left" width="250" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button size="mini" type="primary" @click="onEdit(row)">
              编辑
            </el-button>
            <el-button size="mini" type="danger" @click="onDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :auto-scroll="false" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findEsightLine" />
    </div>
    <el-dialog title="导入" :visible.sync="showImportFileDialog" width="50%" top="5vh">
      <el-form label-width="90px">
        <el-form-item label="选择文件">
          <el-upload
            ref="uploadRef"
            class="upload"
            action
            accept=".xls,.xlsx"
            :http-request="upload"
            :on-change="changeUpload"
            :on-remove="removeUpload"
            :file-list="fileList"
            :limit="1"
          >
            <el-button size="small" type="primary">导入</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showImportFileDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="confirmImportFile">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
export default {
  components: { Pagination },
  data() {
    return {
      listQuery: {
        keyword: '',
        page: 1,
        limit: 10
      },
      dataList: [],
      total: 0,
      fileList: [],
      fileListLength: '',
      showImportFileDialog: false,
      allSelection: [],
      multipleSelection: [],
      ideField: 'id', // 匹配的字段，用id
      wiringItems: [],
      proTypeData: [],
      deviceTypeData: [],
      checkList: ['线缆名称', '规格程式', '机柜', 'From', '端口号', '机柜2', 'To',	'端口号2',	'布放方式',	'条数',	'平均条长（米）',	'数量（米）',	'备注'],
      lists: [
        {label: '线缆名称', ispass: false},
        {label: '规格程式', ispass: false},
        {label: '机柜', ispass: false},
        {label: 'From', ispass: false},
        {label: '端口号', ispass: false},
        {label: '机柜2', ispass: false},
        {label: 'To', ispass: false},
        {label: '端口号2', ispass: false},
        {label: '布放方式', ispass: false},
        {label: '条数', ispass: false},
        {label: '平均条长（米）', ispass: false},
        {label: '数量（米）', ispass: false},
        {label: '备注', ispass: false}
      ]
    }
  },
  watch: {
    wiringItems(newVal) {
      if (newVal) {
        this.localStorageOperation('set', 'wiringItems', newVal)
        let arr = this.checkList.filter(i => newVal.indexOf(i) < 0) // 未选中
        this.lists.map(i => {
          if (arr.indexOf(i.label) !== -1) {
            i.ispass = false
          } else {
            i.ispass = true
          }
        })
      }
    }
  },
  mounted() {
    this.findEsightLine()
  },
  methods: {
    // 上传文件
    upload(param) {
      this.fdata.append('uploadfile', param.file)
    },
    // 删除文件
    removeUpload() {
      this.fileListLength = ''
    },
    // 检测upload上传变换
    changeUpload(file, fileList) {
      this.fileListLength = file
    },
    // 打开弹窗
    openImportFileDialog() {
      this.fdata = new FormData()
      this.showImportFileDialog = true
    },
    // 上传文件
    confirmImportFile() {
      const _this = this
      if (this.fileListLength) {
        this.$request({
          url: this.api.itMonitor.importEsightLine,
          data: { file: _this.fileListLength.raw }
        }).then(res => {
          if (res.code === 1) {
            _this.$message.success('上传成功')
            this.$refs.uploadRef.clearFiles()
            this.showImportFileDialog = false
            this.findEsightLine()
          }
        })
      } else {
        _this.$message.error('请先选择文件')
      }
    },
    // 新增
    handleCreate() {
      this.$router.push({
        name: 'wiringTableCreate'
      })
    },
    // 编辑
    onEdit(row) {
      this.$router.push({
        name: 'wiringTableUpdate', query: { id: row.id }
      })
    },
    // 查询列表数据
    findEsightLine() {
      this.$request({
        url: this.api.itMonitor.findEsightLine,
        data: { ...this.listQuery }
      }).then(res => {
        if (res.code === 1) {
          this.dataList = res.data
          this.total = Number(res.count)
          // 添加已选项的勾选状态
          this.allSelection.forEach(item => { // allSelection 已选数据
            this.$nextTick(() => {
              this.dataList.find(obj => { // dataList 表单数据
                if (item.id === obj.id) {
                  this.$refs.table.toggleRowSelection(obj, true)
                }
              })
            })
          })
          // 获取保存的显示配置
          const itemsData = this.localStorageOperation('get', 'wiringItems')
          // 初次进入默认访问以下十个字段
          itemsData ? this.wiringItems = itemsData : this.wiringItems = ['线缆名称', '规格程式', '机柜', 'From', '端口号', '机柜2', 'To',	'端口号2',	'布放方式',	'条数',	'平均条长（米）',	'数量（米）',	'备注']
        }
      })
    },
    // 删除
    onDelete(row) {
      this.$confirm('确定删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request({
          url: this.api.itMonitor.deleteEsightLine,
          data: {id: row.id}
        }).then(res => {
          if (res.code === 1) {
            this.$message.success('删除成功')
            this.findEsightLine()
          }
        })
      })
    },
    // 批量删除
    deleteEsightLine() {
      if (this.allSelection.length < 1) {
        this.$message('请选择布线信息')
        return
      }
      this.$confirm('确定删除选中项吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = []
        this.allSelection.forEach(item => {
          ids.push(item.id)
        })
        this.$request({
          url: this.api.itMonitor.deleteEsightLines,
          data: {ids: ids.toString()}
        }).then(res => {
          if (res.code === 1) {
            this.$message.success('删除成功')
            this.findEsightLine()
          }
        })
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      let setPagingSelection = [...this.allSelection, ...val]
      setPagingSelection = setPagingSelection.map((it) => JSON.stringify(it))
      setPagingSelection = [...new Set(setPagingSelection)].map((item) =>
        JSON.parse(item)
      )
      this.allSelection = setPagingSelection
    },
    handleSelect(rows, row) {
      let selected = rows.length && rows.indexOf(row) !== -1
      if (!selected) {
        this.allSelection = this.allSelection.filter(
          (it) => it[this.ideField] !== row[this.ideField]
        )
      }
    }
  }
}
</script>
  <style lang="scss" scoped>
      .screen {
        float: right;
        .icon {
            border: 2px solid gray;
            font-size:25px;
        }
    }
  </style>

