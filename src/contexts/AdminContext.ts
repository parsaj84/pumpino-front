import {createContext } from "react"
import { AdminContextValue } from "../types"

const AdminContext = createContext<AdminContextValue | null>({
    
})


export default AdminContext