import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

const colorStyles = {
  blue: {
    bg: "from-blue-500 to-blue-600",
    icon: "bg-blue-100 text-blue-600"
  },
  green: {
    bg: "from-green-500 to-green-600",
    icon: "bg-green-100 text-green-600"
  },
  orange: {
    bg: "from-orange-500 to-orange-600",
    icon: "bg-orange-100 text-orange-600"
  },
  purple: {
    bg: "from-purple-500 to-purple-600",
    icon: "bg-purple-100 text-purple-600"
  },
  red: {
    bg: "from-red-500 to-red-600",
    icon: "bg-red-100 text-red-600"
  }
};

export default function StatsCard({ title, value, icon: Icon, color, subtitle, urgent }) {
  const styles = colorStyles[urgent ? 'red' : color] || colorStyles.blue;
  
  return (
    <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-32 h-32 transform translate-x-8 -translate-y-8 bg-gradient-to-br ${styles.bg} rounded-full opacity-10`} />
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="text-right flex-1">
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
              {value}
            </CardTitle>
            {subtitle && (
              <div className="flex items-center gap-2 justify-end">
                {urgent && <AlertTriangle className="w-4 h-4 text-red-500" />}
                <span className={`text-sm ${urgent ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                  {subtitle}
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${styles.icon}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
