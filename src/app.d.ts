// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			accessToken: string | undefined; // Ajout du token pour un accès facile
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
