<template>
  <div>
    <ScriptTable ref="scriptTable">
      <el-table-column label="操作" width="300" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-permission="['Detail']" size="mini" type="primary" @click="onDetail(row)">查看</el-button>
          <el-button v-if="row.scriptStatue !== 1" v-permission="['Audit']" size="mini" type="primary" @click="onAudit(row)">审核</el-button>
          <el-button v-if="row.verifyStatue !== 1" v-permission="['Edit']" size="mini" type="primary" @click="onEdit(row)">编辑</el-button>
          <el-button v-if="row.scriptStatue === 0" v-permission="['Delete']" size="mini" type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </ScriptTable>
    <el-dialog title="审核" :visible.sync="showAudioDialog" width="40%" top="5vh">
      <div class="dialog-body">
        <el-form ref="form" :model="audioForm" :rules="audioFormRules" label-width="110px">
          <el-form-item label="审核状态" prop="verifyStatue">
            <el-select
              v-model="audioForm.verifyStatue"
              placeholder="请选择审核状态"
              style="width: 100%;"
            >
              <el-option
                v-for="item in verifyStatue"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAudioDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="handlerCompleteAudio">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ScriptTable from '@/components/AutomationOperationsComponent/ScriptTable'

export default {
  name: 'ScriptLibraryList',
  components: {
    ScriptTable
  },
  data() {
    return {
      showAudioDialog: false,
      audioForm: {
        id: '',
        verifyStatue: ''
      },
      audioFormRules: {
        verifyStatue: [
          { required: true, message: '请选择审核状态', trigger: 'blur' }
        ]
      },
      verifyStatue: [
        { value: 1, label: '已审核', type: 'success' },
        { value: 0, label: '未审核', type: 'danger' }
      ]
    }
  },
  methods: {
    // 打开审核
    onAudit(row) {
      this.showAudioDialog = true
      Object.keys(this.audioForm).forEach(key => {
        this.$set(this.audioForm, `${key}`, row[`${key}`])
      })
    },
    // 查看
    onDetail(row) {
      this.$router.push({
        name: 'ScriptDetail',
        query: {
          id: row.id,
          isDetail: true
        }
      })
    },
    // 编辑
    onEdit(row) {
      this.$router.push({
        name: 'ScriptUpdate',
        query: {
          id: row.id
        }
      })
    },
    // 删除
    onDelete(row) {
      this.$confirm('是否删除该脚本？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request({
          url: this.api.automationOperations.deleteHyitOpsScript,
          data: { id: row.id }
        })
          .then(async res => {
            if (res.code === 1) {
              this.$refs.scriptTable.findHyitOpsScript()
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            }
          })
      })
    },
    // 提交审核
    handlerCompleteAudio() {
      this.$confirm('确定审核该脚本？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request({
          url: this.api.automationOperations.updateHyitOpsScript,
          data: this.audioForm
        })
          .then(res => {
            if (res.code === 1) {
              this.showAudioDialog = false
              this.$refs.scriptTable.findHyitOpsScript()
              this.$message({
                type: 'success',
                message: '审核成功!'
              })
            }
          })
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
