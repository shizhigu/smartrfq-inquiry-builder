
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";

export default function Index() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block bg-brand-blue/10 px-4 py-1.5 rounded-full text-brand-blue font-medium text-sm mb-6">
          Manufacturing RFQ Management Platform
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Streamline your RFQ process with <span className="text-brand-blue">SmartRFQ</span>
        </h1>
        
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          AI-powered platform to help manufacturing teams automate their Request-for-Quotation workflow.
          Extract part data, manage suppliers, and send structured inquiries in one place.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <SignedIn>
            <Button 
              size="lg" 
              className="bg-brand-blue hover:bg-brand-blue-dark text-white px-8"
              onClick={() => navigate('/dashboard')}
            >
              Enter Dashboard 
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/dashboard/projects')}
            >
              View Projects
            </Button>
          </SignedIn>
          
          <SignedOut>
            <Button 
              size="lg" 
              className="bg-brand-blue hover:bg-brand-blue-dark text-white px-8"
              onClick={() => navigate('/sign-in')}
            >
              Sign In
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/sign-up')}
            >
              Create Account
            </Button>
          </SignedOut>
        </div>
        
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="rounded-lg overflow-hidden border shadow-lg">
            <img 
              src="https://placehold.co/1200x600/e5e7eb/818cf8?text=SmartRFQ+Dashboard+Preview" 
              alt="SmartRFQ Dashboard" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
