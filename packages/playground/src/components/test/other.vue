<script setup lang="ts">
defineProps<{ msg: string }>()
</script>

<template>
  <p>组件测试</p>
  <h1>{{ msg }} is other</h1>
</template>
