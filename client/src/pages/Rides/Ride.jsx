import React, { useRef, useState, useEffect } from "react";
import {
    GoogleMap,
    Autocomplete,
    DirectionsRenderer,
    useJsApiLoader,
} from "@react-google-maps/api";

function Ride() {
    const libraries = ["places"];
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
        libraries,
    });

    const [map, setMap] = useState(null);
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [distance, setDistance] = useState("");
    const [duration, setDuration] = useState("");
    const [vehicleType, setVehicleType] = useState("Mini");
    const [fare, setFare] = useState(null);
    const [currentLocation, setCurrentLocation] = useState({
        lat: 20.5937, // Default: India's latitude
        lng: 78.9629, // Default: India's longitude
    });

    const originRef = useRef(null);
    const destinationRef = useRef(null);

    // Base prices for each car type
    const basePrices = {
        Mini: 40, // Base price per km
        Compact: 60,
        Luxury: 100,
    };

    const calculateFare = (distanceInKm, durationInMinutes, carType) => {
        const basePricePerKm = basePrices[carType];
        const ratePerMinute = 2; // Example: Rs. 2 per minute
        return (
            distanceInKm * basePricePerKm + durationInMinutes * ratePerMinute
        );
    };

    // Fetch user's current location
    useEffect(() => {
        const getUserLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setCurrentLocation({ lat: latitude, lng: longitude });
                    },
                    (error) => {
                        console.error(
                            "Error fetching location:",
                            error.message
                        );
                    }
                );
            }
        };

        if (isLoaded) {
            getUserLocation();
        }
    }, [isLoaded]);

    // Calculate route based on inputs and vehicle type
    const calculateRoute = async () => {
        if (!originRef.current || !destinationRef.current) {
            alert("Please select both origin and destination.");
            return;
        }

        const origin = originRef.current.getPlace().formatted_address;
        const destination = destinationRef.current.getPlace().formatted_address;

        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin,
                destination,
                travelMode: window.google.maps.TravelMode.DRIVING,
                region: "IN", // Restrict results to India
            },
            (result, status) => {
                if (status === "OK" && result) {
                    setDirectionsResponse(result);
                    const route = result.routes[0].legs[0];
                    const distanceInKm = parseFloat(route.distance.text); // e.g., "12.5 km"
                    const durationInMinutes = parseInt(
                        route.duration.text.split(" ")[0]
                    ); // e.g., "25 mins"
                    setDistance(route.distance.text);
                    setDuration(route.duration.text);

                    const calculatedFare = calculateFare(
                        distanceInKm,
                        durationInMinutes,
                        vehicleType
                    );
                    setFare(calculatedFare);
                } else {
                    console.error("Error fetching directions", result);
                }
            }
        );
    };

    if (!isLoaded) return <div>Loading...</div>;
    //adadadawd

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="w-full h-96">
                <GoogleMap
                    center={currentLocation}
                    zoom={10}
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    onLoad={(map) => setMap(map)}
                >
                    {/* Render the directions on the map */}
                    {directionsResponse && (
                        <DirectionsRenderer directions={directionsResponse} />
                    )}
                </GoogleMap>
            </div>
            <div className="bg-white p-6 rounded shadow-md w-96 space-y-4 mt-4">
                <h1 className="text-2xl font-bold text-center mb-4">
                    Calculate Route
                </h1>
                <div>
                    <label
                        htmlFor="origin"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Origin
                    </label>
                    <Autocomplete
                        options={{
                            componentRestrictions: { country: "in" }, // Restrict to India
                        }}
                        onLoad={(autocomplete) =>
                            (originRef.current = autocomplete)
                        }
                    >
                        <input
                            type="text"
                            id="origin"
                            placeholder="Enter origin"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </Autocomplete>
                </div>
                <div>
                    <label
                        htmlFor="destination"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Destination
                    </label>
                    <Autocomplete
                        options={{
                            componentRestrictions: { country: "in" }, // Restrict to India
                        }}
                        onLoad={(autocomplete) =>
                            (destinationRef.current = autocomplete)
                        }
                    >
                        <input
                            type="text"
                            id="destination"
                            placeholder="Enter destination"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </Autocomplete>
                </div>
                <div className="mt-4">
                    <label
                        htmlFor="vehicleType"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Select Vehicle Type
                    </label>
                    <select
                        id="vehicleType"
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="Mini">Mini</option>
                        <option value="Compact">Compact</option>
                        <option value="Luxury">Luxury</option>
                    </select>
                </div>
                <button
                    onClick={calculateRoute}
                    className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Calculate Route
                </button>
                {distance && duration && (
                    <div className="text-center mt-4">
                        <p className="text-lg">
                            Distance:{" "}
                            <span className="font-bold">{distance}</span>
                        </p>
                        <p className="text-lg">
                            Duration:{" "}
                            <span className="font-bold">{duration}</span>
                        </p>
                        <p className="text-lg">
                            Fare: <span className="font-bold">₹{fare}</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Ride;
