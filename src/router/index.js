import Vue from "vue"
import VueRouter from "vue-router"

Vue.use(VueRouter)

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

const routes = [
  { path: "/", redirect: "/index" },
  {
    path: "/index",
    component: () => import("@/components/Index.vue"),
    redirect: "/discover",
    children: [
      {
        path: "/discover",
        component: () => import("@/views/discover/Discover.vue"),
        redirect: "/discover/recommend",
        children: [
          {
            path: "/discover/recommend",
            component: () => import("@/views/discover/discoverChildren/Recommend.vue")
          },
          {
            path: "/discover/musiclist",
            component: () => import("@/views/discover/discoverChildren/MusicList.vue"),
            redirect: '/discover/musiclist/musiclistindex',
            children: [
              {
                path: '/discover/musiclist/musiclistindex',
                component: () => import("@/views/discover/discoverChildren/musiclistChildren/MusicListIndex.vue")
              },
              {
                path: '/discover/musiclist/musiclisthighquality',
                component: () => import('@/views/discover/discoverChildren/musiclistChildren/MusicListHighquality.vue')
              }
            ]
          },
          {
            path: "/discover/ranking",
            component: () => import("@/views/discover/discoverChildren/Ranking.vue")
          },
          {
            path: "/discover/singer",
            component: () => import("@/views/discover/discoverChildren/Singer.vue")
          }
        ]
      },
      {
        path: "/video",
        component: () => import("@/views/video/Video.vue")
      },
      {
        path: "/favorites",
        component: () => import("@/views/favorites/Favorites.vue")
      },
      {
        path: "/recommendmusic",
        component: () => import("@/views/recommendmusic/RecommendMusic.vue")
      },
      {
        path: "/musiclistdetail/:id",
        name: "musicListDetail",
        component: () => import("@/views/musicListDetail/MusicListDetail.vue")
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
