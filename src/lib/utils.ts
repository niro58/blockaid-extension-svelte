import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { BlockedUrl } from "./urlController.svelte";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const URL_ALLOWED_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789-./";
export function trimUrl(url: string, type: "url" | "domain" | "starts-with") {
  url = url.toLowerCase();
  url = url.replace("https://", "").replace("http://", "").replace("www.", "");
  if (type === "domain") {
    url = url.split("/")[0];
  }
  url = url.split("?")[0];
  if (type === "starts-with" || type === "domain") {
    if (!url.endsWith("/")) {
      url += "/";
    }
    url += "*";
  }
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  return url;
}
export function isValidUrl(url: string, existingWebsites: BlockedUrl[]) {
  if (
    url.split("").some((c) => !URL_ALLOWED_CHARS.includes(c)) &&
    !url.endsWith("*")
  ) {
    return "Invalid characters in URL";
  }
  if (url.startsWith("tivoku.com")) {
    return "You can't block the website blocker :)";
  }

  if (existingWebsites.filter((w) => w.url === url).length > 0) {
    return "Website is already in the list";
  }

  return true;
}

export function minutesToTime(minutes: number) {
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}
