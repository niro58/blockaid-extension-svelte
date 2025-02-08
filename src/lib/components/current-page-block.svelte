<script lang="ts">
  import { getUrlController } from "$lib/urlController.svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index";
  import { Globe, Link2, PlusCircle } from "lucide-svelte";
  import { Button } from "./ui/button";
  const urlController = getUrlController();
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <Button variant="outline">Block Current</Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end">
    <DropdownMenu.Item
      onclick={() => {
        urlController.addCurrentPage("url");
      }}
    >
      <Link2 class="mr-2 h-4 w-4" />
      Page
    </DropdownMenu.Item>
    <DropdownMenu.Item
      onclick={() => {
        urlController.addCurrentPage("starts-with");
      }}
    >
      <PlusCircle class="mr-2 h-4 w-4" />
      Page and Subpages
    </DropdownMenu.Item>
    <DropdownMenu.Item
      onclick={() => {
        urlController.addCurrentPage("domain");
      }}
    >
      <Globe class="mr-2 h-4 w-4" />
      Entire Domain
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
