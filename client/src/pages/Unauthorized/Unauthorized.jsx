import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Unauthorized() {
    const [countdown, setCountdown] = useState(3); // Countdown starts at 3 seconds
    const navigate = useNavigate();

useEffect(() => {
    
    setInterval(()=>{
setCountdown((prevCount)=>prevCount-1)
    },1000)

setTimeout(()=>{
navigate("/login")
},3000)


}, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-red-600 mb-4">
                    Unauthorized
                </h1>
                <p className="text-gray-700 text-lg">
                    You do not have permission to access this page.
                </p>
                <p className="mt-4 text-gray-700 text-lg">
                    Redirecting to login in{" "}
                    <span className="font-bold">{countdown}</span> seconds...
                </p>

            </div>
        </div>
    );
}

export default Unauthorized;
