// src/routes/api/auth/login/+server.ts

import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } from '$env/static/private';
import { json, type RequestEvent} from '@sveltejs/kit';

const scopes = 'user-top-read';

const generateRandomString = (length: number) => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

export function GET({ cookies }: RequestEvent) {
    const state = generateRandomString(16);

    cookies.set('spotify_auth_state', state, { 
        path: '/', 
        httpOnly: true, 
        secure: false, 
        maxAge: 3600 
    });

    const url = new URL('https://accounts.spotify.com/authorize');
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('client_id', SPOTIFY_CLIENT_ID);
    url.searchParams.append('scope', scopes);
    url.searchParams.append('redirect_uri', SPOTIFY_REDIRECT_URI);
    url.searchParams.append('state', state);
    url.searchParams.append('show_dialog', 'true'); // false pour ne pas avoir la confirmation lors de la connexion

    // Redirection vers l'URL d'autorisation de Spotify
    return new Response(null, {
        status: 302,
        headers: {
            Location: url.toString()
        }
    });
}