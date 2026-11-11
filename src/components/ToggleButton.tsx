interface ToggleButtonProps {
    isToggled: boolean;
    onToggle: () => void;
    label: string;
}


export default function ToggleButton({ isToggled, label, onToggle }: ToggleButtonProps) {
    return (
        <div
        onClick={onToggle}
            className="w-full bg-slate-100 rounded-xl p-1.5 m-1 flex justify-between items-center">
            <span>
                {label}
            </span>
            <div className={`h-6 w-12 rounded-full relative ${isToggled ? "bg-slate-700" : "bg-slate-200"} transition-all `}>
                <div 
                style={{
                    left : 0,
                    transform : `translateX(${isToggled ? "25px" : "0px"})`
                }}
                className="absolute rounded-full m-0.25  transition-transform  w-5.5 h-5.5 bg-slate-50">

                </div>
            </div>
        </div>
    )
}