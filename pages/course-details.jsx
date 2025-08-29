import React, { useState, useEffect } from "react";
import { Course, Task, TextbookProgress } from "@/entities/all";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowRight,
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  Video,
  BookOpen,
  Target,
  Plus,
  Edit,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

import CourseSchedule from "../components/course/CourseSchedule";
import TasksList from "../components/course/TasksList";
import ReadingProgress from "../components/course/ReadingProgress";

export default function CourseDetailsPage() {
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('course');

  useEffect(() => {
    const loadCourseData = async () => {
      setLoading(true);
      try {
        const [courseData, tasksData, progressData] = await Promise.all([
          Course.list(),
          Task.list(),
          TextbookProgress.list()
        ]);

        const foundCourse = courseData.find(c => c.id === courseId);
        if (!foundCourse) {
          navigate(createPageUrl("Courses"));
          return;
        }

        setCourse(foundCourse);
        setTasks(tasksData.filter(t => t.course_id === courseId));
        setProgress(progressData.filter(p => p.course_id === courseId));
      } catch (error) {
        console.error("Error loading course data:", error);
        navigate(createPageUrl("Courses"));
      }
      setLoading(false);
    };

    if (courseId) {
      loadCourseData();
    } else {
      navigate(createPageUrl("Courses"));
    }
  }, [courseId, navigate]);

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-8"></div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-slate-200 rounded-xl"></div>
              <div className="h-96 bg-slate-200 rounded-xl"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-slate-200 rounded-xl"></div>
              <div className="h-64 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <GraduationCap className="w-24 h-24 mx-auto mb-6 text-slate-300" />
              <h2 className="text-2xl font-bold text-slate-900 mb-4">קורס לא נמצא</h2>
              <p className="text-slate-600 mb-8">הקורס המבוקש לא קיים במערכת</p>
              <Button onClick={() => navigate(createPageUrl("Courses"))}>
                <ArrowRight className="w-4 h-4 ml-2" />
                חזור לרשימת הקורסים
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => t.status !== "הושלם");
  const completedTasks = tasks.filter(t => t.status === "הושלם");
  const urgentTasks = pendingTasks.filter(t => {
    if (!t.due_date) return false;
    const dueDate = new Date(t.due_date);
    const now = new Date();
    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  });

  const readPages = progress.filter(p => p.read).length;
  const totalPages = progress.length;
  const summarizedPages = progress.filter(p => p.summarized).length;
  const practicedPages = progress.filter(p => p.practiced).length;

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl("Courses"))}
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            חזור לקורסים
          </Button>
          <div className="text-right flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge
                style={{
                  backgroundColor: course.color + '20',
                  color: course.color,
                  borderColor: course.color + '40'
                }}
                className="border font-medium"
              >
                {course.code}
              </Badge>
              {course.credits && (
                <Badge variant="outline">{course.credits} נק''ז</Badge>
              )}
              <h1 className="text-3xl font-bold text-slate-900">{course.name}</h1>
            </div>
            {course.instructor && (
              <p className="text-slate-600">מרצה: {course.instructor}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{pendingTasks.length}</div>
              <div className="text-sm text-slate-600">מטלות פתוחות</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{urgentTasks.length}</div>
              <div className="text-sm text-slate-600">דחופות השבוע</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{completedTasks.length}</div>
              <div className="text-sm text-slate-600">הושלמו</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {totalPages > 0 ? Math.round((readPages / totalPages) * 100) : 0}%
              </div>
              <div className="text-sm text-slate-600">עמודים נקראו</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CourseSchedule course={course} />
            <TasksList tasks={tasks} courseColor={course.color} />
          </div>

          <div className="space-y-6">
            <ReadingProgress progress={progress} course={course} />

            <Card className="border-none shadow-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="text-right text-white">פעולות מהירות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-white text-blue-600 hover:bg-slate-50">
                  <Plus className="w-4 h-4 ml-2" />
                  הוסף מטלה חדשה
                </Button>
                <Button variant="outline" className="w-full border-white text-white hover:bg-white/20">
                  <Edit className="w-4 h-4 ml-2" />
                  ערוך פרטי קורס
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
