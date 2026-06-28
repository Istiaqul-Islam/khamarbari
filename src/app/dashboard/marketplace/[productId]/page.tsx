"use client";

export const runtime = "edge";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Store, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}

interface Props {
  params: { productId: string };
}

export default function ProductDetailPage({ params }: Props) {
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const [productRes, userRes] = await Promise.all([fetch(`/api/marketplace/products?id=${params.productId}`), fetch("/api/user")]);
        const productData = (await productRes.json()) as any;
        const userData = (await userRes.json()) as any;
        if (productData.success && productData.data?.[0]) {
          setProduct(productData.data[0]);
        }
        if (userData.user?.id) {
          setCurrentUserId(userData.user.id);
        }
      } catch (error) {
        console.error("Failed to load product", error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.productId]);

  const isOwnListing = useMemo(() => Boolean(currentUserId && product?.farmerId === currentUserId), [currentUserId, product]);

  const addToCart = () => {
    if (!product) return;
    if (isOwnListing) {
      toast({ title: "Not available", description: "You cannot add your own listing to the cart.", variant: "destructive" });
      return;
    }
    if (product.stock <= 0) {
      toast({ title: "Out of stock", description: "This listing is currently unavailable.", variant: "destructive" });
      return;
    }
    toast({ title: "Added to cart", description: `${product.title} is ready for checkout.` });
  };

  if (loading) {
    return <div className="py-12 text-center">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/marketplace" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to marketplace
        </Link>
        <Card className="p-6 text-center text-muted-foreground">
          <Store className="mx-auto mb-3 h-12 w-12" />
          <p>This listing could not be found.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/marketplace" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to marketplace
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden">
          <img src={product.images[0] || "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80"} alt={product.title} className="h-80 w-full object-cover" />
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-2xl font-bold">{product.title}</CardTitle>
              <Badge>{product.category}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{product.description}</p>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="rounded-full bg-muted px-3 py-1">Price: ৳{product.price}</span>
              <span className="rounded-full bg-muted px-3 py-1">Unit: {product.unit}</span>
              <span className="rounded-full bg-muted px-3 py-1">Stock: {product.stock}</span>
            </div>
            {product.farmerName && <p className="text-sm text-muted-foreground">Seller: {product.farmerName}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Buy this listing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-sm font-medium">Ready for checkout</p>
              <p className="mt-1 text-sm text-muted-foreground">Payment is currently a UI placeholder. Orders will be recorded for follow-up.</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border p-3 text-sm">
              <Truck className="h-4 w-4 text-primary" /> Delivery and pickup support will be arranged after order confirmation.
            </div>
            <Button className="w-full gap-2 font-semibold" onClick={addToCart} disabled={isOwnListing || product.stock <= 0}>
              <ShoppingCart className="h-4 w-4" /> {isOwnListing ? "Your listing" : product.stock <= 0 ? "Out of stock" : "Add to cart"}
            </Button>
            <Link href="/dashboard/marketplace" className="block">
              <Button variant="outline" className="w-full">Browse more listings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
