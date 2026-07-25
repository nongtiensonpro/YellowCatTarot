export default function ReaderStudioLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Đang mở Bàn Đọc Bài Ghibli"
      className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#0e0805] text-[#e6c594]"
    >
      <div className="w-full max-w-md space-y-5 px-6 text-center">
        <div className="mx-auto h-16 w-16 motion-safe:animate-pulse rounded-full border border-[#d4af37]/50 bg-[#d4af37]/10" />
        <div className="h-5 motion-safe:animate-pulse rounded-full bg-[#d4af37]/20" />
        <div className="mx-auto h-3 w-4/5 motion-safe:animate-pulse rounded-full bg-[#b89f80]/20" />
        <div className="h-14 motion-safe:animate-pulse rounded-2xl border border-[#d4af37]/20 bg-[#1c120a]/80" />
      </div>
    </main>
  );
}
