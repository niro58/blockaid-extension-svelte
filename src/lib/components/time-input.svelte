<script module>
  const times = Array.from({ length: 97 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  });
</script>

<script lang="ts">
  import { ChevronsUpDown } from "lucide-svelte";

  import * as Popover from "./ui/popover/index";
  import { cn, minutesToTime } from "../utils";
  import { buttonVariants } from "./ui/button";
  import * as Command from "./ui/command/index";
  import ScrollArea from "./ui/scroll-area/scroll-area.svelte";
  import { tick } from "svelte";
  import { useId } from "bits-ui";

  let { value = $bindable(), id }: { value: number; id: string } = $props();
  let open = $state(false);

  function closeAndFocusTrigger(triggerId: string) {
    open = false;
    tick().then(() => {
      document.getElementById(triggerId)?.focus();
    });
  }
  const triggerId = useId();
</script>

<Popover.Root bind:open>
  <Popover.Trigger
    {id}
    class={cn(
      buttonVariants({ variant: "outline" }),
      "w-full justify-between",
      !value && "text-muted-foreground"
    )}
    role="combobox"
  >
    {minutesToTime(value)}
    <ChevronsUpDown class="opacity-50" />
  </Popover.Trigger>

  <Popover.Content class="w-[100px] h-[150px] p-0">
    <Command.Root>
      <Command.Input autofocus placeholder="Time ..." class="h-9" />
      <Command.Empty>No time found.</Command.Empty>
      <ScrollArea class="h-[300px] ">
        <Command.Group>
          {#each times as time}
            <Command.Item
              value={time}
              onSelect={() => {
                const [hour, minute] = time.split(":").map(Number);
                value = hour * 60 + minute;
                closeAndFocusTrigger(triggerId);
              }}
            >
              {time}
            </Command.Item>
          {/each}
        </Command.Group>
      </ScrollArea>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
