<template>
  <div
    class="musicDetailCard"
    :class="[
      isMusicDetailCardShow ? '' : 'hide',
      backgroundMode ? '' : 'glassCard'
    ]"
  >
    <div class="closeCard" @click="closeCard">
      <i class="iconfont icon-arrow-down-bold" />
    </div>
    <div class="changeBackground" @click="changeBackground">
      <i class="iconfont icon-UniSetBackgroundTextStyle" />
    </div>
    <div class="musicDetailCardContainer" v-if="!cleanCard && musicInfo.name">
      <div class="top">
        <div class="left">
          <div class="discContainer">
            <div
              class="needle"
              :class="$store.state.isPlay ? 'needleRotate' : ''"
              ref="needle"
            >
              <img src="~/assets/img/MusicDetailCard/needle.png" alt="" />
            </div>
            <!-- 通过音乐的加载时差删除discAnimation类名再添加，达到重置动画的效果 -->
            <div
              ref="disc"
              class="disc"
              :class="[
                $store.state.isPlay ? '' : 'pause',
                $store.state.isMusicLoad ? '' : 'discAnimation'
              ]"
            >
              <img src="~/assets/img/MusicDetailCard/disc.png" alt="" />
              <img
                src="~/assets/img/test.jpg"
                alt=""
                class="musicAvatar"
                v-if="!musicInfo.al"
              />
              <img
                :src="musicInfo.al.picUrl"
                class="musicAvatar"
                alt=""
                v-else
              />
            </div>
          </div>
        </div>
        <div class="right">
          <div class="title">
            <div class="musicName">{{ musicInfo.name }}</div>
            <div class="album">{{ musicInfo.al.name }}</div>
            <div class="singer">
              {{ musicInfo.ar[0].name }}
            </div>
          </div>
          <LyricsScroll :lyric="lyric" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LyricsScroll from "@/components/lyricsScroll/LyricsScroll.vue"
// 定时器名称
let timer
export default {
  components: {
    LyricsScroll
  },
  name: "MusicDetailCard",
  props: {},
  data() {
    return {
      // 是否显示歌曲详情卡片
      isMusicDetailCardShow: true,
      // 背景显示模式 true为白色渐变 false为毛玻璃背景
      backgroundMode: false,
      // 是否删除卡片渲染的内容
      cleanCard: false,
      // 当前歌曲信息
      musicInfo: {},
      // 歌词
      lyric: [[0, "正在加载歌词"]],
      // 评论信息
      comment: {}
    }
  },
  watch: {
    "$store.state.isMusicDetailCardShow"(isMusicDetailCardShow) {
      this.isMusicDetailCardShow = isMusicDetailCardShow
      // 性能优化
      // 如果卡片没有展示就不发送请求和渲染里面的内容
      // 删除定时器 避免用户在关闭卡片的1s内又打开卡片 导致展示内容被删除
      clearTimeout(timer)
      this.cleanCard = false
      if (
        isMusicDetailCardShow &&
        !this.comment.comments &&
        this.$store.state.musicId !== ""
      ) {
        console.log("请求歌词和评论")
        this.getLyric(this.$store.state.musicId)
        this.getMusicComment(this.$store.state.musicId)
        // 当卡片关闭时 ，延迟3s再删除里面渲染的内容 提升体验
      } else if (!isMusicDetailCardShow) {
        timer = setTimeout(() => {
          this.cleanCard = true
        }, 3000)
      }
    },
    // '当vuex中的歌曲id发生变化的时候，需要重新获取评论和歌词'
    "$store.state.musicId"(musicId) {
      // 清空歌词
      this.lyric = [[0, "正在加载歌词"]]
      // 更新当前歌曲信息
      this.musicInfo = this.$store.state.musicList[
        this.$store.state.currentIndex
      ]
      // 优化性能，仅在卡片展示时才发送请求
      if (this.isMusicDetailCardShow) {
        this.getLyric(musicId)
      }
    }
  },
  methods: {
    // 请求
    // 请求并处理歌词
    async getLyric(id) {
      let res = await this.$request("/lyric", { id })
      let lyrics = res.data.lrc.lyric
      // 对获取到的歌词进行处理
      this.lyric = this.dealLyrics(lyrics)
    },
    // 请求评论
    getMusicComment(id, type) {
      // 获取时间戳
      var timestamp = Date.parse(new Date())
    },
    dealLyrics(lyrics) {
      let arr = lyrics.split("\n")
      let time = ""
      let value = ""
      let result = []
      // 去除空行
      arr = arr.filter(item => item !== "")
      arr.forEach(item => {
        time = item.split("]")[0]
        value = item.split("]")[1]
        // 去掉时间内的中括号
        var t = time.slice(1).split(":")
        result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]), value])
      })
      return result
    },

    // 关闭歌曲详情页
    closeCard() {
      this.$store.commit("changeMusicDetailCardState")
    },

    // 改变背景
    changeBackground() {
      this.backgroundMode = !this.backgroundMode
    }
  }
}
</script>
<style scoped lang="less">
.musicDetailCard {
  position: absolute;
  width: 100%;
  height: calc(100vh - 55px);
  top: 0;
  left: 0;
  z-index: 1000;
  transition: transform 0.5s;
  background-color: #fff;
  background-image: linear-gradient(to bottom, #e3e2e3, #fff);
  .closeCard .iconfont {
    position: absolute;
    top: 15px;
    left: 35px;
    font-size: 21px !important;
  }
  .changeBackground {
    position: absolute;
    bottom: 10px;
    right: 20px;
    cursor: pointer;
  }
  .musicDetailCardContainer {
    height: 100%;
    overflow-y: scroll;
  }
}
.hide {
  transform: translateY(calc(100vh - 55px));
}
.glassCard {
  backdrop-filter: blur(50px) brightness(95%) !important;
  background-color: unset !important;
  background-image: unset !important;
  * {
    color: rgb(37, 37, 37);
  }
}
.top {
  display: flex;
  justify-content: center;
  .left {
    width: 220px;
    margin: 0 30px 0 -40px;
    .discContainer {
      margin-top: 60px;
      width: 220px;
      position: relative;
      .needle {
        position: relative;
        left: 50%;
        width: 88px;
        height: 72px;
        z-index: 10000;
        transition: all 1s;
        transform-origin: 5.3px 5.3px;
        img {
          width: 100%;
        }
      }
      .needleRotate {
        transform-origin: 5.3px 5.3px;
        transform: rotate(22deg);
      }
      .disc {
        width: 220px;
        height: 220px;
        position: relative;
        top: -12px;
        img:nth-child(1) {
          width: 100%;
        }
        .musicAvatar {
          position: absolute;
          top: 35px;
          left: 35px;
          width: 150px;
          z-index: -1;
        }
      }
      .pause {
        animation-play-state: paused !important;
        -webkit-animation-play-state: paused !important;
      }
      // 碟子旋转动画
      .discAnimation {
        // infinite动画无限循环
        animation: disc 25s linear infinite;
        animation-delay: 0.8s;
      }

      @keyframes disc {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    }
  }
  .right {
    width: 350px;
    .title {
      width: 100%;
      text-align: center;
      font-size: 12px;
      margin: 30px 0 15px;
      div {
        margin: 7px 0;
      }
      .musicName {
        font-size: 23px;
        color: rgb(22, 22, 22);
      }
    }
  }
}
</style>
