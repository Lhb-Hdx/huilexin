<template>
  <div>
    <div class="page-nav">
      <el-page-header :content="navTitle" @back="$router.go(-1)" />
    </div>
    <div class="app-container">
      <CustomVFormDesign :form-id="id" />
    </div>
  </div>
</template>

<script>
import CustomVFormDesign from '@/components/CustomForm/CustomVFormDesign/CustomVFormDesign'

export default {
  name: 'CustomFormDesign',
  components: {
    CustomVFormDesign
  },
  data() {
    return {}
  },
  computed: {
    id() { return this.$route.query.id },
    navTitle() { return this.$route.meta.title }
  },
  methods: {}
}
</script>
