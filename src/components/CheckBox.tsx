import { Check } from "lucide-react";

interface CheckBoxProps {
    isChecked: boolean;
    onChange: () => void;
    label: string;
}


export default function CheckBox({ isChecked, label, onChange }: CheckBoxProps) {

    return (
        <div className="w-full p-1.5 ">
            <div className="flex items-center gap-1 justify-start">
                <div onClick={onChange} className={`h-5 w-5 rounded-xl transition-colors ${isChecked ? "bg-emerald-700" : "bg-gray-300"} flex justify-center items-center`}>
                    <Check size={15}
                    color="white"
                        style={
                            {
                                opacity: isChecked ? 1 : 0,
                                transition: "opacity"
                            }
                        } />
                </div>
                <div>
                    <span className="
                    font-sm
                    ">
                        {label}
                    </span>
                </div>
            </div>
        </div>
    )
}
