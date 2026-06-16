import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {useState} from "react";

function Profile() {
  const { user, setUser, isLoading } = useAuth();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!user) {
    return <h1>please login again</h1>;
  }

  // step 1 handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if(!file) return;
    setSelectedFile(file);

    // create preview before uploading
    const render = new FileReader();
    render.onload = () => {
      setPreviewUrl(render.result);
      // shows preview immediately
      // before actually uploading
    }
    render.readAsDataURL(file);
    // convert file to base64 string
    // for preview purpose only
  }

  // step 2 handle upload
  const handleUpload = async () => {
    if(!selectedFile){
      setError("Please select an image first")
      return;
    }

    setError("")
    setIsUploading(true);

    try {
      // step 3 create formdata
      const formData = new FormData();
      formData.append("photo" ,selectedFile);

      // step 4 send with different content-type
      const {data} = await api.patch("/user/update-photo" , formData, {
        headers : {
          "Content-Type" : "multipart/form-data"
        }
      });

      // step 5 update user in context
      setUser(prev =>({...prev , photo : data.data.photo}));

      setSelectedFile(null)
      setPreviewUrl(null);

    }catch(err){
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }

  }

  return (
    <div className="profile-container">
      <h1>Profile</h1>
      <img
        src={previewUrl || user?.photo}
        alt="profile"
        width="100"
        style={{ borderRadius: "50%" }}
        className="profile-photo"
      />
      {error && <p className="error">{error}</p>}
      <div className="upload-section">
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {selectedFile && (
          <button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload Photo"}
          </button>
        )}
      </div>

      <div className="profile-info">
        <p>
          <strong>Username:</strong> {user?.username}
        </p>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Role:</strong> {user?.role}
        </p>
      </div>
    </div>
  );
}

export default Profile;
