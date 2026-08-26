import axios from "axios";


export const axiosInstance = axios.create({
    baseUrl: Import.meta.env.Mode === 'devlopment' ? "http://localhoast:3000/api" :"/api",
    withCredentials:true,
});

