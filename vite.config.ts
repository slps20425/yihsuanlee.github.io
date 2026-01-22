import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                dashboard: resolve(__dirname, 'dashboard.html'),
                reservation: resolve(__dirname, 'reservation/restaurant_reservation.html'),
                trial: resolve(__dirname, 'reservation/trial.html'),
                resume: resolve(__dirname, 'resume/index.html'),
                login_success: resolve(__dirname, 'login-success.html'),
                admin_tasks: resolve(__dirname, 'admin/tasks.html'),
                mouthpiece: resolve(__dirname, 'reservation/mouthpiece.html'),
                faq: resolve(__dirname, 'faq.html')
            },
        },
        outDir: 'dist',
    },
    server: {
        port: 3000,
        open: '/index.html'
    }
});
