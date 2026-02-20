const API = import.meta.env.VITE_API_URL;

export const uploadResume = async (formData) => {
  try {
    const res = await fetch(`${API}/api/resume/upload`, {
      method: "POST",
      body: formData,
    });

    // Safely read JSON (even if backend is slow)
    const data = await res.json();

    // Log once for debugging (can remove later)
    console.log("Backend Response:", data);

    // Do NOT throw early; just return response
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error; // only real network failures will reach catch
  }
};