
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Paperclip } from 'lucide-react';

interface EmailSender {
  id: string;
  name: string;
  email: string;
}

interface EmailMessage {
  id: string;
  conversationId: string;
  subject: string;
  content: string;
  from: EmailSender;
  to: EmailSender;
  timestamp: Date;
  attachments: number;
  read: boolean;
}

interface EmailConversationProps {
  emails: EmailMessage[];
}

export const EmailConversation: React.FC<EmailConversationProps> = ({ emails }) => {
  return (
    <div className="space-y-4">
      {emails.map((email, index) => (
        <Card key={email.id} className={`overflow-hidden ${!email.read ? 'border-l-4 border-l-primary' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10 mt-1">
                <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center text-lg font-semibold">
                  {email.from.name.charAt(0)}
                </div>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{email.from.name}</div>
                    <div className="text-sm text-muted-foreground">{email.from.email}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(email.timestamp), 'MMM d, yyyy • h:mm a')}
                  </div>
                </div>
                
                <Separator className="my-2" />
                
                <div className="text-sm">
                  <p className="whitespace-pre-line">{email.content}</p>
                </div>
                
                {email.attachments > 0 && (
                  <div className="mt-4 pt-2 border-t">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Paperclip className="h-4 w-4 mr-2" />
                      <span>{email.attachments} attachment{email.attachments !== 1 ? 's' : ''}</span>
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
