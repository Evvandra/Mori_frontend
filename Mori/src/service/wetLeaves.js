import axios from "axios";

axios.defaults.withCredentials = true

export const createWetLeavesCollection = async (centralId, date, weight, expired, expirationTime) => {
    try {
        const collectionDetails = {
            CentralID: centralId,
            Date: date,
            Weight: weight,
            Expired: expired,
            ExpirationTime: expirationTime,
        };

        return axios.post("http://localhost:8000/secured/wet-leaves-collections", collectionDetails, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.log("Error creating wet leaves collection: ", error);
        throw new Error(error);
    }
};

export const readWetLeavesCollections = async (skip = 0, limit = 100) => {
    try {
        return axios.get("http://localhost:8000/secured/wet-leaves-collections", {
            params: {
                skip: skip,
                limit: limit,
            },
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.log("Error reading wet leaves collections: ", error);
        throw new Error(error);
    }
};

export const readWetLeavesCollection = async (wetLeavesBatchId) => {
    try {
        return axios.get(`http://localhost:8000/secured/wet-leaves-collections/${wetLeavesBatchId}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.log("Error reading wet leaves collection: ", error);
        throw new Error(error);
    }
};

export const updateWetLeavesCollection = async (wetLeavesBatchId, date, weight, expired, expirationTime) => {
    try {
        const collectionDetails = {
            Date: date,
            Weight: weight,
            Expired: expired,
            ExpirationTime: expirationTime,
        };

        return axios.put(`http://localhost:8000/secured/wet-leaves-collections/${wetLeavesBatchId}`, collectionDetails, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.log("Error updating wet leaves collection: ", error);
        throw new Error(error);
    }
};

export const deleteWetLeavesCollection = async (wetLeavesBatchId) => {
    try {
        return axios.delete(`http://localhost:8000/secured/wet-leaves-collections/${wetLeavesBatchId}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.log("Error deleting wet leaves collection: ", error);
        throw new Error(error);
    }
};