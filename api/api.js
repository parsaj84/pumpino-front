import axios from "axios"

const API = axios.create({
    baseURL: "http://127.0.0.1:8000",
    validateStatus: (status) => status < 500 && status !== 401,
    withCredentials: true
})

API.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("accessToken")

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
})


async function refreshToken() {
    try {
        const response = await API.post("/users/refresh-token/", {}, { _retry: true })
        if (response.status === 200) {
            const accessToken = response.data.access_token
            localStorage.setItem("accessToken", accessToken)
            return [true, accessToken]
        }
        localStorage.setItem("accessToken" , "")
        return [false, null]

    } catch (e) {
        return [false, null]
    }
}


API.interceptors.response.use(
    response => response,

    async error => {
        const originalRequest = error.config

        if (
            (error.response?.status === 401 || error.response?.status === 403) &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true

            const [refreshResult, accessToken] = await refreshToken()

            if (refreshResult) {
                originalRequest.headers.Authorization =
                    `Bearer ${accessToken}`

                return API(originalRequest)
            }

            return Promise.reject(error)
        }

        return Promise.reject(error)
    }
)

export default API