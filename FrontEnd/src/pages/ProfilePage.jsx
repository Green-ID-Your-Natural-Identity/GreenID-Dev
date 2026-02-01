import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

const ProfilePage = () => {
    const [userData, setUserData] = useState(null);
    const { user, setUser } = useAuth();
    const [activityLogs, setActivityLogs] = useState([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const [activeTab, setActiveTab] = useState('work');
    const [selectedActivity, setSelectedActivity] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user?.uid) return;

        fetch(`http://localhost:5000/api/users/get-user-profile?uid=${user.uid}`)
            .then(res => res.json())
            .then(data => {
                setUserData(data.user);
                setActivityLogs(data.activityLogs || []);
                setTotalPoints(data.totalPoints || 0);
            })
            .catch(err => console.error('Error fetching profile:', err));
    }, [user]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            navigate('/login');
        } catch (err) {
            console.error('Logout Error:', err);
        }
    };

    if (!userData) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-200 via-white to-green-200">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen min-w-[100vw] bg-gradient-to-br from-blue-200 via-white to-green-200 overflow-x-hidden">
            {/* Navigation Bar - Glass Effect */}
            <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo/Brand */}
                        <div className="flex items-center gap-3 ">
                            <img 
                                src="/Purple1.png" 
                                alt="GreenID Logo" 
                                className="h-16"
                            />
                            {/* <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                GreenID
                            </span> */}
                        </div>

                        {/* Nav Links */}
                        <div className="hidden md:flex items-center gap-1">
                            <button
                                onClick={() => navigate('/home')}
                                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-white/50 rounded-lg font-medium transition-all"
                            >
                                Home
                            </button>
                            <button
                                onClick={() => navigate('/profile')}
                                className="px-4 py-2 text-gray-900 bg-white/70 rounded-lg font-semibold shadow-sm"
                            >
                                Profile
                            </button>
                            <button
                                onClick={() => navigate('/activity-log')}
                                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-white/50 rounded-lg font-medium transition-all"
                            >
                                Activity Log
                            </button>
                            <button
                                onClick={() => navigate('/chatbot')}
                                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-white/50 rounded-lg font-medium transition-all"
                            >
                                Chatbot
                            </button>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="px-5 py-2 bg-gray-900/90 hover:bg-gray-900 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Profile Header Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
                        {/* Profile Picture */}
                        <div className="relative flex-shrink-0">
                            <img
                                src={userData.profilePicture || '/greenSpartan.png'}
                                alt={userData.fullName}
                                className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl object-cover shadow-lg"
                            />
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 text-center md:text-left w-full">
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">{userData.fullName}</h1>
                            <p className="text-gray-600 mb-3 sm:mb-4">{userData.sustainabilityGoal || 'Eco Warrior'}</p>
                            <p className="text-gray-500 text-sm mb-4 sm:mb-6">
                                📍 {userData.location?.city}, {userData.location?.state}, {userData.location?.country}
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 sm:gap-8 md:gap-6 md:flex-col text-center flex-shrink-0">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Activities</p>
                                <p className="text-2xl font-bold text-gray-800">{activityLogs.length}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Points</p>
                                <p className="text-2xl font-bold text-green-600">{totalPoints}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Rank</p>
                                <p className="text-2xl font-bold text-gray-800">#{Math.floor(totalPoints / 10) + 1}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 mb-6 border-b border-gray-200 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('work')}
                        className={`pb-3 px-2 font-medium transition-colors relative whitespace-nowrap ${
                            activeTab === 'work'
                                ? 'text-gray-900'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Activities
                        <span className="text-xs ml-1 text-gray-400">{activityLogs.length}</span>
                        {activeTab === 'work' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('about')}
                        className={`pb-3 px-2 font-medium transition-colors relative whitespace-nowrap ${
                            activeTab === 'about'
                                ? 'text-gray-900'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        About
                        {activeTab === 'about' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
                        )}
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'work' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {activityLogs.length > 0 ? (
                            activityLogs.map((log, index) => (
                                <div
                                    key={log._id}
                                    onClick={() => setSelectedActivity(log)}
                                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
                                >
                                    {/* Activity Media */}
                                    {log.media?.[0] && (
                                        <div className="relative h-48 bg-gray-100 overflow-hidden">
                                            {renderMediaThumbnail(log.media[0])}
                                            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                                +{log.points || 10} pts
                                            </div>
                                        </div>
                                    )}

                                    {/* Activity Info */}
                                    <div className="p-5">
                                        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                                            {log.category || 'Eco Activity'}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                            {log.description}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>🌱 Verified</span>
                                            <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-16">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">No activities yet</h3>
                                <p className="text-gray-500 mb-6">Start your eco-journey by logging your first activity!</p>
                                <button
                                    onClick={() => navigate('/activity-log')}
                                    className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                                >
                                    Add Activity
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'about' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Bio Card */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                About Me
                            </h3>
                            <p className="text-gray-600 leading-relaxed">{userData.shortBio || 'No bio added yet.'}</p>
                        </div>

                        {/* Goal Card */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                                Sustainability Goal
                            </h3>
                            <p className="text-gray-600 leading-relaxed">{userData.sustainabilityGoal || 'No goal set yet.'}</p>
                        </div>

                        {/* Personal Info Card */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Personal Info
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Email</span>
                                    <span className="text-gray-800 font-medium truncate ml-2">{userData.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Age</span>
                                    <span className="text-gray-800 font-medium">{userData.age} years</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Location</span>
                                    <span className="text-gray-800 font-medium">{userData.location?.city}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
                            <h3 className="text-lg font-semibold mb-4">Impact Summary</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-green-100 text-sm mb-1">Total Points Earned</p>
                                    <p className="text-3xl font-bold">{totalPoints}</p>
                                </div>
                                <div>
                                    <p className="text-green-100 text-sm mb-1">Activities Completed</p>
                                    <p className="text-3xl font-bold">{activityLogs.length}</p>
                                </div>
                                <div>
                                    <p className="text-green-100 text-sm mb-1">Global Rank</p>
                                    <p className="text-3xl font-bold">#{Math.floor(totalPoints / 10) + 1}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Activity Detail Modal */}
            {selectedActivity && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setSelectedActivity(null)}
                >
                    <div 
                        className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 flex justify-between items-center z-10">
                            <h2 className="text-2xl font-bold text-gray-800">Activity Details</h2>
                            <button
                                onClick={() => setSelectedActivity(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 sm:p-8">
                            {/* Media Section */}
                            {selectedActivity.media?.[0] && (
                                <div className="relative w-full h-96 bg-gray-100 rounded-2xl overflow-hidden mb-6">
                                    {renderMediaFull(selectedActivity.media[0])}
                                </div>
                            )}

                            {/* Activity Info */}
                            <div className="space-y-6">
                                {/* Category & Points */}
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <h3 className="text-3xl font-bold text-gray-800 mb-2">
                                            {selectedActivity.category || 'Eco Activity'}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                🌱 Verified
                                            </span>
                                            <span>•</span>
                                            <span>{new Date(selectedActivity.createdAt).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}</span>
                                        </div>
                                    </div>
                                    <div className="bg-green-500 text-white px-6 py-3 rounded-2xl font-bold text-lg shadow-lg">
                                        +{selectedActivity.points || 10} pts
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="bg-gray-50 rounded-2xl p-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                        </svg>
                                        Description
                                    </h4>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {selectedActivity.description || 'No description provided.'}
                                    </p>
                                </div>

                                {/* Additional Info */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-blue-50 rounded-xl p-4">
                                        <p className="text-sm text-blue-600 font-medium mb-1">Status</p>
                                        <p className="text-lg font-semibold text-blue-900">
                                            {selectedActivity.verificationStatus || 'Verified'}
                                        </p>
                                    </div>
                                    <div className="bg-purple-50 rounded-xl p-4">
                                        <p className="text-sm text-purple-600 font-medium mb-1">Impact Level</p>
                                        <p className="text-lg font-semibold text-purple-900">
                                            {selectedActivity.points >= 50 ? 'High' : selectedActivity.points >= 20 ? 'Medium' : 'Standard'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const renderMediaThumbnail = (url) => {
    const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
    return (
        <>
            {isVideo ? (
                <video
                    src={url}
                    muted
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            ) : (
                <img
                    src={url}
                    alt="activity"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            )}
        </>
    );
};

const renderMediaFull = (url) => {
    const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
    return (
        <>
            {isVideo ? (
                <video
                    src={url}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-contain"
                />
            ) : (
                <img
                    src={url}
                    alt="activity detail"
                    className="w-full h-full object-contain"
                />
            )}
        </>
    );
};

export default ProfilePage;