import {useAuth} from "../context/AuthContext";

function Home() {
  
  const {user , isAuthenticated ,isLoading , logout } =useAuth();

  if(isLoading){
    return <div>Loading...</div>
  }

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h1>Welcome, {user.username}!</h1>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <h1>Home Page</h1>
          <p>Please login to view your profile.</p>
        </div>
      )}
    </div>
  )
}       
export default Home;