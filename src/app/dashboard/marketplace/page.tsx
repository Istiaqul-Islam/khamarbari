"use client";

export const runtime = "edge";

import { useState, useEffect } from "react";
import { ShoppingBag, Plus, Search, ShoppingCart, Filter, Tag, CheckCircle2, Package, Truck, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  images: string[];
  farmerName?: string;
  farmerPhone?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function MarketplacePage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [userRole, setUserRole] = useState<string>("user");

  // New product form state (for farmers)
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    category: "milk_dairy",
    price: "",
    unit: "kg",
    stock: "10",
    imageUrl: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchUserRole();
  }, [selectedCategory]);

  const fetchUserRole = async () => {
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = (await res.json()) as any;
        setUserRole(data.user?.role || "user");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = `/api/marketplace/products${selectedCategory !== "all" ? `?category=${selectedCategory}` : ""}`;
      const res = await fetch(url);
      const data = (await res.json()) as any;
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast({
      title: "Added to Cart 🛒",
      description: `${product.title} has been added to your cart.`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalCartAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      toast({ title: "Shipping Address Required", description: "Please enter your delivery address.", variant: "destructive" });
      return;
    }

    setPlacingOrder(true);
    try {
      const payload = {
        items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity, price: item.product.price })),
        totalAmount: totalCartAmount,
        shippingAddress,
      };

      const res = await fetch("/api/marketplace/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as any;
      if (data.success) {
        setOrderSuccess(true);
        setCart([]);
        toast({ title: "Order Placed Successfully! 🎉", description: "The farmer will contact you for delivery details." });
      } else {
        toast({ title: "Order Failed", description: data.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: newProduct.title,
        description: newProduct.description,
        category: newProduct.category,
        price: parseFloat(newProduct.price),
        unit: newProduct.unit,
        stock: parseInt(newProduct.stock),
        images: newProduct.imageUrl ? [newProduct.imageUrl] : ["https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80"],
      };

      const res = await fetch("/api/marketplace/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as any;
      if (data.success) {
        toast({ title: "Product Listed!", description: "Your item is now live in the marketplace." });
        setIsAddOpen(false);
        fetchProducts();
      } else {
        toast({ title: "Listing Error", description: data.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const categoryLabels: Record<string, string> = {
    all: "All Products",
    milk_dairy: "Milk & Dairy",
    fresh_meat: "Fresh Meat",
    live_animals: "Live Animals",
    animal_feed: "Animal Feed",
    equipment: "Farm Equipment",
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-teal-500/10 via-primary/10 to-teal-500/5 border border-primary/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary text-primary-foreground">
              <ShoppingBag className="h-6 w-6" />
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">KhamarBari Marketplace</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Buy organic dairy, fresh meat, healthy livestock, and farm supplies directly from verified farmers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Farmer Add Product Action */}
          {(userRole === "livestock_farmer" || userRole === "admin") && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="font-semibold gap-2">
                  <Plus className="h-4 w-4" /> List Your Produce
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>List Produce or Farm Goods</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateProduct} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Product Title</Label>
                    <Input
                      placeholder="e.g. Pure Grass-Fed Cow Milk"
                      value={newProduct.title}
                      onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={newProduct.category}
                        onValueChange={(val) => setNewProduct({ ...newProduct, category: val })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="milk_dairy">Milk & Dairy</SelectItem>
                          <SelectItem value="fresh_meat">Fresh Meat</SelectItem>
                          <SelectItem value="live_animals">Live Animals</SelectItem>
                          <SelectItem value="animal_feed">Animal Feed</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Input
                        placeholder="kg, liter, head"
                        value={newProduct.unit}
                        onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Price (৳)</Label>
                      <Input
                        type="number"
                        placeholder="90"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Stock</Label>
                      <Input
                        type="number"
                        placeholder="50"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Image URL (Optional)</Label>
                    <Input
                      placeholder="https://..."
                      value={newProduct.imageUrl}
                      onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      placeholder="Fresh daily organic produce..."
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full font-semibold">Publish Listing</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {/* Cart Drawer Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden sm:inline">Cart</span>
                {cart.length > 0 && (
                  <Badge className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col justify-between">
              <div>
                <SheetHeader className="pb-4 border-b">
                  <SheetTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" /> Your Shopping Cart
                  </SheetTitle>
                </SheetHeader>

                {cart.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground space-y-3">
                    <Package className="h-12 w-12 mx-auto stroke-1" />
                    <p>Your cart is empty.</p>
                  </div>
                ) : (
                  <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between p-3 rounded-xl border bg-card">
                        <div>
                          <h4 className="font-semibold text-sm">{item.product.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            ৳{item.product.price} / {item.product.unit} x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm">৳{item.product.price * item.quantity}</span>
                          <Button variant="ghost" size="sm" className="text-red-500 h-8 px-2" onClick={() => removeFromCart(item.product.id)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="space-y-2 pt-4 border-t">
                      <Label>Delivery Address</Label>
                      <Input
                        placeholder="Enter full shipping address..."
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="pt-4 border-t space-y-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span className="text-primary">৳{totalCartAmount}</span>
                  </div>
                  <Button className="w-full font-bold py-6" onClick={handlePlaceOrder} disabled={placingOrder}>
                    {placingOrder ? "Placing Order..." : "Confirm & Place Order"}
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Controls & Category Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search produce, milk, livestock..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(key)}
              className="rounded-full whitespace-nowrap"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Store className="h-12 w-12 mx-auto mb-3 stroke-1" />
          <h3 className="text-lg font-bold">No products found</h3>
          <p className="text-sm">Try adjusting your search or category filter.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="flex flex-col justify-between overflow-hidden group hover:shadow-lg transition-all border-border/60">
              <div className="relative h-48 bg-muted overflow-hidden">
                <img
                  src={product.images[0] || "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80"}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-3 right-3 bg-background/90 text-foreground backdrop-blur font-medium">
                  {categoryLabels[product.category] || product.category}
                </Badge>
              </div>

              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg font-bold line-clamp-1">{product.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">{product.description}</CardDescription>
              </CardHeader>

              <CardContent className="p-4 pt-0 space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-primary">৳{product.price}</span>
                  <span className="text-xs text-muted-foreground">/ {product.unit}</span>
                </div>
                {product.farmerName && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    👨‍🌾 Seller: <span className="font-medium text-foreground">{product.farmerName}</span>
                  </p>
                )}
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button className="w-full font-semibold gap-2" onClick={() => addToCart(product)}>
                  <ShoppingCart className="h-4 w-4" /> Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
