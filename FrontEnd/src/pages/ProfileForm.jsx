import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileForm = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [age, setAge] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [profilePicFile, setProfilePicFile] = useState('');
    const [sustainabilityGoal, setSustainabilityGoal] = useState('');
    const [shortBio, setShortBio] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch userData from localStorage
        const storedUserData = localStorage.getItem("userData");
        if (storedUserData) {
            setUserData(JSON.parse(storedUserData)); // Parsing JSON string to object
        } else {
            setError("User data not found.");
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userData) {
            setError('User data not found!');
            return;
        }

        const formData = new FormData();
        formData.append('uid', userData.uid);
        formData.append('fullName', userData.fullName);
        formData.append('email', userData.email);
        formData.append('age', age);
        formData.append('city', city);
        formData.append('state', state);
        formData.append('country', country);
        formData.append('sustainabilityGoal', sustainabilityGoal);
        formData.append('shortBio', shortBio);
        formData.append('consentForDataUse', true);
        if (profilePicFile) {
            formData.append('profilePicture', profilePicFile); // ⬅ matches multer field
        }

        try {
            const response = await fetch('http://localhost:5000/api/users/create-profile', {
            method: 'POST',
            body: formData, // 👈 no need for headers when using FormData
            });

            const data = await response.json();
            if (data.message === 'User profile updated successfully!') {
                const onlyUID = { uid: userData.uid };
                localStorage.setItem("userData", JSON.stringify(onlyUID));
                navigate('/profile');
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError(error.message);
    }
};

    return (
        <div className="flex justify-center items-center h-[90vh] rounded w-2xl text-black bg-green-100">
            <div className="bg-white p-8 rounded shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-green-600">Complete Your Profile</h2>
                {userData && (
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Name"
                            className="border p-2 rounded"
                            value={userData.fullName} // Prefill from localStorage
                            disabled
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="border p-2 rounded"
                            value={userData.email} // Prefill from localStorage
                            disabled
                        />
                        <input
                            type="number"
                            placeholder="Age"
                            className="border p-2 rounded"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="City"
                            className="border p-2 rounded"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="State"
                            className="border p-2 rounded"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Country"
                            className="border p-2 rounded"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Sustainability Goal"
                            className="border p-2 rounded"
                            value={sustainabilityGoal}
                            onChange={(e) => setSustainabilityGoal(e.target.value)}
                        />
                        <textarea
                            placeholder="Short Bio"
                            className="border p-2 rounded"
                            value={shortBio}
                            onChange={(e) => setShortBio(e.target.value)}
                        />
                        {/* <input
                            type="file"
                            onChange={(e) => setProfilePicture(e.target.files[0])}
                        /> */}
                        
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file && file.size > 5 * 1024 * 1024) { // 5MB limit
                                alert("Profile picture must be less than 5MB");
                                return;
                                }
                                setProfilePicFile(file);
                            }}
                            className="p-2 border rounded-md"
                        />


                        <button type="submit" className="bg-green-500 text-white py-2 rounded hover:bg-green-600">
                            Save Profile
                        </button>
                    </form>
                )}
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </div>
        </div>
    );
};

export default ProfileForm;
