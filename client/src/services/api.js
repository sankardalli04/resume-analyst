const API = import.meta.env.VITE_API_URL;


export const uploadResume = async (formData) => {
  try {
    const res = await fetch(`${API}/api/resume/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Upload failed");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};