"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminEmpty, AdminPanel } from "@/components/admin/panel";
import { ProductImage } from "@/components/product-image";
import { AdminPageHeader } from "@/components/admin/page-header";
import { useSession } from "@/components/session-provider";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { money } from "@/lib/format";
import { categoryName, type Paginated, type Product } from "@/lib/types";

export default function AdminProductsPage() {
  const { adminToken } = useSession();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [query, setQuery] = useState("");

  async function load() {
    if (!adminToken) return;
    const data = await api<Paginated<Product>>("/admin/products", { token: adminToken, query: { limit: 50 } });
    setProducts(data.items);
  }

  useEffect(() => {
    load().catch(() => setProducts([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken]);

  async function remove(id: string) {
    if (!adminToken || !confirm("Delete this product?")) return;
    await api(`/admin/products/${id}`, { method: "DELETE", token: adminToken });
    await load();
  }

  const visible = useMemo(() => {
    if (!products) return [];
    const term = query.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        categoryName(product.category).toLowerCase().includes(term)
    );
  }, [products, query]);

  if (!products) {
    return <p className="text-sm text-muted-foreground">Loading products...</p>;
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Products"
        description={`${products.length} ${products.length === 1 ? "product" : "products"} in the catalog`}
        action={
          <Link href="/admin/products/new" className={buttonVariants()}>
            New product
          </Link>
        }
      />
      <div className="mb-4">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, SKU, or category"
          className="max-w-sm"
        />
      </div>
      <AdminPanel>
        {visible.length === 0 ? (
          <AdminEmpty>{products.length === 0 ? "No products yet." : "No products match that search."}</AdminEmpty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {visible.map((product) => (
                  <tr key={product._id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-11 overflow-hidden bg-muted">
                          <ProductImage src={product.images[0]} alt={product.name} className="size-full" />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{categoryName(product.category)}</td>
                    <td className="px-4 py-3 tabular-nums">{money(product.price)}</td>
                    <td className="px-4 py-3">
                      <span className={product.stock <= 5 ? "text-amber-700" : undefined}>{product.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={product.isPublished ? "success" : "warning"}>
                        {product.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/products/${product._id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                        Edit
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => remove(product._id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
