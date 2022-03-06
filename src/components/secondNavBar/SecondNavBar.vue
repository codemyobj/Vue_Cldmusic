<template>
  <div class="navBar">
    <!-- 如果传入的宽度是0则不设置宽度，宽度自适应 -->
    <div
      class="barItem"
      :class="index === activeNum ? 'active' : ''"
      v-for="(item, index) in SecondNavBarData"
      :key="index"
      :style="itemWidth === 0 ? '' : 'width:' + itemWidth + 'px'"
      @click="clickSecondBarItem(index)"
    >
      {{ item.name }}
    </div>
  </div>
</template>
<script>
export default {
  name: "SecondNavBar",
  components: {},
  props: {
    SecondNavBarData: {
      type: Array,
      default: () => []
    },
    itemWidth: {
      type: Number,
      default: 40
    },
    currentTag: {
      type: Object,
      default: () => {}
    }
  },
  watch: {
    currentTag(current) {
      this.activeNum = this.SecondNavBarData.findIndex(
        item => item.name === current.name
      )
    }
  },
  data() {
    return {
      activeNum: 0
    }
  },
  methods: {
    clickSecondBarItem(index) {
      this.activeNum = index
      this.$emit("clickSecondBarItem", index)
    }
  }
}
</script>
<style scoped lang="less">
.navBar {
  display: flex;
  flex-wrap: wrap;
  .barItem {
    margin: 4px -2px;
    padding: 6px 10px;
    font-size: 12px;
    text-align: center;
    box-sizing: content-box;
    transform: scale(0.9, 0.9);
    cursor: pointer;
  }
}
.active {
  background-color: #fdf5f5;
  color: #ec4747;
  border-radius: 11px;
}
</style>
