import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/Monitor'
    },
    {
      path: '/Home',
      name: 'Home',
      meta: {
        title: '首页',
        Name: 'Home'
      },
      component: () => import(/* webpackChunkName: "Home" */ './views/Home.vue'),
      children: [
        {
          path: '',
          name: 'index',
          meta: {
            title: '首页',
            Name: 'Home'
          },
          component: () => import(/* webpackChunkName: "Home" */ './views/index.vue')
        },
        {
          path: '/Monitor',
          name: 'Monitor',
          redirect: '/Monitor/LivePreview',
          meta: {
            title: '监控中心',
            Name: 'Monitor'
          },
          children: [
            {
              path: 'LivePreview',
              name: 'LivePreview',
              meta: {
                title: '监控中心',
                keepAlive: true,
                Name: 'Monitor'
              },
              components: {
                LivePreview: () => import(/* webpackChunkName: "Monitor" */ './views/Monitor/LivePreview.vue')
              }
            },
            {
              path: 'VideoPlayback',
              name: 'VideoPlayback',
              meta: {
                title: '录像回放',
                Name: 'Monitor'
              },
              components: {
                VideoPlayback: () => import(/* webpackChunkName: "Monitor" */ './views/Monitor/VideoPlayback.vue')
              }
            }
          ],
          component: () => import(/* webpackChunkName: "Monitor" */ './views/Monitor.vue')
        }
      ]
    }
  ]
})
