// src/hooks.server.ts

import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '$env/static/private';
import type { Handle } from '@sveltejs/kit';

// Fonction utilitaire pour rafraîchir le token
async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string, expires_in: number }> {
    const authOptions = {
        method: 'POST',
        headers: {
            // L'API de Spotify requiert l'ID et le Secret encodés en base64
            'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        }).toString()
    };

    // Endpoint Spotify pour le Refresh Token
    const response = await fetch('https://accounts.spotify.com/api/token', authOptions);
    const data = await response.json();

    if (!response.ok) {
        throw new Error('Failed to refresh token');
    }

    return {
        access_token: data.access_token,
        expires_in: data.expires_in
    };
}

export const handle: Handle = async ({ event, resolve }) => {
    let accessToken = event.cookies.get('access_token');
    const refreshToken = event.cookies.get('refresh_token');

    // 1. L'utilisateur n'est pas connecté ou les tokens sont absents
    if (!accessToken && !refreshToken) {
        event.locals.accessToken = undefined;
        return resolve(event);
    }

    // 2. Token expiré, tentative de rafraîchissement
    if (!accessToken && refreshToken) {
        try {
            const refreshResult = await refreshAccessToken(refreshToken);
            
            accessToken = refreshResult.access_token;
            const maxAge = refreshResult.expires_in;

            // Mise à jour de l'Access Token
            event.cookies.set('access_token', accessToken, {
                path: '/',
                httpOnly: true,
                secure: false, // Mettre à true si vous utilisez HTTPS
                maxAge: maxAge
            });

        } catch (error) {
            console.error('Erreur lors du rafraîchissement du token:', error);
            // Échec du rafraîchissement: effacer les cookies pour forcer la reconnexion
            event.cookies.delete('access_token', { path: '/' });
            event.cookies.delete('refresh_token', { path: '/' });
            event.locals.accessToken = undefined;
            return resolve(event);
        }
    }

    // 3. Attacher le token (valide ou nouvellement rafraîchi) à 'locals'
    event.locals.accessToken = accessToken;

    return resolve(event);
};