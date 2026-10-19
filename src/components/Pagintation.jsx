import { memo, useCallback, useMemo } from "react"

export default function PaginationContainer({ productsCount ,setFilterState, pageNums, prevPage, nextPage }) {

    if (productsCount <= 0) {
        return null
    }

    const getCurrentPageNum = useCallback((nextPage, prevPage) => {
        if (!prevPage)
            return 1
        if (!nextPage)
            return pageNums.length
        return (prevPage + nextPage) / 2
    }, [pageNums]);

    const currentPage = getCurrentPageNum(nextPage, prevPage)

    const PageItem = memo(({ page, isActive }) => (
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
        (currentPage) => {
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
                    {(prevPage && currentPage > 3) && <PageItem page={1} isActive={true} />}
                    {(prevPage && currentPage > 4) && <PageItem isActive={false} page={"..."} />}
                    {pageNums?.map(pageNum => {
                        if ((pageNum > (currentPage - 3)) && (pageNum < (currentPage + 3)))
                            return <PageItem page={pageNum} isActive={true} />
                    })}
                    {(nextPage && currentPage < (pageNums?.length - 3)) && (<>
                    <PageItem page={"..."} isActive={false} />
                    <PageItem page={pageNums?.length} isActive={true} />
                    </>)}
                    {(nextPage && currentPage >= (pageNums?.length - 3) && currentPage < (pageNums?.length - 2)) && <PageItem page={pageNums?.length} isActive={true} />}
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

            {GeneratePageButtons(currentPage)}

        </div>
    )

}

