import Pagination from '@/components/Pagination'
import request from '@/utils/request'
import api from '@/api/api'
import FileUpload from '@/components/Upload/file-upload'
// import QRCode from 'qrcodejs2'

export default {
  components: { Pagination, FileUpload },
  props: {
    cmdbItemTypeId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      QRwidth: null,
      QRheight: null,
      listLoading: true,
      listQuery: {
        keyword: '',
        page: 1,
        limit: 10,
        total: 0,
        status: ''
      },
      list: [],
      assetsStatusList: [],
      configItemTreeList: [],
      orgTreeList: [],
      showBatchAllocationDialog: false,
      assetsUseForm: {
        status: '',
        organizationCatId: '',
        manageId: '',
        useTypeId: '',
        departmentCatId: '',
        userId: '',
        useStime: '',
        useEtime: '',
        projectCatId: '',
        location: '',
        dataUrl: ''
      },
      assetsUseFormRules: {
        departmentCatId: [{ required: true, message: '请输选择使用部门', trigger: 'blur' }],
        userId: [{ required: true, message: '请输选择使用人', trigger: 'blur' }],
        status: [{ required: true, message: '请选择状态', trigger: 'blur' }],
        useStime: [{ required: true, message: '请选择使用开始时间', trigger: 'blur' }],
        useEtime: [{ required: true, message: '请选择使用结束时间', trigger: 'blur' }]
      },
      beOrgEmployeList: [],
      assetsUseTypeList: [],
      useOrgEmployeList: [],
      assetsProjectCatList: [],
      assetsIds: [],
      dataFileList: [],
      findHrUserInfoQuery: {
        organizationCatId: '',
        page: 1,
        limit: -1
      },
      showQRCodeDialog: false
    }
  },
  computed: {
    setUseStatus() {
      return function(status) {
        const idx = this.assetsStatusList.findIndex(item => item.id === status)
        if (idx !== -1) {
          return this.assetsStatusList[idx].dictdataName
        }
      }
    },
    setConfigItem() {
      return function(cmdbCatId) {
        const idx = this.configItemTreeList.findIndex(item => item.id === cmdbCatId)
        if (idx !== -1) {
          return this.configItemTreeList[idx].name
        }
      }
    },
    setUseOrg() {
      return function(departmentCatId) {
        const idx = this.orgTreeList.findIndex(item => item.hyOrgId === departmentCatId)
        if (idx !== -1) {
          return this.orgTreeList[idx].hyOrgName
        }
      }
    }
  },
  async mounted() {
    await this.findConfigItemCat()
    await this.findOrganizationCat()
    await this.findAssetsUseTypeCat()
    await this.findAssetsStatusTypeCat()
    // 资产报表需要请求到项目才能请求数据
    if (!this.columns) await this.findAssetsInfo()
  },
  methods: {
    onPushDetail(row) {
      if (!row.hostObj) return
      this.$router.push({
        name: 'ResourceMonitorDetail',
        query: {
          id: row.hostObj.hyHostId || 0,
          zbxHostId: row.hostObj.hyZhostId,
          agent: row.hostObj.agent,
          devTypeId: row.hostObj.hyDevTypeId,
          // subType: data && data.length > 0 ? data[0].dictdataValue : '',
          hySubdevTypeId: row.hostObj.subdevTypeId
        }
      })
    },
    async onDetail(row) {
      const query = { assetsId: row.assetsId }
      if (row.purchaseId) query.purchaseId = row.purchaseId
      if (row.useId) query.useId = row.useId
      this.$router.push({
        name: 'AssetsDetail',
        query
      })
    },
    handleCreate() {
      this.$router.push({
        name: 'AssetsCreate'
      })
    },
    onEdit(row) {
      const query = { assetsId: row.assetsId }
      if (row.purchaseId) query.purchaseId = row.purchaseId
      if (row.useId) query.useId = row.useId
      if (row.hostObj) {
        query.hyHostId = row.hostObj.hyHostId
        query.hyOrgId = row.hostObj.hyOrgId
        query.hyAddr = row.hostObj.hyAddr
        query.hyRelation = row.hostObj.hyRelation
      }
      this.$router.push({
        name: 'AssetsUpdate',
        query
      })
    },
    handleFilter() {
      this.$set(this.listQuery, 'page', 1)
      this.findAssetsInfo()
    },
    // 获取it监控设备
    async findHyitHostIds(ids) {
      const { data, code } = await request({ url: api.itMonitor.findHyitHost, data: { ids, limit: -1 } })
      if (code === 1) return data
    },
    async findHyitArea(ids) {
      const { data, code } = await this.$request({ url: this.api.area.findHyitArea, data: { ids, limit: -1 } })
      if (code === 1) return data
    },
    async findAssetsInfo(query) {
      if (this.cmdbItemTypeId) this.$set(this.listQuery, 'cmdbItemTypeId', this.cmdbItemTypeId)
      await request({
        url: api.assets.findAssetsInfo,
        data: {...this.listQuery, ...query}
      }).then(async res => {
        this.listLoading = false
        if (res.code === 1) {
          const hostIds = res.data
            .filter(it => +it.systemDeviceType === 2)
            .map(it => it.systemDeviceId)
            .filter(Boolean)
          let hostList = []
          if (hostIds.length) hostList = await this.findHyitHostIds(hostIds)
          const areaIds = hostList.map(it => it.hyOrgId).filter(Boolean)
          let areaList = []
          if (areaIds.length) areaList = await this.findHyitArea(areaIds)
          for (const it of res.data) {
            it['deviceTypeName'] = this.$tool.formatStr(it.systemDeviceType, '1:视频设备,2:it监控设备,3:动环设备')
            it['statueName'] = this.$tool.matchData(this.assetsStatusList, it, 'status', 'dictdataName', 'id')
            it['assetClasses'] = this.$tool.matchData(this.configItemTreeList, it, 'assetsCatId', 'name', 'id')
            if (hostIds.length) {
              const idx = hostList.find(item => item.hyHostId === it.systemDeviceId)
              if (idx) {
                it['ip'] = idx['hyIp']
                it['hostObj'] = idx
                const area = areaList.find(el => el.hyAreaId === idx.hyOrgId)
                if (area) it['hyAreaName'] = area['hyAreaName']
              }
            }
          }
          this.listQuery.total = Number(res.count)
          this.list = res.data
          const assetsIds = []
          this.list.forEach(item => {
            assetsIds.push(item.assetsId)
          })

          // 通过关联表查询出关联信息，然后再去调用查看获取出关联的信息
          // 采购
          this.findAssetsPurchaseMap({ assetsIds: assetsIds.join(',') }).then(purchaseMapRes => {
            if (purchaseMapRes.code === 1 && purchaseMapRes.data.length > 0) {
              const purchaseIds = []
              purchaseMapRes.data.forEach(item => {
                purchaseIds.push(item.purchaseId)
              })
              this.findAssetsPurchase({ purchaseIds: purchaseIds.join(',') }).then(purchaseRes => {
                if (purchaseRes.code === 1 && purchaseRes.data.length > 0) {
                  purchaseRes.data.forEach(item => {
                    const idx = purchaseRes.map.assetsPurchaseMapList.findIndex(items => items.purchaseId === item.purchaseId)
                    if (idx !== -1) {
                      item.assetsId = purchaseRes.map.assetsPurchaseMapList[idx].assetsId
                    }
                  })
                  this.list.forEach((item, index) => {
                    const idx = purchaseRes.data.findIndex(items => items.assetsId === item.assetsId)
                    if (idx !== -1) {
                      // 采购金额
                      this.$set(this.list[index], 'price', purchaseRes.data[idx].price / 1000)
                      this.$set(this.list[index], 'purchaseId', purchaseRes.data[idx].purchaseId)
                      this.$set(this.list[index], 'purchaseDate', purchaseRes.data[idx].purchaseDate)
                    }
                  })
                }
              })
            }
          })
          // 使用人
          this.findAssetsUseMap({ assetsDeviceIds: assetsIds.join(',') }).then(async useMapRes => {
            if (useMapRes.code === 1 && useMapRes.data.length > 0) {
              const useIds = []
              useMapRes.data.forEach(item => {
                useIds.push(item.useId)
              })
              this.findAssetsUse({ useIds: useIds.join(',') }).then(async useRes => {
                const userIds = []
                if (useRes.code === 1 && useRes.data.length > 0) {
                  // 获取管理人和使用人
                  for (const user of useRes.data) {
                    userIds.push(user.userId)
                    userIds.push(user.manageId)
                  }
                  const userList = await this.findSysUser(userIds.filter(Boolean).join(','))
                  // end 获取管理人和使用人
                  useRes.data.forEach(item => {
                    const idx = useRes.map.assetsUseMapList.findIndex(items => items.useId === item.useId)
                    if (idx !== -1) {
                      item.assetsId = useRes.map.assetsUseMapList[idx].assetsDeviceId
                      // item.assetsName = this.$tool, matchData(userList, useRes.map.assetsUseMapList[idx],)
                    }
                  })
                  this.list.forEach((item, index) => {
                    const idx = useRes.data.findIndex(items => items.assetsId === item.assetsId)

                    if (idx !== -1) {
                      this.$set(this.list[index], 'useId', useRes.data[idx].useId)
                      this.$set(this.list[index], 'userId', useRes.data[idx].userId)
                      this.$set(this.list[index], 'manageUseName', this.$tool.matchData(userList, useRes.data[idx], 'manageId', 'userRealName', 'id'))
                      this.$set(this.list[index], 'useName', this.$tool.matchData(userList, useRes.data[idx], 'userId', 'userRealName', 'id'))
                      // 所在位置
                      this.$set(this.list[index], 'location', useRes.data[idx].location)
                      // 使用部门
                      this.$set(this.list[index], 'departmentCatId', useRes.data[idx].departmentCatId)
                      // 使用期限
                      this.$set(this.list[index], 'useStime', useRes.data[idx].useStime)
                      this.$set(this.list[index], 'useEtime', useRes.data[idx].useEtime)
                      this.$set(this.list[index], 'useStatue', this.$tool.matchData(this.assetsUseTypeList, useRes.data[idx], 'useTypeId', 'catName', 'catId'))
                    }
                  })
                }
              })
            }
          })
          this.$nextTick(() => {
            this.initTable && this.initTable()
          })
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    async findSysUser(infoIds) {
      const { data, code } = await this.$request({ url: this.api.hr.findHrUserInfo, data: { infoIds, limit: -1 } })
      if (code === 1) return data
    },
    // 查询与资产关联的采购单
    async findAssetsPurchaseMap(data) {
      return await request({
        url: api.assets.findAssetsPurchaseMap,
        data: {
          ...data,
          page: 1,
          limit: -1
        }
      }).then(res => {
        return res
      })
    },
    // 查询与资产关联的使用人
    async findAssetsUseMap(data) {
      return await request({
        url: api.assets.findAssetsUseMap,
        data: {
          ...data,
          page: 1,
          limit: -1
        }
      }).then(res => {
        return res
      })
    },
    // 查询采购单
    async findAssetsPurchase(data) {
      return await request({
        url: api.assets.findAssetsPurchase,
        data: {
          ...data,
          page: 1,
          limit: -1
        }
      }).then(res => {
        return res
      })
    },
    // 查询使用
    async findAssetsUse(data) {
      return await request({
        url: api.assets.findAssetsUse,
        data: {
          ...data,
          page: 1,
          limit: -1
        }
      }).then(res => {
        return res
      })
    },
    onDelete(row) {
      // 删除资产同时要查询有没有关联采购单和使用人信息，有的话要删除采购单和使用人信息
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.assets.deleteAssetsInfo,
          data: { assetsId: row.assetsId }
        }).then(res => {
          if (res.code === 1) {
            this.findAssetsInfo()
            // 删除采购单
            if (row.purchaseId) {
              request({
                url: api.assets.deleteAssetsPurchase,
                data: { purchaseId: row.purchaseId }
              })
            }

            if (row.useId) {
              // 删除使用人
              request({
                url: api.assets.deleteAssetsUse,
                data: { useId: row.useId }
              })
            }
          }
        })
      })
    },
    // 打印组件
    showPrint(row) {
      this.$refs.DetailPirntRef.handleMit(row)
    },

    // 获取配置项
    findConfigItemCat() {
      request({
        url: api.cmdb.findCmdbItemType,
        data: {
          page: 1,
          limit: -1
        }
      }).then(res => {
        if (res.code === 1) {
          this.configItemTreeList = res.data
        }
      })
    },
    // 获取部门
    findOrganizationCat() {
      request({
        url: api.org.findHyitOrg,
        data: { page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.orgTreeList = res.data
        }
      })
    },
    onAssetsChange(row) {
      this.$confirm('确认归还吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 删除使用信息
        this.deleteAssetsUseMap({
          useId: row.useId,
          assetsDeviceId: row.assetsId
        }).then(res => {
          if (res) {
            // 插入变更日志
            this.insertAssetsChangeLog({
              organizationCatId: row.departmentCatId,
              sourceType: 1,
              assetsDeviceId: row.assetsId
            })
            // 修改资产信息
            this.saveAssetsInfo({
              assetsId: row.assetsId,
              assetsName: row.assetsName,
              status: 485
            })
            this.$message({
              type: 'success',
              message: '归还成功'
            })
            this.findAssetsInfo()
          } else {
            this.$message.error('归还失败')
          }
        })
      })
    },
    // 删除资产使用
    async deleteAssetsUseMap(data) {
      return await request({
        url: api.assets.deleteAssetsUseMap,
        data
      }).then(res => {
        if (res.code === 1) {
          return res
        }
      })
    },
    // 新增变更记录
    insertAssetsChangeLog(data) {
      request({
        url: api.assets.insertAssetsChangeLog,
        data
      })
    },
    // 获取使用类型
    findAssetsStatusTypeCat() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'assets_use_type', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.assetsStatusList = res.data
        }
      })
    },
    // 获取使用类型
    findAssetsUseTypeCat() {
      request({
        url: api.sys.findSysCat,
        data: { page: 1, limit: -1, systemName: 'userDefine', classify: 'userDefine_资产使用方式', parentId: -1, module: 2 }
      }).then(res => {
        if (res.code === 1) {
          this.assetsUseTypeList = res.data
        }
      })
    },
    // 资产和使用人关联
    async insertAssetsUseMap(data) {
      return await request({
        url: api.assets.insertAssetsUseMap,
        data
      })
    },
    // 选择所属部门
    changeBeOrg() {
      const organizationCatId = this.assetsUseForm.organizationCatId[this.assetsUseForm.organizationCatId.length - 1]
      this.$set(this.findHrUserInfoQuery, 'organizationCatId', organizationCatId)
      this.findHrUserInfo().then(res => {
        this.beOrgEmployeList = res
      })
    },
    // 选择使用部门
    changeUseOrg() {
      const organizationCatId = this.assetsUseForm.departmentCatId[this.assetsUseForm.departmentCatId.length - 1]
      this.$set(this.findHrUserInfoQuery, 'organizationCatId', organizationCatId)
      this.findHrUserInfo().then(res => {
        this.useOrgEmployeList = res
      })
    },
    // 获取人员
    async findHrUserInfo(organizationCatId) {
      const data = { ...this.findHrUserInfoQuery, companyId: this.$auth.getUserSession().companyId }
      if (organizationCatId) data.organizationCatId = organizationCatId
      return await request({
        url: api.hr.findHrUserInfo,
        data
      }).then(res => {
        if (res.code === 1) {
          return res.data
        }
      })
    },
    // 修改资产信息
    async saveAssetsInfo(data) {
      return await request({
        url: api.assets.updateAssetsInfo,
        data
      })
    },
    getEmitUseAttachmentFileList(file) {
      this.dataFileList = file['fileList']
      this.$set(this.assetsUseForm, 'dataUrl', file.fileList.length > 0 ? file.fileList[0]['url'] : '')
    },
    // 打开批量分配
    handleBatchAllocation() {
      if (this.allSelection.length === 0) return this.$message('请选择资产')
      let haveUse = false
      const assetsIds = []
      this.allSelection.forEach(item => {
        if (item.useId) haveUse = true
        assetsIds.push(item.assetsId)
      })
      this.assetsIds = assetsIds
      if (haveUse) return this.$message('选择的资产包含已分配资产，请先取消已分配资产')
      this.showBatchAllocationDialog = true
    },
    // 批量转资产
    handleBatchAssets() {
      this.$router.push({
        name: 'AssetsTransfer'
      })
    },
    // 确定分配
    batchAllocationDialog() {
      this.$refs['form'].validate(async valid => {
        if (valid) {
          const data = { ...this.assetsUseForm }
          data.organizationCatId = data.organizationCatId.length ? data.organizationCatId[data.organizationCatId.length - 1] : data.organizationCatId
          data.departmentCatId = data.departmentCatId.length ? data.departmentCatId[data.departmentCatId.length - 1] : data.departmentCatId
          data.assetsIds = this.assetsIds.toString()
          request({
            url: api.assets.insertAssetsIdsUse,
            data
          }).then(res => {
            if (res.code === 1) {
              this.$message.success('分配成功')
              this.findAssetsInfo()
              this.showBatchAllocationDialog = false
            }
          })
        }
      })
    }
  }
}
