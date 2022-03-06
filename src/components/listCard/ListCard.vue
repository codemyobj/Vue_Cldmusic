<template>
  <div
    class="listCard"
    v-infinite-scroll="load"
    :infinite-scroll-disabled="disabled"
    :infinite-scroll-distance="300"
    :infinite-scroll-immediate="false"
    ref="listCard"
  >
    <div
      class="listCardItem"
      v-for="(item, index) in listCardData"
      :key="index"
      @click="clickListCardItem(item.id)"
    >
      <div class="image">
        <img :src="(item.picUrl || item.coverImgUrl) + '?param=400y400'" />
        <div class="title">{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  name: "ListCard",
  props: {
    listCardData: {
      type: Array,
      default: () => []
    },
    isLoad: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      // 无限滚动是否可用
      disabled: false
    }
  },
  methods: {
    // 上拉触发
    load() {
      this.$emit("bottomLoad")
      this.disabled = true
    },

    clickListCardItem(id) {
      this.$emit("clickListCardItem", id)
    }
  },
  watch: {
    // 数据更新后再次运行触发load事件
    listCardData() {
      if (this.isLoad) {
        this.listCardData.length > 0
          ? (this.disabled = false)
          : (this.disabled = true)
      }
    }
  }
}
</script>
<style scoped>
.listCard {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 10px 0;
}
.listCardItem {
  width: 18%;
  margin-bottom: 20px;
  overflow: hidden;
  cursor: pointer;
}
.image img {
  width: 100%;
  border-radius: 10px;
}
.title {
  margin-top: 8px;
  padding: 0 2px;
  font-size: 12px;
  color: #000;
}
</style>
