<template>
  <el-aside width="160px">
    <el-menu active-text-color="black" router :default-active="defaultActive">
      <el-menu-item index="/discover">
        <i class="iconfont icon-yinle" />
        <span slot="title">发现音乐</span>
      </el-menu-item>
      <el-menu-item index="/video">
        <i class="iconfont icon-shipin" />
        <span slot="title">视频</span>
      </el-menu-item>
      <el-menu-item index="/favorites">
        <i class="iconfont icon-more" />
        <span slot="title">收藏</span>
      </el-menu-item>
      <el-menu-item index="/recommendmusic">
        <i class="iconfont icon-good" />
        <span slot="title">每日推荐</span>
      </el-menu-item>
      <el-menu-item-group>
        <template slot="title" class="groupTitle">创建的歌单</template>
        <el-menu-item
          v-for="(item, index) in createdMusicList"
          :key="index"
          :index="`/musiclistdetail/${item.id}`"
        >
          <i class="iconfont icon-gedan" />{{ item.name }}
        </el-menu-item>
      </el-menu-item-group>

      <el-menu-item-group>
        <template slot="title" class="groupTitle">收藏的歌单</template>
        <el-menu-item
          v-for="(item, index) in collectedMusicList"
          :key="index"
          :index="`/musiclistdetail/${item.id}`"
        >
          <i class="iconfont icon-gedan" />{{ item.name }}
        </el-menu-item>
      </el-menu-item-group>
    </el-menu>
  </el-aside>
</template>

<script>
export default {
  components: {},
  name: "AsideMenu",
  props: {},
  data() {
    return {
      defaultActive: "",
      // 收藏的歌单
      collectedMusicList: [],
      // 创建的歌单
      createdMusicList: [],
      // 用户信息
      userInfo: {}
    }
  },
  watch: {
    // 监听收藏歌单的变化
    "$store.state.collectMusicList"(current) {
      this.collectedMusicList = current
    },
    "$route.path"() {
      // 取路由中的首地址 用于侧边栏的导航active
      this.defaultActive = "/" + this.$route.path.split("/")[1]
    }
  },
  created() {
    // 取路由中的首地址 用于侧边栏的导航active
    this.defaultActive = "/" + this.$route.path.split("/")[1]
    // 顶部栏读取登录状态需要一定时间，这里延迟500毫秒再执行
    setTimeout(() => {
      this.getUserMusicList()
    }, 500)
  },
  methods: {
    // 请求
    // 请求用户歌单
    async getUserMusicList() {
      if (!this.$store.state.isLogin) {
        // 说明还没登录
        this.$message.warning("请先进行登录操作")
        return
      }
      let timestamp = Date.parse(new Date())
      // 先从localStorage里面读取用户信息 如果登录成功是有存的
      this.userInfo =
        window.localStorage.getItem("userInfo") &&
        JSON.parse(window.localStorage.getItem("userInfo"))
      let res = await this.$request("/user/playlist", {
        uid: this.userInfo.userId,
        timestamp
      })
      // 对数据进行分类
      res = res.data.playlist
      let index = res.findIndex(item => item.subscribed === true)
      this.createdMusicList = res.slice(0, index)
      this.collectedMusicList = res.slice(index)
      this.createdMusicList[0].name = "我喜欢的音乐"
      // 将收藏的歌单上传到vuex
      this.$store.commit("updateCollectMusicList", this.collectedMusicList)
      // 将创建的歌单上传到vuex
      this.$store.commit("updateCreatedMusicList", this.createdMusicList)
    }
  }
}
</script>
<style scoped>
.is-active {
  background-color: #f6f6f7;
  font-size: 14px;
  font-weight: 600;
}

.iconfont {
  font-size: 14px;
  margin: 5px !important;
}

.el-aside {
  height: calc(100vh - 105px);
  border-right: 1px solid #ccc;
}

.el-menu {
  border: none;
}

.el-menu-item:hover {
  background-color: #f5f5f6 !important;
}

.el-menu-item {
  font-size: 8px;
  padding: 0 0 0 10px !important;
  margin: 5px 0 !important;
  height: 30px;
  line-height: 30px;
}
.el-menu-item-group {
  margin-top: 10px;
}
</style>
