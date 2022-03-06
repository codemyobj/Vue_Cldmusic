<template>
  <div class="discoverContainer">
    <NavBar @clickBarItem="clickBarItem" :navBarItem="navBarData" />
    <router-view class="discover" />
  </div>
</template>

<script>
import NavBar from "@/components/navBar/NavBar.vue"

export default {
  components: {
    NavBar
  },
  name: "Discover",
  props: {},
  data() {
    return {
      navBarData: [
        { name: "个性推荐", path: "/discover/recommend" },
        { name: "歌单", path: "/discover/musiclist" },
        { name: "排行榜", path: "/discover/ranking" },
        { name: "歌手", path: "/discover/singer" }
      ]
    }
  },
  methods: {
    clickBarItem(path) {
      this.$router.push(path)
    }
  }
}
</script>
<style scoped>
.discoverContainer {
  overflow: hidden;
  padding: 0 !important;
}
.discover {
  margin: auto;
  overflow-y: scroll;
  height: calc(100vh - 162px);
  padding: 0 15px;
}
</style>
