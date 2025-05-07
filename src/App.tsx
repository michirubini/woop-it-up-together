
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileSetup from "./pages/ProfileSetup";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import CreateWoop from "./pages/CreateWoop";
import SearchWoop from "./pages/SearchWoop";
import WoopDetail from "./pages/WoopDetail";
import Notifications from "./pages/Notifications";
import Community from "./pages/Community";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile-setup" element={<ProfileSetup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/create-woop" element={<CreateWoop />} />
              <Route path="/search" element={<SearchWoop />} />
              <Route path="/woop/:woopId" element={<WoopDetail />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/community" element={<Community />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
