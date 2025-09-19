// ChapterContent.tsx
import React, { useEffect, useState } from "react";
import Navbar from "./pages/Navbar";
import Sidebar from "./pages/Sidebar";
import "../styles/chaptercontent.css";

interface Content {
  id: string;
  chapter_id: string;
  title: string;
  overview?: string;
  cover?: string;
  content_type: "video" | "slide" | "download";
  sort_order?: number;
  path?: string;
  original_file_name?: string;
}

interface Props {
  chapterId: string;
}

export default function ChapterContents({ chapterId }: Props) {
  const [contents, setContents] = useState<Content[]>([]);
  const [form, setForm] = useState<Partial<Content>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const token = localStorage.getItem("token");

  // Fetch contents
  const fetchContents = async () => {
    try {
      const res = await fetch(`/api/chapters/${chapterId}/contents`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!res.ok) throw new Error("Failed to fetch contents");
      const data = await res.json();
      setContents(data);
    } catch (err) {
      alert("Error fetching contents");
    }
  };

  useEffect(() => {
    if (chapterId) fetchContents();
    // eslint-disable-next-line
  }, [chapterId]);

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    let value: string | number = e.target.value;
    if (e.target.name === "sort_order") value = Number(value);
    setForm({ ...form, [e.target.name]: value });
  };

  // Handle file input for cover only (convert to base64 for preview & send)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, cover: reader.result as string }));
    reader.readAsDataURL(file);
  };

  // Submit form (add/update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId
        ? `/api/contents/${editingId}`
        : `/api/chapters/${chapterId}/contents`;
      const method = editingId ? "PUT" : "POST";

      const payload = {
        ...form,
        sort_order: form.sort_order ? Number(form.sort_order) : undefined,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to save content");
      }

      setForm({});
      setEditingId(null);
      setModalOpen(false);
      fetchContents();
    } catch (err: any) {
      alert("Error saving content: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Edit content
  const handleEdit = (content: Content) => {
    setEditingId(content.id);
    setForm(content);
    setModalOpen(true);
  };

  // Delete content
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure to delete this content?")) return;
    try {
      const res = await fetch(`/api/contents/${id}`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!res.ok) throw new Error("Failed to delete content");
      fetchContents();
    } catch (err: any) {
      alert("Error deleting content: " + (err.message || err));
    }
  };

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Navbar userName={"User"} onLogout={() => (window.location.href = "/login")} />
        <main className="chapter-page">
          <div className="chapter-header">
            <h1>Chapter Contents</h1>
            <button
              onClick={() => {
                setEditingId(null);
                setForm({});
                setModalOpen(true);
              }}
              style={{ marginLeft: "1rem" }}
            >
              ➕ Add Content
            </button>
          </div>

          {/* Modal Form */}
          {modalOpen && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>{editingId ? "Edit Content" : "Add Content"}</h2>
                <form onSubmit={handleSubmit} className="chapter-form">
                  <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={form.title || ""}
                    onChange={handleChange}
                    required
                  />
                  <textarea
                    name="overview"
                    placeholder="Overview"
                    value={form.overview || ""}
                    onChange={handleChange}
                  />
                  <select
                    name="content_type"
                    value={form.content_type || ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="video">Video</option>
                    <option value="slide">Slide</option>
                    <option value="download">Download</option>
                  </select>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {form.cover && (
                    <img src={form.cover} alt="cover" style={{ width: 100, margin: 4 }} />
                  )}
                  <input
                    type="text"
                    name="path"
                    placeholder="Path / URL"
                    value={form.path || ""}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    name="original_file_name"
                    placeholder="Original File Name"
                    value={form.original_file_name || ""}
                    onChange={handleChange}
                  />
                  <input
                    type="number"
                    name="sort_order"
                    placeholder="Sort Order"
                    value={form.sort_order || ""}
                    onChange={handleChange}
                  />
                  <div style={{ marginTop: 8 }}>
                    <button type="submit" disabled={loading}>
                      {editingId ? "Update Content" : "Add Content"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModalOpen(false);
                        setEditingId(null);
                        setForm({});
                      }}
                      style={{ marginLeft: 8 }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Card layout */}
          <div className="contents-grid">
            {/* Video section */}
            {contents
              .filter((c) => c.content_type === "video")
              .map((c) => (
                <div key={c.id} className="content-card">
                  {c.cover && (
                    <img
                      src={c.cover}
                      alt={c.title}
                      style={{ width: "100%", cursor: "pointer" }}
                      onClick={() => c.path && window.open(c.path, "_blank")}
                    />
                  )}
                  <h3>{c.title}</h3>
                  <p>{c.overview}</p>
                  <div className="card-actions">
                    <button onClick={() => handleEdit(c)}>Edit</button>
                    <button onClick={() => handleDelete(c.id)}>Delete</button>
                  </div>
                </div>
              ))}

            {/* Slides section (horizontal scroll) */}
            {contents.some((c) => c.content_type === "slide") && (
              <div className="slides-scroll">
                {contents
                  .filter((c) => c.content_type === "slide")
                  .map((c) => (
                    <img
                      key={c.id}
                      src={c.cover || c.path}
                      alt={c.title}
                      className="slide-img"
                      title={c.title}
                    />
                  ))}
              </div>
            )}

            {/* Download section */}
            {contents
              .filter((c) => c.content_type === "download")
              .map((c) => (
                <div key={c.id} className="content-card">
                  <a href={c.path} download={c.original_file_name}>
                    Download {c.original_file_name || c.title}
                  </a>
                  <h3>{c.title}</h3>
                  <p>{c.overview}</p>
                  <div className="card-actions">
                    <button onClick={() => handleEdit(c)}>Edit</button>
                    <button onClick={() => handleDelete(c.id)}>Delete</button>
                  </div>
                </div>
              ))}
          </div>
        </main>
      </div>
    </div>
  );
}
