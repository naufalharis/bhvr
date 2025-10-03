// src/components/Chapter.tsx
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
  course_id?: string;
}

interface User {
  id: string;
  first_name: string;
  username: string;
  role: string; // instructor | student
}

interface Course {
  id: string;
  title: string;
  slug: string;
}

export default function Chapter() {
  const { id: courseSlug } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
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

  // Get token from localStorage
  const getToken = () => localStorage.getItem("token");

  // Fetch course by slug first to get course ID
  const fetchCourseBySlug = async () => {
    if (!courseSlug) return null;
    try {
      const token = getToken();
      const res = await fetch(`/api/courses/slug/${courseSlug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        // Try alternative endpoint
        const res2 = await fetch(`/api/courses?slug=${courseSlug}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res2.ok) throw new Error("Course not found");
        const data = await res2.json();
        return Array.isArray(data) ? data.find(c => c.slug === courseSlug) : data;
      }
      const data = await res.json();
      return data.course || data.data || data;
    } catch (err) {
      console.error("Error fetching course:", err);
      return null;
    }
  };

  // Fetch chapters by course ID
  const fetchChapters = async () => {
    if (!courseSlug) return;
    setLoading(true);
    try {
      // First get the course by slug to get the ID
      const courseData = await fetchCourseBySlug();
      if (!courseData) {
        throw new Error("Course not found");
      }
      
      setCourse(courseData);
      const courseId = courseData.id;

      const token = getToken();
      
      // Try different endpoints for fetching chapters
      let res;
      
      // Try endpoint 1: /api/courses/{courseId}/chapters
      res = await fetch(`/api/courses/${courseId}/chapters`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        // Try endpoint 2: /api/chapters?course_id={courseId}
        res = await fetch(`/api/chapters?course_id=${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (!res.ok) {
        // Try endpoint 3: /api/chapters/course/${courseId}
        res = await fetch(`/api/chapters/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (!res.ok) {
        throw new Error("Failed to fetch chapters");
      }

      const data = await res.json();
      // Handle different response formats
      const chaptersData = Array.isArray(data) ? data : data.chapters || data.data || [];
      setChapters(chaptersData);
    } catch (err: any) {
      console.error("Failed to fetch chapters:", err);
      alert("Failed to fetch chapters: " + err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
    fetchChapters();
    // eslint-disable-next-line
  }, [courseSlug]);

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

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Submit handler (instructor only)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!course) {
      alert("Course not found. Please refresh the page.");
      return;
    }

    const token = getToken();
    if (!token) {
      alert("Authentication required");
      return;
    }

    setLoading(true);

    try {
      let coverBase64 = "";
      
      // Handle cover image
      if (coverFile) {
        coverBase64 = await fileToBase64(coverFile);
      } else if (coverPreview && !coverPreview.startsWith('blob:')) {
        // If it's already a base64 string (from edit), use it directly
        coverBase64 = coverPreview;
      }

      const body: any = {
        title,
        overview: overview || "",
        sort_order: sortOrder || 0,
        course_id: course.id, // Include course_id in the request
      };

      if (coverBase64) {
        body.cover = coverBase64;
      }

      await submitToServer(body);
      
    } catch (err: any) {
      console.error("Error saving chapter:", err);
      alert("Error saving chapter: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const submitToServer = async (body: any) => {
    const token = getToken();
    let res;
    let data;

    try {
      if (editId) {
        // Update existing chapter
        res = await fetch(`/api/chapters/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      } else {
        // Create new chapter - try different endpoints
        let endpoints = [
          `/api/courses/${course?.id}/chapters`,
          `/api/chapters`,
          `/api/chapters/create`
        ];

        let lastError = null;

        for (const endpoint of endpoints) {
          try {
            res = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(body),
            });

            if (res.ok) {
              data = await res.json();
              break;
            } else {
              lastError = await res.text();
            }
          } catch (err) {
            lastError = err;
          }
        }

        if (!res?.ok) {
          throw new Error(
            typeof lastError === "string"
              ? lastError
              : lastError instanceof Error && lastError.message
                ? lastError.message
                : "Failed to create chapter"
          );
        }
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error saving chapter");
      }

      // Parse response if not already parsed
      if (!data) {
        data = await res.json();
      }

      fetchChapters();
      setShowModal(false);
      resetForm();
      alert(`Chapter ${editId ? 'updated' : 'created'} successfully!`);

    } catch (err: any) {
      console.error("Server error:", err);
      throw new Error(err.message || "Error saving chapter");
    }
  };

  // Edit handler (instructor only)
  const handleEdit = (chapter: Chapter) => {
    setEditId(chapter.id);
    setTitle(chapter.title);
    setOverview(chapter.overview || "");
    setCoverPreview(chapter.cover || "");
    setSortOrder(chapter.sort_order);
    setShowModal(true);
  };

  // Delete handler (instructor only)
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this chapter?")) return;
    
    const token = getToken();
    if (!token) {
      alert("Authentication required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/chapters/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error deleting chapter");
      }

      fetchChapters();
      alert("Chapter deleted successfully!");
    } catch (err: any) {
      console.error("Error deleting chapter:", err);
      alert("Error deleting chapter: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
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
        <Navbar
          userName={user ? user.first_name || user.username : "User"}
          onLogout={() => (window.location.href = "/login")}
        />

        <main className="chapter-page">
          <div className="chapter-header">
            <h1>
              Chapters 
              {course && ` - ${course.title}`}
              {courseSlug && !course && ` - ${courseSlug}`}
            </h1>
            {user?.role === "instructor" && (
              <button
                className="add-chapter-btn"
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                disabled={loading}
              >
                ➕ Add Chapter
              </button>
            )}
          </div>

          {!course && courseSlug && (
            <div className="error-banner">
              <p>Course "{courseSlug}" not found. Please check the URL or ensure the course exists.</p>
            </div>
          )}

          {loading ? (
            <div className="loading">Loading chapters...</div>
          ) : (
            <div className="chapter-list">
              {chapters.length > 0 ? (
                chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="chapter-card"
                    onClick={() => handleCardClick(chapter.id)}
                  >
                    <div className="chapter-content">
                      <h3>{chapter.title}</h3>
                      {chapter.overview && (
                        <p className="chapter-overview">{chapter.overview}</p>
                      )}
                      {chapter.cover && (
                        <img
                          src={chapter.cover}
                          alt="Chapter cover"
                          className="chapter-cover"
                        />
                      )}
                      {chapter.sort_order !== undefined && (
                        <span className="sort-order">Order: {chapter.sort_order}</span>
                      )}
                    </div>

                    {/* tombol hanya untuk instructor */}
                    {user?.role === "instructor" && (
                      <div className="chapter-actions">
                        <button
                          className="edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(chapter);
                          }}
                          disabled={loading}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(chapter.id);
                          }}
                          disabled={loading}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No chapters found.</p>
                  {user?.role === "instructor" && (
                    <p>Click "Add Chapter" to create the first chapter.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Modal (instructor only) */}
          {showModal && user?.role === "instructor" && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>{editId ? "Edit Chapter" : "Add Chapter"}</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Title:</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Overview:</label>
                    <textarea
                      value={overview}
                      onChange={(e) => setOverview(e.target.value)}
                      disabled={loading}
                      rows={3}
                    />
                  </div>

                  <div className="form-group">
                    <label>Cover Image:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={loading}
                    />
                    {coverPreview && (
                      <img
                        src={coverPreview}
                        alt="Preview"
                        className="cover-preview"
                      />
                    )}
                  </div>

                  <div className="form-group">
                    <label>Sort Order:</label>
                    <input
                      type="number"
                      value={sortOrder ?? ""}
                      onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
                      disabled={loading}
                      min="0"
                    />
                  </div>

                  {course && (
                    <div className="form-info">
                      <p><strong>Course:</strong> {course.title}</p>
                      <p><strong>Course ID:</strong> {course.id}</p>
                    </div>
                  )}

                  <div className="modal-actions">
                    <button 
                      type="submit" 
                      className="submit-btn"
                      disabled={loading}
                    >
                      {loading ? "Processing..." : (editId ? "Update Chapter" : "Add Chapter")}
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      disabled={loading}
                    >
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