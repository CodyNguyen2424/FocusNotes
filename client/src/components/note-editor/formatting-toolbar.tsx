import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomTooltip } from "@/components/ui/custom-tooltip";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  List,
  ListOrdered,
  Link,
  Image,
  Code,
  Highlighter,
  CheckSquare,
} from "lucide-react";
import { ToolbarAction } from "@/lib/types";

interface FormattingToolbarProps {
  actions: ToolbarAction[];
}

export function FormattingToolbar({ actions }: FormattingToolbarProps) {
  return (
    <ScrollArea
      className="border-b border-gray-200 dark:border-gray-700 p-1 overflow-x-auto"
      orientation="horizontal"
    >
      <div className="flex items-center space-x-1 px-2 min-w-max">
        {actions.map((action, index) => (
          <>
            <CustomTooltip
              key={action.label}
              content={action.label}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={action.action}
                >
                  {action.icon}
                </Button>
              }
            />
            {action.dividerAfter && (
              <Separator
                orientation="vertical"
                className="h-5 mx-1 bg-gray-300 dark:bg-gray-700"
              />
            )}
          </>
        ))}
      </div>
    </ScrollArea>
  );
}

export function getDefaultFormattingActions(): ToolbarAction[] {
  // These are dummy actions without actual implementations
  return [
    {
      icon: <Heading1 size={18} />,
      label: "Heading",
      action: () => {},
    },
    {
      icon: <List size={18} />,
      label: "Bullet List",
      action: () => {},
    },
    {
      icon: <ListOrdered size={18} />,
      label: "Numbered List",
      action: () => {},
      dividerAfter: true,
    },
    {
      icon: <Bold size={18} />,
      label: "Bold",
      action: () => {},
    },
    {
      icon: <Italic size={18} />,
      label: "Italic",
      action: () => {},
    },
    {
      icon: <Underline size={18} />,
      label: "Underline",
      action: () => {},
      dividerAfter: true,
    },
    {
      icon: <Link size={18} />,
      label: "Add Link",
      action: () => {},
    },
    {
      icon: <Image size={18} />,
      label: "Add Image",
      action: () => {},
    },
    {
      icon: <Code size={18} />,
      label: "Code Block",
      action: () => {},
      dividerAfter: true,
    },
    {
      icon: <Highlighter size={18} />,
      label: "Highlight",
      action: () => {},
    },
    {
      icon: <CheckSquare size={18} />,
      label: "To-do List",
      action: () => {},
    },
  ];
}
