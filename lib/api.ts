// silkpanda/momentum-mobile/momentum-mobile-15b59c26f6ccaf50749d72d04c8e30b0a6821e20/lib/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IHousehold, ISession } from "./types";
import { API_URL } from "../utils/config";

const API_BASE_URL = "https://unthirsting-soritic-raymonde.ngrok-free.dev";

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
    const url = `${API_BASE_URL}/api/v1${endpoint}`;
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
          // API sends errors in { status: 'fail', message: '...' }
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

      // Return the FULL JSON response.
      // The login/signup functions need this to get the top-level 'token'.
      // The swrFetcher (below) will handle unwrapping the 'data' property.
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
 *
 * --- THIS IS THE FIX ---
 *
 * This function intercepts all SWR data requests.
 * It calls api.get(), which returns the full JSend response:
 * { status: 'success', data: { ... } }
 *
 * This fetcher unwraps that envelope and returns *only* the 'data'
 * object to SWR, which is what our hooks (useSession, useHousehold) expect.
 */
export const swrFetcher = async (endpoint: string) => {
  // api.get() will return the full JSend object, e.g., { status: 'success', data: ... }
  const response: any = await api.get(endpoint);

  // If it's a successful JSend response, unwrap it and return the data.
  if (response && response.status === 'success' && typeof response.data !== 'undefined') {
    return response.data;
  }
  
  // If the response is NOT a JSend object (which shouldn't happen for GETs),
  // or if 'data' is missing, return the whole thing.
  return response;
};