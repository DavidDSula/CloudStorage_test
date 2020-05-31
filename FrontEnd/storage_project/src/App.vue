<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>

import Home from './views/Home.vue';

export default {
    components: {
        'Home': Home
    },

}

</script>

<style lang="scss">
@import './sass/app';

</style>
