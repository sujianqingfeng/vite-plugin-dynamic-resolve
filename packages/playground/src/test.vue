<script setup lang="ts">
defineProps({
  color: {
    type: String,
    default: 'red',
  },
})
</script>

<template>
<svg class="icon" style="{color}">###</svg>
</template>

<style>
   .icon {
       width: 1em; height: 1em;
       vertical-align: -0.15em;
       fill: currentColor;
       overflow: hidden;
    }

</style>