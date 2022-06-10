export const template = `
<script setup>
defineProps({
  color: {
    type: String,
    default: 'red',
  },
})
</script>

<template>
###
</template>

<style scoped>
   .icon {
       width: 1em; height: 1em;
       vertical-align: -0.15em;
       fill: currentColor;
       overflow: hidden;
    }

</style>
`
