import Pagination from '@/components/Pagination'
import { listToTree } from '@/utils'
import request from '@/utils/request'
import api from '@/api/api'
import { isIp } from '@/utils/validate'
import ListControl from '@/components/ListControl'

export default {
  components: { Pagination, ListControl },
  props: {
    cmdbItemTypeId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    var checkIp = (rule, value, callback) => {
      console.log(rule)
      if (!value) return callback(new Error('ip不能为空'))
      if (!isIp(value)) return callback(new Error('请输入正确的ip'))
      callback()
    }
    return {
      orgProps: { label: 'hyAreaName', value: 'hyAreaId', checkStrictly: true },
      // 状态
      statusArr: [],
      // 类型
      typeArr: [],
      // 区域
      areaArr: [], areaTreeArr: [],
      // 网关
      gatewayArr: [],
      // 添加时的状态
      addStatusDis: false,
      // 通道
      aisleEditModal: false,
      addStatusArr: [
        {
          value: '1',
          label: '在线'
        },
        {
          value: '0',
          label: '离线'
        }
      ],
      listQuery: {
        title: '',
        ip: '',
        status: '',
        devTypeId: '',
        orgId: '',
        orgIds: [],
        page: 1,
        limit: 10
      },
      listQueryAll: {},
      addOrEdit: '',
      // 新增modal
      addVideoDvrModal: false,
      // 导入
      bulkImportModal: false,
      // 导入参数
      bulkImport: {
        name: '',
        orgId: ''
      },
      // 新增参数
      addVideoDvrParam: {
        title: '',
        devTypeId: 0,
        ip: '',
        channelCount: 1,
        status: '1',
        userName: '',
        passWord: '',
        port: '',
        catId: '', // 区域Id
        gId: 0, // 网关id
        loginPort: '',
        devTypeValue: 0,
        gateway: '',
        cmdbItemTypeId: 1
      },
      editAisleInfoName: '',
      rules: {
        title: [
          { required: true, message: '请输入设备名称', trigger: 'blur' }
        ],
        ip: [
          { required: true, trigger: 'blur', validator: checkIp }
        ],
        channelCount: [
          { required: true, message: '请输入通道数', trigger: 'blur' }
        ],
        userName: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        passWord: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        loginPort: [
          { required: true, message: '请输入登录端口', trigger: 'blur' }
        ],
        cmdbItemTypeId: [
          { required: true, message: '请选择配置类目', trigger: 'blur' }
        ]
      },
      rulesBulk: {
        name: [
          { required: true, message: '请选择文件', trigger: 'blur' }
        ],
        orgId: [
          { required: true, message: '请选择区域', trigger: 'blur' }
        ]
      },
      formLabelWidth: '120px',
      // 表格数据
      tableData: [],
      // 通道modal
      aisleModal: false,
      editAisleInfo: {}, // 编辑通道
      // 通道参数
      aisleParam: {
        page: 1,
        limit: 10,
        dvrId: 0,
        cname: '',
        orgId: 0
      },
      aisletotal: 0,
      // 通道删除
      aisleDis: false,
      // 通道表格数据
      aisleTable: [],
      total: 0,
      // 批量删除
      delVideoDvr: [],
      delVideoDvrVal: [],
      isDisabled: false,
      cmdbItemSourceType: 1,
      classifyTreeList: [],
      fileList: [],
      passwordType: 'password',
      // 显示控制数据 start
      checkList: ['设备名称', 'IP', '设备类型', '通道数', '区域', '状态', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  created() {
    this.onFilter()
    this.getStatusArr()
    this.getTypeArr()
    this.getAreaArr()
    this.getfindVideoGateway()
    this.findCmdbItemType()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 打开新增modal
    openAddModal() {
      const _this = this
      _this.isDisabled = false
      _this.addVideoDvrModal = true
      _this.addOrEdit = 'add'
      _this.addVideoDvrParam = {
        title: '',
        devTypeId: 0,
        ip: '',
        channelCount: 1,
        status: '1',
        userName: 'admin',
        passWord: '',
        port: '554',
        catId: '',
        loginPort: '',
        devTypeValue: 0,
        gId: '',
        cmdbItemTypeId: 1
      }
      _this.addVideoDvrParam.devTypeId = _this.typeArr[0].hyDevTypeId
      if (_this.typeArr[0].hyDevTypeName.indexOf('宇视') !== -1) {
        _this.addVideoDvrParam.loginPort = 80
      }
      if (_this.typeArr[0].hyDevTypeName.indexOf('海康') !== -1) {
        _this.addVideoDvrParam.loginPort = 8000
      }
      if (_this.typeArr[0].hyDevTypeName.indexOf('IPC') !== -1) {
        _this.addStatusDis = true
      }
    },
    // 新增修改视频类型
    changeDevType(val) {
      const _this = this
      _this.typeArr.forEach(item => {
        if (item.hyDevTypeId === val) {
          if (item.hyDevTypeName.indexOf('海康') !== -1) {
            _this.addVideoDvrParam.loginPort = 8000
          } else if (item.hyDevTypeName.indexOf('宇视') !== -1) {
            _this.addVideoDvrParam.loginPort = 80
          }
          if (item.hyDevTypeName.indexOf('IPC') !== -1) {
            _this.addVideoDvrParam.channelCount = 1
            _this.addStatusDis = true
            _this.isDisabled = true
          } else if (item.hyDevTypeName.indexOf('NVR') !== -1 || item.hyDevTypeName.indexOf('DVR') !== -1) {
            _this.addVideoDvrParam.channelCount = 16
            _this.addStatusDis = false
            _this.isDisabled = false
          }
        }
      })
    },
    // 新增修改状态
    changeAddStatus(val) {
      // let _this = this
      this.addVideoDvrParam.status = val + ''
    },
    // 新增
    onCreate(formName, apiName) {
      const _this = this
      const idx = _this.typeArr.findIndex(item => item.hyDevTypeId === _this.addVideoDvrParam.devTypeId)
      if (idx !== -1) {
        const typeName = _this.typeArr[idx].hyDevTypeName
        if (typeName.indexOf('ipc') !== -1 || typeName.indexOf('IPC') !== -1) {
          if (_this.addVideoDvrParam.channelCount > 1) {
            _this.$message('IPC设备通道数不可以大于1')
            return
          }
        }
      }
      apiName = _this.addOrEdit === 'add' ? api.video.addVideoDvr : api.video.updateVideoDvr
      const typeIdx = _this.typeArr.findIndex(item => item.id === _this.addVideoDvrParam.devTypeId)
      if (typeIdx !== -1) {
        this.$set(_this.addVideoDvrParam, 'devTypeValue', _this.typeArr[typeIdx].dictdataValue)
      }
      _this.$refs[formName].validate((valid) => {
        if (valid) {
          _this.$set(_this.addVideoDvrParam, 'orgId', _this.addVideoDvrParam.catId)
          const addVideoDvrParam = { ..._this.addVideoDvrParam }
          addVideoDvrParam.cmdbItemTypeId = addVideoDvrParam.cmdbItemTypeId[addVideoDvrParam.cmdbItemTypeId.length - 1] || addVideoDvrParam.cmdbItemTypeId
          request({
            url: apiName,
            data: { ...addVideoDvrParam, cmdbItemSourceType: this.cmdbItemSourceType }
          })
            .then(res => {
              if (res.code === 1) {
                _this.onFilter()
                _this.addVideoDvrModal = false
                _this.$message({
                  message: apiName = _this.addOrEdit === 'add' ? '添加成功' : '更新成功',
                  type: 'success'
                })
              } else {
                _this.$message.error(res.msg)
              }
            })
        } else {
          _this.$message.error('请检查参数')
        }
      })
    },
    // 检测upload上传变换
    changeUpload(file, fileList) {
      const _this = this
      _this.bulkImport = file
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
          request({
            url: api.video.importDevice,
            data: {},
            form: this.fdata
          })
            .then(res => {
              if (res.code === 1) {
                _this.bulkImport = {
                  name: ''
                }
                _this.bulkImportModal = false
                _this.$message({
                  type: 'success',
                  message: res.msg
                })
                _this.onFilter()
              }
            })
        } else {
          _this.$message.error('请先选择文件')
        }
      })
    },
    // 查询
    async onFilter() {
      const _this = this
      // await
      if (_this.listQuery.status === 'all') {
        const { title, ip, devTypeId, orgId, page, limit } = _this.listQuery
        _this.listQueryAll = { title, ip, devTypeId, orgId, page, limit }
      }
      const data = _this.listQuery.status === 'all' ? _this.listQueryAll : _this.listQuery
      if (this.cmdbItemTypeId) data.cmdbItemTypeId = this.cmdbItemTypeId
      request({
        url: api.video.findVideoDvr,
        data: data
      })
        .then(res => {
          _this.tableData = res.data
          _this.total = Number(res.count)
          _this.$nextTick(() => {
            _this.initTable && _this.initTable()
          })
        })
    },
    // 批量删除
    onMover() {
      const _this = this
      const delLength = _this.delVideoDvr.length
      if (delLength > 0) {
        _this.$confirm('是否删除这些视频设备？', '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          _this.delVideoDvr.forEach((item, index) => {
            request({
              url: api.video.deleteVideoDvr,
              data: { dvrId: item }
            })
              .then(res => {
                if (res.code === 1) {
                  if (index + 1 === delLength) {
                    _this.onFilter()
                    _this.$message({
                      type: 'success',
                      message: '删除成功!'
                    })
                  }
                }
              })
          })
        }).catch(() => {
          _this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      } else {
        _this.$message({
          type: 'warning',
          message: '请先选择要批量删除的设备'
        })
      }
    },
    // 表格select
    handleSelectionChange(val) {
      console.log(val)
      const _this = this
      _this.delVideoDvr = []
      val.forEach(item => {
        _this.delVideoDvr.push(item.dvrId)
        _this.delVideoDvrVal.push(item)
      })
      console.log(_this.delVideoDvr)
    },
    // 编辑
    onEdit(val) {
      console.log(val, '编辑视频设备')
      const _this = this
      _this.addVideoDvrParam = JSON.parse(JSON.stringify(val))
      _this.addVideoDvrParam.status += ''
      _this.addVideoDvrParam.cmdbItemTypeId = 1
      _this.addOrEdit = 'edit'
      _this.addVideoDvrModal = true
      _this.$set(_this.addVideoDvrParam, 'catId', val.orgId)
      _this.isDisabled = true
    },
    // 通道
    onAisle(val) {
      const _this = this
      _this.aisleDis = false
      _this.aisleModal = true
      _this.typeArr.forEach(item => {
        if (item.hyDevTypeId === val.devTypeId && item.hyDevTypeName.indexOf('IPC') !== -1) {
          _this.aisleDis = true
        }
      })
      _this.aisleParam.dvrId = val.dvrId
      request({
        url: api.video.findVideoChn,
        data: _this.aisleParam
      })
        .then(res => {
          if (res.code === 1) {
            _this.aisletotal = Number(res.count)
            _this.aisleTable = res.data
          }
        })
    },
    // 删除
    onDelete(val) {
      const _this = this
      _this.$confirm('是否删除该视频设备？', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.video.deleteVideoDvr,
          data: { dvrId: val.dvrId }
        })
          .then(res => {
            if (res.code === 1) {
              _this.onFilter()
              _this.$message({
                type: 'success',
                message: '删除成功!'
              })
            }
          })
      }).catch(() => {
        _this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 删除通道
    moverAisle(val) {
      const _this = this
      _this.$confirm('是否删除该通道？', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.video.deleteVideoChn,
          data: { cid: val.cid }
        })
          .then(res => {
            if (res.code === 1) {
              _this.onAisle()
              _this.$message({
                type: 'success',
                message: '删除成功!'
              })
            }
          })
      }).catch(() => {
        _this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 编辑通道
    editAisle(val) {
      this.aisleEditModal = true
      this.editAisleInfoName = val.cname
      this.editAisleInfo = val
    },
    aisleEditFun() {
      const _this = this
      request({
        url: api.video.updateVideoChn,
        data: {
          cid: _this.editAisleInfo.cid,
          dvrId: _this.editAisleInfo.dvrId,
          cname: _this.editAisleInfoName
        }
      })
        .then(res => {
          if (res.code === 1) {
            _this.aisleEditModal = false
            _this.onAisle(_this.aisleParam)
            _this.$message({
              type: 'success',
              message: '保存成功!'
            })
          }
        })
    },
    // 获取状态select
    getStatusArr() {
      const _this = this
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'zstatus' }
      })
        .then(res => {
          if (res.code === 1) {
            _this.statusArr = res.data
          }
        })
    },
    // 获取类型select
    getTypeArr() {
      const _this = this
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'video_dev_type', limit: -1 }
      })
        .then(res => {
          if (res.code === 1) {
            for (var i = 0; i < res.data.length; i++) {
              res.data[i].hyDevTypeId = res.data[i].id
              res.data[i].hyDevTypeName = res.data[i].dictdataName
            }
            _this.typeArr = res.data
            _this.addVideoDvrParam.devTypeId = res.data[0].hyDevTypeId
          }
        })
    },
    // 获取区域select
    getAreaArr() {
      const _this = this
      request({ url: api.area.findHyitArea, data: {isVideo: 1}}).then(res => {
        if (res.code === 1) {
          _this.areaArr = res.data
          // 设置树结构
          _this.areaTreeArr = listToTree(res.data, 0, 0, 'hyAreaId', 'hyPid')
        }
      })
    },
    // 获取网关类型
    getfindVideoGateway() {
      const _this = this
      request({
        url: api.video.findVideoGateway,
        data: { page: 1, limit: -1 }
      })
        .then(res => {
          if (res.code === 1) {
            _this.gatewayArr = res.data
          }
        })
    },
    // 选择查询的参数
    changeSelect(val, $e) {
      const _this = this
      if (val === 'status') {
        _this.listQuery.status = $e
      } else if (val === 'devTypeId') {
        _this.listQuery.devTypeId = $e
      } else {
        _this.listQuery.orgId = $e
      }
    },
    // 选择网关
    selectGateway(val) {
      this.addVideoDvrParam.gId = val
    }, handleOrgChange(e) { // 区域查询使用
      this.listQuery.orgId = e[e.length - 1]
      console.log(JSON.stringify(e), this.listQuery.orgId)
    },
    // 获取类目列表
    findCmdbItemType() {
      request({
        url: api.cmdb.findCmdbItemType,
        data: {
          page: 1,
          limit: -1
        }
      }).then(res => {
        if (res.code === 1) {
          this.classifyTreeList = listToTree(res.data, 0, 0, 'id', 'parentId')
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 复制设备
    onCopy(row) {
      Object.keys(this.addVideoDvrParam).forEach(key => {
        console.log(key, row[key])
        this.addVideoDvrParam[key] = row[key]
      })
      this.addVideoDvrParam.status += ''
      this.addOrEdit = 'add'
      this.addVideoDvrModal = true
      this.$set(this.addVideoDvrParam, 'catId', row.orgId)
      let typeName = ''
      for (let i = 0; i < this.typeArr.length; i++) {
        if (this.typeArr[i].hyDevTypeId === this.addVideoDvrParam.devTypeId) {
          typeName = this.typeArr[i].hyDevTypeName
          break
        }
      }
      this.isDisabled = typeName.indexOf('IPC') >= 0
      delete this.addVideoDvrParam.dvrId
      if (!this.addVideoDvrParam.cmdbItemTypeId) this.addVideoDvrParam.cmdbItemTypeId = 1
      console.log(this.addVideoDvrParam)
    },
    onBulkImportModal() {
      this.fileList = []
      this.bulkImportModal = true
      this.fdata = new FormData()
    },
    handleImportOrgChange() {
      if (this.bulkImport.orgId) {
        this.fdata.append('orgid', this.bulkImport.orgId[this.bulkImport.orgId.length - 1])
      }
    },
    // 批量转资产
    onBatchTransferAssets() {
      if (this.delVideoDvr.length < 1) {
        this.$message('请选择设备')
        return
      }
      const jsonData = []
      this.delVideoDvrVal.forEach(item => {
        const valList = {}
        valList.assetsName = item.title
        valList.cmdbItemTypeId = 12
        valList.systemDeviceId = item.dvrId
        valList.systemDeviceType = 1
        jsonData.push(valList)
      })
      const jsonList = JSON.stringify(jsonData)
      this.$confirm('确认将所选设备转为资产吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.insertAssetsInfos(jsonList)
      })
    },
    // 批量新增资产
    insertAssetsInfos(data) {
      request({
        url: api.assets.insertAssetsInfos,
        data: { json: data }
      }).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
          this.$refs.authDeviceTable.clearSelection()
          this.onFilter()
          this.delVideoDvr = []
          this.delVideoDvrVal = []
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
    }
  }
}
