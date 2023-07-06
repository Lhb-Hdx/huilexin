<template>
  <ScriptLibraryFormComponent :build-result="false" :analysis-result="true" />
</template>

<script>
import ScriptLibraryFormComponent from '@/components/AutomationOperationsComponent/ScriptLibraryForm.vue'

export default {
  name: 'ScriptLibraryForm',
  components: {
    ScriptLibraryFormComponent
  }
}
</script>
