
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Paperclip, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Email, EmailAttachment } from '@/lib/api/emails';

interface EmailConversationProps {
  emails: Email[];
  onDownloadAttachment?: (attachmentId: string, filename: string) => void;
}

export const EmailConversation: React.FC<EmailConversationProps> = ({ 
  emails,
  onDownloadAttachment 
}) => {
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

  return (
    <div className="space-y-4">
      {emails.map((email) => (
        <Card key={email.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10 mt-1">
                <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center text-lg font-semibold">
                  {email.from?.name ? email.from.name.charAt(0) : '?'}
                </div>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{email.from?.name || 'Unknown Sender'}</div>
                    <div className="text-sm text-muted-foreground">{email.from?.email || 'No email address'}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(email.timestamp), 'MMM d, yyyy • h:mm a')}
                  </div>
                </div>
                
                <Separator className="my-2" />
                
                <div className="text-sm">
                  <p className="whitespace-pre-line">{email.content}</p>
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
      ))}
    </div>
  );
};
