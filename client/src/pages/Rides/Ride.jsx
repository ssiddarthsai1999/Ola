import React, { useRef, useState, useEffect } from "react";
import {
    GoogleMap,
    Autocomplete,
    DirectionsRenderer,
    Marker,
    useJsApiLoader,
} from "@react-google-maps/api";
import axios from "axios";

function Ride() {
    const libraries = ["places"];
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
        libraries,
    });

    const [map, setMap] = useState(null);
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [distance, setDistance] = useState("");
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [duration, setDuration] = useState("");
    const [carTypes, setCarTypes] = useState([]);
        const [originCoordinates, setOriginCoordinates] = useState(null);
        const [destinationCoordinates, setDestinationCoordinates] =
            useState(null);
    const [fares, setFares] = useState([]);
    const [currentLocation, setCurrentLocation] = useState({
        lat: 20.5937, // Default: India's latitude
        lng: 78.9629, // Default: India's longitude
    });

    const originRef = useRef(null);
    const destinationRef = useRef(null);

    // Fetch available car types on load
    useEffect(() => {
        const fetchCarTypes = async () => {
            const token = document.cookie
                .split("; ")
                .find((row) => row.startsWith("token="))
                ?.split("=")[1];

            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_LOCAL_URL}/carType/carTypeGetAll`,
                    {
                        withCredentials: true,
                        headers: {
                            Authorization: `Bearer ${token}`, // Send token in headers
                        },
                    }
                );
                setCarTypes(response.data.response);
            } catch (error) {
                console.error("Error fetching car types:", error);
            }
        };

        fetchCarTypes();
    }, []);

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

    const calculateFares = (distanceInKm, durationInMinutes) => {
        return carTypes.map((car) => ({
            ...car,
            fare:
                distanceInKm * car.basePricePerKm +
                durationInMinutes * car.basePricePerMin,
        }));
    };

    // Automatically calculate route when both locations are entered
    const calculateRoute = () => {
        if (!originRef.current || !destinationRef.current) return;

        const origin = originRef.current.getPlace()?.formatted_address;
        const destination =
            destinationRef.current.getPlace()?.formatted_address;

        if (!origin || !destination) return;

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
                    // Remove commas and units before parsing
                    const distanceInKm = parseFloat(
                        route.distance.text
                            .replace(/,/g, "")
                            .replace("km", "")
                            .trim()
                    );
                    const durationInMinutes = parseInt(
                        route.duration.text.replace("mins", "").trim()
                    );

                    setDistance(route.distance.text);
                    setDuration(route.duration.text);

                    // Calculate fares for all car types
                    const calculatedFares = calculateFares(
                        distanceInKm,
                        durationInMinutes
                    );
                    setFares(calculatedFares);
                } else {
                    console.error("Error fetching directions", result);
                }
            }
        );
    };

    if (!isLoaded) return <div>Loading...</div>;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="w-full h-96">
                <GoogleMap
                    center={currentLocation}
                    zoom={10}
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    onClick={(e) =>
                        setSelectedLocation({
                            lat: e.latLng.lat(),
                            lng: e.latLng.lng(),
                        })
                    }
                    onLoad={(map) => setMap(map)}
                >
                    {directionsResponse && (
                        <DirectionsRenderer directions={directionsResponse} />
                    )}
                    {/* Custom Marker for Origin */}
                    {originCoordinates && (
                        <Marker
                            position={originCoordinates}
                            icon={{
                                url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png", // Custom icon URL for origin
                                scaledSize: new window.google.maps.Size(40, 40),
                            }}
                            title="Origin"
                        />
                    )}

                    {/* Custom Marker for Destination */}
                    {destinationCoordinates && (
                        <Marker
                            position={destinationCoordinates}
                            icon={{
                                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png", // Custom icon URL for destination
                                scaledSize: new window.google.maps.Size(40, 40),
                            }}
                            title="Destination"
                        />
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
                            componentRestrictions: { country: "in" },
                        }}
                        onLoad={(autocomplete) =>
                            (originRef.current = autocomplete)
                        }
                        onPlaceChanged={calculateRoute}
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
                            componentRestrictions: { country: "in" },
                        }}
                        onLoad={(autocomplete) =>
                            (destinationRef.current = autocomplete)
                        }
                        onPlaceChanged={calculateRoute}
                    >
                        <input
                            type="text"
                            id="destination"
                            placeholder="Enter destination"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </Autocomplete>
                </div>
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
                        <div className="mt-4">
                            <h2 className="text-lg font-bold">
                                Choose a Vehicle
                            </h2>
                            {fares.map((car) => (
                                <div
                                    key={car._id}
                                    className="flex items-center justify-between mt-2"
                                >
                                    <img
                                        src={car.image}
                                        alt={car.comfort}
                                        className="w-12 h-12 rounded-md"
                                    />
                                    <span>{car.comfort}</span>
                                    <span>₹{car.fare.toFixed(0)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Ride;
