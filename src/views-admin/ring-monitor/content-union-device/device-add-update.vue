<template>
  <div>
    <div class="page-nav">
      <i class="el-icon-back" @click="$router.back()" />
      <span>{{ navTitle }}</span>
    </div>
    <div class="app-container">
      <el-card v-loading="loading">
        <el-form ref="form" :model="form" :rules="rules" label-width="120px" class="select-width-fill">
          <el-row :gutter="12">
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <el-form-item label="所属动环主机" prop="hyHostId">
                <el-select
                  v-model="form.hyHostId"
                  filterable
                  placeholder="请选择所属动环主机"
                >
                  <el-option
                    v-for="item in hostList"
                    :key="item.hyHostId"
                    :label="item.hyHostName"
                    :value="item.hyHostId"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="设备名称" prop="hyDeviceName">
                <el-input v-model.trim="form.hyDeviceName" placeholder="请输入设备名称" />
              </el-form-item>
              <el-form-item label="设备类型" prop="hyDevTypeValue">
                <el-select
                  v-model="form.hyDevTypeValue"
                  filterable
                  placeholder="请选择设备类型"
                >
                  <el-option
                    v-for="item in devTypeList"
                    :key="item.hyDevTypeValue"
                    :label="item.hyDevTypeName"
                    :value="item.hyDevTypeValue"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="区域" prop="hyOrgid">
                <el-select
                  v-model="form.hyOrgid"
                  filterable
                  placeholder="请选择区域"
                >
                  <el-option
                    v-for="item in area"
                    :key="item.hyAreaId"
                    :label="item.hyAreaName"
                    :value="item.hyAreaId"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="别名配置" prop="hyAlias">
                <el-input v-model="form.hyAlias" placeholder="请输入别名" />
              </el-form-item>
              <el-form-item label="关联属性" prop="attribute">
                <el-button class="filter-item margin-bottom-20" type="primary" @click="openAttributeList">选择属性</el-button>
                <div class="attribute-box">
                  <el-tag
                    v-for="tag in deviceValueTagList"
                    :key="tag.hyVid"
                    closable
                    :disable-transitions="false"
                    @close="handleCloseTag(tag)"
                  >
                    {{ tag.hyDes }}
                  </el-tag>
                </div>
              </el-form-item>
              <el-form-item label="" prop="">
                <el-button v-permission="['save']" type="primary" :loading="confirmLoading" @click="onSubmit">保存</el-button>
                <el-button @click="onReset">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>
    <el-dialog title="选择关联属性" :visible.sync="showAttributeList" width="60%" top="5vh">
      <div class="equipment_header filter-container">
        <el-select v-model="findHyitDeviceValueQuery.hyDeviceId" filterable class="filter-item" placeholder="请选择所属设备">
          <el-option label="所有" value=" " />
          <el-option
            v-for="item in deviceList"
            :key="item.hyDeviceId"
            :label="item.hyAlias || ''+ `(${item.hyAddr})`"
            :value="item.hyDeviceId"
          />
        </el-select>
        <el-select v-model="findHyitDeviceValueQuery.hyType" filterable class="filter-item" placeholder="请选择值类型">
          <el-option
            v-for="item in valueTypeList"
            :key="item.hyTypeId"
            :label="item.hyDescription"
            :value="item.hyTypeId"
          />
        </el-select>
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="findHyitDeviceValueList">
          查询
        </el-button>
      </div>
      <div class="equipment_table">
        <el-table ref="deviceValueTable" :data="deviceValueList" :row-key="getRowKeys" fit highlight-current-row style="width: 100%;" @select="handleSelect">
          <el-table-column type="selection" width="55" show-overflow-tooltip />
          <el-table-column label="NO" prop="id" type="index" width="60" show-overflow-tooltip />
          <el-table-column label="所属主机" prop="device" min-width="80" show-overflow-tooltip>
            <template slot-scope="item">
              {{ setHostName(item.row) }}
            </template>
          </el-table-column>
          <el-table-column label="属性名" prop="hyDes" width="100" show-overflow-tooltip />
          <el-table-column label="模块" prop="hyAddr" width="120" show-overflow-tooltip />
          <el-table-column label="端口" prop="hyPort" width="80" show-overflow-tooltip />
          <el-table-column label="索引" prop="hyDatIndex" width="80" show-overflow-tooltip />
          <el-table-column label="值类型" prop="hyType" width="120" show-overflow-tooltip>
            <template slot-scope="item">
              {{ setValueType(item.row.hyType) }}
            </template>
          </el-table-column>
          <el-table-column label="当前值" prop="deviceValue" width="80" show-overflow-tooltip />
          <el-table-column label="状态" prop="status" show-overflow-tooltip>
            <template slot-scope="item">
              <div :class="item.row.hyState === 1 ? 'success' : 'danger'">
                <i :class="item.row.hyState === 1 ? 'el-icon-success' : 'el-icon-error'" />
                {{ item.row.hyState === 1 ? '在线' : '离线' }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="更新时间" prop="hyUtime" show-overflow-tooltip />
        </el-table>
        <pagination v-show="findHyitDeviceValueTotal > 0" :auto-scroll="false" :total="findHyitDeviceValueTotal" :page.sync="findHyitDeviceValueQuery.page" :limit.sync="findHyitDeviceValueQuery.limit" @pagination="findHyitDeviceValueList" />
      </div>
      <div slot="footer" class="dialog-footer">
        <!--        <el-button @click="showAttributeList = false">取 消</el-button>-->
        <el-button class="filter-item" type="primary" @click="showAttributeList=false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import request from '@/utils/request'
import api from '@/api/api'
import { arrItemObjectExist } from '@/utils/utils'

export default {
  name: 'ContentUnionDeviceAddUpdate',
  components: { Pagination },
  data() {
    return {
      loading: false,
      confirmLoading: false,
      form: {
        hyHostId: '',
        hyDeviceName: '',
        hyDevTypeValue: '',
        hyOrgid: '',
        hyAlias: ''
      },
      rules: {
        hyOrgid: [
          { required: true, message: '请选择区域', trigger: 'blur' }
        ],
        hyHostId: [
          { required: true, message: '请选择物联主机', trigger: 'blur' }
        ],
        hyDevTypeValue: [
          { required: true, message: '请选择设备类型', trigger: 'blur' }
        ],
        hyDeviceName: [
          { required: true, message: '请输入设备名称', trigger: 'blur' }
        ]
      },
      area: [],
      attributeTags: [],
      showAttributeList: false,
      attributeList: [],
      attributeListQuery: {},
      attributeListTotal: 10,
      valueTypeList: [],
      selectDevice: '',
      selectAttribute: [],
      findHyitHostQuery: { // 查询主机列表参数
        hyDevTypeId: 2
        // limit: -1
      },
      hostList: [], // 主机列表
      devTypeList: [], // 设备类型列表
      deviceList: [],
      findHyitDeviceValueQuery: { // 查询属性列表参数
        page: 1,
        limit: 10,
        hyHostId: '',
        hyType: '',
        hyDes: '',
        selectValueType: '',
        hyDevTypeValue: ''
      },
      findHyitDeviceValueTotal: 0,
      deviceValueList: [], // 属性列表
      selectDeviceValueIds: [], // 当前表格选择的属性
      getDeviceValue: [], // 在数据读取的绑定的设备属性
      deviceValueTagList: [],
      addDeviceValueIds: [], // 需要添加的属性
      deleteDeviceValueIds: [], // 需要从数据库删除的属性
      ideField: 'hyVid', // 匹配的字段，用id
      multipleSelection: [], // 当前页面选择的
      allSelection: [] // 所有页面选择的
    }
  },
  computed: {
    id() { // 编辑获取内容
      return this.$route.query.id
    },
    navTitle() { // title
      return this.$route.meta.title
    },
    setValueType() {
      return function(hyDevTypeValue) {
        const idx = this.valueTypeList.findIndex(item => item.hyTypeId === hyDevTypeValue)
        if (idx !== -1) {
          return this.valueTypeList[idx].hyDescription
        }
      }
    },
    setHostName() {
      return function(hyHostId) {
        const idx = this.hostList.findIndex(item => item.hyHostId === hyHostId.hyHostId)
        if (idx !== -1) {
          hyHostId.hyHostName = this.hostList[idx].hyHostName
          return this.hostList[idx].hyHostName
        }
      }
    }
  },
  mounted() {
    this.findHyitHost()
    this.findHyitOrg()
    this.findHyitDevType()
    this.findHyitValueType()
    this.findHyitDevice()
    if (this.id) {
      this.fetchData()
    }
  },
  methods: {
    findHyitDevice() {
      request({
        url: api.powerEnv.findHyitDevice, data: { limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.deviceList = res.data
        }
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      let setPagingSelection = [...this.allSelection, ...val]
      setPagingSelection = setPagingSelection.map(it => JSON.stringify(it))
      setPagingSelection = [...new Set(setPagingSelection)].map((item) => JSON.parse(item))
      this.allSelection = setPagingSelection
    },
    handleSelect(rows, row) {
      let selected = rows.length && rows.indexOf(row) !== -1
      console.log(selected)
      if (selected) {
        this.allSelection.push(row)
        this.deviceValueTagList.push(row)
      }
      if (!selected) {
        this.allSelection = this.allSelection.filter(it => it[this.ideField] !== row[this.ideField])
        this.deviceValueTagList = this.allSelection.filter(it => it[this.ideField] !== row[this.ideField])
      }
    },
    onReset() {
      this.$refs.form.resetFields()
    },
    onSubmit() {
      // 查询数据读取出来的属性  在编辑的时候有没有被删除
      const deleteDeviceValue = arrItemObjectExist(this.getDeviceValue, this.deviceValueTagList, 'hyVid')
      deleteDeviceValue.forEach(item => {
        this.deleteDeviceValueIds.push(item.hyId)
      })

      // 查询要新增的属性
      const addDeviceValue = arrItemObjectExist(this.deviceValueTagList, this.getDeviceValue, 'hyVid')
      addDeviceValue.forEach(item => {
        this.addDeviceValueIds.push(item.hyVid)
      })

      this.$refs['form'].validate(valid => {
        if (valid) {
          const apiName = this.id ? api.powerEnv.updateHyitDevice : api.powerEnv.insertHyitDevice
          const msg = this.id ? '编辑成功' : '新增成功'
          this.confirmLoading = true
          request({ url: apiName, data: (Object.assign(this.form)) }).then(res => {
            if (this.addDeviceValueIds.length > 0) {
              const insertHyitDeviceMapData = {}
              const fieldName = addDeviceValue.length > 0 ? 'hyVids' : 'hyVid'
              insertHyitDeviceMapData[`${fieldName}`] = this.addDeviceValueIds.toString()
              this.insertHyitDeviceMap({
                hyDeviceId: this.id ? this.form.hyDeviceId : res.model.hyDeviceId,
                ...insertHyitDeviceMapData
              })
            }
            if (this.deleteDeviceValueIds.length > 0) {
              const deleteHyitDeviceMapData = {}
              const fieldName = deleteDeviceValue.length > 0 ? 'hyIds' : 'hyId'
              deleteHyitDeviceMapData[`${fieldName}`] = this.deleteDeviceValueIds.toString()
              this.deleteHyitDeviceMap({
                hyDeviceId: this.id ? this.form.hyDeviceId : res.model.hyDeviceId,
                ...deleteHyitDeviceMapData
              })
            }
            this.$message.success(msg)
            this.$router.back()
          }).finally(() => {
            this.confirmLoading = false
          })
        }
      })
    },
    loadAttributeList() {},
    comfirm() {
      this.showAttributeList = false
      this.deviceValueTagList = []
      const selectAttribute = this.allSelection
      this.deviceValueTagList = selectAttribute
    },

    openAttributeList() {
      this.showAttributeList = true
      this.findHyitDeviceValueList()
    },
    handleCloseTag(val) {
      const idx = this.deviceValueTagList.findIndex(item => item.hyVid === val.hyVid)
      const s = this.allSelection.findIndex(item => item.hyVid === val.hyVid)
      if (idx !== -1) {
        this.deviceValueTagList.splice(idx, 1)
        this.allSelection.splice(s, 1)
      }
    },
    findHyitHost() {
      request({
        url: api.powerEnv.findHyitHost, data: { ...this.findHyitHostQuery }
      }).then(res => {
        this.hostList = res.data
      })
    },
    findHyitDevType() {
      request({
        url: api.powerEnv.findHyitDevType,
        data: { hyDevTypeId: 2, hyDevTypePid: 2, limit: -1, Pid: 2 }
      }).then(res => {
        if (res.code === 1) {
          this.devTypeList = res.data
        }
      })
    },
    findHyitOrg() {
      request({
        url: api.area.findHyitArea,
        data: {isDh: 1}
      }).then(res => {
        if (res.code === 1) {
          this.area = res.data
        }
      })
    },
    findHyitDeviceValueList() {
      this.findHyitDeviceValue(this.findHyitDeviceValueQuery).then(res => {
        this.deviceValueList = res.data
        this.findHyitDeviceValueTotal = Number(res.count)
        this.initCheck()
      })
    },
    // 初始化选中
    initCheck() {
      const idx = []
      this.deviceValueTagList.forEach(item => {
        idx.push(item.hyVid)
      })
      for (let i = 0; i < this.deviceValueList.length; i++) {
        const IdIndex = idx.findIndex((item) => {
          return Number(item) === this.deviceValueList[i].hyVid
        })
        if (IdIndex !== -1) {
          setTimeout(() => {
            this.$refs.deviceValueTable.toggleRowSelection(this.deviceValueList[i])
          }, 20)
        } else {
          this.$refs.deviceValueTable.clearSelection()
        }
      }
    },
    async findHyitDeviceValue(data) {
      return await request({
        url: api.powerEnv.findHyitDeviceValue,
        data
      }).then(res => {
        if (res.code === 1) {
          return res
        }
      })
    },
    findHyitValueType() {
      request({
        url: api.powerEnv.findHyitValueType,
        data: {}
      }).then(res => {
        if (res.code === 1) {
          this.valueTypeList = res.data
        }
      })
    },
    fetchData() { // 获取编辑信息并展示
      request({
        url: api.powerEnv.getHyitDevice,
        data: { hyDeviceId: this.id }
      }).then(res => {
        if (res.code === 1) {
          const form = {}
          Object.keys(this.form).forEach(key => {
            form[key] = res.model[key]
          })
          form.hyDeviceId = res.model.hyDeviceId
          this.form = form
          this.findHyitDeviceMap()
        }
      })
    },
    insertHyitDeviceMap(data) {
      request({ url: api.powerEnv.insertHyitDeviceMap, data: data })
    },
    deleteHyitDeviceMap(data) {
      request({ url: api.powerEnv.deleteHyitDeviceMap, data: data })
    },
    findHyitDeviceMap() {
      request({
        url: api.powerEnv.findHyitDeviceMap,
        data: { hyDeviceId: this.id }
      }).then(res => {
        if (res.code === 1) {
          if (res.data.length > 0) {
            const idx = []
            res.data.forEach(item => {
              idx.push(item.hyVid)
            })
            this.findHyitDeviceValue({
              page: 1,
              limit: -1,
              ids: idx.toString()
            }).then(findValueRes => {
              res.data.forEach(item => {
                const findIdx = findValueRes.data.findIndex(items => items.hyVid === item.hyVid)
                if (findIdx !== -1) {
                  item.hyDes = findValueRes.data[findIdx].hyDes
                }
              })
              this.getDeviceValue = [...res.data]
              this.deviceValueTagList = [...findValueRes.data]
              this.allSelection = [...findValueRes.data]
            })
          }
        }
      })
    },
    getRowKeys(row) {
      return row.hyVid
    }
  }
}
</script>

<style lang="scss" scoped>
.attribute-box {
  border-radius: 4px;
  border: 1px solid #DCDFE6;
  min-height: 80px;
  .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
}
</style>
