import React, { useState, useEffect } from "react";
import { Course, Task } from "@/entities/all";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  GraduationCap,
  Plus,
  Clock,
  MapPin,
  Video,
  Calendar,
  BookOpen,
  Target,
  CheckCircle2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesData, tasksData] = await Promise.all([
        Course.list("-created_date"),
        Task.list()
      ]);
      setCourses(coursesData);
      setTasks(tasksData);
    } catch (error) {
      console.error("Error loading courses:", error);
    }
    setLoading(false);
  };

  const getTasksForCourse = (courseId) => {
    return tasks.filter(task => task.course_id === courseId);
  };

  const getNextMeeting = (meetings) => {
    if (!meetings || meetings.length === 0) return null;

    const today = new Date();
    const currentDay = today.getDay();
    const dayNames = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

    for (let i = 0; i < 14; i++) {
      const checkDay = (currentDay + i) % 7;
      const dayName = dayNames[checkDay];
      const meeting = meetings.find(m => m.day === dayName);
      if (meeting) {
        return {
          ...meeting,
          dayName,
          daysFromNow: i
        };
      }
    }
    return meetings[0];
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-8"></div>
          <div className="grid gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-64 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link to={createPageUrl("NewCourse")}>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg">
              <Plus className="w-5 h-5 ml-2" />
              קורס חדש
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">הקורסים שלי</h1>
        </div>

        {courses.length === 0 ? (
          <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <GraduationCap className="w-24 h-24 mx-auto mb-6 text-slate-300" />
              <h2 className="text-2xl font-bold text-slate-900 mb-4">עדיין לא הוספת קורסים</h2>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                התחל בהוספת הקורסים שלך כדי לנהל את הלימודים בצורה חכמה ומסודרת
              </p>
              <Link to={createPageUrl("NewCourse")}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-5 h-5 ml-2" />
                  הוסף קורס ראשון
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {courses.map(course => {
              const courseTasks = getTasksForCourse(course.id);
              const pendingTasks = courseTasks.filter(t => t.status !== "הושלם");
              const completedTasks = courseTasks.filter(t => t.status === "הושלם");
              const urgentTasks = pendingTasks.filter(t => {
                if (!t.due_date) return false;
                const dueDate = new Date(t.due_date);
                const now = new Date();
                const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
                return diffDays <= 3 && diffDays >= 0;
              });
              const nextMeeting = getNextMeeting(course.meetings);

              return (
                <Card key={course.id} className="border-none shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
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
                          <Badge variant="outline" className="font-medium">
                            {course.credits} נק''ז
                          </Badge>
                        )}
                      </div>

                      <div className="text-right">
                        <CardTitle className="text-xl mb-2">{course.name}</CardTitle>
                        {course.instructor && (
                          <p className="text-slate-600 text-sm">מרצה: {course.instructor}</p>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <h3 className="font-semibold text-slate-700 text-right flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          מפגש הבא
                        </h3>
                        {nextMeeting ? (
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-1">
                                {nextMeeting.location_type === 'מקוון' ? (
                                  <Video className="w-4 h-4 text-blue-500" />
                                ) : (
                                  <MapPin className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                              <span className="font-medium text-slate-900">
                                {nextMeeting.dayName}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 text-right">
                              {nextMeeting.start_time} - {nextMeeting.end_time}
                            </p>
                            {nextMeeting.location && (
                              <p className="text-xs text-slate-500 text-right mt-1">
                                {nextMeeting.building && `${nextMeeting.building} - `}
                                {nextMeeting.room}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 text-right">לא הוגדרו מפגשים</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-semibold text-slate-700 text-right flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          מטלות
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">{completedTasks.length}</span>
                            <span className="text-sm text-slate-600">הושלמו</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-orange-600">{pendingTasks.length}</span>
                            <span className="text-sm text-slate-600">בהמתנה</span>
                          </div>
                          {urgentTasks.length > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-red-600">{urgentTasks.length}</span>
                              <span className="text-sm text-slate-600">דחופות</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-semibold text-slate-700 text-right flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          התקדמות
                        </h3>
                        <div className="space-y-2">
                          {courseTasks.length > 0 ? (
                            <>
                              <Progress
                                value={Math.round((completedTasks.length / courseTasks.length) * 100)}
                                className="h-2"
                              />
                              <p className="text-sm text-slate-600 text-right">
                                {Math.round((completedTasks.length / courseTasks.length) * 100)}% הושלם
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-slate-500 text-right">אין מטלות</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                      <Link to={createPageUrl("CourseDetails", `course=${course.id}`)}>
                        <Button variant="outline">
                          <BookOpen className="w-4 h-4 ml-2" />
                          פרטי קורס
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

