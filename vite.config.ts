import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import * as dotenv from 'dotenv'; 

export default defineConfig({
    plugins: [sveltekit()],
    server: {
        host: '127.0.0.1' 
    }
});