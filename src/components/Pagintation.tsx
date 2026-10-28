import { Dispatch, memo, SetStateAction, useCallback } from "react"
interface PaginationContainerProps {
    productsCount ?:number | string;
    setFilterState : Dispatch<SetStateAction<Record<string , string | number | null>>>
    pageNums : (string | number | null )[],
    prevPage : string | number | null,
    nextPage : string |number | null
}


export default function PaginationContainer({ productsCount ,setFilterState, pageNums, prevPage, nextPage } : PaginationContainerProps) {

    const getCurrentPageNum = useCallback((nextPage : string | number | null, prevPage : string | number | null) => {
        if (!prevPage)
            return 1
        if (!nextPage)
            return pageNums?.length
        return (Number(prevPage) + Number(nextPage)) / 2
    }, [pageNums]);

    const currentPage = getCurrentPageNum(nextPage, prevPage)

    const PageItem = memo(({ page, isActive } : {page : string | number | null, isActive : boolean}) => (
        <button
            onClick={() => {
                if (!(page === currentPage) && isActive) {
                    setFilterState(prev => ({ ...prev, page }))
                }
            }}

            className={`pagintaion-btn font-mono ${currentPage === page && "active"}`}
        >
            <span>
                {page}
            </span>
        </button>
    ))

    const GeneratePageButtons = useCallback(
        (currentPage : string | number) => {
            return (
                <>
                    {prevPage && (
                        <div onClick={() => setFilterState(prev => ({ ...prev, page: prevPage }))} className="pagintaion-btn">
                            <span>
                                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10.5859 6.34314L12.0002 4.92892L19.0712 12L12.0002 19.0711L10.5859 17.6568L16.2428 12L10.5859 6.34314Z" fill="#444" />
                                </svg>
                            </span>
                        </div>
                    )}
                    {(prevPage && Number(currentPage) > 3) && <PageItem page={1} isActive={true} />}
                    {(prevPage && Number(currentPage) > 4) && <PageItem isActive={false} page={"..."} />}
                    {pageNums?.map(pageNum => {
                        if ((Number(pageNum) > ((Number(currentPage) - 3))) && (Number(pageNum) < Number(currentPage) + 3))
                            return <PageItem page={pageNum} isActive={true} />
                    })}
                    {(nextPage && Number(currentPage) < (pageNums?.length as number - 3)) && (<>
                    <PageItem page={"..."} isActive={false} />
                    <PageItem page={pageNums?.length as number} isActive={true} />
                    </>)}
                    {(nextPage && Number(currentPage) >= ( (pageNums?.length as number - 3)) && Number(currentPage) < (pageNums?.length as number - 2)) && <PageItem page={pageNums?.length} isActive={true} />}
                    {nextPage && (
                        <div onClick={() => setFilterState(prev => ({ ...prev, page: nextPage }))} className="pagintaion-btn">
                            <span>
                                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16.2431 6.34317L14.8288 4.92896L7.75781 12L14.8289 19.0711L16.2431 17.6569L10.5862 12L16.2431 6.34317Z" fill="#444" />
                                </svg>
                            </span>
                        </div>
                    )}
                </>
            )
        }
        , [pageNums])




    return (
        <div className="flex justify-center items-center">

            {GeneratePageButtons(currentPage  as number)}

        </div>
    )

}

