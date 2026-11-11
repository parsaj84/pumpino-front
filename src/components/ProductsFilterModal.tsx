import { Dispatch, ReactElement, ReactHTMLElement, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { Brand, Category, FilterState, Product } from "../types";
import { X } from "lucide-react";
import Accordion from "./Accordion";

import CheckBox from "./CheckBox";
import ToggleButton from "./ToggleButton";
import { formatPrice } from "../utils/formatters";
import Skeleton from "react-loading-skeleton";

interface ProductsFilterModalProps {
    filterState: FilterState;
    brands: Brand[];
    setFitlerState: Dispatch<SetStateAction<FilterState>>;
    onClose: () => void;
    isActive: boolean;
    categories: Category[]
    isCategoriesLoading: boolean;
    isBrandsLoading: boolean;
    products: Product[];
    isLoadingProducts: boolean;
    setMaxPrice: Dispatch<SetStateAction<number>>;
    setMinPrice: Dispatch<SetStateAction<number>>;
    minPrice: number;
    maxPrice: number;
    MAX: number
}

export default function ProductsFilterModal({ maxPrice, MAX, isCategoriesLoading, isBrandsLoading, setMaxPrice, minPrice, setMinPrice, onClose, isLoadingProducts, products, categories, brands, setFitlerState, filterState }: ProductsFilterModalProps) {

    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        return () => {
            setIsMounted(false);
            requestAnimationFrame(() => { })

        }
    }, [])

    const menuRef = useRef<HTMLDivElement | null>(null)
    const [isBrandOpen, setIsBrandOpen] = useState<boolean>(false)
    const [isCategoriesAccordionOpen, setIsCategoriesAccordionOpen] = useState<boolean>(false)
    const [isPriceAccordionOpen, setIsPriceAccordionOpen] = useState(false)
    const [activeRange, setActiveRange] = useState<"min" | "max">("min")

    const minPercent = (minPrice / MAX) * 100;
    const maxPercent = (maxPrice / MAX) * 100;

    return (
        <div style={{
            opacity: isMounted ? 1 : 0,
        }} className="fixed inset-0 flex  transition-all items-end md:items-center justify-center bg-gray-900/30 z-150  w-dvw h-dvh  duration-150 ">
            <div
                ref={menuRef}
                style={{
                    // visibility: isMounted ? "visible" : "hidden",
                    opacity: isMounted ? 1 : 0,
                    transform: `translateY(${isMounted ? "0px" : "90px"})`
                }}
                className="w-full flex flex-col items-center rounded-t-xl md:rounded-xl bg-white h-[90%] md:w-[90%] md:mx-5 transition-all ">
                <div
                    className="w-full   p-1.5 m-1.5 flex justify-between items-center"
                >
                    <div
                        className="font-semibold text-gray-800"
                    >
                        <span>
                            منو فیلتر محصولات
                        </span>
                    </div>
                    <button
                        className="transition-colors hover:text-red-500"
                        onClick={onClose}
                    >
                        <X
                            size={35}
                            className=""
                        />
                    </button>
                </div>
                <div className="w-full flex flex-col p-1 justify-center items-center">
                    <div className="w-full p-1 justify-center items-center ">
                        <Accordion isOpen={isBrandOpen} label="برندها" setIsOpen={setIsBrandOpen}  >
                            {isCategoriesLoading ?

                                Array(6).fill({}).map(() => {
                                    return (
                                        <div className="w-full flex gap-3">
                                            <Skeleton circle width={30} height={30} />
                                            <Skeleton width={90} height={30} />
                                        </div>
                                    )
                                })
                                : (
                                    <>
                                        <CheckBox
                                            isChecked={filterState.brandId === "all"}
                                            label={"همه"}
                                            onChange={() => setFitlerState(prev => ({ ...prev, brandId: "all" }))}
                                            key={"all"}

                                        />
                                        {brands?.map(ele => (
                                            <CheckBox
                                                isChecked={filterState.brandId === ele.pk}
                                                label={ele.name + (ele.country ? `(${ele.country})` : "")}
                                                onChange={() => setFitlerState(prev => ({ ...prev, brandId: ele.pk }))}
                                                key={ele.pk}

                                            />
                                        ))}
                                    </>
                                )}

                        </Accordion>
                    </div>
                    <div className="w-full p-1 justify-center items-center ">
                        <Accordion isOpen={isCategoriesAccordionOpen} label="دسته بندی ها" setIsOpen={setIsCategoriesAccordionOpen}  >
                            {isBrandsLoading ? Array(6).fill({}).map(() => {
                                return (
                                    <div className="w-full flex gap-3">
                                        <Skeleton circle width={30} height={30} />
                                        <Skeleton width={90} height={30} />
                                    </div>
                                )
                            }) : <>

                                <CheckBox
                                    isChecked={filterState.categoryId === "all"}
                                    label={"همه"}
                                    onChange={() => setFitlerState(prev => ({ ...prev, categoryId: "all" }))}
                                />
                                {categories?.map(ele => (
                                    <CheckBox
                                        isChecked={filterState.categoryId === ele.pk}
                                        label={ele.name}
                                        onChange={() => setFitlerState(prev => ({ ...prev, categoryId: ele.pk }))}
                                        key={ele.pk}

                                    />
                                ))}</>}
                        </Accordion>
                    </div>
                    <div className="w-full flex justify-center items-center cursor-pointer p-1">
                        <ToggleButton isToggled={filterState.stockOnly} label="موجود" onToggle={() => setFitlerState(prev => ({ ...prev, stockOnly: !prev.stockOnly }))} />
                    </div>
                    <div className="w-full p-1 justify-center items-center ">
                        <Accordion isOpen={isPriceAccordionOpen} setIsOpen={setIsPriceAccordionOpen} label="قیمت">
                            <div className="flex flex-col w-full">
                                <div className="w-full flex justify-between items-center">
                                    <div >
                                        <span className="font-semibold text-gray-500">{
                                            formatPrice(maxPrice)
                                        } </span>

                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-500">{
                                            formatPrice(minPrice)
                                        } </span>
                                    </div>
                                </div>
                                <div dir="ltr" className="relative h-6 w-full">
                                    {/* track خاکستری */}
                                    <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-xl bg-gray-200" />

                                    {/* نوار آبی بین دو thumb */}
                                    <div
                                        style={{
                                            left: `${minPercent}%`,
                                            right: `${100 - maxPercent}%`,
                                        }}
                                        className="absolute top-1/2 h-1 -translate-y-1/2 rounded-xl bg-blue-500"
                                    />



                                    <input
                                        type="range"
                                        name="products_price_max"
                                        min={0}
                                        max={MAX}
                                        value={maxPrice}
                                        onChange={(e) => {
                                            const threshold = MAX / 50

                                            if ((Number(e.target.value) - minPrice) < threshold) {
                                                return
                                            }
                                            setMaxPrice(Math.max(Number(e.target.value), minPrice))
                                        }}
                                        onPointerDown={() => setActiveRange("max")}
                                        style={{ zIndex: activeRange === "max" ? 30 : 20 }}
                                        className="range-thumb absolute inset-0 w-full appearance-none bg-transparent pointer-events-none"
                                    />

                                    <input
                                        type="range"
                                        name="products_price_min"
                                        min={0}
                                        max={MAX}
                                        value={minPrice}
                                        onChange={(e) => {
                                            const threshold = MAX / 50
                                            if ((maxPrice - (Number(e.target.value))) < threshold) {
                                                return
                                            }
                                            setMinPrice(Math.min(Number(e.target.value), maxPrice))
                                        }}
                                        onPointerDown={() => setActiveRange("min")}
                                        style={{ zIndex: activeRange === "min" ? 30 : 20 }}
                                        className="range-thumb absolute inset-0 w-full appearance-none bg-transparent pointer-events-none"
                                    />
                                </div>
                            </div>

                        </Accordion>
                    </div>
                </div>
            </div>
        </div>
    )

}