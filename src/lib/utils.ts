import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
// Utility function to merge class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// Generate avatar URL based on name and gender
export function generateAvatar(name: string, gender: "MALE" | "FEMALE") {
  const username = name.replace(/\s+/g, "").toLowerCase();
  const base = "https://avatar.iran.liara.run/public";
  if (gender === "FEMALE") {
    return `${base}/girl?name=${username}`;
  }
  return `${base}/boy?name=${username}`;
}

export const formatPhoneNumber = (value: string) => {
  if (!value) return value;

  // Remove all non-digit characters, but keep '+' if it’s the first character
  let phone = value.replace(/[^\d+]/g, "");

  // Handle cases where number starts with +92 or 92
  if (phone.startsWith("+92")) {
    const digits = phone.slice(3);
    return `+92 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(
      6,
      10
    )}`.trim();
  }

  if (phone.startsWith("92")) {
    const digits = phone.slice(2);
    return `+92 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(
      6,
      10
    )}`.trim();
  }

  // Handle local format (e.g. 03XXXXXXXXX)
  if (phone.startsWith("03")) {
    return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(
      7,
      11
    )}`.trim();
  }

  // Default fallback (unrecognized pattern)
  return phone;
};
