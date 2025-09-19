import React, { useEffect, useState } from "react";

interface Content {
  id: string;
  chapter_id: string;
  title: string;
  overview?: string;
  cover?: string;
  content_type: string;
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

  const token = localStorage.getItem("token"); // optional auth token

  const fetchContents = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/chapters/${chapterId}/contents`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const data = await res.json();
      setContents(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [chapterId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId
        ? `http://localhost:3000/api/contents/${editingId}`
        : `http://localhost:3000/api/chapters/${chapterId}/contents`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to save content");

      setForm({});
      setEditingId(null);
      fetchContents();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (content: Content) => {
    setEditingId(content.id);
    setForm(content);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure to delete this content?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/contents/${id}`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!res.ok) throw new Error("Failed to delete content");
      fetchContents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Chapter Contents</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
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
        <input
          type="text"
          name="cover"
          placeholder="Cover URL"
          value={form.cover || ""}
          onChange={handleChange}
        />
        <select name="content_type" value={form.content_type || ""} onChange={handleChange} required>
          <option value="">Select Type</option>
          <option value="VIDEO">VIDEO</option>
          <option value="PDF">PDF</option>
          <option value="ARTICLE">ARTICLE</option>
        </select>
        <input
          type="number"
          name="sort_order"
          placeholder="Sort Order"
          value={form.sort_order || ""}
          onChange={handleChange}
        />
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
        <button type="submit" disabled={loading}>
          {editingId ? "Update Content" : "Add Content"}
        </button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({}); }}>Cancel</button>}
      </form>

      <table border={1} cellPadding={5}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Overview</th>
            <th>Sort</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contents.map((c) => (
            <tr key={c.id}>
              <td>{c.title}</td>
              <td>{c.content_type}</td>
              <td>{c.overview}</td>
              <td>{c.sort_order}</td>
              <td>
                <button onClick={() => handleEdit(c)}>Edit</button>
                <button onClick={() => handleDelete(c.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
