import type { BlockedUrl } from "$lib/urlController.svelte";
import { trimUrl } from "$lib/utils";

chrome.webNavigation.onCommitted.addListener(async function (details) {
  const { url, tabId } = details;
  if (url === "about:blank") return;
  const trimmedUrl = trimUrl(url, "url");
  let pages = await chrome.storage.local.get("pages");
  if (!pages["pages"]) {
    pages = { pages: [] };
  }

  const startsWithPages = pages["pages"].filter((page: BlockedUrl) =>
    page.url.endsWith("*")
  );
  const isValidUrl =
    pages["pages"].filter((page: BlockedUrl) => page.url === trimmedUrl)
      .length === 0 ||
    startsWithPages.filter((page: BlockedUrl) =>
      trimmedUrl.startsWith(page.url.slice(0, -1))
    ).length === 0;

  if (isValidUrl) {
    return;
  }

  chrome.tabs.update(tabId, {
    url: "https://tivoku.com/website-blocker/blocked",
  });
});
