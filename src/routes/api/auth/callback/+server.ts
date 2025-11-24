// src/routes/api/auth/callback/+server.ts

import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } from '$env/static/private';
import { redirect, type RequestEvent } from '@sveltejs/kit';
import { dev } from '$app/environment';

export async function GET({ url, cookies }: RequestEvent) {
    const code = url.searchParams.get('code') || null;
    const state = url.searchParams.get('state') || null;
    const storedState = cookies.get('spotify_auth_state');

    if (state === null || state !== storedState) {
        throw redirect(303, '/error?msg=state_mismatch');
    }

    cookies.delete('spotify_auth_state', { path: '/' });

    const authOptions = {
        method: 'POST',
        headers: {
            // L'API de Spotify requiert l'ID et le Secret encodés en base64
            'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            code: code as string,
            redirect_uri: SPOTIFY_REDIRECT_URI,
            grant_type: 'authorization_code'
        }).toString()
    };

    // Endpoint Spotify pour l'échange de code
    const response = await fetch('https://accounts.spotify.com/api/token', authOptions);
    const data = await response.json();

    if (response.ok) {
        const { access_token, refresh_token, expires_in } = data;
        const maxAge = expires_in;

        // Stockage des Tokens dans des cookies sécurisés
        cookies.set('access_token', access_token, { path: '/', httpOnly: true, secure: !dev, sameSite: 'lax', maxAge });
        cookies.set('refresh_token', refresh_token, { path: '/', httpOnly: true, secure: !dev, sameSite: 'lax', maxAge: 365 * 24 * 60 * 60 });

        // Redirection vers la page de statistiques
        throw redirect(303, '/stats');
    } else {
        throw redirect(303, '/error?msg=auth_failed');
    }
}