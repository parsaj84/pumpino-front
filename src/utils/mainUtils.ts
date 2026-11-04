export function processPriceWithOff(price: number | string, off: string | number) {
    if (!Number(price)) {
        return 0
    }
    return parseInt(String((Number(price) * ((100 - Number(off)) / 100)) || 0))
}   