"use client";

export const runtime = "edge";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ImagePlus,
  Minus,
  Package,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Store,
  Trash2,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  farmerId?: string;
  title: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  images: string[];
  farmerName?: string;
  farmerPhone?: string;
  createdAt?: string;
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
  const [userRole, setUserRole] = useState<string>("user");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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
    fetchUserProfile();
  }, [selectedCategory]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = (await res.json()) as any;
        setUserRole(data.user?.role || "user");
        setCurrentUserId(data.user?.id || null);
      }
    } catch (error) {
      console.error("Failed to load user profile", error);
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
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetProductForm = () => {
    setNewProduct({
      title: "",
      description: "",
      category: "milk_dairy",
      price: "",
      unit: "kg",
      stock: "10",
      imageUrl: "",
    });
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      title: product.title,
      description: product.description,
      category: product.category,
      price: String(product.price),
      unit: product.unit,
      stock: String(product.stock),
      imageUrl: product.images[0] || "",
    });
    setIsEditOpen(true);
  };

  const addToCart = (product: Product) => {
    if (product.farmerId && currentUserId && product.farmerId === currentUserId) {
      toast({ title: "Not available", description: "You cannot add your own listing to the cart.", variant: "destructive" });
      return;
    }

    if (product.stock <= 0) {
      toast({ title: "Out of stock", description: "This listing is currently unavailable.", variant: "destructive" });
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    toast({ title: "Added to cart", description: `${product.title} is ready for checkout.` });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalCartAmount = useMemo(() => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [cart]);

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      toast({ title: "Shipping address required", description: "Please enter your delivery address before confirming the order.", variant: "destructive" });
      return;
    }

    if (cart.length === 0) {
      toast({ title: "Cart is empty", description: "Add at least one listing before placing an order.", variant: "destructive" });
      return;
    }

    setPlacingOrder(true);
    try {
      const payload = {
        items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity, price: item.product.price })),
        totalAmount: totalCartAmount,
        shippingAddress,
        paymentMethod,
      };

      const res = await fetch("/api/marketplace/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as any;
      if (data.success) {
        setCart([]);
        setShippingAddress("");
        toast({ title: "Order confirmed", description: "Your order request has been recorded. The seller will contact you shortly." });
      } else {
        toast({ title: "Order failed", description: data.error, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleCreateProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const payload = {
        title: newProduct.title,
        description: newProduct.description,
        category: newProduct.category,
        price: parseFloat(newProduct.price),
        unit: newProduct.unit,
        stock: parseInt(newProduct.stock, 10),
        images: newProduct.imageUrl ? [newProduct.imageUrl] : ["https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80"],
      };

      const res = await fetch("/api/marketplace/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as any;
      if (data.success) {
        toast({ title: "Listing published", description: "Your product is now live on the marketplace." });
        setIsAddOpen(false);
        resetProductForm();
        fetchProducts();
      } else {
        toast({ title: "Listing failed", description: data.error, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdateProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingProduct) return;

    try {
      const payload = {
        title: newProduct.title,
        description: newProduct.description,
        category: newProduct.category,
        price: parseFloat(newProduct.price),
        unit: newProduct.unit,
        stock: parseInt(newProduct.stock, 10),
        images: newProduct.imageUrl ? [newProduct.imageUrl] : editingProduct.images,
      };

      const res = await fetch(`/api/marketplace/products?id=${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as any;
      if (data.success) {
        toast({ title: "Listing updated", description: "Your listing has been refreshed." });
        setIsEditOpen(false);
        setEditingProduct(null);
        resetProductForm();
        fetchProducts();
      } else {
        toast({ title: "Update failed", description: data.error, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const confirmed = window.confirm("Delete this listing from the marketplace?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/marketplace/products?id=${productId}`, { method: "DELETE" });
      const data = (await res.json()) as any;
      if (data.success) {
        toast({ title: "Listing removed", description: "The product is no longer visible to buyers." });
        fetchProducts();
      } else {
        toast({ title: "Delete failed", description: data.error, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = (await res.json()) as any;
      if (data.success) {
        setNewProduct((prev) => ({ ...prev, imageUrl: data.url }));
        toast({ title: "Image uploaded", description: "The listing image is ready to publish." });
      } else {
        toast({ title: "Upload failed", description: data.error || "Please try another image.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploadingImage(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const query = search.toLowerCase();
    return (
      product.title.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.farmerName?.toLowerCase().includes(query)
    );
  });

  const myProducts = useMemo(() => products.filter((product) => product.farmerId === currentUserId), [products, currentUserId]);

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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-linear-to-r from-teal-500/10 via-primary/10 to-teal-500/5 p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-primary p-2 text-primary-foreground">
              <ShoppingBag className="h-6 w-6" />
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">KhamarBari Marketplace</h1>
          </div>
          <p className="mt-1 text-muted-foreground">
            Buy fresh produce, dairy, livestock, and supplies directly from trusted farmers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {(userRole === "livestock_farmer" || userRole === "admin") && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 font-semibold">
                  <Plus className="h-4 w-4" /> List a product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>List produce or farm goods</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateProduct} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Product title</Label>
                    <Input value={newProduct.title} onChange={(event) => setNewProduct({ ...newProduct, title: event.target.value })} placeholder="e.g. Fresh cow milk" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={newProduct.category} onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
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
                      <Input value={newProduct.unit} onChange={(event) => setNewProduct({ ...newProduct, unit: event.target.value })} placeholder="kg, liter, head" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Price (৳)</Label>
                      <Input type="number" value={newProduct.price} onChange={(event) => setNewProduct({ ...newProduct, price: event.target.value })} placeholder="90" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Stock</Label>
                      <Input type="number" value={newProduct.stock} onChange={(event) => setNewProduct({ ...newProduct, stock: event.target.value })} placeholder="50" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Image</Label>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" className="gap-2" onClick={() => document.getElementById("marketplace-image-upload")?.click()} disabled={uploadingImage}>
                        <ImagePlus className="h-4 w-4" /> {uploadingImage ? "Uploading..." : "Upload with ImgBB"}
                      </Button>
                      <input id="marketplace-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </div>
                    {newProduct.imageUrl ? <p className="text-xs text-muted-foreground">Image selected and will be published.</p> : <p className="text-xs text-muted-foreground">Optional. The default cover image will be used if left empty.</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={newProduct.description} onChange={(event) => setNewProduct({ ...newProduct, description: event.target.value })} placeholder="Fresh from the farm" />
                  </div>
                  <Button type="submit" className="w-full font-semibold">Publish listing</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden sm:inline">Cart</span>
                {cart.length > 0 && (
                  <Badge className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col justify-between sm:max-w-md">
              <div>
                <SheetHeader className="border-b pb-4">
                  <SheetTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" /> Your shopping cart
                  </SheetTitle>
                </SheetHeader>

                {cart.length === 0 ? (
                  <div className="space-y-3 py-12 text-center text-muted-foreground">
                    <Package className="mx-auto h-12 w-12 stroke-1" />
                    <p>Your cart is empty right now.</p>
                  </div>
                ) : (
                  <div className="max-h-[60vh] space-y-4 overflow-y-auto py-4">
                    {cart.map((item) => (
                      <div key={item.product.id} className="rounded-xl border bg-card p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-semibold">{item.product.title}</h4>
                            <p className="text-xs text-muted-foreground">৳{item.product.price} / {item.product.unit}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500" onClick={() => removeFromCart(item.product.id)}>
                            Remove
                          </Button>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateCartQuantity(item.product.id, -1)}>
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="min-w-8 text-center font-semibold">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateCartQuantity(item.product.id, 1)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <span className="font-semibold">৳{item.product.price * item.quantity}</span>
                        </div>
                      </div>
                    ))}

                    <div className="rounded-xl border bg-muted/30 p-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Truck className="h-4 w-4 text-primary" /> Payment method (UI only)
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <Button variant={paymentMethod === "cash_on_delivery" ? "default" : "outline"} size="sm" onClick={() => setPaymentMethod("cash_on_delivery")}>Cash on delivery</Button>
                        <Button variant={paymentMethod === "digital_wallet" ? "default" : "outline"} size="sm" onClick={() => setPaymentMethod("digital_wallet")}>Digital wallet (soon)</Button>
                      </div>
                    </div>

                    <div className="space-y-2 border-t pt-4">
                      <Label>Delivery address</Label>
                      <Input value={shippingAddress} onChange={(event) => setShippingAddress(event.target.value)} placeholder="Enter your full address" />
                    </div>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">৳{totalCartAmount}</span>
                  </div>
                  <Button className="w-full py-6 font-semibold" onClick={handlePlaceOrder} disabled={placingOrder}>
                    {placingOrder ? "Confirming order..." : "Confirm order"}
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search produce, milk, livestock..." className="pl-9" />
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Button key={key} variant={selectedCategory === key ? "default" : "outline"} size="sm" className="rounded-full whitespace-nowrap" onClick={() => setSelectedCategory(key)}>
              {label}
            </Button>
          ))}
        </div>
      </div>

      {myProducts.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" /> Your listings
            </CardTitle>
            <CardDescription>Manage the products you have already published.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {myProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-xl border bg-background/80 p-3">
                <div>
                  <p className="font-semibold">{product.title}</p>
                  <p className="text-sm text-muted-foreground">৳{product.price} / {product.unit}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => openEditDialog(product)}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1 text-red-500" onClick={() => handleDeleteProduct(product.id)}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="py-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Store className="mx-auto mb-3 h-12 w-12 stroke-1" />
          <h3 className="text-lg font-bold">No products found</h3>
          <p className="text-sm">Try changing your search or category filter.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => {
            const isOwnListing = Boolean(currentUserId && product.farmerId === currentUserId);
            return (
              <Card key={product.id} className="flex flex-col justify-between overflow-hidden border-border/60 transition-all hover:shadow-lg">
                <div className="relative h-48 overflow-hidden bg-muted">
                  <img src={product.images[0] || "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80"} alt={product.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <Badge className="absolute right-3 top-3 bg-background/90 font-medium text-foreground backdrop-blur">
                    {categoryLabels[product.category] || product.category}
                  </Badge>
                </div>

                <CardHeader className="p-4 pb-2">
                  <CardTitle className="line-clamp-1 text-lg font-bold">{product.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">{product.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-2 p-4 pt-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-primary">৳{product.price}</span>
                    <span className="text-xs text-muted-foreground">/ {product.unit}</span>
                  </div>
                  {product.farmerName && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Seller: <span className="font-medium text-foreground">{product.farmerName}</span>
                    </p>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col gap-2 p-4 pt-0">
                  <Link href={`/dashboard/marketplace/${product.id}`} className="w-full">
                    <Button variant="outline" className="w-full gap-2 font-semibold">
                      <ArrowRight className="h-4 w-4" /> View details
                    </Button>
                  </Link>
                  <Button className="w-full gap-2 font-semibold" onClick={() => addToCart(product)} disabled={isOwnListing || product.stock <= 0}>
                    <ShoppingCart className="h-4 w-4" /> {isOwnListing ? "Your listing" : product.stock <= 0 ? "Out of stock" : "Add to cart"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update listing</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProduct} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Product title</Label>
              <Input value={newProduct.title} onChange={(event) => setNewProduct({ ...newProduct, title: event.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newProduct.category} onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
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
                <Input value={newProduct.unit} onChange={(event) => setNewProduct({ ...newProduct, unit: event.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Price (৳)</Label>
                <Input type="number" value={newProduct.price} onChange={(event) => setNewProduct({ ...newProduct, price: event.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input type="number" value={newProduct.stock} onChange={(event) => setNewProduct({ ...newProduct, stock: event.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input value={newProduct.imageUrl} onChange={(event) => setNewProduct({ ...newProduct, imageUrl: event.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={newProduct.description} onChange={(event) => setNewProduct({ ...newProduct, description: event.target.value })} />
            </div>
            <Button type="submit" className="w-full font-semibold">Save changes</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
