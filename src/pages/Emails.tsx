
import { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useSupplierStore } from '@/stores/supplierStore';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { 
  MailPlus, 
  Search, 
  Filter, 
  MessageCircle, 
  Calendar,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardFooter 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { EmailConversation } from '@/components/emails/EmailConversation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Mock conversations for demonstration
const mockConversations = [
  {
    id: 'conv1',
    projectId: 'project1',
    supplierId: '1',
    subject: 'RFQ for Project Components',
    lastMessagePreview: 'Thank you for your inquiry. We can provide the following quotes...',
    lastMessageDate: new Date('2025-04-09T14:30:00'),
    unreadCount: 2,
    messageCount: 4
  },
  {
    id: 'conv2',
    projectId: 'project1',
    supplierId: '2',
    subject: 'Quote Request for Custom Parts',
    lastMessagePreview: 'We have reviewed your request and would like to discuss the specifications further...',
    lastMessageDate: new Date('2025-04-08T09:15:00'),
    unreadCount: 0,
    messageCount: 3
  },
  {
    id: 'conv3',
    projectId: 'project2',
    supplierId: '1',
    subject: 'Follow-up on Manufacturing Timeline',
    lastMessagePreview: 'Based on your requirements, we can deliver the components by the end of next month...',
    lastMessageDate: new Date('2025-04-07T17:22:00'),
    unreadCount: 1,
    messageCount: 5
  },
];

// Mock emails for a specific conversation
const mockEmailsForConversation = {
  'conv1': [
    {
      id: 'email1',
      conversationId: 'conv1',
      subject: 'RFQ for Project Components',
      content: 'Hello, I would like to request a quote for the following items...',
      from: { id: 'user', name: 'Me', email: 'me@company.com' },
      to: { id: '1', name: 'Acme Supplies', email: 'sales@acme.com' },
      timestamp: new Date('2025-04-05T14:30:00'),
      attachments: 2,
      read: true
    },
    {
      id: 'email2',
      conversationId: 'conv1',
      subject: 'RE: RFQ for Project Components',
      content: 'Thank you for your inquiry. We can provide the following quotes...',
      from: { id: '1', name: 'Acme Supplies', email: 'sales@acme.com' },
      to: { id: 'user', name: 'Me', email: 'me@company.com' },
      timestamp: new Date('2025-04-06T09:45:00'),
      attachments: 1,
      read: true
    },
    {
      id: 'email3',
      conversationId: 'conv1',
      subject: 'RE: RFQ for Project Components',
      content: 'Thank you for the quote. I have a few questions about the specifications...',
      from: { id: 'user', name: 'Me', email: 'me@company.com' },
      to: { id: '1', name: 'Acme Supplies', email: 'sales@acme.com' },
      timestamp: new Date('2025-04-07T11:20:00'),
      attachments: 0,
      read: true
    },
    {
      id: 'email4',
      conversationId: 'conv1',
      subject: 'RE: RFQ for Project Components',
      content: 'Here are the answers to your questions about the specifications. Please let me know if you need any further clarification...',
      from: { id: '1', name: 'Acme Supplies', email: 'sales@acme.com' },
      to: { id: 'user', name: 'Me', email: 'me@company.com' },
      timestamp: new Date('2025-04-09T14:30:00'),
      attachments: 1,
      read: false
    }
  ]
};

const Emails = () => {
  const selectedProjectId = useProjectStore(state => state.selectedProjectId);
  const projects = useProjectStore(state => state.projects);
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  
  const suppliers = useSupplierStore(state => selectedProjectId ? state.suppliers[selectedProjectId] || [] : []);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  
  // Filter conversations based on search query and current project
  const filteredConversations = mockConversations.filter(conv => {
    // First filter by project
    if (selectedProjectId && conv.projectId !== selectedProjectId) return false;
    
    // Then filter by tab
    if (activeTab === 'unread' && conv.unreadCount === 0) return false;
    
    // Finally filter by search query
    if (searchQuery) {
      const supplier = suppliers.find(s => s.id === conv.supplierId);
      return (
        conv.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (supplier && supplier.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        conv.lastMessagePreview.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return true;
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
  
  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown Supplier';
  };
  
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };
  
  const handleBackToList = () => {
    setSelectedConversation(null);
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

  if (selectedConversation) {
    // Show the conversation view
    const emails = mockEmailsForConversation[selectedConversation as keyof typeof mockEmailsForConversation] || [];
    const conversation = mockConversations.find(c => c.id === selectedConversation);
    
    return (
      <div className="p-6">
        <PageHeader
          title={
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToList}
                className="mr-2"
              >
                <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
                Back
              </Button>
              <span>{conversation?.subject || 'Conversation'}</span>
            </div>
          }
          description={`Conversation with ${getSupplierName(conversation?.supplierId || '')}`}
        >
          <Button onClick={handleComposeEmail}>
            <MailPlus className="mr-2 h-4 w-4" />
            Reply
          </Button>
        </PageHeader>
        
        <div className="mt-6">
          <EmailConversation emails={emails} />
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
              placeholder="Search conversations..."
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
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="all">All Conversations</TabsTrigger>
            <TabsTrigger value="unread">Unread ({mockConversations.reduce((acc, conv) => acc + conv.unreadCount, 0)})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <Card>
              <CardHeader className="px-4 py-3">
                <div className="text-sm font-medium">
                  {filteredConversations.length} Conversation{filteredConversations.length !== 1 ? 's' : ''}
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                {filteredConversations.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Last Message</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredConversations.map((conversation) => (
                        <TableRow 
                          key={conversation.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSelectConversation(conversation.id)}
                        >
                          <TableCell className="font-medium">
                            {getSupplierName(conversation.supplierId)}
                          </TableCell>
                          <TableCell>{conversation.subject}</TableCell>
                          <TableCell className="max-w-[300px] truncate">
                            {conversation.lastMessagePreview}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1 text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span className="text-xs">{format(conversation.lastMessageDate, 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-muted-foreground mt-1">
                              <Clock className="h-3 w-3" />
                              <span className="text-xs">{format(conversation.lastMessageDate, 'h:mm a')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {conversation.unreadCount > 0 ? (
                              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {conversation.unreadCount} unread
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">
                                Read
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-8">
                    <h3 className="text-lg font-medium">No Conversations Found</h3>
                    <p className="mt-2 text-muted-foreground">
                      {searchQuery 
                        ? "No conversations match your search criteria." 
                        : "You don't have any conversations yet."}
                    </p>
                  </div>
                )}
              </CardContent>
              {filteredConversations.length > 10 && (
                <CardFooter className="flex justify-between items-center p-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
                  </div>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="unread" className="mt-0">
            <Card>
              <CardHeader className="px-4 py-3">
                <div className="text-sm font-medium">
                  {filteredConversations.length} Unread Conversation{filteredConversations.length !== 1 ? 's' : ''}
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                {filteredConversations.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Last Message</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Unread</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredConversations.map((conversation) => (
                        <TableRow 
                          key={conversation.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSelectConversation(conversation.id)}
                        >
                          <TableCell className="font-medium">
                            {getSupplierName(conversation.supplierId)}
                          </TableCell>
                          <TableCell>{conversation.subject}</TableCell>
                          <TableCell className="max-w-[300px] truncate">
                            {conversation.lastMessagePreview}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-muted-foreground">
                              {format(conversation.lastMessageDate, 'MMM d, yyyy • h:mm a')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {conversation.unreadCount} unread
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-8">
                    <h3 className="text-lg font-medium">No Unread Conversations</h3>
                    <p className="mt-2 text-muted-foreground">
                      You've read all your conversations.
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
