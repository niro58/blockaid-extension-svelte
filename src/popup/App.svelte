<script lang="ts">
  import "./app.css";
  import {
    CircleHelp,
    Clock,
    Globe,
    Plus,
    RotateCw,
    Settings,
    Trash2,
    Youtube,
  } from "lucide-svelte";
  import * as Tabs from "$lib/components/ui/tabs/index";
  import * as Card from "$lib/components/ui/card/index";

  import { Label } from "$lib/components/ui/label";
  import { setUrlController, type BlockedUrl } from "$lib/urlController.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Switch } from "$lib/components/ui/switch";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import TimeInput from "$lib/components/time-input.svelte";
  import { Input } from "$lib/components/ui/input";
  const urlController = setUrlController();
  import CurrentPageBlock from "$lib/components/current-page-block.svelte";
  import { fade, fly } from "svelte/transition";
  import { trimUrl } from "$lib/utils";
  let currentPage = $state("");

  function addPage() {
    if (currentPage === "") return;

    urlController.addPage(currentPage);
    currentPage = "";
  }

</script>
<main>
  <div
    class="bg-gradient-to-b from-card to-background w-[400px] min-h-[200px] border"
  >
    <div class="p-4 w-full">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h1 class="text-lg font-semibold">BlockAid</h1>
          <button
            onclick={(e) => {
              e.preventDefault();
              chrome.tabs.create({
                url: "https://tivoku.com/website-blocker",
              });
            }}
            class="text-sm text-muted-foreground hover:text-primary underline"
            >About</button
          >
        </div>
        <div class="flex items-center justify-between">
          <CurrentPageBlock />
        </div>
        <Switch
          bind:checked={
            () => urlController.settings.enabled,
            (v) => (urlController.settings.enabled = v)
          }
        />
      </div>

      <Tabs.Root
        value="sites"
        class="w-full grid grid-cols-5 h-[320px]"
        orientation="vertical"
      >
        <Tabs.List class="grid grid-cols-1 grid-rows-3 gap-2 h-40 w-12">
          <Tabs.Trigger value="sites"><Globe class="h-6 w-6" /></Tabs.Trigger>

          <Tabs.Trigger value="schedule"
            ><Settings class="h-6 w-6" /></Tabs.Trigger
          >
          <Tabs.Trigger value="faq"><CircleHelp class="h-6 w-6" /></Tabs.Trigger
          >
        </Tabs.List>

        <div class="col-span-4 h-full">
          <Tabs.Content value="sites" class="h-full mt-0">
            <Card.Root class="h-full flex flex-col justify-between">
              <Card.Content>
                <div class="flex space-x-2">
                  <Input
                    placeholder="Enter URL to block..."
                    bind:value={
                      () => currentPage,
                      (v) => {
                        currentPage = v;
                      }
                    }
                    onkeydown={(e) => {
                      if (e.key === "Enter") {
                        addPage();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    onclick={() => {
                      addPage();
                    }}
                  >
                    <Plus class="h-4 w-4" />
                  </Button>
                </div>

                <ScrollArea class="mt-4 h-52">
                  <div class="space-y-2" in:fade={{ duration: 200 }}>
                    {#each urlController.pages as page}
                      <div
                        class="flex items-center justify-between rounded-lg border px-3 text-sm"
                        title={page.url}
                        in:fly={{ duration: 200, x: 20 }}
                        out:fly={{ duration: 200, x: 20 }}
                      >
                        <div class="flex items-center space-x-2">
                          <span class="truncate max-w-[150px]">
                            {page.url}
                          </span>
                        </div>
                        <div class="p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            class="w-8 h-8"
                            onclick={() => {
                              urlController.removePage(page.id);
                            }}
                          >
                            <Trash2 class="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    {/each}
                  </div>
                </ScrollArea>
              </Card.Content>
            </Card.Root>
          </Tabs.Content>

          <Tabs.Content value="schedule" class="h-full mt-0">
            <Card.Root class="h-full">
              <Card.Header
                class="pb-3 flex flex-row justify-between items-center"
              >
                <Card.Title>Block Schedule</Card.Title>
                <Button
                  size="icon"
                  onclick={() => {
                    urlController.settings.workHour.start = 0;
                    urlController.settings.workHour.end = 24 * 60;
                    urlController.settings.blockOnWeekends = true;
                  }}
                >
                  <RotateCw class="h-4 w-4" />
                </Button>
              </Card.Header>
              <Card.Content class="px-6 py-0">
                <div class="space-y-4">
                  <div class="flex flex-col gap-2">
                    <div class="text-lg font-bold">Work Hours</div>
                    <div class="grid grid-cols-2 space-x-2">
                      <div>
                        <Label for="work-hour-start">From</Label>
                        <TimeInput
                          id="work-hour-start"
                          bind:value={
                            () => urlController.settings.workHour.start,
                            (v) => (urlController.settings.workHour.start = v)
                          }
                        />
                      </div>
                      <div>
                        <Label for="work-hour-end">To</Label>
                        <TimeInput
                          id="work-hour-end"
                          bind:value={
                            () => urlController.settings.workHour.end,
                            (v) => (urlController.settings.workHour.end = v)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center space-x-2">
                    <Clock class="h-4 w-4 text-muted-foreground" />
                    <Label>Block on weekends</Label>
                    <Switch
                      bind:checked={
                        () => urlController.settings.blockOnWeekends,
                        (v) => (urlController.settings.blockOnWeekends = v)
                      }
                    />
                  </div>
                </div>
              </Card.Content>
            </Card.Root>
          </Tabs.Content>
          <Tabs.Content value="faq" class="h-full mt-0">
            <Card.Root class="h-full">
              <Card.Header
                class="pb-3 flex flex-row justify-between items-center"
              >
                <Card.Title>FAQ</Card.Title>
              </Card.Header>
              <Card.Content class="px-6 py-0">
                <div class="space-y-4">
                  <div class="flex flex-col">
                    <div class="text-md font-bold">
                      How does the linking system work?
                    </div>
                    <div class="text-sm">
                      <p>
                        If the URL after the domain contains an asterisk (*), it
                        blocks everything after it. If not, it only blocks the
                        specific page.
                      </p>
                      <ul class="list-disc list-inside mt-2">
                        <li>
                          <strong>Example 1:</strong> <code>example.com/*</code>
                          blocks all pages under <code>example.com</code>.
                        </li>
                        <li>
                          <strong>Example 2:</strong>
                          <code>example.com/page</code>
                          only blocks <code>example.com/page</code>.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card.Root>
          </Tabs.Content>
        </div>
      </Tabs.Root>
      <div class="mt-2">
        {#each urlController.messages as message (message.id)}
          <div
            in:fly={{ duration: 200, y: 20 }}
            out:fly={{ duration: 200, y: 20 }}
            class="{message.type === 'success'
              ? 'bg-green-500/50 text-green-100 border border-green-500'
              : 'bg-red-500/50 text-red-100 border border-red-500'} py-2 px-4 rounded mb-2"
          >
            {message.message}
          </div>
        {/each}
      </div>
    </div>
  </div>
</main>
