"use client";

import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "../../../lib/utils";
import {
  IconBolt,
  IconChevronDown,
  IconCircle,
  IconCircleDashed,
  IconCloud,
  IconCode,
  IconDeviceLaptop,
  IconHistory,
  IconPaperclip,
  IconPlus,
  IconProgress,
  IconRobot,
  IconSend,
  IconUser,
  IconWand,
  IconWorld,
} from "@tabler/icons-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { Loader2 } from "lucide-react";

interface Ai03Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  isSubmitting?: boolean;
  controlsEnabled?: boolean;
  children?: React.ReactNode;
}

export default function Ai03({
  value,
  onChange,
  onSubmit,
  isSubmitting = false,
  controlsEnabled = false,
  children,
}: Ai03Props) {
  const [selectedModel, setSelectedModel] = useState("Local");
  const [selectedAgent, setSelectedAgent] = useState("Agent");
  const [selectedPerformance, setSelectedPerformance] = useState("High");
  const [autoMode, setAutoMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isSubmitting) {
      onSubmit(e);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full relative">
      <div className="bg-background border border-border rounded-2xl overflow-hidden relative">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => {}}
          disabled={!controlsEnabled}
        />

        <div className="px-3 pt-3 pb-2 grow relative">
          {children}
          <form onSubmit={handleSubmit}>
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder=""
              className="w-full bg-transparent! p-0 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder-muted-foreground resize-none border-none outline-none text-sm min-h-10 max-h-[25vh]"
              rows={1}
              disabled={isSubmitting}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = target.scrollHeight + "px";
              }}
            />
          </form>
        </div>

        <div className="mb-2 px-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={!controlsEnabled}>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!controlsEnabled}
                  className="h-7 w-7 p-0 rounded-full border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IconPlus className="size-3" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="max-w-xs rounded-2xl p-1.5"
              >
                <DropdownMenuGroup className="space-y-1">
                  <DropdownMenuItem
                    className="rounded-[calc(1rem-6px)] text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <IconPaperclip size={16} className="opacity-60" />
                    Attach Files
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-[calc(1rem-6px)] text-xs"
                    onClick={() => {}}
                  >
                    <IconCode size={16} className="opacity-60" />
                    Code Interpreter
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-[calc(1rem-6px)] text-xs"
                    onClick={() => {}}
                  >
                    <IconWorld size={16} className="opacity-60" />
                    Web Search
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-[calc(1rem-6px)] text-xs"
                    onClick={() => {}}
                  >
                    <IconHistory size={16} className="opacity-60" />
                    Chat History
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              disabled={!controlsEnabled}
              onClick={() => setAutoMode(!autoMode)}
              className={cn(
                "h-7 px-2 rounded-full border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed",
                {
                  "bg-primary/10 text-primary border-primary/30": autoMode,
                  "text-muted-foreground": !autoMode,
                },
              )}
            >
              <IconWand className="size-3" />
              <span className="text-xs">Auto</span>
            </Button>
          </div>

          <div>
            <Button
              type="submit"
              disabled={!value.trim() || isSubmitting}
              className="size-7 p-0 rounded-full bg-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <Loader2 className="size-3 animate-spin text-primary-foreground" />
              ) : (
                <IconSend className="size-3 fill-primary-foreground text-primary-foreground" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/*<div className="flex items-center gap-0 pt-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!controlsEnabled}>
            <Button
              variant="ghost"
              size="sm"
              disabled={!controlsEnabled}
              className="h-6 px-2 rounded-full border border-transparent hover:bg-accent text-muted-foreground text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconDeviceLaptop className="size-3" />
              <span>{selectedModel}</span>
              <IconChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="max-w-xs rounded-2xl p-1.5 bg-popover border-border"
          >
            <DropdownMenuGroup className="space-y-1">
              <DropdownMenuItem
                className="rounded-[calc(1rem-6px)] text-xs"
                onClick={() => setSelectedModel("Local")}
              >
                <IconDeviceLaptop size={16} className="opacity-60" />
                Local
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-[calc(1rem-6px)] text-xs"
                onClick={() => setSelectedModel("Cloud")}
              >
                <IconCloud size={16} className="opacity-60" />
                Cloud
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!controlsEnabled}>
            <Button
              variant="ghost"
              size="sm"
              disabled={!controlsEnabled}
              className="h-6 px-2 rounded-full border border-transparent hover:bg-accent text-muted-foreground text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconUser className="size-3" />
              <span>{selectedAgent}</span>
              <IconChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="max-w-xs rounded-2xl p-1.5 bg-popover border-border"
          >
            <DropdownMenuGroup className="space-y-1">
              <DropdownMenuItem
                className="rounded-[calc(1rem-6px)] text-xs"
                onClick={() => setSelectedAgent("Agent")}
              >
                <IconUser size={16} className="opacity-60" />
                Agent
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-[calc(1rem-6px)] text-xs"
                onClick={() => setSelectedAgent("Assistant")}
              >
                <IconRobot size={16} className="opacity-60" />
                Assistant
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!controlsEnabled}>
            <Button
              variant="ghost"
              size="sm"
              disabled={!controlsEnabled}
              className="h-6 px-2 rounded-full border border-transparent hover:bg-accent text-muted-foreground text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconBolt className="size-3" />
              <span>{selectedPerformance}</span>
              <IconChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="max-w-xs rounded-2xl p-1.5 bg-popover border-border"
          >
            <DropdownMenuGroup className="space-y-1">
              <DropdownMenuItem
                className="rounded-[calc(1rem-6px)] text-xs"
                onClick={() => setSelectedPerformance("High")}
              >
                <IconCircle size={16} className="opacity-60" />
                High
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-[calc(1rem-6px)] text-xs"
                onClick={() => setSelectedPerformance("Medium")}
              >
                <IconProgress size={16} className="opacity-60" />
                Medium
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-[calc(1rem-6px)] text-xs"
                onClick={() => setSelectedPerformance("Low")}
              >
                <IconCircleDashed size={16} className="opacity-60" />
                Low
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1" />
      </div>*/}
    </div>
  );
}
