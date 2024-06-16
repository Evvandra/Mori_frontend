import axios from "axios";
import { host } from "./config";

axios.defaults.withCredentials = true;

export const createDriedLeaf = async (centralId, weight, driedDate, floured) => {
    try {
        const leafDetails = {
            CentralID: centralId,
            Weight: weight,
            DriedDate: driedDate,
            Floured: floured,
        };

        return axios.post(host + "/secured/dried_leaves/", leafDetails, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.log("Error creating dried leaf: ", error);
        throw new Error(error);
    }
};

export const readDriedLeaves = async (skip = 0, limit = 100) => {
    try {
        return axios.get(host + "/secured/dried_leaves/", {
            params: {
                skip: skip,
                limit: limit,
            },
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.log("Error reading dried leaves: ", error);
        throw new Error(error);
    }
};

export const readDriedLeaf = async (leafId) => {
    try {
        return axios.get(host + `/secured/dried_leaves/${leafId}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.log("Error reading dried leaf: ", error);
        throw new Error(error);
    }
};

export const updateDriedLeaf = async (leafId, centralId, weight, driedDate, floured) => {
    try {
        const leafDetails = {
            CentralID: centralId,
            Weight: weight,
            DriedDate: driedDate,
            Floured: floured,
        };

        return axios.put(host + `/secured/dried_leaves/${leafId}`, leafDetails, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.log("Error updating dried leaf: ", error);
        throw new Error(error);
    }
};

export const deleteDriedLeaf = async (leafId) => {
    try {
        return axios.delete(host + `/secured/dried_leaves/${leafId}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.log("Error deleting dried leaf: ", error);
        throw new Error(error);
    }
};

export const getdryingConversion = async (centraId) =>  {
    try {
        return axios.get(host + `/secured/dried_leaves/conversion`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.log("Error retrieving conversion rate: ", error);
        throw new Error(error);
    }
};
