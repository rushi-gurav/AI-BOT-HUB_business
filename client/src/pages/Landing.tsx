import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, BookOpen, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PWAInstallButton from "@/components/PWAInstallButton";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <PWAInstallButton />
      
      <main className="pt-20">
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-purple-500 bg-opacity-20 px-4 py-2 rounded-full mb-8"
            >
              <Sparkles className="text-purple-400" size={16} />
              <span className="text-sm font-medium text-purple-400">The Future of AI Assistants</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            >
              Craft Your Perfect<br />
              <span className="gradient-text">AI Companion</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
            >
              Build extraordinary AI chatbots with zero coding. Choose from cutting-edge models, customize personalities, and deploy instantly to create unique digital experiences.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Button 
                onClick={() => setLocation('/create-bot')}
                size="lg" 
                className="gradient-bg text-white font-semibold text-lg hover:opacity-90 transition-opacity"
              >
                <Plus className="mr-2" size={20} />
                Start Creating
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="glassmorphism border-gray-600 text-white font-semibold text-lg hover:bg-white hover:bg-opacity-10"
              >
                <BookOpen className="mr-2" size={20} />
                Explore Docs
              </Button>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm text-gray-400"
            >
              new feature added !
            </motion.p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
