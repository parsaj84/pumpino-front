import { ChevronLeft } from "lucide-react";
import { Dispatch, ReactElement, ReactNode, SetStateAction, useEffect, useRef, useState } from "react";


interface AccordionProps {
    isOpen: boolean;
    children: ReactNode;
    label: string;
    setIsOpen: Dispatch<SetStateAction<boolean>>
}

export default function Accordion({
    children,
    setIsOpen,
    isOpen,
    label
}: AccordionProps) {

    const contentRef = useRef<HTMLDivElement | null>(null)

    const [height, setHeight] = useState(0)

    useEffect(() => {
        if (contentRef.current) {
            setHeight(
                isOpen ? contentRef.current.scrollHeight : 0
            )
        }
    }, [isOpen, children])

    return (
        <div className="w-full cursor-pointer bg-slate-100 m-1 rounded-xl p-1.5">

            <div
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full flex justify-between items-center"
            >
                <span>{label}</span>

                <ChevronLeft
                    size={25}
                    className="transition-transform duration-300"
                    style={{
                        transform: `rotate(${isOpen ? "-90deg" : "0deg"})`
                    }}
                />
            </div>

            <div
                style={{ height }}
                className="overflow-auto max-h-30 transition-[height] duration-300"
            >
                <div className="overflow-auto " ref={contentRef}>
                    {children}
                </div>
            </div>

        </div>
    )
}