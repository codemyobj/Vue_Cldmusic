import Vue from "vue"
import Vuex from "vuex"
import mutations from "./mutations"

Vue.use(Vuex)

const state = {
  // 音乐id
  musicId: "",
  // 音乐的播放状态
  isPlay: false,
  // 当前播放的歌单
  musicList: [],
  // 当前索引
  currentIndex: -1,
  // 登录状态
  isLogin: false,
  // 播放状态
  isPlay: false,
  // 当前播放歌单的id
  musicListId: "",
  // 当前播放音乐的索引
  currentIndex: -1,
  // 收藏的歌单
  collectMusicList: [],
  // 创建的歌单
  createdMusicList: [],
  // 下载的音乐信息
  downloadMusicInfo: {
    name: "",
    url: ""
  },
  // 当前歌曲播放的时间
  currentTime: 0,
  // 歌曲是否在加载中
  isMusicLoad: false,
  // 当前歌曲在播放列表中的索引
  currentIndex: -1,
  // 喜欢的音乐列表
  likeMusicList: []
}

export default new Vuex.Store({
  state,
  mutations
})
