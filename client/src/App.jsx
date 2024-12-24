import { useState } from "react";
import {
    Routes,
    Route,
    Link,
    BrowserRouter as Router,
    Outlet,
} from "react-router-dom";
import Home from "./pages/Home/Home";
import Navbar from "./components/pagecomponents/Navbar";
import Footer from "./components/pagecomponents/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import Ride from "./pages/Rides/Ride";
import ProtectedRouteUser from "./components/ProtectedRouteUser";
import Unauthorized from "./pages/Unauthorized/Unauthorized";
function App() {
    return (
        <Router>
            <ToastContainer />
            <Routes>
                <Route
                    element={
                        <div>
                            <div>
                                <Navbar />
                            </div>
                            <div>
                                <Outlet />
                            </div>
                            <div>
                                <Footer />
                            </div>
                        </div>
                    }
                >
                    <Route element={<Home />} path="/" />
                    <Route element={<Register />} path="/register" />
                    <Route element={<Login />} path="/login" />
                    <Route
                        element={
                            <ProtectedRouteUser>
                                <Ride />
                            </ProtectedRouteUser>
                        }
                        path="/ride"
                    />
                </Route>
                <Route element={<Unauthorized />} path="/unauthorized" />
            </Routes>
        </Router>
    );
}

export default App;
