
import { useState, useEffect, useCallback } from 'react';
import { useEmails } from '@/hooks/useEmails';
import { useProjectStore } from '@/stores/projectStore';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { 
  MailPlus, 
  Search, 
  Filter, 
  Calendar,
  ChevronRight,
  AlertCircle
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
import { toast } from 'sonner';
import { format, isValid, parseISO } from 'date-fns';
import { EmailConversation } from '@/components/emails/EmailConversation';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Emails = () => {
  const {
    conversations,
    emails,
    selectedConversation,
    isLoading,
    error,
    page,
    pageSize,
    totalPages,
    totalConversations,
    fetchConversations,
    selectConversation,
    createNewConversation,
    fetchEmails,
    sendNewEmail,
    downloadEmailAttachment,
    clearSelectedConversation
  } = useEmails();

  const { selectedProjectId, projects } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    console.log("Project ID in Emails page:", selectedProjectId);
  }, [selectedProjectId]);
  
  const filteredConversations = conversations.filter(conv => {
    if (searchQuery) {
      return (
        conv.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessagePreview.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return true;
  });

  const handleComposeEmail = () => {
    toast('Email composition feature is under development');
  };
  
  const handleSelectConversation = (conversationId: string) => {
    selectConversation(conversationId);
  };
  
  const handleBackToList = () => {
    clearSelectedConversation();
  };

  const safeFormatDate = (dateString: string, formatStr: string): string => {
    try {
      const date = parseISO(dateString);
      
      if (isValid(date)) {
        return format(date, formatStr);
      }
      return 'Invalid date';
    } catch (err) {
      console.error('Error formatting date:', err, dateString);
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    switch(status.toLowerCase()) {
      case 'open':
        return <Badge variant="default">Open</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!selectedProjectId) {
    return (
      <div className="p-6">
        <PageHeader 
          title="Emails" 
          description="Manage email communications for your project"
        />
        <Alert className="mt-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No project selected</AlertTitle>
          <AlertDescription>
            Please select a project from the projects page to view its email communications.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleLoadMore = useCallback(() => {
    if (page < totalPages) {
      fetchConversations(page + 1);
    }
  }, [page, totalPages, fetchConversations]);

  if (isLoading && !conversations.length) {
    return (
      <div className="p-6">
        <PageHeader 
          title="Emails" 
          description="Loading email communications..."
        />
        <div className="mt-8 flex justify-center">
          <div className="animate-pulse h-64 w-full bg-muted/30 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error && !conversations.length) {
    return (
      <div className="p-6">
        <PageHeader 
          title="Emails" 
          description="Manage your email communications"
        />
        <Alert className="mt-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Emails</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (selectedConversation) {
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
              <span>{selectedConversation?.subject || 'Conversation'}</span>
            </div>
          }
          description={
            selectedConversation.supplierName 
              ? `${selectedConversation.supplierName} (${selectedConversation.supplierEmail || 'No email'})`
              : `Conversation with supplier ID: ${selectedConversation.supplierId}`
          }
        >
          <div className="flex items-center gap-2">
            {selectedConversation.status && 
              <div className="mr-2">
                {getStatusBadge(selectedConversation.status)}
              </div>
            }
            <Button onClick={handleComposeEmail}>
              <MailPlus className="mr-2 h-4 w-4" />
              Reply
            </Button>
          </div>
        </PageHeader>
        
        <div className="mt-6">
          <EmailConversation emails={emails} onDownloadAttachment={downloadEmailAttachment} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Emails"
        description="Manage communications for your project"
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

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-1 mb-4">
            <TabsTrigger value="all">All Conversations</TabsTrigger>
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
                {isLoading && !filteredConversations.length ? (
                  <div className="p-8">
                    <div className="flex justify-center">
                      <div className="animate-pulse h-24 w-full max-w-md bg-muted/30 rounded-lg"></div>
                    </div>
                  </div>
                ) : filteredConversations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    {filteredConversations.map((conversation) => (
                      <Card 
                        key={conversation.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSelectConversation(conversation.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="font-medium text-lg truncate">
                                {conversation.subject}
                              </div>
                              {conversation.status && getStatusBadge(conversation.status)}
                            </div>
                            
                            <div className="text-sm text-muted-foreground">
                              {conversation.supplierName 
                                ? `${conversation.supplierName} (${conversation.supplierEmail || 'No email'})`
                                : `Supplier ID: ${conversation.supplierId}`}
                            </div>
                            
                            {conversation.created_at && (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3 mr-1" />
                                Created: {safeFormatDate(conversation.created_at, 'MMM d, yyyy')}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
              {filteredConversations.length > 0 && page < totalPages && (
                <CardFooter className="flex justify-center items-center p-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLoadMore}
                    disabled={page >= totalPages || isLoading}
                  >
                    {isLoading ? "Loading..." : "Load More"}
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Emails;
