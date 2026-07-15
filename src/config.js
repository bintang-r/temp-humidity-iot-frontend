// Automatically determine API base URL
// If VITE_API_BASE_URL is set and not localhost, use it (for real production domains)
// Otherwise, dynamically use the current hostname with port 5000 (for local network / Laragon testing)
let apiBase = import.meta.env.VITE_API_BASE_URL;

// Jika domain mengandung humadity (production), paksa gunakan domain backend production
if (window.location.hostname.includes('humadity')) {
    apiBase = 'https://humaditybck.ryoogenpunggawa.com/api';
} 
// Jika mengakses lewat localhost atau IP lokal (tahap testing)
else if (!apiBase || apiBase.includes('localhost')) {
    apiBase = `${window.location.protocol}//${window.location.hostname}:5000/api`;
}

export const API_BASE = apiBase;
