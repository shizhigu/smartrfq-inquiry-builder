
import { useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function PaymentCanceled() {
  useEffect(() => {
    toast("Payment was canceled", {
      description: "You can try again anytime"
    });
  }, []);

  return (
    <div className="page-container">
      <PageHeader 
        title="Payment Canceled" 
        description="Your payment process was canceled"
      />

      <div className="max-w-md mx-auto mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-amber-100 p-3">
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <CardTitle className="text-center">Payment Canceled</CardTitle>
            <CardDescription className="text-center">
              Your payment process was not completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              No worries! You can try again whenever you're ready.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" asChild>
                <Link to="/dashboard">Return to Dashboard</Link>
              </Button>
              <Button asChild>
                <Link to="/dashboard/subscription">Try Again</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
