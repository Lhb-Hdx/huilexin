<template>
  <div class="Knowledge-item">
    <div v-for="(element,index) in itemData" :key="index" :title="element.hyKnowName" class="content-item">
      <div class="listBox">
        <div class="left-img">
          <img v-if="element.hyTitleImageUrl" :src="knowledgePointsCoverUrl(element.hyTitleImageUrl)" class="knowledgePointsImg" alt="">

        </div>
        <div class="knowledgePointsMain">
          <div class="list_title" @click="itemClick(element)">{{ element.hyKnowName }}</div>
          <div class="Subframe">
            <div class="list_type">类别：
              <div v-for="(element1,index_type) in knowledgeTypes" :key="index_type" class="list_type_text">
                <div v-if="element.hyKtId == element1.catId">
                  {{ element1.catName }}
                </div>
              </div>
            </div>
            <div class="list_time">发表时间：{{ element.hyCtime }}</div><br>
          </div>
          <div class="list_p" v-html="element.knowRemark" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'KnowledgeItem',
  props: {
    itemData: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      knowledgeTypes: []
    }
  },
  computed: {
    // 设置知识点封面图
    knowledgePointsCoverUrl() {
      return function(imgUrl) {
        return imgUrl
      }
    }
  },
  mounted() {
    this.findSysCat()
  },
  methods: {
    findSysCat() {
      request({
        url: api.sys.findSysCat,
        data: { systemName: 'kbms', classify: 'kbms_know_type', pid: 10, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.knowledgeTypes = res.data
        }
      })
    },
    itemClick(element) { // 详情跳转
      const id = element.hyKnowId
      this.$emit('getHyKonwId', id)
      // this.$router.push({ name: 'KnowledgeDetail', params: { id }})
    }
  }
}
</script>

<style lang="scss" scoped>
.content{
  border-radius: 15px;
  width: 99%;
  .content-item {
    margin-bottom: 15px;
    .listBox{
      padding: 20px;
      background:#ffffff;
      width: 100%;
      overflow: hidden;
      border-bottom: 1px solid #f7f7f7;
      display: flex;
      align-items: flex-start;
      .knowledgePointsImg {
        width: 200px;
        height: 100px;
        -o-object-fit: cover;
        object-fit: cover;
        padding-right: 20px;
      }

      .list_p {
        img {
          display: none;
        }
      }

      .list_title{
        font-size: 20px;
        margin: 0 0 15px 0;
        cursor: pointer;
        font-weight: 500;
        &:hover {
          color: #4370f5;
        }
      }
      .Subframe{
        margin: 0 0 10px;
        .list_type,.list_time{font-size: 14px;color: #999999;padding: 0 20px;float: left;}
        .list_type{
          padding-left: 0;
          .list_type_text{float: right;}
        }
      }
      .list_p{
        font-size: 14px;
        color: rgba(0,0,0,.6);
        text-align: justify;
        overflow: hidden;
        line-height:24px;//行距、行高
        text-overflow:ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }
    }
    .divider{width: 99%;height: 2px;  border-top: 2px solid #ddd;  text-align: center;}
    .more{width: 100%;text-align: center;padding: 20px ;
      p{font-size:18px;margin-top: -10px;}
    }
  }
}

.el-tree-node.is-current > .el-tree-node__content {
  background: #f0f4ff;
  color: #3c77fe;
  font-weight: bold;
}

</style>

