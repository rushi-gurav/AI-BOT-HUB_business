import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Info } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";

const editBotSchema = z.object({
  name: z.string().min(1, "Bot name is required"),
  description: z.string().optional(),
  greeting: z.string().min(1, "Greeting message is required"),
  apiProvider: z.string().min(1, "API provider is required"),
  apiKey: z.string().optional(), // Make API key optional for updates
  modelName: z.string().min(1, "Model name is required"),
});

type EditBotFormData = z.infer<typeof editBotSchema>;

// Bot data interface (without apiKey for security)
interface BotData {
  id: string;
  name: string;
  description: string | null;
  greeting: string;
  apiProvider: string;
  modelName: string;
  createdAt: string;
}

// Model suggestions for each provider
const MODEL_SUGGESTIONS = {
  openai: [
    "gpt-4o",
    "gpt-4o-mini", 
    "gpt-4-turbo",
    "gpt-3.5-turbo"
  ],
  openrouter: [
    "anthropic/claude-3-haiku",
    "anthropic/claude-3-sonnet",
    "openai/gpt-4o",
    "openai/gpt-4o-mini",
    "meta-llama/llama-3.1-8b-instruct",
    "meta-llama/llama-3.1-70b-instruct"
  ],
  gemini: [
    "gemini-pro",
    "gemini-1.5-pro",
    "gemini-1.5-flash"
  ],
  grok: [
    "grok-2-1212",
    "grok-2-1212-beta"
  ],
  custom: [
    "custom-model",
    "llama-3.1-8b",
    "llama-3.1-70b"
  ]
};

export default function EditBot({ params }: { params: { botId: string } }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bot, isLoading: botLoading } = useQuery<BotData>({
    queryKey: ['/api/bots', params.botId],
  });

  const form = useForm<EditBotFormData>({
    resolver: zodResolver(editBotSchema),
    defaultValues: {
      name: "",
      description: "",
      greeting: "",
      apiProvider: "openai",
      apiKey: "",
      modelName: "",
    },
  });

  // Watch the API provider to update model suggestions
  const selectedProvider = form.watch("apiProvider");

  // Update form when bot data loads
  useEffect(() => {
    if (bot) {
      form.reset({
        name: bot.name,
        description: bot.description || "",
        greeting: bot.greeting,
        apiProvider: bot.apiProvider,
        modelName: bot.modelName,
        // Note: apiKey is not included as it's hidden for security
      });
    }
  }, [bot, form]);

  const updateBotMutation = useMutation({
    mutationFn: async (data: EditBotFormData) => {
      const response = await apiRequest('PUT', `/api/bots/${params.botId}`, data);
      return response.json();
    },
    onSuccess: async (data) => {
      toast({
        title: "Bot Updated Successfully!",
        description: data.message || "Your bot settings have been updated.",
      });
      await queryClient.invalidateQueries({ queryKey: ['/api/bots'] });
      await queryClient.refetchQueries({ queryKey: ['/api/bots'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/bots', params.botId] });
      setLocation('/bots');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update bot",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditBotFormData) => {
    updateBotMutation.mutate(data);
  };

  if (botLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading bot settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-gray-400">Bot not found</p>
            <Button onClick={() => setLocation('/bots')} className="mt-4">
              Back to Bots
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="pt-20 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  Edit Bot Settings
                </CardTitle>
                <p className="text-gray-400 text-center">
                  Update your bot's configuration and fix any issues
                </p>
              </CardHeader>
              
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bot Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="My AI Assistant" 
                              className="bg-gray-800 border-gray-700" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe what your bot does..." 
                              className="bg-gray-800 border-gray-700" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="greeting"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Greeting Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Hi! I'm here to help you with questions about your documents. What would you like to know?" 
                              className="bg-gray-800 border-gray-700" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="apiProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Provider</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-gray-800 border-gray-700">
                                  <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="openai">OpenAI</SelectItem>
                                <SelectItem value="openrouter">OpenRouter</SelectItem>
                                <SelectItem value="gemini">Gemini</SelectItem>
                                <SelectItem value="grok">Grok</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="modelName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Model Name</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Input 
                                  placeholder={MODEL_SUGGESTIONS[selectedProvider as keyof typeof MODEL_SUGGESTIONS]?.[0] || "Enter model name"} 
                                  className="bg-gray-800 border-gray-700" 
                                  {...field} 
                                />
                                <div className="text-xs text-gray-400 space-y-1">
                                  <div className="flex items-center gap-1">
                                    <Info size={12} />
                                    <span>Suggested models for {selectedProvider}:</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {MODEL_SUGGESTIONS[selectedProvider as keyof typeof MODEL_SUGGESTIONS]?.map((model) => (
                                      <button
                                        key={model}
                                        type="button"
                                        onClick={() => field.onChange(model)}
                                        className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded border border-gray-600 transition-colors"
                                      >
                                        {model}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Leave empty to keep current API key" 
                              className="bg-gray-800 border-gray-700" 
                              {...field} 
                            />
                          </FormControl>
                          <p className="text-xs text-gray-400">
                            Only enter a new API key if you want to change it. Leave empty to keep the current one.
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex gap-4 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setLocation('/bots')}
                        className="flex-1 glassmorphism border-gray-600 text-white hover:bg-white hover:bg-opacity-10"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={updateBotMutation.isPending}
                        className="flex-1 gradient-bg text-white hover:opacity-90"
                      >
                        {updateBotMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Bot"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
