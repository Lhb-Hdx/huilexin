<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
      <el-input v-model="listQuery.keyword" placeholder="请输入搜索关键词" clearable class="filter-item filter-item-input" />
      <el-select v-model="listQuery.proType" placeholder="产品类别" clearable class="filter-item" style="width: 200px">
        <el-option v-for="item in proTypeData" :key="item.catId" :label="item.catName" :value="item.catName" />
      </el-select>
      <el-select v-model="listQuery.deviceType" placeholder="设备类型" clearable class="filter-item" style="width: 200px">
        <el-option v-for="item in deviceTypeData" :key="item.catId" :label="item.catName" :value="item.catName" />
      </el-select>
      <el-button class="filter-item" type="primary" @click="findEsightCmdb">查询</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-upload2" @click="openImportFileDialog">导入</el-button>
      <el-button class="filter-item" type="danger" @click="deleteEsightCmdb">批量删除</el-button>
      <el-dropdown :hide-on-click="false" class="filter-item screen">
        <!-- <el-button type="primary">
          筛选<i class="el-icon-arrow-down el-icon--right" />
        </el-button> -->
        <i class="icon el-icon-s-operation" />
        <el-dropdown-menu slot="dropdown">
          <el-scrollbar style="height: 60vh">
            <el-checkbox-group v-model="filterItems">
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
        <el-table-column v-if="lists[0].ispass" label="更新时间" align="left" prop="updateTime" show-overflow-tooltip />
        <el-table-column v-if="lists[1].ispass" label="云分类" align="left" prop="cloudType" show-overflow-tooltip />
        <el-table-column v-if="lists[2].ispass" label="产品类别" align="left" prop="proType" show-overflow-tooltip />
        <el-table-column v-if="lists[3].ispass" label="产品类别英文" align="left" prop="proTypeEn" show-overflow-tooltip />
        <el-table-column v-if="lists[4].ispass" label="产品子类别" align="left" prop="proSubType" show-overflow-tooltip />
        <el-table-column v-if="lists[5].ispass" label="产品子类别简写" align="left" prop="proSubTypeShort" show-overflow-tooltip />
        <el-table-column v-if="lists[6].ispass" label="资产归属" align="left" prop="assets" show-overflow-tooltip />
        <el-table-column v-if="lists[7].ispass" label="设备类型" align="left" prop="deviceType" show-overflow-tooltip />
        <el-table-column v-if="lists[8].ispass" label="设备型号" align="right" prop="deviceModel" show-overflow-tooltip />
        <el-table-column v-if="lists[9].ispass" label="厂家" align="left" prop="manufactor" show-overflow-tooltip />
        <el-table-column v-if="lists[10].ispass" label="数据中心" align="left" prop="dataCenter" show-overflow-tooltip />
        <el-table-column v-if="lists[11].ispass" label="网络区域" align="left" prop="netArea" show-overflow-tooltip />
        <el-table-column v-if="lists[12].ispass" label="机房id" align="right" prop="computerRoom" show-overflow-tooltip />
        <el-table-column v-if="lists[13].ispass" label="机柜编号" align="right" prop="deviceAddr" show-overflow-tooltip />
        <el-table-column v-if="lists[14].ispass" label="设备位置" align="left" prop="deviceAddr" show-overflow-tooltip />
        <el-table-column v-if="lists[15].ispass" label="占用机位数" align="right" prop="deviceSize" show-overflow-tooltip />
        <el-table-column v-if="lists[16].ispass" label="序号" align="left" prop="indexNo" show-overflow-tooltip />
        <el-table-column v-if="lists[17].ispass" label="主机名1" align="left" prop="hostName1" show-overflow-tooltip />
        <el-table-column v-if="lists[18].ispass" label="主机名2" align="left" prop="hostName2" show-overflow-tooltip />
        <el-table-column v-if="lists[19].ispass" label="设备状态" align="left" prop="deviceStatue" show-overflow-tooltip />
        <el-table-column v-if="lists[20].ispass" label="业务状态" align="left" prop="businessStatue" show-overflow-tooltip />
        <el-table-column v-if="lists[21].ispass" label="SN" prop="sn" align="right" show-overflow-tooltip />
        <el-table-column v-if="lists[22].ispass" label="UUID" prop="uuid" align="right" show-overflow-tooltip />
        <el-table-column v-if="lists[23].ispass" label="固资号" prop="assetsNo" align="right" show-overflow-tooltip />
        <el-table-column v-if="lists[24].ispass" label="带外管理地址" align="left" prop="ip" show-overflow-tooltip />
        <el-table-column v-if="lists[25].ispass" label="管理网地址" align="right" prop="manageIp" show-overflow-tooltip />
        <el-table-column v-if="lists[26].ispass" label="存储网地址" align="right" prop="storeIp" show-overflow-tooltip />
        <el-table-column v-if="lists[27].ispass" label="内部地址(VPC地址)" align="right" prop="insideIp" show-overflow-tooltip />
        <el-table-column v-if="lists[28].ispass" label="业务网地址(外部网络)（可放通策略与其他网络通信）" align="right" prop="businessIp" show-overflow-tooltip />
        <el-table-column v-if="lists[29].ispass" label="设备管理人员" align="left" prop="user" show-overflow-tooltip />
        <el-table-column v-if="lists[30].ispass" label="管理人员联系电话" align="right" prop="userTel" show-overflow-tooltip />
        <el-table-column v-if="lists[31].ispass" label="管理人员邮箱" align="right" prop="userEmail" show-overflow-tooltip />
        <el-table-column v-if="lists[32].ispass" label="设备上架/启用时间" align="right" prop="deviceOnDate" show-overflow-tooltip />
        <el-table-column v-if="lists[33].ispass" label="设备维保到期时间" align="right" prop="deviceOutDate" show-overflow-tooltip />
        <el-table-column v-if="lists[34].ispass" label="设备是否变更" align="left" prop="deviceChange" show-overflow-tooltip />
        <el-table-column v-if="lists[35].ispass" label="备注" align="left" prop="backup" show-overflow-tooltip />
        <el-table-column v-if="lists[36].ispass" label="厂家合同编号" align="right" prop="contractNo" show-overflow-tooltip />
        <el-table-column v-if="lists[37].ispass" label="电信合同编号" align="right" prop="contractNo2" show-overflow-tooltip />
        <el-table-column v-if="lists[38].ispass" label="WBS编号" align="right" prop="wbsNo" show-overflow-tooltip />
        <el-table-column v-if="lists[39].ispass" label="设备期数" align="right" prop="deviceStage" show-overflow-tooltip />
        <el-table-column v-if="lists[40].ispass" label="布线表文件名称" align="left" prop="fileName" show-overflow-tooltip />
        <el-table-column v-if="lists[41].ispass" label="扩容上线蓝鲸工单号" align="left" prop="lineNo" show-overflow-tooltip />
        <el-table-column v-if="lists[42].ispass" label="是否能纳管" align="left" prop="manage" show-overflow-tooltip />
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
      <pagination v-show="total>0" :auto-scroll="false" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findEsightCmdb" />
    </div>
    <el-dialog title="导入" :visible.sync="showImportFileDialog" width="50%" top="5vh">
      <el-form label-width="90px">
        <el-form-item label="选择文件">
          <el-upload
            ref="uploadRef"
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
        limit: 10,
        proType: '',
        deviceType: ''
      },
      dataList: [],
      total: 0,
      fileList: [],
      fileListLength: '',
      showImportFileDialog: false,
      allSelection: [],
      multipleSelection: [],
      ideField: 'id', // 匹配的字段，用id
      filterItems: [],
      proTypeData: [],
      deviceTypeData: [],
      checkList: ['更新时间', '云分类', '产品类别', '产品类别英文', '产品子类别', '产品子类别简写', '资产归属',	'设备类型',	'设备型号',	'厂家',	'数据中心',	'网络区域',	'机房id', '机柜编号', '设备位置', '占用机位数', '序号', '主机名1', '主机名2', '设备状态', '业务状态', 'SN', 'UUID', '固资号', '带外管理地址', '管理网地址', '存储网地址', '内部地址(VPC地址)', '业务网地址(外部网络)（可放通策略与其他网络通信）', '设备管理人员', '管理人员联系电话', '管理人员邮箱', '设备上架/启用时间', '设备维保到期时间', '设备是否变更',	'备注',	'厂家合同编号',	'电信合同编号',	'WBS编号',	'设备期数',	'布线表文件名称', '扩容上线蓝鲸工单号', '是否能纳管'],
      lists: [
        {label: '更新时间', prop: 'deviceOnDate', ispass: false},
        {label: '云分类', prop: 'cloudType', ispass: false},
        {label: '产品类别', prop: 'proType', ispass: false},
        {label: '产品类别英文', prop: 'proTypeEn', ispass: false},
        {label: '产品子类别', prop: 'proSubType', ispass: false},
        {label: '产品子类别简写', prop: 'proSubTypeShort', ispass: false},
        {label: '资产归属', prop: 'assets', ispass: false},
        {label: '设备类型', prop: 'deviceType', ispass: false},
        {label: '设备型号', prop: 'deviceModel', ispass: false},
        {label: '厂家', prop: 'manufactor', ispass: false},
        {label: '数据中心', prop: 'dataCenter', ispass: false},
        {label: '网络区域', prop: 'netArea', ispass: false},
        {label: '机房id', prop: 'computerRoom', ispass: false},
        {label: '机柜编号', prop: 'deviceAddr', ispass: false},
        {label: '设备位置', prop: 'deviceAddr', ispass: false},
        {label: '占用机位数', prop: 'deviceSize', ispass: false},
        {label: '序号', prop: 'indexNo', ispass: false},
        {label: '主机名1', prop: 'hostName1', ispass: false},
        {label: '主机名2', prop: 'hostName2', ispass: false},
        {label: '设备状态', prop: 'deviceStatue', ispass: false},
        {label: '业务状态', prop: 'businessStatue', ispass: false},
        {label: 'SN', prop: 'sn', ispass: false},
        {label: 'UUID', prop: 'uuid', ispass: false},
        {label: '固资号', prop: 'assetsNo', ispass: false},
        {label: '带外管理地址', prop: 'ip', ispass: false},
        {label: '管理网地址', prop: 'manageIp', ispass: false},
        {label: '存储网地址', prop: 'storeIp', ispass: false},
        {label: '内部地址(VPC地址)', prop: 'insideIp', ispass: false},
        {label: '业务网地址(外部网络)（可放通策略与其他网络通信）', prop: 'businessIp', ispass: false},
        {label: '设备管理人员', prop: 'user', ispass: false},
        {label: '管理人员联系电话', prop: 'userTel', ispass: false},
        {label: '管理人员邮箱', prop: 'userEmail', ispass: false},
        {label: '设备上架/启用时间', prop: 'updateTime', ispass: false},
        {label: '设备维保到期时间', prop: 'deviceOutDate', ispass: false},
        {label: '设备是否变更', prop: 'deviceChange', ispass: false},
        {label: '备注', prop: 'backup', ispass: false},
        {label: '厂家合同编号', prop: 'contractNo', ispass: false},
        {label: '电信合同编号', prop: 'contractNo2', ispass: false},
        {label: 'WBS编号', prop: 'wbsNo', ispass: false},
        {label: '设备期数', prop: 'deviceStage', ispass: false},
        {label: '布线表文件名称', prop: 'fileName', ispass: false},
        {label: '扩容上线蓝鲸工单号', prop: 'lineNo', ispass: false},
        {label: '是否能纳管', prop: 'manage', ispass: false}
      ]
    }
  },
  watch: {
    filterItems(newVal) {
      if (newVal) {
        this.localStorageOperation('set', 'filterItems', newVal)
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
    this.findEsightCmdb()
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
          url: this.api.itMonitor.importEsightCmdb,
          data: { file: _this.fileListLength.raw }
        }).then(res => {
          if (res.code === 1) {
            _this.$message.success('上传成功')
            this.$refs.uploadRef.clearFiles()
            this.showImportFileDialog = false
            this.findEsightCmdb()
          }
        })
      } else {
        _this.$message.error('请先选择文件')
      }
    },
    // 新增
    handleCreate() {
      this.$router.push({
        name: 'cmdbTableCreate'
      })
    },
    // 编辑
    onEdit(row) {
      this.$router.push({
        name: 'cmdbTableUpdate', query: { id: row.id }
      })
    },
    // 获取故障类型
    async findSysCat(val) {
      let { code, data } = await this.$request({
        url: this.api.sys.findSysCat,
        data: {
          page: 1,
          limit: -1,
          systemName: 'userDefine',
          classify: val,
          parentId: -1,
          module: 2
        }
      })
      if (code !== 1) return
      return data
    },
    // 查询列表数据
    findEsightCmdb() {
      this.$request({
        url: this.api.itMonitor.findEsightCmdb,
        data: { ...this.listQuery }
      }).then(async res => {
        if (res.code === 1) {
          this.dataList = res.data
          this.total = Number(res.count)
          this.proTypeData = await this.findSysCat('userDefine_产品类别')
          this.deviceTypeData = await this.findSysCat('userDefine_设备类型')
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
          const itemsData = this.localStorageOperation('get', 'filterItems')
          // 初次进入默认访问以下十个字段
          itemsData ? this.filterItems = itemsData : this.filterItems = ['更新时间', '云分类', '产品类别', '产品类别英文', '产品子类别', '产品子类别简写', '资产归属',	'设备类型',	'设备型号',	'厂家']
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
          url: this.api.itMonitor.deleteEsightCmdb,
          data: {id: row.id}
        }).then(res => {
          if (res.code === 1) {
            this.$message.success('删除成功')
            this.findEsightCmdb()
          }
        })
      })
    },
    // 批量删除
    deleteEsightCmdb() {
      if (this.allSelection.length < 1) {
        this.$message('请选择CMDB信息')
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
          url: this.api.itMonitor.deleteEsightCmdbs,
          data: {ids: ids.toString()}
        }).then(res => {
          if (res.code === 1) {
            this.$message.success('删除成功')
            this.findEsightCmdb()
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

