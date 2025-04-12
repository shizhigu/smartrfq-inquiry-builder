
import { useState, useEffect } from 'react';
import { useSupplierStore } from '@/stores/supplierStore';
import { useProjectStore } from '@/stores/projectStore';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { UserPlus, Mail, Tag, Search, Edit, Trash2, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { addSupplier, deleteSupplier, getSuppliers } from '@/lib/api/suppliers';

const Suppliers = () => {
  const selectedProjectId = useProjectStore(state => state.selectedProjectId);
  const projects = useProjectStore(state => state.projects);
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  
  const { suppliers, setSuppliers } = useSupplierStore();
  const addSupplierToStore = useSupplierStore(state => state.addSupplier);
  const deleteSupplierFromStore = useSupplierStore(state => state.deleteSupplier);
  const setLoading = useSupplierStore(state => state.setLoading);
  const isLoading = useSupplierStore(state => state.isLoading);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    email: '',
    phone: '',
    tags: [] as string[]
  });
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Load suppliers when project changes
  useEffect(() => {
    if (selectedProjectId) {
      loadSuppliers();
    }
  }, [selectedProjectId]);

  const loadSuppliers = async () => {
    if (!selectedProjectId) return;
    
    setLoading(true);
    try {
      const response = await getSuppliers(selectedProjectId);
      setSuppliers(selectedProjectId, response);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const projectSuppliers = selectedProjectId ? suppliers[selectedProjectId] || [] : [];

  const filteredSuppliers = projectSuppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (supplier.tags && supplier.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleAddSupplier = async () => {
    if (!selectedProjectId) {
      toast.error("No project selected");
      return;
    }

    if (!newSupplier.name || !newSupplier.email) {
      toast.error("Name and email are required");
      return;
    }

    const supplier = {
      id: uuidv4(),
      name: newSupplier.name,
      email: newSupplier.email,
      phone: newSupplier.phone,
      tags: newSupplier.tags,
      projectId: selectedProjectId
    };

    setLoading(true);
    try {
      await addSupplier(supplier);
      addSupplierToStore(supplier);
      setNewSupplier({ name: '', email: '', phone: '', tags: [] });
      setIsAddingSupplier(false);
      toast.success(`${supplier.name} has been added to your suppliers`);
    } catch (error) {
      console.error('Failed to add supplier:', error);
      toast.error('Failed to add supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSupplier = async (id: string, name: string) => {
    setLoading(true);
    try {
      await deleteSupplier(id);
      deleteSupplierFromStore(id);
      toast.success(`${name} has been removed from your suppliers`);
    } catch (error) {
      console.error('Failed to delete supplier:', error);
      toast.error('Failed to delete supplier');
    } finally {
      setLoading(false);
    }
  };

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
        <Button onClick={() => setIsAddingSupplier(true)} disabled={isLoading}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
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
                <Button variant="outline" onClick={() => setIsAddingSupplier(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSupplier} disabled={isLoading}>
                  Save Supplier
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="mt-6 text-center p-6">
          <p>Loading suppliers...</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.length > 0 ? (
            filteredSuppliers.map((supplier) => (
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
                        onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}
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
            ))
          ) : (
            <div className="col-span-3 text-center p-6 bg-muted/30 rounded-lg">
              <h3 className="text-lg font-medium">No Suppliers Found</h3>
              <p className="mt-2 text-muted-foreground">
                {searchQuery 
                  ? "No suppliers match your search criteria." 
                  : "You haven't added any suppliers to this project yet."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Suppliers;
