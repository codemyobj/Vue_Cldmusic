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
      <div
        class="bottom"
        v-loading="isCommentLoading"
        element-loading-background="rgba(255, 255, 255, 0.1)"
      >
        <Comment
          class="commentComponent"
          v-if="currentCommentPage === 1"
          :comments="hotComments"
          :commentType="'music'"
          :commentId="$store.state.musicId + ''"
          :musicTitle="musicInfo.name"
          @getComment="getMusicComment($store.state.musicId)"
        >
          <div slot="title">热门评论</div>
        </Comment>
        <Comment
          class="commentComponent"
          :comments="comment.comments"
          :commentType="'music'"
          :commentId="$store.state.musicId + ''"
          :musicTitle="musicInfo.name"
          @getComment="getMusicComment($store.state.musicId)"
        >
          <div slot="title">最新评论{{ comment.total }}</div>
        </Comment>
        <!-- 评论分页 -->
        <div class="page" v-show="comment.comments && comment.comments[0]">
          <el-pagination
            background
            small
            layout="prev,pager,next"
            :total="comment.total"
            :page-size="20"
            :current-page="currentCommentPage"
            @current-change="commentPageChange"
          />
        </div>
      </div>
      <GoTop scrollObj=".musicDetailCardContainer" />
    </div>
    <div v-else class="tip">暂无播放音乐</div>
  </div>
</template>

<script>
import LyricsScroll from "@/components/lyricsScroll/LyricsScroll.vue"
import Comment from "@/components/comment/Comment.vue"
import GoTop from "@/components/goTop/GoTop.vue"

// 定时器名称
let timer

export default {
  components: {
    LyricsScroll,
    Comment,
    GoTop
  },
  name: "MusicDetailCard",
  props: {},
  data() {
    return {
      // 是否显示歌曲详情卡片
      isMusicDetailCardShow: false,
      // 背景显示模式 true为白色渐变 false为毛玻璃背景
      backgroundMode: true,
      // 是否删除卡片渲染的内容
      cleanCard: false,
      // 当前歌曲信息
      musicInfo: {},
      // 歌词
      lyric: [[0, "正在加载歌词"]],
      // 是否加载评论
      isCommentLoading: false,
      // 当前评论页数
      currentCommentPage: 1,
      // 评论信息
      comment: {},
      // 热门评论
      hotComments: []
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
      // 重置评论页数
      this.currentCommentPage = 1
      // 更新当前歌曲信息
      this.musicInfo = this.$store.state.musicList[
        this.$store.state.currentIndex
      ]
      // 优化性能，仅在卡片展示时才发送请求
      if (this.isMusicDetailCardShow) {
        this.getLyric(musicId)
        this.getMusicComment(musicId)
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
    async getMusicComment(id, type) {
      // 获取时间戳
      var timestamp = Date.parse(new Date())
      this.isCommentLoading = true
      if (type === "changePage") {
        let musicDetailCardContainer = document.querySelector(
          ".musicDetailCardContainer"
        )
        let top = document.querySelector(".top")
        musicDetailCardContainer.scrollTo({
          behavior: "smooth",
          top: top.clientHeight
        })
      }

      // 当页数为第一页时,请求10条热门数据
      if (this.currentCommentPage === 1) {
        let res = await this.$request("/comment/hot", {
          id,
          limit: 10,
          type: 0,
          timestamp
        })
        if (res.data.code !== 200) {
          this.$message.error("获取热门评论失败,请稍后重试!")
          return
        }
        this.hotComments = res.data.hotComments
      }
      let res = await this.$request("/comment/music", {
        id,
        offset: (this.currentCommentPage - 1) * 20,
        timestamp
      })
      if (res.data.code !== 200) {
        this.$message.error("获取评论失败,请稍后重试")
      }
      this.isCommentLoading = false
      this.comment = res.data
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
    },

    // 页码改变
    commentPageChange(page) {
      this.currentCommentPage = page
      this.getMusicComment(this.$store.state.musicId, "changePage")
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

    .commentComponent /deep/ * {
      color: rgb(37, 37, 37);
      border-color: rgb(143, 143, 143);

      .replied {
        border-radius: 5px;
        background-color: rgba(0, 0, 0, 0.1);
      }
    }
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

.bottom {
  margin: 40px auto;
  width: 55vw;
}

.bottom /deep/ .el-loading-spinner {
  top: 40px;
}

.tip {
  font-size: 20px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
