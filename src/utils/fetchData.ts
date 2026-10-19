import API from "./../../api/api" 


export default async function fetchData(url: string, callBack: Function, beforeSend : (null | Function) = null) {
    try {
      if (beforeSend) {
        beforeSend()
      }
      const response = await API.get(url)
      callBack(response)
    } catch (e) {
      console.log(e)
    }
  }