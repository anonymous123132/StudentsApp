import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  BookOpen, 
  Home,
  GraduationCap,
  Calendar,
  Clock,
  Settings,
  Plus,
  Target
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "דשבורד",
    url: createPageUrl("Dashboard"),
    icon: Home,
  },
  {
    title: "הקורסים שלי",
    url: createPageUrl("Courses"),
    icon: GraduationCap,
  },
  {
    title: "יומן שבועי",
    url: createPageUrl("Calendar"),
    icon: Calendar,
  },
  {
    title: "זמן לימוד",
    url: createPageUrl("StudySessions"),
    icon: Clock,
  },
  {
    title: "חומרי לימוד",
    url: createPageUrl("TextbookProgress"),
    icon: BookOpen,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <Sidebar className="border-l border-slate-200 bg-white/95 backdrop-blur-sm">
            <SidebarHeader className="border-b border-slate-200 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <h2 className="font-bold text-slate-900 text-lg">יומן אקדמי</h2>
                  <p className="text-sm text-slate-500">מערכת לניהול הלימודים</p>
                </div>
              </div>
            </SidebarHeader>
            
            <SidebarContent className="p-4">
              <SidebarGroup>
                <SidebarGroupLabel className="text-sm font-semibold text-slate-600 px-3 py-2 text-right">
                  ניווט ראשי
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-1 ${
                            location.pathname === item.url ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' : 'text-slate-600'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3 text-right">
                            <span className="font-medium text-right flex-1">{item.title}</span>
                            <item.icon className="w-5 h-5 ml-2" />
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup className="mt-6">
                <SidebarGroupLabel className="text-sm font-semibold text-slate-600 px-3 py-2 text-right">
                  פעולות מהירות
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-3 py-2 space-y-3">
                    <Link to={createPageUrl("NewCourse")}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                        <Plus className="w-4 h-4 ml-2" />
                        קורס חדש
                      </Button>
                    </Link>
                    <div className="text-sm space-y-2">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="font-medium">0</span>
                        <span>קורסים פעילים</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="font-medium text-orange-600">0</span>
                        <span>מטלות השבוע</span>
                      </div>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0 text-right">
                  <p className="font-medium text-slate-900 text-sm truncate">משתמש</p>
                  <p className="text-xs text-slate-500 truncate">נהל את הלימודים שלך</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                  <span className="text-slate-600 font-semibold text-sm">מ</span>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 flex flex-col">
            <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 md:hidden">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-slate-900 flex-1 text-right">יומן אקדמי</h1>
                <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

