<template>
  <div class="full-main">
    <div class="full-left">
      <div class="full-left-header">
        <div class="full-left-header-title">设备列表</div>
      </div>
      <MenuList @change="change" />
    </div>
    <div class="full-right">
      <div class="full-right-box">
        <div style="height:100%">
          <div class="flex" style="height:100%">
            <el-card :body-style="{height:'100%',overflow:'hidden'}" class="box-card" shadow="never">
              <div class="grid-content bg-purple  " style="height:100%">
                <el-select
                  v-model="hyOrgId"
                  :change="orgChange"
                  placeholder="所在监控区域"
                  style="margin: 5px 0"
                  @change="orgChange"
                >
                  <el-option
                    v-for="item in areaArr"
                    :key="item.hyAreaId"
                    :label="item.hyAreaName"
                    :value="item.hyAreaId"
                  />
                </el-select>
                <ul class="data_list">
                  <li
                    v-for="(item, index) in list"
                    :key="index"
                    :class="{'active':index===currIndex}"
                    class="flex-h-center"
                    @click="handleCurrentChange(item,index)"
                  >

                    <el-tooltip :content="'地址:'+$tool.matchData(areaArr,item,'hyOrgid','hyAreaName','hyAreaId')" effect="dark" placement="top-start">
                      <div class="flex-h-center mr-20"><span class="num font-16">{{ index + 1 }}</span></div>
                      <div>
                        <p class="font-16" style="margin: 5px 0;">{{ item.hyAlias || '' }}({{ item.hyAddr }})</p>
                        <template v-if="item.hyAddr!==-1">
                          <span v-if="item.hyState" class="state font-14" style="color:rgb(0, 178, 133)">在线</span>
                          <span v-if="!item.hyState" class="state font-14" style="color:#F56C6C">离线</span>
                        </template>
                        <template v-else>
                          <span v-if="item.hyState" class="state font-14" style="color:rgb(0, 178, 133)">在线</span>
                          <span v-if="!item.hyState" class="state font-14" style="color:#F56C6C">离线</span>
                        </template>
                      </div>
                    </el-tooltip>
                  </li>
                </ul>
                <el-empty v-if="!list.length" style="height:calc(100% - 46px)" />
              </div>
            </el-card>

            <div class="ml-10 right" style="flex:1">
              <components is="RotatingRight" :id="id" :show-config="true" />
            </div>
          </div>

        </div>
        <!--        <div shadow="always" :body-style="{ padding: '20px' }">-->
        <!--          <components is="Entrance" />-->
        <!--        </div>-->
      </div>

    </div>

  </div>
</template>

<script>
import MenuList from './components/menuList'
import request from '@/utils/request'
import api from '@/api/api'
// import Entrance from './entrance'
import RotatingRight from './rotaing-right'

export default {
  name: 'Rotaing',
  components: {
    MenuList,
    // Entrance,
    RotatingRight
  },
  data() {
    return {
      areaArr: [],
      hyOrgId: null,
      list: [],
      id: '',
      currIndex: 0,
      curr: 0,
      DevTypeValue: '',
      devicevalueList: [],
      query: {
        limit: 20,
        page: 1
      }
    }
  },
  computed: {
    key() {
      return this.$route.query.key
    }
  },
  mounted() {
    this.getAreaArr()
    // this.findHyitDevicevalue()

    // 监听触底加载
    this.watchPage()
  },
  beforedestroy: function() {
    // 卸载触底加载事件
    document.querySelector('.grid-content').onscroll = null
  },
  methods: {
    async findHyitValueType(hyType) {
      let { code, data } = await request({
        url: api.powerEnv.findHyitValueType,
        data: { limit: -1, ids: hyType }
      })
      if (code !== 1) return
      return data
    },
    orgChange(val) {
      this.list = []
      this.$set(this.query, 'page', 1)
      this.hyOrgId = val
      this.findHyitDevice()
    },
    watchPage() {
      const _this = this
      const scrollBox = document.querySelector('.data_list')
      const boxClient = scrollBox.clientHeight
      scrollBox.onscroll = function(e) {
        const scrollTop = e.target.scrollTop
        if (boxClient + scrollTop >= scrollBox.scrollHeight) {
          console.log('触底')
          _this.$set(_this.query, 'page', ++_this.query.page)
          _this.findHyitDevice()
        }
      }
    },
    async getAreaArr() {
      let { code, data } = await request({ url: api.area.findHyitArea, data: {isDh: 1} })
      if (code !== 1) return
      this.areaArr = data
    },
    change(id, curr) {
      this.list = []
      this.$set(this.query, 'page', 1)
      this.hyOrgId = ''
      this.DevTypeValue = id
      this.curr = 0
      this.currIndex = 0
      this.findHyitDevice()
    },
    async findHyitDevice() {
      let { code, data } = await request({
        url: api.powerEnv.findHyitDevice,
        data: { hyDevTypeValue: this.DevTypeValue, hyOrgId: this.hyOrgId, ...this.query }
      })
      if (code !== 1) return
      for (const item of data) {
        if (item.hyAddr === -1) continue
        let devicevalueList = await this.findHyitDevicevalue(item.hyDeviceId)
        const devicevalue = devicevalueList.find(it => it.hyType === 62)
        if (!devicevalue) {
          item.state = 0
          break
        }
        const hyTypes = devicevalueList.map(it => it.hyType)
        let valueTypeList = await this.findHyitValueType(hyTypes)
        const valueType = valueTypeList.find(it => it.hyTypeId === 62)
        item.state = +devicevalue[this.$tool.humpStr(valueType['hyFieldName'])]
      }

      this.list.push(...data)
      this.$nextTick(() => {
        this.id = this.list[0]?.hyDeviceId || ''
      })
    },
    async findHyitDevicevalue(hyDeviceId) {
      let { code, data } = await request({
        url: api.powerEnv.findHyitDeviceValue,
        data: { limit: -1, hyDeviceId }
      })
      if (code === 1) return data
      // this.devicevalueList = data
    },
    handleCurrentChange(item, index) {
      this.currIndex = index
      this.id = item.hyDeviceId
    }
  }
}
</script>
<style lang="scss" scoped>
.active {
  background-color: #ecf8f2;
}

.grid-content {
  width: 370px;
  flex-basis: 370px;
  overflow:hidden;
  overflow-y: scroll;
  &::scrollbar{
  display:none;
   }
   &::-webkit-scrollbar{
  display:none;
    }
}

.el-card__header {
  padding: 5px 15px;
  border-bottom: 1px solid #e6ebf5;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  /* background-color: #f5f5f7; */
}

.el-input--medium .el-input__inner {
  height: 30px;
  line-height: 30px;
}

.el-input__suffix {
  position: absolute;
  height: 100%;
  right: 5px;
  top: 2px;
  text-align: center;
  color: #C0C4CC;
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
  pointer-events: none;
}

.main {
  padding: 10px 10px 0 10px;
  height: 100%;
}

.row {
  height: 100%;
}

/* .right{
   overflow: hidden !important;
overflow-y: scroll !important;
} */
</style>
<style lang="scss" scoped>
.full-main {
  height: 100%;
  /*// border: 1px solid red;*/
  position: relative;
  overflow: hidden;

  .full-left {
    background: rgb(233, 236, 243);
    position: absolute;
    left: 0;
    height: 100%;
    width: 240px;
    // overflow: hidden;
    // overflow-y: scroll;
    .full-left-header {
      height: 40px;
      line-height: 40px;
      display: flex;
      justify-content: space-between;
    }

    .full-left-header-title {
      font-weight: bold;
      padding-left: 20px;
      font-size: 14px;
    }

    .el-scrollbar {
      height: calc(100% - 40px);
    }

    .full-main-scrollbar-wrapper {
      overflow-x: hidden !important;
    }
  }

  .full-right {
    padding: 10px;
    height: 100%;
    margin-left: 240px;

    .full-right-box {
      height: 100%;
      background-color: #fff;

      .right {
        height: 100%;
        overflow: hidden;
      }
    }
  }
}

.data_list {
  padding-left: 0px !important;
  height: calc(100% - 36px);
  overflow: hidden;
  overflow-y:scroll;
  padding-bottom: 20px;
}

.data_list li {
  padding: 10px;
  position: relative;
  list-style: none;
  cursor: pointer;
}
.num {
  /* position: absolute;
  top: 15px; */
  font-size: 16px;
  color: #999;
}
.el-card ::v-deep .el-card__body {
	padding: 10px;
}
</style>
