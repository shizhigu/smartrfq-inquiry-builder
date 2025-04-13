
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface RfqEmailTabContentProps {
  email: string;
  onEmailChange: (email: string) => void;
  message: string;
  onMessageChange: (message: string) => void;
  subject?: string;
  onSubjectChange?: (subject: string) => void;
  hideEmailInput?: boolean;
  hideSubjectInput?: boolean;
}

export function RfqEmailTabContent({
  email,
  onEmailChange,
  message,
  onMessageChange,
  subject,
  onSubjectChange,
  hideEmailInput = false,
  hideSubjectInput = false
}: RfqEmailTabContentProps) {
  return (
    <div className="space-y-4">
      {!hideEmailInput && (
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="Enter email address..." 
            value={email}
            onChange={(e) => onEmailChange(e.target.value)} 
          />
        </div>
      )}
      
      {onSubjectChange && !hideSubjectInput && (
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input 
            id="subject" 
            type="text" 
            placeholder="Enter subject..." 
            value={subject || ""}
            onChange={(e) => onSubjectChange(e.target.value)} 
          />
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="message-email">Message</Label>
        <Textarea 
          id="message-email"
          placeholder="Write your message here..."
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          rows={4}
        />
      </div>
      
      <div className="text-sm text-muted-foreground mt-2">
        <p>This message will be sent to the specified email address.</p>
      </div>
    </div>
  );
}
