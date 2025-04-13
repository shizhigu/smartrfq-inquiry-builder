
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Paperclip, Download, ChevronDown, ChevronRight, XCircle, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Email, EmailAttachment } from '@/lib/api/emails';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface EmailConversationProps {
  emails: Email[];
  onDownloadAttachment?: (attachmentId: string, filename: string) => void;
}

interface ExpandedEmailState {
  [key: string]: boolean;
}

// Function to extract item number count from email content using the new format
export function getMaxItemNumber(text: string): number {
  const matches = [...text.matchAll(/\[ITEM-(\d+)\]/g)];
  const numbers = matches.map((m) => parseInt(m[1], 10));
  return numbers.length > 0 ? Math.max(...numbers) : 0;
}

export const EmailConversation: React.FC<EmailConversationProps> = ({ 
  emails,
  onDownloadAttachment 
}) => {
  const [expandedEmails, setExpandedEmails] = useState<ExpandedEmailState>({});
  const [showAllEmails, setShowAllEmails] = useState(false);
  
  // Function to toggle the expanded state of an email
  const toggleEmailExpanded = (emailId: string) => {
    setExpandedEmails(prev => ({
      ...prev,
      [emailId]: !prev[emailId]
    }));
  };
  
  // Function to handle attachment download
  const handleDownload = (attachment: EmailAttachment) => {
    if (onDownloadAttachment) {
      onDownloadAttachment(attachment.id, attachment.name);
    } else {
      // Fallback if no handler is provided
      window.open(attachment.url, '_blank');
    }
  };

  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    const kilobytes = bytes / 1024;
    if (kilobytes < 1024) return kilobytes.toFixed(1) + ' KB';
    const megabytes = kilobytes / 1024;
    return megabytes.toFixed(1) + ' MB';
  };

  // Function to safely format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
    } catch (error) {
      console.error('Invalid date:', dateString);
      return 'Invalid date';
    }
  };
  
  // Function to truncate text and add ellipsis
  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Sort emails by date (newest first)
  const sortedEmails = [...emails].sort(
    (a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
  );

  // Get the most recent email
  const mostRecentEmail = sortedEmails.length > 0 ? sortedEmails[0] : null;
  // Get older emails
  const olderEmails = sortedEmails.slice(1);

  if (!mostRecentEmail) {
    return <div className="text-center text-muted-foreground py-4">No emails in this conversation</div>;
  }

  const renderEmail = (email: Email) => {
    // Calculate item count for each email using the new function
    const itemCount = getMaxItemNumber(email.content);
    
    return (
      <Card key={email.id} className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {email.status && email.status.toLowerCase() === 'failed' && (
                    <Badge variant="destructive" className="mb-2 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Failed
                    </Badge>
                  )}
                  {email.status && email.status.toLowerCase() !== 'failed' && (
                    <div className="text-xs mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {email.status}
                    </div>
                  )}
                  
                  {itemCount > 0 && (
                    <Badge variant="success" className="mb-2 flex items-center gap-1">
                      {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(email.sent_at)}
                </div>
              </div>
              
              <Separator className="my-2" />
              
              <div className="text-sm">
                <div className="whitespace-pre-line">
                  {expandedEmails[email.id] 
                    ? email.content 
                    : truncateText(email.content)}
                  
                  {email.content.length > 150 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleEmailExpanded(email.id)}
                      className="mt-1 h-auto py-1 px-2 text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      {expandedEmails[email.id] ? (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronRight className="h-3 w-3 mr-1" />
                          Show More
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              
              {email.attachments && email.attachments.length > 0 && (
                <div className="mt-4 pt-2 border-t">
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Paperclip className="h-4 w-4 mr-2" />
                    <span>{email.attachments.length} attachment{email.attachments.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="space-y-2">
                    {email.attachments.map((attachment) => (
                      <div 
                        key={attachment.id} 
                        className="flex items-center justify-between p-2 rounded bg-muted/50"
                      >
                        <div className="flex items-center">
                          <div className="text-sm">{attachment.name}</div>
                          <div className="text-xs text-muted-foreground ml-2">
                            ({formatFileSize(attachment.size)})
                          </div>
                        </div>
                        <Button
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownload(attachment)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Most recent email is always shown */}
      {renderEmail(mostRecentEmail)}
      
      {/* Show older emails in a collapsible section */}
      {olderEmails.length > 0 && (
        <Collapsible open={showAllEmails} onOpenChange={setShowAllEmails}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full flex justify-center items-center gap-2">
              {showAllEmails ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide previous {olderEmails.length} {olderEmails.length === 1 ? 'email' : 'emails'}
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show previous {olderEmails.length} {olderEmails.length === 1 ? 'email' : 'emails'}
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {olderEmails.map(renderEmail)}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};
