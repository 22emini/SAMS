import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function GmailComponent() {
  const [gmailList, setGmailList] = useState([]);
  const [gmail, setGmail] = useState("");
  const [gmailPassword, setGmailPassword] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGmails();
  }, []);

  async function fetchGmails() {
    setLoading(true);
    const res = await fetch("/api/usergmail");
    const data = await res.json();
    setGmailList(data);
    setLoading(false);
  }

  function handleEdit(entry) {
    setEditingId(entry.id);
    setGmail(entry.gmail);
    setGmailPassword(entry.gmail_password || "");
  }

  function resetForm() {
    setEditingId(null);
    setGmail("");
    setGmailPassword("");
  }

  async function handleSave() {
    setLoading(true);
    if (editingId) {
      await fetch(`/api/usergmail/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gmail, gmailPassword }),
      });
    } else {
      await fetch("/api/usergmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gmail: gmail, gmail_password: gmailPassword }),
      });
    }
    resetForm();
    fetchGmails();
    setLoading(false);
  }

  async function handleDelete(id) {
    setLoading(true);
    await fetch(`/api/usergmail/${id}`, { method: "DELETE" });
    fetchGmails();
    setLoading(false);
  }

  return (
    <div className="p-4 sm:p-6 mt-10 sm:mt-20 bg-white rounded shadow max-w-full sm:max-w-md mx-2 sm:mx-auto">
      <h2 className="text-lg sm:text-xl font-bold mb-4 text-center">Manage Gmail Accounts</h2>
      {loading && <div>Loading...</div>}
      <ul className="mb-4">
        {gmailList.map((entry) => (
          <li key={entry.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2 sm:gap-0">
            <span className="break-all">{entry.gmail}</span>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button size="sm" onClick={() => handleEdit(entry)} className="w-full sm:w-auto">Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(entry.id)} className="w-full sm:w-auto">Delete</Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="space-y-2 mb-4">
        <Input
          placeholder="Gmail"
          value={gmail}
          onChange={e => setGmail(e.target.value)}
          disabled={loading}
          className="w-full"
        />
        <Input
          placeholder="Gmail Password"
          type="password"
          value={gmailPassword}
          onChange={e => setGmailPassword(e.target.value)}
          disabled={loading}
          className="w-full"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={handleSave} disabled={loading || !gmail || !gmailPassword} className="w-full sm:w-auto">
          {editingId ? "Update" : "Save"}
        </Button>
        <Button variant="secondary" onClick={resetForm} disabled={loading} className="w-full sm:w-auto">
          Clear
        </Button>
      </div>
    </div>
  );
}
