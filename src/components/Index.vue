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
  </el-container>
</template>

<script>
import axios from "axios";

import HeaderBar from "./headerBar/HeaderBar.vue";
import AsideMenu from "./asideMenu/AsideMenu.vue";

export default {
  components: {
    HeaderBar,
    AsideMenu,
  },
  name: "Index",
  props: {},
  data() {
    return {
      downloadMusicInfo: {
        name: "",
        url: "",
      },
    };
  },
  created() {},
  methods: {},
};
</script>
<style scoped>
.el-header {
  background-color: #ec4141;
  height: 50px !important;
  padding: 0;
  margin: 0;
  z-index: 100;
}
</style>
