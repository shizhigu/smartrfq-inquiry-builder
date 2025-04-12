
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Supplier } from '@/stores/supplierStore';
import { Edit, Mail, Phone, Tag, Trash2 } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface SupplierCardProps {
  supplier: Supplier;
  onDelete: (id: string, name: string) => void;
  onEdit?: (supplier: Supplier) => void;
}

export const SupplierCard = ({ supplier, onDelete, onEdit }: SupplierCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleSendEmail = async () => {
    try {
      setIsSendingEmail(true);
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Email sent to ${supplier.name}`);
    } catch (error) {
      toast.error('Failed to send email');
      console.error('Error sending email:', error);
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <>
      <Card key={supplier.id}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">{supplier.name}</h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Mail className="h-3 w-3 mr-1" />
                <span>{supplier.email}</span>
              </div>
              {supplier.phone && (
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Phone className="h-3 w-3 mr-1" />
                  <span>{supplier.phone}</span>
                </div>
              )}
            </div>
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(supplier.id, supplier.name)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {supplier.tags && supplier.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {supplier.tags.map((tag, index) => (
                <div key={index} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs flex items-center">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleSendEmail}
              disabled={isSendingEmail}
            >
              <Mail className="h-3 w-3 mr-2" />
              {isSendingEmail ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Edit supplier information
            </DialogDescription>
          </DialogHeader>
          {/* We're using a separate component for the edit form */}
          <SupplierEditForm 
            supplier={supplier} 
            onSave={() => {
              toast.success(`Supplier ${supplier.name} updated`);
              setIsEditDialogOpen(false);
              if (onEdit) onEdit(supplier);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

// Simple edit form component
const SupplierEditForm = ({ 
  supplier, 
  onSave 
}: { 
  supplier: Supplier, 
  onSave: () => void 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <input 
            className="w-full p-2 border rounded-md"
            defaultValue={supplier.name}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input 
            className="w-full p-2 border rounded-md"
            defaultValue={supplier.email}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Phone</label>
          <input 
            className="w-full p-2 border rounded-md"
            defaultValue={supplier.phone || ''}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Tags (comma separated)</label>
          <input 
            className="w-full p-2 border rounded-md"
            defaultValue={supplier.tags?.join(', ') || ''}
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => onSave()}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};
