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
  AlertCircle,
  RefreshCw
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
import { QuotationTable } from '@/components/emails/QuotationTable';
import { ImportQuotation } from '@/components/emails/ImportQuotation';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ComposeEmailDialog } from '@/components/emails/ComposeEmailDialog';

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
  const [composeDialogOpen, setComposeDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    if (isLoading || refreshing) return;
    
    setRefreshing(true);
    await fetchConversations(1, true); // force refresh from API
    setRefreshing(false);
    toast.success('Conversations refreshed');
  };
  
  const filteredConversations = conversations.filter(conv => {
    if (searchQuery) {
      return (
        conv.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessagePreview?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (conv.supplierName && conv.supplierName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (conv.supplierEmail && conv.supplierEmail.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return true;
  });

  const handleComposeEmail = () => {
    setComposeDialogOpen(true);
  };
  
  const handleSelectConversation = (conversationId: string) => {
    selectConversation(conversationId);
  };
  
  const handleBackToList = () => {
    clearSelectedConversation();
  };
  
  const handleSendEmail = async (supplierId: string, subject: string, message: string) => {
    await createNewConversation(supplierId, subject, message);
    setComposeDialogOpen(false);
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

  const renderSupplierInfo = (conversation: any) => {
    if (conversation.supplierName && conversation.supplierName !== "Unknown Supplier") {
      return (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">{conversation.supplierName}</span>
          {conversation.supplierEmail && conversation.supplierEmail !== "No email available" && (
            <span className="ml-1">({conversation.supplierEmail})</span>
          )}
        </div>
      );
    }
    
    if (conversation.supplierId) {
      return (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Supplier ID: {conversation.supplierId.substring(0, 8)}</span>
        </div>
      );
    }
    
    return (
      <div className="text-sm text-muted-foreground">
        <span className="italic">No supplier information</span>
      </div>
    );
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
            selectedConversation.supplierName && selectedConversation.supplierName !== "Unknown Supplier"
              ? `${selectedConversation.supplierName} ${selectedConversation.supplierEmail ? `(${selectedConversation.supplierEmail})` : ''}`
              : `Supplier ID: ${selectedConversation.supplierId?.substring(0, 8) || 'Unknown'}`
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
          {/* Import Quotation Component */}
          <ImportQuotation 
            conversationId={selectedConversation.id} 
          />
          
          {/* Quotation Table Component */}
          <QuotationTable emails={emails} />
          
          {/* Collapsible Email Conversation Component */}
          <EmailConversation 
            emails={emails} 
            conversationId={selectedConversation.id}
            onDownloadAttachment={downloadEmailAttachment} 
          />
        </div>
        
        <ComposeEmailDialog 
          open={composeDialogOpen} 
          onOpenChange={setComposeDialogOpen}
          onSend={handleSendEmail}
          replyMode
          initialSupplierId={selectedConversation.supplierId}
          initialSubject={`RE: ${selectedConversation.subject}`}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Emails"
        description="Manage communications for your project"
      >
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading || refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={handleComposeEmail}>
            <MailPlus className="mr-2 h-4 w-4" />
            Compose
          </Button>
        </div>
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
                {isLoading ? (
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
                            
                            {renderSupplierInfo(conversation)}
                            
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
      
      <ComposeEmailDialog 
        open={composeDialogOpen} 
        onOpenChange={setComposeDialogOpen}
        onSend={handleSendEmail}
      />
    </div>
  );
};

export default Emails;
