import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Zap, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center mr-3">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">WebToApp AI</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Pricing
            </Link>
            <Link href="/contact-us" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Contact Us
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                  Dashboard
                </Link>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                  Login
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-3">
            <Link 
              href="#features" 
              className="block text-slate-600 hover:text-slate-900 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="#pricing" 
              className="block text-slate-600 hover:text-slate-900 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="/contact-us" 
              className="block text-slate-600 hover:text-slate-900 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact Us
            </Link>
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="block text-slate-600 hover:text-slate-900 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Button variant="outline" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className="block text-slate-600 hover:text-slate-900 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
