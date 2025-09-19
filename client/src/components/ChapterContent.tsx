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
  slides?: string[];
  download_file?: string;
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
  const [userName, setUserName] = useState<string>("User");

  // Untuk slide aktif
  const [activeSlides, setActiveSlides] = useState<Record<string, number>>({});

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
  }, []);

  const fetchContents = async () => {
    try {
      const res = await fetch(`/api/chapters/${chapterId}/contents`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!res.ok) throw new Error("Failed to fetch contents");
      const data = await res.json();
      setContents(data);
    } catch (err) {
      console.error(err);
      alert("Error fetching contents. Check CORS or server status.");
    }
  };

  useEffect(() => {
    fetchContents();
  }, [chapterId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    let value: string | number = e.target.value;
    if (e.target.name === "sort_order") value = Number(value);
    setForm({ ...form, [e.target.name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileURL = URL.createObjectURL(file);

    if (key === "slides") {
      setForm({ ...form, slides: [...(form.slides || []), fileURL] });
    } else if (key === "download_file") {
      setForm({ ...form, download_file: fileURL, original_file_name: file.name });
    } else {
      setForm({ ...form, [key]: fileURL });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId
        ? `/api/contents/${editingId}`
        : `/api/chapters/${chapterId}/contents`;
      const method = editingId ? "PUT" : "POST";

      const payload = editingId
        ? form
        : {
            ...form,
            chapter_id: chapterId,
            sort_order: Number(form.sort_order) || 0,
            content_type: form.content_type || "video",
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
      console.error(err);
      alert("Error saving content: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (content: Content) => {
    setEditingId(content.id);
    setForm(content);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure to delete this content?")) return;
    try {
      const res = await fetch(`/api/contents/${id}`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to delete content");
      }
      fetchContents();
    } catch (err: any) {
      console.error(err);
      alert("Error deleting content: " + (err.message || err));
    }
  };

  // Slide navigation
  const nextSlide = (id: string, length: number) => {
    setActiveSlides((prev) => ({
      ...prev,
      [id]: prev[id] !== undefined ? (prev[id] + 1) % length : 0,
    }));
  };

  const prevSlide = (id: string, length: number) => {
    setActiveSlides((prev) => ({
      ...prev,
      [id]: prev[id] !== undefined ? (prev[id] - 1 + length) % length : 0,
    }));
  };

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Navbar userName={userName} onLogout={() => (window.location.href = "/login")} />
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

          {/* Modal */}
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

                  {form.content_type === "video" && (
                    <>
                      <label>Cover / Thumbnail</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "cover")}
                      />
                      {form.cover && (
                        <img
                          src={form.cover}
                          alt="cover"
                          style={{ width: "150px", cursor: "pointer" }}
                          onClick={() => form.path && window.open(form.path, "_blank")}
                        />
                      )}
                      <input
                        type="text"
                        name="path"
                        placeholder="Video URL"
                        value={form.path || ""}
                        onChange={handleChange}
                        required
                      />
                    </>
                  )}

                  {form.content_type === "slide" && (
                    <>
                      <label>Slides</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "slides")}
                      />
                      <div className="slides-preview">
                        {form.slides?.map((s, i) => (
                          <img key={i} src={s} alt={`slide-${i}`} style={{ width: 100, margin: 4 }} />
                        ))}
                      </div>
                    </>
                  )}

                  {form.content_type === "download" && (
                    <>
                      <label>File to Download</label>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, "download_file")}
                      />
                      {form.download_file && (
                        <a href={form.download_file} download={form.original_file_name}>
                          Download {form.original_file_name}
                        </a>
                      )}
                    </>
                  )}

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
            {contents.map((c) => (
              <div key={c.id} className="content-card">
                {c.content_type === "video" && c.cover && (
                  <img
                    src={c.cover}
                    alt={c.title}
                    style={{ width: "100%", cursor: "pointer" }}
                    onClick={() => c.path && window.open(c.path, "_blank")}
                  />
                )}
                {c.content_type === "slide" && c.slides && (
                  <div className="slides-container">
                    {c.slides.length > 0 && (
                      <img
                        src={c.slides[activeSlides[c.id] || 0]}
                        alt={c.title}
                        style={{ width: "100%" }}
                      />
                    )}
                    {c.slides.length > 1 && (
                      <div className="slide-buttons">
                        <button onClick={() => prevSlide(c.id, c.slides!.length)}>◀</button>
                        <button onClick={() => nextSlide(c.id, c.slides!.length)}>▶</button>
                      </div>
                    )}
                  </div>
                )}
                {c.content_type === "download" && c.download_file && (
                  <a href={c.download_file} download={c.original_file_name}>
                    Download {c.original_file_name}
                  </a>
                )}

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
