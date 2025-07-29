import { motion } from "framer-motion";
import { Crown, Check, ArrowLeft, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";

const premiumFeatures = [
  {
    icon: <Sparkles className="text-green-400" size={20} />,
    title: "Unlimited bot creation",
    description: "Create as many AI assistants as you need"
  },
  {
    icon: <Check className="text-green-400" size={20} />,
    title: "Advanced analytics dashboard",
    description: "Detailed insights into bot performance and usage"
  },
  {
    icon: <Check className="text-green-400" size={20} />,
    title: "Priority support",
    description: "Get help faster with dedicated support"
  },
  {
    icon: <Check className="text-green-400" size={20} />,
    title: "Custom branding options",
    description: "White-label your bots with custom branding"
  },
  {
    icon: <Check className="text-green-400" size={20} />,
    title: "Advanced file processing",
    description: "Support for more file types and larger documents"
  },
  {
    icon: <Check className="text-green-400" size={20} />,
    title: "API access",
    description: "Integrate bots with your existing systems"
  }
];

export default function Premium() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="pt-20 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glassmorphism border-gray-800 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
              
              <CardHeader className="text-center relative z-10">
                <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
                  <Crown className="text-white" size={32} />
                </div>
                
                <CardTitle className="text-3xl font-bold gradient-text mb-4">
                  Upgrade to Premium
                </CardTitle>
                <p className="text-xl text-gray-300">
                  You've reached the limit of 2 bots. Upgrade to create unlimited AI assistants and unlock advanced features.
                </p>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="space-y-4 mb-8">
                  {premiumFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-3 rounded-lg bg-white bg-opacity-5"
                    >
                      {feature.icon}
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{feature.title}</h4>
                        <p className="text-sm text-gray-400">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Pricing */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-center mb-8"
                >
                  <div className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 p-[1px] rounded-lg mb-4">
                    <div className="bg-black px-6 py-4 rounded-lg">
                      <div className="text-3xl font-bold gradient-text">$29</div>
                      <div className="text-sm text-gray-400">per month</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    Cancel anytime • 14-day free trial
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <Button 
                    size="lg"
                    className="gradient-bg text-white font-semibold text-lg hover:opacity-90 transition-opacity"
                  >
                    <Crown className="mr-2" size={20} />
                    Start Free Trial
                  </Button>
                  <Button 
                    onClick={() => setLocation('/bots')}
                    variant="outline" 
                    size="lg"
                    className="glassmorphism border-gray-600 text-white font-semibold text-lg hover:bg-white hover:bg-opacity-10"
                  >
                    <ArrowLeft className="mr-2" size={20} />
                    Go Back
                  </Button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-center mt-8"
                >
                  <p className="text-sm text-gray-400 mb-4">
                    Or enter admin key for unlimited access
                  </p>
                  
                  <Card className="glassmorphism border-purple-500 border-opacity-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="password"
                          placeholder="Enter admin key..."
                          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                        />
                        <Button 
                          size="sm"
                          className="bg-purple-500 hover:bg-purple-600"
                        >
                          Verify
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-left">
                        Admin key unlocks all premium features instantly
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
                
                {/* Trust indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="flex items-center justify-center space-x-6 mt-8 pt-6 border-t border-gray-800"
                >
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-400">✓ Secure</div>
                    <div className="text-xs text-gray-500">SSL Encrypted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-400">✓ Private</div>
                    <div className="text-xs text-gray-500">Your Data</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-400">✓ Support</div>
                    <div className="text-xs text-gray-500">24/7 Help</div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
