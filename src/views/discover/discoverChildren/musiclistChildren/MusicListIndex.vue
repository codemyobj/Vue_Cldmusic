<template>
  <div class="musicListIndex">
    <!-- 精选歌单入口展示 -->
    <div class="highqualityEntry">
      <img :src="theFirstOfHighquality.coverImgUrl" class="backgroundImg" />
      <div class="cover">
        <img :src="theFirstOfHighquality.coverImgUrl" alt="" />
      </div>
      <div class="EntryInfo">
        <div class="tag"><i class="iconfont icon-good" />精品歌单</div>
        <div class="name">{{ theFirstOfHighquality.name }}</div>
        <div class="desc">{{ theFirstOfHighquality.copywriter }}</div>
      </div>
    </div>
    <!-- 歌单列表 -->
    <div class="musicListNavBar">
      <div class="left">
        <SortBox
          :currentTag="currentTag"
          :sortList="sortList"
          @getSortList="getSortList"
          @clickSortBoxItem="clickSortBoxItem"
        />
      </div>
      <div class="right">
        <SecondNavBar
          :SecondNavBarData="hotTags"
          :itemWidth="0"
          :currentTag="currentTag"
          @clickSecondBarItem="clickSecondBarItem"
        />
      </div>
    </div>
    <!-- 展示歌单列表 -->
    <ListCard
      :listCardData="musicList.playlists"
      @clickListCardItem="clickListCardItem"
    />
    <!-- 分页 -->
    <div class="page" v-if="musicList.playlists">
      <el-pagination
        background
        layout="prev,pager,next"
        :total="musicList.total"
        :page-count="50"
        small
        @current-change="pageChanege"
      />
    </div>
  </div>
</template>
<script>
import SortBox from "@/components/sortBox/SortBox.vue"
import SecondNavBar from "@/components/secondNavBar/SecondNavBar.vue"
import ListCard from "@/components/listCard/ListCard.vue"

export default {
  name: "MusicListIndex",
  components: {
    SortBox,
    SecondNavBar,
    ListCard
  },
  props: {},
  data() {
    return {
      theFirstOfHighquality: {},
      currentTag: {},
      currentPage: 1,
      hotTags: [],
      musicList: {},
      sortList: []
    }
  },
  methods: {
    // 处理请求
    // 获取高质量歌单的第一条数据
    async getTheFirstHighquality() {
      let result = await this.$request("/top/playlist/highquality", {
        limit: 1
      })
      this.theFirstOfHighquality = result.data.playlists[0]
    },
    // 获取人们歌单tag数据
    async getHotTag() {
      let { data } = await this.$request("/playlist/hot")
      this.hotTags = data.tags
      this.currentTag = data.tags[0]
    },
    // 根据歌名请求歌单列表
    async getMusicList() {
      // this.musicList = {}
      let result = await this.$request("/top/playlist", {
        cat: this.currentTag.name,
        offset: 50 * (this.currentPage - 1)
      })
      // 里面的total可用于分页
      this.musicList = result.data
    },

    // 获取歌单分类信息数据
    async getSortList() {
      let { data } = await this.$request("/playlist/catlist")
      this.sortList = data.sub
    },

    clickSortBoxItem(item) {
      this.currentTag = item
      this.currentPage = 1
      this.getMusicList()
    },
    clickSecondBarItem(index) {
      this.currentTag = this.hotTags[index]
      this.currentPage = 1
      this.getMusicList()
    },
    clickListCardItem(id) {
      this.$router.push({ name: "musicListDetail", params: { id } })
    },
    pageChanege(page) {
      this.currentPage = page
      this.getMusicList()
    }
  },
  async created() {
    await this.getTheFirstHighquality()
    await this.getHotTag()
    await this.getMusicList()
  }
}
</script>
<style scoped lang="less">
.highqualityEntry {
  position: relative;
  width: 100%;
  height: 140px;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  .backgroundImg {
    position: absolute;
    left: 0;
    top: 0;
    z-index: -1;
    width: 100%;
    transform: translateX(-80px);
    filter: blur(30px) brightness(70%);
  }
  .cover {
    width: 120px;
    height: 120px;
    margin: 10px;
    img {
      border-radius: 10px;
      width: 100%;
    }
  }
  .EntryInfo {
    .tag {
      color: #d59e54;
      border: 1px solid #d59e54;
      padding: 5px 10px;
      width: 88px;
      font-size: 12px;
      margin: 20px 10px 15px;
      i {
        font-size: 14px;
      }
    }
    .name {
      color: #fff;
      font-size: 14px;
      margin: 10px 0;
    }
    .desc {
      color: rgba(255, 255, 255, 0.5);
      font-size: 12px;
      transform: scale(0.9, 0.9);
    }
  }
}
.musicListNavBar {
  padding-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}
.page {
  width: 100%;
  text-align: center;
  padding-bottom: 20px;
}
</style>
