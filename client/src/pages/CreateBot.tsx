import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, Loader2, CheckCircle, Info } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";

const createBotSchema = z.object({
  name: z.string().min(1, "Bot name is required"),
  description: z.string().optional(),
  greeting: z.string().min(1, "Greeting message is required"),
  apiProvider: z.string().min(1, "API provider is required"),
  apiKey: z.string().min(1, "API key is required"),
  modelName: z.string().min(1, "Model name is required"),
  isAdmin: z.boolean().default(false),
  adminKey: z.string().optional(),
});

type CreateBotFormData = z.infer<typeof createBotSchema>;

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

export default function CreateBot() {
  const [, setLocation] = useLocation();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showAdminInput, setShowAdminInput] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateBotFormData>({
    resolver: zodResolver(createBotSchema),
    defaultValues: {
      name: "",
      description: "",
      greeting: "Hi! I'm here to help you with questions about your documents. What would you like to know?",
      apiProvider: "openai",
      apiKey: "",
      modelName: "gpt-4o",
      isAdmin: false,
      adminKey: "",
    },
  });

  // Watch the API provider to update model suggestions
  const selectedProvider = form.watch("apiProvider");

  const createBotMutation = useMutation({
    mutationFn: async (data: CreateBotFormData) => {
      const formData = new FormData();
      
      // Append form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      // Append files
      selectedFiles.forEach((file) => {
        formData.append('documents', file);
      });

      const response = await fetch('/api/bots', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create bot');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bot Created Successfully!",
        description: data.message || "Your AI bot has been created and is ready to use.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bots'] });
      setLocation('/bots');
    },
    onError: (error: any) => {
      if (error.message.includes('Bot limit reached')) {
        setLocation('/premium');
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 2) {
      toast({
        title: "Too many files",
        description: "You can upload a maximum of 2 documents.",
        variant: "destructive",
      });
      return;
    }
    setSelectedFiles(files);
  };

  const onSubmit = (data: CreateBotFormData) => {
    if (data.isAdmin && data.adminKey !== 'Rushi@123456coder') {
      toast({
        title: "Invalid Admin Key",
        description: "The admin key you entered is incorrect.",
        variant: "destructive",
      });
      return;
    }
    
    createBotMutation.mutate(data);
  };

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
            <Card className="glassmorphism border-gray-800">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold gradient-text mb-2">
                  Create Your AI Bot
                </CardTitle>
                <p className="text-gray-400">
                  Build a document-powered chatbot in minutes
                </p>
              </CardHeader>
              
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-6">
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
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="A helpful document assistant" 
                                className="bg-gray-800 border-gray-700" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="greeting"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Greeting Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Hi! I'm here to help you with questions about your documents." 
                              className="bg-gray-800 border-gray-700 resize-none" 
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* API Configuration */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="apiProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Provider</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <FormLabel>API Key</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="sk-..." 
                              className="bg-gray-800 border-gray-700" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Document Upload */}
                    <div>
                      <FormLabel>Upload Documents (Max 2 files)</FormLabel>
                      <div className="file-upload-area rounded-lg p-8 text-center cursor-pointer mt-2">
                        <Upload className="mx-auto text-purple-400 mb-4" size={48} />
                        <p className="text-lg font-medium mb-2">Drop your files here or click to browse</p>
                        <p className="text-sm text-gray-400 mb-4">Supports PDF and DOCX files up to 10MB each</p>
                        <input 
                          type="file" 
                          multiple 
                          accept=".pdf,.docx,.txt" 
                          onChange={handleFileUpload}
                          className="hidden" 
                          id="file-upload"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => document.getElementById('file-upload')?.click()}
                          className="border-purple-500 text-purple-500"
                        >
                          Choose Files
                        </Button>
                      </div>
                      
                      {selectedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <CheckCircle className="text-green-500" size={16} />
                              <span>{file.name}</span>
                              <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Admin Section */}
                    <Card className="glassmorphism border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-4">
                          <Checkbox 
                            id="admin-toggle"
                            checked={showAdminInput}
                            onCheckedChange={(checked) => {
                              setShowAdminInput(checked as boolean);
                              form.setValue('isAdmin', checked as boolean);
                            }}
                          />
                          <label htmlFor="admin-toggle" className="text-sm font-medium">
                            Are you Admin?
                          </label>
                        </div>
                        
                        {showAdminInput && (
                          <FormField
                            control={form.control}
                            name="adminKey"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="Enter admin key..." 
                                    className="bg-gray-800 border-gray-700" 
                                    {...field} 
                                  />
                                </FormControl>
                                <p className="text-xs text-gray-400 mt-2">
                                  Admin key unlocks unlimited bot creation
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </CardContent>
                    </Card>
                    
                    <Button 
                      type="submit" 
                      className="w-full gradient-bg text-white font-semibold text-lg hover:opacity-90"
                      disabled={createBotMutation.isPending}
                    >
                      {createBotMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" size={20} />
                          Creating Bot...
                        </>
                      ) : (
                        'Create Bot'
                      )}
                    </Button>
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
