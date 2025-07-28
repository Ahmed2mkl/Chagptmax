import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Menu,
  Brain,
  Moon,
  Sun,
  Settings,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string>();
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState("GPT-4o Vision (Unrestricted)");
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/conversations", {
        title: "New Chat"
      });
      return response.json();
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setCurrentConversationId(newConversation.id);
    },
  });

  const handleNewChat = () => {
    createConversationMutation.mutate();
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleConversationSelect = (id: string) => {
    setCurrentConversationId(id);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      const handleClickOutside = () => setSidebarOpen(false);
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isMobile, sidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarOpen(false)}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <ChatSidebar
        currentConversationId={currentConversationId}
        onConversationSelect={handleConversationSelect}
        onNewChat={handleNewChat}
        className={cn(
          "transition-transform duration-300 z-30",
          isMobile ? "fixed h-full" : "relative",
          isMobile && !sidebarOpen && "-translate-x-full"
        )}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="p-2"
                data-testid="button-sidebar-toggle"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  مساعد ذكي متطور
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  GROQ Llama • وضع بدون قيود
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Model Selector */}
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-green-600 focus:border-green-600 appearance-none pr-8"
                data-testid="select-model"
              >
                <option>GPT-4o Vision (Unrestricted)</option>
                <option>GPT-4 Turbo</option>
                <option>GPT-3.5 Turbo</option>
                <option>DALL-E 3</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-400" />
              )}
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              data-testid="button-settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Messages */}
        <ChatMessages 
          conversationId={currentConversationId} 
          isTyping={isTyping}
        />

        {/* Input */}
        <ChatInput
          conversationId={currentConversationId}
          onMessageSent={() => {
            // Message sent successfully
          }}
          onTyping={setIsTyping}
        />
      </div>
    </div>
  );
}
