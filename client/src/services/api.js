import axios from "axios";

export const uploadResume = async (formData) => {
    const res = await axios.post(
        "http://127.0.0.1:5001/api/resume/upload",
        formData,
        {
            headers: { "Content-Type": "multipart/form-data" },
        }
    );
    return res.data;
};
