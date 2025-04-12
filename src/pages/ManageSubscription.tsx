import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, CreditCard, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@clerk/clerk-react";

type PricingPlan = {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  description: string;
  features: string[];
  popular?: boolean;
};

const plans: PricingPlan[] = [
  {
    id: "price_free",
    name: "Free",
    price: 0,
    interval: "month",
    description: "Essential features for small projects",
    features: [
      "1 active project",
      "10 RFQ items per project",
      "5 suppliers per project",
      "Basic email templates",
      "Email support"
    ]
  },
  {
    id: "price_pro_monthly",
    name: "Pro",
    price: 49,
    interval: "month",
    description: "Everything you need for growing businesses",
    features: [
      "10 active projects",
      "Unlimited RFQ items",
      "Unlimited suppliers",
      "Advanced email templates",
      "Custom fields",
      "Priority email support",
      "CSV/Excel export"
    ],
    popular: true
  },
  {
    id: "price_enterprise_monthly",
    name: "Enterprise",
    price: 149,
    interval: "month",
    description: "Advanced features for large organizations",
    features: [
      "Unlimited active projects",
      "Unlimited RFQ items",
      "Unlimited suppliers",
      "Custom workflow automation",
      "Advanced analytics & reporting",
      "API access",
      "Dedicated account manager",
      "SSO and SAML",
      "Phone support"
    ]
  }
];

export default function ManageSubscription() {
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const { userId } = useAuth();
  
  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };
  
  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    setProcessingPayment(true);
    
    try {
      // In a real implementation, this would call your Supabase Edge Function
      // that integrates with Stripe
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, we'll just show toast success
      // In reality, we'd redirect to Stripe Checkout here
      toast.success("Redirecting to secure payment page...");
      
      // Mock redirect to Stripe
      setTimeout(() => {
        window.location.href = "#stripe-checkout";
      }, 1000);
      
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("There was a problem processing your payment");
    } finally {
      setProcessingPayment(false);
    }
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };
  
  const adjustedPlans = plans.map(plan => ({
    ...plan,
    price: billingInterval === "year" ? plan.price * 10 : plan.price
  }));

  return (
    <div className="page-container">
      <PageHeader 
        title="Manage Subscription" 
        description="Manage your subscription plan"
      />

      <div className="flex justify-center mb-8">
        <div className="bg-muted rounded-lg p-1 inline-flex">
          <Button
            variant={billingInterval === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => setBillingInterval("month")}
          >
            Monthly
          </Button>
          <Button
            variant={billingInterval === "year" ? "default" : "ghost"}
            size="sm"
            onClick={() => setBillingInterval("year")}
          >
            Yearly
            <span className="ml-1.5 rounded-full bg-primary-foreground text-primary px-2 py-0.5 text-xs">
              Save 17%
            </span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {adjustedPlans.map(plan => (
          <Card 
            key={plan.id}
            className={`flex flex-col ${plan.popular ? 'border-primary shadow-md relative' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground ml-1">/{billingInterval}</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleSelectPlan(plan.id)}
                disabled={processingPayment || plan.price === 0}
              >
                {plan.price === 0 
                  ? "Current Plan" 
                  : selectedPlan === plan.id 
                    ? "Selected" 
                    : `Subscribe to ${plan.name}`}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedPlan && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" /> 
              Payment Information
            </CardTitle>
            <CardDescription>
              Complete your subscription by proceeding to secure checkout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm">
                  You'll be redirected to our secure payment processor to complete your subscription.
                  Your payment information is encrypted and secure.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              variant="outline" 
              className="mr-2"
              onClick={() => setSelectedPlan(null)}
              disabled={processingPayment}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubscribe}
              disabled={processingPayment}
            >
              {processingPayment ? "Processing..." : "Proceed to Payment"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
