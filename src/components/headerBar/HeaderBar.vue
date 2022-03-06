<template>
  <div class="headerBar">
    <div class="left">
      <img src="~assets/img/logo.png" alt="" />
    </div>
    <div class="center">
      <div class="buttons">
        <i class="iconfont icon-arrow-left-bold back" @click="goBack" />
        <i class="iconfont icon-arrow-right-bold forward" @click="goForward" />
      </div>
      <div class="search">
        <el-popover
          placement="bottom"
          width="300"
          popper-class="searchPop"
          trigger="focus"
          v-model="isSearchPopShow"
        >
          <el-input
            placeholder="请输入内容"
            prefix-icon="el-icon-search"
            size="mini"
            slot="reference"
            @input="inputSearch"
            @keyup.enter.native="onSubmit"
            v-model="searchInput"
          />
          <!-- 热搜榜 -->
          <div class="hotSearch" v-if="!searchSuggestList.songs">
            <div class="hotSearchTitle">热搜榜</div>
            <div
              class="hotSearchItem"
              v-for="(item, index) in hotSearchList"
              :key="index"
              @click="clickHotSearchItem(item.searchWord)"
            >
              <div class="hotSearchIndex" :class="index < 3 ? 'topThree' : ''">
                {{ index + 1 }}
              </div>
              <div class="hotSearchInfo">
                <div
                  class="hotSearchWord"
                  :class="index < 3 ? 'hotSearchWordTopThree' : ''"
                >
                  {{ item.searchWord }}
                </div>
                <div class="hotSearchContent">{{ item.content }}</div>
              </div>
            </div>
          </div>
          <!-- 搜索建议 -->
          <div class="searchSuggest">
            <div class="hotSearchTitle" v-if="searchSuggestList.songs">
              搜索建议
            </div>
            <!-- 单曲 -->
            <div
              class="searchSuggestItem"
              v-if="
                searchSuggestList.songs && searchSuggestList.songs.length !== 0
              "
            >
              <div class="searchSuggestItemTitle">
                <i class="iconfont icon-yinle" /> 单曲
              </div>
              <div
                class="suggestItemDetail"
                v-for="(item, index) in searchSuggestList.songs"
                :key="index"
                @click="clickSuggestSong(item.id)"
              >
                {{ item.name + " - " + item.artists[0].name }}
              </div>
            </div>
            <!-- 歌手 -->
            <div
              class="searchSuggestItem"
              v-if="
                searchSuggestList.artists &&
                  searchSuggestList.artists.length !== 0
              "
            >
              <div class="searchSuggestItemTitle">
                <i class="iconfont icon-mic" /> 歌手
              </div>
              <div
                class="suggestItemDetail"
                v-for="(item, index) in searchSuggestList.artists"
                :key="index"
                @click="clickSuggestSinger(item.id)"
              >
                {{ item.name }}
              </div>
            </div>
            <!-- 专辑 -->
            <div
              class="searchSuggestItem"
              v-if="
                searchSuggestList.albums &&
                  searchSuggestList.albums.length !== 0
              "
            >
              <div class="searchSuggestItemTitle">
                <i class="iconfont icon-more" /> 专辑
              </div>
              <div
                class="suggestItemDetail"
                v-for="(item, index) in searchSuggestList.albums"
                :key="index"
                @click="clickSuggestAlbum(item.id)"
              >
                {{ item.name + " - " + item.artist.name }}
              </div>
            </div>
            <!-- 歌单 -->
            <div
              class="searchSuggestItem"
              v-if="
                searchSuggestList.playlists &&
                  searchSuggestList.playlists.length !== 0
              "
            >
              <div class="searchSuggestItemTitle">
                <i class="iconfont icon-gedan" /> 歌单
              </div>
              <div
                class="suggestItemDetail"
                v-for="(item, index) in searchSuggestList.playlists"
                :key="index"
                @click="clickSuggestMusicList(item.id)"
              >
                {{ item.name }}
              </div>
            </div>
          </div>
        </el-popover>
      </div>
    </div>
    <div class="right">
      <div class="user">
        <div class="avatar">
          <!-- 登录框 -->
          <el-popover
            placement="bottom"
            width="330"
            trigger="click"
            v-if="!userInfo.avatarUrl"
          >
            <el-form
              ref="form"
              v-model="loginForm"
              label-width="80"
              label-position="right"
              size="mini"
            >
              <el-form-item
                label="手机号码："
                size="mini"
                label-width="100px"
                required
              >
                <input type="text" v-model="loginForm.phoneNum" />
              </el-form-item>
              <el-form-item
                label="密码："
                size="mini"
                label-width="100px"
                required
              >
                <input type="password" v-model="loginForm.password" />
              </el-form-item>
              <div class="loginButton">
                <el-button type="danger" size="mini" @click="login"
                  >登录</el-button
                >
              </div>
              <div class="regEnter" @click="isRegisteredShow = true">注册</div>
            </el-form>
            <img
              src="~assets/img/test.jpg"
              slot="reference"
              @click="isPopoverShow = !isPopoverShow"
            />
          </el-popover>
          <!-- 已登录状态 -->
          <el-popover
            placement="bottom"
            trigger="click"
            v-else
            v-model="isPopoverShow"
          >
            <img :src="userInfo.avatarUrl" alt="" slot="reference" />
            <div class="loginButton">
              <el-button size="mini" type="info" class="logout" @click="logout"
                >退出登录</el-button
              >
            </div>
          </el-popover>
        </div>
        <div class="user-name" v-if="userInfo.nickname">
          {{ userInfo.nickname }}
        </div>
        <div class="user-name" v-else>点击头像登录</div>
      </div>
    </div>

    <registered
      :isDialogShow="isRegisteredShow"
      @closeRegistered="isRegisteredShow = false"
    />
  </div>
</template>

<script>
import { handleMusicTime } from "@/utils/index"
import Registered from "@/components/registered/Registered.vue"
// 节流定时器名称
let timer
export default {
  components: {
    Registered
  },
  name: "HeaderBar",
  props: {},
  data() {
    return {
      isSearchPopShow: false, //控制弹出层
      searchInput: "", //搜索内容
      hotSearchList: [], //热搜榜单列表
      loginForm: {
        //登录表单
        password: "",
        phoneNum: ""
      },
      userInfo: {}, //用户信息
      isPopoverShow: false, // 搜索建议框是否出现
      searchSuggestList: {}, //搜索建议列表
      isRegisteredShow: false //注册框是否展示
    }
  },
  methods: {
    // 登录请求
    async loginByCellphone() {
      let { data } = await this.$request("/login/cellphone", {
        phone: this.loginForm.phoneNum,
        password: this.loginForm.password,
        withCredentials: true
      })
      if (data.code === 200) {
        window.localStorage.setItem("userInfo", JSON.stringify(data.profile))
        this.userInfo = data.profile
        this.isPopoverShow = false
        this.$message.success("登录成功!")
        // 刷新页面
        this.$router.go(0)
      } else if (data.code === 400) {
        // 手机号错误
        this.$message.error("手机号错误")
      } else if (data.code === 502) {
        // 密码错误
        this.$message.error("密码错误")
      } else {
        this.$message.error("登录失败，请稍后重试！")
      }
    },
    // 获取热门搜索列表
    async getHotSearchList() {
      let { data } = await this.$request("/search/hot/detail")
      this.hotSearchList = data.data
    },
    // 获取搜索建议
    async getSearchSuggest(keywords) {
      let { data } = await this.$request("/search/suggest", { keywords })
      this.searchSuggestList = data.result
      console.log(this.searchSuggestList)
    },
    // 点击建议歌曲的回调
    async clickSuggestSong(id) {
      let row = await this.getMusicInfo(id)
      this.isSearchPopShow = false
      // 获取当前的歌单列表和歌曲索引
      let musicList = this.$store.state.musicList
      let currentIndex = this.$store.state.currentIndex
      // 先判断该歌曲是否已经在歌单中存在，避免重复点击导致歌单出现相同歌曲
      let isExist = musicList.find(item => item.id === row.id)
      if (isExist) {
        // 若存在则只提交歌曲id并return终止
        this.$store.commit("updateMusicId", row.id)
        return
      }
      this.$store.commit("changePlayState", false)
      // 将请求到的歌曲详情插入到歌单对应位置并提交至vuex
      musicList.splice(currentIndex + 1, 0, row)
      this.$store.commit("updateMusicId", row.id)
      this.$store.commit("updateMusicList", {
        musicList,
        musicListId: this.$store.state.musicListId
      })
    },
    // 根据id获取歌曲详情
    async getMusicInfo(ids) {
      let { data } = await this.$request("/song/detail", { ids })
      // 处理事件
      data.songs[0].dt = handleMusicTime(data.songs[0].dt)
      return data.songs[0]
    },
    // 点击建议歌曲的回调
    clickSuggestSinger(id) {
      this.$router.push({ name: "singerDetail", params: { id } })
      this.isSearchPopShow = false
    },
    // 点击建议专辑的回调
    clickSuggestAlbum(id) {
      this.$router.push({ name: "album", params: { id } })
      this.isSearchPopShow = false
    },
    // 点击建议歌单的回调
    clickSuggestMusicList(id) {
      this.$router.push({ name: "musicListDetail", params: { id } })
      this.isSearchPopShow = false
    },
    // 点击热搜的回调
    clickHotSearchItem(searchWord) {
      this.searchInput = searchWord
      this.goSearch()
    },
    goBack() {
      this.$router.go(-1)
    },
    goForward() {
      this.$router.go(1)
    },

    // 搜索框输入的回调
    inputSearch(e) {
      // console.log(e);
      clearTimeout(timer)
      if (e != "") {
        timer = setTimeout(() => {
          this.getSearchSuggest(e)
        }, 500)
      } else {
        // 清空searchSuggestList
        this.searchSuggestList = {}
        return
      }
    },
    onSubmit(e) {
      if (e.keyCode === 13 && this.searchInput !== "") {
        this.goSearch()
      }
    },
    // 跳转到搜索详情页面
    goSearch() {
      this.isSearchPopShow = false
      this.$router.push({ name: "search", params: { id: this.searchInput } })
    },
    // 登录
    login() {
      this.loginByCellphone()
    },
    // 退出登录
    logout() {
      // 清空data和localstorage中的数据 以及cookie
      this.userInfo = {}
      window.localStorage.setItem("userInfo", "")
      this.clearAllCookie()
      this.isPopoverShow = false
    },
    // 清除所有cookie
    clearAllCookie() {
      var date = new Date()
      date.setTime(date.getTime() - 10000)
      var keys = document.cookie.match(/[^=;]+(?=\=)/g)
      console.log("需要删除的cookie名字：" + keys)
      if (keys) {
        for (var i = keys.length; i--; ) {
          document.cookie =
            keys[i] + "=0;expire=" + date.toGMTString() + ";path=/"
        }
      }
    }
  },
  created() {
    this.getHotSearchList()
    if (window.localStorage.getItem("userInfo")) {
      // 进入这里表示已经登录，更新登录状态到vuex
      this.$store.commit("updataLoginState")
      // 从localStorage里取出userInfo
      this.userInfo = JSON.parse(window.localStorage.getItem("userInfo"))
    }
  }
}
</script>
<style scoped lang="less">
@import "./HeaderBar-element.css";

.headerBar {
  display: flex;
  align-items: center;
  width: 100%;
  height: 50px;
  position: relative;
  z-index: 9999;

  .left {
    width: 110px;
    margin: 0 50px 0 10px;
    img {
      width: 100%;
    }
  }

  .center {
    display: flex;
    align-items: center;
    .buttons {
      color: rgb(235, 235, 235);
      height: 22px;
      i {
        background-color: #e13e3e;
        font-size: 12px;
        transform: scale(0.8);
        padding: 5px;
        height: 22px;
        width: 22px;
        border-radius: 50%;
        margin: 0 3px;
      }
    }
  }

  .right {
    display: flex;
    position: absolute;
    right: 50px;
    top: 0;
    line-height: 50px;
    .user {
      display: flex;
      align-items: center;
      .avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 7px;
        cursor: pointer;
        img {
          width: 100%;
        }
      }
      .user-name {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.85);
        width: 100px;
      }
    }
  }
}

.loginButton {
  width: 100%;
  text-align: center;
  .el-button {
    width: 200px;
  }
}

.el-form /deep/ .el-form-item__label {
  font-size: 13px !important;
}

.hotSearchTitle {
  font-size: 13px;
  margin: 10px 0 5px 20px;
}

.hotSearchItem {
  display: flex;
  align-items: center;
  padding: 6.5px 10px;
  cursor: pointer;
}

.hotSearchItem:hover {
  background-color: #f2f2f2;
}

.hotSearchIndex {
  margin-right: 15px;
  color: #aaa;
}

.topThree {
  color: #e13e3e;
}

.hotSearchWord {
  font-size: 12px;
  color: rgb(51, 51, 51);
}

.hotSearchWordTopThree {
  font-weight: 600;
  color: #000;
}

.hotSearchInfo {
  width: 89%;
}

.hotSearchContent {
  font-size: 12px;
  transform: scale(0.9) translateX(-5%);
}

.searchSuggest {
  font-size: 12px;
}

.searchSuggestItem {
  cursor: pointer;
}

.searchSuggestItemTitle {
  background-color: #f5f5f5;
  padding: 4px 8px;
  i {
    font-size: 15px;
  }
}

.suggestItemDetail {
  padding: 4px 27px;
  font-size: 12px;
}

.suggestItemDetail:hover {
  background-color: #f2f2f2;
}

.regEnter {
  width: 100%;
  text-align: center;
  margin-top: 10px;
  font-size: 12px;
  text-decoration: underline;
  cursor: pointer;
}
</style>
