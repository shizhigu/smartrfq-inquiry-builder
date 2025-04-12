
import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { UserPlus, Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SupplierForm } from '@/components/suppliers/SupplierForm';
import { SupplierList } from '@/components/suppliers/SupplierList';
import { useSuppliers } from '@/hooks/useSuppliers';

const Suppliers = () => {
  const {
    isLoading,
    isRefreshing,
    projectSuppliers,
    searchQuery,
    setSearchQuery,
    isAddingSupplier,
    setIsAddingSupplier,
    handleAddSupplier,
    handleDeleteSupplier,
    selectedProject,
    selectedProjectId,
    refreshSuppliers
  } = useSuppliers();

  if (!selectedProjectId) {
    return (
      <div className="p-6">
        <PageHeader 
          title="Suppliers" 
          description="Manage your suppliers"
        />
        <div className="mt-8 text-center p-6 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-medium">No Project Selected</h3>
          <p className="mt-2 text-muted-foreground">Please select a project to manage suppliers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Suppliers"
        description={`Manage suppliers for ${selectedProject?.name || 'current project'}`}
      >
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={refreshSuppliers} 
            disabled={isLoading}
            className={isRefreshing ? "animate-spin" : ""}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsAddingSupplier(true)} disabled={isLoading}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>
      </PageHeader>

      <div className="mt-6 flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search suppliers..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isAddingSupplier && (
        <SupplierForm
          onCancel={() => setIsAddingSupplier(false)}
          onSave={handleAddSupplier}
          isLoading={isLoading}
        />
      )}

      {isLoading ? (
        <div className="mt-6 text-center p-6">
          <p>Loading suppliers...</p>
        </div>
      ) : (
        <div className="mt-6">
          <SupplierList 
            suppliers={projectSuppliers} 
            searchQuery={searchQuery}
            onDeleteSupplier={handleDeleteSupplier}
          />
        </div>
      )}
    </div>
  );
};

export default Suppliers;
