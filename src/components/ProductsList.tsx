import { Dispatch, SetStateAction, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react"
import { Brand, Category, FilterState, PaginationData, Product } from "../types"
import fetchData from "../utils/fetchData"
import { Info, Search, Tag, X } from "lucide-react";
import { toPersianDigits } from "../utils/formatters";
import { ProductCard } from "./ProductCard";
import { ProductCardLoading } from "./ProductCardLoading";
import PaginationContainer from "./Pagintation";
import ProductsFilterModal from "./ProductsFilterModal";

interface ProductsListProps {
    products: Product[] | null;
    setProducts: Dispatch<SetStateAction<Product[] | null>>;
    setIsErrorAlertActive: Dispatch<SetStateAction<boolean>>;
    setErrorMsg: Dispatch<SetStateAction<string>>;
    categories: Category[] | null;
    brands: Brand[];
    isCategoriesLoading: boolean;
    isBrandsLoading: boolean;
    cartITemsId: (string | number)[] | undefined;
    setSelectedProduct: Dispatch<SetStateAction<Product | null>>;
}

export default function ProductsList({
    products,
    setProducts,
    setIsErrorAlertActive,
    setErrorMsg,
    brands,
    categories,
    isCategoriesLoading,
    isBrandsLoading,
    cartITemsId,
    setSelectedProduct,
}: ProductsListProps) {

    const [isFilterModalActive, setIsFilterModalActive] = useState(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const processMaxPrice = () => {
        if (isLoading) {
            return 0;
        }
        const mostExpensiveProduct = products?.sort((a, b) => {
            if (a.price > b.price) {
                return -1
            } else if (a.price < b.price) {
                return 1
            }
            return 0
        })[0]
        if (mostExpensiveProduct) return mostExpensiveProduct.price

        return 0
    }


    const [MAX, setMAX] = useState<number | null>(null);

    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(0);

    const maxInitialized = useRef(false);

    useEffect(() => {
        if (isLoading || !products?.length || maxInitialized.current) return;
        const initialMax = Math.max(...products.map(p => p.price));
        maxInitialized.current = true;
        setMAX(initialMax);
        setMaxPrice(initialMax);
    }, [isLoading, products]);

    const compileFilterStateFromURL = (): FilterState => {
        const params = new URLSearchParams(location.search)
        return {
            categoryId: params.get('categoryId') || 'all',
            brandId: params.get('brandId') || 'all',
            stockOnly: params.get('stockOnly') === 'true',
            minPrice: Number(params.get('minPrice') || 0),
            maxPrice: MAX || "",
            compatiblePumpQuery: params.get('compatiblePumpQuery') ?? ''
        }
    }


    const [filterState, setFilterState] = useState<FilterState | Record<string, any>>(
        () => compileFilterStateFromURL()

    )


    const handleResetFilters = () => {
        setSearchQuery('');
        setFilterState({
            categoryId: 'all',
            brandId: 'all',
            stockOnly: false,
            minPrice: 0,
            maxPrice: MAX,
            sortBy: 'featured',
            powerHpFilter: 'all',
            compatiblePumpQuery: ''
        });
    };




    const [paginationState, setPaginationState] = useState<PaginationData | null>(null)
    const [productsCount, setProductsCount] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    const deferedSearchQuery = useDeferredValue(searchQuery)



    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery === null) {
                return;
            }
            const urlSearchParams = new URLSearchParams(filterState as Record<string, string>)
            urlSearchParams.set("searchQuery", searchQuery || "")
            fetchData("products/" + "?" + urlSearchParams.toString(), (response) => {
                setProducts(response.data.products)
                setPaginationState({
                    nextPage: response.data.next_page,
                    prevPage: response.data.previous_page,
                    numPages: response.data.num_pages
                })
                setProductsCount(response.data.all_objs_count)
                setIsLoading(false)
                history.replaceState({}, "", "?" + urlSearchParams.toString())
            }, () => {
                setIsLoading(true)
            }, () => {
                setIsErrorAlertActive(true)
                setErrorMsg("خطا در برقراری ارتباط با سرور")
                setTimeout(() => {
                    setIsErrorAlertActive(false)
                    setErrorMsg("")
                }, 1500)
            })

        }, 500)
        return () => clearTimeout(timeoutId)
    }, [deferedSearchQuery])

    useEffect(() => {
        const urlParams = new URLSearchParams(filterState as Record<string, string>)
        urlParams.set("maxPrice", filterState.maxPrice || "")
        urlParams.set("searchQuery", searchQuery || "")
        console.log(filterState)
        fetchData("products/" + "?" + urlParams.toString(), (response) => {
            setProducts(response.data.products)
            setPaginationState({
                nextPage: response.data.next_page,
                prevPage: response.data.previous_page,
                numPages: response.data.num_pages
            })
            setProductsCount(response.data.all_objs_count)
            setIsLoading(false)
            history.replaceState({}, "", "?" + urlParams.toString())
        }, () => { setIsLoading(true) }, () => {
            setIsErrorAlertActive(true);
            setErrorMsg("خطا در برقراری ارتباط با سرور");
            setTimeout(() => {
                setIsErrorAlertActive(false)
                setErrorMsg("")
            }, 1500);
        });
    }, [filterState])

    useEffect(() => {
        let searchParams = null
        searchParams = new URLSearchParams(filterState as Record<string, string>)
        searchParams.set("searchQuery", searchQuery || "")
        const searchParamsString = searchParams && !location.search && location.pathname ? "/?" + searchParams?.toString() : ""
        history.replaceState({}, "", "/" + "catalog" + searchParamsString)
    }, [])
    useEffect(() => {

        const id = setTimeout(() => {
            setFilterState(prev => {

                return {
                    ...prev,
                    maxPrice: maxPrice,
                    minPrice: minPrice
                }
            })
        }, 500)
        return () => clearTimeout(id)
    }, [maxPrice, minPrice])
    return (
        <>
            <div className="space-y-4 w-full">
                {/* Product Catalog Grid */}

                <div className="space-y-4">
                    {/* Category Header Banner if Category Filtered */}
                    {/* Category Header Banner if Category Filtered */}
                    {(filterState.categoryId !== 'all' || filterState.brandId !== "all") && (
                        <div className="bg-sky-900 text-white p-4 rounded-2xl flex items-center justify-between border border-sky-800">

                            <button
                                onClick={() => setFilterState(prev => ({ ...prev, categoryId: 'all', brandId: "all" }))}
                                className="text-xs bg-sky-800 hover:bg-sky-700 text-white px-3 py-1.5 rounded-xl cursor-pointer"
                            >
                                نمایش همه
                            </button>
                        </div>
                    )}

                    {/* Accessible High-Contrast Search Box & Quick Chips */}
                    <div className="bg-gradient-to-r from-sky-50 to-cyan-50 border-2 border-sky-400 rounded-3xl p-4 shadow-sm space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-sky-950">
                                <Search className="w-4 h-4 text-sky-600" />
                                <span>جستجوی سریع کالاها، برندها و کد قطعات پمپینو:</span>
                            </div>
                            <span className="text-xs font-mono font-bold bg-sky-700 text-white px-2.5 py-0.5 rounded-xl">
                                {toPersianDigits(productsCount)} کالا
                            </span>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="جستجوی پمپ، مدل (مثلاً PM45 یا CAM100)، برند (پنتاکس...) یا کد قطعه..."
                                className="w-full bg-white text-slate-900 placeholder-slate-400 text-sm font-extrabold rounded-2xl py-3 pr-10 pl-10 border-2 border-sky-300 focus:border-sky-600 focus:ring-4 focus:ring-sky-100 shadow-sm transition outline-none"
                            />
                            <Search className="w-5 h-5 text-sky-600 absolute right-3 top-3.5 pointer-events-none" />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute left-3 top-3 p-1 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition cursor-pointer"
                                    title="پاک کردن جستجو"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Quick Search Tag Chips */}
                        <div
                            onClick={() => {
                                setIsFilterModalActive(true)
                            }}
                            className="w-full rounded-xl bg-sky-600 text-white border-sky-600 m-1 p-1.5 flex justify-center items-center">
                            <span className="font-semibold ">
                                فیلتر ها
                            </span>
                        </div>
                    </div>


                    {/* Products Grid Container */}
                    {isLoading ? (<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'>
                        {Array(6).fill({}).map(ele => <ProductCardLoading />)}
                    </div>) : (products && products?.length > 0) ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {products?.map(product => {
                                const categoriesString = product.categories?.map(ele => ele.name).join(",")
                                return (
                                    <ProductCard
                                        key={product.pk}
                                        product={product}
                                        brandName={product.brand?.name}
                                        categoryName={categoriesString}
                                        onViewDetails={(p: Product) => setSelectedProduct(p)}

                                        isInQuote={cartITemsId?.includes(product?.pk?.toString()) ? true : false}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                            <Info className="w-12 h-12 text-slate-300 mx-auto" />
                            <h3 className="text-base font-bold text-slate-800">
                                هیچ محصول یا قطعه‌ای با مشخصات انتخابی شما پیدا نشد!
                            </h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                عبارت جستجو یا فاکتورهای فیلتر را تغییر دهید یا دکمه حذف فیلترها را بزنید.
                            </p>
                            <button
                                onClick={handleResetFilters}
                                className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 cursor-pointer"
                            >
                                بازنشانی همه فیلترها
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {isLoading && <PaginationContainer productsCount={productsCount} setFilterState={setFilterState} pageNums={paginationState?.numPages || []} nextPage={paginationState?.nextPage || null} prevPage={paginationState?.prevPage || null} />}

            {isFilterModalActive &&
                <ProductsFilterModal
                    isBrandsLoading={isBrandsLoading}
                    isCategoriesLoading={isCategoriesLoading}
                    categories={categories}
                    isLoadingProducts={isLoading}

                    products={products}
                    setMaxPrice={setMaxPrice}
                    setMinPrice={setMinPrice}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    MAX={MAX}
                    isActive={isFilterModalActive} onClose={() => setIsFilterModalActive(false)} setFitlerState={setFilterState} brands={brands} filterState={filterState} />

            }
        </>
    )
}