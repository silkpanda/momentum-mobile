/**
 * 🚧 DEV CONFIGURATION (PHASE 1/2 BYPASS) 🚧
 * * Since we haven't built the Login Screen (Phase 3) yet, we use this file
 * to hardcode valid credentials. This allows us to develop the Kiosk View (Phase 2)
 * without being blocked by authentication errors.
 * * INSTRUCTIONS:
 * 1. Run your momentum-api (Core) locally.
 * 2. Use Postman/Curl to login as a Parent: POST http://localhost:3000/api/v1/auth/login
 * 3. Copy the 'token' from the response into TEMP_AUTH_TOKEN below.
 * 4. Copy the 'household._id' from the response into TEMP_HOUSEHOLD_ID below.
 */

export const DEV_CONFIG = {
  // Toggle this to false when we implement real Auth in Phase 3
  USE_DEV_BYPASS: true,

  // REPLACE THIS with a valid ObjectId from your MongoDB 'households' collection
  TEMP_HOUSEHOLD_ID: 'REPLACE_WITH_VALID_HOUSEHOLD_ID', 

  // REPLACE THIS with a valid JWT from a login response
  // Must start with "Bearer "
  TEMP_AUTH_TOKEN: 'Bearer REPLACE_WITH_YOUR_JWT_TOKEN',
};