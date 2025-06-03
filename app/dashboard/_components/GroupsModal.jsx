'use client'
import React, { useState } from "react";
import { toast } from "sonner"
const GroupsModal = ({ onClose, handleAddGroup, handleEditGroup, handleDeleteGroup, group }) => {
  const [groupName, setGroupName] = useState(group ? group.grade : "");
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (group) {
      // Edit existing grade
      const response = await fetch('/api/grade', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: group.id, grade: groupName }),
      });
      const data = await response.json();
      // Pass the updated grade object with the correct structure
      handleEditGroup({ id: group.id, grade: groupName });
      toast.success("You successfull change the Grade")
    } else {
      // Add new grade
      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grade: groupName }),
      });
      const data = await response.json();
      // Create a new grade object with the response data or use a temporary ID if needed
      const newGrade = { id: data.id || Date.now(), grade: groupName };
      handleAddGroup(newGrade);
      toast.success("You have sucessfully added Grade")
    }
    onClose();
  };

  const handleDelete = async () => {
    const response = await fetch('/api/grade', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: group.id }),
    });
    const data = await response.json();
    handleDeleteGroup(group.id);
    setIsDeleteConfirmationOpen(false);
    toast.warning(' you have deleted Grade from the database')
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {group ? "Edit Grade" : "Add Grade"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Grade Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              {group ? "Save Changes" : "Add Grade"}
            </button>
            {group && (
              <button
                type="button"
                onClick={() => setIsDeleteConfirmationOpen(true)}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            )}
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        {isDeleteConfirmationOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
              <p className="mb-4">Are you sure you want to delete this grade?</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsDeleteConfirmationOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsModal;