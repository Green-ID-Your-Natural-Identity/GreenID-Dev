import React, { useEffect, useState } from 'react';

const ProfilePage = () => {
    const [userData, setUserData] = useState(null);
    const [activityLogs, setActivityLogs] = useState([]);
    
    useEffect(() => {
        const storedUserData = localStorage.getItem("userData");
        if (!storedUserData) return;

        const { uid } = JSON.parse(storedUserData);
        if (!uid) return;
        // Fetch the user data (you will need to create a backend API route for this)
        fetch(`http://localhost:5000/api/users/get-user-profile?uid=${uid}`)  // Replace with your actual backend route
            .then((response) => response.json())
            .then((data) => {
                setUserData(data.user);
                setActivityLogs(data.activityLogs); // Assuming activity logs are fetched here
            })
            .catch((error) => console.error('Error fetching profile data:', error));
    }, []);
    
    return (
        <div className="profile-page">
            {userData && (
                <>
                    <h2>{userData.fullName}</h2>
                    <p>Email: {userData.email}</p>
                    <p>Age: {userData.age}</p>
                    <p>Location: {userData.location?.city} , {userData.location?.state}, {userData.location?.country}</p>
                    <p>Bio: {userData.shortBio}</p>
                    <img src={userData.profilePicture || "/greenSpartan.png"} alt="Profile" />
                    <p>Sustainability Goal: {userData.sustainabilityGoal}</p>

                    <div className="activity-logs">
                        <h3>Activity Logs:</h3>
                        {activityLogs.map((log) => (
                            <div key={log.id}>{log.description}</div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ProfilePage;
