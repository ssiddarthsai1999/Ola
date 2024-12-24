import { createSlice } from "@reduxjs/toolkit";

const initialState = JSON.parse(localStorage.getItem("olaUser")) || {
    id: null,
    email: null,
    role: "user",
    firstName: null,
    lastName: null,
    phoneNumber: null,
    profilePicture: null,
    address: [],
    dob: null,
    gender: null,
    favouriteSpots: [],
    profileCompleted: false,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            // Update the state with the user data provided in the action payload
            const updatedState = {
                ...state,
                id: action.payload._id || null,
                email: action.payload.email || null,
                role: action.payload.role || "user",
                firstName: action.payload.firstName || null,
                lastName: action.payload.lastName || null,
                phoneNumber: action.payload.phoneNumber || null,
                profilePicture: action.payload.profilePicture || null,
                address: action.payload.address || [],
                dob: action.payload.dob || null,
                gender: action.payload.gender || null,
                favouriteSpots: action.payload.favouriteSpots || [],
                profileCompleted: action.payload.profileCompleted || false,
            };

            // Save the updated state to localStorage
            localStorage.setItem("olaUser", JSON.stringify(updatedState));

            return updatedState;
        },
        clearUser: () => {
            // Remove the user data from localStorage
            localStorage.removeItem("olaUser");

            // Reset state to its initial state on logout
            return {
                id: null,
                email: null,
                role: null,
                firstName: null,
                lastName: null,
                phoneNumber: null,
                profilePicture: null,
                address: [],
                dob: null,
                gender: null,
                favouriteSpots: [],
                profileCompleted: false,
            };
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
