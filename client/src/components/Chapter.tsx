// Chapter.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./pages/Navbar";
import Sidebar from "./pages/Sidebar";
import "../styles/chapter.css";

interface Chapter {
  id: string;
  title: string;
  overview?: string;
  cover?: string;
  sort_order?: number;
}

export default function Chapter() {
  const { id: courseId } = useParams<{ id: string }>(); // Ambil 'id' lalu alias ke 'courseId'

  const [userName, setUserName] = useState<string>("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [overview, setOverview] = useState("");
  const [cover, setCover] = useState("");
  const [sortOrder, setSortOrder] = useState<number | undefined>(undefined);

  // Fetch chapters
  const fetchChapters = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/courses/${courseId}/chapters`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch chapters");
      const data = await res.json();
      setChapters(data);
    } catch (err) {
      alert("Failed to fetch chapters");
    }
    setLoading(false);
  };

  useEffect(() => {
    // ambil data user dari localStorage
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setUserName(parsed.first_name || parsed.username || "User");
      } catch {
        setUserName("User");
      }
    }
    fetchChapters();
    // eslint-disable-next-line
  }, [courseId]);

  // Reset form
  const resetForm = () => {
    setTitle("");
    setOverview("");
    setCover("");
    setSortOrder(undefined);
    setEditId(null);
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      let res;
      if (editId) {
        // Update
        res = await fetch(`/api/chapters/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            overview,
            cover,
            sort_order: sortOrder,
          }),
        });
      } else {
        // Create
        res = await fetch(`/api/courses/${courseId}/chapters`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            overview,
            cover,
            sort_order: sortOrder,
          }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error saving chapter");
      fetchChapters();
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      alert("Error saving chapter: " + (err.message || "Unknown error"));
    }
  };

  // Edit handler
  const handleEdit = (chapter: Chapter) => {
    setEditId(chapter.id);
    setTitle(chapter.title);
    setOverview(chapter.overview || "");
    setCover(chapter.cover || "");
    setSortOrder(chapter.sort_order);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this chapter?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/chapters/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error deleting chapter");
      fetchChapters();
    } catch (err: any) {
      alert("Error deleting chapter: " + (err.message || "Unknown error"));
    }
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="main">
        {/* Navbar */}
        <Navbar userName={userName} onLogout={() => (window.location.href = "/login")} />

        {/* Page Content */}
        <main className="chapter-page">
          <div className="chapter-header">
            <h1>Chapters</h1>
            <button onClick={() => { resetForm(); setShowModal(true); }}>
              ➕ Add Chapter
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="chapter-list">
              {chapters.map((chapter) => (
                <div key={chapter.id} className="chapter-card">
                  <div>
                    <h3>{chapter.title}</h3>
                    <p>{chapter.overview}</p>
                  </div>
                  <div>
                    <button onClick={() => handleEdit(chapter)}>✏️ Edit</button>
                    <button onClick={() => handleDelete(chapter.id)}>🗑️ Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>{editId ? "Edit Chapter" : "Add Chapter"}</h2>
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                  <textarea
                    placeholder="Overview"
                    value={overview}
                    onChange={e => setOverview(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Cover URL"
                    value={cover}
                    onChange={e => setCover(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Sort Order"
                    value={sortOrder ?? ""}
                    onChange={e => setSortOrder(Number(e.target.value))}
                  />
                  <div style={{ marginTop: 16 }}>
                    <button type="submit">{editId ? "Update" : "Add"}</button>
                    <button type="button" onClick={() => { setShowModal(false); resetForm(); }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
