
import { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useSupplierStore } from '@/stores/supplierStore';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { 
  MailPlus, 
  Search, 
  Filter, 
  Mail, 
  Calendar, 
  UserCircle, 
  Clock, 
  ArrowUpRight, 
  Inbox, 
  Send, 
  Archive
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Mock emails for demonstration
const mockEmails = [
  {
    id: '1',
    subject: 'RFQ for Project Components',
    content: 'Hello, I would like to request a quote for the following items...',
    supplier: { id: '1', name: 'Acme Supplies', email: 'sales@acme.com' },
    timestamp: new Date('2025-04-09T14:30:00'),
    status: 'sent',
    attachments: 2,
    read: true
  },
  {
    id: '2',
    subject: 'Follow-up on Quote Request',
    content: 'Following up on our previous request for components...',
    supplier: { id: '2', name: 'TechParts Inc', email: 'info@techparts.com' },
    timestamp: new Date('2025-04-08T09:15:00'),
    status: 'sent',
    attachments: 1,
    read: true
  },
  {
    id: '3',
    subject: 'RE: Quote Request for Custom Parts',
    content: 'Thank you for your inquiry. We can provide the following quotes...',
    supplier: { id: '1', name: 'Acme Supplies', email: 'sales@acme.com' },
    timestamp: new Date('2025-04-07T17:22:00'),
    status: 'received',
    attachments: 3,
    read: false
  },
];

const Emails = () => {
  const selectedProjectId = useProjectStore(state => state.selectedProjectId);
  const projects = useProjectStore(state => state.projects);
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  
  const suppliers = useSupplierStore(state => selectedProjectId ? state.suppliers[selectedProjectId] || [] : []);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const filteredEmails = mockEmails.filter(email => {
    if (activeTab === 'sent' && email.status !== 'sent') return false;
    if (activeTab === 'received' && email.status !== 'received') return false;
    
    return (
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleComposeEmail = () => {
    if (!selectedProjectId) {
      toast({
        title: "No project selected",
        description: "Please select a project before composing an email.",
        variant: "destructive"
      });
      return;
    }
    
    if (suppliers.length === 0) {
      toast({
        title: "No suppliers available",
        description: "Please add suppliers to your project before composing emails.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Feature coming soon",
      description: "The email composition feature is under development."
    });
  };

  if (!selectedProjectId) {
    return (
      <div className="p-6">
        <PageHeader 
          title="Emails" 
          description="Manage your email communications"
        />
        <div className="mt-8 text-center p-6 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-medium">No Project Selected</h3>
          <p className="mt-2 text-muted-foreground">Please select a project to manage email communications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Emails"
        description={`Manage communications for ${selectedProject?.name || 'current project'}`}
      >
        <Button onClick={handleComposeEmail}>
          <MailPlus className="mr-2 h-4 w-4" />
          Compose
        </Button>
      </PageHeader>

      <div className="mt-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search emails..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="received">Received</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <Card>
              <CardHeader className="px-4 py-3">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    <Button variant="ghost" size="sm">
                      <Inbox className="h-4 w-4 mr-2" />
                      Inbox
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Sent
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                {filteredEmails.length > 0 ? (
                  <div>
                    {filteredEmails.map((email) => (
                      <div key={email.id} className="group">
                        <div className={`p-4 hover:bg-muted/50 transition-colors ${!email.read ? 'bg-muted/20' : ''}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-3">
                              <div className="rounded-full bg-primary/10 p-2 mt-1">
                                <Mail className={`h-4 w-4 ${email.status === 'sent' ? 'text-primary' : 'text-muted-foreground'}`} />
                              </div>
                              <div>
                                <h4 className={`font-medium ${!email.read ? 'font-semibold' : ''}`}>{email.subject}</h4>
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                  <UserCircle className="h-3 w-3 mr-1" />
                                  <span>{email.supplier.name}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {email.content}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="flex items-center text-xs text-muted-foreground mb-2">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{format(email.timestamp, 'MMM d, yyyy')}</span>
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{format(email.timestamp, 'h:mm a')}</span>
                              </div>
                              {email.attachments > 0 && (
                                <div className="text-xs bg-muted px-2 py-1 rounded mt-2">
                                  {email.attachments} attachment{email.attachments > 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Separator />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <h3 className="text-lg font-medium">No Emails Found</h3>
                    <p className="mt-2 text-muted-foreground">
                      {searchQuery 
                        ? "No emails match your search criteria." 
                        : "You don't have any emails yet."}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between items-center p-4">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredEmails.length} email{filteredEmails.length !== 1 ? 's' : ''}
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="sent" className="mt-0">
            {/* This content is identical to the "all" tab but with filtered results */}
            <Card>
              <CardHeader className="px-4 py-3">
                <CardTitle>Sent Emails</CardTitle>
                <CardDescription>
                  All emails you've sent to suppliers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Email list content */}
                {filteredEmails.length > 0 ? (
                  <div>
                    {filteredEmails.map((email) => (
                      <div key={email.id} className="group">
                        <div className="p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-3">
                              <div className="rounded-full bg-primary/10 p-2 mt-1">
                                <Send className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium">{email.subject}</h4>
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                  <UserCircle className="h-3 w-3 mr-1" />
                                  <span>To: {email.supplier.name}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {email.content}
                                </p>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(email.timestamp, 'MMM d, yyyy • h:mm a')}
                            </div>
                          </div>
                        </div>
                        <Separator />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <h3 className="text-lg font-medium">No Sent Emails Found</h3>
                    <p className="mt-2 text-muted-foreground">
                      You haven't sent any emails yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="received" className="mt-0">
            {/* Similar to "sent" tab but for received emails */}
            <Card>
              <CardHeader className="px-4 py-3">
                <CardTitle>Received Emails</CardTitle>
                <CardDescription>
                  All emails you've received from suppliers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Email list content */}
                {filteredEmails.length > 0 ? (
                  <div>
                    {filteredEmails.map((email) => (
                      <div key={email.id} className="group">
                        <div className="p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-3">
                              <div className="rounded-full bg-primary/10 p-2 mt-1">
                                <Inbox className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium">{email.subject}</h4>
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                  <UserCircle className="h-3 w-3 mr-1" />
                                  <span>From: {email.supplier.name}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {email.content}
                                </p>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(email.timestamp, 'MMM d, yyyy • h:mm a')}
                            </div>
                          </div>
                        </div>
                        <Separator />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <h3 className="text-lg font-medium">No Received Emails Found</h3>
                    <p className="mt-2 text-muted-foreground">
                      You haven't received any emails yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Emails;
