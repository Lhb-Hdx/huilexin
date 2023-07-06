<template>
  <div class="app-container flex" style="padding:0">
    <div class="page-left">
      <GroupAuction />
      <GroupTree :tree-list="groupTree" />
    </div>
    <div ref="pageRight" class="page-right">
      <template v-if="!handlerCabinetData.cabinetId">
        <div class="app-container">
          <div class="filter-container">
            <el-button v-permission="['Create']" class="filter-item" type="primary" @click="create">新增</el-button>
            <el-input v-model="listQuery.keyword" v-permission="['Search']" placeholder="搜索关键词" class="filter-item" clearable style="width: 200px" />
            <el-button v-permission="['Search']" class="filter-item" type="primary" @click="search">查询</el-button>
            <el-button class="filter-item" type="primary" icon="el-icon-download" @click="download">模板下载</el-button>
            <el-button class="filter-item" type="primary" icon="el-icon-upload2" @click="onBulkImportModal">导入</el-button>
          </div>
          <div class="table-wrapper">
            <el-table :data="cabinetList">
              <el-table-column label="机柜名称" prop="name" show-overflow-tooltip />
              <el-table-column label="U位" prop="capacity" width="100px" show-overflow-tooltip />
              <el-table-column label="已用" prop="usedCount" width="100px" show-overflow-tooltip />
              <el-table-column label="可用" prop="availableCount" width="100px" show-overflow-tooltip />
              <el-table-column label="可用度" width="200px">
                <template slot-scope="{row}">
                  <el-progress :percentage="setAvailability(row)" />
                </template>
              </el-table-column>
              <el-table-column label="额定供电（KW）" prop="ratedPower" show-overflow-tooltip />
              <el-table-column label="重量（KG）" prop="weight" show-overflow-tooltip />
              <el-table-column label="描述" prop="des" show-overflow-tooltip />
              <el-table-column label="操作" width="300px">
                <template slot-scope="{row}">
                  <el-button v-permission="['Detail']" type="primary" size="mini" @click="onDetail(row)">查看</el-button>
                  <el-button v-permission="['Config']" type="primary" size="mini" @click="onConfig(row)">配置</el-button>
                  <el-button v-permission="['Edit']" type="primary" size="mini" @click="onEdit(row)">编辑</el-button>
                  <el-button v-permission="['Delete']" type="danger" size="mini" @click="onDel(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <pagination v-show="cabinetTotal > 0" :auto-scroll="false" :total="cabinetTotal" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findDiagramCabinet" />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="detail-main">
          <div class="map" :style="{ 'height': pageRightHeight + 'px' }">
            <div class="header-btn-left">
              <el-button class="filter-item" size="mini" type="primary" @click="onDetailBack">返回</el-button>
            </div>
            <div class="header-btn">
              <el-button class="filter-item" size="mini" type="primary" @click="editCabinet">编辑</el-button>
            </div>
            <CabinetMap :key="reloadMapKey" :cabinet-id="handlerCabinetData.cabinetId" mode="preview" />
          </div>
          <div class="detail" :style="{ 'height': pageRightHeight + 'px' }">
            <CabinetDetailStatistics />
          </div>
        </div>
      </template>
    </div>
    <el-dialog :title="dialogTitle" :visible.sync="showDialog" :append-to-body="true" width="40%" top="5vh">
      <div class="dialog-body">
        <el-form ref="form" :model="form" :rules="rules" label-width="110px">
          <el-form-item label="机柜名称" prop="name">
            <el-input v-model.trim="form.name" placeholder="请输入机柜名称" />
          </el-form-item>
          <el-form-item label="总容量" prop="capacity">
            <el-input v-model.trim="form.capacity" type="number" placeholder="请输入总容量">
              <template slot="append">U</template>
            </el-input>
          </el-form-item>
          <el-form-item label="额定供电" prop="ratedPower">
            <el-input v-model.trim="form.ratedPower" type="number" placeholder="请输入额定供电">
              <template slot="append">KW</template>
            </el-input>
          </el-form-item>
          <el-form-item label="总重量" prop="weight">
            <el-input v-model.trim="form.weight" type="number" placeholder="请输入总容量">
              <template slot="append">KG</template>
            </el-input>
          </el-form-item>
          <el-form-item label="分组" prop="groupId">
            <AiTreeInput
              :key="reloadKey"
              :level-start-num="0"
              :field="{'id':'id','name':'groupName','parent':'parentId'}"
              :remote="api.diagram.findDiagramCabinetGroup"
              :infoapi="api.diagram.getDiagramCabinetGroup"
              placeholder="请输入上层分组"
              :param="{limit: -1}"
              :bind-value="form.groupId"
              :mounted-require="true"
              @input="inputParent"
            />
          </el-form-item>
          <el-form-item label="图标" label-width="110px" prop="imageUrl">
            <FileUpload
              button-text="上传"
              upload-type="pic"
              file-type=".png,.jpg"
              :limit="1"
              :button-disabled="false"
              :is-limit-file-size="true"
              :file-max-size="1"
              :file-url-list="fileList"
              file-url-list-type="picture"
              button-type="primary"
              @emitFileList="getEmitFileList"
            />
          </el-form-item>
          <el-form-item label="描述" prop="des">
            <el-input v-model="form.des" placeholder="请输入描述" type="textarea" />
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="confirm">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 导入 -->
    <el-dialog title="导入" :visible.sync="bulkImportModal">
      <el-form ref="rulesBulk" :model="bulkImport" :rules="rulesBulk">
        <el-form-item label="选择文件" :label-width="formLabelWidth">
          <el-upload
            class="upload-demo text-left"
            action
            accept=".xls,.xlsx"
            :http-request="upload"
            :on-change="changeUpload"
            :file-list="fileList"
          >
            <el-button size="small" type="primary">选择文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="bulkImportModal = false">取 消</el-button>
        <el-button type="primary" @click="toLead('rulesBulk')">导 入</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import GroupTree from './components/GroupTree'
import GroupAuction from './components/GroupAuction'
import Pagination from '@/components/Pagination'
import FileUpload from '@/components/Upload/file-upload.vue'
import AiTreeInput from '@/components/AiTreeInput/vue-auto-input-tree'
import CabinetMap from '@/components/Cabinet/Components/CabinetMap'
import CabinetDetailStatistics from '@/components/Cabinet/Components/CabinetDetailStatistics'

export default {
  components: {
    GroupTree,
    GroupAuction,
    Pagination,
    FileUpload,
    AiTreeInput,
    CabinetMap,
    CabinetDetailStatistics
  },
  data() {
    const checkgGroupId = (val, rule, callback) => {
      if (val === 0 || val === '') return callback(new Error('请选择分组'))
      callback()
    }
    return {
      groupData: [],
      groupTree: [],
      listQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        groupId: ''
      },
      cabinetList: [],
      cabinetTotal: 0,
      form: {
        name: '',
        capacity: '',
        weight: '',
        ratedPower: '',
        des: '',
        groupId: 0
      },
      formId: '',
      showDialog: false,
      dialogTitle: '新增机柜',
      rules: {
        name: [
          { required: true, message: '请输入机柜名称', trigger: 'blur' }
        ],
        capacity: [
          { required: true, message: '请输入总容量', trigger: 'blur' }
        ],
        groupId: [
          { validator: checkgGroupId, required: true, message: '请选择分组', trigger: 'change' }
        ]
      },
      fileList: [],
      reloadKey: 'reloadKey',
      handlerTreeItemVal: null,
      lastGroupStorage: null,
      lastStorage: {},
      handlerCabinetData: {}, // 点击的机柜图数据
      pageRightHeight: 0,
      bulkImportModal: false,
      bulkImport: { // 导入参数
        name: ''
      },
      rulesBulk: {
        name: [
          { required: true, message: '请选择文件', trigger: 'blur' }
        ]
      },
      formLabelWidth: '120px',
      reloadMapKey: 'reloadMapKey'
    }
  },
  computed: {
    // 可用度百分比
    setAvailability() {
      return function(row) {
        return Math.floor((row.availableCount / (row.availableCount + row.usedCount)) * 100)
      }
    }
  },
  mounted() {
    this.findGroupData()
    this.findDiagramCabinet()
    this.$EventBus.$on('detail', (res) => {
      this.handlerCabinetData = res
      this.reloadMapKey = this.$tool.guid()
    })
    this.$EventBus.$on('handler-group-item', (res) => {
      this.handlerCabinetData = {}
      this.$set(this.listQuery, 'groupId', res.treeItemId)
      this.findDiagramCabinet()
    })
    this.setSize()
    this.$EventBus.$on('click-catalogue', () => {
      this.$set(this.listQuery, 'page', 1)
      this.$set(this.listQuery, 'limit', 10)
      this.$set(this.listQuery, 'keyword', '')
      this.$set(this.listQuery, 'groupId', '')
      this.findDiagramCabinet()
    })
  },
  methods: {
    // 模板下载
    download() {
      const url = `${process.env.VUE_APP_BASE_API}/manage/机柜导入模板.xlsx?token=${this.localStorageOperation('get', 'loginToken')}`
      window.open(url)
    },
    // 导入
    onBulkImportModal() {
      this.fileList = []
      this.bulkImportModal = true
      this.fdata = new FormData()
    },
    // 上传文件
    upload(param) {
      console.log(param.file)
      this.fdata.append('uploadfile', param.file)
      this.fdata.append('format', 'xml')
    },
    // 上传
    toLead(formname) {
      const _this = this
      _this.$refs[formname].validate((val) => {
        if (val) {
          console.log(_this.bulkImport)
          this.$request({
            url: this.api.upload.importDiagramCabinetGroup,
            data: { file: _this.bulkImport.raw}
          })
            .then(async (res) => {
              if (res.code === 1) {
                console.log(res)
                _this.bulkImport = {
                  name: ''
                }
                _this.bulkImportModal = false
                _this.$message({
                  type: 'success',
                  message: '导入成功'
                })
                await _this.findGroupData()
                await _this.findDiagramCabinet()
              }
            })
        } else {
          _this.$message.error('请先选择文件')
        }
      })
    },
    // 检测upload上传变换
    changeUpload(file, fileList) {
      const _this = this
      _this.bulkImport = file
      console.log(_this.bulkImport)
      console.log(fileList)
    },
    // 设置分组数据
    async findGroupData() {
      // 查询第一级分组
      const firstLevelGroup = await this.findDiagramCabinetGroup({ parentId: 0 })
      const allGroup = await this.findDiagramCabinetGroup({ limit: -1 })
      const groupTree = []
      firstLevelGroup.forEach(item => {
        groupTree.push({
          isGroup: true,
          treeItemId: item.id,
          treeItemName: item.groupName,
          treeParentId: item.parentId,
          imageUrl: item.imageUrl,
          expand: false,
          group: [],
          level: 0,
          cabinet: [],
          groupIndex: item.groupIndex
        })
      })
      this.groupTree = groupTree
      this.groupTree.sort(this.$tool.compareJson('groupIndex', 'up'))
      this.groupData = this.$tool.listToTree(allGroup, 0, 0, 'id', 'parentId')
    },
    // 查询分组目录
    async findDiagramCabinetGroup(query) {
      const { code, data } = await this.$request({
        url: this.api.diagram.findDiagramCabinetGroup,
        data: query
      })
      if (code !== 1) return
      return data
    },
    // 查询机柜
    async findDiagramCabinet() {
      this.$request({
        url: this.api.diagram.findDiagramCabinet,
        data: this.listQuery
      }).then(async res => {
        if (res.code === 1) {
          const cabinetIds = []
          res.data.forEach(item => {
            cabinetIds.push(item.cabinetId)
          })
          const getDiagramCabinetStatistics = await this.getDiagramCabinetStatistics(cabinetIds.toString())
          if (getDiagramCabinetStatistics) {
            const cabinetStatisticsData = JSON.parse(getDiagramCabinetStatistics)
            res.data.forEach(item => {
              const idx = cabinetStatisticsData.findIndex(items => +items.cabinetId === +item.cabinetId)
              if (idx !== -1) {
                item.availability = cabinetStatisticsData[idx].availability
                item.availableCount = cabinetStatisticsData[idx].availableCount
                item.usedCount = cabinetStatisticsData[idx].usedCount
              }
            })
          }
          this.cabinetList = res.data
          this.cabinetTotal = +res.count
        }
      })
    },
    // 搜索
    search() {
      this.$set(this.listQuery, 'page', 1)
      this.findDiagramCabinet()
    },
    // 进入详情
    onDetail(row) {
      this.handlerCabinetData = row
    },
    onDetailBack() {
      this.handlerCabinetData = {}
    },
    // 进入编辑配置
    onEdit(row) {
      this.lastStorage = row
      this.formId = row.cabinetId
      Object.keys(this.form).forEach(key => {
        this.$set(this.form, `${key}`, row[`${key}`])
      })
      this.showDialog = true
    },
    // 进入配置
    onConfig(row) {
      this.$router.push({
        name: 'CabinetConfig',
        query: {
          id: row.cabinetId
        }
      })
    },
    // 删除
    onDel(row) {
      this.$confirm('确定删除吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const { code } = await this.$request({
          url: this.api.diagram.deleteDiagramCabinet,
          data: { cabinetId: row.cabinetId }
        })
        if (code !== 1) return this.$message.error('删除失败')
        this.$message.success('删除成功')
        this.$nextTick(() => {
          this.findDiagramCabinet()
          this.$EventBus.$emit('delete-group-cabinet', { deleteInType: 'group', deletePId: row.groupId, deleteId: row.cabinetId })
        })
      })
    },
    // 新增
    create() {
      this.formId = ''
      Object.keys(this.form).forEach(key => {
        this.$set(this.form, `${key}`, '')
      })
      this.$set(this.form, 'groupId', 0)
      this.showDialog = true
    },
    // 监听选择上级分组
    inputParent(val) {
      this.$set(this.form, 'groupId', Number(val))
    },
    // 监听文件上传
    getEmitFileList(file) {
      this.fileList = file['fileList']
      this.$set(this.form, 'icon', file.fileList.length > 0 ? file.fileList[0]['url'] : '')
    },
    // 保存
    confirm() {
      const data = { ...this.form }
      // if (data.groupId === '' || data.groupId === null) data.groupId = 0
      this.$refs['form'].validate(valid => {
        if (valid) {
          const requestTopologyInfoApi = this.formId ? this.api.diagram.updateDiagramCabinet : this.api.diagram.insertDiagramCabinet
          if (this.formId) {
            data.cabinetId = this.formId
          }
          this.$request({
            url: requestTopologyInfoApi, data
          }).then(async res => {
            if (res.code === 1) {
              this.$message({
                type: 'success',
                message: res.msg
              })
              this.showDialog = false
              this.findDiagramCabinet()
              if (this.formId === '') {
                this.$EventBus.$emit('add-group-cabinet', { setInType: 'group', setInId: data.groupId, data: [res.model] })
              } else {
                this.$EventBus.$emit('update-group-cabinet', {
                  fromType: 'group',
                  fromPid: this.lastStorage.groupId,
                  toType: 'group',
                  toPid: data.groupId,
                  updateId: this.formId,
                  data: res.model
                })
              }
              // if (this.formId === '') {
              //   // 插入分组到分组
              //   this.$EventBus.$emit('add-group', { setInType: 'group', setInId: data.parentId, data: res.model })
              // } else {
              //   // 更新分组到分组
              //   this.$EventBus.$emit('update-group', {
              //     fromType: 'group', // 修改前分组挂在那个类型下 area：区域 group：分组
              //     fromPid: this.lastGroupStorage.parentId, // 修改前分组挂在的上层id 挂在区域下就是区域id，挂在分组就是分组id
              //     toType: 'group', // 修改后分组挂在那个类型下
              //     toPid: data.parentId, // 修改后分组挂在的上层id
              //     updateId: this.formId, // 要修改的节点
              //     data: res.model
              //   })
              // }
            }
          })
        }
      })
    },
    // 设置右侧div高度
    setSize() {
      const pageRight = this.$refs.pageRight
      this.pageRightHeight = window.innerHeight - pageRight.getBoundingClientRect().top - 10
    },
    // 点击编辑
    editCabinet() {
      this.$router.push({
        name: 'CabinetConfig',
        query: {
          id: this.handlerCabinetData.cabinetId
        }
      })
    },
    // 查询机柜
    async getDiagramCabinetStatistics(cabinetIds) {
      const { code, model } = await this.$request({
        url: this.api.diagram.getDiagramCabinetStatistics,
        data: { cabinetIds }
      })
      if (code !== 1) return
      return model
    }
  }
}
</script>

<style lang="scss" scoped>
.page-left {
  width: 300px;
  background: #e5ecf6;
  position: fixed;
  height: 100%;
  overflow-x: hidden;
}
.page-right {
  padding-left: 300px;
  height: 100%;
  width: 100%;
  .detail-main {
    display: flex;
    .map {
      width: 70%;
      overflow-y: auto;
      .header-btn {
        width: 100%;
        text-align: right;
        padding: 15px 10px;
      }
      .header-btn-left {
        width: 100%;
        text-align: left;
        padding: 15px 10px;
      }
    }
    .detail {
      width: 30%;
      overflow-y: auto;
    }
  }
}
</style>
