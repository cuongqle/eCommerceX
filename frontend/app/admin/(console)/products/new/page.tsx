"use client";

import { useEffect, useState } from "react";
import { ProductForm } from "@/components/admin/product-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { useSession } from "@/components/session-provider";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";

export default function NewProductPage() {
  const { adminToken } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!adminToken) return;
    api<{ categories: Category[] }>("/admin/categories", { token: adminToken })
      .then((data) => setCategories(data.categories))
      .catch(() => setCategories([]));
  }, [adminToken]);

  if (!adminToken) return null;

  return (
    <div>
      <AdminPageHeader eyebrow="Catalog" title="New product" description="Publish to the store when the details are ready." />
      <ProductForm token={adminToken} categories={categories} />
    </div>
  );
}
