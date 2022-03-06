<template>
  <div class="officialItem">
    <div class="listCover">
      <img
        :src="officialListDetailItem.coverImgUrl"
        @click="
          officialListDetailItem.coverImgUrl
            ? clickCheckAll(officialListDetailItem.id)
            : ''
        "
      />
    </div>
    <div class="listContainer">
      <slot name="header" />
      <table>
        <tr
          class="listRows"
          v-for="(item, index) in (officialListDetailItem.tracks &&
            officialListDetailItem.tracks.slice(0, 5)) ||
            (officialListDetailItem.topSongs &&
              (officialListDetailItem.isOpen
                ? officialListDetailItem.topSongs
                : officialListDetailItem.topSongs.slice(0, 10))) ||
            officialListDetailItem.songs.slice(0, 10)"
          :key="index"
          @click="handleRowClick"
          @dblclick="
            handleRowDbClick(officialListDetailItem.id || item.id, index)
          "
        >
          <td class="index">{{ index + 1 }}</td>
          <td class="musicName">{{ item.name }}</td>
          <td class="singer">{{ item.ar[0].name }}</td>
        </tr>
      </table>

      <div class="checkAll">
        查看全部 <i class="iconfont icon-arrow-right-bold" />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "ListTable",
  components: {},
  props: {
    officialListDetailItem: {
      type: Object,
      default: () => {}
    },
    listId: {
      type: String,
      default: ""
    }
  },
  computed: {},
  data() {
    return {}
  },
  methods: {
    clickCheckAll(id) {
      let listId = this.listId
      this.$emit("clickCheckAll", { id, listId })
    },
    handleRowClick(event) {
      let path
      if (event.path[0].localName === "tr") {
        path = event.path[0]
      } else {
        path = event.path[1]
      }
      this.$emit("handleRowClick", path)
    },
    handleRowDbClick(id, index) {
      let listId = this.listId
      this.$emit("handleRowDbClick", { id, index, listId })
    }
  }
}
</script>
<style scoped lang="less">
.officialItem {
  display: flex;
  margin: 20px 0 50px 0;
  .listCover {
    width: 150px;
    height: 150px;
    margin-right: 20px;
    cursor: pointer;
    img {
      width: 100%;
      border-radius: 10px;
    }
  }
  .listContainer {
    width: calc(100% - 200px);
    table {
      width: 100%;
      border-collapse: collapse;
      border-radius: 5px;
      overflow: hidden;
      tr {
        cursor: pointer;
      }
      .listRows {
        height: 30px;
        font-size: 12px;
        color: rgb(153, 153, 153);
        width: 100%;
        display: flex;
        align-items: center;
        position: relative;
        td {
          transform: scale(0.9);
        }
        .index {
          text-align: center;
          line-height: 28px;
          width: 30px;
        }
        .musicName {
          color: rgb(31, 31, 31);
          transform: translate(-5%, -5%) scale(0.9);
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          width: 80%;
        }
        .singer {
          text-align: right;
          position: absolute;
          right: 10px;
        }
      }
      .listRows:nth-child(odd) {
        background-color: #f9f9f9;
      }
      .listRows:hover {
        background-color: #f4f4f4;
      }
    }
    .checkAll {
      color: rgb(134, 134, 134);
      font-size: 12px;
      transform: scale(0.9) translateX(-5%);
      width: 100px;
      height: 30px;
      line-height: 39px;
      cursor: pointer;
      i {
        font-size: 12px;
      }
    }
  }
}
.selectRow {
  background-color: #efefef !important;
}
</style>
