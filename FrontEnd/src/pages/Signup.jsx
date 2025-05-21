import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const auth = getAuth();

    // Handle normal signup
    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save the user name and email in localStorage (along with UID)
            const userData = {
                uid: user.uid,
                fullName: name,
                email: email,
            };

            localStorage.setItem("userData", JSON.stringify(userData));
            navigate("/form");  // Redirect to profile form
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle Google Signup
    const handleGoogleSignup = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Save the user data (name, email, UID)
            const userData = {
                uid: user.uid,
                fullName: user.displayName,
                email: user.email,
            };

            // Store user data in localStorage
            localStorage.setItem("userData", JSON.stringify(userData));

            // Redirect to profile form
            navigate("/form");
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="flex justify-center items-center h-[90vh] rounded w-2xl text-black bg-green-100">
            <div className="bg-white p-8 rounded shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-green-600">DARShan Signup</h2>
                
                {/* Normal Signup Form */}
                <form onSubmit={handleSignup}>
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="border p-2 rounded mb-2 w-full"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="border p-2 rounded mb-2 w-full"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="border p-2 rounded mb-4 w-full"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit" className="bg-green-500 text-white py-2 rounded hover:bg-green-600 w-full">
                        Sign Up with Email
                    </button>
                </form>

                {/* Google Signup Button */}
                <div className="my-4">
                    <button 
                        onClick={handleGoogleSignup} 
                        className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 w-full"
                    >
                        Sign Up with Google
                    </button>
                </div>
                <p className="text-center mt-4">
                    Already have an account? <a href="/" className="text-green-500 font-semibold hover:underline">Log in</a>
                </p>
                {/* Error Message */}
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </div>
        </div>
    );
};

export default Signup;
