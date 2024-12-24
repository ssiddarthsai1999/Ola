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
    const [duration, setDuration] = useState("");
    const [origin, setOrigin] = useState(""); // State for origin input
    const [destination, setDestination] = useState(""); // State for destination input
    const [originCoordinates, setOriginCoordinates] = useState(null);
    const [destinationCoordinates, setDestinationCoordinates] = useState(null);
    const [carTypes, setCarTypes] = useState([]);
    const [chosenCarComfortType, setChosenCarComfortType] = useState(null);
    const [fares, setFares] = useState([]);
    const [currentLocation, setCurrentLocation] = useState({
        lat: 20.5937, // Default: India's latitude
        lng: 78.9629, // Default: India's longitude
    });

    const originRef = useRef(null);
    const destinationRef = useRef(null);

    const createRide = async () => {
        const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_LOCAL_URL}/ride/rideCreate`,
                {
                    pickUpLocation: {
                        name: origin || "Origin",
                        lat: Number(originCoordinates?.lat),
                        lng: Number(originCoordinates?.lng),
                    },
                    dropOffLocation: {
                        name: destination || "Destination",
                        lat: Number(destinationCoordinates?.lat),
                        lng: Number(destinationCoordinates?.lng),
                    },
                    carType: chosenCarComfortType?.comfort,
                    paymentMode: "Cash",
                    fare: chosenCarComfortType?.fare,
                },
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("Ride created successfully:", response.data.response);
        } catch (error) {
            console.error(
                "Error creating the ride:",
                error.response?.data || error
            );
        }
    };

    const calculateRoute = () => {
        if (!origin || !destination) return;

        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin,
                destination,
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === "OK" && result) {
                    setDirectionsResponse(result);

                    const route = result.routes[0].legs[0];
                    const distanceInKm = parseFloat(
                        route.distance.text.replace("km", "").trim()
                    );
                    const durationInMinutes = parseInt(
                        route.duration.text.replace("mins", "").trim()
                    );

                    setDistance(route.distance.text);
                    setDuration(route.duration.text);

                    const calculatedFares = carTypes.map((car) => ({
                        ...car,
                        fare:
                            distanceInKm * car.basePricePerKm +
                            durationInMinutes * car.basePricePerMin,
                    }));
                    setFares(calculatedFares);
                } else {
                    console.error("Error fetching directions:", status);
                }
            }
        );
    };

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
                            Authorization: `Bearer ${token}`,
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
  useEffect(() => {
      if (originCoordinates && destinationCoordinates) {
          calculateRoute();
      }
  }, [originCoordinates, destinationCoordinates]);
    if (!isLoaded) return <div>Loading...</div>;

    console.log("originCoordinates", originCoordinates);
    console.log("destinationCoordinates", destinationCoordinates);
    console.log("chosenCarComfortType", chosenCarComfortType);
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100">
            <div className="w-full h-96 shadow-lg rounded-md overflow-hidden">
                <GoogleMap
                    center={currentLocation}
                    zoom={10}
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                >
                    {directionsResponse && (
                        <DirectionsRenderer directions={directionsResponse} />
                    )}
                    {originCoordinates && (
                        <Marker position={originCoordinates} title="Origin" />
                    )}
                    {destinationCoordinates && (
                        <Marker
                            position={destinationCoordinates}
                            title="Destination"
                        />
                    )}
                </GoogleMap>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg w-96 mt-8">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    Calculate Your Ride
                </h1>
                <div>
                    <label
                        htmlFor="origin"
                        className="block text-sm font-medium text-gray-600 mb-1"
                    >
                        Origin
                    </label>
                    <Autocomplete
                        options={{ componentRestrictions: { country: "in" } }}
                        onLoad={(autocomplete) =>
                            (originRef.current = autocomplete)
                        }
                        onPlaceChanged={() => {
                            const place = originRef.current.getPlace();
                            if (place && place.geometry) {
                                const lat = place.geometry.location.lat();
                                const lng = place.geometry.location.lng();
                                setOriginCoordinates({ lat, lng });
                                setOrigin(place.formatted_address);
                            }
                        }}
                    >
                        <input
                            type="text"
                            id="origin"
                            placeholder="Enter origin"
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </Autocomplete>
                </div>
                <div>
                    <label
                        htmlFor="destination"
                        className="block text-sm font-medium text-gray-600 mb-1"
                    >
                        Destination
                    </label>
                    <Autocomplete
                        options={{ componentRestrictions: { country: "in" } }}
                        onLoad={(autocomplete) =>
                            (destinationRef.current = autocomplete)
                        }
                        onPlaceChanged={() => {
                            const place = destinationRef.current.getPlace();
                            if (place && place.geometry) {
                                const lat = place.geometry.location.lat();
                                const lng = place.geometry.location.lng();
                                setDestinationCoordinates({ lat, lng });
                                setDestination(place.formatted_address);
                            }
                        }}
                    >
                        <input
                            type="text"
                            id="destination"
                            placeholder="Enter destination"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </Autocomplete>
                </div>

                {fares.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">
                            Choose a Vehicle
                        </h2>
                        <div className="space-y-2">
                            {fares.map((car) => (
                                <div
                                    key={car._id}
                                    onClick={() => setChosenCarComfortType(car)}
                                    className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                                        chosenCarComfortType === car
                                            ? "bg-blue-100 shadow-md border-blue-500"
                                            : "bg-gray-50 border border-gray-200"
                                    } hover:shadow-lg`}
                                >
                                    <img
                                        src={car.image}
                                        alt={car.comfort}
                                        className="w-12 h-12 rounded-md shadow-sm"
                                    />
                                    <span className="text-gray-700 font-medium">
                                        {car.comfort}
                                    </span>
                                    <span className="text-gray-900 font-semibold">
                                        ₹{car.fare.toFixed(0)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {chosenCarComfortType && (
                            <button
                                onClick={createRide}
                                className="mt-6 w-full py-3 bg-blue-500 text-white font-bold rounded-md shadow-md hover:bg-blue-600 transition-all"
                            >
                                Book a Ride
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Ride;
