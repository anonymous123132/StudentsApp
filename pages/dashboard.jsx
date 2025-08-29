import React, { useState, useEffect } from "react";
import { Course, Task, StudySession, TextbookProgress } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  GraduationCap,
  BookOpen,
  Clock,
  Target,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Plus,
  CheckCircle2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import StatsCard from "../components/dashboard/StatsCard";
import UpcomingTasks from "../components/dashboard/UpcomingTasks";
import WeeklySchedule from "../components/dashboard/WeeklySchedule";
import QuickActions from "../components/dashboard/QuickActions";

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesData, tasksData, sessionsData, progressData] = await Promise.all([
        Course.list(),
        Task.list("-due_date"),
        StudySession.list("-start_date"),
        TextbookProgress.list()
      ]);

      setCourses(coursesData);
      setTasks(tasksData);
      setStudySessions(sessionsData);
      setProgress(progressData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setLoading(false);
  };

  const upcomingTasks = tasks
    .filter(task => task.status !== "הושלם")
    .slice(0, 5);

  const thisWeekTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return dueDate >= now && dueDate <= weekFromNow && task.status !== "הושלם";
  });

  const completedTasksThisWeek = tasks.filter(task => {
    if (task.status !== "הושלם") return false;
    const completedDate = new Date(task.updated_date);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return completedDate >= weekAgo;
  });

  const overdueTasks = tasks.filter(task => {
    if (!task.due_date || task.status === "הושלם") return false;
    const dueDate = new Date(task.due_date);
    const now = new Date();
    return dueDate < now;
  });

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="text-right">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              ברוכים השבים! 👋
            </h1>
            <p className="text-slate-600 text-lg">
              הנה מבט כולל על הלימודים שלכם השבוע
            </p>
          </div>
          <QuickActions onUpdate={loadData} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="קורסים פעילים"
            value={courses.length}
            icon={GraduationCap}
            color="blue"
            subtitle="סה''כ קורסים"
          />
          <StatsCard
            title="מטלות השבוע"
            value={thisWeekTasks.length}
            icon={Clock}
            color="orange"
            subtitle={`${overdueTasks.length > 0 ? overdueTasks.length + ' באיחור' : 'הכל בזמן'}`}
            urgent={overdueTasks.length > 0}
          />
          <StatsCard
            title="הושלמו השבוע"
            value={completedTasksThisWeek.length}
            icon={CheckCircle2}
            color="green"
            subtitle="מטלות שהושלמו"
          />
          <StatsCard
            title="שעות לימוד"
            value={Math.round(studySessions.reduce((sum, session) => sum + (session.duration_minutes / 60), 0))}
            icon={Target}
            color="purple"
            subtitle="השבוע"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <UpcomingTasks 
              tasks={upcomingTasks}
              overdueTasks={overdueTasks}
              onUpdate={loadData}
            />
            <WeeklySchedule 
              courses={courses}
              studySessions={studySessions.slice(0, 7)}
            />
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-right">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  התקדמות קריאה
                </CardTitle>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-4">עדיין לא הוספת קורסים</p>
                    <Link to={createPageUrl("NewCourse")}>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 ml-2" />
                        הוסף קורס ראשון
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.slice(0, 3).map(course => {
                      const courseProgress = progress.filter(p => p.course_id === course.id);
                      const readPages = courseProgress.filter(p => p.read).length;
                      const totalPages = courseProgress.length;
                      const progressPercentage = totalPages > 0 ? Math.round((readPages / totalPages) * 100) : 0;

                      return (
                        <div key={course.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge 
                              style={{ backgroundColor: course.color + '20', color: course.color }}
                              className="font-medium"
                            >
                              {course.code}
                            </Badge>
                            <span className="text-sm font-medium text-slate-700">
                              {readPages}/{totalPages} עמודים
                            </span>
                          </div>
                          <Progress 
                            value={progressPercentage} 
                            className="h-2"
                            style={{ 
                              "--progress-background": course.color 
                            }}
                          />
                        </div>
                      );
                    })}

                    {courses.length > 3 && (
                      <Link to={createPageUrl("TextbookProgress")}>
                        <Button variant="outline" size="sm" className="w-full mt-4">
                          ראה הכל
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-right text-white">
                  <Calendar className="w-5 h-5" />
                  זמן ללמידה חכם
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-blue-100 text-right">
                  המערכת יכולה לתכנן עבורכם בלוקי לימוד בהתאמה אישית
                </p>
                <Link to={createPageUrl("StudySessions")}>
                  <Button className="w-full bg-white text-blue-600 hover:bg-slate-50">
                    <Target className="w-4 h-4 ml-2" />
                    תכנן זמן לימוד
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

