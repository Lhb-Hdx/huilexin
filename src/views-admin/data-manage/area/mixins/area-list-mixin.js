import request from '@/utils/request'
import api from '@/api/api'
import { listToTree } from '@/utils'

export default {
  props: {
    cmdbItemTypeId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      hyAreaId: '',
      form: {
        hyAreaName: '',
        hyPid: '',
        cmdbItemTypeId: 305,
        hyLatitude: '',
        hyLongitude: '',
        addr: '',
        isDh: null,
        isIt: null,
        isVideo: null

      },
      fileList: [],
      isDhData: null,
      isItData: null,
      isVideoData: null,
      hyAreaIdData: null,
      checked: '',
      timer: null,
      showTips: false,
      listQuery: {
        keyword: null,
        total: 0,
        page: 1,
        limit: -1
      },
      rules: {},
      data: [],
      tree: [],
      drawer: false,
      direction: 'rtl',
      catProps: {
        value: 'hyAreaId',
        label: 'hyAreaName',
        checkStrictly: true
      },
      cmdbItemSourceType: 7,
      classifyTreeList: [],
      loading: false
    }
  },
  computed: {
    setcmdbItemTypeId() {
      return function(val) {
        const idx = this.classifyTreeList.findIndex(item => +item.id === +val)
        if (idx !== -1) {
          return this.classifyTreeList[idx].name
        }
      }
    }
  },
  mounted() {
    this.loadCat()
    this.findCmdbItemType()
  },
  methods: {
    // 监听文件上传
    getEmitFileList(file) {
      this.fileList = file['fileList']
      this.$set(this.form, 'imgUrl', file.fileList.length > 0 ? file.fileList[0]['url'] : '')
    },
    change() {
      let nodesInfo = this.$refs['cascader'].getCheckedNodes()[0].data
      this.isDhData = nodesInfo.isDh
      this.isItData = nodesInfo.isIt
      this.isVideoData = nodesInfo.isVideo
      this.hyAreaIdData = nodesInfo.hyAreaId
    },
    updateIsIt(row) {
      request({
        url: api.area.updateHyitArea,
        data: {
          hyAreaId: row.hyAreaId,
          isIt: row.isIt
        }
      }).then(res => {
        if (res.code === 1) {
          this.$message({
            type: 'success',
            message: '更改成功'
          })
        }
      })
    },
    updateIsVideo(row) {
      request({
        url: api.area.updateHyitArea,
        data: {
          hyAreaId: row.hyAreaId,
          isVideo: row.isVideo
        }
      }).then(res => {
        if (res.code === 1) {
          this.$message({
            type: 'success',
            message: '更改成功'
          })
        }
      })
    },
    updateIsDh(row) {
      request({
        url: api.area.updateHyitArea,
        data: {
          hyAreaId: row.hyAreaId,
          isDh: row.isDh
        }
      }).then(res => {
        if (res.code === 1) {
          this.$message({
            type: 'success',
            message: '更改成功'
          })
        }
      })
    },
    resetForm(form) {
      Object.keys(form).forEach(key => {
        form[key] = ''
      })
      this.form.cmdbItemTypeId = 305
    },
    addCat() {
      this.drawer = true
      this.resetForm(this.form)
      this.hyAreaId = ''
    },
    onAdd(item) {
      this.drawer = true
      this.resetForm(this.form)
      this.hyAreaId = ''
      this.$set(this.form, 'hyPid', item.hyAreaId)
    },
    onEdit(item) {
      this.drawer = true
      this.resetForm(this.form)
      this.hyAreaId = item.hyAreaId
      this.$set(this.form, 'hyPid', item.hyPid)
      this.$set(this.form, 'hyAreaName', item.hyAreaName)
      this.$set(this.form, 'cmdbItemTypeId', 305)

      this.$set(this.form, 'hyLatitude', item.hyLatitude)
      this.$set(this.form, 'hyLongitude', item.hyLongitude)
      this.$set(this.form, 'addr', item.addr)
    },
    onDelete(item) {
      if (item.children.length > 0) {
        this.$message('存在子级，不能删除')
        return
      }
      const that = this
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.area.deleteHyitArea,
          data: { hyAreaId: item.hyAreaId }
        }).then(() => {
          that.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          that.drawer = false
          this.$set(this.listQuery, 'page', 1)
          that.data = []
          that.loadCat()
        })
      })
    },
    saveCat() {
      if (this.checked) {
        this.$set(this.form, 'isDh', this.isDhData)
        this.$set(this.form, 'isIt', this.isItData)
        this.$set(this.form, 'isVideo', this.isVideoData)
      }
      this.$set(this.form, 'hyPid', this.form.hyPid[this.form.hyPid.length - 1])

      const data = this.hyAreaId === '' ? { ...this.form } : { ...this.form, hyAreaId: this.hyAreaId }
      const apiName = this.hyAreaId === '' ? api.area.insertHyitArea : api.area.updateHyitArea
      data.cmdbItemTypeId = data.cmdbItemTypeId[data.cmdbItemTypeId.length - 1] || data.cmdbItemTypeId
      this.loading = true
      request({
        url: apiName,
        data: { ...data, cmdbItemSourceType: this.cmdbItemSourceType }
      }).then(res => {
        this.loading = false
        if (res.code === 1) {
          this.drawer = false
          this.$set(this.listQuery, 'page', 1)
          this.data = []
          if (this.checked) {
            this.updateOrgId(res.model.hyAreaId, this.hyAreaIdData)
          }
          this.loadCat()
          this.$notify({
            title: '温馨提示',
            message: res.msg,
            type: 'success',
            duration: 2000
          })
        }
      })
    },
    updateOrgId(id, oldId) {
      request({
        url: api.video.updateOrgId,
        data: {
          orgId: id,
          oldOrgId: oldId
        }
      })
    },
    searchCat() {
      this.$set(this.listQuery, 'page', 1)
      this.data = []
      this.loadCat()
    },
    loadCat() {
      if (this.cmdbItemTypeId) this.$set(this.listQuery, 'cmdbItemTypeId', this.cmdbItemTypeId)
      request({
        url: api.area.findHyitArea,
        data: this.listQuery
      }).then(res => {
        this.listQuery.total = Number(res.count)// 分页
        this.tree = listToTree(res.data, 0, 0, 'hyAreaId', 'hyPid')
        this.data = this.tree
      })
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
    }
  }
}

