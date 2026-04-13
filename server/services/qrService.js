import QRCode from "qrcode";

export async function createQrCodeDataUrl(url) {
  return QRCode.toDataURL(url, {
    margin: 1,
    width: 320,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });
}
