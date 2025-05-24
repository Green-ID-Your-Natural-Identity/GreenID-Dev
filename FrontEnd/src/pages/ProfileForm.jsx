import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProfileForm = () => {
    const navigate = useNavigate();
    const {user} = useAuth() ;

    // const [userData, setUserData] = useState(null);
    const [age, setAge] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [profilePicFile, setProfilePicFile] = useState('');
    const [sustainabilityGoal, setSustainabilityGoal] = useState('');
    const [shortBio, setShortBio] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if( !user) {
            toast.error("User not Found. Please login again") ;
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error('User data not found!');
            return;
        }

        const formData = new FormData();
        formData.append('uid', user.uid);
        formData.append('fullName', user.fullName);
        formData.append('email', user.email);
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
                // const onlyUID = { uid: user.uid };
                // localStorage.setItem("userData", JSON.stringify(onlyUID));
                navigate('/profile');
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError(error.message);
    }
};

    return (
        <div className="flex text-black justify-center items-center min-h-screen bg-gradient-to-br from-green-100 to-green-200 py-10 px-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 space-y-6">
                <h2 className="text-3xl font-bold text-center text-green-700">🌿 Complete Your Profile</h2>
                {user && (
                    <form className="grid grid-cols-1 sm:grid-cols-2 gap-6" onSubmit={handleSubmit}>
                        <div className="col-span-2">
                            <label className="block text-sm text-gray-700  font-semibold mb-1">Full Name</label>
                            <input type="text" value={user.fullName} disabled className="w-full p-3 text-black border rounded-md bg-gray-100" />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm text-gray-700 font-semibold mb-1">Email</label>
                            <input type="email" value={user.email} disabled className="w-full p-3 border rounded-md bg-gray-100" />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-700 font-semibold mb-1">Age</label>
                            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full p-3 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 font-semibold mb-1">City</label>
                            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full p-3 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 font-semibold mb-1">State</label>
                            <input type="text" value={state} onChange={(e) => setState(e.target.value)} className="w-full p-3 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 font-semibold mb-1">Country</label>
                            <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full p-3 border rounded-md" />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm text-gray-700 font-semibold mb-1">Sustainability Goal</label>
                            <input type="text" value={sustainabilityGoal} onChange={(e) => setSustainabilityGoal(e.target.value)} className="w-full p-3 border rounded-md" />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm text-gray-700 font-semibold mb-1">Short Bio</label>
                            <textarea value={shortBio} onChange={(e) => setShortBio(e.target.value)} className="w-full p-3 border rounded-md h-28 resize-none" />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm text-gray-700 font-semibold mb-1">Profile Picture</label>
                            <input type="file" accept="image/*" onChange={(e) => {
                                const file = e.target.files[0];
                                if (file && file.size > 5 * 1024 * 1024) {
                                    alert("Profile picture must be less than 5MB");
                                    return;
                                }
                                setProfilePicFile(file);
                            }} className="w-full border rounded-md p-2" />
                        </div>

                        <div className="col-span-2 text-center">
                            <button type="submit" className="bg-green-600 text-white font-semibold py-3 px-6 rounded-md shadow hover:bg-green-700 transition duration-200">
                                Save Profile
                            </button>
                        </div>
                    </form>
                )}
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </div>
        </div>
    );
};

export default ProfileForm;
