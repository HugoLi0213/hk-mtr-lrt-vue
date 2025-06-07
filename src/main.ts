import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { createApp } from 'vue';
import App from './App.vue';

// Initialize Vercel Analytics and Speed Insights
inject();
injectSpeedInsights();

createApp(App).mount('#app');
