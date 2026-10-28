import {  Ref,  useRef } from "react";


interface ErrorMessageProps {
    message : string;
    isActive : boolean
}


export default function ErrorMessage({message , isActive} : ErrorMessageProps) {
    const elementRef = useRef<Ref<HTMLDivElement> | null>(null)

    return (
        <div ref={elementRef} style={{
            transform : `translateX(${isActive ? "0px" : "10000px"})`
        }} className="fixed p-1.5
        rounded z-150 top-2.5 right-[2.5%] left-[2.5%] transition-transform max-h-50 w-[95%] md:w-50  bg-red-600 text-white">
            {message}

        </div>
    )
}