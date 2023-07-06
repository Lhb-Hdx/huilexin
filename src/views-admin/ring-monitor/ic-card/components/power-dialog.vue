<template>
  <el-dialog v-if="showSubumitGuardRole" :visible.sync="showSubumitGuardRole" title="门卡权限控制" top="5vh" width="50%">
    <div class="equipment_table">
      <el-table :data="guardRole" border fit highlight-current-row style="width: 100%" @close="showSubumitGuardRole = false">
        <el-table-column label="门禁控制器" prop="hyAlias" />
        <el-table-column label="门">
          <template v-slot="{ row, $index }">
            <el-checkbox v-for="items of row.attrList" :key="items.hyVid + $index" :checked="Boolean(items.permission)" :label="items.hyDes" @change="changeGuardRoleCheck($event, items)" />
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="showSubumitGuardRole = false">关闭</el-button>
      <el-button class="filter-item" type="primary" @click="onSubmit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
export default {
  name: 'PowerDialog',
  // props: {
  //   form: {
  //     type: Object,
  //     default: () => ({})
  //   }
  // },
  data() {
    return {
      showSubumitGuardRole: false,
      guardRole: [], // 权限数据
      // form: {}
      // sbAgentList: []
      addList: [], // 添加权限列表
      delList: [] // 删除权限列表
    }
  },
  methods: {
    async open(row) {
      this.showSubumitGuardRole = true
      this.form = row
      await this.getAllCradController()
      // this.findEsCardSystemAgent(this.form.cardId)
    },
    // 提交权限
    async onSubmit() {
      const sbAgentList = await this.findEsCardSystemAgent(this.form.cardId)
      const addIds = this.addList.map((item) => `${item.hyDeviceId}-${item.hyVid}-${item.hyZitemid}`).join(',')
      const delIds = this.delList.map((item) => `${item.hyDeviceId}-${item.hyVid}-${item.hyZitemid}`).join(',')

      if (addIds.length > 0) {
        for (const it of sbAgentList) {
          await this.addDHUser(it.sbId, it.agentId)
          await this.addDHUserCard(it.sbId, it.agentId)
          await this.addDHUserPower(it.sbId, it.agentId, addIds)
        }
      }
      if (delIds.length > 0) {
        for (const it of sbAgentList) {
          await this.deleteDHUser(it.sbId, it.agentId)
          await this.deleteDHUserCard(it.sbId, it.agentId)
          await this.deleteDHUserPower(it.sbId, it.agentId, delIds)
        }
      }
      this.$message.success('修改成功')
      this.showSubumitGuardRole = false
    },
    async changeGuardRoleCheck(bool, item) {
      if (bool) {
        if (!item.permission) this.addList.push(item)
      } else {
        if (item.permission) this.delList.push(item)
      }
    },
    async addDHUser(sbId, agentId) {
      let { data, code } = await request({
        url: api.powerEnv.addDHUser,
        data: {
          ownerId: this.form.owner.ownerId,
          sbId,
          agentId,
          peUserId: this.form.owner.peUserId,
          ownerName: this.form.owner.ownerName
        }
      })
      if (code === 1) return data
    },
    async deleteDHUser(sbId, agentId) {
      let { data, code } = await request({
        url: api.powerEnv.deleteDHUser,
        data: {
          sbId,
          agentId,
          peUserId: this.form.owner.peUserId
        }
      })
      if (code === 1) return data
    },
    async addDHUserCard(sbId, agentId) {
      let { data, code } = await request({
        url: api.powerEnv.addDHUserCard,
        data: {
          sbId,
          agentId,
          peUserId: this.form.owner.peUserId,
          cardNo: this.form.cardNo
        }
      })
      if (code === 1) return data
    },
    async deleteDHUserCard(sbId, agentId) {
      let { data, code } = await request({
        url: api.powerEnv.deleteDHUserCard,
        data: {
          sbId,
          agentId,
          peUserId: this.form.owner.peUserId,
          cardNo: this.form.cardNo
        }
      })
      if (code === 1) return data
    },
    async addDHUserPower(sbId, agentId, ids) {
      let { data, code } = await request({
        url: api.powerEnv.addDHUserPower,
        data: {
          sbId,
          agentId,
          peUserId: this.form.owner.peUserId,
          ids
        }
      })
      if (code === 1) return data
    },
    async deleteDHUserPower(sbId, agentId, ids) {
      let { data, code } = await request({
        url: api.powerEnv.deleteDHUserPower,
        data: {
          sbId,
          agentId,
          peUserId: this.form.owner.peUserId,
          ids,
          peCardIds: this.form.cardId
        }
      })
      if (code === 1) return data
    },
    // 查询关联子系统网关
    async findEsCardSystemAgent(cardId) {
      const { data, code } = await request({
        url: api.powerEnv.findEsCardSystemAgent,
        data: { cardId }
      })
      if (code === 1) return data
    },
    async deleteDHUserFaceSerialNum(ownerId, sbId, agentId) {
      let { data, code } = await request({ url: api.powerEnv.deleteDHUserFaceSerialNum, data: { ownerId, sbId, agentId } })
      if (code === 1) return data
    },
    // 获取数据
    async getAllCradController(peUserId) {
      const {
        code,
        data,
        map: { attrList, powerList } // 门列表
      } = await request({
        url: api.powerEnv.getAllCradController,
        data: {
          peUserId: this.form.owner.peUserId
        }
      })
      if (code !== 1) return
      for (let i of data) {
        // 设置门列表
        i.attrList = attrList.filter((it) => it.hyDeviceId === i.hyDeviceId)
        // 设置门权限
        for (const attr of i.attrList) {
          attr.permission = powerList.some((it) => it.peId === attr.hyVid)
        }
      }
      this.guardRole = data
    }
  }
}
</script>

<style></style>
