"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPanel, adminControlClass } from "@/components/admin/panel";
import { ProductImages } from "@/components/admin/product-images";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { nestCategories } from "@/lib/categories";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/lib/types";

interface ProductFormProps {
  token: string;
  categories: Category[];
  product?: Product;
}

export function ProductForm({ token, categories, product }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const selectedCategory = typeof product?.category === "string" ? product.category : product?.category._id;
  const tree = nestCategories(categories);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const body = {
      name: String(form.get("name")),
      description: String(form.get("description")),
      price: Number(form.get("price")),
      compareAtPrice: form.get("compareAtPrice") ? Number(form.get("compareAtPrice")) : undefined,
      sku: String(form.get("sku")),
      stock: Number(form.get("stock")),
      category: String(form.get("category")),
      images,
      isPublished: form.get("isPublished") === "on",
    };

    setPending(true);
    setError(null);
    try {
      if (product) {
        await api<{ product: Product }>(`/admin/products/${product._id}`, {
          method: "PATCH",
          token,
          body,
        });
      } else {
        await api<{ product: Product }>("/admin/products", {
          method: "POST",
          token,
          body,
        });
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]" onSubmit={onSubmit}>
      <div className="space-y-6">
        <AdminPanel title="Details">
          <div className="grid gap-4 p-5">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={product?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={product?.description} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select id="category" name="category" defaultValue={selectedCategory} required className={adminControlClass}>
                <option value="">Select category</option>
                {tree.map((parent) => (
                  <optgroup key={parent._id} label={parent.name}>
                    {parent.children.length === 0 ? (
                      <option value={parent._id}>{parent.name}</option>
                    ) : (
                      parent.children.map((child) => (
                        <option key={child._id} value={child._id}>
                          {child.name}
                        </option>
                      ))
                    )}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel title="Pricing and inventory">
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" type="number" step="0.01" defaultValue={product?.price} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compareAtPrice">Compare at</Label>
              <Input id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" defaultValue={product?.compareAtPrice} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" name="sku" defaultValue={product?.sku} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" name="stock" type="number" defaultValue={product?.stock ?? 0} required />
            </div>
          </div>
        </AdminPanel>

        <AdminPanel title="Media" description="Upload photos to Cloudinary. The first image is the cover.">
          <div className="p-5">
            <ProductImages token={token} images={images} onChange={setImages} />
          </div>
        </AdminPanel>
      </div>

      <div className="space-y-4 lg:sticky lg:top-8">
        <AdminPanel title="Publish">
          <div className="space-y-4 p-5">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isPublished" defaultChecked={product?.isPublished} />
              Visible in the store
            </label>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Saving..." : product ? "Update product" : "Create product"}
            </Button>
            <Link href="/admin/products" className={cn(buttonVariants({ variant: "ghost" }), "w-full")}>
              Cancel
            </Link>
          </div>
        </AdminPanel>
      </div>
    </form>
  );
}
