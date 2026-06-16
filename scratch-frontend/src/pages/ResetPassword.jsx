import {useState} from "react";
import {useNavigate , useParams , Link} from "react-router-dom";
import api from "../api/axios";

function ResetPassword() { 
    // step 1 - get token from url
    const {token} = useParams();

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => { 
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        setMessage("");

        try {
            const  {data} = await api.post(`user/reset-password/${token}`, formData);

            setMessage("Password reset successful! Redirecting to login...");

            //redirect to login after 2 seconds
            setTimeout(() => {
                navigate("/login");
            } , 2000);
        } catch (err) { 
            if(err.response?.data?.errors) { 
                const messages  = err.response.data.errors.map(e => e.message).join(", ");
                setError(messages);
            } else {
                setError(err.response?.data?.message ||"Reset failed");
            }
        } finally {
            setIsSubmitting(false);
        }

    }

    return(
        <div className="auth-container">
            <h2>Reset Password</h2>

            {error && <p className="error">{error}</p>}
            {message && <p className="success">{message}</p>}

            <form onSubmit = {handleSubmit}>
                <input type="password" name="password" placeholder="New Password" value={formData.password} onChange={handleChange} required />
                <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Resetting..." : "Reset Password"}
                </button>
            </form>

            <p>
                <Link to="/login">Back to Login</Link>
            </p>
        </div>
    )
}
export default ResetPassword;