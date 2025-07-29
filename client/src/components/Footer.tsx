import { Bot } from "lucide-react";

export default function Footer() {
  return (
    <footer className="glassmorphism mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Bot className="text-white" size={16} />
            </div>
            <span className="text-lg font-bold gradient-text">AI Bot Hub</span>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            by Rushikesh Gurav | Nath IT Solutions Pvt. Ltd.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
