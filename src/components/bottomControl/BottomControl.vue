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
        <img :src="musicDetail.al.picUrl" alt="" v-if="musicDetail.al" />
        <img src="~/assets/img/test.jpg" alt="" v-else />
      </div>
      <div class="musicInfo">
        <div class="musicName" v-if="musicDetail && musicDetail.name">
          {{ musicDetail.name }}
        </div>
        <div class="singer" v-if="musicDetail && musicDetail.name">
          {{ musicDetail.ar[0].name }}
        </div>
        <div class="downloadContainer" v-if="musicDetail.name">
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
import { handleMusicTime, returnSecond } from "@/utils/index"
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
      musicDetail: {},
      musicUrl: "",
      currentMusicIndex: 0,
      musicList: [],
      // 用户是否喜欢当前歌曲
      isUserLikeCurrentMusic: false,
      // 喜欢的音乐列表
      likeMusicList: [],
      // 当前播放的时间位置
      currentTime: 0,
      // 音乐总时长
      duration: "00:00",
      // 进度条的位置
      timeProgress: 0,
      // 抽屉是否被打开过 如果没打开 里面不会渲染
      hasDrawerOpend: false
    }
  },
  watch: {
    // 监听vuex中musicId的变化
    "$store.state.musicId"(id) {
      // 先暂停当前播放的音乐
      this.pauseMusic()
      this.musicList = this.$store.state.musicList
      this.getMusicDetailFromMusicList()
      this.getMusicDetail(id)
      durationNum = returnSecond(this.duration)
      // 判断用户是否喜欢当前音乐
      this.getIsUserLikeCurrentMusic()
    }
    // 监听currentIndex的变化
    // "$store.state.currentIndex"(currentIndex, lastIndex) {
    // if (this.hasDrawerOpend) {
    //   this.handleDrawerListDom(currentIndex, lastIndex)
    // }
    // }
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

    async getLikeMusicList() {
      // 获取时间戳
      var timestamp = Date.parse(new Date())
      // 因为喜欢音乐列表实时性较高，为了避免接口缓存，在请求后面加上一个时间戳
      let res = await this.$request("/likelist", {
        uid: JSON.parse(window.localStorage.getItem("userInfo")).userId,
        timestamp
      })
      this.likeMusicList = res.data.ids
      // 将喜欢列表提交到vuex 供歌单中显示喜欢使用
      this.$store.commit("updateLikeMusicList", this.likeMusicList)
    },

    // 根据id找到musicList中对应的musicDetail
    getMusicDetailFromMusicList() {
      this.musicList.forEach((item, index) => {
        if (item.id === this.$store.state.musicId) {
          // 记录当前音乐的index
          this.currentMusicIndex = index
          // 将索引传到vuex
          this.$store.commit("updateCurrentIndex", index)
          this.musicDetail = item
          // 直接从audio标签中的duration属性拿时长会有请求时差问题，所以直接在musicInfo中拿
          this.duration = this.musicList[index].dt
        }
      })
    },

    // 判断用户是否喜欢当前音乐
    getIsUserLikeCurrentMusic() {
      this.isUserLikeCurrentMusic = this.likeMusicList.find(
        item => item === this.$store.state.musicId
      )
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
  },
  created() {
    // 判断是否登录
    if (window.localStorage.getItem("userInfo")) {
      this.getLikeMusicList()
    }
  }
}
</script>
<style scoped lang="less">
.bottomControl {
  border-top: 1px solid #ddd;
  width: 100%;
  height: 55px;
  position: fixed;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  z-index: 10000;
  background-color: #fff;
}
.left {
  display: flex;
  align-items: center;
  width: 125px;

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 5px;
    overflow: hidden;
    margin-right: 10px;
    cursor: pointer;
    img {
      width: 100%;
    }
  }

  .musicInfo {
    color: rgb(37, 37, 37);
    font-size: 12px;
    width: 70%;
    .musicName {
      margin-bottom: 4px;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .singer {
      transform: scale(0.9);
      margin-left: -3px;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
.like {
  color: #ec4141;
}
</style>
