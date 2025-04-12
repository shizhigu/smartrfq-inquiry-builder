
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface RfqEmailTabContentProps {
  email: string;
  onEmailChange: (email: string) => void;
  message: string;
  onMessageChange: (message: string) => void;
}

export function RfqEmailTabContent({
  email,
  onEmailChange,
  message,
  onMessageChange
}: RfqEmailTabContentProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="supplier@example.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message-email">Message (Optional)</Label>
        <Textarea 
          id="message-email"
          placeholder="Additional notes or requirements..."
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );
}
