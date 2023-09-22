<template>
  <div class="navbar sticky top-0 z-50 bg-base-200">
    <div class="navbar-start">
      <button @click="home" class="btn btn-ghost btn-circle"><img src="../assets/Echo_Transparent.png" /></button>
    </div>
    <div class="navbar-center">
      <p class="font-bold text-xl">Echo</p>
    </div>
    <div class="navbar-end">
      <button class="btn btn-ghost btn-circle">+</button>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Navbar',
    methods: {
      home() {
        this.$router.push('/')
      },
    },
  }
</script>

<style></style>
