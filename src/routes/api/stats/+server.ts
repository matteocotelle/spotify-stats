// src/routes/api/stats/+server.ts

import { json, type RequestEvent } from '@sveltejs/kit';

// Définitions de types étendues
interface Image {
    url: string;
    height: number;
    width: number;
}

interface Artist {
    name: string;
    id: string;
}

interface Item {
    id: string;
    name: string;
    images?: Image[]; 
    album?: { images: Image[], name: string, id: string };
    artists: Artist[];
}

interface SpotifyTopResponse {
    items: Item[];
}

interface UserProfile {
    display_name: string;
    images: Image[];
    id: string;
}

// 🚨 La limite maximale permise par l'API Spotify est 50. Nous utilisons cette limite pour la requête initiale.
const INITIAL_LIMIT = 50; 
const TIME_RANGE = 'long_term';

export async function GET({ locals }: RequestEvent) {
    const accessToken = locals.accessToken;

    if (!accessToken) {
        return json({ error: 'Not authenticated' }, { status: 401 });
    }

    const headers = {
        'Authorization': `Bearer ${accessToken}`
    };

    try {
        // --- Requête 1: Infos Profil (/me) ---
        // ⚠️ REMPLACEZ CETTE URL PAR LE VRAI ENDPOINT SPOTIFY /me
        const profileResponse = await fetch('https://api.spotify.com/v1/me', { headers }); 
        
        if (!profileResponse.ok) {
            console.error("Erreur Spotify (Profil - Status:", profileResponse.status, ")");
            return json({ error: 'Spotify API error or invalid token (Profile)' }, { status: profileResponse.status });
        }
        const userProfile: UserProfile = await profileResponse.json();

        // --- Requête 2: Top Artistes (Limite: 50) ---
        // ⚠️ REMPLACEZ CETTE URL PAR LE VRAI ENDPOINT SPOTIFY /top/artists
        const artistsUrl = new URL('https://api.spotify.com/v1/me/top/artists'); 
        artistsUrl.searchParams.append('limit', INITIAL_LIMIT.toString()); // CHARGE LES 50
        artistsUrl.searchParams.append('time_range', TIME_RANGE); 

        const artistsResponse = await fetch(artistsUrl.toString(), { headers });
        if (!artistsResponse.ok) {
            console.error("Erreur Spotify (Artistes - Status:", artistsResponse.status, ")");
            return json({ error: 'Spotify API error or invalid token (Artists)' }, { status: artistsResponse.status });
        }
        const topArtists: SpotifyTopResponse = await artistsResponse.json();

        // --- Requête 3: Top Tracks (morceaux - Limite: 50) ---
        // ⚠️ REMPLACEZ CETTE URL PAR LE VRAI ENDPOINT SPOTIFY /top/tracks
        const tracksUrl = new URL('https://api.spotify.com/v1/me/top/tracks');
        tracksUrl.searchParams.append('limit', INITIAL_LIMIT.toString()); // CHARGE LES 50
        tracksUrl.searchParams.append('time_range', TIME_RANGE);

        const tracksResponse = await fetch(tracksUrl.toString(), { headers });
        if (!tracksResponse.ok) {
            console.error("Erreur Spotify (Tracks - Status:", tracksResponse.status, ")");
            return json({ error: 'Spotify API error or invalid token (Tracks)' }, { status: tracksResponse.status });
        }
        const topTracks: SpotifyTopResponse = await tracksResponse.json();

        // --- Logique Top Albums (déduction des 50 premiers tracks) ---
        // Utilisation des données de tracks déjà chargées (topTracks.items)
        const albumCounts = new Map<string, { count: number, albumName: string, albumImage: Image, artistName: string }>();

        topTracks.items.forEach(track => {
            if (track.album && track.artists.length > 0) {
                const albumId = track.album.id; 
                const artistName = track.artists[0].name;

                const currentCount = albumCounts.get(albumId)?.count || 0;
                
                albumCounts.set(albumId, {
                    count: currentCount + 1,
                    albumName: track.album.name,
                    albumImage: track.album.images[0],
                    artistName: artistName
                });
            }
        });

        // Les Top Albums sont déduits et limités à 50
        const topAlbums = Array.from(albumCounts.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, INITIAL_LIMIT); 

        return json({
            userProfile: userProfile,
            topArtists: topArtists.items,
            topTracks: topTracks.items,
            topAlbums: topAlbums,
        });

    } catch (e) {
        console.error('Erreur inattendue lors de la récupération des données Spotify :', e);
        return json({ error: 'Internal server error during data fetching' }, { status: 500 });
    }
}