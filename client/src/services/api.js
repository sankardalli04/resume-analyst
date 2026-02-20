const API = import.meta.env.VITE_API_URL;

export const uploadResume = async (formData) => {
  const res = await fetch(`${API}/api/resume/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  console.log("Backend Response:", data);  // 🔴 ADD THIS

  return data;
};