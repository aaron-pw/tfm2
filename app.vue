<template>
  <div id="app">
    <WaitList />
  </div>
</template>

<script>
import WaitList from './components/WaitList.vue'

export default {
  name: 'App',
  components: {
    WaitList
  }
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

#app {
  height: 100%;
  overflow: hidden;
}
</style>