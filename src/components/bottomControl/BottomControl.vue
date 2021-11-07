<template>
  <div class="bottomControl">
    <audio
      :src="musicUrl"
      ref="audioPlayer"
      autoplay
      @play="changeState(true)"
      @pause="changeState(false)"
      @ended="changeMusic('next')"
      @timeupdate="timeupdate"
    />
    <!-- 左边  -->
    <div class="left">
      <div class="avatar">
        <img src="~/assets/img/test.jpg" alt="" />
      </div>
      <div class="musicInfo">
        <div class="musicName"></div>
        <div class="singer"></div>
        <div class="downloadContainer">
          <i class="iconfont icon-download"></i>
        </div>
      </div>
    </div>
    <!-- 中间 -->
    <div class="center">
      <div class="buttons">
        <span><i class="iconfont icon-xunhuan"/></span>
        <span><i class="iconfont icon-shangyishou"/></span>
        <span>
          <i class="iconfont icon-icon_play" v-if="!this.$store.state.isPlay" />
          <i class="iconfont icon-zantingtingzhi" v-else />
        </span>
        <span>
          <i class="iconfont icon-xiayishou" />
        </span>
        <span>
          <i
            class="iconfont icon-xihuan"
            :class="isUserLikeCurrentMusic ? 'like' : ''"
          />
        </span>
      </div>
    </div>
    <!-- 进度条 -->
  </div>
</template>

<script>
let lastSecond = 0
// 总时长的秒数
let durationNum = 0
// 当前音乐类型，用于下载
let musicType = ""
export default {
  components: {},
  name: "BottomControl",
  props: {},
  data() {
    return {
      musicUrl: "",
      currentMusicIndex: 0,
      musicList: [],
      // 用户是否喜欢当前歌曲
      isUserLikeCurrentMusic: false,
      // 当前播放的时间位置
      currentTime: 0
    }
  },
  watch: {
    // 监听vuex中musicId的变化
    "$store.state.musicId"(id) {
      // 先暂停当前播放的音乐
      this.pauseMusic()
      this.musicList = this.$store.state.musicList
      this.getMusicDetail(id)
    }
  },
  methods: {
    // 请求
    // 请求歌曲的url
    async getMusicDetail(id) {
      this.$store.commit("updateMusicLoadState", true)
      let result = await this.$request("/song/url", { id })
      if (result.data.data[0].url === null) {
        this.$message.error("该歌曲暂无版权，将为您播放下一首歌曲")
        this.changeMusic("next")
        return
      }
      this.musicUrl = result.data.data[0].url
      musicType = result.data.data[0].type.toLowerCase()
      this.$store.commit("updateMusicLoadState", false)
    },
    // 切换播放状态
    changeState(state) {
      this.$store.commit("updatePlayState", state)
    },

    // 切换音乐
    changeMusic(type, id) {
      let currentMusicIndex
      switch (type) {
        case "click":
          // 点击抽屉row进行切歌
          this.$store.commit("updateMusicId", id)
          break
        case "pre":
          currentMusicIndex = this.currentMusicIndex
          let preIndex =
            currentMusicIndex - 1 < 0
              ? this.musicList.length - 1
              : currentMusicIndex - 1
          this.$store.commit("updateMusicId", this.musicList[preIndex].id)
          break
        case "next":
          currentMusicIndex = this.currentMusicIndex
          let nextIndex =
            currentMusicIndex + 1 === this.musicList.length
              ? 0
              : currentMusicIndex + 1
          this.$store.commit("updateMusicId", this.musicList[nextIndex].id)
        default:
          break
      }
    },

    // 当前播放时间位置
    timeupdate() {
      // 节流
      let time = this.$refs.audioPlayer.currentTime
      // 将当前播放时间保存到vuex 如果保存到vuex这步节流，会导致歌词不精准,误差最大有1s
      this.$store.commit("updateCurrentTime", time)

      time = Math.floor(time)
      if (time !== lastSecond) {
        lastSecond = time
        this.currentTime = time
        // 计算进度条的位置
        this.timeProgress = Math.floor((time / durationNum) * 100)
      }
    },
    // 暂停歌曲
    pauseMusic() {
      this.$refs.audioPlayer.pause()
    }
  }
}
</script>
<style scoped>
.like {
  color: #ec4141;
}
</style>
