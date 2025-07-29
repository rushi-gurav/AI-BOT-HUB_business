import { Bot, Settings, FileText, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [location] = useLocation();

  return (
    <header className="glassmorphism fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
              <Bot className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">AI Bot Hub</h1>
              <p className="text-xs text-gray-400">by Rushikesh Gurav | Nath IT Solutions</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/bots" className={`text-gray-300 hover:text-white transition-colors ${location === '/bots' ? 'text-white' : ''}`}>
              <Settings className="inline mr-1" size={16} />
              Dashboard
            </Link>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <FileText className="inline mr-1" size={16} />
              Docs
            </a>
            <Link href="/bots">
              <Button variant="outline" size="sm" className="border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white">
                <Settings size={16} className="mr-2" />
                Back
              </Button>
            </Link>
          </nav>
          
          <button className="md:hidden text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
