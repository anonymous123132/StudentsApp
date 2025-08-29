import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock } from 'lucide-react';

export default function StudySessionsPage() {
  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end items-center mb-8 gap-3">
          <h1 className="text-3xl font-bold text-slate-900">זמן לימוד</h1>
          <Clock className="w-8 h-8 text-purple-600" />
        </div>
        <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <Clock className="w-24 h-24 mx-auto mb-6 text-slate-300" />
              <h2 className="text-2xl font-bold text-slate-900 mb-4">עמוד בבנייה</h2>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                כאן יוצגו כל בלוקי הלימוד המתוכננים שלך ותוכל ליצור בלוקים חדשים בצורה חכמה.
              </p>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
