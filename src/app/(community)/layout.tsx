import { CommunitySidebar } from "@/components/layout/CommunitySidebar";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <CommunitySidebar />
      <main className="flex-1 overflow-y-auto bg-cream p-8">{children}</main>
    </div>
  );
}
