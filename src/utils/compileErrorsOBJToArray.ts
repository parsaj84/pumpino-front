
export default function compileErrorOBJToArray(obj : Record<string , any>) {
    const compiledArray : string[] = []
    Object.entries(obj).map(ele => ele[1]).forEach((ele : []) => {
        ele.forEach((string ) => compiledArray.push(string))
    })
    return compiledArray
}