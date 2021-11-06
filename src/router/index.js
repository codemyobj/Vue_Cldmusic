import Vue from "vue"
import VueRouter from "vue-router"

// import Index from "@/components/Index.vue";
const Index = () => import("@/components/Index.vue")
const Discover = () => import("@/views/discover/Discover.vue")
const Recommend = () =>
  import("@/views/discover/discoverChildren/Recommend.vue")

const Video = () => import("@/views/video/Video.vue")

const Favorites = () => import("@/views/favorites/Favorites.vue")

const RecommendMusic = () => import("@/views/recommendmusic/RecommendMusic.vue")

Vue.use(VueRouter)

const routes = [
  { path: "/", redirect: "/index" },
  {
    path: "/index",
    component: Index,
    redirect: "/discover",
    children: [
      {
        path: "/discover",
        component: Discover,
        redirect: "/discover/recommend",
        children: [{ path: "/discover/recommend", component: Recommend }]
      },
      {
        path: "/video",
        component: Video
      },
      {
        path: "/favorites",
        component: Favorites
      },
      {
        path: "/recommendmusic",
        component: RecommendMusic
      }
    ]
  }
]

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
})

export default router
