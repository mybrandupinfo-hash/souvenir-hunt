// Example frontend calls for your slide-based UI.
// This file is not imported automatically. It is here as a beginner-friendly reference.

const ACCESS_KEY_STORAGE = "souvenir-hunt-access-key";

export function readAccessKeyFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("key");
}

export function storeAccessKey(accessKey) {
  window.localStorage.setItem(ACCESS_KEY_STORAGE, accessKey);
}

export function getStoredAccessKey() {
  return window.localStorage.getItem(ACCESS_KEY_STORAGE);
}

export async function resumeGame(accessKey) {
  const response = await fetch("/resume", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accessKey }),
  });

  if (!response.ok) {
    throw new Error("Unable to resume game session.");
  }

  return response.json();
}

export async function submitAnswer(accessKey, answer) {
  const response = await fetch("/answer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accessKey, answer }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Answer rejected.");
  }

  return data;
}

export async function fetchSlide(index) {
  const response = await fetch(`/slide/${index}`);
  if (!response.ok) {
    throw new Error("Unable to load slide.");
  }

  return response.json();
}

export function getProgressPercent(currentSlide, totalSlides) {
  return ((currentSlide + 1) / totalSlides) * 100;
}
