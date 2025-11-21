<script lang="ts">
    import type { PageData } from './$types';

    export let data: PageData;
    const { topArtists, topAlbums, topTracks, userProfile, error } = data as any; 

    // Constante pour la limite d'affichage initiale
    const DISPLAY_LIMIT = 12;

    // État de l'application
    let activeTab: 'artists' | 'albums' | 'tracks' = 'artists'; 
    
    // 1. Stocker tous les éléments chargés par le serveur (50)
    const allArtists = topArtists;
    const allTracks = topTracks;
    const allAlbums = topAlbums;

    // 2. Variables d'état pour le chargement progressif
    let artistsExpanded = false;
    let tracksExpanded = false;
    let albumsExpanded = false;

    // Fonction d'affichage dynamique (éléments affichés)
    $: displayedArtists = artistsExpanded ? allArtists : allArtists.slice(0, DISPLAY_LIMIT);
    $: displayedTracks = tracksExpanded ? allTracks : allTracks.slice(0, DISPLAY_LIMIT);
    $: displayedAlbums = albumsExpanded ? allAlbums : allAlbums.slice(0, DISPLAY_LIMIT);

    // Fonction pour étendre l'affichage (remplace l'ancien loadMore)
    function expandData(type: 'artists' | 'albums' | 'tracks') {
        if (type === 'artists') {
            artistsExpanded = true;
        } else if (type === 'tracks') {
            tracksExpanded = true;
        } else if (type === 'albums') {
            albumsExpanded = true;
        }
    }

    // Définitions de types pour la cohérence
    interface Image { url: string; height: number; width: number; }
    interface Artist { name: string; images: Image[]; }
    interface Album { albumName: string; albumImage: Image; count: number; artistName: string; }
    interface Track { name: string; album: { name: string, images: Image[] }; artists: { name: string }[]; }

    // Fonction d'affichage générique des cartes (inchangée)
    function renderCard(item: Artist | Album | Track, type: 'artist' | 'album' | 'track') {
        let title: string;
        let subtitle: string;
        let imageUrl: string;
        let images: Image[] | undefined;

        if (type === 'artist') {
            const artist = item as Artist;
            title = artist.name;
            subtitle = 'Artiste';
            images = artist.images;
        } else if (type === 'album') {
            const album = item as Album;
            title = album.albumName;
            subtitle = `${album.artistName} • ${album.count} tracks`;
            imageUrl = album.albumImage?.url || '';
        } else { // type === 'track'
            const track = item as Track;
            title = track.name;
            subtitle = `${track.artists.map(a => a.name).join(', ')} • ${track.album.name}`;
            images = track.album.images;
        }

        if (!imageUrl && images && images.length > 1) {
            imageUrl = images[1].url; 
        } else if (!imageUrl && images && images.length > 0) {
            imageUrl = images[0].url;
        }
        
        return { title, subtitle, imageUrl };
    }

    const profileImage = userProfile.images?.[0]?.url;
</script>

<div class="stats-page">
    <header class="header">
        <div class="user-profile">
            {#if profileImage}
                <img src={profileImage} alt="Profile" class="profile-img" />
            {/if}
            <span class="user-name">{userProfile.display_name || 'Utilisateur Spotify'}</span>
        </div>
        
        <a href="/api/auth/logout" class="logout-btn">Déconnexion</a>
    </header>

    <h1 class="title">Vos Statistiques All-Time</h1>

    {#if error}
        <div class="error-message">{error}</div>
    {:else}
        <div class="tabs-container">
            <button class="tab-btn" class:active={activeTab === 'artists'} on:click={() => activeTab = 'artists'}>
                🏆 Top Artistes 
            </button>
            <button class="tab-btn" class:active={activeTab === 'tracks'} on:click={() => activeTab = 'tracks'}>
                🎵 Top Morceaux 
            </button>
            <button class="tab-btn" class:active={activeTab === 'albums'} on:click={() => activeTab = 'albums'}>
                💿 Top Albums 
            </button>
        </div>

        <div class="content-container">
            {#if activeTab === 'artists'}
                <section class="section">
                    <div class="card-grid">
                        {#each displayedArtists as artist}
                            {@const card = renderCard(artist as Artist, 'artist')}
                            <div class="card">
                                <img src={card.imageUrl} alt={card.title} class="card-image artist-img" />
                                <div class="card-content">
                                    <span class="card-subtitle">{card.subtitle}</span>
                                    <h3 class="card-title">{card.title}</h3>
                                </div>
                            </div>
                        {/each}
                    </div>
                    
                    {#if !artistsExpanded && allArtists.length > DISPLAY_LIMIT}
                        <div class="expand-container">
                            <button class="expand-btn" on:click={() => expandData('artists')}>
                                +
                            </button>
                        </div>
                    {/if}
                </section>
            {/if}

            {#if activeTab === 'tracks'}
                <section class="section">
                    <div class="card-grid">
                        {#each displayedTracks as track}
                            {@const card = renderCard(track as Track, 'track')}
                            <div class="card">
                                <img src={card.imageUrl} alt={card.title} class="card-image" />
                                <div class="card-content">
                                    <span class="card-subtitle">{card.subtitle}</span>
                                    <h3 class="card-title">{card.title}</h3>
                                </div>
                            </div>
                        {/each}
                    </div>
                    
                    {#if !tracksExpanded && allTracks.length > DISPLAY_LIMIT}
                         <div class="expand-container">
                            <button class="expand-btn" on:click={() => expandData('tracks')}>
                                +
                            </button>
                        </div>
                    {/if}
                </section>
            {/if}

            {#if activeTab === 'albums'}
                <section class="section">
                    <div class="card-grid">
                        {#each displayedAlbums as album}
                            {@const card = renderCard(album as Album, 'album')}
                            <div class="card">
                                <img src={card.imageUrl} alt={card.title} class="card-image" />
                                <div class="card-content">
                                    <span class="card-subtitle">{card.subtitle}</span>
                                    <h3 class="card-title">{card.title}</h3>
                                </div>
                            </div>
                        {/each}
                    </div>
                    
                    {#if !albumsExpanded && allAlbums.length > DISPLAY_LIMIT}
                         <div class="expand-container">
                            <button class="expand-btn" on:click={() => expandData('albums')}>
                                +
                            </button>
                        </div>
                    {/if}
                </section>
            {/if}
        </div>
    {/if}
</div>

<style>
    /* Styles généraux */
    :global(body) {
        background-color: #121212;
        color: #fff;
        font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
        margin: 0;
    }
    .stats-page {
        padding: 20px 40px;
        min-height: 100vh;
    }
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    /* ... (Styles du profil utilisateur et navigation à onglets) ... */
    .user-profile {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1.2rem;
        font-weight: 700;
        color: #fff;
    }
    .profile-img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
    }
    .title {
        font-size: 2.5rem;
        font-weight: 900;
        color: #fff;
        margin-bottom: 30px;
    }
    .tabs-container {
        display: flex;
        gap: 15px;
        margin-bottom: 30px;
        border-bottom: 2px solid #282828;
        padding-bottom: 5px;
    }
    .tab-btn {
        background: none;
        border: none;
        color: #b3b3b3;
        font-size: 1.1rem;
        font-weight: 700;
        cursor: pointer;
        padding: 10px 0;
        transition: color 0.2s, border-color 0.2s;
        border-bottom: 3px solid transparent;
    }
    .tab-btn.active {
        color: #1DB954;
        border-bottom-color: #1DB954;
    }

    /* 🚨 NOUVEAUX STYLES POUR LE BOUTON ROND '+' */
    .expand-container {
        display: flex;
        justify-content: center;
        margin: 20px 0 40px 0;
    }
    .expand-btn {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background-color: #282828; /* Couleur sombre */
        color: #fff;
        border: none;
        font-size: 28px;
        line-height: 48px;
        text-align: center;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
        transition: background-color 0.2s, transform 0.2s, color 0.2s;
        padding: 0;
    }
    .expand-btn:hover {
        background-color: #1DB954; /* Vert Spotify au survol */
        color: #fff;
        transform: scale(1.05);
    }
    
    /* Styles des cartes */
    .card-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
    }
    .card {
        background-color: #181818;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
        transition: background-color 0.2s;
        cursor: pointer;
    }
    .card-image {
        width: 100%; 
        aspect-ratio: 1 / 1; 
        object-fit: cover;
        margin-bottom: 10px;
    }
    .artist-img {
        border-radius: 50%;
    }
    .card-title {
        font-size: 1rem;
        font-weight: 700;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #fff;
    }
    .card-subtitle {
        font-size: 0.8rem;
        color: #b3b3b3;
        margin-top: 4px;
    }
    .logout-btn {
        background: none;
        color: #b3b3b3;
        text-decoration: none;
        padding: 8px 15px;
        border: 1px solid #b3b3b3;
        border-radius: 500px;
        transition: all 0.2s;
        font-weight: 700;
    }
    .logout-btn:hover {
        color: #fff;
        border-color: #fff;
    }
</style>