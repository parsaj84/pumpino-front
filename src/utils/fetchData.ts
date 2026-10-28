import { AxiosResponse } from "axios"
import API from "./../../api/api" 


export default async function fetchData(url: string, callBack: (response : AxiosResponse) => void, beforeSend : (null | Function) = null, onError : (() => void) | null = null) {
    try {
      if (beforeSend) {
        beforeSend()
      }
      const response = await API.get(url)
      callBack(response)
    } catch (e) {
      console.log(e)
      if (onError) {
        onError()
      }
    }
  }