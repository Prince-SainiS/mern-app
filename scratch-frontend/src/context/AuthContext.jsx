import { createContext, useState , useContext , useEffect} from "react";
import api , {setAccessToken} from "../api/axios"; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const [isLoading, setIsLoading] = useState(true);

    

    const checkAuth = async () => {
        try {
            // try to refresh token using cookie
            const {data} = await api.post("/user/refresh-token");

            setAccessToken(data.accessToken);

            const userRes = await api.get("/user/me");
            setUser(userRes.data.data.user);
        } catch(err){
            // no valid refesh token = user not login in
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        checkAuth();
    } , [])

    // Login function
    const login = async (email, password) => {
        const {data} = await api.post("/user/login" , {email, password});

        setAccessToken(data.accessToken);
        const userRes = await api.get("/user/me");
        setUser(userRes.data.data.user);

        return data;
    }

    // register function
    const register = async (formData) => {
        const {data} = await api.post("/user/register", formData);
        setAccessToken(data.accessToken);
        setUser(data.data.user);
        return data;
    };

    const logout =async ()=> {
        try {
            await api.post("/user/logout");
        } catch(err){
            console.error("Logout error:", err);
        } finally {
            setAccessToken(null);
            setUser(null);
        }
    }

    const value = {
        user,
        setUser,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,

    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
export const useAuth = () => {
    return useContext(AuthContext);
}