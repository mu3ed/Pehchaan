import { useLanguage } from "@/lib/i18n/context";

export function LoadingSpinner({ text }: { text?: string }) {
  const { t } = useLanguage();
  const displayText = text || t("common.loading");

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="w-8 h-8 border-3 border-[#D9E1E8] border-t-[#1C6B66] rounded-full animate-spin" />
      <div className="text-[#6B7686] text-[14px]">{displayText}</div>
    </div>
  );
}
