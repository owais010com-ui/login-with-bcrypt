import axios from "axios";


const api = axios.create({
    baseURL: window.location.href.split(":")[0] === "http" ? "http://localhost:5000/api1/" : "/api1",
    withCredentials: true
});


export default api;