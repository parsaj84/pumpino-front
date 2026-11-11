import { createContext, Dispatch, SetStateAction } from "react";
import { CartData, StoreSettings } from "../types";

export type MainContextValue  = {
    setSuccessMessage : Dispatch<SetStateAction<string>>;
    setSuccessAlertActive : Dispatch<SetStateAction<boolean>>;
    setErrorMessage : Dispatch<SetStateAction<string>>
    setErrorAlertActive : Dispatch<SetStateAction<boolean>>
    onError : (message : string) => void,
    onSuccess : (message : string) => void,
    storeSettings : StoreSettings;
    setCartData : Dispatch<SetStateAction<CartData | null>>
} | null

export const MainContext = createContext<MainContextValue>(null)