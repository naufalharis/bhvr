// src/components/EnrolledCoursePage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/enrolled.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { byPrefixAndName } from "../icons";

interface AppProps {
  onLogout: () => void;
}

interface EnrolledCourse {
  id: string;
  user_id: string;
  course_id: string | null;
  order_id: string | null;
  bundle_id: string | null;
  enrolled_date: string;
  course?: {
    id: string;
    title: string;
    course_type: string;
    overview: string;
    cover: string;
    slug: string;
  };
}

interface Chapter {
  id: string;
  course_id: string;
  title: string;
  chapter_number: number;
  description: string;
  is_preview: boolean;
  created_at: string;
  updated_at: string;
}

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

interface User {
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  username: string;
  role: string;
}

interface CourseProgress {
  percentage: number;
  completed: number;
  total: number;
}

// Fungsi untuk menghitung progress course berdasarkan content yang dicentang
const calculateCourseProgress = (
  courseId: string | undefined, 
  chapters: {[courseId: string]: Chapter[]}, 
  contents: {[chapterId: string]: Content[]}
): CourseProgress => {
  if (!courseId) {
    return { percentage: 0, completed: 0, total: 0 };
  }

  // Ambil semua chapters untuk course ini
  const courseChapters = chapters[courseId] || [];
  
  // Kumpulkan semua content dari semua chapters
  let totalContents = 0;
  let completedContents = 0;

  courseChapters.forEach(chapter => {
    const chapterContents = contents[chapter.id] || [];
    totalContents += chapterContents.length;
    
    // Hitung yang sudah completed (dicentang)
    completedContents += chapterContents.filter(content => content.completed).length;
  });

  // Hitung persentase
  const percentage = totalContents > 0 ? Math.round((completedContents / totalContents) * 100) : 0;

  return {
    percentage,
    completed: completedContents,
    total: totalContents
  };
};

export default function EnrolledCoursePage({ onLogout }: AppProps) {
  const [user, setUser] = useState<User | null>(null);
  const [enrolled, setEnrolled] = useState<EnrolledCourse[]>([]);
  const [chapters, setChapters] = useState<{ [courseId: string]: Chapter[] }>({});
  const [contents, setContents] = useState<{ [chapterId: string]: Content[] }>({});
  const [courseProgress, setCourseProgress] = useState<{ [courseId: string]: CourseProgress }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Effect untuk menghitung ulang progress ketika contents berubah
  useEffect(() => {
    if (enrolled.length > 0 && Object.keys(contents).length > 0) {
      const newProgress: { [courseId: string]: CourseProgress } = {};
      
      enrolled.forEach(item => {
        if (item.course?.id) {
          newProgress[item.course.id] = calculateCourseProgress(item.course.id, chapters, contents);
        }
      });
      
      setCourseProgress(newProgress);
    }
  }, [contents, enrolled, chapters]);

  /** Fetch data enrolled dari backend */
  const fetchEnrolled = async () => {
    try {
      const res = await fetch("/api/enrolled", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal memuat enrolled courses");
      }

      const data = await res.json();
      setEnrolled(data.enrolled || []);
      
      // Fetch chapters dan contents untuk setiap course yang di-enrolled
      if (data.enrolled && data.enrolled.length > 0) {
        await fetchChaptersForCourses(data.enrolled);
      }
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  /** Fetch chapters untuk semua course yang di-enrolled */
  const fetchChaptersForCourses = async (enrolledCourses: EnrolledCourse[]) => {
    try {
      const chaptersData: { [courseId: string]: Chapter[] } = {};
      const contentsData: { [chapterId: string]: Content[] } = {};
      
      // Fetch chapters untuk setiap course
      for (const enrolledCourse of enrolledCourses) {
        if (enrolledCourse.course?.id) {
          try {
            const res = await fetch(`/api/courses/${enrolledCourse.course.id}/chapters`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
              const chapters = await res.json();
              chaptersData[enrolledCourse.course.id] = chapters;
              
              // Fetch contents untuk setiap chapter
              for (const chapter of chapters) {
                await fetchContentsForChapter(chapter.id, contentsData);
              }
            } else {
              console.warn(`Failed to fetch chapters for course ${enrolledCourse.course.id}`);
              chaptersData[enrolledCourse.course.id] = [];
            }
          } catch (err) {
            console.error(`Error fetching chapters for course ${enrolledCourse.course.id}:`, err);
            chaptersData[enrolledCourse.course.id] = [];
          }
        }
      }
      
      setChapters(chaptersData);
      setContents(contentsData);
    } catch (err) {
      console.error("Error fetching chapters:", err);
    }
  };

  /** Fetch contents untuk sebuah chapter */
  const fetchContentsForChapter = async (chapterId: string, contentsData: { [chapterId: string]: Content[] }) => {
    try {
      const res = await fetch(`/api/chapters/${chapterId}/contents`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const contents = await res.json();
        const contentsWithCompletion = await addCompletionStatus(contents);
        contentsData[chapterId] = contentsWithCompletion;
      } else {
        console.warn(`Failed to fetch contents for chapter ${chapterId}`);
        contentsData[chapterId] = [];
      }
    } catch (err) {
      console.error(`Error fetching contents for chapter ${chapterId}:`, err);
      contentsData[chapterId] = [];
    }
  };

  /** Tambahkan status completion ke contents */
  const addCompletionStatus = async (contents: Content[]): Promise<Content[]> => {
    if (!user?.id || user.role !== 'student') return contents;

    try {
      // Fetch user progress dari backend
      const res = await fetch(`/api/content/completion/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const progressData = await res.json();
        const userProgress = progressData.data || [];

        // Map completed status ke contents
        return contents.map(content => {
          const progress = userProgress.find((p: any) => p.content_id === content.id);
          return {
            ...content,
            completed: progress ? progress.completed : false
          };
        });
      }
    } catch (err) {
      console.error("Error fetching user progress:", err);
    }

    return contents;
  };

  /** Refresh progress data - dipanggil ketika content dicentang/dicentang ulang */
  const refreshProgressData = async () => {
    if (enrolled.length === 0) return;

    try {
      const contentsData: { [chapterId: string]: Content[] } = {};
      
      // Refresh contents untuk semua chapters
      for (const enrolledCourse of enrolled) {
        if (enrolledCourse.course?.id) {
          const courseChapters = chapters[enrolledCourse.course.id] || [];
          for (const chapter of courseChapters) {
            await fetchContentsForChapter(chapter.id, contentsData);
          }
        }
      }
      
      setContents(contentsData);
    } catch (err) {
      console.error("Error refreshing progress data:", err);
    }
  };

  /** Setup event listener untuk progress updates dari ChapterContents */
  useEffect(() => {
    const handleProgressUpdate = (event: CustomEvent) => {
      console.log('Progress update event received:', event.detail);
      refreshProgressData();
    };

    // Listen untuk custom event ketika progress diupdate di ChapterContents
    window.addEventListener('progressUpdated', handleProgressUpdate as EventListener);

    return () => {
      window.removeEventListener('progressUpdated', handleProgressUpdate as EventListener);
    };
  }, [enrolled, chapters, user]);

  /** Setup interval untuk sync progress (fallback) */
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.role === 'student') {
        refreshProgressData();
      }
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  /** Ambil user dari localStorage */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse stored user:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchEnrolled();
    }
  }, [user]);

  /** Navigasi ke halaman chaptercontents dengan chapter pertama */
  const handleViewCourse = (courseId: string, courseSlug: string) => {
    const courseChapters = chapters[courseId];
    
    if (courseChapters && courseChapters.length > 0) {
      // Ambil chapter pertama sebagai default
      const firstChapter = courseChapters[0];
      navigate(`/chapter/${courseId}/${firstChapter.id}/contents`);
    } else {
      // Fallback jika tidak ada chapters
      navigate(`/course/${courseSlug}`);
    }
  };

  /** Pisahkan berdasarkan course_type */
  const singleCourses = enrolled.filter(
    (item) => item.course?.course_type === "single"
  );
  const bundleCourses = enrolled.filter(
    (item) => item.course?.course_type === "bundle"
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* Main Section */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        <main className="enrolled-container">
          
          {loading ? (
            <div className="status-text">
              <div className="loading-spinner"></div>
              Loading enrolled courses...
            </div>
          ) : error ? (
            <p className="error-text">❌ {error}</p>
          ) : enrolled.length === 0 ? (
            <div className="status-text">
              <p>🎯 You haven't enrolled in any courses yet.</p>
              <p style={{ fontSize: "1rem", marginTop: "0.5rem", opacity: "0.8" }}>
                Explore our catalog to find interesting courses!
              </p>
            </div>
          ) : (
            <>
              {/* Bagian Single Courses */}
              {singleCourses.length > 0 && (
                <section className="section-block">
                  <h3 className="section-title">
                    <FontAwesomeIcon icon={byPrefixAndName.fas.faCube}/> Single Courses
                  </h3>
                  <div className="enrolled-grid">
                    {singleCourses.map((item) => {
                      const progress = courseProgress[item.course?.id || ''] || { percentage: 0, completed: 0, total: 0 };
                      const progressPercentage = progress.percentage;
                      const completedContents = progress.completed;
                      const totalContents = progress.total;

                      return (
                        <div
                          key={item.id}
                          className="enrolled-card"
                          onClick={() =>
                            item.course?.id && item.course?.slug && 
                            handleViewCourse(item.course.id, item.course.slug)
                          }
                        >
                          <img
                            src={item.course?.cover || "/placeholder.jpg"}
                            alt={item.course?.title}
                            className="enrolled-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.jpg";
                            }}
                          />
                          <div className="enrolled-content">
                            <h3>{item.course?.title || "Untitled Course"}</h3>
                            <p 
                              className="course-type"
                              data-course-type={item.course?.course_type}
                            >
                              {item.course?.course_type}
                            </p>
                            <p className="overview">
                              {item.course?.overview?.slice(0, 100) ||
                                "No description available..."}
                              ...
                            </p>
                            <p className="enrolled-date">
                              <FontAwesomeIcon icon={byPrefixAndName.fas.faCalendarDays}/> Enrolled on:{" "}
                              {new Date(item.enrolled_date).toLocaleDateString()}
                            </p>
                            {chapters[item.course?.id || ''] && (
                              <p className="chapters-count">
                                <FontAwesomeIcon icon={byPrefixAndName.fas.faList}/> {chapters[item.course?.id || ''].length} chapters available
                              </p>
                            )}
                          </div>
                          {/* Progress Bar Section */}
                          <div className="course-progress-section">
                            <div className="progress-info">
                              <span className="progress-text">
                                {progressPercentage}% Complete
                              </span>
                              <span className="progress-count">
                                {completedContents}/{totalContents} contents
                              </span>
                            </div>
                            <div className="progress-bar-container">
                              <div 
                                className="progress-bar-fill"
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Bagian Bundle Courses */}
              {bundleCourses.length > 0 && (
                <section className="section-block">
                  <h3 className="section-title">
                    <FontAwesomeIcon icon={byPrefixAndName.fas.faCubes}/> Bundle Courses
                  </h3>
                  <div className="enrolled-grid">
                    {bundleCourses.map((item) => {
                      const progress = courseProgress[item.course?.id || ''] || { percentage: 0, completed: 0, total: 0 };
                      const progressPercentage = progress.percentage;
                      const completedContents = progress.completed;
                      const totalContents = progress.total;

                      return (
                        <div
                          key={item.id}
                          className="enrolled-card"
                          onClick={() =>
                            item.course?.id && item.course?.slug && 
                            handleViewCourse(item.course.id, item.course.slug)
                          }
                        >
                          <img
                            src={item.course?.cover || "/placeholder.jpg"}
                            alt={item.course?.title}
                            className="enrolled-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.jpg";
                            }}
                          />
                          
                          {/* Progress Bar Section */}
                          <div className="course-progress-section">
                            <div className="progress-info">
                              <span className="progress-text">
                                {progressPercentage}% Complete
                              </span>
                              <span className="progress-count">
                                {completedContents}/{totalContents} contents
                              </span>
                            </div>
                            <div className="progress-bar-container">
                              <div 
                                className="progress-bar-fill"
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="enrolled-content">
                            <h3>{item.course?.title || "Untitled Bundle"}</h3>
                            <p 
                              className="course-type"
                              data-course-type={item.course?.course_type}
                            >
                              {item.course?.course_type}
                            </p>
                            <p className="overview">
                              {item.course?.overview?.slice(0, 100) ||
                                "No description available..."}
                              ...
                            </p>
                            <p className="enrolled-date">
                              <FontAwesomeIcon icon={byPrefixAndName.fas.faCalendarDays}/> Enrolled on:{" "}
                              {new Date(item.enrolled_date).toLocaleDateString()}
                            </p>
                            {chapters[item.course?.id || ''] && (
                              <p className="chapters-count">
                                <FontAwesomeIcon icon={byPrefixAndName.fas.faList}/> {chapters[item.course?.id || ''].length} chapters available
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}