import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'Entry.html'),
                reservation: resolve(__dirname, 'reservation/restaurant_reservation.html'),
                trial: resolve(__dirname, 'reservation/trial.html'),
                resume: resolve(__dirname, 'resume/index.html'),
                login_success: resolve(__dirname, 'login-success.html'),
                admin_tasks: resolve(__dirname, 'admin/tasks.html')
            },
        },
        outDir: 'dist',
    },
    server: {
        port: 3000,
        open: '/Entry.html'
    }
});
