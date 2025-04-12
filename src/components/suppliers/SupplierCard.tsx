
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Supplier } from '@/stores/supplierStore';
import { Edit, Mail, Phone, Tag, Trash2 } from 'lucide-react';

interface SupplierCardProps {
  supplier: Supplier;
  onDelete: (id: string, name: string) => void;
}

export const SupplierCard = ({ supplier, onDelete }: SupplierCardProps) => {
  return (
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
            <Button variant="ghost" size="icon" className="h-8 w-8">
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
          <Button variant="outline" size="sm" className="w-full">
            <Mail className="h-3 w-3 mr-2" />
            Send Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
