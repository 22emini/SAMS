'use client'
import React, { useState, useEffect } from "react";
import GroupsModal from "../_components/GroupsModal";
import StudentList from "../_components/StudentList";
import { Pencil } from "lucide-react";
import GmailModal from "../_components/GmailModal";


const GradesPage = () => {
  const [grades, setGrades] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/grade');
      const data = await response.json();
      // Artificial delay of 3 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      setGrades(data);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGrade = (newGrade) => {
    setGrades([...grades, newGrade]);
  };

  const handleEditGrade = (updatedGrade) => {
    setGrades(grades.map((g) => (g.id === updatedGrade.id ? updatedGrade : g)));
  };

  const handleDeleteGrade = (gradeId) => {
    setGrades(grades.filter((g) => g.id !== gradeId));
  };

  return (
    <div className="p-4 border rounded-lg m-8">
      <button
        onClick={() => {
          setSelectedGrade(null);
          setIsModalOpen(true);
        }}
        className="px-4 py-2 bg-blue-700 text-white rounded"
      >
        Add Grade / Course
      </button>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
        </div>
      ) : (
        <ul className="mt-4">
          {grades.map((grade) => (
            <li key={grade.id} className="flex justify-between items-center p-2 border-b">
              <span>{grade.grade}</span>
              <div>
                <button
                  onClick={() => {
                    setSelectedGrade(grade);
                    setIsModalOpen(true);
                  }}
                  className="px-2 py-1 bg-blue-700 text-white rounded mr-2"
                >
                <Pencil />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isModalOpen && (
        <GroupsModal
          onClose={() => setIsModalOpen(false)}
          handleAddGroup={handleAddGrade}
          handleEditGroup={handleEditGrade}
          handleDeleteGroup={handleDeleteGrade}
          group={selectedGrade}
        />
      )}
      <GmailModal />
      <StudentList />
      
    </div>
  );
};

export default GradesPage;