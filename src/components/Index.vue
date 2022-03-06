<template>
  <el-container>
    <!-- nav头部 -->
    <el-header>
      <HeaderBar />
    </el-header>
    <!-- 侧边栏 -->
    <el-container>
      <AsideMenu />
      <!-- 主体内容 -->
      <el-main>
        <!-- 给router-view添加key有可能对性能有一定的损耗，
        但是可以解决push同一个地址不同参数时不会重新渲染router-view的问题 -->
        <router-view class="routerView" :key="$route.fullPath" />
        <!-- 用于下载的a标签 -->
        <a
          :href="downloadMusicInfo.url"
          :download="downloadMusicInfo.name"
          target="_blank"
          id="downloadCurrentMusic"
        />
      </el-main>
    </el-container>
    <!-- 底部控制栏 -->
    <BottomControl />
    <MusicDetailCard class="musicDetailCard" />
  </el-container>
</template>

<script>
import axios from "axios"

import HeaderBar from "./headerBar/HeaderBar.vue"
import AsideMenu from "./asideMenu/AsideMenu.vue"
import BottomControl from "./bottomControl/BottomControl.vue"
import MusicDetailCard from "@/views/musicDetailCard/MusicDetailCard.vue"

export default {
  components: {
    HeaderBar,
    AsideMenu,
    BottomControl,
    MusicDetailCard
  },
  name: "Index",
  props: {},
  data() {
    return {
      downloadMusicInfo: {
        name: "",
        url: ""
      }
    }
  },
  watch: {
    // 监听当前下载音乐信息
    "$store.state.downloadMusicInfo"(current) {
      axios
        .get(current.url, { responseType: "blob" })
        .then(res => {
          let blob = res.data
          let url = URL.createObjectURL(blob)
          let a = document.querySelector("#downloadCurrentMusic")
          this.downloadMusicInfo.url = url
          this.downloadMusicInfo.name = current.name
          this.$nextTick(() => {
            a.click()
            // 释放url对象
            URL.revokeObjectURL(url)
          })
        })
        .catch(err => {
          this.$message.error("下载失败，请稍后重试！")
        })
    }
  },
  methods: {}
}
</script>
<style scoped>
.el-header {
  background-color: #ec4141;
  height: 50px !important;
  padding: 0;
  margin: 0;
  z-index: 100;
}

.routerView {
  padding: 0 15px;
  margin: 0;
  width: 100%;
  overflow-y: hidden;
  height: calc(100vh - 105px);
}

.el-main {
  padding: 0;
  /* height: calc(100vh - 105px); */
  overflow-y: hidden;
}
</style>
