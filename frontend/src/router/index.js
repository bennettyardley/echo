import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Entry from '../views/Entry.vue'
import Artist from '../views/Artist.vue'
import Venue from '../views/Venue.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/entry/:id',
      name: 'entry',
      component: Entry,
    },
    {
      path: '/artist/:artist',
      name: 'artist',
      component: Artist,
    },
    {
      path: '/venue/:venue',
      name: 'venue',
      component: Venue,
    },
  ],
})

export default router
