import ContentPage from "@/components/ContentPage";
import { BookOpen } from "lucide-react";

export default function RulesPage() {
  return (
    <ContentPage
      title="Kurallar"
      documentType="rules"
      description="Sunucu kurallarımızı okuyarak güvenli ve eğlenceli bir oyun deneyimi yaşayın."
      icon={<BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />}
    />
  );
}
