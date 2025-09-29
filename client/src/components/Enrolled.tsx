import { useEffect, useState } from "react";

function Enrolled() {
  const [enrolled, setEnrolled] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/api/enrolled", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setEnrolled(data.enrolled || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Enrolled Courses</h2>
      {enrolled.length === 0 ? (
        <p>No courses enrolled yet.</p>
      ) : (
        <ul>
          {enrolled.map((e) => (
            <li key={e.id} className="mb-2">
              <strong>{e.course?.title}</strong> <br />
              Enrolled at: {new Date(e.enrolled_date).toLocaleDateString()} <br />
              Order Ref: {e.orderRef?.reference_number || "-"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Enrolled;
