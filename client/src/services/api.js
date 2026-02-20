const API = import.meta.env.VITE_API_URL;

export const uploadResume = async (formData) => {
  try {
    const res = await fetch(`${API}/api/resume/upload`, {
      method: "POST",
      body: formData,
    });

    let data;
    try {
      data = await res.json();
    } catch (e) {
      throw new Error("Invalid response from server");
    }

    console.log("Backend Response:", data);

    if (!res.ok) {
      throw new Error(data.error || "Upload failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};