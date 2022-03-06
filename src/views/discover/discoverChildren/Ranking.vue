<template>
  <div class="rankingContainer">
    <div class="ranking" v-if="offcialListDetail.length > 0">
      <div class="offcial">
        <div class="title">官方榜</div>
        <ListTable
          v-for="(item, index) in offcialListDetail"
          :key="index"
          :officialListDetailItem="item"
          @clickCheckAll="clickListCardItem"
          @handleRowClick="handleRowClick"
          @handleRowDbClick="handleRowDbClick"
        />
      </div>
      <div class="global">
        <div class="title">全球榜</div>
        <!-- 展示歌单列表 -->
        <ListCard
          class="listCard"
          :listCardData="globalList"
          @clickListCardItem="clickListCardItem"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { handleMusicTime } from "@/plugins/utils"

import ListTable from "@/components/listTable/ListTable.vue"
import ListCard from "@/components/listCard/ListCard.vue"

export default {
  components: {
    ListTable,
    ListCard
  },
  name: "Rankingranking",
  props: {},
  data() {
    return {
      offcialList: [],
      globalList: [],
      offcialListDetail: []
    }
  },
  methods: {
    // 请求
    // 获取所有排行榜数据
    async getAllRankings() {
      let { data } = await this.$request("/toplist")
      this.offcialList = data.list.slice(0, 4)
      this.globalList = data.list.slice(4)
    },
    // 根据榜单ud请求详细数据
    // 根据传来的id查询歌单
    async getMusicListDetail(id) {
      let result = await this.$request("/playlist/detail", { id })
      result = result.data.playlist
      // 对时间进行处理
      result.tracks.forEach((item, index) => {
        result.tracks[index].dt = handleMusicTime(item.dt)
      })
      this.offcialListDetail.push(result)
    },

    // 事件函数
    // 点击榜单进入歌单详情界面
    clickListCardItem(id) {
      if (!this.$store.state.isLogin) {
        this.$message.error("登录后才能查到全部歌曲哦")
        return
      }
      if (id.id) {
        id = id.id
      }
      this.$router.push({ name: "musicListDetail", params: { id } })
    },
    // 行点击事件
    handleRowClick(event) {
      if (document.querySelector(".selectRow")) {
        document.querySelector(".selectRow").classList.remove("selectRow")
      }
      event.classList.add("selectRow")
    },
    // 行双击事件
    // id 歌单id   index 双击歌曲在歌单中的索引
    handleRowDbClick({ id, index }) {
      let musicListIndex = this.offcialListDetail.findIndex(
        item => item.id === id
      )
      this.$store.commit(
        "updateMusicId",
        this.offcialListDetail[musicListIndex].tracks[index].id
      )
      // 歌单发生变化 则提交歌单到vuex
      if (id !== this.$store.state.musicListId) {
        // 将歌曲传入vuex
        this.$store.commit("updateMusicList", {
          musicList: this.offcialListDetail[musicListIndex].tracks,
          musicListId: id
        })
      }
    }
  },
  async created() {
    await this.getAllRankings()
    await this.offcialList.forEach(item => this.getMusicListDetail(item.id))
  }
}
</script>
<style scoped lang="less">
.rankingContainer {
  display: flex;
  justify-content: center;
  width: 100%;
  .ranking {
    width: 1000px;
    max-width: 1000px;
    padding: 0 10px;
  }
}
</style>
