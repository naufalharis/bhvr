// src/components/ChapterContents.tsx
import React, { useEffect, useState } from "react";
import "../styles/chaptercontent.css";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { byPrefixAndName } from "../icons";

interface Content {
  id: string;
  chapter_id: string;
  title: string;
  overview?: string;
  cover?: string;
  content_type: "video" | "pdf" | "document";
  sort_order?: number;
  path?: string;
  original_file_name?: string;
  duration?: number;
  body?: string;
  file_size?: number;
  mime_type?: string;
  completed?: boolean;
}

interface Chapter {
  id: string;
  title: string;
  course_id?: string;
  sort_order?: number;
}

interface User {
  id: string;
  role: "student" | "instructor";
  email: string;
  name: string;
}

export default function ChapterContents() {
  const navigate = useNavigate();
  const { courseId, chapterId } = useParams();

  const [contents, setContents] = useState<Content[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isInstructor, setIsInstructor] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<Content>>({
    content_type: "video",
    chapter_id: chapterId || ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chapterFilter, setChapterFilter] = useState<string>(chapterId || "");
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Load user data
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsInstructor(parsedUser.role === "instructor");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Fetch chapters - accessible to both students and instructors
  const fetchChapters = async () => {
    console.log('chapter fetch');

    if (!courseId) {
      console.error("No courseId provided");
      return;
    }

    try {
      const res = await fetch(`/api/courses/${courseId}/chapters`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        },
      });

      if (res.ok) {
        const data = await res.json();
        const chaptersData = Array.isArray(data) ? data : data.chapters || data.data || [];
        
        // Sort chapters by sort_order
        const sortedChapters = chaptersData.sort((a: Chapter, b: Chapter) => 
          (a.sort_order || 0) - (b.sort_order || 0)
        );
        
        setChapters(sortedChapters);

        // Set chapter filter based on URL parameter
        if (sortedChapters.length > 0) {
          const defaultChapterId = chapterId || sortedChapters[0].id;
          setChapterFilter(defaultChapterId);
          setFormData(prev => ({ ...prev, chapter_id: defaultChapterId }));
        }
      } else {
        console.error("Failed to fetch chapters:", res.status);
      }
    } catch (err) {
      console.error("Fetch chapters error:", err);
    }
  };

  // Fetch user progress from backend
  const fetchUserProgress = async () => {
    if (!user?.id || user.role !== 'student') return;

    try {
      const res = await fetch(`/api/content/completion/${user.id}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        },
      });

      if (res.ok) {
        const data = await res.json();
        return data.data || [];
      } else {
        console.error("Failed to fetch user progress:", res.status);
        return [];
      }
    } catch (err) {
      console.error("Fetch user progress error:", err);
      return [];
    }
  };

  // Fetch contents - accessible to both students and instructors
  const fetchContents = async () => {
    console.log('[courseId, chapterId]');
    console.log([courseId, chapterId]);

    if (!chapterFilter) {
      console.log("No chapter filter set yet");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/chapters/${chapterFilter}/contents`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        },
      });

      if (res.ok) {
        const data = await res.json();
        const contentsData = Array.isArray(data) ? data : data.contents || data.data || [];

        // Jika user adalah student, ambil progress dari backend
        if (user?.role === 'student') {
          const userProgress = await fetchUserProgress();
          
          // Map completed status dari backend
          const contentsWithCompletion = contentsData.map((content: Content) => {
            const progress = userProgress.find((p: any) => p.content_id === content.id);
            return {
              ...content,
              completed: progress ? progress.completed : false
            };
          });

          setContents(contentsWithCompletion);
        } else {
          // Untuk instructor, tidak perlu completed status
          setContents(contentsData);
        }

        // Auto-select first content if available
        if (contentsData.length > 0) {
          const currentStillExists = selectedContent && contentsData.find((c: Content) => c.id === selectedContent?.id);

          if (currentStillExists && selectedContent) {
            // Update selected content dengan data terbaru termasuk completed status
            const updatedSelectedContent = contentsData.find((c: Content) => c.id === selectedContent.id);
            if (updatedSelectedContent && user?.role === 'student') {
              const userProgress = await fetchUserProgress();
              const progress = userProgress.find((p: any) => p.content_id === updatedSelectedContent.id);
              setSelectedContent({
                ...updatedSelectedContent,
                completed: progress ? progress.completed : false
              });
            } else {
              setSelectedContent(updatedSelectedContent);
            }
          } else {
            setSelectedContent(contentsData[0]);
          }
        } else {
          setSelectedContent(null);
        }
      } else {
        console.error("Failed to fetch contents:", res.status);
      }
    } catch (err) {
      console.error("Fetch contents error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    console.log("Course ID from URL:", courseId);
    console.log("Chapter ID from URL:", chapterId);

    if (courseId) {
      fetchChapters();
    }
  }, [courseId, chapterId]);

  // Fetch contents when chapter filter changes
  useEffect(() => {
    console.log("Chapter filter changed to:", chapterFilter);
    if (chapterFilter) {
      fetchContents();
      setFormData(prev => ({ ...prev, chapter_id: chapterFilter }));
    }
  }, [chapterFilter]);

  // Update chapterFilter when URL parameter changes
  useEffect(() => {
    if (chapterId) {
      setChapterFilter(chapterId);
      setFormData(prev => ({ ...prev, chapter_id: chapterId }));
    }
  }, [chapterId]);

  // Re-fetch contents when user changes
  useEffect(() => {
    if (user && chapterFilter) {
      fetchContents();
    }
  }, [user]);

  // Handle back to course - navigate to course detail page
  const handleBackClick = () => {
    if (courseId) {
      navigate(`/course/${courseId}`);
    } else {
      navigate(-1); // Fallback to previous page
    }
  };

  // Handle chapter change in dropdown - FIXED NAVIGATION
  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedChapterId = e.target.value;
    setChapterFilter(selectedChapterId);

    // Arahkan ke halaman content chapter yang dipilih
    if (courseId && selectedChapterId) {
      navigate(`/chapter/${courseId}/${selectedChapterId}/contents`);
    }
  };

  // Get next chapter
  const getNextChapter = (currentChapterId: string): Chapter | null => {
    const currentIndex = chapters.findIndex(chapter => chapter.id === currentChapterId);
    if (currentIndex === -1 || currentIndex === chapters.length - 1) {
      return null;
    }
    return chapters[currentIndex + 1];
  };

  // Check if all contents in current chapter are completed
  const isCurrentChapterCompleted = (): boolean => {
    if (user?.role !== 'student') return false;
    
    const currentChapterContents = contents.filter(c => c.chapter_id === chapterFilter);
    if (currentChapterContents.length === 0) return false;
    
    return currentChapterContents.every(content => content.completed);
  };

  // YouTube embed helper
  const getYoutubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const match = url.match(youtubeRegex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = (contentType: string, fileName?: string): JSX.Element => {
    if (contentType === 'video') return <i className="fa-brands fa-youtube"></i>;
    if (contentType === 'pdf') return <i className="fa-solid fa-file-pdf"></i>;
    if (fileName?.match(/\.(doc|docx)$/i)) return <i className="fa-solid fa-file-word"></i>;
    if (fileName?.match(/\.(xls|xlsx)$/i)) return <i className="fa-solid fa-file-excel"></i>;
    if (fileName?.match(/\.(ppt|pptx)$/i)) return <i className="fa-solid fa-file-powerpoint"></i>;
    if (fileName?.match(/\.(txt)$/i)) return <i className="fa-solid fa-file-lines"></i>;
    return <i className="fa-solid fa-file"></i>;
  };

  // Check if content is downloadable (PDF is downloadable, document is NOT downloadable)
  const isContentDownloadable = (content: Content): boolean => {
    return content.content_type === "pdf";
  };

  // Get next content (all types, not just videos)
  const getNextContent = (currentContent: Content): Content | null => {
    const allContents = contents
      .filter(c => c.chapter_id === chapterFilter)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    const currentIndex = allContents.findIndex(c => c.id === currentContent.id);

    if (currentIndex === -1 || currentIndex === allContents.length - 1) {
      return null; // No next content
    }

    return allContents[currentIndex + 1];
  };

  // Get previous content (all types, not just videos)
  const getPreviousContent = (currentContent: Content): Content | null => {
    const allContents = contents
      .filter(c => c.chapter_id === chapterFilter)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    const currentIndex = allContents.findIndex(c => c.id === currentContent.id);

    if (currentIndex <= 0) {
      return null; // No previous content
    }

    return allContents[currentIndex - 1];
  };

  // Handle next content dengan navigasi ke chapter berikutnya
  const handleNextContent = () => {
    if (!selectedContent) return;

    const nextContent = getNextContent(selectedContent);
    
    if (nextContent) {
      // Masih ada konten berikutnya di chapter yang sama
      setSelectedContent(nextContent);
    } else {
      // Tidak ada konten berikutnya di chapter ini, cek apakah ada chapter berikutnya
      const nextChapter = getNextChapter(chapterFilter);
      
      if (nextChapter && courseId) {
        // Navigate ke chapter berikutnya
        const confirmMessage = isCurrentChapterCompleted() 
          ? "You have completed this chapter! Move to next chapter?"
          : "Move to next chapter?";
        
        if (window.confirm(confirmMessage)) {
          navigate(`/chapter/${courseId}/${nextChapter.id}/contents`);
        }
      } else {
        // Tidak ada chapter berikutnya, tampilkan pesan
        alert("This is the last content in the course!");
      }
    }
  };

  // Handle previous content
  const handlePreviousContent = () => {
    if (!selectedContent) return;

    const previousContent = getPreviousContent(selectedContent);
    if (previousContent) {
      setSelectedContent(previousContent);
    } else {
      // Tidak ada konten sebelumnya, cek apakah ada chapter sebelumnya
      const currentIndex = chapters.findIndex(chapter => chapter.id === chapterFilter);
      if (currentIndex > 0 && courseId) {
        const prevChapter = chapters[currentIndex - 1];
        if (window.confirm("Move to previous chapter?")) {
          navigate(`/chapter/${courseId}/${prevChapter.id}/contents`);
        }
      } else {
        alert("This is the first content in the course!");
      }
    }
  };

  // Convert text to Word document blob
  const textToWordBlob = (text: string, fileName: string): Blob => {
    // Create HTML content for Word document
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word" 
            xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <title>${fileName}</title>
        </head>
        <body>
          <div>${text.replace(/\n/g, '</div><div>')}</div>
        </body>
      </html>
    `;

    return new Blob([htmlContent], {
      type: 'application/msword'
    });
  };

  // Trigger progress update untuk memberi tahu komponen lain
  const triggerProgressUpdate = () => {
    // Dispatch custom event untuk memberi tahu komponen lain bahwa progress diupdate
    window.dispatchEvent(new CustomEvent('progressUpdated'));
  };

  // ✅ Simpan progress ke backend saat checkbox diubah
  const handleCheckboxChange = async (contentId: string, completed: boolean) => {
    if (user?.role === "student") {
      // Update tampilan dulu (biar terasa cepat)
      setContents(prev =>
        prev.map(item =>
          item.id === contentId ? { ...item, completed } : item
        )
      );

      // Update selected content jika sedang dipilih
      if (selectedContent?.id === contentId) {
        setSelectedContent(prev => prev ? { ...prev, completed } : null);
      }

      try {
        const response = await fetch("/api/content/completion", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify({
            userId: user.id,
            contentId,
            completed,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Gagal menyimpan progres:", errorData.error || response.status);
          
          // Revert if failed
          setContents(prev =>
            prev.map(item =>
              item.id === contentId ? { ...item, completed: !completed } : item
            )
          );
          
          if (selectedContent?.id === contentId) {
            setSelectedContent(prev => prev ? { ...prev, completed: !completed } : null);
          }
          
          alert("Gagal menyimpan progress. Silakan coba lagi.");
        } else {
          console.log("Progress berhasil disimpan");
          triggerProgressUpdate(); // <-- MEMICU UPDATE PROGRESS DI KOMPONEN LAIN
          
          // Auto-navigate to next chapter if all contents are completed
          if (completed && isCurrentChapterCompleted()) {
            const nextChapter = getNextChapter(chapterFilter);
            if (nextChapter && courseId) {
              setTimeout(() => {
                if (window.confirm("Congratulations! You have completed this chapter. Move to next chapter?")) {
                  navigate(`/chapter/${courseId}/${nextChapter.id}/contents`);
                }
              }, 1000);
            }
          }
        }
      } catch (error) {
        console.error("Error menyimpan progres:", error);
        
        // Revert if error
        setContents(prev =>
          prev.map(item =>
            item.id === contentId ? { ...item, completed: !completed } : item
          )
        );
        
        if (selectedContent?.id === contentId) {
          setSelectedContent(prev => prev ? { ...prev, completed: !completed } : null);
        }
        
        alert("Terjadi kesalahan. Silakan coba lagi.");
      }
    }
  };

  // Submit Add / Update - INSTRUCTORS ONLY
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isInstructor) {
      alert("Unauthorized access");
      return;
    }

    if (!formData.title || !formData.content_type || !formData.chapter_id) {
      alert("Title, Content Type, dan Chapter wajib diisi");
      return;
    }

    try {
      setUploading(true);

      let filePath = formData.path;
      let fileBody = formData.body;
      let originalFileName = formData.original_file_name;
      let coverImage = formData.cover;

      // Handle cover image upload
      if (coverFile) {
        try {
          const reader = new FileReader();
          coverImage = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(coverFile as File);
          });
        } catch (coverError) {
          console.error("Cover image processing failed:", coverError);
          alert("Gagal memproses cover image. Silakan coba lagi.");
          return;
        }
      }

      // Handle document content - use overview as content body
      if (formData.content_type === "document" && formData.overview) {
        try {
          // Create Word document from overview content
          const wordBlob = textToWordBlob(formData.overview, formData.original_file_name || formData.title);

          // Convert blob to base64
          const reader = new FileReader();
          fileBody = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(wordBlob);
          });

          filePath = `${formData.original_file_name || formData.title}.doc`;
          originalFileName = formData.original_file_name || `${formData.title}.doc`;

        } catch (docError) {
          console.error("Document processing failed:", docError);
          alert("Gagal memproses dokumen. Silakan coba lagi.");
          return;
        }
      }

      // Handle PDF file upload
      if (file && formData.content_type === "pdf") {
        try {
          const reader = new FileReader();
          fileBody = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
          });
          filePath = file.name;
          originalFileName = file.name;
        } catch (uploadError) {
          console.error("File processing failed:", uploadError);
          alert("Gagal memproses file. Silakan coba lagi.");
          return;
        }
      }

      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/contents/${editingId}`
        : `/api/chapters/${formData.chapter_id}/contents`;

      const body = {
        title: formData.title,
        overview: formData.overview || "",
        cover: coverImage,
        content_type: formData.content_type,
        sort_order: formData.sort_order ?? 0,
        path: filePath,
        original_file_name: originalFileName,
        body: fileBody // Include the base64 file body
      };

      console.log("Submitting content:", body);

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save content: ${res.status}`);
      }

      const responseData = await res.json();

      alert(editingId ? "✅ Content updated!" : "✅ Content added!");

      // Close modal and reset form
      resetForm();

      // Refresh contents and select the new content
      await fetchContents();

      // Select the new content if it was added (not edited)
      if (!editingId && responseData.content) {
        setSelectedContent(responseData.content);
      }

    } catch (err) {
      console.error("Submit error:", err);
      alert("Gagal menyimpan konten: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  // Reset form - INSTRUCTORS ONLY
  const resetForm = () => {
    if (!isInstructor) return;

    setFormData({
      content_type: "video",
      chapter_id: chapterFilter,
      overview: ""
    });
    setEditingId(null);
    setFile(null);
    setCoverFile(null);
    setIsModalOpen(false);
  };

  // Edit content - INSTRUCTORS ONLY
  const handleEdit = (content: Content) => {
    if (!isInstructor) {
      alert("Unauthorized access");
      return;
    }

    setFormData({
      title: content.title,
      overview: content.overview,
      cover: content.cover,
      content_type: content.content_type,
      sort_order: content.sort_order,
      path: content.path,
      original_file_name: content.original_file_name,
      body: content.body,
      chapter_id: content.chapter_id,
    });
    setEditingId(content.id);
    setIsModalOpen(true);
  };

  // Delete content - INSTRUCTORS ONLY
  const handleDelete = async (id: string) => {
    if (!isInstructor) {
      alert("Unauthorized access");
      return;
    }

    if (!confirm("Yakin hapus konten ini?")) return;
    try {
      const res = await fetch(`/api/contents/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete content");

      alert("Content deleted!");

      // Update local state immediately
      const updatedContents = contents.filter(c => c.id !== id);
      setContents(updatedContents);

      if (selectedContent?.id === id) {
        // Select first content
        setSelectedContent(updatedContents[0] || null);
      }

    } catch (err) {
      console.error("Delete error:", err);
      alert("Gagal menghapus konten: " + (err as Error).message);
    }
  };

  // Open add modal - INSTRUCTORS ONLY
  const openAddModal = () => {
    if (!isInstructor) {
      alert("Unauthorized access");
      return;
    }
    resetForm();
    setIsModalOpen(true);
  };

  // Handle file input change - INSTRUCTORS ONLY (for PDF only)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isInstructor) return;

    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Auto-fill title and original file name if empty
      if (!formData.title) {
        const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
        setFormData(prev => ({
          ...prev,
          title: fileNameWithoutExt,
          original_file_name: selectedFile.name
        }));
      } else if (!formData.original_file_name) {
        setFormData(prev => ({
          ...prev,
          original_file_name: selectedFile.name
        }));
      }

      // Untuk PDF, set path otomatis
      if (formData.content_type === "pdf" && !formData.path) {
        setFormData(prev => ({
          ...prev,
          path: selectedFile.name
        }));
      }
    }
  };

  // Handle cover image change - INSTRUCTORS ONLY
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isInstructor) return;

    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      setCoverFile(selectedFile);

      // Preview cover image
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          cover: e.target?.result as string
        }));
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Handle original file name change - INSTRUCTORS ONLY
  const handleOriginalFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isInstructor) return;

    setFormData(prev => ({
      ...prev,
      original_file_name: e.target.value
    }));
  };

  // Handle base64 download for PDF and documents
  const handleDownload = async (content: Content) => {
    // Document tidak bisa didownload
    if (content.content_type === "document") {
      alert("Document content cannot be downloaded. Please read the content directly on this page.");
      return;
    }

    try {
      // If content has body (base64 data), download directly
      if (content.body && content.body.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = content.body;

        // Set appropriate file extension based on content type
        let fileName = content.original_file_name || content.title;
        if (content.content_type === 'pdf' && !fileName.endsWith('.pdf')) {
          fileName += '.pdf';
        }

        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      // If content has path but no body, try to fetch the file
      else if (content.path && !content.body) {
        // For external URLs, open in new tab
        if (content.path.startsWith('http')) {
          window.open(content.path, '_blank');
        } else {
          // For internal file paths, try to download
          const response = await fetch(content.path);
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            let fileName = content.original_file_name || content.title;
            if (content.content_type === 'pdf' && !fileName.endsWith('.pdf')) {
              fileName += '.pdf';
            }

            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          } else {
            throw new Error('Failed to download file');
          }
        }
      }
      // If no content available
      else {
        alert('No downloadable content available');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file: ' + (error as Error).message);
    }
  };

  // Handle content click in sidebar - now all content types are clickable
  const handleContentClick = (content: Content) => {
    setSelectedContent(content);
  };

  // Get filtered contents for the current chapter - accessible to all
  const filteredContents = contents
    .filter(c => c.chapter_id === chapterFilter)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  // Get all contents for navigation
  const allContents = filteredContents;
  const hasPreviousContent = selectedContent && getPreviousContent(selectedContent) !== null;
  const hasNextContent = selectedContent && getNextContent(selectedContent) !== null;

  // Get content counter text
  const getContentCounter = () => {
    if (!selectedContent) return "";
    const currentIndex = allContents.findIndex(c => c.id === selectedContent.id);
    return `Content ${currentIndex + 1} of ${allContents.length}`;
  };

  // Render cover image or placeholder - UPDATED FOR DOCUMENT TYPE
  const renderCoverImage = (content: Content) => {
    if (content.cover) {
      return (
        <div className="content-cover">
          <img
            src={content.cover}
            alt={content.title}
            className="cover-image"
          />
        </div>
      );
    }

    // Default cover based on content type
    return (
      <div className="content-cover placeholder">
        <div className={`cover-placeholder ${content.content_type}`}>
          {getFileIcon(content.content_type, content.original_file_name)}
          <span className="cover-type-text">{content.content_type.toUpperCase()}</span>
        </div>
      </div>
    );
  };

  if (loading && contents.length === 0) {
    return (
      <div className="chaptercontent-page">
        <div className="loading">Loading content...</div>
      </div>
    );
  }

  return (
    <div className="chaptercontent-page">
      <div className="video-section">
        <button className="back-button" onClick={handleBackClick}>
          <FontAwesomeIcon icon={byPrefixAndName.fas.faLeftLong} />
        </button>

        {selectedContent ? (
          <div className="video-wrapper">
            {selectedContent.content_type === "video" ? (
              <>
                <div className="video-player-container">
                  {(() => {
                    const embedUrl = getYoutubeEmbedUrl(selectedContent.path || "");
                    return embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={selectedContent.title}
                        allowFullScreen
                        className="video-player"
                      ></iframe>
                    ) : selectedContent.path ? (
                      <video
                        src={selectedContent.path}
                        controls
                        className="video-player"
                      />
                    ) : (
                      <div className="no-video-content">
                        <h3>Video Content</h3>
                        <p>No video URL provided for this content.</p>
                      </div>
                    );
                  })()}
                </div>

                {/* Completion Checkbox for Students - POSISI DIPERBAIKI */}
                {user?.role === 'student' && (
                  <div className="completion-section-main">
                    <label className="completion-checkbox-main">
                      <input
                        type="checkbox"
                        checked={selectedContent.completed || false}
                        onChange={(e) => handleCheckboxChange(selectedContent.id, e.target.checked)}
                        className="completion-checkbox"
                      />
                      Mark as completed
                    </label>
                    {selectedContent.completed && (
                      <span className="completion-status-badge">Completed</span>
                    )}
                  </div>
                )}

                {/* Content Navigation Controls */}
                <div className="video-navigation">
                  <button
                    className="nav-btn prev-btn"
                    onClick={handlePreviousContent}
                    disabled={!hasPreviousContent}
                    title="Previous Content"
                  >
                    <i className="fa-solid fa-chevron-left"></i> Previous
                  </button>

                  <div className="video-info">
                    <h3 className="video-title">{selectedContent.title}</h3>
                    {selectedContent.overview && (
                      <div className="video-description-scrollable">
                        {selectedContent.overview}
                      </div>
                    )}
                    <div className="video-counter">
                      {getContentCounter()}
                    </div>
                  </div>

                  <button
                    className="nav-btn next-btn"
                    onClick={handleNextContent}
                    disabled={!hasNextContent && !getNextChapter(chapterFilter)}
                    title={!hasNextContent && getNextChapter(chapterFilter) ? "Next Chapter" : "Next Content"}
                  >
                    {!hasNextContent && getNextChapter(chapterFilter) ? "Next Chapter" : "Next"} 
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </>
            ) : (
              // PDF and Document Content
              <div className="file-content-wrapper">
                {/* Completion Checkbox for Students - POSISI DIPERBAIKI */}
                {user?.role === 'student' && (
                  <div className="completion-section-main">
                    <label className="completion-checkbox-main">
                      <input
                        type="checkbox"
                        checked={selectedContent.completed || false}
                        onChange={(e) => handleCheckboxChange(selectedContent.id, e.target.checked)}
                        className="completion-checkbox"
                      />
                      Mark as completed
                    </label>
                    {selectedContent.completed && (
                      <span className="completion-status-badge">Completed</span>
                    )}
                  </div>
                )}

                {/* Cover Image Section */}
                <div className="content-cover-section">
                  {renderCoverImage(selectedContent)}
                </div>

                <div className="file-header">
                  <h2>{selectedContent.title}</h2>
                  <div className="file-info">
                    <span className="file-type">
                      {getFileIcon(selectedContent.content_type, selectedContent.original_file_name)}
                      {selectedContent.content_type === "pdf" ? "PDF Document" : "Document"}
                    </span>
                    {selectedContent.original_file_name && (
                      <span className="file-name">
                        File: {selectedContent.original_file_name}
                      </span>
                    )}
                    {selectedContent.file_size && (
                      <span className="file-size">
                        Size: {formatFileSize(selectedContent.file_size)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="file-preview-section">
                  {selectedContent.content_type === "pdf" ? (
                    // PDF Preview
                    selectedContent.path || selectedContent.body ? (
                      <div className="file-download-section">
                        <button
                          className="download-btn primary"
                          onClick={() => handleDownload(selectedContent)}
                          title={`Download ${selectedContent.original_file_name || selectedContent.title}`}
                        >
                          <FontAwesomeIcon icon={byPrefixAndName.fas.faDownload} />
                          Download PDF
                        </button>
                      </div>
                    ) : (
                      <div className="no-content">
                        <p>No PDF content available.</p>
                      </div>
                    )
                  ) : (
                    // Document Preview - MENGGUNAKAN OVERVIEW SEBAGAI KONTEN
                    selectedContent.overview ? (
                      <div className="file-download-section">
                        <div className="document-preview">
                          <div className="preview-container">
                            <div className="document-content-preview">
                              <h4>{selectedContent.original_file_name}</h4>
                              <div className="document-text-content-scrollable">
                                {selectedContent.overview}
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Hapus download button untuk document */}
                      </div>
                    ) : (
                      <div className="no-content">
                        <p>No content available for this document.</p>
                      </div>
                    )
                  )}
                </div>

                {/* Content Navigation Controls for PDF/Document */}
                <div className="video-navigation">
                  <button
                    className="nav-btn prev-btn"
                    onClick={handlePreviousContent}
                    disabled={!hasPreviousContent}
                    title="Previous Content"
                  >
                    <i className="fa-solid fa-chevron-left"></i> Previous
                  </button>

                  <div className="video-info">
                    <div className="video-counter">
                      {getContentCounter()}
                    </div>
                  </div>

                  <button
                    className="nav-btn next-btn"
                    onClick={handleNextContent}
                    disabled={!hasNextContent && !getNextChapter(chapterFilter)}
                    title={!hasNextContent && getNextChapter(chapterFilter) ? "Next Chapter" : "Next Content"}
                  >
                    {!hasNextContent && getNextChapter(chapterFilter) ? "Next Chapter" : "Next"} 
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : filteredContents.length === 0 ? (
          <div className="no-video">
            <p>No content available for this chapter</p>
            {isInstructor && (
              <button className="add-content-btn" onClick={openAddModal}>
                + Add First Content
              </button>
            )}
          </div>
        ) : (
          <div className="no-video">
            <p>Please select content from the sidebar to view</p>
          </div>
        )}
      </div>

      <div className="chapter-sidebar">
        <div className="sidebar-top">
          <h3 className="sidebar-title">Course Content</h3>
          {isInstructor && (
            <button className="add-content-btn" onClick={openAddModal}>
              + Add Content
            </button>
          )}
        </div>

        {/* Chapter Dropdown - Visible to all users */}
        <div className="chapter-dropdown-section">
          <label htmlFor="chapter-select">Select Chapter:</label>
          <select
            id="chapter-select"
            value={chapterFilter}
            onChange={handleChapterChange}
            className="chapter-select"
          >
            <option value="">-- Select a Chapter --</option>
            {chapters.map(chapter => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.title}
              </option>
            ))}
          </select>
        </div>

        {/* Chapter Progress Indicator for Students */}
        {user?.role === 'student' && (
          <div className="chapter-progress-indicator">
            <div className="progress-text">
              Chapter Progress: 
              {filteredContents.filter(c => c.completed).length} / {filteredContents.length} completed
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${(filteredContents.filter(c => c.completed).length / filteredContents.length) * 100}%` 
                }}
              ></div>
            </div>
            {isCurrentChapterCompleted() && (
              <div className="chapter-completed-badge">
                🎉 Chapter Completed!
              </div>
            )}
          </div>
        )}

        {/* Chapter contents list - accessible to all */}
        <div className="chapter-contents-list">
          {filteredContents.map((c) => {
            const isActive = selectedContent?.id === c.id;

            return (
              <div
                key={c.id}
                className={`lesson-item ${isActive ? "active" : ""} ${c.completed ? "completed" : ""}`}
                onClick={() => handleContentClick(c)}
              >
                {/* Checkbox for marking completion (students only) - POSISI DIPERBAIKI */}
                {user?.role === 'student' && (
                  <div className="content-checkbox-sidebar">
                    <input
                      type="checkbox"
                      checked={c.completed || false}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleCheckboxChange(c.id, e.target.checked);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="completion-checkbox"
                    />
                  </div>
                )}

                {/* Cover thumbnail in sidebar */}
                <div className="content-thumbnail">
                  {c.cover ? (
                    <img
                      src={c.cover}
                      alt={c.title}
                      className="thumbnail-image"
                    />
                  ) : (
                    <div className={`thumbnail-placeholder ${c.content_type}`}>
                      {getFileIcon(c.content_type, c.original_file_name)}
                    </div>
                  )}
                </div>

                <div className="content-info">
                  <p className="lesson-title">{c.title}</p>
                  <div className="content-meta">
                    <small className="content-type-badge">{c.content_type}</small>
                    {c.duration && c.content_type === "video" && (
                      <small className="content-duration">{c.duration}m</small>
                    )}
                    {c.completed && user?.role === 'student' && (
                      <small className="completed-badge">Completed</small>
                    )}
                  </div>
                </div>

                {/* Download button for PDF only (document tidak bisa didownload) */}
                {user?.role === "student" && isContentDownloadable(c) && (
                  <button
                    className="download-sidebar-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(c);
                    }}
                    title={`Download ${c.original_file_name || c.title}`}
                  >
                    <FontAwesomeIcon icon={byPrefixAndName.fas.faDownload} />
                  </button>
                )}

                {/* Show action buttons only for instructors */}
                {isInstructor && (
                  <div className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(c);
                      }}
                      title="Edit content"
                    >
                      <FontAwesomeIcon icon={byPrefixAndName.fas.faPenToSquare} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(c.id);
                      }}
                      title="Delete content"
                    >
                      <FontAwesomeIcon icon={byPrefixAndName.fas.faTrash} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {filteredContents.length === 0 && (
            <div className="no-contents">
              <p>No content in this chapter</p>
              {isInstructor && (
                <button className="add-content-btn small" onClick={openAddModal}>
                  + Add Content
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for add/edit content - INSTRUCTORS ONLY */}
      {isModalOpen && isInstructor && (
        <div className="modal-overlay" onClick={() => !uploading && setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? "Edit Content" : "Add Content"}</h3>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  disabled={uploading}
                />
              </div>

              <div className="form-group">
                <label>Overview *</label>
                <textarea
                  value={formData.overview || ""}
                  onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                  rows={8}
                  required
                  disabled={uploading}
                  placeholder="Enter your document content here..."
                />
                <small className="field-hint">
                  For document content, this field will be used as the main content. Students will see this text directly on the page.
                </small>
              </div>

              {/* Cover Image Upload */}
              <div className="form-group">
                <label>Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  disabled={uploading}
                />
                {coverFile && (
                  <div className="file-info">
                    <strong>Selected Cover:</strong> {coverFile.name}
                    {formData.cover && (
                      <div className="cover-preview">
                        <img src={formData.cover} alt="Cover preview" className="cover-preview-image" />
                      </div>
                    )}
                  </div>
                )}
                {editingId && formData.cover && !coverFile && (
                  <div className="file-info">
                    <strong>Current Cover:</strong>
                    <div className="cover-preview">
                      <img src={formData.cover} alt="Current cover" className="cover-preview-image" />
                    </div>
                  </div>
                )}
                <small className="field-hint">
                  Optional: Upload a cover image for PDF and Document content
                </small>
              </div>

              <div className="form-group">
                <label>Content Type *</label>
                <select
                  value={formData.content_type}
                  onChange={(e) => setFormData({ ...formData, content_type: e.target.value as any })}
                  required
                  disabled={uploading}
                >
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="document">Document</option>
                </select>
              </div>

              {/* Original File Name Field - for all content types */}
              <div className="form-group">
                <label>Original File Name *</label>
                <input
                  type="text"
                  value={formData.original_file_name || ""}
                  onChange={handleOriginalFileNameChange}
                  disabled={uploading}
                  placeholder="Enter the original file name"
                  required
                />
                <small className="field-hint">
                  This name will be displayed to students
                </small>
              </div>

              {formData.content_type === "video" && (
                <div className="form-group">
                  <label>Video URL *</label>
                  <input
                    type="text"
                    value={formData.path || ""}
                    onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                    required
                    disabled={uploading}
                    placeholder="https://youtube.com/watch?v=... or direct video URL"
                  />
                  <small className="field-hint">
                    Please use YouTube URLs or direct video links
                  </small>
                </div>
              )}

              {formData.content_type === "pdf" && (
                <div className="form-group">
                  <label>PDF File *</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    required={!editingId}
                    disabled={uploading}
                  />
                  {file && (
                    <div className="file-info">
                      <strong>Selected File:</strong> {file.name} ({formatFileSize(file.size)})
                    </div>
                  )}
                  {editingId && !file && (
                    <div className="file-info">
                      <strong>Current File:</strong> {formData.original_file_name}
                      <br />
                      <small>Select a new file to replace the current one</small>
                    </div>
                  )}
                  <small className="field-hint">
                    Upload PDF file (max 10MB). File will be stored in database.
                  </small>
                </div>
              )}

              <div className="form-group">
                <label>Sort Order</label>
                <input
                  type="number"
                  value={formData.sort_order ?? 0}
                  onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) || 0 })}
                  min="0"
                  disabled={uploading}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={uploading}
                >
                  {uploading ? "Processing..." : (editingId ? "Update Content" : "Add Content")}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={resetForm}
                  disabled={uploading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}