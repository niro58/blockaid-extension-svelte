import { getContext, onMount, setContext } from "svelte";
import { isValidUrl, trimUrl } from "./utils";

export type BlockedUrl = {
  id: number;
  url: string;
  timeLimitDaily: boolean;
};
export type MessageType = "error" | "success";
export type Message = {
  id: number;
  message: string;
  type: MessageType;
};
export type Settings = {
  enabled: boolean;
  workHour: {
    start: number;
    end: number;
  };
  blockOnWeekends?: boolean;
};
export class UrlController {
  messages: Message[] = $state([]);
  pages: BlockedUrl[] = $state([]);
  settings: Settings = $state({
    enabled: true,
    workHour: {
      start: 0,
      end: 60 * 24,
    },
    blockOnWeekends: false,
  });
  constructor() {
    onMount(() => {
      chrome.storage.sync.get("pages").then((data) => {
        this.pages = Object.values(data.pages) || [];
        console.log("Pages", this.pages);
      });
      chrome.storage.sync.get("settings").then((data) => {
        this.settings = data.settings || this.settings;
        console.log("Settings", this.settings);
      });
    });
    $effect(() => {
      if (this.messages.length > 2) {
        this.messages.pop();
      }
    });
    $effect(() => {
      chrome.storage.sync.set({ pages: this.pages });
    });
    $effect(() => {
      chrome.storage.sync.set({ settings: this.settings });
    });
  }

  addMessage(message: string, type: MessageType) {
    const id = Date.now();
    this.messages = [{ id, message, type }, ...this.messages];
    setTimeout(() => {
      this.messages = this.messages.filter((message) => message.id !== id);
    }, 2500);
  }
  addPage(url: string) {
    const trimmedUrl = trimUrl(url, "url");

    const urlValidity = isValidUrl(trimmedUrl, this.pages);
    if (urlValidity !== true) {
      this.addMessage(urlValidity, "error");
      return;
    }
    console.log(this.pages);
    this.pages.push({
      id: Date.now(),
      url: trimmedUrl,
      timeLimitDaily: true,
    });

    this.addMessage("Page added", "success");
  }
  removePage(id: number) {
    const l = this.pages.length;
    this.pages = this.pages.filter((page) => page.id !== id);
    if (l === this.pages.length) {
      this.addMessage("Page not found", "error");
    } else {
      this.addMessage("Page removed", "success");
    }
  }

  addCurrentPage(type: "url" | "domain" | "starts-with") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0] || !tabs[0].url) {
        this.addMessage("No active tab found", "error");
        return;
      }

      this.addPage(trimUrl(tabs[0].url, type));
    });
  }
}

const URL_CONTROLLER_SYMBOL = Symbol("URL_CONTROLLER");

export function setUrlController() {
  return setContext(URL_CONTROLLER_SYMBOL, new UrlController());
}
export function getUrlController() {
  return getContext<ReturnType<typeof setUrlController>>(URL_CONTROLLER_SYMBOL);
}
