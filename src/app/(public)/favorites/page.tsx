import type { Metadata } from "next";
import { FavoritesGrid } from "@/features/favorites/components/favorites-grid";
import { Container } from "@/shared/components/layout/container";

export const metadata: Metadata = {
  title: "Favorites",
};

export default function FavoritesPage() {
  return (
    <Container className="flex flex-1 flex-col gap-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-page-h1 text-heading">Favorites</h1>
        <p className="text-subtle">The ads you&apos;ve saved for later, all in one place.</p>
      </div>
      <FavoritesGrid />
    </Container>
  );
}
