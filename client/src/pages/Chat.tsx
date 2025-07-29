import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Bot, User, Send, Smartphone, X, FileText, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { usePWAInstall } from "@/lib/pwaUtils";

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  sources?: Array<{
    documentName: string;
    content: string;
  }>;
  createdAt: string;
}

interface BotData {
  id: string;
  name: string;
  description: string;
  greeting: string;
  apiProvider: string;
  modelName: string;
  documents: Array<{
    id: string;
    originalName: string;
    size: number;
    createdAt: string;
  }>;
}

export default function Chat({ params }: { params: { botId: string } }) {
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { canInstall, install } = usePWAInstall();
  const queryClient = useQueryClient();

  const { data: bot, isLoading: botLoading } = useQuery<BotData>({
    queryKey: ['/api/bots', params.botId],
  });

  const { data: chatHistory, isLoading: historyLoading } = useQuery<{ messages: ChatMessage[] }>({
    queryKey: ['/api/chat', params.botId, 'history'],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageContent: string) => {
      const response = await apiRequest('POST', `/api/chat/${params.botId}`, {
        message: messageContent,
      });
      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      // Invalidate and refetch chat history
      queryClient.invalidateQueries({
        queryKey: ['/api/chat', params.botId, 'history'],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInstallPWA = async () => {
    try {
      await install();
      toast({
        title: "App Installed!",
        description: "AI Bot Hub has been installed to your device.",
      });
    } catch (error) {
      toast({
        title: "Installation Failed",
        description: "Could not install the app. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory?.messages]);

  if (botLoading) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-purple-500" size={48} />
          <p className="text-gray-400">Loading bot...</p>
        </div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center">
        <Card className="glassmorphism max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">Bot Not Found</h2>
            <p className="text-gray-400 mb-6">The bot you're looking for doesn't exist or has been deleted.</p>
            <Button onClick={() => setLocation('/bots')} className="gradient-bg">
              Go Back to Bots
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const messages = chatHistory?.messages || [];

  return (
    <div className="fixed inset-0 bg-black text-white z-50">
      <div className="flex flex-col h-full">
        {/* Chat Header */}
        <div className="glassmorphism p-3 sm:p-4 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 gradient-bg rounded-lg flex items-center justify-center flex-shrink-0">
              <Bot className="text-white" size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm sm:text-base truncate">{bot.name}</h3>
              <p className="text-xs text-gray-400 truncate hidden sm:block">
                Powered by {bot.apiProvider} {bot.modelName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {canInstall && (
              <Button
                onClick={handleInstallPWA}
                size="sm"
                className="bg-green-500 bg-opacity-20 text-green-500 hover:bg-green-500 hover:text-white text-xs"
              >
                <Smartphone size={14} className="mr-1" />
                <span className="hidden xs:inline">Install</span>
              </Button>
            )}
            <Button
              onClick={() => setLocation('/bots')}
              size="sm"
              variant="outline"
              className="glassmorphism border-gray-600 hover:bg-white hover:bg-opacity-10"
            >
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Bot Welcome Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start space-x-3"
            >
              <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-white" size={16} />
              </div>
              <div className="chat-bubble-bot p-4 rounded-2xl rounded-tl-sm max-w-2xl">
                <p>{bot.greeting}</p>
              </div>
            </motion.div>

            {/* Chat History */}
            {historyLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-purple-500" size={24} />
              </div>
            ) : (
              messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-start space-x-3 ${
                    msg.type === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {msg.type === 'user' ? (
                    <>
                      <div className="chat-bubble-user p-4 rounded-2xl rounded-tr-sm max-w-2xl text-white">
                        <p>{msg.content}</p>
                      </div>
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="text-white" size={16} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="text-white" size={16} />
                      </div>
                      <div className="chat-bubble-bot p-4 rounded-2xl rounded-tl-sm max-w-2xl">
                        <p className="mb-3">{msg.content}</p>
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="text-xs text-gray-500 border-t border-gray-700 pt-2">
                            <div className="flex items-center space-x-1 mb-1">
                              <FileText size={12} />
                              <span>Sources:</span>
                            </div>
                            {msg.sources.map((source, idx) => (
                              <div key={idx} className="mb-1">
                                • {source.documentName}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              ))
            )}

            {/* Loading indicator for pending message */}
            {sendMessageMutation.isPending && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-white" size={16} />
                </div>
                <div className="chat-bubble-bot p-4 rounded-2xl rounded-tl-sm">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="animate-spin" size={16} />
                    <span className="text-sm text-gray-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="glassmorphism p-4 border-t border-gray-800">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your documents..."
                  className="bg-gray-800 border-gray-700 rounded-2xl pl-4 pr-12 py-3 text-white focus:border-purple-500"
                  disabled={sendMessageMutation.isPending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 gradient-bg rounded-full p-0 hover:opacity-90"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Send size={16} />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <span>Responses are generated from your uploaded documents only</span>
              <span>⚡ Powered by RAG</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
