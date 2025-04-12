
import { Supplier } from '@/stores/supplierStore';
import { SupplierCard } from './SupplierCard';

interface SupplierListProps {
  suppliers: Supplier[];
  searchQuery: string;
  onDeleteSupplier: (id: string, name: string) => void;
  onEditSupplier?: (supplier: Supplier) => void;
}

export const SupplierList = ({ 
  suppliers, 
  searchQuery, 
  onDeleteSupplier,
  onEditSupplier 
}: SupplierListProps) => {
  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (supplier.tags && supplier.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  if (suppliers.length === 0) {
    return (
      <div className="col-span-3 text-center p-6 bg-muted/30 rounded-lg">
        <h3 className="text-lg font-medium">No Suppliers Found</h3>
        <p className="mt-2 text-muted-foreground">
          You haven't added any suppliers to this project yet.
        </p>
      </div>
    );
  }

  if (filteredSuppliers.length === 0) {
    return (
      <div className="col-span-3 text-center p-6 bg-muted/30 rounded-lg">
        <h3 className="text-lg font-medium">No Matching Suppliers</h3>
        <p className="mt-2 text-muted-foreground">
          No suppliers match your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredSuppliers.map((supplier) => (
        <SupplierCard 
          key={supplier.id} 
          supplier={supplier} 
          onDelete={onDeleteSupplier}
          onEdit={onEditSupplier}
        />
      ))}
    </div>
  );
};
