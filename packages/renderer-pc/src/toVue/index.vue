<template>
  <renderer-core
    ref="currentRef"
    :json="json"
    :props="props"
    :config="config"
    :comDefs="comDefs"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { applyPureReactInVue } from 'veaury'
import Core from '../core/index.tsx'

const RendererCore = applyPureReactInVue(Core)

const { props, config, json, comDefs } = defineProps(['props', 'config', 'json', 'comDefs'])

const currentRef = ref()

const emit = defineEmits(['_my-on-mounted'])

onMounted(() => {
  emit('_my-on-mounted')
})

defineExpose({
  currentRef
})


// const onClick = (currentRef) => {
//   console.log(currentRef.__veauryReactRef__)
// }



// export default {
//   props: ['props', 'config', 'json', 'comDefs'],
//   components: {
//     Renderer: applyPureReactInVue(RendererComponent)
//   },
//   setup(props) {
//     const currentRef = ref()

//     const onClick = (currentRef) => {
//       console.log(currentRef.__veauryReactRef__)
//     }
//     onMounted(() => {
//       console.log(currentRef, currentRef.__veauryReactRef__)
//     })
//     return {
//       currentRef,
//       onClick
//     }
//   }
// }

</script>