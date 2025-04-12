
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tag } from 'lucide-react';
import { useState } from 'react';

interface SupplierFormProps {
  onCancel: () => void;
  onSave: (supplier: {
    name: string;
    email: string;
    phone: string;
    tags: string[];
  }) => void;
  isLoading: boolean;
}

export const SupplierForm = ({ onCancel, onSave, isLoading }: SupplierFormProps) => {
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    email: '',
    phone: '',
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      setNewSupplier({
        ...newSupplier,
        tags: [...(newSupplier.tags || []), tagInput.trim()]
      });
      setTagInput('');
      e.preventDefault();
    }
  };

  const removeTag = (indexToRemove: number) => {
    setNewSupplier({
      ...newSupplier,
      tags: newSupplier.tags.filter((_, index) => index !== indexToRemove)
    });
  };

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-4">Add New Supplier</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="Supplier name"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                placeholder="contact@supplier.com"
                type="email"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone (optional)</label>
              <Input
                placeholder="+1 234 567 8900"
                value={newSupplier.phone}
                onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tags (press Enter to add)</label>
              <Input
                placeholder="Add tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInput}
              />
              {newSupplier.tags && newSupplier.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newSupplier.tags.map((tag, index) => (
                    <div 
                      key={index} 
                      className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs flex items-center group"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                      <button
                        onClick={() => removeTag(index)}
                        className="ml-1 text-primary-foreground/70 hover:text-primary-foreground rounded-full group-hover:opacity-100 opacity-70"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={() => onSave(newSupplier)} 
              disabled={isLoading}
            >
              Save Supplier
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
