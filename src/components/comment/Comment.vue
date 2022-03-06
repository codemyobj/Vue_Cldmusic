<template>
  <div class="hotComments">
    <div
      class="comments"
      v-if="commentType !== '' && commentType !== 'music' && isHotComment"
    >
      <el-input
        type="textarea"
        class="commentArea"
        maxlength="140"
        show-word-limit
        v-model="commentInput"
        placeholder="留下你的评论"
        @input="inputComment"
      />
      <div class="submitCommentButton">
        <el-button
          size="mini"
          round
          class="submitComment"
          @click="commentMode ? submitComment() : submitFloorComment()"
        >
          评论
        </el-button>
      </div>
    </div>
    <!-- 音乐评论 -->
    <div
      class="musicComment"
      v-else-if="commentType !== '' && commentType === 'music'"
    >
      <el-button
        size="mini"
        round
        class="commentCardSwitch"
        @click="openDialog"
      >
        <i class="iconfont icon-ziyuan" />发表我的音乐评论
      </el-button>
      <el-dialog
        :visible="isCommentDialogShow"
        class="commentDialog"
        width="400px"
        append-to-body
        @close="closeCommentDialog"
      >
        <div class="musicTiltle">歌曲: {{ musicTitle }}</div>
        <el-input
          type="textarea"
          class="commentArea musicCommentArea"
          maxlength="140"
          show-word-limit
          v-model="commentInput"
          placeholder="留下你的评论"
          @input="inputComment"
        />
        <!-- 提交评价 -->
        <div class="submitCommentButton">
          <el-button
            size="mini"
            round
            class="submitComment musicSubmitComment"
            @click="commentMode ? submitComment() : submitFloorComment()"
          >
            评价
          </el-button>
        </div>
      </el-dialog>
    </div>
    <div class="commentHeader"><slot name="title" /></div>
    <div class="commentItem" v-for="(item, index) in comments" :key="index">
      <div class="commentCreatorAvatar">
        <img :src="item.user.avatarUrl + '?param=100y100'" />
      </div>
      <div class="commentMain">
        <div class="commentContent">
          <span class="commentUserNickName">
            {{ item.user.nickname }}:&nbsp;
          </span>
          <span>{{ item.content }}</span>
        </div>
        <div class="replied">
          <div
            class="repliedItem"
            v-for="(item1, index1) in item.beReplied"
            :key="index1"
          >
            <span class="replieUser">@{{ item1.user.nickname }}:&nbsp;</span>
            <span class="replieContent">{{ item1.content }}</span>
          </div>
        </div>
        <div class="commentBottom">
          <div class="commentCreatedTime">
            {{ item.time | showDate }}
          </div>
          <div class="commentButtons">
            <div
              @click="likeCurrentComment(item.liked, item.commentId)"
              :class="item.liked ? 'likeCurrentComment' : ''"
            >
              <i class="iconfont icon-good" /> {{ item.likedCount }}
            </div>
            <div><i class="iconfont icon-zhuanfa" /></div>
            <div>
              <i
                class="iconfont icon-pinglun"
                @click="floorComment(item.commentId, item.user.nickname)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDate } from "@/utils"
export default {
  components: {},
  name: "Comment",
  props: {
    // 评论数据
    comments: {
      type: Array,
      default: () => []
    },
    // 评论的类型
    commentType: {
      type: String,
      default: ""
    },
    // 评论对象的id
    commentId: {
      type: String,
      default: ""
    },
    // 歌曲评论需要歌曲名称
    musicTitle: {
      type: String,
      default: ""
    },
    // 是否是热门评论
    isHotComment: {
      type: Boolean,
      default() {
        return true
      }
    }
  },
  watch: {
    // 评论数据发生变化 重置所有发表评论的数据
    comments() {
      this.commentInput = ""
      this.isCommentDialogShow = false
      this.commentMode = true
      this.floorCommentInputLength = 0
    }
  },
  filters: {
    showDate(value) {
      // 1 先将时间戳转成date对象
      const date = new Date(value)

      // 2 将date进行格式化
      return formatDate(date, "yyyy-MM-dd")
    }
  },
  data() {
    return {
      commentInput: "",
      // 是否显示评论dialog
      isCommentDialogShow: false,
      // 评论模式 true 是正常评论 false是楼层评论
      commentMode: false,
      // 楼层评论前面几个字的长度
      floorCommentInputLength: 0,
      // 用于暂存楼层评论id
      floorCommentId: ""
    }
  },
  methods: {
    // 请求
    // 提交正常评论
    async submitComment() {
      // 判断是否登录
      this.isLogin()
      // 先判断评论内容是否为空
      if (this.commentInput === "") {
        this.$message.warning("评论内容不能为空哦！")
        return
      }

      // 判断评论类型
      let type = this.getCommentType()
      let res = await this.$request("/comment", {
        t: 1,
        id: this.commentId,
        type,
        content: this.commentInput
      }).catch(err => {
        this.$message.error(err.response.data.msg)
      })
      if (!res) return
      if (res.data.code === 200) {
        if (this.commentType === "music") {
          this.isCommentDialogShow = false
        }
        this.commentInput = ""
        this.$emit("getComment")
      } else {
        this.$message.error("评论失败，请稍后重试！")
      }
    },

    // 提交楼层评论
    async submitFloorComment() {
      console.log("111")
    },

    // 喜欢评论
    async likeCurrentComment(flag, cid) {
      // console.log(flag, cid)
      this.isLogin()
      // 获取时间戳
      var timestamp = Date.parse(new Date())

      // 判断评论的类型
      let type = this.getCommentType()
      let res = await this.$request("/comment/like", {
        id: this.commentId,
        cid,
        t: flag ? 0 : 1,
        type,
        timestamp
      })
      res.data.code === 200
        ? this.$emit("getComment")
        : this.$message.error("点赞失败,请稍后再试")
    },

    // 点击楼层评论
    floorComment(commentId, nickName) {
      // console.log(commentId, nickName)
      if (!this.isHotComment) {
        // 将其转给hotcomment处理
        this.$emit("transToHotComment", {
          commentId,
          nickName
        })
      }
      if (this.commentType !== "music") {
        // 让父元素滚动到评论框
        this.$emit("scrollToComment")
        // 获取评论框焦点
        let input = document.querySelector("commentArea")
        // 诅咒focus定位
        input.children[0].focus({ preventScroll: true })
      } else {
        this.openDialog()
      }
      this.commentInput = `回复${nickName}: `
      this.floorCommentInputLength = this.commentInput.length
      // 将评论模式改为楼层评论
      this.commentMode = false
      this.floorCommentId = commentId
    },

    // 判断是否登录函数
    isLogin() {
      if (!this.$store.state.isLogin) {
        this.$message.warning("只有登录后才能点赞哦！")
        return
      }
    },

    // 判断评论类型
    getCommentType() {
      // 判断评论的类型
      let type
      switch (this.commentType) {
        case "album":
          type = 3
          break
        case "musicList":
          type = 2
          break
        case "music":
          type = 0
          break
        case "mv":
          type = 1
          break
        case "video":
          type = 5
          break
        default:
          break
      }
      return type
    },

    // 输入框输入事件
    inputComment() {
      // 如果是楼层评论
      if (!this.commentMode) {
        // 当输入长度小于当前楼层评论前面默认的字时
        if (this.commentInput.length < this.floorCommentInputLength) {
          this.commentMode = true
        }
      }
    },

    // 打开评论弹框
    openDialog() {
      this.isCommentDialogShow = !this.isCommentDialogShow
      // dialog在第一次出现前是不渲染的,所有这里用nextTick
      this.$nextTick(() => {
        // 让评论框获得焦点
        let input = document.querySelector(".musicCommentArea")
        input.children[0].focus()
      })
    },

    // 关闭评论框
    closeCommentDialog() {
      this.isCommentDialogShow = false
      this.commentInput = ""
      this.commentMode = true
      this.floorCommentInputLength = 0
      this.floorCommentId = ""
    }
  }
}
</script>
<style scoped lang="less">
.hotComments {
  margin-bottom: 20px;
  width: 100%;
  padding: 0 10px;
  .musicComment {
    .commentCardSwitch {
      position: fixed;
      left: 50%;
      top: calc(100vh - 105px);
      transform: translateX(-50%) scale(0.9);
      border: none;
      background-color: #f1f1f1;
      line-height: 15px;
      padding: 10px 10px 10px 30px;
      i {
        position: absolute;
        top: 50%;
        left: 10px;
        transform: translateY(-50%);
      }
    }
    .commentCardSwitch:hover {
      background-color: #e1e1e1;
    }
  }
}

.commentDialog /deep/ .el-dialog__body {
  padding-bottom: 5px !important;
}
.musicTiltle {
  width: 100%;
  font-weight: 700;
  color: #333;
  text-align: center;
  margin-bottom: 10px;
}
.musicCommentArea /deep/ .el-textarea__inner {
  height: 110px !important;
}

.submitComment:hover {
  background-color: #fff;
}

.submitCommentButton {
  width: 100%;
  text-align: right;
  margin: 10px 0;
}

.musicSubmitComment {
  padding: 8px 20px;
  font-size: 13px;
  background-color: #e74949;
  color: #fff;
  border: none;
}

.musicSubmitComment:hover {
  background-color: #e72a2a;
  color: #fff;
}

.musicSubmitComment:focus {
  color: #fff;
  background-color: #e74949;
}

.likeCurrentComment,
.likeCurrentComment i {
  color: #ec4141 !important;
}

.commentHeader {
  font-size: 14px;
  color: rgb(26, 26, 26);
  font-weight: 600;
  padding: 10px 0;
}
.commentItem {
  display: flex;
  margin: 5px 0;
  padding: 10px 0 20px;
  border-bottom: 1px solid #eee;
  font-size: 12px;
}
.commentCreatorAvatar {
  width: 35px;
  height: 35px;
  margin: 0 10px 0 0;
}
.commentCreatorAvatar img {
  width: 100%;
  border-radius: 50%;
}
.commentMain {
  width: calc(100% - 50px);
}
.commentContent > span {
  line-height: 20px;
}
.commentUserNickName {
  color: #5a8ab9;
}
.replied {
  background-color: #f4f4f4;
  margin: 7px 0;
  border-radius: 5px;
}
.repliedItem {
  padding: 7px 10px;
  line-height: 20px;
}
.replieUser {
  color: #5a8ab9;
}

.commentBottom {
  margin-top: 2px;
  color: rgb(172, 172, 172);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.commentButtons {
  display: flex;
  align-items: center;
}
.commentButtons div {
  margin-top: -3px;
  padding: 0 8px;
  transform: scale(0.85);
}

.commentButtons div:first-child {
  font-size: 14px;
}
</style>
