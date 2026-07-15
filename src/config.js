// Automatically determine API base URL
// If VITE_API_BASE_URL is set and not localhost, use it (for real production domains)
// Otherwise, dynamically use the current hostname with port 5000 (for local network / Laragon testing)
let apiBase = import.meta.env.VITE_API_BASE_URL;

if (!apiBase || apiBase.includes('localhost')) {
    apiBase = `${window.location.protocol}//${window.location.hostname}:5000/api`;
}

export const API_BASE = apiBase;
