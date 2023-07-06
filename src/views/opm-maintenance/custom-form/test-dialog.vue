<template>
  <el-dialog title="自定义表单输入测试" :visible.sync="showDialog" width="80%" top="5vh">
    <div class="dialog-body">
      <div class="select-form">
        <h3>切换表单：</h3>
        <el-select v-model="defineFormValue" placeholder="请选择表单" class="filter-item" style="width: 200px" @change="changeDefineForm">
          <el-option v-for="item in defineForm" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </div>
      <CustomVFormRender ref="customVFormRender" :form-id="defineFormValue" order-id="1111" />
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="showDialog = false">取 消</el-button>
      <el-button class="filter-item" type="primary" @click="confirmDialog">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import CustomVFormRender from '@/components/CustomForm/CustomVFormRender/CustomVFormRender'

export default {
  name: 'Test',
  components: {
    CustomVFormRender
  },
  data() {
    return {
      defineFormValue: '',
      defineForm: [],
      showDialog: false
    }
  },
  mounted() {
    this.findUserDefineForm()
  },
  methods: {
    // 打开弹窗
    open() {
      this.showDialog = true
    },
    // 获取出表单列表
    findUserDefineForm() {
      this.$request({ url: this.api.userDefineForm.findUserDefineForm, data: { limit: -1 } }).then(async res => {
        if (res.code === 1 && res.data && res.data.length > 0) {
          this.defineForm = res.data
          this.defineFormValue = res.data[0].id
        }
      })
    },
    // 切换选择表单
    changeDefineForm() {
      console.log(this.defineFormValue)
    },
    // 触发保存
    async confirmDialog() {
      // 调用渲染组件数据
      const saveVFormInputData = await this.$refs.customVFormRender.saveVFormInputData(1111)
      if (saveVFormInputData.code === 1) {
        this.showDialog = false
        this.$message.success(saveVFormInputData.msg)
      } else {
        this.$message.error(saveVFormInputData.msg)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.select-form {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>
