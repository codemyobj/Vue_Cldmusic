export default {
  // 更新音乐url
  updateMusicId(state, musicId) {
    state.musicId = musicId;
  },

  // 更新登录状态
  updataLoginState(state) {
    state.isLogin = !state.isLogin;
  },

  // 修改播放状态
  changePlayState(state, isPlay) {
    state.isPlay = isPlay;
  },

  // 更新歌单列表和歌单id
  updateMusicList(state, payload) {
    // 当歌单发生变化
    console.log(payload);
    if (payload.musicListId !== state.musicListId) {
      state.musicListId = payload.musicListId;
      state.currentIndex = -1;
    }
    // 对歌单进行深拷贝再赋值 直接赋值是浅拷贝
    // 歌单是固定的死数据 而vuex中的musicList是动态的
    let musicList = payload.musicList.slice(0);
    state.musicList = musicList;
  },
};
