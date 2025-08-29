import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen } from "lucide-react";

export default function ReadingProgress({ progress, course }) {
  const readPages = progress.filter(p => p.read).length;
  const summarizedPages = progress.filter(p => p.summarized).length;
  const practicedPages = progress.filter(p => p.practiced).length;
  const totalPages = progress.length;
  const percent = totalPages > 0 ? Math.round((readPages / totalPages) * 100) : 0;

  return (
    <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-right flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          התקדמות קריאה
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Progress value={percent} className="h-2" />
          <p className="text-sm text-slate-600 text-right mt-2">
            {readPages}/{totalPages} עמודים נקראו
          </p>
        </div>
        <div className="flex justify-between text-sm text-slate-600">
          <span>נסקרו: {summarizedPages}</span>
          <span>תורגלו: {practicedPages}</span>
        </div>
      </CardContent>
    </Card>
  );
}
