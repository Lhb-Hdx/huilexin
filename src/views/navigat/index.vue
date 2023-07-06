<template>
  <div class="app">
    <div class="head" />
    <div class="container-box">
      <div class="app-container">
        <div v-for="(item,index) in itAgentList" :key="index" :class="internetBgColor === item.id ? 'aap-boxs' : 'aap-box'">
          <div class="mask pointer" @mouseover="internetOver(item.id)" @mouseleave="internetLeave()" @click="handleNavigat(item)" />
          <div class="img" :style="[internetBgColor === item.id ? {backgroundColor:item.color} : {backgroundColor:'#FFFFFF'} ]">
            <div class="img-box" :style=" {backgroundColor:'#FDBE3A'}">
              <img :src="item.imgUrl" alt="">
            </div>
          </div>
          <div class="word">
            <div class="word-box">
              <div class="word-title">{{ item.name }}</div>
              <div class="word-val">{{ item.backup }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>
<script>
import request from '@/utils/request'
import api from '@/api/api'
export default {
  data() {
    return {
      internetBgColor: '',
      listQuery: {
        page: 1,
        limit: -1
      },
      agentList: {
        page: 1,
        limit: -1
      },
      itAgentList: [],
      host: '',
      gateway: [],
      handleRouterName: ''
    }
  },
  created() {
    this.host = window.location.host // 获取当前域名
  },
  async mounted() {
    this.findHyitAgent()
    const dynamicsRoutes = await this.$store.dispatch('permission/getRoutes')
    const dynamicsRoutesIdx = dynamicsRoutes.findIndex(item => item.children && item.children.length > 0)
    if (dynamicsRoutesIdx !== -1) this.handleRouterName = dynamicsRoutes[dynamicsRoutesIdx].children[0].name
  },
  methods: {
    // 网关分组信息
    findHyitAgent() {
      request({
        url: api.itAgentGroup.findHyitAgentGroup,
        data: { page: this.listQuery.page, limit: this.listQuery.limit, keyword: this.listQuery.keyword }
      }).then(async res => {
        if (res.code === 1) {
          res.data.forEach(item => {
            item.imgUrl = `http://${this.host}${item.imgUrl}`
          })
          let gateway = await this.findAgent()
          // 所有网关id赋值给对应的分组
          res.data.forEach(dataItem => {
            let agent = ''
            gateway.forEach(agentItem => {
              if (Number(dataItem.id) === Number(agentItem.groupId)) {
                agent += agentItem.agentId + ','
              }
            })
            if (agent.length > 0) {
              agent = agent.substring(0, agent.length - 1)
              dataItem.agentId = agent
            }
          })
          this.itAgentList = res.data
        }
      })
    },
    // 获取网关id
    async findAgent(val) {
      let res = await request({
        url: api.itAgentGroup.findHyitAgentGroupLink,
        data: {
          page: this.agentList.page,
          limit: this.agentList.limit,
          groupId: val
        }
      })
      if (res.code === 1) {
        return res.data
      }
    },
    // 点击图片跳转
    async handleNavigat(val) {
      this.sessionStorageOperation('set', 'agentId', val.agentId ? val.agentId : '')
      this.sessionStorageOperation('set', 'agentGroupId', val.id)
      this.sessionStorageOperation('set', 'agentProject', val.name)
      if (this.handleRouterName !== '') this.$router.push({ name: this.handleRouterName })
    },
    // 网吧云
    internetOver(id) {
      this.internetBgColor = id
    },
    internetLeave() {
      this.internetBgColor = 0
    }
  }
}
</script>

<style lang="scss" scoped>
.head{
    width: 100%;
    height: 64px;
}
.container-box {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 80px;
}
.app-container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    width: 80%;
    justify-content: center;

    .aap-boxs {
        position: relative;
        background-color: #fff;
        margin: 0 20px 40px;
        align-items: center;
        width: 380px;
        height: 380px;
        box-shadow: 0px 1px 40px 0px rgba(0, 0, 0, 0.15);
        flex-grow: 1;
    }
    .aap-box {
        position: relative;
        background-color: #fff;
        margin: 0 20px 40px;
        align-items: center;
        width: 380px;
        height: 380px;
        flex-grow: 1;
        }
        .mask {
        position: absolute;
        width: 100%;
        height: 100%;
        }
        .img {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 60%;
            transition: all .5s;
            .img-box {
                border-radius: 54px;
                width: 108px;
                height: 108px;
                overflow:hidden;
                img {
                    width: 100%;
                    height: 100%;
                }
            }
        }
        .word{
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 40%;
            .word-box {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                width: 90%;
                .word-title {
                    font-size: 20px;
                    font-family: Microsoft YaHei;
                    font-weight: bold;
                    color: #333333;
                }
                .word-val {
                    display: -webkit-box;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    word-wrap: break-word;
                    white-space: normal !important;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    width: 100%;
                    text-align: center;
                    margin-top: 10px;
                    font-size: 18px;
                    font-family: Microsoft YaHei;
                    font-weight: 400;
                    color: #999999;
                    line-height: 30px;
                }
            }
        }

}
</style>
