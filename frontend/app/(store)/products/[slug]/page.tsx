import Link from "next/link";
import { ProductGallery } from "@/components/store/product-gallery";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { ProductCard } from "@/components/store/product-card";
import { api, ApiRequestError } from "@/lib/api";
import { money } from "@/lib/format";
import { categoryTrail, type Paginated, type Product } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let product: Product;
  try {
    const data = await api<{ product: Product }>(`/store/products/${slug}`);
    product = data.product;
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const onSale = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);
  const trail = categoryTrail(product.category);
  const categoryId = typeof product.category === "string" ? product.category : product.category._id;
  const related = (await api<Paginated<Product>>("/store/products", { query: { category: categoryId, limit: 5 } })).items
    .filter((item) => item._id !== product._id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        {trail.map((crumb) => (
          <span key={crumb.slug} className="flex items-center gap-1.5">
            <span>/</span>
            <Link href={`/#${crumb.slug}`} className="hover:text-foreground">
              {crumb.name}
            </Link>
          </span>
        ))}
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <ProductGallery images={product.images} name={product.name} />
        <div className="lg:pt-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{product.name}</h1>
          <p className="mt-4 text-xl">
            {money(product.price)}
            {onSale ? (
              <span className="ml-3 text-base text-muted-foreground line-through">{money(product.compareAtPrice!)}</span>
            ) : null}
          </p>
          <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">{product.description}</p>
          <dl className="mt-8 grid grid-cols-2 gap-px border border-border bg-border text-sm">
            <div className="bg-card p-4">
              <dt className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">Availability</dt>
              <dd className="mt-1.5 font-medium">{product.stock > 0 ? `${product.stock} in stock` : "Sold out"}</dd>
            </div>
            <div className="bg-card p-4">
              <dt className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">SKU</dt>
              <dd className="mt-1.5 font-medium">{product.sku}</dd>
            </div>
          </dl>
          <div className="mt-8">
            <AddToCartButton productId={product._id} disabled={product.stock < 1} max={product.stock} />
          </div>
          <p className="mt-6 text-xs leading-5 text-muted-foreground">
            Complimentary shipping. Returns accepted within 30 days.
          </p>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-16 border-t border-border pt-12">
          <h2 className="text-lg font-semibold tracking-tight">You may also like</h2>
          <div className="mt-6 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
