import type { BlockedUrl, Settings } from "$lib/urlController.svelte";
import { trimUrl } from "$lib/utils";
function isEnabled(settings: Settings) {
  if (!settings.enabled) {
    return false;
  }
  const now = new Date();
  const hour = now.getHours();
  if (hour < settings.workHour.start || hour > settings.workHour.end) {
    return false;
  }
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  if (isWeekend && !settings.blockOnWeekends) {
    return false;
  }

  return true;
}
chrome.webNavigation.onBeforeNavigate.addListener(async function (details) {
  const { url, tabId } = details;
  
  if (url === "about:blank") return;
  
  const trimmedUrl = trimUrl(url, "url");

  const [p, s] = await Promise.all([
    chrome.storage.sync.get("pages"),
    chrome.storage.sync.get("settings"),
  ]);
  if (!p || !p.pages || !s || !s.settings) {
    return;
  }
  const pages: BlockedUrl[] = Object.values(p.pages);
  const settings: Settings = s.settings;
  if (!isEnabled(settings)) {
    return;
  }

  const startsWithPages = pages.filter((page: BlockedUrl) =>
    page.url.endsWith("*")
  );
  const isValidUrl =
    pages.filter((page: BlockedUrl) => page.url === trimmedUrl).length === 0 &&
    startsWithPages.filter((page: BlockedUrl) =>
      trimmedUrl.startsWith(page.url.slice(0, -1))
    ).length === 0;

  console.log("Trimmed url", trimmedUrl);
  console.log("Pages", pages);
  console.log("Starts with pages", startsWithPages);
  console.log("Is valid url", isValidUrl);

  if (isValidUrl) {
    return;
  }

  chrome.tabs.update(tabId, {
    url: "https://tivoku.com/website-blocker/blocked",
  });
});
