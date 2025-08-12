import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import CreateBot from "@/pages/CreateBot";
import Bots from "@/pages/Bots";
import Chat from "@/pages/Chat";
import Premium from "@/pages/Premium";
import Embed from "@/pages/Embed";
import EditBot from "@/pages/EditBot";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/create-bot" component={CreateBot} />
      <Route path="/bots" component={Bots} />
      <Route path="/chat/:botId" component={Chat} />
      <Route path="/edit-bot/:botId" component={EditBot} />
      <Route path="/premium" component={Premium} />
      <Route path="/embed/:botId" component={Embed} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark min-h-screen bg-black text-white">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
