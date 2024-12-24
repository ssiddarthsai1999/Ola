import React, { useState } from "react";
import axios from "axios";

function Register() {
    const [isUser, setIsUser] = useState(true); // Toggle between user and driver
    const [formData, setFormData] = useState({ email: "", password: "" });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const apiUrl = isUser
            ? `${import.meta.env.VITE_LOCAL_URL}/user/userRegister`
            : `${import.meta.env.VITE_LOCAL_URL}/driver/driverRegister`;

        try {
            const response = await axios.post(apiUrl, formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            console.log("Registration successful:", response.data);
        } catch (error) {
            console.error(
                "Error during registration:",
                error.response?.data || error.message
            );
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-6">
                {isUser ? "User" : "Driver"} Register
            </h1>
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow-md w-80"
            >
                <div className="mb-4">
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Email:
                    </label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div className="mb-4">
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Password:
                    </label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Register
                </button>
            </form>

            <p className="mt-4 text-sm text-gray-600">
                Already registered?{" "}
                <a
                    href="/login"
                    className="text-indigo-600 hover:underline focus:outline-none"
                >
                    Login
                </a>
            </p>

            <p className="mt-2 text-sm text-gray-600">
                Switch to:{" "}
                <button
                    className="text-indigo-600 hover:underline focus:outline-none"
                    onClick={() => setIsUser(!isUser)}
                >
                    {isUser ? "Driver" : "User"}
                </button>
            </p>
        </div>
    );
}

export default Register;