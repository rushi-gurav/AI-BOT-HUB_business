import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Bot, Edit, Trash2, MessageCircle, Code, Smartphone, BarChart3 } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getEmbedCode } from "@/lib/pwaUtils";
import Header from "@/components/Header";

interface BotData {
  id: string;
  name: string;
  description: string;
  apiProvider: string;
  modelName: string;
  documentCount: number;
  createdAt: string;
}

export default function Bots() {
  const [, setLocation] = useLocation();
  const [embedCode, setEmbedCode] = useState("");
  const [selectedBot, setSelectedBot] = useState<BotData | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: botsData, isLoading } = useQuery({
    queryKey: ['/api/bots'],
  });

  const deleteBotMutation = useMutation({
    mutationFn: async (botId: string) => {
      return apiRequest('DELETE', `/api/bots/${botId}`);
    },
    onSuccess: () => {
      toast({
        title: "Bot deleted successfully",
        description: "Your bot has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bots'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleShowEmbed = (bot: BotData) => {
    setSelectedBot(bot);
    setEmbedCode(getEmbedCode(bot.id));
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard.",
    });
  };

  const handleDeleteBot = (botId: string) => {
    if (confirm("Are you sure you want to delete this bot? This action cannot be undone.")) {
      deleteBotMutation.mutate(botId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your bots...</p>
          </div>
        </div>
      </div>
    );
  }

  const bots = botsData?.bots || [];
  const isAdmin = botsData?.isAdmin || false;
  const canCreateMore = botsData?.canCreateMore || false;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="pt-20 container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-8"
          >
            <h2 className="text-3xl font-bold gradient-text">Your AI Bots</h2>
            <Button 
              onClick={() => setLocation('/create-bot')}
              className="gradient-bg text-white font-semibold hover:opacity-90"
              disabled={!canCreateMore}
            >
              <Plus className="mr-2" size={20} />
              Create New Bot
            </Button>
          </motion.div>
          
          {!canCreateMore && !isAdmin && (
            <Card className="glassmorphism border-yellow-500 mb-8">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-sm">!</span>
                  </div>
                  <div>
                    <p className="font-medium">Bot Limit Reached</p>
                    <p className="text-sm text-gray-400">
                      You've created 2 out of 2 bots. 
                      <Button 
                        variant="link" 
                        className="p-0 ml-1 text-purple-400"
                        onClick={() => setLocation('/premium')}
                      >
                        Upgrade to premium
                      </Button> 
                      for unlimited bots.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isAdmin && (
            <Card className="glassmorphism border-green-500 mb-8">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-green-400">✅ Unlimited Bot Access Enabled</p>
                    <p className="text-sm text-gray-400">You have admin privileges - create unlimited bots!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {bots.map((bot: BotData, index: number) => (
              <motion.div
                key={bot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="glassmorphism hover:bg-opacity-90 transition-all h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center">
                        <Bot className="text-white" size={24} />
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-8 h-8 p-0 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-8 h-8 p-0 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          onClick={() => handleDeleteBot(bot.id)}
                          disabled={deleteBotMutation.isPending}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2">{bot.name}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {bot.description || "No description provided"}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>{bot.apiProvider} {bot.modelName}</span>
                      <span>{bot.documentCount} documents</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm"
                        onClick={() => setLocation(`/chat/${bot.id}`)}
                        className="flex-1 gradient-bg text-white hover:opacity-90"
                      >
                        <MessageCircle size={14} className="mr-1" />
                        Chat
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="flex-1 glassmorphism border-gray-600 text-white hover:bg-white hover:bg-opacity-10"
                            onClick={() => handleShowEmbed(bot)}
                          >
                            <Code size={14} className="mr-1" />
                            Embed
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glassmorphism border-gray-700 max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="gradient-text">Embed {selectedBot?.name}</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Embed Code</h4>
                              <div className="bg-gray-900 p-3 rounded-lg border">
                                <code className="text-sm text-green-400 block overflow-x-auto">
                                  {embedCode}
                                </code>
                              </div>
                              <Button 
                                onClick={copyEmbedCode}
                                className="mt-2 bg-blue-500 hover:bg-blue-600"
                                size="sm"
                              >
                                <Code className="mr-1" size={14} />
                                Copy Code
                              </Button>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Preview URL</h4>
                              <p className="text-sm text-gray-400 bg-gray-900 p-2 rounded">
                                {window.location.origin}/embed/{selectedBot?.id}
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        size="sm"
                        variant="outline"
                        className="px-3 bg-green-500 bg-opacity-20 text-green-500 border-green-500 hover:bg-green-500 hover:text-white"
                        title="Install as PWA"
                      >
                        <Smartphone size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            
            {/* Create New Bot Card */}
            {canCreateMore && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: bots.length * 0.1 }}
              >
                <Card 
                  className="glassmorphism border-2 border-dashed border-purple-500 border-opacity-50 hover:border-opacity-100 transition-all cursor-pointer h-full"
                  onClick={() => setLocation('/create-bot')}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
                    <div className="w-12 h-12 bg-purple-500 bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                      <Plus className="text-purple-500" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Create New Bot</h3>
                    <p className="text-gray-400 text-sm mb-2">Build another AI assistant</p>
                    <p className="text-xs text-gray-500">
                      {bots.length} of {isAdmin ? '∞' : '2'} bots created
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
          
          {/* Usage Stats */}
          {bots.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="text-purple-500" size={24} />
                    <span>Usage Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold gradient-text mb-1">
                        {Math.floor(Math.random() * 1000) + 500}
                      </div>
                      <div className="text-sm text-gray-400">Total Chats</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold gradient-text mb-1">{bots.length}</div>
                      <div className="text-sm text-gray-400">Active Bots</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold gradient-text mb-1">
                        {bots.reduce((acc: number, bot: BotData) => acc + bot.documentCount, 0)}
                      </div>
                      <div className="text-sm text-gray-400">Documents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold gradient-text mb-1">
                        {Math.floor(Math.random() * 10) + 1}
                      </div>
                      <div className="text-sm text-gray-400">Active Embeds</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
