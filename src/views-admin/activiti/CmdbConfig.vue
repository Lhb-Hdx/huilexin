<template>
  <div class="cmdb_container">
    <!-- 列表头部区：搜索框/按钮 -->
    <el-form :inline="true" :model="listQuery" class="demo-form-inline">
      <!-- 列表描述 -->
      <el-form-item label="列表描述 : " class="filter-item">
        <el-input v-model="listQuery.name" placeholder="请输入实体类目名称" clearable @change="handleSearch" />
      </el-form-item>
      <!-- 表名 -->
      <el-form-item label="表名" class="filter-item">
        <el-input v-model="listQuery.tableName" class="filter-item" placeholder="请输入表名,例如:hyit_area" clearable @change="handleSearch" />
      </el-form-item>

      <!-- 按钮区域： -->
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </el-form-item>
      <!-- 新增按钮 -->
      <el-form-item>
        <el-button v-permission="['create']" class="filter-item" type="primary" @click="handleAdd"> 新增 </el-button>
      </el-form-item>
      <!-- CMDB自动化按钮 -->
      <el-form-item>
        <el-button v-permission="['cmdbAuto']" class="filter-item" type="primary" @click="handleCmdbAuto"> CMDB自动化 </el-button>
      </el-form-item>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </el-form>

    <!-- 列表内容区域 -->
    <div class="table-wrapper">
      <el-table :data="tableData" style="width: 100%" @selection-change="handleSelectionChange" @sort-change="sortChange">
        <el-table-column type="selection" width="50" align="left" />
        <!-- 实体类目名称 -->
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" label="实体类目名称" show-overflow-tooltip align="left">
          <template slot-scope="{ row }">
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <!-- 图标 -->
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" label="图标" show-overflow-tooltip align="left">
          <template slot-scope="{ row }">
            <el-image fit="fill" :src="setIcon(row.imageUrl)" style="width: 20px; height: 20px">
              <div slot="error" class="image-slot el-image-sort no-background" />
            </el-image>
          </template>
        </el-table-column>
        <!-- 实体数量 -->
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" label="实体数量" show-overflow-tooltip align="left">
          <template slot-scope="{ row }">
            <span>{{ row.itemCount }}</span>
          </template>
        </el-table-column>
        <!-- 关系数量 -->
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" label="关系数量" show-overflow-tooltip align="left">
          <template slot-scope="{ row }">
            <span>{{ row.relationshipCount }}</span>
          </template>
        </el-table-column>
        <!-- 业务表名 -->
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" label="业务表名" show-overflow-tooltip align="left">
          <template slot-scope="{ row }">
            <span>{{ row.tableName }}</span>
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" label="操作" align="left" width="200px">
          <template slot-scope="{ row }">
            <el-button v-permission="['edit']" size="mini" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button v-permission="['delete']" size="mini" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 弹窗区域：新增/编辑 -->
    <el-dialog :title="dialogStatus === 'update' ? '实体类目编辑' : '实体类目新增'" :visible.sync="dialogFormVisible" center width="90%" inline>
      <el-form ref="dataForm" :model="dailogData" :inline="true">
        <!-- 第一行 -->
        <div class="tabLine_1">
          <el-form-item label="业务表描述 :" prop="name" :label-width="formLabelWidth">
            <el-input v-model="dailogData.name" clearable />
          </el-form-item>
          <el-form-item label="业务表名 :" prop="tableName" :label-width="formLabelWidth">
            <!-- <el-input
              v-model="dailogData.tableName"
              clearable
              @change="handleSearch"
            /> -->
            <el-select filterable :value="dailogData.tname" value-key="tableId" placeholder="请选择业务表名" @change="onChangeTableColumn">
              <el-option v-for="item in hasKeyNameTableList" :key="item.tableId" :label="item.tname" :value="item" />
            </el-select>
          </el-form-item>
        </div>
        <!-- 第二行 -->
        <div class="tabLine_2">
          <el-form-item label="过滤条件 :" prop="cond" :label-width="formLabelWidth">
            <el-input v-model="dailogData.cond" clearable @change="handleSearch" />
          </el-form-item>
          <el-form-item label="主键字段 :" prop="columnKey" :label-width="formLabelWidth">
            <el-input v-model="dailogData.columnKey" disabled clearable @change="handleSearch" />
          </el-form-item>
        </div>
        <!-- 第三行 -->
        <div class="tabLine_3">
          <el-form-item label="父类目 :" prop="parentId" :label-width="formLabelWidth">
            <el-select v-model="dailogData.parentId" placeholder=" 选择视频设备">
              <el-option label="0" value="0" />
              <el-option v-for="item in parentList" :key="item.key" clearable :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="字段名 :" prop="columnKeyname" :label-width="formLabelWidth">
            <el-input v-model="dailogData.columnKeyname" disabled clearable />
          </el-form-item>
        </div>
        <!-- 第四行 -->
        <div class="tabLine_4">
          <el-form-item label="状态 :" prop="status" :label-width="formLabelWidth">
            <el-select v-model="dailogData.status" placeholder="选择状态">
              <el-option v-for="item in Statuslist" :key="item.key" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <div class="tabLine_4chil">
            <el-form-item label="类目图片" :label-width="formLabelWidth">
              <!-- 授权按钮：v-permission="['ConfigItemImgUpload']" -->
              <FileUpload
                button-text="选择图片"
                upload-type="pic"
                file-type=".png,.jpg"
                :limit="1"
                :button-disabled="false"
                :is-limit-file-size="true"
                :file-max-size="1"
                :file-url-list="fileList"
                file-url-list-type="picture"
                button-type="primary"
                :label-width="formLabelWidth"
                @emitFileList="getEmitFileList"
              />
            </el-form-item>
          </div>
        </div>
        <!-- 第六行 -->
        <div class="tabLine_6">
          <!-- <div class="tabLine_6Rationship">关系 :</div> -->
          <div class="tabLine_6content">
            <div v-for="(itemk, indexk) of cmdbItemMapList" :key="itemk.timestamp" class="task-script-item">
              <!-- line_1box -->
              <div class="tabLine_6content_select_up">
                <div>
                  <el-form-item label="类型:">
                    <el-select v-model="itemk.classify" placeholder="请选择类型" @change="onChangeCmdbItemMapType($event, itemk, indexk)">
                      <el-option label="主表类型" value="master" />
                      <el-option label="副表类型" value="assistant" />
                      <el-option label="关联表类型" value="relationship" />
                      <el-option label="中间关联表类型" value="middleRelationship" />
                    </el-select>
                  </el-form-item>
                </div>
                <!-- line_1 -->
                <div>
                  <el-form-item label="关系:">
                    <el-select v-model="itemk.relationshipTypeId" placeholder="使用关系" :disabled="!itemk.classify">
                      <el-option v-for="item in cmdbRelationshipTypeList" :key="item.key" :label="item.relationshipForward + ' —— ' + item.relationshipReverse" :value="item.id" />
                    </el-select>
                  </el-form-item>
                </div>
                <!-- line_1 -->
                <div>
                  <el-form-item label="类目:">
                    <el-select v-model="itemk.relationshipItemTypeId" placeholder="配置类目" :disabled="!itemk.classify" @change="onChangeTableColumn($event, itemk, indexk)">
                      <el-option v-for="item in classifyTreeList" :key="item.key" :label="item.label" :value="item.value" />
                    </el-select>
                  </el-form-item>
                </div>
                <div>
                  <el-form-item label="关联表名:">
                    <el-select v-model="itemk.tableName" placeholder="请选择关联表名" :disabled="!itemk.classify" clearable @change="onChangeTableColumn($event, itemk, indexk)">
                      <el-option v-for="item in notKeyNameTableList" :key="item.tableId" :label="item.tname" :value="item.tableName" />
                    </el-select>
                  </el-form-item>
                </div>
                <div>
                  <el-form-item label="主字段:">
                    <el-select v-model="itemk.columnMap" placeholder="请选择主字段" clearable :disabled="!itemk.classify">
                      <el-option v-for="item in itemk.mainColumnlist" :key="item.key" :label="item.label" :value="item.value" />
                    </el-select>
                  </el-form-item>
                </div>
                <div>
                  <el-form-item label="关联字段:">
                    <!-- <el-input v-model="itemk.columnId" placeholder="请输入关联字段" /> -->
                    <el-select v-model="itemk.columnId" placeholder="请选择关联字段" clearable :disabled="!itemk.classify">
                      <el-option v-for="item in itemk.assColumnlist" :key="item.key" :label="item.label" :value="item.value" />
                    </el-select>
                  </el-form-item>
                </div>
                <!-- 按钮：减(循环内) -->
                <div class="flex-h-center mt-4">
                  <div class="tabLine_6AddOrest">
                    <div class="butSub" @click="delCmdbItemMapItem(itemk.timestamp)">-</div>
                  </div>
                  <div v-if="indexk === cmdbItemMapList.length - 1" class="tabLine_6AddOrest">
                    <div class="butAdd" @click="addCmdbItemMapItem">+</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 按钮：加(循环外) -->
        </div>
      </el-form>
      <!-- 底部按钮 -->
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click=";(dialogFormVisible = false), saveCmdbItemType()">保 存</el-button>
      </div>
    </el-dialog>
    <!-- 列表底部：分页 -->
    <pagination v-show="listCount > 0" :auto-scroll="false" :total="listCount" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findCmdbItemType" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination' // 分页组件
import FileUpload from '@/components/Upload/file-upload' // 图片上传组件
import ListControl from '@/components/ListControl'
export default {
  name: 'CmdbConfig',
  components: {
    Pagination,
    FileUpload,
    ListControl
  },
  data() {
    return {
      formLabelWidth: '120px',
      marginTop: '-20',
      tableData: [],
      autoCmdbId: [],
      classifyTreeList: [], // 获取的类目列表
      listQuery: {
        name: '', // 列表描述
        tableName: '', // 查询的表名
        page: 1,
        limit: 10
      },
      listCount: 1,
      confirmLoading: true,
      dialogFormVisible: false,
      dialogStatus: '',
      // 弹窗相关属性
      dailogData: {
        id: 0,
        rootId: 0, // 根节点id
        parentId: '', // 父节点id
        appId: 0, // 应用id
        companyId: 0, // 公司id
        userDefine: 0, // 用户自定义
        itemCount: 0, // 实体数量
        relationshipCount: 0, // 关系数量

        name: '', // 业务表描述
        columnKey: '', // 主键字段
        columnKeyname: '', // 名称字段
        tableName: '', // 业务表名
        cond: '', // 过滤条件
        status: 1,
        imageUrl: '', // 图片url

        columnName: '', // 展示字段表名称
        columnVname: '', // 展示字段表描述
        relationshipForward: '', // 使用关系
        relationshipReverse: '' // 使用相反关系
      },
      newDailogData: {
        id: 0,
        rootId: 0, // 根节点id
        parentId: '', // 父节点id
        appId: 0, // 应用id
        companyId: 0, // 公司id
        userDefine: 0, // 用户自定义
        itemCount: 0, // 实体数量
        relationshipCount: 0, // 关系数量
        name: '', // 业务表描述
        columnKey: '', // 主键字段
        columnKeyname: '', // 名称字段
        tableName: '', // 业务表名
        cond: '', // 过滤条件
        status: 1,
        imageUrl: '', // 图片url
        columnName: '', // 展示字段表名称
        columnVname: '', // 展示字段表描述
        relationshipForward: '', // 使用关系
        relationshipReverse: '' // 使用相反关系
      },
      editLsitId: [], // 编辑按钮id
      fileList: [], // 图
      uploadToken: {
        // 后端这个接口还没有去掉这个必填参数，所以传空就可以
        company_id: '',
        app_id: '',
        app_key: '',
        ver: '',
        timestamp: '',
        sign: ''
      },
      parentList: [], // 父类目
      relationshipItemTypeId: [], // 父类目
      Statuslist: [
        { value: 1, label: '启用' },
        { value: 0, label: '禁止' }
      ], // 状态
      operationListName: '', // 业务表名
      relationshipForwardList: [], // 使用关系列表
      relationshipReverseList: [], // 使用相反关系列表
      columnList: [], // 关系--字段
      cmdbItemMapList: [], // 关系配置列表
      addCmdbItemMapList: [], // 添加的关系配置
      delCmdbItemMapList: [], // 删除的关系配置
      editCmdbItemMapList: [], // 编辑的关系配置
      cmdbTableList: [], // 业务表名
      associatedKeyList: [],
      // 显示控制数据 start
      checkList: ['实体类目名称', '图标', '实体数量', '关系数量', '业务表名', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  computed: {
    setIcon() {
      return function (imgUrl) {
        return imgUrl || ''
      }
    },
    hasKeyNameTableList() {
      return this.cmdbTableList.filter(it => it.columnKeyname)
    },
    notKeyNameTableList() {
      return this.cmdbTableList.filter(it => !it.columnKeyname)
    }
  },
  created() {
    this.findCmdbTable() // 获取业务表名
    this.findCmdbItemType() /* 获取类目列表 */
    this.findCmdbItemType2() /* 获取父类目 */
    this.findCmdbRelationshipType() /* 获取关系 */
    // this.findtablecolumn() /* 获取关系字段 */
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    async onChangeCmdbItemMapType(e, item, index) {
      // if(item.classify === '1'){

      // }
      // if(item.classify === '2'){

      // }

      // if(item.classify === '3'){
      //   this.$set(this.cmdbItemMapList[index], 'columnMap', '')
      //   this.$set(this.cmdbItemMapList[index], 'columnId', '')
      //   let columnList = await this.findtablecolumn(this.dailogData.tableName)
      //   this.$set(this.cmdbItemMapList[index], 'mainColumnlist', columnList)
      // }
      this.onChangeTableColumn(e === 'relationship' ? this.dailogData : '1', item, index)
    },
    async onChangeTableColumn(e, item, indexk) {
      let elType = Object.prototype.toString.call(e).slice(8, -1)
      if (elType === 'Object') {
        this.dailogData.tableName = e.tableName
        this.dailogData.columnKey = e.columnKey
        this.dailogData.columnKeyname = e.columnKeyname
        this.dailogData.tname = e.tname
        this.dailogData.tableId = e.tableId

        let columnList = await this.findtablecolumn(e.tableName)
        for (const it of this.cmdbItemMapList) {
          if (it.classify === 'relationship') {
            it.columnMap = ''
            it.mainColumnlist = columnList
            if (it.tableName) {
              const asscolumnList = await this.findtablecolumn(it.tableName)
              it.assColumnlist = asscolumnList
            }
          }
        }
        this.$forceUpdate()
      } else {
        if (item.classify === 'master' || item.classify === 'middleRelationship') {
          if (item.tableName) {
            this.$set(this.cmdbItemMapList[indexk], 'columnMap', '')
            this.$set(this.cmdbItemMapList[indexk], 'columnId', '')
            const columnList = await this.findtablecolumn(item.tableName)
            this.$set(this.cmdbItemMapList[indexk], 'mainColumnlist', columnList)
            this.$set(this.cmdbItemMapList[indexk], 'assColumnlist', columnList)
          }
        }
        if (item.classify === 'assistant') {
          let idx
          if (item.relationshipItemTypeId) {
            idx = this.classifyTreeList.find(it => +it.value === +item.relationshipItemTypeId)
            if (!idx) return
            this.$set(this.cmdbItemMapList[indexk], 'columnMap', '')
            this.$set(this.cmdbItemMapList[indexk], 'columnId', '')
            const columnList = await this.findtablecolumn(idx.tableName)
            this.$set(this.cmdbItemMapList[indexk], 'mainColumnlist', columnList)
            if (!item.tableName) this.$set(this.cmdbItemMapList[indexk], 'assColumnlist', columnList)
          }
          if (item.tableName && idx) {
            const columnList = await this.findtablecolumn(item.tableName)
            this.$set(this.cmdbItemMapList[indexk], 'assColumnlist', columnList)
          }
        }
      }
    },
    // onMapListTableNamechange(e,item){
    //    item.tableName = e.tableName
    //   item.columnKey = e.columnKey
    //   item.columnKeyname = e.columnKeyname
    // },
    // onTableNamechange(e) {
    //   this.dailogData.tableName = e.tableName
    //   this.dailogData.columnKey = e.columnKey
    //   this.dailogData.columnKeyname = e.columnKeyname
    //   this.dailogData.tname = e.tname
    //   this.dailogData.tableId = e.tableId
    //   this.cmdbItemMapList.forEach(it => {
    //     it.columnMap = ''
    //   })
    //   this.onAssociatedtableNameChange(e.tableName, 0, 'relationshipItemTypeId')
    // },
    async findCmdbTable() {
      const { data, code } = await this.$request({ url: this.api.cmdb.findCmdbTable, data: { limit: -1 } })
      if (code === 1) this.cmdbTableList = data
    },
    // 获取类目列表
    findCmdbItemType() {
      let DATA = this.listQuery
      request({ url: api.cmdb.findCmdbItemType, data: DATA }).then(async res => {
        this.listCount = Number(res.count)
        if (res.code === 1) {
          const data = []
          res.data.forEach(item => {
            data.push(item)
          })

          for (const it of data) {
            const shipList = await request({
              url: api.cmdb.findCmdbItemTypeRelationship,
              data: { page: 1, limit: -1, itemTypeId: it.id }
            })
            it.relationshipCount = shipList.data.length
          }

          this.tableData = data
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 获取关系行[关系]|[字段]|[类目]的关联列表
    findCmdbItemTypeRelationship() {
      request({
        url: api.cmdb.findCmdbItemTypeRelationship,
        data: { page: 1, limit: -1, itemTypeId: this.editLsitId }
      }).then(async res => {
        if (res.code === 1) {
          for (var i = 0; i < res.data.length; i++) {
            res.data[i].timestamp = new Date().getTime() + `${res.data[i].id}`
          }

          for (let i = 0; i < res.data.length; i++) {
            const el = res.data[i]
            if (el.classify === 'master' || el.classify === 'middleRelationship') {
              if (el.tableName) {
                let columnlist = await this.findtablecolumn(el.tableName)
                el['mainColumnlist'] = columnlist
                el['assColumnlist'] = columnlist
              }
            }
            if (el.classify === 'assistant') {
              const idx = this.classifyTreeList.find(it => +it.value === +el.relationshipItemTypeId)
              if (idx) {
                let columnlist = await this.findtablecolumn(idx.tableName)
                el['mainColumnlist'] = columnlist
              }
              if (el.tableName) {
                let columnlist = await this.findtablecolumn(el.tableName)
                el['assColumnlist'] = columnlist
              }
            }
            if (el.classify === 'relationship') {
              let columnlist = await this.findtablecolumn(this.dailogData.tableName)
              el['mainColumnlist'] = columnlist
              if (el.tableName) {
                let columnlist = await this.findtablecolumn(el.tableName)
                el['assColumnlist'] = columnlist
              }
            }
          }
          this.cmdbItemMapList = [...res.data]
        } else {
          this.$message({
            message: res.msg,
            type: 'error',
            duration: 2000
          })
        }
      })
    },
    // 获取运用-关系-1
    findCmdbRelationshipType() {
      request({
        url: api.cmdb.findCmdbRelationshipType,
        data: { page: 1, limit: -1 }
      }).then(res => {
        this.cmdbRelationshipTypeList = res.data
      })
    },
    operationListNameChange() {
      this.operationListName = this.dailogData.tableName
      // this.findtablecolumn()
    },
    // async onAssociatedtableNameChange(tableName, index, type) {
    //   let columnlist = []
    //   if (type === 'relationshipItemTypeId') {
    //     // this.$set(this.cmdbItemMapList[index], 'columnMap', '')
    //     // const idx = this.classifyTreeList.find(it => +it.value === +tableName)
    //     this.associatedKeyList = await this.findtablecolumn(tableName)
    //     // this.$set(this.cmdbItemMapList[index], 'shipcolumnlist', columnlist)
    //   }
    //   if (type === 'tableName') {
    //     this.$set(this.cmdbItemMapList[index], 'columnId', '')
    //     columnlist = await this.findtablecolumn(tableName)
    //     this.$set(this.cmdbItemMapList[index], 'columnlist', columnlist)
    //   }
    // },
    // 获取关系--字段
    async findtablecolumn(operationListName) {
      // let operationListName = this.operationListName // 表名：hyit_host video_chn
      const res = await request({ url: api.cmdb.findtablecolumn, data: { tablename: operationListName, limit: -1 } })
      if (res.code !== 1) return []
      let columnlist = res.map?.columnlist || []

      columnlist = res.map.columnlist.sort((a, b) => {
        return Number(a.keywords) - Number(b.keywords)
      })
      columnlist.forEach(item => {
        item.label = item.cname
        item.value = item.columnName
      })
      return columnlist
    },
    // 获取关系--类目(父类目)||类目
    findCmdbItemType2() {
      request({ url: api.cmdb.findCmdbItemType, data: { limit: -1 } }).then(res => {
        this.parentList = res.data.sort((a, b) => {
          return Number(a.keywords) - Number(b.keywords)
        })
        this.classifyTreeList = res.data
        this.parentList.forEach(item => {
          item.label = item.name
          item.value = item.id
          this.dailogData.id = item.id // 用于更新的id
        })

        /* 类目类型选择 */
        this.classifyTreeList.forEach(item => {
          item.label = item.name
          item.value = item.id
        })
      })
    },
    // 查询功能
    handleSearch() {
      this.operationListNameChange()
      // if (this.dailogData.tableName) {
      this.findCmdbItemType()
      // }
    },
    handleSelectionChange(val) {
      let Data = val
      let cmdbId = []
      Data.forEach(items => {
        cmdbId.push(items.id)
      })
      let newcmdbId = [...new Set(cmdbId)].sort((a, b) => {
        return Number(a.keywords) - Number(b.keywords)
      })
      this.autoCmdbId = newcmdbId
    },
    // CMDB自动化
    handleCmdbAuto() {
      let Data = this.autoCmdbId
      if (Data.length === 0) return this.$message({ message: '请选择需要CMDB自动化的数据行', type: 'warning', duration: 2000 })
      for (let val in Data) {
        const element = Data[val] // id
        request({
          url: api.cmdb.AutoCmdb,
          data: { id: element }
        }).then(res => {
          if (res.code !== 1) return this.$message({ title: 'CMDB自动化失败', message: res.msg, type: 'error', duration: 2000 })
          this.findCmdbItemType()
          this.$message({ title: 'CMDB自动化成功', message: res.msg, type: 'success', duration: 2000 })
        })
      }
    },
    // 新增按钮
    handleAdd() {
      this.dailogData = {} // 清除
      for (const key in this.newDailogData) {
        this.$set(this.dailogData, key, this.newDailogData[key])
      }
      this.dialogFormVisible = true
      this.dialogStatus = 'create'
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })

      if (this.cmdbItemMapList.length === 0) {
        this.addCmdbItemMapItem()
      } else {
        this.cmdbItemMapList.splice(0, this.cmdbItemMapList.length) // 清除
        this.addCmdbItemMapItem()
      }
    },
    // 列表编辑按钮
    async handleEdit(row) {
      for (const key in this.dailogData) {
        this.dailogData[key] = row[key]
      }
      if (row.tableId) {
        this.dailogData.tname = this.cmdbTableList.find(it => +it.tableId === +row.tableId)?.tname
      }
      this.dialogFormVisible = true
      this.dialogStatus = 'update'
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      this.editLsitId = row.id
      if (this.editLsitId) {
        this.operationListName = this.dailogData.tableName
        this.findCmdbItemTypeRelationship()
        this.associatedKeyList = await this.findtablecolumn(row.tableName)
      }
      // this.findtablecolumn()
    },
    // 关系添加
    addCmdbItemMapItem() {
      if (this.cmdbItemMapList.length === 0) {
        this.marginTop = Number(this.marginTop)
      } else {
        // 加号按钮动态位置
        this.marginTop = Number(this.marginTop) + 60
      }
      // 新增的关系行[关系]|[字段]|[类目]
      this.$set(this.cmdbItemMapList, this.cmdbItemMapList.length, {
        itemTypeId: '',
        relationshipTypeId: '',
        columnMap: '',
        relationshipItemTypeId: '',
        timestamp: new Date().getTime()
      })
    },
    // 弹窗保存按钮
    saveCmdbItemType() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          // 关系行保存前数据判断
          if (this.cmdbItemMapList.length > 0) {
            const cmdbItemMapList = [...this.cmdbItemMapList]
            for (let i = 0; i < cmdbItemMapList.length; i++) {
              if (!cmdbItemMapList[i].id) {
                // 没有id为新增 !undfined
                this.addCmdbItemMapList.push(cmdbItemMapList[i])
              } else {
                this.editCmdbItemMapList.push(cmdbItemMapList[i])
              }
            }
          }
          // 接口选择
          let API = this.dialogStatus === 'create' ? api.cmdb.insertCmdbItemType : api.cmdb.updateCmdbItemType
          request({
            url: API,
            data: this.dailogData
          }).then(res => {
            if (res.code === 1) {
              if (this.addCmdbItemMapList.length > 0) {
                // 将新增的关联id赋给对应关系链表
                if (this.dialogStatus === 'create') {
                  this.addCmdbItemMapList.forEach(items => {
                    this.$set(items, 'itemTypeId', (items.itemTypeId = res.model.id))
                  })
                } else {
                  this.addCmdbItemMapList.forEach(items => {
                    this.$set(items, 'itemTypeId', (items.itemTypeId = this.editLsitId))
                  })
                }
                this.insertCmdbItemTypeRelationship()
              }
              if (this.delCmdbItemMapList.length > 0) {
                this.deleteCmdbItemTypeRelationship()
              }
              // if (this.editCmdbItemMapList.length > 0) {
              this.updateCmdbItemTypeRelationship()
              // }
              this.findCmdbItemType()

              this.$message({
                title: '完成新增',
                message: res.msg,
                type: 'success',
                duration: 2000
              })
            } else {
              this.$message({
                title: '新增失败',
                message: res.msg,
                type: 'error',
                duration: 2000
              })
            }
          })
        }
      })
    },
    // 表单-删除
    handleDelete(val) {
      this.$confirm('该操作将删除数据行,确认删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.cmdb.deleteCmdbItemType,
          data: { id: val.id }
        }).then(
          ({ code, ...res }) => {
            if (code !== 1) return
            this.findCmdbItemType()
            this.$message({
              title: '数据行删除',
              type: 'success',
              message: res.msg
            })
          },
          () => {
            this.$message.error('删除失败')
          }
        )
      })
    },
    // 关系--字段--类目保存
    insertCmdbItemTypeRelationship() {
      for (let i = 0; i < this.addCmdbItemMapList.length; i++) {
        request({
          url: api.cmdb.insertCmdbItemTypeRelationship,
          data: this.addCmdbItemMapList[i]
        }).then(res => {
          if (res.code === 1) {
            this.addCmdbItemMapList = []
          }
        })
      }
    },
    // 关系--字段--类目删除
    deleteCmdbItemTypeRelationship() {
      for (let i = 0; i < this.delCmdbItemMapList.length; i++) {
        request({
          url: api.cmdb.deleteCmdbItemTypeRelationship,
          data: {
            id: this.delCmdbItemMapList[i].id
          }
        }).then(res => {
          if (res.code === 1) {
            this.delCmdbItemMapList = []
          }
        })
      }
    },
    // 关系--字段--类目更新
    updateCmdbItemTypeRelationship() {
      for (let i = 0; i < this.cmdbItemMapList.length; i++) {
        if (this.cmdbItemMapList[i]['id']) {
          request({
            url: api.cmdb.updateCmdbItemTypeRelationship,
            data: {
              id: this.cmdbItemMapList[i].id,
              itemTypeId: this.cmdbItemMapList[i].itemTypeId,
              relationshipItemTypeId: this.cmdbItemMapList[i].relationshipItemTypeId,
              relationshipTypeId: this.cmdbItemMapList[i].relationshipTypeId,
              columnMap: this.cmdbItemMapList[i].columnMap,
              timestamp: this.cmdbItemMapList[i].timestamp,
              tableName: this.cmdbItemMapList[i].tableName,
              columnId: this.cmdbItemMapList[i].columnId,
              classify: this.cmdbItemMapList[i].classify
            }
          })
        }
      }
    },
    // 点击删除关系
    delCmdbItemMapItem(timestamp) {
      if (this.marginTop > 40) {
        this.marginTop = Number(this.marginTop) - 60
      } else {
        // 加号按钮动态位置
        this.marginTop = -20
      }
      const idx = this.cmdbItemMapList.findIndex(item => Number(item.timestamp) === Number(timestamp))
      if (this.cmdbItemMapList[idx].id) {
        this.$set(this.delCmdbItemMapList, this.delCmdbItemMapList.length, this.cmdbItemMapList[idx])
      }
      this.cmdbItemMapList.splice(idx, 1)
    },
    // 图片上传
    upload(param) {
      const fdata = new FormData()
      fdata.append('file', param.file)
      request({
        url: api.file.uploadPic,
        data: this.uploadToken,
        form: fdata
      }).then(res => {
        if (res.code === 1) {
          this.$set(this.dailogData, 'imageUrl', res.map.img)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    uploadChange(file, fileList) {
      this.fileList = fileList.slice(-3)
    },
    uploadRemove() {
      this.$set(this.dailogData, 'imageUrl', '')
    },
    // 选择图片上传
    getEmitFileList(val) {
      //
      this.$set(this.dailogData, 'imageUrl', val.emitType === 'addFile' ? val.fileList[0].url : '')
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
    }
  }
}
</script>

<style  lang="scss" scoped>
.cmdb_container {
  padding: 10px;
  white-space: pre-wrap;
}
// 编辑/新增弹窗区域
.tabLine_1 {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
}
.tabLine_2 {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
}
.tabLine_3 {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
}
.tabLine_4 {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  .tabLine_4chil {
    width: 331px;
    max-height: 240px;
    overflow-x: hidden;
    overflow-y: auto;
  }
}
.tabLine_6 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .tabLine_6Rationship {
    width: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    color: rgba(75, 75, 75, 0.849);
    margin-top: -20px;
  }
  .tabLine_6content {
    flex: 2;
    display: flex;
    flex-direction: column;
    // border: 1px solid red;
    .tabLine_6content_select_up {
      display: flex;
      justify-content: space-between;
      align-items: center;
      // background-color: antiquewhite;
    }
    .tabLine_6content_select_dow {
      display: flex;
      justify-content: space-between;
      align-items: center;
      // background-color: antiquewhite;
    }
  }
  .tabLine_6AddOrest {
    // flex: 1;
    // display: flex;
    // flex-direction: column;
    // justify-content: space-evenly;
    // align-items: center;
    // margin-top: -20px;
    width: 50px;
    height: 30px;
    .butAdd {
      width: 30px;
      height: 30px;
      border: 1px solid #e1e1e1;
      border-radius: 4px;
      line-height: 30px;
      text-align: center;
      cursor: pointer;
      // margin-top: -20px;
    }
    .butSub {
      width: 30px;
      height: 30px;
      border: 1px solid #e1e1e1;
      border-radius: 4px;
      line-height: 30px;
      text-align: center;
      cursor: pointer;
      // margin-top: -20px;
    }
  }
}
</style>
