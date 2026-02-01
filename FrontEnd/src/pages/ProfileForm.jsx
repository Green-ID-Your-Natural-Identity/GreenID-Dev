import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const ProfileForm = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [age, setAge] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [profilePicFile, setProfilePicFile] = useState('');
    const [sustainabilityGoal, setSustainabilityGoal] = useState('');
    const [shortBio, setShortBio] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            toast.error("User not Found. Please login again");
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!user) {
            toast.error('User data not found!');
            setIsLoading(false);
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
            formData.append('profilePicture', profilePicFile);
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/create-profile`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.message === 'User profile updated successfully!') {
                toast.success("Profile saved successfully! Redirecting...", {
                    position: "top-right",
                    autoClose: 2000,
                });
                setTimeout(() => navigate('/profile'), 1500);
            } else {
                setError(data.message);
                toast.error(data.message);
            }
        } catch (error) {
            setError(error.message);
            toast.error("Failed to save profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen h-screen w-[100vw] flex items-center justify-center bg-gradient-to-br from-blue-200 via-white to-green-200 p-4 overflow-hidden">
            {/* Profile Form Card */}
            <div className="w-full max-w-3xl h-[90vh] flex flex-col ">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 flex flex-col h-full overflow-hidden pb-4">
                    {/* Header - Fixed */}
                    <div className="p-8 pb-4 flex-shrink-0">
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            {/* <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <img src="./login.png" alt="" />
                            </div> */}
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                            Complete Your Profile
                        </h2>
                        <p className="text-center text-gray-500 text-sm mb-4">
                            Tell us more about yourself to personalize your eco-journey
                        </p>
                    </div>

                    {/* Form - Scrollable */}
                    <div className="flex-1 overflow-y-auto px-8 pb-8">
                        {user && (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Full Name - Disabled */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <span className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Full Name
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        value={user.fullName}
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed"
                                    />
                                </div>

                                {/* Email - Disabled */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <span className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            Email
                                        </span>
                                    </label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed"
                                    />
                                </div>

                                {/* Age & City - Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Age
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Enter your age"
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                City
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter your city"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                {/* State & Country - Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                State
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter your state"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Country
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter your country"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Sustainability Goal */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <span className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                            </svg>
                                            Sustainability Goal
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Reduce plastic waste, Plant 100 trees"
                                        value={sustainabilityGoal}
                                        onChange={(e) => setSustainabilityGoal(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* Short Bio */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <span className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                            </svg>
                                            Short Bio
                                        </span>
                                    </label>
                                    <textarea
                                        placeholder="Tell us about yourself and your eco-journey..."
                                        value={shortBio}
                                        onChange={(e) => setShortBio(e.target.value)}
                                        required
                                        rows="4"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                                    />
                                </div>

                                {/* Profile Picture */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <span className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Profile Picture
                                        </span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file && file.size > 5 * 1024 * 1024) {
                                                toast.error("Profile picture must be less than 5MB");
                                                return;
                                            }
                                            setProfilePicFile(file);
                                        }}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-all"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Maximum file size: 5MB</p>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                >
                                    {isLoading ? "Saving Profile..." : "Save Profile"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            <ToastContainer />
        </div>
    );
};

export default ProfileForm;
