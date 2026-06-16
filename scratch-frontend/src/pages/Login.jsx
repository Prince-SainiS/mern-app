import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const isValid = formData.password.length >= 8;

    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            await login(formData.email, formData.password);
            navigate("/profile");

        } catch(err) {
            if(err.response?.data?.errors){
                const messages = err.response.data.errors
                    .map(e => e.message)
                    .join(", ");
                setError(messages);
            } else {
                setError(err.response?.data?.message || "Login failed");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>Login</h2>

            {error && <p className="error">{error}</p>}

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                {formData.password.length > 0 && formData.password.length < 8 && (
                    <p className="error">Password must be at least 8 characters long.</p>
                )}

                <button type="submit" disabled={isSubmitting || !isValid}>
                    {isSubmitting ? "Logging in..." : "Login"}
                </button>
            </form>

            <p>
                Don't have an account? <Link to="/register">Register</Link>
            </p>
            <p>
                <Link to="/forgot-password">Forgot Password?</Link>
            </p>
        </div>
    );
}

export default Login;