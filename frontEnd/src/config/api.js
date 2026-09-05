// src/config/api.js

export const API_BASE_URL =
  "http://localhost:8080/api";


/**
 * Central API helper
 *
 * Supports:
 * - GET
 * - POST/PATCH/DELETE JSON
 * - FormData uploads
 * - Optional bearer token
 * - Safe JSON parsing
 * - Useful error messages
 */
export async function authFetch(
  path,
  options = {}
) {
  const {
    method = "GET",
    body,
    token,
    headers = {},
    ...rest
  } = options;


  const isFormData =
    body instanceof FormData;


  const requestHeaders = {
    ...(isFormData
      ? {}
      : {
          "Content-Type":
            "application/json"
        }),

    ...(token
      ? {
          Authorization:
            `Bearer ${token}`
        }
      : {}),

    ...headers
  };


  const response =
    await fetch(
      `${API_BASE_URL}${path}`,
      {
        method,

        headers:
          requestHeaders,

        body:
          body === undefined
            ? undefined
            : isFormData
            ? body
            : JSON.stringify(
                body
              ),

        ...rest
      }
    );


  // ==========================================
  // HANDLE FILE / NON JSON RESPONSES
  // ==========================================

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";


  let data = null;


  if (
    contentType.includes(
      "application/json"
    )
  ) {
    data =
      await response.json();

  } else {
    const text =
      await response.text();

    data =
      text || null;
  }


  // ==========================================
  // ERROR RESPONSE
  // ==========================================

  if (!response.ok) {
    const message =
      (
        typeof data ===
        "object" &&
        data &&
        (
          data.message ||
          data.error
        )
      ) ||
      (
        typeof data ===
          "string" &&
        data
      ) ||
      `Request to ${path} failed (${response.status})`;


    const error =
      new Error(message);


    error.status =
      response.status;


    error.data =
      data;


    throw error;
  }


  return data;
}