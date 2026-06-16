import {useState} from "react";
import {Link} from "react-router-dom";
import api from "../api/axios";


function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        setMessage("");

        console.log("Email being sent:", email); // 👈 add this
    console.log("Type of email:", typeof email); // 👈 add this

        try {
            const {data} = await api.post("/user/forgot-password", {email});
            setMessage(data.message || "Reset link sent to your email");
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="auth-container">
            <h2>Forgot Password</h2>

            {error && <p className="error">{error}</p>}
            {message && <p className="success">{message}</p>}

            <form onSubmit={handleSubmit}> 
                <input type="email" name="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending...." : "Send Reset Link"}</button>
            </form>

            <p>
                <Link to="/login">Back to Login</Link>
            </p>
        </div>
    )
}

export default ForgotPassword;