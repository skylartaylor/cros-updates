import fetch from "node-fetch";

const DEFAULT_HEADERS = {
  Accept: "application/json",
};

export async function fetchJSON(url, errorMessage) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: DEFAULT_HEADERS,
    });

    if (!response.ok) {
      console.error(`${errorMessage}: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return null;
  }
}
