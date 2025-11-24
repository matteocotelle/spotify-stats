<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    const handleLogin = () => {
        goto('/api/auth/login');
    };

    // --- Configuration de l'effet ---
    // Palette de couleurs Spotify et variantes sombres
    const colors = [
        'rgb(29, 185, 84)',   // Spotify Green
        'rgb(30, 215, 96)',   // Light Green
        'rgb(20, 80, 40)',    // Dark Forest Green
        'rgb(10, 40, 20)',    // Almost Black Green
        'rgb(29, 185, 84)',   // Repeat Main for dominance
        'rgb(40, 60, 50)'     // Desaturated dark green
    ];

    // On génère 25 rayons avec des propriétés aléatoires
    // Cela remplace la boucle SCSS @for $i from 1 through 25
    const beamCount = 25;
    const animationTime = 150; // secondes

    let beams = [];

    // Fonction pour mélanger un tableau (pour avoir des ordres de couleurs aléatoires)
    const shuffle = (array) => array.sort(() => 0.5 - Math.random());

    // Génération des données côté JS
    for (let i = 0; i < beamCount; i++) {
        const shuffledColors = shuffle([...colors]);
        beams.push({
            id: i,
            // Délai négatif pour que l'animation soit déjà en cours au chargement
            delay: - (i / beamCount) * animationTime,
            // Légère variation de durée pour éviter l'effet "robotique"
            duration: animationTime - (animationTime / beamCount / 2 * i),
            c1: shuffledColors[0],
            c2: shuffledColors[1],
            c3: shuffledColors[2]
        });
    }

    let mounted = false;
    onMount(() => {
        mounted = true;
    });
</script>

<div class="background-fx">
    {#each beams as beam}
        <div 
            class="rainbow" 
            style="
                --delay: {beam.delay}s; 
                --duration: {beam.duration}s;
                --c1: {beam.c1};
                --c2: {beam.c2};
                --c3: {beam.c3};
            "
        ></div>
    {/each}
    
    <div class="vignette-h"></div>
    <div class="vignette-v"></div>
</div>

<main class:mounted>
    <div class="content-wrapper">
        <h1>Spotify Stats</h1>
        <p>Visualisez vos artistes et morceaux les plus écoutés.</p>
        
        <button on:click={handleLogin}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Se connecter avec Spotify
        </button>
    </div>
</main>

<style>
    :global(body) {
        background-color: #000; /* Fond noir profond */
        color: #fff;
        font-family: 'Inter', sans-serif;
        margin: 0;
        overflow: hidden;
    }

    /* --- Le Conteneur d'effets --- */
    .background-fx {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: -1; /* Derrière le contenu */
        background: #000;
        overflow: hidden;
    }

    /* --- L'adaptation du code SCSS "Rainbow" --- */
    .rainbow {
        height: 100vh;
        width: 0; /* Important: la couleur vient du box-shadow, pas du width */
        top: 0;
        position: absolute;
        transform: rotate(10deg); /* L'angle des faisceaux */
        transform-origin: top right;
        opacity: 0.5; /* On rend le tout plus subtil pour ne pas éblouir */
        
        /* Construction de l'ombre portée complexe :
           1. Ombre externe gauche (Noir pour fondre)
           2. Couleur 1
           3. Couleur 2
           4. Couleur 3
           5. Ombre externe droite (Noir pour fondre)
        */
        box-shadow: 
            -130px 0 80px 40px #000, 
            -50px 0 50px 25px var(--c1),
            0 0 50px 25px var(--c2), 
            50px 0 50px 25px var(--c3),
            130px 0 80px 40px #000;

        animation: slide linear infinite;
        animation-duration: var(--duration);
        animation-delay: var(--delay);
        
        /* Optimisation perf */
        will-change: right; 
    }

    @keyframes slide {
        from {
            right: -40vw; /* Départ hors écran à droite (vu qu'on regarde vers la gauche) */
        }
        to {
            right: 140vw; /* Fin hors écran à gauche */
        }
    }

    /* --- Les vignettes (Overlay) --- */
    /* Elles servent à assombrir les bords haut/bas/gauche pour donner de la profondeur */
    
    /* Vignette Horizontale (Haut/Bas) */
    .vignette-h {
        box-shadow: 0 0 50vh 40vh #000; /* Ombre NOIRE au lieu de blanche */
        width: 100vw;
        height: 0;
        bottom: 0;
        left: 0;
        position: absolute;
        z-index: 1;
    }

    /* Vignette Verticale (Gauche) */
    .vignette-v {
        box-shadow: 0 0 35vw 25vw #000; /* Ombre NOIRE */
        width: 0;
        height: 100vh;
        bottom: 0;
        left: 0;
        position: absolute;
        z-index: 1;
    }


    /* --- Styles du contenu (UI) --- */
    main {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 10;
        opacity: 0;
        transition: opacity 1s ease;
    }
    main.mounted {
        opacity: 1;
    }

    .content-wrapper {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
    }

    h1 {
        font-size: 4rem;
        font-weight: 900;
        margin: 0;
        letter-spacing: -2px;
        /* Petit effet glass sur le texte pour qu'il ressorte */
        text-shadow: 0 4px 30px rgba(0,0,0,0.5);
    }

    p {
        color: #b3b3b3;
        font-size: 1.2rem;
        max-width: 500px;
        margin: 0;
        line-height: 1.5;
    }

    button {
        background-color: #1DB954;
        color: black;
        border: none;
        padding: 16px 32px;
        font-size: 1rem;
        font-weight: 700;
        border-radius: 500px;
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 1px;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: transform 0.2s, background-color 0.2s, box-shadow 0.2s;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }

    button:hover {
        background-color: #1ed760;
        transform: scale(1.05);
        box-shadow: 0 8px 30px rgba(29, 185, 84, 0.4);
    }
</style>