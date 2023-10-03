<script setup>
  import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
  @tailwind base;
  @layer base {
    img {
      @apply inline-block;
    }
  }
  @tailwind components;
  @tailwind utilities;
  @tailwind variants;
</style>
