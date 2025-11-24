// src/routes/api/auth/logout/+server.ts
import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export function GET({ cookies }: RequestEvent) {
    // 1. Supprimer les cookies d'authentification
    // Il est important de spécifier le path '/' car c'est là qu'ils ont été créés
    cookies.delete('access_token', { path: '/' });
    cookies.delete('refresh_token', { path: '/' });
    cookies.delete('spotify_auth_state', { path: '/' });

    // 2. Rediriger l'utilisateur vers la page d'accueil (ou la page de login)
    throw redirect(303, '/');
}