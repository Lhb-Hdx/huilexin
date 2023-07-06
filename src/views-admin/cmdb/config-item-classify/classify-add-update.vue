<template>
  <div>
    <div class="page-nav">
      <i class="el-icon-back" @click="$router.back()" />
      <span>{{ navTitle }}</span>
    </div>
    <div class="app-container">
      <el-card v-loading="loading">
        <el-form ref="form" :model="form" :rules="rules" label-width="120px">
          <el-row :gutter="12">
            <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form-item label="类目名称" prop="name">
                <el-input v-model.trim="form.name" placeholder="请输入类目名称" :disabled="form.userDefine === 0" />
              </el-form-item>
              <el-form-item label="父类目" prop="parentId">
                <el-cascader
                  v-model="form.parentId"
                  class="w-100"
                  placeholder="选择父类目"
                  :options="classifyTreeList"
                  :props="{ value: 'id', label: 'name', checkStrictly: true }"
                  :disabled="form.userDefine === 0"
                />
              </el-form-item>
              <el-form-item label="类目图片">
                <FileUpload
                  v-permission="['ClassifyImgUpload']"
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
                  @emitFileList="getEmitFileList"
                />
              </el-form-item>
              <el-form-item label="配置关系">
                <el-button v-permission="['AddConfigBetween']" class="filter-item margin-bottom-20" type="primary" @click="addCmdbItemMapItem">新增</el-button>
                <div v-if="cmdbItemMapList.length > 0" class="task-script-box">
                  <div v-for="(item,index) of cmdbItemMapList" :key="item.timestamp" class="task-script-item">
                    <div class="item-col" style="width: 45%">
                      <el-form-item label="配置关系" label-width="80px">
                        <el-select
                          v-model="item.relationshipTypeId"
                          placeholder="配置关系"
                          style="width: 100%;"
                          @change="changeCmdbItemMap($event,index)"
                        >
                          <el-option
                            v-for="items in cmdbRelationshipTypeList"
                            :key="items.id"
                            :label="items.relationshipForward + ' —— ' + items.relationshipReverse"
                            :value="items.id"
                          />
                        </el-select>
                      </el-form-item>
                    </div>
                    <div class="item-col" style="width: 45%">
                      <el-form-item label="对应配置类目" label-width="100px">
                        <el-cascader
                          ref="cascader"
                          v-model="item.relationshipItemTypeId"
                          class="w-100"
                          placeholder="配置类目"
                          :options="classifyTreeList"
                          :props="{ value: 'id', label: 'name', checkStrictly: true }"
                          @change="getCmdbItemMap($event,index)"
                        />
                      </el-form-item>
                    </div>
                    <div class="item-col item-action">
                      <el-button v-permission="['DeleteConfigBetween']" type="danger" size="small" @click="delCmdbItemMapItem(item.timestamp)">删除</el-button>
                    </div>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="" prop="">
                <el-button v-permission="['Submit']" type="primary" :loading="confirmLoading" @click="saveCmdbItemType">保存</el-button>
                <el-button @click="onReset">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { listToTree } from '@/utils'
import FileUpload from '@/components/Upload/file-upload'

export default {
  name: 'ClassifyAddUpdate',
  components: { FileUpload },
  data() {
    return {
      loading: false,
      form: {
        name: '',
        parentId: 0,
        imageUrl: '',
        userDefine: 1,
        rootId: ''
      },
      rules: {},
      fileList: [],
      classifyTreeList: [],
      cmdbRelationshipTypeList: [],
      uploadToken: { // 后端这个接口还没有去掉这个必填参数，所以传空就可以
        company_id: '',
        app_id: '',
        app_key: '',
        ver: '',
        timestamp: '',
        sign: ''
      },
      confirmLoading: false,
      cmdbItemMapList: [], // 关系配置列表
      addCmdbItemMapList: [], // 添加的关系配置
      delCmdbItemMapList: [], // 删除的关系配置
      editCmdbItemMapList: [] // 编辑的关系配置
    }
  },
  computed: {
    id() {
      return this.$route.query.id
    },
    navTitle() {
      return this.$route.meta.title
    }
  },
  mounted() {
    console.log('执行了一次', this.id)
    if (this.id) {
      console.log('执行了2次', this.id)
      this.getCmdbItemType()
      this.findCmdbItemTypeRelationship()
    }
    this.findCmdbRelationshipType()
    this.findCmdbItemType()
  },
  methods: {
    log(node, data) {
      console.log('node,data: ', node, data)
    },
    // 图片上传
    upload(param) {
      const fdata = new FormData()
      fdata.append('file', param.file)
      request({
        url: api.file.uploadPic, data: this.uploadToken, form: fdata
      }).then(res => {
        if (res.code === 1) {
          this.$set(this.form, 'imageUrl', res.map.img)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    uploadChange(file, fileList) {
      this.fileList = fileList.slice(-3)
    },
    uploadRemove() {
      this.$set(this.form, 'imageUrl', '')
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
          const data = []
          res.data.forEach(item => {
            data.push(item)
          })
          this.classifyTreeList = listToTree(data, 0, 0, 'id', 'parentId')
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 获取关系列表
    findCmdbRelationshipType() {
      request({
        url: api.cmdb.findCmdbRelationshipType,
        data: {
          page: 1,
          limit: -1
        }
      }).then(res => {
        this.listLoading = false
        if (res.code === 1) {
          this.cmdbRelationshipTypeList = res.data // 关系中文
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 保存类目
    saveCmdbItemType() {
      console.log('this.addCmdbItemMapList.length', this.addCmdbItemMapList.length, this.addCmdbItemMapList)
      if (this.cmdbItemMapList.length > 0) {
        const cmdbItemMapList = [...this.cmdbItemMapList]
        for (let i = 0; i < cmdbItemMapList.length; i++) {
          if (!cmdbItemMapList[i].id) {
            cmdbItemMapList[i].relationshipItemTypeId = cmdbItemMapList[i].relationshipItemTypeId[cmdbItemMapList[i].relationshipItemTypeId.length - 1]
            this.addCmdbItemMapList.push(cmdbItemMapList[i])
          }
        }
      }
      const apiName = this.form.id ? api.cmdb.updateCmdbItemType : api.cmdb.insertCmdbItemType
      const form = this.form
      form.rootId = form.rootId || form.parentId[0]
      form.parentId = form.parentId[form.parentId.length - 1] || form.parentId
      request({
        url: apiName,
        data: form
      }).then(res => {
        if (res.code === 1) {
          if (this.addCmdbItemMapList.length > 0) {
            this.insertCmdbItemTypeRelationship()
          }
          if (this.delCmdbItemMapList.length > 0) {
            this.deleteCmdbItemTypeRelationship()
          }
          if (this.editCmdbItemMapList.length > 0) {
            this.updateCmdbItemTypeRelationship()
          }
          this.$message.success(res.msg)
          this.$router.back()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 重置
    onReset() {},
    // 获取当前类目信息
    getCmdbItemType() {
      request({
        url: api.cmdb.getCmdbItemType,
        data: {
          id: this.id
        }
      }).then(res => {
        if (res.code === 1) {
          Object.keys(this.form).forEach(key => {
            this.$set(this.form, `${key}`, res.model[key])
          })
          this.form.id = res.model.id
          if (res.model.imageUrl !== '') {
            this.fileList = [{
              id: res.model.id,
              url: res.model.imageUrl,
              name: res.model.imageUrl
            }]
          }
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 获取关联关系列表
    findCmdbItemTypeRelationship() {
      request({
        url: api.cmdb.findCmdbItemTypeRelationship,
        data: {
          page: 1,
          limit: -1,
          itemTypeId: this.id
        }
      }).then(res => {
        if (res.code === 1) {
          for (var i = 0; i < res.data.length; i++) {
            res.data[i].timestamp = new Date().getTime() + `${res.data[i].id}`
          }
          this.cmdbItemMapList = [...res.data]
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 点击删除关系
    delCmdbItemMapItem(timestamp) {
      this.$confirm('确定要删除此条数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        const idx = this.cmdbItemMapList.findIndex(item => Number(item.timestamp) === Number(timestamp))
        const edIdx = this.editCmdbItemMapList.findIndex(item => Number(item.timestamp) === Number(timestamp))
        if (this.cmdbItemMapList[idx].id) {
          this.$set(this.delCmdbItemMapList, this.delCmdbItemMapList.length, this.cmdbItemMapList[idx])
          this.editCmdbItemMapList.splice(edIdx, 1)
        } else {
          const adIdx = this.addCmdbItemMapList.findIndex(item => Number(item.timestamp) === Number(timestamp))
          if (adIdx !== -1) this.addCmdbItemMapList.splice(adIdx, 1)
        }
        this.cmdbItemMapList.splice(idx, 1)
      })
    },
    // 点击添加关系
    addCmdbItemMapItem() {
      const addItem = {
        itemTypeId: this.id,
        relationshipTypeId: '',
        relationshipItemTypeId: '',
        timestamp: new Date().getTime()
      }
      this.$set(this.cmdbItemMapList, this.cmdbItemMapList.length, addItem)
      // this.addCmdbItemMapList.push(addItem)
    },
    // 添加关系
    insertCmdbItemTypeRelationship() {
      console.log(this.addCmdbItemMapList.length)
      for (let i = 0; i < this.addCmdbItemMapList.length; i++) {
        request({ url: api.cmdb.insertCmdbItemTypeRelationship, data: this.addCmdbItemMapList[i] })
      }
    },
    // 删除关系
    deleteCmdbItemTypeRelationship() {
      for (let i = 0; i < this.delCmdbItemMapList.length; i++) {
        request({ url: api.cmdb.deleteCmdbItemTypeRelationship, data: { id: this.delCmdbItemMapList[i].id }})
      }
    },
    // 编辑关系
    updateCmdbItemTypeRelationship() {
      for (let i = 0; i < this.editCmdbItemMapList.length; i++) {
        request({ url: api.cmdb.updateCmdbItemTypeRelationship, data: {
          id: this.editCmdbItemMapList[i].id,
          itemTypeId: this.editCmdbItemMapList[i].itemTypeId,
          relationshipItemTypeId: this.editCmdbItemMapList[i].relationshipItemTypeId[this.editCmdbItemMapList[i].relationshipItemTypeId.length - 1],
          relationshipTypeId: this.editCmdbItemMapList[i].relationshipTypeId
        }})
      }
    },
    getCmdbItemMap(select, index) {
      const item = this.cmdbItemMapList[index]
      if (item['id'] && !this.editCmdbItemMapList.find(it => +it.id === +item.id)) this.editCmdbItemMapList.push(item)
      // let nodeInfo = this.$refs.cascader[index].getCheckedNodes()
      // console.log('nodeInfo: ', nodeInfo)
    },
    changeCmdbItemMap(data, index) {
      const item = this.cmdbItemMapList[index]
      if (item['id'] && !this.editCmdbItemMapList.find(it => +it.id === +item.id)) this.editCmdbItemMapList.push(item)
      // console.log('data: ', data)
      // if (id) {
      //   const idx = this.editCmdbItemMapList.findIndex(item => Number(item.id) === Number(id))
      //   console.log('idx: ', idx)
      //   if (idx === -1) {
      //     this.$set(this.editCmdbItemMapList, this.editCmdbItemMapList.length, data)
      //   }
      // }
    },
    getEmitFileList(val) {
      console.log(val)
      this.$set(this.form, 'imageUrl', val.emitType === 'addFile' ? val.map[0].original : '')
    }
  }
}
</script>

<style lang="scss" scoped>
.task-script-box {
  border-radius: 4px;
  border: 1px solid #DCDFE6;

  .task-script-item {
    display: flex;
    align-content: center;
    .item-col {
      padding: 10px;
    }
    .item-index {
      width: 10%;
    }
    .item-action {
      width: 20%;
      text-align: center;
    }
  }
}
</style>
