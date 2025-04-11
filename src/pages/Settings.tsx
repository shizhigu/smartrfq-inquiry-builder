
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  User, 
  KeyRound, 
  BellRing, 
  Palette, 
  Globe, 
  CreditCard,
  Shield,
  Mail,
  AlertTriangle
} from "lucide-react";

export default function Settings() {
  const [personalInfo, setPersonalInfo] = useState({
    name: "John Doe",
    email: "john@example.com",
    title: "Procurement Manager",
    company: "Acme Inc",
  });

  const [notifications, setNotifications] = useState({
    newSupplierResponse: true,
    rfqUpdates: true,
    systemAnnouncements: true,
    marketingEmails: false,
    weeklyDigest: true,
    emailReplies: true,
  });

  const [appearance, setAppearance] = useState({
    theme: "system",
    compactMode: false,
    highContrastMode: false,
  });

  const handlePersonalInfoChange = (field: string, value: string) => {
    setPersonalInfo({
      ...personalInfo,
      [field]: value,
    });
  };

  const handleSavePersonalInfo = () => {
    // In a real app, this would call an API to update user info
    toast.success("Personal information updated successfully");
  };

  const handleToggleNotification = (field: string) => {
    setNotifications({
      ...notifications,
      [field]: !notifications[field as keyof typeof notifications],
    });
  };

  const handleChangePassword = () => {
    // In a real app with Clerk, this would trigger a password reset flow
    toast.success("Password reset email sent to your inbox");
  };

  const handleDeleteAccount = () => {
    // This would normally show a confirmation dialog
    toast.error("Account deletion requires confirmation");
  };

  return (
    <div className="page-container">
      <PageHeader 
        title="Settings" 
        description="Manage your account settings and preferences"
      />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <KeyRound className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <BellRing className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="h-4 w-4 mr-2" />
            Billing
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information and profile settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={personalInfo.name} 
                      onChange={(e) => handlePersonalInfoChange("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={personalInfo.email} 
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Contact support to change your email address
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input 
                      id="title" 
                      value={personalInfo.title} 
                      onChange={(e) => handlePersonalInfoChange("title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input 
                      id="company" 
                      value={personalInfo.company} 
                      onChange={(e) => handlePersonalInfoChange("company", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Profile Picture</h3>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      Upload Photo
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, GIF or PNG. Max size 1MB.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select 
                  id="language"
                  className="flex h-9 w-full md:w-1/3 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="fr-FR">French (France)</option>
                  <option value="de-DE">German</option>
                  <option value="es-ES">Spanish</option>
                </select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSavePersonalInfo}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <KeyRound className="h-5 w-5 mr-2 text-primary" />
                  Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm">
                    We'll send a secure link to your email to reset your password.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleChangePassword}>
                  Send Password Reset Link
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Authenticator App</p>
                    <p className="text-sm text-muted-foreground">
                      Use an authenticator app to generate verification codes
                    </p>
                  </div>
                  <Button variant="outline">Setup</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Verification</p>
                    <p className="text-sm text-muted-foreground">
                      Receive verification codes via SMS
                    </p>
                  </div>
                  <Button variant="outline">Setup</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Proceed with caution - these actions cannot be undone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-destructive/50 p-4">
                  <h3 className="font-medium text-destructive">Delete Account</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Once you delete your account, all of your data will be permanently removed. This action cannot be undone.
                  </p>
                  <Button variant="destructive" size="sm" className="mt-4" onClick={handleDeleteAccount}>
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what types of notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-primary" />
                  Email Notifications
                </h3>
                
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, enabled]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{
                          key.replace(/([A-Z])/g, ' $1')
                             .replace(/^./, str => str.toUpperCase())
                        }</p>
                        <p className="text-sm text-muted-foreground">
                          {getNotificationDescription(key)}
                        </p>
                      </div>
                      <Switch 
                        checked={enabled} 
                        onCheckedChange={() => handleToggleNotification(key)}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-medium flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-primary" />
                  Browser Notifications
                </h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when you're using the app
                    </p>
                  </div>
                  <Button variant="outline">
                    {Notification?.permission === 'granted' 
                      ? 'Enabled' 
                      : 'Enable Notifications'}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the appearance of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Theme</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div 
                    className={`border rounded-md p-4 cursor-pointer ${
                      appearance.theme === 'light' ? 'border-primary ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setAppearance({...appearance, theme: 'light'})}
                  >
                    <div className="h-12 bg-white border rounded-md mb-2"></div>
                    <p className="text-sm font-medium">Light</p>
                  </div>
                  <div 
                    className={`border rounded-md p-4 cursor-pointer ${
                      appearance.theme === 'dark' ? 'border-primary ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setAppearance({...appearance, theme: 'dark'})}
                  >
                    <div className="h-12 bg-slate-800 border rounded-md mb-2"></div>
                    <p className="text-sm font-medium">Dark</p>
                  </div>
                  <div 
                    className={`border rounded-md p-4 cursor-pointer ${
                      appearance.theme === 'system' ? 'border-primary ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setAppearance({...appearance, theme: 'system'})}
                  >
                    <div className="h-12 bg-gradient-to-r from-white to-slate-800 border rounded-md mb-2"></div>
                    <p className="text-sm font-medium">System</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Accessibility</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Compact Mode</p>
                      <p className="text-sm text-muted-foreground">
                        Reduce spacing and padding throughout the interface
                      </p>
                    </div>
                    <Switch 
                      checked={appearance.compactMode} 
                      onCheckedChange={(checked) => 
                        setAppearance({...appearance, compactMode: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">High Contrast Mode</p>
                      <p className="text-sm text-muted-foreground">
                        Increase contrast for better visibility
                      </p>
                    </div>
                    <Switch 
                      checked={appearance.highContrastMode} 
                      onCheckedChange={(checked) => 
                        setAppearance({...appearance, highContrastMode: checked})
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-primary" />
                Billing Information
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              <div className="rounded-lg border border-dashed p-8 text-center">
                <CreditCard className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium text-lg mb-2">Manage Your Subscription</h3>
                <p className="text-muted-foreground mb-4">
                  View and manage your subscription details from the payment page
                </p>
                <Button asChild>
                  <a href="/dashboard/payment">Go to Payment Page</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to generate notification descriptions
function getNotificationDescription(key: string): string {
  const descriptions: Record<string, string> = {
    newSupplierResponse: "Get notified when a supplier responds to your RFQ",
    rfqUpdates: "Receive updates about your RFQ items",
    systemAnnouncements: "Important announcements about the platform",
    marketingEmails: "Promotional emails and special offers",
    weeklyDigest: "Weekly summary of your RFQ activity",
    emailReplies: "Get notified when someone replies to your emails",
  };
  
  return descriptions[key] || "Notification preference";
}
