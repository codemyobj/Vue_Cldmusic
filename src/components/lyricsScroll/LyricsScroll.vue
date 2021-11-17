<template>
  <div class="lyrics">
    <!-- 占位 -->
    <div class="placeholder" />
    <!-- 因为歌词快了一句 所以减1 -->
    <div
      class="lyricsItem"
      v-for="(item, index) in lyric"
      :key="index"
      :class="lyricsIndex - 1 === index ? 'currentLyric' : ''"
    >
      {{ item[1] }}
    </div>
    <!-- 占位 -->
    <div class="placeholder" />
  </div>
</template>

<script>
let placeholderHeight = 0
export default {
  name: "LyricsScroll",
  props: {
    lyric: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // 当前歌词索引
      lyricsIndex: 0
    }
  },
  watch: {
    // 监听当前播放时间
    "$store.state.currentTime"(currentTime, lastTime) {
      // 如果两个时间间隔有1s，则可得知进度条被拖动，需要重新校准歌词index
      // 当歌词数量大于1并且索引为0时，可能歌词位置差距较大 走这个if进行快速跳转
      if (
        (lastTime && Math.abs(currentTime - lastTime) >= 1) ||
        (this.lyricsIndex === 0 && this.lyric.length > 1)
      ) {
        // 处理播放时间跳转时歌词位置的校准
        if (this.lyric.length > 1) {
          this.getCurrentLyricsIndex(currentTime)
          // 滑动到当前歌词
          this.lyricScroll(this.lyricsIndex)
        }
      }
      // 根据实时播放事件实现歌词滚动
      if (this.lyricsIndex < this.lyric.length) {
        if (currentTime >= this.lyric[this.lyricsIndex][0]) {
          this.lyricsIndex += 1
          this.lyricScroll(this.lyricsIndex)
        }
      }
    },
    // 监听vuex中的musicId重置歌词索引
    "$store.state.musicId"(id) {
      this.lyricsIndex = 0
    },
    lyric(current) {
      console.log("获取了歌词")
      // 大于1s 说明歌词在1s后才请求成功 歌词可能不能马上跳转到当前时间 这里进行校准
      if (this.$store.state.currentTime > 1) {
        // 处理播放时间跳转时歌词位置的校准
        if (this.lyric.length > 1) {
          this.getCurrentLyricsIndex(this.$store.state.currentTime)
        }
      }
    }
  },
  methods: {
    // 获取当前歌词索引
    getCurrentLyricsIndex(currentTime) {
      let lyricsIndex = 0
      this.lyric.some(item => {
        if (lyricsIndex < this.lyric.length - 1) {
          if (currentTime > item[0]) {
            lyricsIndex += 1
          }
          return currentTime <= item[0]
        }
      })
      this.lyricsIndex = lyricsIndex
    },
    // 实现歌词滚动
    lyricScroll(currentLyric) {
      // 获取歌词item
      let lyricsArr = document.querySelectorAll(".lyricsItem")
      // 获取歌词框
      let lyrics = document.querySelector(".lyrics")
      // placeholder的高度
      if (placeholderHeight === 0) {
        placeholderHeight = lyricsArr[0].offsetTop - lyrics.offsetTop
      }
      //   歌词item在歌词框的高度 = 歌词框的offsetTop - 歌词item的offsetTop
      if (lyricsArr[currentLyric - 1]) {
        let distance = lyricsArr[currentLyric - 1].offsetTop - lyrics.offsetTop
        lyrics.scrollTo({
          behavior: "smooth",
          top: distance - placeholderHeight
        })
      }
    }
  }
}
</script>
<style scoped>
.lyrics {
  width: 100%;
  height: 275px;
  font-size: 12px;
  text-align: center;
  overflow-y: scroll;
}
.lyrics::-webkit-scrollbar {
  display: none;
}
.placeholder {
  font-weight: 600;
  font-size: 14px;
  color: #000;
}
.lyricsItem {
  font-size: 12px;
  height: 20px;
  color: #000;
}
.currentLyric {
  font-weight: 600;
  font-size: 14px;
  color: #000;
}
</style>
