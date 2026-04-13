const code = new URLSearchParams(window.location.search).get("code") || "";

const statusBox = document.getElementById("statusBox");
const statusText = document.getElementById("statusText");
const codeValue = document.getElementById("codeValue");
const messageValue = document.getElementById("messageValue");
const redeemForm = document.getElementById("redeemForm");
const staffPinInput = document.getElementById("staffPin");
const resultText = document.getElementById("resultText");
const confirmButton = document.getElementById("confirmButton");
const successPanel = document.getElementById("successPanel");

codeValue.textContent = code || "-";

function updateStatus(status, message) {
  const visualStatus = status === "used" ? "confirmed" : status;
  statusBox.className = `status-box status-${visualStatus}`;
  statusText.textContent = status === "used" ? "CONFIRMED" : status.toUpperCase();
  messageValue.textContent = message;
  redeemForm.hidden = status === "used";
  successPanel.hidden = status !== "used";
}

async function loadStatus() {
  if (!code) {
    updateStatus("invalid", "No code provided.");
    confirmButton.disabled = true;
    return;
  }

  const response = await fetch(`/redeem-status?code=${encodeURIComponent(code)}`);
  const data = await response.json();

  updateStatus(data.status, data.message);
  confirmButton.disabled = data.status !== "valid";
}

redeemForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!code) return;

  confirmButton.disabled = true;
  resultText.textContent = "Confirming pickup...";

  const response = await fetch("/redeem", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      staff_pin: staffPinInput.value,
    }),
  });

  const data = await response.json();

  resultText.textContent = data.message;
  if (response.ok) {
    updateStatus("used", "Pickup already confirmed on this device.");
    resultText.textContent = "Pickup confirmed successfully.";
    return;
  }

  await loadStatus();
});

loadStatus().catch((error) => {
  console.error(error);
  updateStatus("invalid", "Unable to check this code right now.");
  confirmButton.disabled = true;
});
