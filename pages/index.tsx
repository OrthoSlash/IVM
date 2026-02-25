import { useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import InventoryTable from '@/components/InventoryTable';
import AddItemDialog from '@/components/AddItemDialog';
import { useInventoryStore, InventoryItem } from '@/store/inventoryStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, AlertTriangle, DollarSign, Layers, Plus, Search } from 'lucide-react';

const Index = () => {
  const { items, searchQuery, categoryFilter, addItem, updateItem, deleteItem, setSearchQuery, setCategoryFilter } = useInventoryStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);

  const categories = useMemo(() => [...new Set(items.map((i) => i.category))], [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, categoryFilter]);

  const stats = useMemo(() => ({
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    lowStock: items.filter((i) => i.status === 'low-stock').length,
    outOfStock: items.filter((i) => i.status === 'out-of-stock').length,
    totalValue: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    categories: new Set(items.map((i) => i.category)).size,
  }), [items]);

  const handleSave = (data: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    if (editItem) {
      updateItem(editItem.id, data);
      setEditItem(null);
    } else {
      addItem(data);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditItem(item);
    setDialogOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Overview of your inventory status</p>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2" onClick={() => { setEditItem(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Items" value={stats.totalItems.toLocaleString()} icon={Package} change="+12% from last month" trend="up" />
          <StatCard title="Low Stock" value={stats.lowStock} icon={AlertTriangle} variant="warning" change={`${stats.outOfStock} out of stock`} trend="down" />
          <StatCard title="Categories" value={stats.categories} icon={Layers} variant="accent" />
          <StatCard title="Total Value" value={`$${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} icon={DollarSign} change="+8.2% from last month" trend="up" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products or SKUs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <InventoryTable items={filteredItems} onEdit={handleEdit} onDelete={deleteItem} />
      </div>

      <AddItemDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSave} editItem={editItem} />
    </Layout>
  );
};

export default Index;
