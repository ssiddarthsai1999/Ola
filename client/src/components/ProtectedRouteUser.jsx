import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProtectedRouteUser = ({ children }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true); // Manage loading state
    const [isAuthorized, setIsAuthorized] = useState(false); // Manage authorization state

    useEffect(() => {
        const validateUser = async () => {
            const token = document.cookie
                .split("; ")
                .find((row) => row.startsWith("token="))
                ?.split("=")[1];

            if (!token) {
                navigate("/login"); // Redirect if no token
                return;
            }

            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_LOCAL_URL}/user/validateUser`,
                    {
                        withCredentials: true,
                        headers: {
                            Authorization: `Bearer ${token}`, // Send token in headers
                        },
                    }
                );

                if (response.status === 200) {
                    setIsAuthorized(true); // User is authorized
                } else {
                    navigate("/unauthorized"); // Redirect if unauthorized
                }
            } catch (error) {
                navigate("/unauthorized"); // Redirect on error
            } finally {
                setIsLoading(false); // Stop loading after API call
            }
        };

        validateUser();
    }, [navigate]);

    if (isLoading) {
        // Show a loader while waiting for API response
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    // Render the children if authorized, otherwise it will redirect
    return isAuthorized ? children : null;
};

export default ProtectedRouteUser;
