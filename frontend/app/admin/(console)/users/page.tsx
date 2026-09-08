"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminEmpty, AdminPanel, adminControlClass } from "@/components/admin/panel";
import { AdminPageHeader } from "@/components/admin/page-header";
import { useSession } from "@/components/session-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import type { Paginated, User, UserRole } from "@/lib/types";

export default function AdminUsersPage() {
  const { adminToken } = useSession();
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!adminToken) return;
    const data = await api<Paginated<User>>("/admin/users", { token: adminToken, query: { limit: 50 } });
    setUsers(data.items);
  }

  useEffect(() => {
    load().catch(() => setUsers([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!adminToken) return;
    const form = new FormData(event.currentTarget);
    setError(null);
    try {
      await api<{ user: User }>("/admin/users", {
        method: "POST",
        token: adminToken,
        body: {
          name: String(form.get("name")),
          email: String(form.get("email")),
          password: String(form.get("password")),
          role: String(form.get("role")) as UserRole,
        },
      });
      event.currentTarget.reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create user");
    }
  }

  if (!users) {
    return <p className="text-sm text-muted-foreground">Loading users...</p>;
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Access"
        title="Users"
        description={`${users.length} ${users.length === 1 ? "account" : "accounts"} · customers and admins`}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <AdminPanel>
          {users.length === 0 ? (
            <AdminEmpty>No users yet.</AdminEmpty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3 capitalize">{user.role}</td>
                      <td className="px-4 py-3">
                        <Badge variant={user.isActive ? "success" : "warning"}>{user.isActive ? "Active" : "Disabled"}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminPanel>

        <AdminPanel title="Add user" description="Creates a store or console account.">
          <form className="space-y-4 p-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" minLength={8} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select id="role" name="role" className={adminControlClass}>
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full">
              Create user
            </Button>
          </form>
        </AdminPanel>
      </div>
    </div>
  );
}
