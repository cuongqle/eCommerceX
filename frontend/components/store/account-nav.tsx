"use client";

import Link from "next/link";
import { useSession } from "@/components/session-provider";
import { cn } from "@/lib/utils";

export function AccountNav({ current }: { current: "orders" | "order" }) {
  const { storeUser } = useSession();

  return (
    <aside className="lg:sticky lg:top-28">
      <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">Account</p>
      {storeUser ? <p className="mt-2 text-sm font-medium">{storeUser.name}</p> : null}
      <nav className="mt-5 flex flex-col gap-2 text-sm">
        <Link href="/orders" className={cn(current === "orders" || current === "order" ? "font-medium" : "text-muted-foreground hover:text-foreground")}>
          Orders
        </Link>
        <Link href="/#catalog" className="text-muted-foreground hover:text-foreground">
          Continue shopping
        </Link>
      </nav>
    </aside>
  );
}
