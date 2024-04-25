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
import { ref } from 'vue'
import { applyPureReactInVue } from 'veaury'
import Core from '../core/index.tsx'

const RendererCore = applyPureReactInVue(Core)

const { props, config, json, comDefs } = defineProps(['props', 'config', 'json', 'comDefs'])

const currentRef = ref()

// onMounted((props) => {
//   console.log(props)
//   setTimeout(() => {
//     console.log(currentRef.value.__veauryReactRef__)
//   }, 0);
// })
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