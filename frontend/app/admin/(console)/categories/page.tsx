"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminEmpty, AdminPanel, adminControlClass } from "@/components/admin/panel";
import { AdminPageHeader } from "@/components/admin/page-header";
import { useSession } from "@/components/session-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nestCategories } from "@/lib/categories";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const { adminToken } = useSession();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!adminToken) return;
    const data = await api<{ categories: Category[] }>("/admin/categories", { token: adminToken });
    setCategories(data.categories);
  }

  useEffect(() => {
    load().catch(() => setCategories([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!adminToken) return;
    const form = new FormData(event.currentTarget);
    setError(null);
    try {
      await api<{ category: Category }>("/admin/categories", {
        method: "POST",
        token: adminToken,
        body: {
          name: String(form.get("name")),
          description: String(form.get("description") || "") || undefined,
          parent: String(form.get("parent") || "") || null,
        },
      });
      event.currentTarget.reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create category");
    }
  }

  async function remove(id: string) {
    if (!adminToken || !confirm("Delete this category?")) return;
    await api(`/admin/categories/${id}`, { method: "DELETE", token: adminToken });
    await load();
  }

  if (!categories) {
    return <p className="text-sm text-muted-foreground">Loading categories...</p>;
  }

  const tree = nestCategories(categories);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Two levels: a top-level department and optional children."
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <AdminPanel>
          {tree.length === 0 ? (
            <AdminEmpty>No categories yet.</AdminEmpty>
          ) : (
            <ul>
              {tree.map((category) => (
                <li key={category._id} className="border-b border-border last:border-b-0">
                  <div className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.slug}
                        {category.description ? ` · ${category.description}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={category.isActive ? "success" : "warning"}>
                        {category.isActive ? "Active" : "Hidden"}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => remove(category._id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                  {category.children.map((child) => (
                    <div key={child._id} className="flex items-center justify-between gap-3 border-t border-border/70 bg-muted/20 py-3 pr-5 pl-10">
                      <div>
                        <p className="text-sm">{child.name}</p>
                        <p className="text-xs text-muted-foreground">{child.slug}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={child.isActive ? "outline" : "warning"}>
                          {child.isActive ? "Child" : "Hidden"}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => remove(child._id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel title="Add category" description="Leave parent empty for a department.">
          <form className="space-y-4 p-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent">Parent</Label>
              <select id="parent" name="parent" className={adminControlClass}>
                <option value="">Top level</option>
                {tree.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full">
              Create category
            </Button>
          </form>
        </AdminPanel>
      </div>
    </div>
  );
}
