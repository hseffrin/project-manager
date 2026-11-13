// "Apenas Favoritos" filter of the project gallery: ?favoritos=1 in the URL.
// Used on the server (query) and in the browser (toolbar switch).
const FAVORITES_PARAM = "favoritos";

// Only "1" turns the filter on; any other value means all projects.
const parseFavoritesOnly = (value: unknown): boolean => value === "1";

export { FAVORITES_PARAM, parseFavoritesOnly };
