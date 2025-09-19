import type { BlockedUrl, Settings } from "$lib/urlController.svelte";
import { trimUrl } from "$lib/utils";
function isBlockingActive(settings: Settings) {
  if (!settings.enabled) {
    return false;
  }
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hour * 60 + minutes;
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const isWorkHour =
    totalMinutes >= settings.workHour.start &&
    totalMinutes <= settings.workHour.end;

  if (isWorkHour) {
    if (isWeekend && settings.blockOnWeekends) {
      return true;
    } else if (!isWeekend) {
      return true;
    }
  }

  return false;
}


async function shouldBlockUrl(url: string): Promise<boolean> {
  const [p, s] = await Promise.all([
    chrome.storage.sync.get("pages"),
    chrome.storage.sync.get("settings"),
  ]);

  if (!p || !p.pages || !s || !s.settings) {
    return false;
  }

  const pages: BlockedUrl[] = Object.values(p.pages);
  const settings: Settings = s.settings;

  if (!isBlockingActive(settings)) {
    return false;
  }

  const trimmedUrl = trimUrl(url, "url");
  // Check exact URL matches
  const exactMatch = pages.some((page: BlockedUrl) =>
    !page.url.endsWith("*") && page.url === trimmedUrl
  );

  if (exactMatch) {
    return true;
  }

  // Check wildcard matches
  const wildcardMatch = pages.some((page: BlockedUrl) => {
    if (!page.url.endsWith("*")) return false;
    let newPageUrl = page.url.slice(0, -1);
    if (newPageUrl.endsWith("/")) {
      newPageUrl = newPageUrl.slice(0, -1);
    }
    return trimmedUrl.startsWith(newPageUrl);
  });

  return wildcardMatch;
}

chrome.webNavigation.onCommitted.addListener(async function (details) {
  if (details.frameId !== 0) return;

  const { url, tabId } = details;

  if (url === "about:blank" || url.startsWith("chrome://") || url.startsWith("chrome-extension://")) {
    return;
  }
  if (await shouldBlockUrl(url)) {
    chrome.tabs.update(tabId, {
      url: "https://tivoku.com/website-blocker/blocked",
    });
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (!tab.url || tab.url === "about:blank" || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
      return;
    }

    if (await shouldBlockUrl(tab.url)) {
      chrome.tabs.update(activeInfo.tabId, {
        url: "https://tivoku.com/website-blocker/blocked",
      });
    } else {
      console.log("Allowing URL on tab activation:", tab.url);
    }
  } catch (error) {
    // Tab might not exist anymore
    console.log("Could not check activated tab:", error);
  }
});