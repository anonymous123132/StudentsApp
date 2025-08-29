import React, { useState, useEffect } from "react";
import { Task, Course } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Target } from "lucide-react";

export default function NewTaskPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedCourseId = urlParams.get('course');
  
  const [taskData, setTaskData] = useState({
    course_id: preselectedCourseId || "",
    title: "",
    description: "",
    type: "שיעורי_בית",
    due_date: "",
    estimated_hours: "",
    priority: "בינונית",
    status: "לא_התחלתי",
    chapters: [],
    subtasks: []
  });

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const coursesData = await Course.list();
        setCourses(coursesData);
      } catch (error) {
        console.error("Error loading courses:", error);
      }
    };
    loadCourses();
  }, []);

  const handleSubmit = async () => {
    if (!taskData.course_id || !taskData.title || !taskData.due_date) {
      alert("נא למלא את כל השדות החובה");
      return;
    }

    setLoading(true);
    try {
      await Task.create({
        ...taskData,
        estimated_hours: taskData.estimated_hours ? parseInt(taskData.estimated_hours) : undefined
      });
      
      if (preselectedCourseId) {
        navigate(createPageUrl("CourseDetails") + `?course=${preselectedCourseId}`);
      } else {
        navigate(createPageUrl("Dashboard"));
      }
    } catch (error) {
      console.error("Error creating task:", error);
      alert("שגיאה ביצירת המטלה");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => {
              if (preselectedCourseId) {
                navigate(createPageUrl("CourseDetails") + `?course=${preselectedCourseId}`);
              } else {
                navigate(createPageUrl("Dashboard"));
              }
            }}
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            חזור
          </Button>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-slate-900">מטלה חדשה</h1>
            <p className="text-slate-600">הוסף מטלה חדשה למערכת הלימודים</p>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-right">
              <Target className="w-6 h-6 text-blue-600" />
              פרטי המטלה
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-right block">קורס *</Label>
              <Select value={taskData.course_id} onValueChange={(value) => setTaskData(prev => ({...prev, course_id: value}))}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="בחר קורס" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-right block">כותרת המטלה *</Label>
              <Input
                id="title"
                placeholder="לדוגמה: תרגיל בית 3"
                value={taskData.title}
                onChange={(e) => setTaskData(prev => ({...prev, title: e.target.value}))}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-right block">תיאור</Label>
              <Textarea
                id="description"
                placeholder="פרטים נוספים על המטלה..."
                value={taskData.description}
                onChange={(e) => setTaskData(prev => ({...prev, description: e.target.value}))}
                className="text-right h-24"
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-right block">סוג המטלה</Label>
                <Select value={taskData.type} onValueChange={(value) => setTaskData(prev => ({...prev, type: value}))}>
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="שיעורי_בית">שיעורי בית</SelectItem>
                    <SelectItem value="פרויקט">פרויקט</SelectItem>
                    <SelectItem value="מעבדה">מעבדה</SelectItem>
                    <SelectItem value="בחינה">בחינה</SelectItem>
                    <SelectItem value="מבחן">מבחן</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date" className="text-right block">תאריך הגשה *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={taskData.due_date}
                  onChange={(e) => setTaskData(prev => ({...prev, due_date: e.target.value}))}
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_hours" className="text-right block">הערכת שעות</Label>
                <Input
                  id="estimated_hours"
                  type="number"
                  placeholder="5"
                  value={taskData.estimated_hours}
                  onChange={(e) => setTaskData(prev => ({...prev, estimated_hours: e.target.value}))}
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-right block">עדיפות</Label>
                <Select value={taskData.priority} onValueChange={(value) => setTaskData(prev => ({...prev, priority: value}))}>
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="גבוהה">גבוהה</SelectItem>
                    <SelectItem value="בינונית">בינונית</SelectItem>
                    <SelectItem value="נמוכה">נמוכה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-100">
              <Button 
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? "שומר..." : "צור מטלה"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

