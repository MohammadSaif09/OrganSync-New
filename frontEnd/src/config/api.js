// src/config/api.js
//
// Centralized API configuration.
// Every dashboard was previously hardcoding this string separately —
// now it lives in one place. Update it here if the backend URL changes.

export const API_BASE_URL = "http://localhost:8080/api";

/**
 * authFetch
 * Thin wrapper around fetch() that:
 *  - Prefixes API_BASE_URL
 *  - Attaches an Authorization header when a token is available
 *  - Parses JSON safely (won't throw on empty bodies, e.g. 204 No Content)
 *  - Throws a real Error with a useful message on non-2xx responses,
 *    so callers can use try/catch and show honest error UI instead of
 *    silently treating a failed request as "zero results".
 *
 * @param {string} path - endpoint path, appended to API_BASE_URL (e.g. "/users/123")
 * @param {object} options
 * @param {string} [options.method="GET"]
 * @param {object} [options.body] - will be JSON.stringify'd
 * @param {string} [options.token] - bearer token, usually from useAuth()
 * @param {object} [options.headers]
 */
export async function authFetch(path, options = {}) {
  const { method = "GET", body, token, headers = {}, ...rest } = options;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // Response wasn't JSON — leave data as null, res.ok still checked below.
    }
  }

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request to ${path} failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}