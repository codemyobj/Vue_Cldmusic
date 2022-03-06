<template>
  <div class="go_top" v-show="isGoTopShow" @click="goTop">
    <i class="iconfont icon-fanhuidingbu" />
  </div>
</template>

<script>
let obj
export default {
  components: {},
  name: "GoTop",
  props: {
    // 滚动对象的选择器
    scrollObj: {
      type: String,
      default: () => ""
    }
  },
  data() {
    return {
      // 是否显示组件
      isGoTopShow: false
    }
  },
  methods: {
    goTop() {
      obj.scrollTo({
        behavior: "smooth",
        top: 0
      })
    }
  },
  mounted() {
    obj = document.querySelector(this.scrollObj)
    obj.onscroll = e => {
      if (obj.scrollTop >= 500 && !this.isGoTopShow) {
        this.isGoTopShow = true
      } else if (obj.scrollTop < 500 && this.isGoTopShow) {
        this.isGoTopShow = false
      }
    }
  }
}
</script>
<style scoped>
.go_top {
  position: fixed;
  background-color: #fafafa;
  bottom: 80px;
  right: 50px;
  border-radius: 50%;
  height: 35px;
  width: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 10px 1px rgba(0, 0, 0, 0.1);
  z-index: 10000;
  cursor: pointer;
}
.go_top:hover {
  background-color: #f5f5f5;
}
</style>
