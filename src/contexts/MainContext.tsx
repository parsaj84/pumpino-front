import { createContext, Dispatch, SetStateAction } from "react";

export type MainContextValue  = {
    setSuccessMessage : Dispatch<SetStateAction<string>>;
    setSuccessAlertActive : Dispatch<SetStateAction<boolean>>;
    setErrorMessage : Dispatch<SetStateAction<string>>
    setErrorAlertActive : Dispatch<SetStateAction<boolean>>
    onError : (message : string) => void,
    onSuccess : (message : string) => void
} | null

export const MainContext = createContext<MainContextValue>(null)