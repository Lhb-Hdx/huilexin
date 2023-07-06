<template>
  <ScriptLibraryFormComponent :build-result="false" />
</template>

<script>
import ScriptLibraryFormComponent from '@/components/AutomationOperationsComponent/ScriptLibraryForm'

export default {
  name: 'ScriptLibraryDetail',
  components: {
    ScriptLibraryFormComponent
  }
}
</script>
