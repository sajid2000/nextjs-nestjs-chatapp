"use client";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { SmileIcon } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Props {
  onChange: (value: string) => void;
}

export default function EmojiPicker({ onChange }: Props) {
  return (
    <Popover>
      <PopoverTrigger>
        <SmileIcon className="size-5 text-muted-foreground transition hover:text-foreground" />
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <Picker
          emojiSize={18}
          theme="light"
          data={data}
          maxFrequentRows={1}
          onEmojiSelect={(emoji: any) => onChange(emoji.native)}
        />
      </PopoverContent>
    </Popover>
  );
}
