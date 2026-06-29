"use client";
export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function SectionPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Movimientos" />
      <EmptyState title="Movimientos" description="Sección en preparación." />
    </div>
  );
}
