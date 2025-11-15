// --- THIS IS THE CRITICAL V4 CHANGE (Step 3.2) ---
// The mobile app MUST talk to the BFF, not the API directly.
// We are changing the port from 3001 (API) to 3002 (BFF).
export const API_BASE_URL = 'http://localhost:3002';
// --- END OF CHANGE ---

// You can export other global config variables here