import { useState, useRef, useEffect } from "react";
import { NoteBlock } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Heading1,
  Heading2,
  AlignLeft,
  List,
  ListOrdered,
  Code,
  Quote,
  CheckSquare,
  Info,
  Trash2,
  SeparatorHorizontal,
} from "lucide-react";

interface BlockMenuProps {
  blockId: string;
  currentType: NoteBlock["type"];
  onSelectType: (id: string, type: NoteBlock["type"]) => void;
  onDelete: () => void;
}

export function BlockMenu({
  blockId,
  currentType,
  onSelectType,
  onDelete,
}: BlockMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const blockTypeItems = [
    {
      type: "title" as NoteBlock["type"],
      label: "Title",
      icon: <Heading1 className="w-4 h-4 mr-2" />,
    },
    {
      type: "heading" as NoteBlock["type"],
      label: "Heading",
      icon: <Heading1 className="w-4 h-4 mr-2" />,
    },
    {
      type: "subheading" as NoteBlock["type"],
      label: "Subheading",
      icon: <Heading2 className="w-4 h-4 mr-2" />,
    },
    {
      type: "paragraph" as NoteBlock["type"],
      label: "Paragraph",
      icon: <AlignLeft className="w-4 h-4 mr-2" />,
    },
    {
      type: "bullet-list" as NoteBlock["type"],
      label: "Bullet List",
      icon: <List className="w-4 h-4 mr-2" />,
    },
    {
      type: "numbered-list" as NoteBlock["type"],
      label: "Numbered List",
      icon: <ListOrdered className="w-4 h-4 mr-2" />,
    },
    {
      type: "quote" as NoteBlock["type"],
      label: "Quote",
      icon: <Quote className="w-4 h-4 mr-2" />,
    },
    {
      type: "code" as NoteBlock["type"],
      label: "Code",
      icon: <Code className="w-4 h-4 mr-2" />,
    },
    {
      type: "todo" as NoteBlock["type"],
      label: "To-do",
      icon: <CheckSquare className="w-4 h-4 mr-2" />,
    },
    {
      type: "callout" as NoteBlock["type"],
      label: "Callout",
      icon: <Info className="w-4 h-4 mr-2" />,
    },
    {
      type: "divider" as NoteBlock["type"],
      label: "Divider",
      icon: <SeparatorHorizontal className="w-4 h-4 mr-2" />,
    },
  ];

  const handleSelectType = (type: NoteBlock["type"]) => {
    onSelectType(blockId, type);
    setIsOpen(false);
  };

  const handleDelete = () => {
    onDelete();
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <ChevronRight className="h-3 w-3 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          align="start"
          alignOffset={-30}
          className="w-56 min-w-[220px]"
        >
          <div className="p-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
            Turn into
          </div>
          {blockTypeItems.map((item) => (
            <DropdownMenuItem
              key={item.type}
              className="flex items-center cursor-pointer"
              onSelect={() => handleSelectType(item.type)}
            >
              {item.icon}
              <span>{item.label}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center cursor-pointer text-red-500"
            onSelect={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
