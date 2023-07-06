<template>
  <div class="config-content-right-component">
    <div class="right-config-group">
      <div class="config-group-title">
        {{ form.cabinetId ? '编辑机柜信息' : '新增机柜' }}
        <i
          :class="isMenuDown === true ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
          @click="clickMenuDown"
        />
      </div>
      <div v-show="isMenuDown" class="config-group-content p-10">
        <el-form ref="form" :model="form" inline>
          <el-form-item label="名称" prop="name" :rules="[{required:true,trigger:'blur',message:'请输入'}]">
            <input v-model.lazy="form.name" type="text" class="input">
          </el-form-item>
          <el-form-item label="容量(U位)">
            <el-input-number v-model="form.capacity" type="text" />
          </el-form-item>
          <el-form-item label="重量(kg)">
            <el-input-number v-model="form.weight" type="text" />
          </el-form-item>
          <el-form-item label="额定供电（kw）">
            <el-input-number v-model="form.ratedPower" type="text" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model.lazy="form.des" type="textarea" />
          </el-form-item>
          <div class="flex-v-end">
            <el-button :loading="loading" type="primary" @click="submit">保存</el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'ModuleConfig',
  props: {
    currentCabinet: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      isMenuDown: true,
      form: {},
      loading: false
    }
  },
  watch: {
    currentCabinet: {
      deep: true,
      immediate: true,
      handler(n) {
        // console.log(n)
        if (n.type === 'clear') return (this.form = {})
        if (n.type === 'edit') {
          return this.getDiagramCabinet(n.hostId)
        }
        // this.$set(this.form, 'name', n.name)
        // this.$set(this.form, 'capacity', n.capacity)
        // this.$set(this.form, 'weight', n.weight)
        // this.$set(this.form, 'ratedPower', n.ratedPower)
        // this.$set(this.form, 'des', n.des)
        // this.$set(this.form, 'diagramId', n.diagramId)
        // this.$set(this.form, 'cabinetId', n.cabinetId)
      }
    }
  },
  methods: {
    clickMenuDown() {
      this.isMenuDown = !this.isMenuDown
    },
    async getDiagramCabinet(cabinetId) {
      let { model, code } = await request({ url: api.diagram.getDiagramCabinet, data: { cabinetId }})
      if (code === 1) this.form = model
    },
    submit() {
      this.$refs.form.validate(async(val) => {
        if (!val) return
        this.loading = true
        let data = { ...this.form, diagramId: this.$route.query.id }
        let {
          code,
          msg
        } = await request({
          url: data.cabinetId ? api.diagram.updateDiagramCabinet : api.diagram.insertDiagramCabinet,
          data
        })
        this.loading = false
        this.$message({
          message: msg,
          type: code === 1 ? 'success' : 'error'
        })
        this.$emit('updateCabinet')
      })
    }
  }
}
</script>

<style scoped>

</style>
