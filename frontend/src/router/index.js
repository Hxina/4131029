import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import StoryView from '../views/StoryView.vue'
import AboutView from '../views/AboutView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/love/:loveCode',
            name: 'story',
            component: StoryView
        },
        {
            path: '/about',
            name: 'about',
            component: AboutView
        }
    ]
})

export default router