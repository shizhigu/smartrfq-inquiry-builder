
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart, CheckCircle, ChevronDown, ChevronUp, Facebook, FileText, Instagram, Mail, MessageSquare, Phone, PieChart, Search, Send, Settings, ShoppingCart, Twitter, Upload, UserRound, Users } from "lucide-react";
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
      text: "This platform has revolutionized our RFQ process. We're saving hours on each quotation cycle and getting better pricing from suppliers.",
      rating: 5
    },
    {
      name: "Michael Reynolds",
      text: "The email management system integrated with supplier tracking has dramatically improved our procurement workflow efficiency.",
      rating: 5
    },
    {
      name: "Amelia Chen",
      text: "The analytics dashboard gives us insights we never had before. We can now make data-driven decisions for our procurement strategy.",
      rating: 4
    }
  ];

  const faqs = [
    {
      question: "How does the RFQ management system work?",
      answer: "Our platform streamlines the RFQ process by allowing you to create, manage, and track requests for quotations all in one place. You can upload specifications, select preferred suppliers, and automatically send inquiries. The system then collects and organizes responses, making it easy to compare offers and select the best option."
    },
    {
      question: "Can I integrate with my existing supplier database?",
      answer: "Yes, our platform supports importing supplier data from various formats. You can also manually add suppliers and organize them into categories. Once imported, you can manage all your supplier relationships, track performance, and maintain communication history in one centralized system."
    },
    {
      question: "How does the email management feature work?",
      answer: "Our email management system is specifically designed for procurement communications. It keeps all supplier correspondence organized by project and RFQ, allows for template-based communication, and provides tracking for sent inquiries and received quotations. This ensures no important messages are missed and maintains a clear record of all communications."
    },
    {
      question: "What kind of reports and analytics are available?",
      answer: "Our platform offers comprehensive analytics including supplier performance metrics, price trend analysis, response time tracking, and project-based cost reports. You can generate custom reports to gain insights into your procurement process efficiency and identify opportunities for cost savings and process improvements."
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
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="inline-block bg-blue-600/10 px-4 py-1.5 rounded-full text-blue-600 font-medium text-sm mb-2">
                Streamlined Procurement Platform
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                RFQ & Supplier Management Made Simple
              </h1>
              
              <p className="text-xl text-gray-600 max-w-2xl">
                Streamline your procurement process with our all-in-one platform. Create RFQs, manage suppliers, track communications, and analyze performance data in one place.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <SignedIn>
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 w-full sm:w-auto"
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </SignedIn>
                
                <SignedOut>
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 w-full sm:w-auto"
                    onClick={() => navigate('/sign-up')}
                  >
                    Start Free Trial
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
                  src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80" 
                  alt="Dashboard Preview" 
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg z-20 max-w-xs">
                <p className="text-sm text-gray-700">
                  "RFQ response rate increased by 40% since implementing this platform."
                </p>
                <div className="flex items-center mt-2">
                  <BarChart className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-xs text-gray-500">Analytics snapshot</span>
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
              Comprehensive Procurement Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform offers everything you need to optimize your procurement process from end to end.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-md">
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">RFQ Management</h3>
                <p className="text-gray-600">
                  Create, manage, and track RFQs in one centralized system. Easily compare supplier quotes and select the best options.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-md">
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Supplier Database</h3>
                <p className="text-gray-600">
                  Maintain a comprehensive supplier database with performance metrics, contact information, and communication history.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-md">
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Email Integration</h3>
                <p className="text-gray-600">
                  Manage all procurement-related communications in one place. Track conversations and never miss important supplier responses.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-md">
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <PieChart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600">
                  Gain insights into your procurement process with comprehensive analytics and customizable reports.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-md">
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Document Management</h3>
                <p className="text-gray-600">
                  Upload, store, and share important procurement documents securely with your team and suppliers.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-md">
              <CardContent className="pt-6">
                <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Custom Workflows</h3>
                <p className="text-gray-600">
                  Configure workflows to match your procurement process. Automate repetitive tasks and improve efficiency.
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
              Join thousands of procurement professionals who have transformed their workflow.
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
                  <CheckCircle key={i} className="h-5 w-5 text-yellow-400" />
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
                  index === activeTestimonial ? "bg-blue-600" : "bg-gray-300"
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
              Everything you need to know about our procurement management platform.
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
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Transform Your Procurement Process Today
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of companies that have streamlined their RFQ management and supplier communications.
          </p>
          
          <SignedIn>
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-8"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </SignedIn>
          
          <SignedOut>
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-8"
              onClick={() => navigate('/sign-up')}
            >
              Start Your Free Trial
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
              <h3 className="text-xl font-bold mb-4">ProcureFlow</h3>
              <p className="text-gray-400 mb-4">
                Advanced procurement management platform for streamlined RFQ processes and supplier communications.
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
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">RFQ Management</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Supplier Database</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Email Integration</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Analytics</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Data Processing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-gray-400" />
                  <a href="mailto:support@procureflow.com" className="text-gray-400 hover:text-white">support@procureflow.com</a>
                </li>
                <li className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-gray-400" />
                  <a href="tel:+1-800-PROCURE" className="text-gray-400 hover:text-white">+1-800-PROCURE</a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} ProcureFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
