import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Video } from "lucide-react";

export default function CourseSchedule({ course }) {
  const meetings = course?.meetings || [];

  if (meetings.length === 0) {
    return (
      <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-right">לוח זמנים</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-slate-500">
          לא הוגדרו מפגשים
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-right flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          לוח זמנים
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {meetings.map((m, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
            <div className="text-right">
              <div className="font-medium text-slate-900">{m.day} {m.start_time}–{m.end_time}</div>
              {m.location_type === 'מקוון' ? (
                <div className="text-sm text-blue-600 flex items-center gap-1 justify-end">
                  <Video className="w-4 h-4" />
                  <span>{m.location}</span>
                </div>
              ) : (
                <div className="text-sm text-slate-600 flex items-center gap-1 justify-end">
                  <MapPin className="w-4 h-4" />
                  <span>{m.building ? `${m.building} ${m.room || ''}` : m.location}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
