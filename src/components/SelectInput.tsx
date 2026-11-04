import { memo, ReactElement, ReactNode, useState } from "react"
import { ChevronLeft } from "lucide-react"
import Skeleton from "react-loading-skeleton"


type StringKeyOf<T> = {
    [K in keyof T]-?: T[K] extends string ? K : never
}[keyof T];



interface SelectInputProps<T> {
    items: (T & { selected?: boolean })[];
    label?: string;
    isLoadingItems?: boolean;
    labelProperty?: StringKeyOf<T> | string;
    onItemSelected?: (item: T) => void;
    selectedItem?: T;
    Icon?: ReactElement
}


export default function SelectInput<T>({ items, label, isLoadingItems, labelProperty, onItemSelected, selectedItem, Icon }: SelectInputProps<T>) {

    function getLabel<T>(
        item: T,
        key: StringKeyOf<T>
    ): string {
        return item[key] as string;
    }

    const Item = memo(({ item, isSelected }: {
        item?: T;
        isSelected?: boolean;
    }) => {
        if (!item) {
            return ;
        }
        const label = item[labelProperty]
        return (
            item && <div onClick={() => onItemSelected(item)} className={`w-full text-sm cursor-pointer p-1 my-0.5  rounded-sm ${isSelected ? "bg-mist-300" : "bg-slate-200"}`}>
                {getLabel<T>(
                    item,
                    labelProperty
                    )}
            </div>
        )
    });

    

    const [isActive, setIsActive] = useState(false)
    return (
        <div className="relative">
            <div className="text-xs font-bold text-slate-700 block mb-1.5 flex  items-center gap-1">
                {Icon}
                <span>{label}</span>

            </div>
            {isLoadingItems ? <div className="w-full  cursor-pointer flex items-center justify-between bg-slate-50 text-slate-900  text-xs p-2.5  rounded-xl border   border-slate-300 transition">
                <Skeleton containerClassName="w-full" width={"50%"} height={15} />

            </div> :
                <>
                    <div onClick={() => setIsActive(prev => !prev)}
                        className={`w-full  cursor-pointer flex items-center justify-between bg-slate-50 text-slate-900 text-xs p-2.5  rounded-xl border  ${isActive && "ring-2 outline-none ring-sky-500 "} border-slate-300 transition  `}
                    >
                        {items?.length > 0 ? <>
                            {items.find(ele => ele.selected) ? selectedItem && selectedItem[labelProperty] : "یک مورد را انتخاب کنید"}
                            <ChevronLeft style={{ transform: `rotate(${isActive ? "-90" : "0"}deg)` }} className="transition" width={30} />
                        </> : <span className="text-sm">
                            موردی برای نمایش وجود ندارد
                        </span>}

                    </div>
                    {items?.length > 0 && <div style={{ transform: `translateY(${isActive ? "0" : "10"}px)`, zIndex: isActive ? 50 : -10, opacity: `${isActive ? "1" : "0"}` }} className={`menu transition  overflow-y-auto  rounded-s p-1 h-17.5 bg-zinc-100 flex flex-col bg-blue-300  w-full top-[105%] absolute `}>
                        <Item isSelected={true} item={items.find(ele => ele.selected)} />
                        {items.filter((ele, idx) => {
                            return (!ele.selected)
                        }).map(ele => <Item item={ele} isSelected={false} />)}
                    </div>}

                </>
            }

        </div>

    )
}