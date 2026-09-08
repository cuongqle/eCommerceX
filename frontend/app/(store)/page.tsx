import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { CategoryNav } from "@/components/store/category-nav";
import { DepartmentSection } from "@/components/store/department-section";
import { TrustStrip } from "@/components/store/trust-strip";
import { buttonVariants } from "@/components/ui/button";
import { api } from "@/lib/api";
import { money } from "@/lib/format";
import { categoryIdsInTree, nestCategories } from "@/lib/categories";
import type { Category, Paginated, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

function categoryId(product: Product): string {
  return typeof product.category === "string" ? product.category : product.category._id;
}

export default async function StoreHome() {
  const [{ items: products }, { categories }] = await Promise.all([
    api<Paginated<Product>>("/store/products", { query: { limit: 50 } }),
    api<{ categories: Category[] }>("/store/categories"),
  ]);

  const tree = nestCategories(categories);
  const groups = tree.map((category) => {
    const ids = new Set(categoryIdsInTree(category));
    return {
      category,
      products: products.filter((product) => ids.has(categoryId(product))),
    };
  });

  const featured = products.find((product) => product.compareAtPrice && product.compareAtPrice > product.price) ?? products[0];

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-zinc-950 text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=80"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-zinc-950/25" />
        <div className="relative mx-auto flex min-h-[52vh] max-w-6xl flex-col justify-end px-4 py-14 sm:min-h-[56vh] sm:py-16">
          <p className="text-[11px] tracking-[0.22em] text-white/65 uppercase">The house edit</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            A considered collection for everyday rooms.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/70">
            Apparel, electronics, and home — published from one catalog.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a href="#catalog" className={cn(buttonVariants({ size: "lg" }), "bg-white text-zinc-950 hover:bg-white/90")}>
              Shop the collection
              <ArrowDown />
            </a>
            {featured ? (
              <Link href={`/products/${featured.slug}`} className="text-sm text-white/80 underline-offset-4 hover:underline">
                {featured.compareAtPrice ? `On sale · ${featured.name}` : featured.name} · {money(featured.price)}
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <TrustStrip />
      <CategoryNav categories={tree} />

      <div id="catalog" className="scroll-mt-36">
        {groups.map(({ category, products: items }, index) => (
          <DepartmentSection key={category._id} category={category} products={items} index={index} />
        ))}
      </div>
    </div>
  );
}
