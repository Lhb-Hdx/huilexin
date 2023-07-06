<template>
  <div>
    <div class="page-nav">
      <i class="el-icon-back" @click="$router.back()" />
      <span>{{ navTitle }}</span>
    </div>
    <div class="app-container">
      <el-card>
        <el-form ref="form" :model="form" :rules="rules" label-width="90px" :inline="false">
          <el-row :gutter="40">
            <el-col :span="8" :offset="0">
              <el-form-item label="区域" prop="hyOrgId	">
                <el-select v-model="form.hyOrgId" value-key="" placeholder="请选择区域" filterable>
                  <el-option
                    v-for="item in area"
                    :key="item.hyAreaId"
                    :label="item.hyAreaName"
                    :value="item.hyAreaId"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="房号" prop="hyRoomNo" size="normal">
                <el-input v-model="form.hyRoomNo" placeholder="请输入房号" size="normal" />
              </el-form-item>
              <el-form-item label="联系人 " prop="hyContract" size="normal">
                <el-input v-model="form.hyContract" placeholder="请输入联系人 " size="normal" />
              </el-form-item>
              <el-form-item label="联系电话" prop="hyTel" size="normal">
                <el-input v-model="form.hyTel" placeholder="请输入联系电话" size="normal" />
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="0">
              <el-form-item label="所在楼层" prop="hyFloor" size="normal">
                <el-input-number v-model="form.hyFloor" :min="1" :step="1" />
              </el-form-item>
              <el-form-item label="人员数量" prop="hyOwnerNum" size="normal">
                <el-input-number v-model="form.hyOwnerNum" :min="0" :step="1" />
              </el-form-item>
              <el-form-item label="IC卡数量" prop="hyCardNum" size="normal">
                <el-input-number v-model="form.hyCardNum" :min="0" :step="1" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item size="normal">
            <el-button v-premission="['submit']" type="primary" size="default" @click="onSubmit">确定</el-button>
            <el-button size="default" @click="$refs.form.resetFields()">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { isMobile } from '@/utils/validate'
export default {
  name: 'Houseaddupdate',
  components: { },
  data() {
    var checkPhone = function(rule, val, callback) {
      if (!val) return callback(new Error('请输入联系电话'))
      if (!isMobile(val)) return callback(new Error('联系电话格式不正确'))
      callback()
    }
    return {
      form: {
        hyState: 0,
        hyRoomFee: 0,
        hyCardNum: 0,
        hyOwnerNum: 0,
        hyParkingSpaceNum: 0,
        hyCarNum: 0,
        hyFloor: 0
      },
      rules: {
        hyContract: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
        hyTel: [{ validator: checkPhone, required: true, trigger: 'blur' }],
        hyRoomNo: [{ required: true, message: '请输入房号', trigger: 'blur' }]
      },
      area: []
    }
  },
  computed: {
    navTitle() {
      return this.$route.meta.title
    },
    id() {
      return this.$route.query.id
    }
  },
  created() {
    this.findHyitArea()
    if (this.id || this.id === 0) {
      this.getEsRoom()
    }
  },
  mounted() {
  },
  methods: {
    onSubmit() {
      this.$refs.form.validate(async(val) => {
        console.log(val)
        if (!val) return
        let { code } = await request({ url: this.id ? api.powerEnv.updateEsRoom : api.powerEnv.insertEsRoom, data: this.form })
        if (code !== 1) return
        this.$message.success('修改成功')
        this.$router.back()
      })
    },
    async getEsRoom() {
      let { code, model } = await request({ url: api.powerEnv.getEsRoom, data: { hyRoomId: this.id }})
      if (code !== 1) return
      this.form = model
    },
    async findHyitArea() {
      let { code, data } = await request({ url: api.area.findHyitArea, data: { limit: -1, isDh: 1 }})
      if (code !== 1) return
      this.area = data
    }
  }
}
</script>

<style lang="scss" scoped>
.face-img{
  width: 300px;
  height: 225px;
  border: 1px solid #999;
}
.face-box{
  position: relative;
  .prompt{
    position: absolute;
    width: 100%;
    top: 35%;
    text-align: center;
  }
  input[type=file]{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
  }
}
.canvas{
  position: absolute;
  border: none;
  opacity: 0;
   width: 300px;
  height: 225px;
}
</style>
