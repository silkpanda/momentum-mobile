// silkpanda/momentum-mobile/momentum-mobile-a483d2d53d1f991b30c6e3ed537ec9950d1fafa4/lib/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IHousehold, ISession } from "./types"; // <-- Path updated

// !!! IMPORTANT !!!
// THIS IS LIKELY THE SOURCE OF YOUR NETWORK ERROR
//
// If running on an Android Emulator, use:
// const API_BASE_URL = "http://10.0.2.2:3000";
//
// If running on a Physical Device, find your computer's Network IP (e.g., 192.168.1.100):
// const API_BASE_URL = "http://192.168.1.100:3000";
//
// 'localhost' WILL NOT WORK.
const API_BASE_URL = "http://10.0.2.2:3000"; // <-- FIX: Update this!

// Custom error class for API failures
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * The core API fetcher function.
 * Handles adding auth token and parsing JSON response.
 */
const api = {
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, "GET");
  },

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, "POST", body);
  },
  
  // Add put, patch, delete as needed

  async request<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    body?: unknown
  ): Promise<T> {
    const url = `${API_BASE_URL}/api${endpoint}`;
    const token = await AsyncStorage.getItem("authToken");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = "An API error occurred";
        try {
          const errorBody = await response.json();
          errorMessage = errorBody.message || errorMessage;
        } catch (e) {
          // Ignore, just use the default message
        }
        throw new ApiError(errorMessage, response.status);
      }

      // Handle "No Content" responses
      if (response.status === 204) {
        return null as T;
      }

      return response.json() as Promise<T>;

    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      } else {
        // Handle network errors
        console.error("Network or fetch error:", err);
        throw new ApiError("A network error occurred.", 0);
      }
    }
  },
};

export default api;

/**
 * A simple fetcher function for SWR.
 * SWR will call this with the endpoint (which is the key).
 */
export const swrFetcher = async (endpoint: string) => {
  return api.get(endpoint);
};