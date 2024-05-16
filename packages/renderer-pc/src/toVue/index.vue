<template>
  <div ref="rootDom" v-html="reactHtml"></div>
  <renderer-core ref="currentRef" :json="json" :props="props" :config="config" :comDefs="comDefs" :className="className"
    :style="style" />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { applyPureReactInVue } from './veaury.umd.js'
import Core from '../core/index'
import { getHtml } from './wrapReact'


const { props, config, json, comDefs, className, style } = defineProps(['props', 'config', 'json', 'comDefs', 'className', 'style'])

const currentRef = ref(null)
const emit = defineEmits(['_my-on-mounted'])
const reactHtml = getHtml({ props, config, json, comDefs, className, style })
// 获取挂载点
const rootDom = ref(null)
const rendererCore = applyPureReactInVue(Core, {
  getRoot: () => {
    return rootDom.value
  },
  react: {
    componentWrap: '',
  }
})


onMounted(() => {
  emit('_my-on-mounted')
})

defineExpose({
  currentRef
})
</script>