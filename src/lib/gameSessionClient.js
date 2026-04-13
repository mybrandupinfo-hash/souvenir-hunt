const ACCESS_KEY_STORAGE = "souvenir-hunt-access-key";

export function getAccessKeyFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("key");
}

export function saveAccessKey(accessKey) {
  if (!accessKey) return;
  window.localStorage.setItem(ACCESS_KEY_STORAGE, accessKey);
}

export function getSavedAccessKey() {
  return window.localStorage.getItem(ACCESS_KEY_STORAGE);
}

export async function resumeSession(accessKey) {
  const response = await fetch("/resume", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accessKey }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Unable to resume session.");
  }

  return data;
}

export async function submitSessionAnswer(accessKey, answer) {
  const response = await fetch("/answer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accessKey, answer }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Unable to submit answer.");
  }

  return data;
}

export async function fetchSlideData(index) {
  const response = await fetch(`/slide/${index}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load slide.");
  }

  return data;
}
