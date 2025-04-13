
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Sparkles, Star, UserRound, Mail, Phone, FileText, Facebook, Twitter, Instagram, ChevronDown, ChevronUp } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Index() {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah Johnson",
      text: "Eternify helped me create a beautiful memorial for my father. The AI-generated content captured his personality perfectly.",
      rating: 5
    },
    {
      name: "Michael Reynolds",
      text: "I was struggling to find the right words, but Eternify made it easy to design a dignified tribute for my grandmother.",
      rating: 5
    },
    {
      name: "Amelia Chen",
      text: "The personalization options are incredible. Our family was touched by how special the memorial turned out.",
      rating: 4
    }
  ];

  const faqs = [
    {
      question: "How does Eternify's AI technology work?",
      answer: "Eternify uses advanced natural language processing to create personalized memorial content based on information you provide about your loved one. Our AI analyzes this information to generate meaningful tributes that capture their essence."
    },
    {
      question: "Can I customize the design of the memorial?",
      answer: "Absolutely. Eternify offers a wide range of customization options including themes, layouts, fonts, and color schemes. You can also upload photos and personal mementos to make the memorial truly unique."
    },
    {
      question: "How long does it take to create a memorial?",
      answer: "The basic memorial can be generated in minutes. You can then take as much time as you need to refine and personalize it until you're completely satisfied with the result."
    },
    {
      question: "Is my personal information secure?",
      answer: "Yes, we take privacy and security very seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your explicit consent."
    }
  ];

  const handleNextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="inline-block bg-brand-blue/10 px-4 py-1.5 rounded-full text-brand-blue font-medium text-sm mb-2">
                AI-Powered Memorial Design
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Eternify – A Personalized AI Memorial Designer
              </h1>
              
              <p className="text-xl text-gray-600 max-w-2xl">
                Create meaningful, beautiful memorials for your loved ones with the help of AI. Preserve their stories, celebrate their lives, and share their legacy.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <SignedIn>
                  <Button 
                    size="lg" 
                    className="bg-brand-blue hover:bg-brand-blue-dark text-white px-8 w-full sm:w-auto"
                    onClick={() => navigate('/dashboard')}
                  >
                    Create a Memorial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </SignedIn>
                
                <SignedOut>
                  <Button 
                    size="lg" 
                    className="bg-brand-blue hover:bg-brand-blue-dark text-white px-8 w-full sm:w-auto"
                    onClick={() => navigate('/sign-up')}
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={() => navigate('/sign-in')}
                  >
                    Sign In
                  </Button>
                </SignedOut>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <div className="relative z-10 rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1594668951152-e24f57e34aef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80" 
                  alt="Memorial Preview" 
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg z-20 max-w-xs">
                <p className="text-sm italic text-gray-700">
                  "John was a loving father and husband who touched countless lives with his kindness and wisdom."
                </p>
                <div className="flex items-center mt-2">
                  <Sparkles className="h-4 w-4 text-brand-blue mr-2" />
                  <span className="text-xs text-gray-500">AI-generated tribute</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Eternify Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform makes it easy to create beautiful, personalized memorials in minutes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-none shadow-md">
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-brand-blue rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Share Their Story</h3>
                <p className="text-gray-600">
                  Tell us about your loved one's life, personality, and special memories to fuel our AI.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-none shadow-md">
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-brand-blue rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Crafts Content</h3>
                <p className="text-gray-600">
                  Our AI generates personalized tributes, stories, and reflections based on your input.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-none shadow-md">
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-brand-blue rounded-full flex items-center justify-center mb-4">
                  <ArrowRight className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Share & Preserve</h3>
                <p className="text-gray-600">
                  Customize the design, then share the memorial with family and friends or keep it private.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands who have created memorable tributes for their loved ones.
            </p>
          </div>
          
          <div className="relative max-w-3xl mx-auto">
            <button 
              onClick={handlePrevTestimonial}
              className="absolute top-1/2 -left-4 md:-left-10 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10"
              aria-label="Previous testimonial"
            >
              <ChevronUp className="rotate-90" />
            </button>
            
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-10">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              
              <p className="text-lg md:text-xl text-gray-700 italic mb-6">
                "{testimonials[activeTestimonial].text}"
              </p>
              
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                  <UserRound className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <h4 className="font-semibold">{testimonials[activeTestimonial].name}</h4>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleNextTestimonial}
              className="absolute top-1/2 -right-4 md:-right-10 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10"
              aria-label="Next testimonial"
            >
              <ChevronDown className="rotate-90" />
            </button>
          </div>
          
          <div className="flex justify-center space-x-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`h-2 w-2 rounded-full ${
                  index === activeTestimonial ? "bg-brand-blue" : "bg-gray-300"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-white">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to know about creating AI-powered memorials.
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-brand-blue to-purple-700 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Create a Lasting Memorial Today
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Honor your loved one with a beautiful, personalized memorial that preserves their legacy.
          </p>
          
          <SignedIn>
            <Button 
              size="lg" 
              className="bg-white text-brand-blue hover:bg-gray-100 px-8"
              onClick={() => navigate('/dashboard')}
            >
              Start Creating
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </SignedIn>
          
          <SignedOut>
            <Button 
              size="lg" 
              className="bg-white text-brand-blue hover:bg-gray-100 px-8"
              onClick={() => navigate('/sign-up')}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </SignedOut>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 md:px-8 lg:px-16">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Eternify</h3>
              <p className="text-gray-400 mb-4">
                AI-powered memorial design platform to honor and remember your loved ones.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Home</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-gray-400" />
                  <a href="mailto:support@eternify.com" className="text-gray-400 hover:text-white">support@eternify.com</a>
                </li>
                <li className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-gray-400" />
                  <a href="tel:+1-800-eternify" className="text-gray-400 hover:text-white">+1-800-ETERNIFY</a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Eternify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
