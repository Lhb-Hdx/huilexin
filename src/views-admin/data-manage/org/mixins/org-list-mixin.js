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
      hyOrgId: '',
      form: {
        hyOrgName: '',
        hyPid: '',
        cmdbItemTypeId: 10
      },
      rules: {},
      listQuery: {
        keyword: null,
        page: 1,
        limit: 10,
        total: 0
      },
      data: [],
      tree: [],
      drawer: false,
      direction: 'rtl',
      catProps: {
        value: 'hyOrgId',
        label: 'hyOrgName',
        checkStrictly: true
      },
      cmdbItemSourceType: 6,
      classifyTreeList: []
    }
  },
  mounted() {
    this.loadCat()
    this.findCmdbItemType()
  },
  methods: {
    resetForm(form) {
      Object.keys(form).forEach(key => {
        form[key] = ''
      })
      this.form.cmdbItemTypeId = 10
    },
    addCat() {
      this.drawer = true
      this.resetForm(this.form)
      this.hyOrgId = ''
    },
    onAdd(item) {
      this.drawer = true
      this.resetForm(this.form)
      this.hyOrgId = ''
      this.$set(this.form, 'hyPid', item.hyOrgId)
    },
    onEdit(item) {
      this.drawer = true
      this.resetForm(this.form)
      this.hyOrgId = item.hyOrgId
      this.$set(this.form, 'hyOrgName', item.hyOrgName)
      this.$set(this.form, 'hyPid', item.hyPid)
      this.$set(this.form, 'cmdbItemTypeId', item.cmdbItemTypeId)
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
          url: api.org.deleteHyitOrg,
          data: { hyOrgId: item.hyOrgId }
        }).then(res => {
          that.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          that.drawer = false
          that.page = 1
          that.data = []
          that.loadCat()
        })
      })
    },
    saveCat() {
      const data = this.hyOrgId === '' ? { ...this.form } : { ...this.form, hyOrgId: this.hyOrgId }
      const apiName = this.hyOrgId === '' ? api.org.insertHyitOrg : api.org.updateHyitOrg
      data.cmdbItemTypeId = data.cmdbItemTypeId[data.cmdbItemTypeId.length - 1] || data.cmdbItemTypeId

      request({
        url: apiName,
        data: { ...data, cmdbItemSourceType: this.cmdbItemSourceType }
      }).then(res => {
        this.drawer = false
        this.$set(this.listQuery, 'page', 1)
        this.data = []
        this.loadCat()

        this.$notify({
          title: '温馨提示',
          message: res.msg,
          type: 'success',
          duration: 2000
        })
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
        url: api.org.findHyitOrg,
        data: this.listQuery
      }).then(res => {
        this.tree = listToTree(res.data, 0, 0, 'hyOrgId', 'hyPid')
        this.data = this.tree
        this.listQuery.total = +res.count
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
