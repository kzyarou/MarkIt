import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSections } from "@/services/gradesService";
import { Section, Subject } from "@/types/grading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const SubjectsECRPage = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSection() {
      setLoading(true);
      const sections = await getSections();
      const foundSection = sections.find(s => s.id === sectionId);
      setSection(foundSection || null);
      setLoading(false);
    }
    if (sectionId) fetchSection();
  }, [sectionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181c24]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181c24]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Section not found</h1>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181c24] pb-8 px-2 sm:px-4">
      <div className="pt-6 pb-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center mb-2 text-white">EducHub</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 gap-2 sm:gap-0 max-w-4xl mx-auto">
          <Button variant="ghost" className="text-white mr-0 sm:mr-4 mb-2 sm:mb-0" onClick={() => navigate(`/section/${section.id}`)}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div>
            <div className="text-lg font-semibold text-white">Section: {section.name}</div>
            <div className="text-sm text-gray-300">Select a subject to record or view grades.</div>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto mt-4">
        {section.subjects.length === 0 ? (
          <Card className="bg-[#202634]">
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-white mb-2">No subjects in this section</h3>
              <p className="text-gray-400 mb-4">Add subjects to this section to record scores.</p>
              <Button onClick={() => navigate(`/section/${section.id}`)} className="bg-blue-600 hover:bg-blue-700 text-white">Go to Section</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-[#232a36] rounded-lg shadow-lg p-2 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {section.subjects.map((subject: Subject) => (
                <Card key={subject.id} className="hover:shadow-md transition-shadow cursor-pointer bg-[#202634] min-h-[80px]" onClick={() => navigate(`/section/${section.id}/subjects-ecr/${subject.id}`)}>
                  <CardHeader>
                    <CardTitle className="text-white text-base sm:text-lg">{subject.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs sm:text-sm text-gray-400">
                      WW: {subject.writtenWorkWeight}% | PT: {subject.performanceTaskWeight}% | QE: {subject.quarterlyExamWeight}%
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectsECRPage; 