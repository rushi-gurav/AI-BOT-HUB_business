import { useState, useEffect, useRef } from "react";
import { Bot, User, Send, Loader2, X, Minimize2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";

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
  greeting: string;
  apiProvider: string;
  modelName: string;
}

export default function Embed({ params }: { params: { botId: string } }) {
  const [message, setMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
      queryClient.invalidateQueries({
        queryKey: ['/api/chat', params.botId, 'history'],
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory?.messages]);

  if (botLoading) {
    return (
      <div className="w-full h-full bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-2 text-purple-500" size={24} />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="w-full h-full bg-black text-white flex items-center justify-center">
        <div className="text-center p-4">
          <h3 className="font-medium mb-2">Bot Not Found</h3>
          <p className="text-sm text-gray-400">This bot is not available.</p>
        </div>
      </div>
    );
  }

  const messages = chatHistory?.messages || [];

  return (
    <div className="w-full h-full bg-black text-white font-inter">
      <div className={`embed-frame h-full flex flex-col transition-all duration-300 ${isMinimized ? 'h-12' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-900">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 gradient-bg rounded-full flex items-center justify-center">
              <Bot className="text-white" size={12} />
            </div>
            <span className="text-sm font-medium truncate">{bot.name}</span>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors"
            >
              {isMinimized ? <Bot size={12} /> : <Minimize2 size={12} />}
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {/* Bot greeting */}
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="text-white" size={10} />
                  </div>
                  <div className="bg-gray-800 p-2 rounded-lg rounded-tl-sm text-sm max-w-xs">
                    {bot.greeting}
                  </div>
                </div>

                {/* Chat history */}
                {historyLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-purple-500" size={16} />
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start space-x-2 ${
                        msg.type === 'user' ? 'justify-end' : ''
                      }`}
                    >
                      {msg.type === 'user' ? (
                        <>
                          <div className="bg-purple-600 p-2 rounded-lg rounded-tr-sm text-sm max-w-xs text-white">
                            {msg.content}
                          </div>
                          <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="text-white" size={10} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-6 h-6 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="text-white" size={10} />
                          </div>
                          <div className="bg-gray-800 p-2 rounded-lg rounded-tl-sm text-sm max-w-xs">
                            <p>{msg.content}</p>
                            {msg.sources && msg.sources.length > 0 && (
                              <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-700">
                                📄 {msg.sources.length} source{msg.sources.length > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}

                {/* Loading indicator */}
                {sendMessageMutation.isPending && (
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="text-white" size={10} />
                    </div>
                    <div className="bg-gray-800 p-2 rounded-lg text-sm">
                      <Loader2 className="animate-spin" size={12} />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t border-gray-700 bg-gray-900">
              <div className="flex items-center space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-gray-800 border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                  disabled={sendMessageMutation.isPending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="w-8 h-8 gradient-bg rounded-full p-0 hover:opacity-90 flex items-center justify-center"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="animate-spin" size={12} />
                  ) : (
                    <Send size={12} />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Powered by AI Bot Hub</span>
                <span>⚡ RAG</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
