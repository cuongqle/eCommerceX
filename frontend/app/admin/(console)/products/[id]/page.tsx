"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { useSession } from "@/components/session-provider";
import { api } from "@/lib/api";
import type { Category, Product } from "@/lib/types";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const { adminToken } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!adminToken) return;
    Promise.all([
      api<{ product: Product }>(`/admin/products/${params.id}`, { token: adminToken }),
      api<{ categories: Category[] }>("/admin/categories", { token: adminToken }),
    ])
      .then(([productData, categoryData]) => {
        setProduct(productData.product);
        setCategories(categoryData.categories);
      })
      .catch(() => {
        setProduct(null);
        setCategories([]);
      });
  }, [adminToken, params.id]);

  if (!adminToken || !product) {
    return <p className="text-sm text-muted-foreground">Loading product...</p>;
  }

  return (
    <div>
      <AdminPageHeader eyebrow="Catalog" title="Edit product" description={product.sku} />
      <ProductForm token={adminToken} categories={categories} product={product} />
    </div>
  );
}
