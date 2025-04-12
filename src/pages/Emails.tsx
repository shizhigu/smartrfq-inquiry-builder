import { useState, useEffect, useCallback } from 'react';
import { useEmails } from '@/hooks/useEmails';
import { useProjectStore } from '@/stores/projectStore';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { 
  MailPlus, 
  Search, 
  Filter, 
  MessageCircle, 
  Calendar,
  Clock,
  ChevronRight,
  Building,
  Tag,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
    markConversationRead,
    fetchEmails,
    sendNewEmail,
    markEmailRead,
    downloadEmailAttachment,
    clearSelectedConversation
  } = useEmails();

  const { selectedProjectId, projects } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    console.log("Project ID in Emails page:", selectedProjectId);
  }, [selectedProjectId]);
  
  const filteredConversations = conversations.filter(conv => {
    if (activeTab === 'unread' && conv.unreadCount === 0) return false;
    
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
          description={`Conversation with supplier ${selectedConversation.supplierId}`}
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
        
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
          {selectedConversation.organization_id && (
            <div className="flex items-center">
              <Building className="h-3 w-3 mr-1" />
              <span>Organization: {selectedConversation.organization_id}</span>
            </div>
          )}
          {selectedConversation.created_at && (
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Created: {safeFormatDate(selectedConversation.created_at, 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>
        
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

        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="all">All Conversations</TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({conversations.reduce((acc, conv) => acc + conv.unreadCount, 0)})
            </TabsTrigger>
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
                            {conversation.supplierId}
                            {conversation.organization_id && (
                              <div className="text-xs text-muted-foreground flex items-center mt-1">
                                <Building className="h-3 w-3 mr-1" />
                                {conversation.organization_id}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{conversation.subject}</TableCell>
                          <TableCell className="max-w-[300px] truncate">
                            {conversation.lastMessagePreview}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1 text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span className="text-xs">
                                {safeFormatDate(conversation.lastMessageDate, 'MMM d, yyyy')}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 text-muted-foreground mt-1">
                              <Clock className="h-3 w-3" />
                              <span className="text-xs">
                                {safeFormatDate(conversation.lastMessageDate, 'h:mm a')}
                              </span>
                            </div>
                            {conversation.created_at && (
                              <div className="flex items-center space-x-1 text-muted-foreground mt-1">
                                <Tag className="h-3 w-3" />
                                <span className="text-xs">
                                  Created: {safeFormatDate(conversation.created_at, 'MMM d')}
                                </span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {conversation.status ? (
                              getStatusBadge(conversation.status)
                            ) : conversation.unreadCount > 0 ? (
                              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLoadMore}
                    disabled={page >= totalPages}
                  >
                    View More
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
                            {conversation.supplierId}
                            {conversation.organization_id && (
                              <div className="text-xs text-muted-foreground flex items-center mt-1">
                                <Building className="h-3 w-3 mr-1" />
                                {conversation.organization_id}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{conversation.subject}</TableCell>
                          <TableCell className="max-w-[300px] truncate">
                            {conversation.lastMessagePreview}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-muted-foreground">
                              {safeFormatDate(conversation.lastMessageDate, 'MMM d, yyyy • h:mm a')}
                            </div>
                            {conversation.created_at && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Created: {safeFormatDate(conversation.created_at, 'MMM d, yyyy')}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {conversation.status ? (
                              getStatusBadge(conversation.status)
                            ) : (
                              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {conversation.unreadCount} unread
                              </div>
                            )}
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
