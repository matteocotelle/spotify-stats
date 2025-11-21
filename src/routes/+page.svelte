<script lang="ts">
    import { goto } from '$app/navigation';

    // Lance la redirection vers notre API Route qui elle-même redirige vers Spotify
    const handleLogin = () => {
        goto('/api/auth/login');
    };
</script>

<div class="login-container">
    <h1>Spotify Stats Tracker</h1>
    <p>Visualisez vos artistes et morceaux les plus écoutés de tous les temps.</p>
    
    <button on:click={handleLogin}>
        Se connecter avec Spotify
    </button>
</div>

<style>
    /* Styles pour imiter l'esthétique Spotify */
    :global(body) {
        background-color: #121212;
        color: #fff;
        font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; 
        margin: 0;
    }

    .login-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        text-align: center;
    }
    h1 {
        font-size: 3rem;
        font-weight: 900;
        margin-bottom: 0.5rem;
    }
    p {
        color: #b3b3b3;
        font-size: 1.2rem;
        margin-bottom: 2rem;
    }
    button {
        background-color: #1DB954; /* Vert Spotify */
        color: black;
        border: none;
        padding: 15px 35px;
        font-size: 18px;
        font-weight: bold;
        border-radius: 500px; 
        cursor: pointer;
        transition: transform 0.2s, background-color 0.2s;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    button:hover {
        background-color: #1ed760;
        transform: scale(1.05);
    }
</style>