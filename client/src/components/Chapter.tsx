// Chapter.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate(); // Tambahkan useNavigate

  const [userName, setUserName] = useState<string>("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [overview, setOverview] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
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
    setCoverFile(null);
    setCoverPreview("");
    setSortOrder(undefined);
    setEditId(null);
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverFile(file);
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    } else {
      setCoverPreview("");
    }
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      let body: any = {
        title,
        overview,
        sort_order: sortOrder,
      };

      if (coverFile) {
        const reader = new FileReader();
        reader.readAsDataURL(coverFile);
        reader.onloadend = async () => {
          body.cover = reader.result;
          await submitToServer(body);
        };
      } else {
        body.cover = coverPreview || "";
        await submitToServer(body);
      }
    } catch (err: any) {
      alert("Error saving chapter: " + (err.message || "Unknown error"));
    }
  };

  const submitToServer = async (body: any) => {
    const token = localStorage.getItem("token");
    let res;
    if (editId) {
      res = await fetch(`/api/chapters/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch(`/api/courses/${courseId}/chapters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error saving chapter");
    fetchChapters();
    setShowModal(false);
    resetForm();
  };

  // Edit handler
  const handleEdit = (chapter: Chapter) => {
    setEditId(chapter.id);
    setTitle(chapter.title);
    setOverview(chapter.overview || "");
    setCoverPreview(chapter.cover || "");
    setSortOrder(chapter.sort_order);
    setShowModal(true);
  };

  // Delete handler
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

  // Navigasi ke ChapterContents saat card diklik
  const handleCardClick = (chapterId: string) => {
    navigate(`/chapter/${chapterId}/contents`);
  };

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Navbar userName={userName} onLogout={() => (window.location.href = "/login")} />

        <main className="chapter-page">
          <div className="chapter-header">
            <h1>Chapters</h1>
            <button onClick={() => { resetForm(); setShowModal(true); }}>➕ Add Chapter</button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="chapter-list">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="chapter-card"
                  onClick={() => handleCardClick(chapter.id)} // klik card langsung navigasi
                  style={{ cursor: "pointer" }}
                >
                  <div>
                    <h3>{chapter.title}</h3>
                    <p>{chapter.overview}</p>
                    {chapter.cover && <img src={chapter.cover} alt="Cover" style={{ maxWidth: "200px", marginTop: 8 }} />}
                  </div>
                  <div>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(chapter); }}>✏️ Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(chapter.id); }}>🗑️ Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>{editId ? "Edit Chapter" : "Add Chapter"}</h2>
                <form onSubmit={handleSubmit}>
                  <label>Title:</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />

                  <label>Overview:</label>
                  <textarea
                    value={overview}
                    onChange={e => setOverview(e.target.value)}
                  />

                  <label>Cover:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {coverPreview && <img src={coverPreview} alt="Preview" style={{ maxWidth: "200px", marginTop: 8 }} />}

                  <label>Sort Order:</label>
                  <input
                    type="number"
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
