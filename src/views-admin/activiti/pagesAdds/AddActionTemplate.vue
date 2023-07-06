<template>
  <div class=" actionTemplate">
    <div class="flex-h-center page-nav" @click="$router.back()">
      <i class="el-icon-back header-icon  pointer" />
      <div class="font-16 header-title">{{ title }}</div>
    </div>
    <div class="content">
      <el-form ref="form" :model="rulesForm" label-width="120px" :rules="rules">
        <el-form-item label="名称:" prop="hyActionName" style="width: 60%">
          <el-input v-model="rulesForm.hyActionName" placeholder="动作名称" />
        </el-form-item>
        <el-form-item label="动作类型:" prop="hyActionType" style="width: 60%">
          <el-select v-model="rulesForm.hyActionType" placeholder="请选择" style="width:100%" @change="actionCocietyTypeParent='',rulesForm.hyActionClassId=''">
            <el-option
              v-for="item in actionTypeList"
              :key="item.hyActionClassId"
              :label="item.hyActionClassName"
              :value="item.hyActionClassId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="对应类型:" prop="hyActionClassId" style="width: 60%">
          <div class="flex-v-between">
            <el-select :value="actionCocietyTypeParent" placeholder="请选择" style="width:48%" :rules="[{required:true,message:'请选择',trigger:'change'}]" @change="changeaAtionCocietyTypeParent">
              <el-option
                v-for="item in actionCocietyTypeParentList"
                :key="item.hyActionClassId"
                :label="item.hyActionClassName"
                :value="item.hyActionClassId"
              />
            </el-select>
            <el-select v-show="![1,2].includes(rulesForm.hyActionType)" :value="rulesForm.hyActionClassId" placeholder="请选择" style="width:48%" :rules="[{required:true,message:'请选择',trigger:'change'}]" @change="changehyActionClassId">
              <el-option
                v-for="item in actionCocietyTypeChildList"
                :key="item.hyActionClassId"
                :label="item.hyActionClassName"
                :value="item.hyActionClassId"
              />
            </el-select>
          </div>
        </el-form-item>
        <el-form-item v-show="(rulesForm.hyActionType === 3 && current.type==='DO')" label="动作:" style="width: 60%">
          <el-radio-group v-model="rulesForm.hyAct">
            <el-radio :label="0">关闭</el-radio>
            <el-radio :label="1">开启</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-show="(rulesForm.hyActionType === 3 && current.type==='AO')" label="动作:" style="width: 60%">
          <el-input v-model="rulesForm.setVal" placeholder="请输入" />
        </el-form-item>
        <!--        <el-form-item label="备注:" prop="remark" style="width: 60%">-->
        <!--          <el-input v-model="rulesForm.remark" placeholder="请输入" type="textarea" />-->
        <!--        </el-form-item>-->
        <el-form-item label="备注:" prop="remark" style="width: 60%">
          <el-input v-model="rulesForm.remark" placeholder="请输入" type="textarea" />
        </el-form-item>
        <el-form-item label="状态:" prop="hyStatus" style="width: 60%">
          <el-switch :value="!!rulesForm.hyStatus" active-color="#0145ab" inactive-color="#f5f5f5" @change="changeStatus" />
        </el-form-item>
        <el-form-item>
          <el-button v-permission="['submit']" :loading="loading" type="primary" @click="handleSubmit">保存</el-button>
        </el-form-item>
      </el-form>
    </div>

  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  data() {
    return {
      rulesForm: {
        hyStatus: 1,
        hyAct: 1,
        hyActionType: 0
      },
      rules: {
        hyActionName: [{ required: true, message: '请填写', trigger: 'blur' }]
      },
      actionClassList: [],
      actionTypeList: [], // 动作类型
      actionCocietyTypeParent: '',
      inputValue: '',
      inputValue2: '',
      current: {},
      loading: false
    }
  },
  computed: {
    title() {
      return this.$route.meta.title
    },
    hyAid() {
      return this.$route.query.hyAid
    },
    actionCocietyTypeParentList() {
      return this.actionClassList.filter(it => it['pid'] === this.rulesForm['hyActionType'])
    },
    actionCocietyTypeChildList() {
      return this.actionClassList.filter(it => it['pid'] === this.actionCocietyTypeParent)
    }
  },
  watch: {
    'rulesForm.hyActionType': function(n) {
      this.rulesForm.hyActionTable = n === 3 || n === 9 ? 'hyit_device' : n === 1 ? 'hyit_book' : n === 2 ? 'video_chn' : ''
    }
  },
  async created() {
    await this.findLinkageActionClass()
    if (this.hyAid) {
      await this.getLinkageActionTemplate()
    }
  },
  methods: {
    changehyActionClassId(id) {
      this.rulesForm.hyActionClassId = id
      this.current = this.actionClassList.find(it => it['hyActionClassId'] === id)
      this.$forceUpdate()
    },
    changeaAtionCocietyTypeParent(id) {
      this.actionCocietyTypeParent = id
      this.rulesForm.hyActionClassId = ''
    },
    changeStatus(e) {
      this.rulesForm.hyStatus = !!e
    },
    async findLinkageActionClass() {
      let { data, code } = await request({
        url: api.linkageManage.findLinkageActionClass
      })
      if (code !== 1) return
      this.actionTypeList = data.filter(it => it['pid'] === null)
      this.rulesForm.hyActionType = this.actionTypeList[1]['hyActionClassId']
      this.actionClassList = data
    },
    async getLinkageActionTemplate() {
      let { model, code } = await request({
        url: api.linkageManage.getLinkageActionTemplate,
        data: { hyAid: this.hyAid }
      })
      if (code !== 1) return
      const hyActionClassId = model.hyActionClassId
      const idx = this.actionClassList.find(it => it['hyActionClassId'] === model['hyActionClassId'])
      this.actionCocietyTypeParent = idx['pid']
      this.current = this.actionClassList.find(it => it['hyActionClassId'] === idx['hyActionClassId'])
      delete model.hyCtime
      this.rulesForm = model
      if ([1, 2].includes(model.hyActionType)) this.actionCocietyTypeParent = hyActionClassId
    },
    handleSubmit() {
      this.$refs['form'].validate(async(val) => {
        if (!val) return
        this.loading = true
        this.rulesForm.userId = this.localStorageOperation('get', 'userInfo').userId
        this.loading = false
        if (this.rulesForm.hyActionType === 2 || this.rulesForm.hyActionType === 1) {
          this.rulesForm.hyActionClassId = this.actionCocietyTypeParent
        }

        let classify
        if (this.rulesForm.hyActionType === 1) {
          classify = this.actionClassList.find(it => it.hyActionClassId === this.actionCocietyTypeParent)
        }
        if (!this.rulesForm.hyActionClassId) return this.$message.error('请选择对应类型')
        let { code } = await request({
          url: api.linkageManage[this.hyAid ? 'updateLinkageActionTemplate' : 'insertLinkageActionTemplate'],
          data: {...this.rulesForm, classify: classify && classify.type}
        })
        if (code === 1) {
          this.$message.success(this.hyAid ? '修改成功' : '添加成功')
          this.$router.back()
          return
        }
        this.$message.error(this.hyAid ? '修改失败' : '添加失败')
      })
    }
  }
}
</script>

<style scoped lang="scss">
 .actionTemplate{
.header{
  height: 40px;
  background-color: #fff;
  .header-icon{
    font-size: 20px;
  }
  .header-title{
    color: #999;
  }
}
.content{
  padding: 20px 20px 100px 20px;
  margin: 30px 20px 20px;
  background-color: #fff;
}
}

</style>
