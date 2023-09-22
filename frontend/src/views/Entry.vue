<template>
  <div>
    <Navbar />
    <div class="container mx-auto max-w-3xl">
      <v-select taggable push-tags :options="['Test']" class="text-primary-content rounded">Search or add an Artist</v-select>
      <VueDatePicker :enable-time-picker="false" :max-date="new Date()" dark />
    </div>
  </div>
</template>

<script>
  import Navbar from '../components/Navbar.vue'

  export default {
    components: {
      Navbar,
    },
  }
</script>

<style>
  .dp__theme_dark {
    --dp-background-color: #302f3d;
    --dp-text-color: #e9e5ff;
    --dp-hover-color: #e679c0;
    --dp-hover-text-color: #302f3d;
    --dp-hover-icon-color: #959595;
    --dp-primary-color: #e679c0;
    --dp-primary-text-color: #ffffff;
    --dp-secondary-color: #a9a9a9;
    --dp-border-color: #2d2d2d;
    --dp-menu-border-color: #2d2d2d;
    --dp-border-color-hover: #aaaeb7;
    --dp-disabled-color: #737373;
    --dp-scroll-bar-background: #212121;
    --dp-scroll-bar-color: #484848;
    --dp-success-color: #00701a;
    --dp-success-color-disabled: #428f59;
    --dp-icon-color: #959595;
    --dp-danger-color: #e53935;
    --dp-highlight-color: rgba(0, 92, 178, 0.2);
  }
</style>
