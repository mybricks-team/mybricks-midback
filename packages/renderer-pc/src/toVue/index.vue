<template>
  <renderer-core
    ref="currentRef"
    :json="json"
    :props="props"
    :config="config"
    :comDefs="comDefs"
  />
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { applyPureReactInVue } from 'veaury'
import Core from '../core/index'

const RendererCore = applyPureReactInVue(Core)

const { props, config, json, comDefs } = defineProps(['props', 'config', 'json', 'comDefs'])

const currentRef = ref(null)

const emit = defineEmits(['_my-on-mounted'])

onMounted(() => {
  emit('_my-on-mounted')
})

defineExpose({
  currentRef
})
</script>