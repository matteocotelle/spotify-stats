// src/routes/stats/+page.server.ts

import { redirect, type ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ fetch, locals }) => {
    if (!locals.accessToken) {
        throw redirect(302, '/');
    }

    const response = await fetch('/api/stats');
    
    if (response.status === 401) {
        throw redirect(302, '/'); 
    }

    if (!response.ok) {
        const data = await response.json();
        return { 
            error: data.error || 'Impossible de charger les statistiques.',
            userProfile: {},
            topArtists: [],
            topTracks: [],
            topAlbums: [],
            // 🚨 FETCH N'EST PLUS TRANSMIS ICI (CORRECTION)
        };
    }

    const data = await response.json();

    return {
        userProfile: data.userProfile,
        topArtists: data.topArtists,
        topTracks: data.topTracks,
        topAlbums: data.topAlbums,
        // 🚨 FETCH N'EST PLUS TRANSMIS ICI (CORRECTION)
    };
};