<template>
  <div>
    <el-form label-width="80px">
      <el-row :gutter="12">
        <el-col :xs="24" :sm="24" :md="24" :lg="4" :xl="4">
          <el-form-item label="网关">
            <el-select
              v-model="agent"
              filterable
              placeholder="网关"
              class="w-100"
            >
              <el-option
                v-for="agentItem in agentList"
                :key="agentItem.id"
                :label="agentItem.name"
                :value="agentItem.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-for="item in formProps" :key="item.field" :xs="24" :sm="24" :md="24" :lg="4" :xl="4">
          <el-form-item :label="item.field" prop="ip">
            <el-input v-model="item.model" :placeholder="item.placeholder" />
          </el-form-item>
        </el-col>
        <el-col v-if="formName === 'snmp'" :xs="24" :sm="24" :md="24" :lg="4" :xl="4">
          <el-form-item label="snmp版本">
            <el-select
              v-model="version"
              filterable
              placeholder="snmp版本"
              class="w-100"
            >
              <el-option
                v-for="snmpItem in snmpVersion"
                :key="snmpItem.id"
                :label="snmpItem.name"
                :value="snmpItem.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="24" :md="24" :lg="4" :xl="4">
          <el-button class="filter-item" type="primary" @click="runDiagnostic">检测</el-button>
        </el-col>
      </el-row>
      <el-row v-if="formName === 'snmp'" :gutter="12">
        <el-col :xs="24" :sm="24" :md="24" :lg="8" :xl="8">
          <el-form-item label="oid" prop="oid">
            <el-input v-model="oid" placeholder="请输入oid" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'DiagnosticToolsForm',
  props: {
    formProps: {
      type: Array,
      default() {
        return []
      }
    },
    formName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      agentList: [],
      snmpVersion: [
        {id: 1, name: 'v1' },
        {id: 2, name: 'v2' }
      ],
      form: { agent: '' },
      rules: {
        agent: [
          { required: true, message: '请选择网关', trigger: 'blur' }
        ],
        version: [
          { required: true, message: '请选择snmp版本', trigger: 'blur' }
        ],
        oid: [
          { required: true, message: '请选择oid', trigger: 'blur' }
        ]
      },
      agent: '',
      version: 1,
      oid: ''
    }
  },
  mounted() {
    this.findHyitAgent()
  },
  methods: {
    // 获取网关
    findHyitAgent() {
      request({
        url: api.itMonitor.findHyitAgent,
        data: { agentType: 1, agentGroupId: this.sessionStorageOperation('get', 'agentGroupId') }
      }).then(res => {
        if (res.code === 1) {
          this.agentList = res.data
          this.agent = res.data[0].id
        }
      })
    },
    runDiagnostic() {
      for (let i = 0; i < this.formProps.length; i++) {
        if (this.formProps[i].model === '') {
          return this.$message({
            type: 'error',
            message: this.formProps[i].placeholder
          })
        }
        if (this.formName === 'snmp' && this.oid === '') {
          return this.$message({
            type: 'error',
            message: '请输入oid'
          })
        }
      }
      if (this.formName === 'snmp') {
        this.$emit('runDiagnostic', {
          agent: this.agent, form: this.formProps, version: this.version, oid: this.oid
        })
      } else {
        this.$emit('runDiagnostic', {
          agent: this.agent, form: this.formProps
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
