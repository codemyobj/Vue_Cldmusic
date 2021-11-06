<template>
  <el-container>
    <el-header>
      <HeaderBar />
    </el-header>
  </el-container>
</template>

<script>
import axios from "axios";

import HeaderBar from "./headerBar/HeaderBar.vue";

export default {
  components: {
    HeaderBar,
  },
  name: "Index",
  props: {},
  data() {
    return {};
  },
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
