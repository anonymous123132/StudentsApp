import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { CheckCircle2, AlertTriangle, Clock } from "lucide-react";

export default function TasksList({ tasks, courseColor }) {
  if (!tasks || tasks.length === 0) {
    return (
      <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-right">מטלות</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-slate-500">
          אין מטלות לקורס
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-right flex items-center gap-2">
          <Clock className="w-5 h-5" />
          מטלות
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map(task => {
          const due = task.due_date ? format(new Date(task.due_date), 'd MMMM', { locale: he }) : null;
          const statusIcon = task.status === 'הושלם' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : null;
          const urgent = task.due_date && new Date(task.due_date) - Date.now() < 3*24*60*60*1000;
          return (
            <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <div className="text-right">
                <div className="font-medium" style={{ color: courseColor }}>{task.title}</div>
                {due && <div className="text-sm text-slate-600">{due}</div>}
              </div>
              <div className="flex items-center gap-2">
                {urgent && <AlertTriangle className="w-4 h-4 text-red-600" />}
                {statusIcon}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
