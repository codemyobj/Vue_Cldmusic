export default {
  // 更新音乐url
  updateMusicId(state, musicId) {
    state.musicId = musicId
  },

  // 更新登录状态
  updataLoginState(state) {
    state.isLogin = !state.isLogin
  },

  // 修改播放状态
  changePlayState(state, isPlay) {
    state.isPlay = isPlay
  },

  // 更新歌单列表和歌单id
  updateMusicList(state, payload) {
    // 当歌单发生变化
    if (payload.musicListId !== state.musicListId) {
      state.musicListId = payload.musicListId
      state.currentIndex = -1
    }
    // 对歌单进行深拷贝再赋值 直接赋值是浅拷贝
    // 歌单是固定的死数据 而vuex中的musicList是动态的
    let musicList = payload.musicList.slice(0)
    state.musicList = musicList
  },

  // 更新收藏的歌单
  updateCollectMusicList(state, collectMusicList) {
    state.collectMusicList = collectMusicList
  },

  // 更新创建的歌单
  updateCreatedMusicList(state, createdMusicList) {
    state.createdMusicList = createdMusicList
  },

  // 修改播放状态
  updatePlayState(state, isPlay) {
    state.isPlay = isPlay
  },

  // 更新当前播放时间
  updateCurrentTime(state, time) {
    state.currentTime = time
  },

  // 改变歌曲加载状态
  updateMusicLoadState(state, isLoading) {
    state.isMusicLoad = isLoading
  },

  // 更新当前音乐播放的索引
  updateCurrentIndex(state, index) {
    state.currentIndex = index
  },

  // 更新喜欢的音乐列表
  updateLikeMusicList(state, list) {
    state.likeMusicList = list
  },

  // 更新下载的音乐的信息
  updateDownloadMusicInfo(state, info) {
    state.downloadMusicInfo = info
  },

  // 切换音乐详情卡片的显隐
  changeMusicDetailCardState(state) {
    state.isMusicDetailCardShow = !state.isMusicDetailCardShow
  }
}
