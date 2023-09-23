import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Entry from '../views/Entry.vue'

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
  ],
})

export default router
