import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/hooks/use-theme";
import { Menu, Sun, Moon, User, ChevronDown } from "lucide-react";
import { MusicPlayer } from "@/components/ui/music-player";
import { 
  DropdownMenu, 
  DropdownMenuContent,
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CustomTooltip } from "@/components/ui/custom-tooltip";

interface HeaderProps {
  toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [_, navigate] = useLocation();
  // Normally you'd get this from context/auth state
  const [user] = useState({ name: 'Guest', initials: 'G' });

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <CustomTooltip
            content="Toggle sidebar"
            trigger={
              <Button
                onClick={toggleSidebar}
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-primary/10 border border-primary/20 hover:border-primary/40 text-gray-700 dark:text-gray-200"
              >
                <Menu className="h-5 w-5 text-primary" />
              </Button>
            }
          />
          <button 
            onClick={() => navigate("/")} 
            className="text-xl font-semibold text-primary dark:text-white hover:opacity-80 transition-opacity"
          >
            FocusNotes
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          <MusicPlayer />
          <CustomTooltip
            content={theme === 'dark' ? "Light mode" : "Dark mode"}
            trigger={
              <Button 
                onClick={toggleTheme} 
                variant="ghost" 
                size="icon"
                className="text-gray-700 dark:text-gray-200"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            }
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1 text-sm">
                <Avatar className="h-6 w-6 mr-1">
                  <AvatarFallback className="bg-primary text-white text-xs">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">{user.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
