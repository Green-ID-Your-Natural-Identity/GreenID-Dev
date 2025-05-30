import React, { useEffect, useState } from 'react';
import { FaMapMarkerAlt, FaBirthdayCake, FaBullseye, FaUser  , FaStar} from 'react-icons/fa';
import Logoutbutton from '../components/logoutbutton';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const {user} = useAuth() ;
  const [activityLogs, setActivityLogs] = useState([]);
  const [totalPoints , setTotalPoints] = useState(0) ;

  useEffect(() => {
    if(!user?.uid) return ;

    // const stored = localStorage.getItem('userData');
    // if (!stored) return;
    // const { uid } = JSON.parse(stored);
    // if (!uid) return;

    fetch(`http://localhost:5000/api/users/get-user-profile?uid=${user.uid}`)
      .then(res => res.json())
      .then(data => {
        setUserData(data.user);
        setActivityLogs(data.activityLogs || []);
        setTotalPoints(data.totalPoints || 0) ;
      })
      .catch(err => console.error('Error fetching profile:', err));
  }, [user]);

  
  if (!userData) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10 bg-white rounded-2xl shadow-lg">
      {user && <Logoutbutton />}
      {/* Profile Header */}
      <div className="flex items-center space-x-6 pb-6 border-b">
        <div className="relative">
          <img
            src={userData.profilePicture || '/greenSpartan.png'}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-green-500 object-cover"
          />
          <div className="absolute bottom-0 right-0 bg-green-600 p-2 rounded-full border-2 border-white">
            <FaUser className="text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{userData.fullName}</h2>
          <p className="text-gray-600">{userData.email}</p>
          <div className="flex items-center space-x-4 mt-2 text-gray-500">
            <p className="flex items-center space-x-1"><FaBirthdayCake /> <span>{userData.age} yrs</span></p>
            <p className="flex items-center space-x-1"><FaMapMarkerAlt /> <span>{userData.location?.city}</span></p>
            {/* Show Total Points */}
            <p className="flex items-center space-x-1 text-yellow-500 font-semibold">
              <FaStar /> <span>{totalPoints} Points</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bio and Goals */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-4 bg-green-50 rounded-xl">
          <h3 className="font-semibold text-gray-700 mb-2"><FaBullseye className="inline mr-2" />Goal</h3>
          <p className="text-gray-800">{userData.sustainabilityGoal}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-xl">
          <h3 className="font-semibold text-gray-700 mb-2"><FaUser className="inline mr-2" />Bio</h3>
          <p className="text-gray-800">{userData.shortBio}</p>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="mt-10">
        <h3 className="text-2xl font-semibold mb-4 text-green-700">Activity Logs</h3>
        <div className="space-y-4">
          {activityLogs.length > 0 ? (
            activityLogs.map(log => (
              <div key={log._id} className="flex justify-between items-start bg-gray-50 p-4 rounded-xl shadow-sm">
                <p className="text-gray-800 flex-1 pr-4">{log.description}</p>
                {log.media?.[0] && renderMediaThumbnail(log.media[0])}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No activity logs yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const renderMediaThumbnail = (url) => {
    const isVideo = /\.(mp4|mov)$/i.test(url);
    return (
      <div className="relative w-48 h-28 rounded-lg overflow-hidden bg-gray-100">
        {isVideo ? (
          <video
            src={url}
            muted
            autoPlay
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <img
            src={url}
            alt="media"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>
    );
  };


export default ProfilePage;