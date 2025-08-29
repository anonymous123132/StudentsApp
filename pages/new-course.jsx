import React, { useState } from "react";
import { Course } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Plus, X, GraduationCap, Calendar, MapPin, Video } from "lucide-react";

const colors = [
  { value: "#1e40af", label: "כחול" },
  { value: "#dc2626", label: "אדום" },
  { value: "#16a34a", label: "ירוק" },
  { value: "#ca8a04", label: "זהב" },
  { value: "#9333ea", label: "סגול" },
  { value: "#ea580c", label: "כתום" },
  { value: "#0891b2", label: "ציאן" },
  { value: "#be123c", label: "ורוד" }
];

const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const meetingTypes = ["הרצאה", "תרגול", "מעבדה"];
const locationTypes = ["פיזי", "מקוון", "היברידי"];

export default function NewCoursePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [courseData, setCourseData] = useState({
    name: "",
    code: "",
    semester: "א",
    color: "#1e40af",
    instructor: "",
    credits: "",
    meetings: []
  });

  const addMeeting = () => {
    setCourseData(prev => ({
      ...prev,
      meetings: [...prev.meetings, {
        day: "",
        start_time: "",
        end_time: "",
        type: "הרצאה",
        location_type: "פיזי",
        location: "",
        building: "",
        room: ""
      }]
    }));
  };

  const removeMeeting = (index) => {
    setCourseData(prev => ({
      ...prev,
      meetings: prev.meetings.filter((_, i) => i !== index)
    }));
  };

  const updateMeeting = (index, field, value) => {
    setCourseData(prev => ({
      ...prev,
      meetings: prev.meetings.map((meeting, i) => 
        i === index ? { ...meeting, [field]: value } : meeting
      )
    }));
  };

  const handleSubmit = async () => {
    if (!courseData.name || !courseData.code) {
      alert("נא למלא את כל השדות החובה");
      return;
    }

    setLoading(true);
    try {
      await Course.create({
        ...courseData,
        credits: courseData.credits ? parseInt(courseData.credits) : undefined
      });
      navigate(createPageUrl("Courses"));
    } catch (error) {
      console.error("Error creating course:", error);
      alert("שגיאה ביצירת הקורס");
    }
    setLoading(false);
  };

  const canProceed = () => {
    if (step === 1) {
      return courseData.name && courseData.code;
    }
    return true;
  };

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl("Courses"))}
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            חזור לקורסים
          </Button>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-slate-900">קורס חדש</h1>
            <p className="text-slate-600">הוסף קורס חדש למערכת הלימודים שלך</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-center items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200'
              }`}>1</div>
              <span className="font-medium">פרטי הקורס</span>
            </div>
            <div className="w-16 h-0.5 bg-slate-300" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200'
              }`}>2</div>
              <span className="font-medium">מפגשים</span>
            </div>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-right">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              {step === 1 ? "פרטי הקורס" : "מפגשי הקורס"}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-right block">קוד הקורס *</Label>
                    <Input
                      id="code"
                      placeholder="לדוגמה: CS101"
                      value={courseData.code}
                      onChange={(e) => setCourseData(prev => ({...prev, code: e.target.value}))}
                      className="text-right"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-right block">שם הקורס *</Label>
                    <Input
                      id="name"
                      placeholder="לדוגמה: מבוא למדעי המחשב"
                      value={courseData.name}
                      onChange={(e) => setCourseData(prev => ({...prev, name: e.target.value}))}
                      className="text-right"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-right block">סמסטר</Label>
                    <Select value={courseData.semester} onValueChange={(value) => setCourseData(prev => ({...prev, semester: value}))}>
                      <SelectTrigger className="text-right">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="א">סמסטר א'</SelectItem>
                        <SelectItem value="ב">סמסטר ב'</SelectItem>
                        <SelectItem value="קיץ">סמסטר קיץ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="credits" className="text-right block">נק"ז</Label>
                    <Input
                      id="credits"
                      type="number"
                      placeholder="3"
                      value={courseData.credits}
                      onChange={(e) => setCourseData(prev => ({...prev, credits: e.target.value}))}
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-right block">צבע הקורס</Label>
                    <Select value={courseData.color} onValueChange={(value) => setCourseData(prev => ({...prev, color: value}))}>
                      <SelectTrigger className="text-right">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map(color => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <span>{color.label}</span>
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.value }}></div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructor" className="text-right block">שם המרצה</Label>
                  <Input
                    id="instructor"
                    placeholder="דר' דוגמה לביאדוקטור"
                    value={courseData.instructor}
                    onChange={(e) => setCourseData(prev => ({...prev, instructor: e.target.value}))}
                    className="text-right"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <Button onClick={addMeeting} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 ml-2" />
                    הוסף מפגש
                  </Button>
                  <p className="text-slate-600 text-right">
                    הוסף את המפגשים השבועיים של הקורס (הרצאות, תרגולים, מעבדות)
                  </p>
                </div>

                {courseData.meetings.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>לא הוגדרו מפגשים עדיין</p>
                    <p className="text-sm mt-1">לחץ על "הוסף מפגש" כדי להתחיל</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courseData.meetings.map((meeting, index) => (
                      <Card key={index} className="border border-slate-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMeeting(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <h4 className="font-medium text-slate-900">מפגש #{index + 1}</h4>
                          </div>

                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label className="text-right block">יום בשבוע</Label>
                              <Select 
                                value={meeting.day} 
                                onValueChange={(value) => updateMeeting(index, 'day', value)}
                              >
                                <SelectTrigger className="text-right">
                                  <SelectValue placeholder="בחר יום" />
                                </SelectTrigger>
                                <SelectContent>
                                  {days.map(day => (
                                    <SelectItem key={day} value={day}>{day}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-right block">שעת התחלה</Label>
                              <Input
                                type="time"
                                value={meeting.start_time}
                                onChange={(e) => updateMeeting(index, 'start_time', e.target.value)}
                                className="text-right"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-right block">שעת סיום</Label>
                              <Input
                                type="time"
                                value={meeting.end_time}
                                onChange={(e) => updateMeeting(index, 'end_time', e.target.value)}
                                className="text-right"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-right block">סוג המפגש</Label>
                              <Select 
                                value={meeting.type} 
                                onValueChange={(value) => updateMeeting(index, 'type', value)}
                              >
                                <SelectTrigger className="text-right">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {meetingTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-right block">סוג מיקום</Label>
                              <Select 
                                value={meeting.location_type} 
                                onValueChange={(value) => updateMeeting(index, 'location_type', value)}
                              >
                                <SelectTrigger className="text-right">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {locationTypes.map(type => (
                                    <SelectItem key={type} value={type}>
                                      <div className="flex items-center gap-2">
                                        <span>{type}</span>
                                        {type === 'מקוון' ? (
                                          <Video className="w-4 h-4" />
                                        ) : (
                                          <MapPin className="w-4 h-4" />
                                        )}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-right block">
                                {meeting.location_type === 'מקוון' ? 'קישור למפגש' : 'בניין'}
                              </Label>
                              <Input
                                placeholder={meeting.location_type === 'מקוון' ? 'https://zoom.us/...' : 'בניין מדעי המחשב'}
                                value={meeting.location_type === 'מקוון' ? meeting.location : meeting.building}
                                onChange={(e) => updateMeeting(index, meeting.location_type === 'מקוון' ? 'location' : 'building', e.target.value)}
                                className="text-right"
                              />
                            </div>

                            {meeting.location_type !== 'מקוון' && (
                              <div className="space-y-2">
                                <Label className="text-right block">חדר</Label>
                                <Input
                                  placeholder="חדר 101"
                                  value={meeting.room}
                                  onChange={(e) => updateMeeting(index, 'room', e.target.value)}
                                  className="text-right"
                                />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-slate-100">
              {step === 1 ? (
                <div></div>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                >
                  שלב קודם
                </Button>
              )}
              
              <div className="flex gap-3">
                {step === 1 ? (
                  <Button 
                    onClick={() => setStep(2)}
                    disabled={!canProceed()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    המשך למפגשים
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? "שומר..." : "צור קורס"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
