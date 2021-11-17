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
      <div class="avatar" @click="$store.commit('changeMusicDetailCardState')">
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
          <i class="iconfont icon-download" @click="downloadCurrentMusic" />
        </div>
      </div>
    </div>
    <!-- 中间 -->
    <div class="center">
      <div class="buttons">
        <span><i class="iconfont icon-xunhuan"/></span>
        <span @click="musicList.length !== 0 ? changeMusic('pre') : ''">
          <i class="iconfont icon-shangyishou" />
        </span>
        <span @click="musicList.length !== 0 ? changePlayState() : ''">
          <i class="iconfont icon-icon_play" v-if="!this.$store.state.isPlay" />
          <i class="iconfont icon-zantingtingzhi" v-else />
        </span>
        <span @click="musicList.length !== 0 ? changeMusic('next') : ''">
          <i class="iconfont icon-xiayishou" />
        </span>
        <span>
          <i
            class="iconfont icon-xihuan"
            :class="isUserLikeCurrentMusic ? 'like' : ''"
            @click="musicList.length !== 0 ? likeIt() : ''"
          />
        </span>
      </div>
      <!-- 进度条 -->
      <div class="progressBar">
        <span class="currentTime">{{ currentTime | handleMusicTime }}</span>
        <!-- :value是单向的 要实现双向是 v-model -->
        <el-slider
          class="progressSlider"
          v-model="timeProgress"
          :show-tooltip="false"
          :disabled="musicList.length === 0"
          @change="changeProgress"
        />
        <span class="totolTime">{{ duration }}</span>
      </div>
    </div>
    <!-- 右边 -->
    <div class="right">
      <div class="volumeControl">
        <i class="iconfont icon-yinliang" @click="changeMutedState" />
        <el-slider
          class="volumeSlider"
          v-model="volume"
          @input="changeVolume"
          :show-tooltip="false"
        />
      </div>
      <div class="playList" @click="openDrawer">
        <i class="iconfont icon-bofangliebiao" />
      </div>
      <!-- 备案信息 -->
      <el-tooltip
        class="item"
        effect="drak"
        placement="left"
        :enterable="false"
      >
        <div v-html="recondInfo" slot="content" />
        <el-link
          type="info"
          href="https://beian.miit.gov.cn/"
          target="_blank"
          class="recondInfo"
          >粤ICP备2021068014号-2
        </el-link>
      </el-tooltip>
    </div>
    <!-- 抽屉 -->
    <el-drawer :visible.sync="drawer" :with-header="false" width="300">
      <div class="drawerHeader">总{{ musicList.length }}首</div>
      <el-table
        :data="musicList"
        :show-header="false"
        stripe
        style="width: 100%"
        highlight-current-row
        lazy
        @row-dblclick="clickRow"
      >
        <el-table-column prop="name" width="150px" />
        <el-table-column prop="ar[0].name" width="80px" />
        <el-table-column prop="dt" width="70px" />
      </el-table>
    </el-drawer>
  </div>
</template>

<script>
import { handleMusicTime, returnSecond } from "@/utils/index"
let lastSecond = 0
// 总时长的秒数
let durationNum = 0
// 当前音乐类型，用于下载
let musicType = ""
// 当前保存的音量
let volumeSave = 0

export default {
  name: "BottomControl",
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
      hasDrawerOpend: false,
      // 音量
      volume: 30,
      // 是否静音
      isMuted: false,
      // 是否打开播放列表
      drawer: false,
      recondInfo: `<div style='text-align:center;font-size:12px;'>
        粤ICP备2021068014号-2<br>本站为仿网易云音乐展示项目, 侵权必删!</div>`
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
    },
    // 监听currentIndex的变化
    "$store.state.currentIndex"(currentIndex, lastIndex) {
      if (this.hasDrawerOpend) {
        this.handleDrawerListDOM(currentIndex, lastIndex)
      }
    },
    // 监听播放状态
    "$store.state.isPlay"(isPlay) {
      if (isPlay) {
        this.playMusic()
      } else {
        this.pauseMusic()
      }
    }
  },

  filters: {
    handleMusicTime
  },
  methods: {
    // 请求
    // 获取请求歌曲的url
    async getMusicDetail(id) {
      this.$store.commit("updateMusicLoadState", true)
      let result = await this.$request("/song/url", { id })
      // 获取不到url
      if (result.data.data[0].url === null) {
        this.$message.error("该歌曲暂无版权，将为您播放下一首歌曲")
        this.changeMusic("next")
        return
      }
      this.musicUrl = result.data.data[0].url
      musicType = result.data.data[0].type.toLowerCase()
      this.$store.commit("updateMusicLoadState", false)
    },

    // 获取喜欢歌曲列表
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

    // 用户点了喜欢歌曲后的回调
    async likeIt() {
      if (!window.localStorage.getItem("userInfo")) {
        this.$message.error("请先登录")
        return
      }
      this.isUserLikeCurrentMusic = !this.isUserLikeCurrentMusic
      await this.likeMusic(
        this.$store.state.musicId,
        this.isUserLikeCurrentMusic
      )
      await this.getLikeMusicList()
    },

    // 喜欢该音乐 上传喜欢到数据库
    async likeMusic(id, like) {
      let res = await this.$request("/like", { id, like })
      if (res.data.code === 200) {
        this.$message.success("操作成功")
      } else {
        this.$message.error("操作失败")
      }
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

    // 点击播放键的回调
    changePlayState() {
      !this.$store.state.isPlay ? this.playMusic() : this.pauseMusic()
    },

    // 点击小喇叭的回调,决定是否静音
    changeMutedState() {
      if (this.isMuted) {
        this.volume = volumeSave
      } else {
        volumeSave = this.volume
        this.volume = 0
      }
      this.isMuted = !this.isMuted
    },

    // 播放音乐
    playMusic() {
      this.$refs.audioPlayer.play()
    },

    // 暂停歌曲
    pauseMusic() {
      this.$refs.audioPlayer.pause()
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

    // 双击抽屉列表中的row的回调
    clickRow(row) {
      this.changeMusic("click", row.id)
    },

    // 点击下载按钮的回调
    downloadCurrentMusic() {
      // 匹配资源的域名
      let url = this.musicUrl.match(/\http.*?\.net/)
      // 匹配域名名称，并匹配对应的代理
      let serve = url[0].match(/http:\/(\S*).music/)[1]
      let params = this.musicUrl.slice(url[0].length)
      if (
        serve !== "/m7" &&
        serve !== "/m701" &&
        serve !== "/m8" &&
        serve !== "/m801"
      ) {
        // 没有对应的代理
        this.$message.error("匹配不到对应的代理,下载失败!")
        return
      }
      // 截取后面的参数
      let downloadMusicInfo = {
        url: serve + params,
        name:
          this.musicDetail.name +
          " - " +
          this.musicDetail.ar[0].name +
          "." +
          musicType
      }
      this.$store.commit("updateDownloadMusicInfo", downloadMusicInfo)
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

    // 拖动进度条
    changeProgress(e) {
      this.currentTime = Math.floor((e / 100) * durationNum)
      // 改变audio的实际播放时间
      this.$refs.audioPlayer.currentTime = this.currentTime
    },

    // 拖动音量条
    changeVolume(e) {
      // 改变audio的音量
      // input事件是实时触发的 比change事件响应更灵敏
      this.$refs.audioPlayer.volume = e / 100
      if (this.isMuted && e > 0) {
        this.isMuted = false
      } else if (e === 0 && this.isMuted === false) {
        this.isMuted = true
      }
    },

    // 打开播放列表抽屉
    openDrawer() {
      this.drawer = !this.drawer
      this.hasDrawerOpend = true
      this.handleDrawerListDOM(this.currentMusicIndex)
    },

    // 直接操作原生DOM
    handleDrawerListDOM(currentIndex, lastIndex) {
      this.$nextTick(() => {
        let tableRows = document
          .querySelector(".bottomControl")
          .querySelectorAll(".el-table__row")
        // 直接修改dom样式的颜色无效  可能是因为第三方组件 style scoped的原因
        // 通过引入全局样式解决
        if (tableRows[currentIndex]) {
          tableRows[currentIndex].children.forEach((item, index) => {
            if (index < 2) {
              item.querySelector(".cell").classList.add("currentRow")
            }
          })
        }
        if (
          (lastIndex && lastIndex !== -1 && tableRows[lastIndex]) ||
          lastIndex === 0
        ) {
          // 将上一首的类名删掉
          tableRows[lastIndex].children.forEach((item, index) => {
            if (index < 2) {
              item.querySelector(".cell").classList.remove("currentRow")
            }
          })
        }
      })
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

.center {
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  .buttons {
    display: flex;
    align-items: center;
    height: 13px;
    i {
      font-size: 20px;
      color: #313131;
    }
    span {
      display: inline-block;
      width: 50px;
      box-sizing: border-box;
      text-align: center;
    }
    span:nth-child(3) i {
      font-size: 25px;
    }
    .icon-xunhuan {
      font-size: 17px;
    }
    .icon-xihuan {
      font-size: 15px;
    }
    .like {
      color: #ec4141;
    }
  }
  .progressBar {
    display: flex;
    align-items: center;
    height: 10px;
    margin-top: 12px;
    overflow: hidden;
    .progressSlider {
      width: 300px;
    }
    .totolTime,
    .currentTime {
      font-size: 12px;
      transform: scale(0.85);
      color: #aaa;
      margin: 0 5px;
      width: 30px;
      text-align: center;
    }
  }
}

.right {
  display: flex;
  align-items: center;
  position: relative;
  .volumeControl {
    display: flex;
    align-items: center;
    margin-right: 15px;
    .icon-yinliang {
      font-size: 18px;
      margin-right: 7px;
    }
  }
  .icon-bofangliebiao {
    font-size: 18px;
    margin-right: 10px;
  }
  .volumeSlider {
    width: 60px;
  }
  .recondInfo {
    position: absolute;
    font-size: 12px;
    transform: scale(0.8);
    width: 140px;
    right: -5px;
    bottom: -5px;
  }
}

.drawerHeader {
  font-size: 12px;
  transform: scale(0.9);
  color: #aaa;
  padding: 15px 0;
}
</style>
