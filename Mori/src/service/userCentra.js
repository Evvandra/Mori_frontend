
import { api } from '../contexts/api';




export const getUserCentra = async (skip = 0, limit = 100) => {
    try {
        return api.get(`/secured/usercentra/`, {
            params: { skip, limit },
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.log("Error getting user centra: ", error);
        throw new Error(error);
    }
};

// export const getUserCentraEmail = async (skip = 0, limit = 100) => {
//     try {
//         const response = await api.get(`/secured/usercentra/`, {
//             params: { skip, limit },
//             headers: {
//                 "Content-Type": "application/json",
//                 // Add any additional headers if required (e.g., authorization token)
//             },
//         });
//         return response.data;  // Assuming the response.data is an array of UserCentraWithUser objects
//     } catch (error) {
//         console.log("Error getting user centra: ", error);
//         throw new Error(error);
//     }
// };


export const getUserCentraById = async (userCentraId) => {
    try {
        return api.get(`/secured/usercentra/${userCentraId}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.log("Error getting user centra by ID: ", error);
        throw new Error(error);
    }
};

export const getUserCentraByUser = async (userId) => {
    try {
        const response = await api.get(`/secured/usercentra/by-user/${userId}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        console.log('API Response:', response.data); // Log the API response to debug

        return response;
    } catch (error) {
        console.log("Error getting user centra by ID: ", error);
        throw new Error(error);
    }
};

export const addUserCentra = async (centraID, userID, active) => {
    try {
        const userCentraDetails = {
            CentraID: centraID,
            userID: userID,
            Active: active,
        };

        return api.post(`/secured/usercentra/`, userCentraDetails, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.log("Error adding user centra: ", error);
        throw new Error(error);
    }
};

export const updateUserCentra = async (userCentraId, centraID, userID, active) => {
    try {
        const userCentraDetails = {
            CentraID: centraID,
            userID: userID,
            Active: active,
        };

        return api.patch(`/secured/usercentra/${userCentraId}`, userCentraDetails, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.log("Error updating user centra: ", error);
        throw new Error(error);
    }
};

export const deleteUserCentra = async (userCentraId) => {
    try {
        return api.delete(`/secured/usercentra/${userCentraId}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.log("Error deleting user centra: ", error);
        throw new Error(error);
    }
};
