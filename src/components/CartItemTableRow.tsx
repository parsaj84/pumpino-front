import { useState } from "react";
import { formatPrice } from "../utils/formatters";
import { Minus, Plus, Trash2 } from "lucide-react";
import API from "@/api/api";
import Spinner from "./Spinner";

export default function CartItemTableRow({ storeSettings, setCartData, product, item, idx }) {
    const [isPending, setIsPending] = useState(false)
    const quantity = Math.max(item.quantity, 1)
    const unitPrice = product.price * ((100 - product.off) / 100);
    const quantityUpdator = async (productId: string, action: "increase" | "decrease") => {
        const productIdString = productId.toString()
        try {
            setIsPending(true)
            const { status, data } = await API.post(action === "increase" ? "cart/increase-cart-item/" : "cart/decrease-cart-item/", { product_id: productIdString })
            if (status === 200 && data.success) {

                setCartData(prev => ({
                    post_price: data.post_price, total_items_price: data.cart_total_price, cart_items: [...prev.cart_items].filter(ele => {
                        if (ele.product_id === productIdString && data.item_removed) {
                            return false
                        }
                        return true
                    }).map(ele => {
                        if (!(ele.product_id === productIdString)) {

                            return ele
                        }
                        ele.quantity = data.quantity
                        ele.product.item_total_price = data.item_total_price
                        return ele
                    })
                }))
            } else {
                const e = data.error_des
                console.log(e)
            }
            setIsPending(false)
        } catch (e) {
            console.log(e)
            setIsPending(false)
        }
    };

    const handleRemoveFromCart = async (productId: string) => {
        try {
            setIsPending(true)
            const productIdString = productId.toString()
            const { status, data } = await API.post("cart/remove-cart-item/", { product_id: productIdString })
            if (status === 200 && data.success) {
                setCartData(prev => ({ post_price: data.post_price, total_items_price: data.cart_total_price, cart_items: [...prev.cart_items].filter(ele => ele.product_id !== productIdString) }))
            } else {
                const e = data.error_des
                console.log(e)
            }
            setIsPending(false)
        } catch (e) {
            console.log(e)
            setIsPending(false)
        }
    }
    return (
        <tr key={item.product.id} className="hover:bg-slate-50/80">
            <td className="p-3 font-mono font-bold text-slate-400">{idx + 1}</td>
            <td className="p-3 font-mono font-bold text-slate-700">{product?.technical_model}</td>
            <td className="p-3">
                <div className="font-bold text-slate-900">{product?.title}</div>
            </td>
            <td className="p-3 font-bold text-slate-800">
                {formatPrice(unitPrice, storeSettings.currencyUnit)}
            </td>
            <td className="p-3">
                <div className="flex items-center justify-center gap-1.5">
                    <button
                        disabled={isPending}
                        onClick={() => quantityUpdator(product.pk, "decrease")}
                        className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 transition cursor-pointer"
                        title="کاهش تعداد"
                    >
                        <Minus className="w-3.5 h-3.5" />
                    </button>

                    {/* Direct Editable Quantity Keyboard Input */}

                    <div className='w-14 bg-white text-center flex justify-center items-center font-black text-sm font-mono border-2 border-sky-300  rounded-xl py-1 px-1 outline-none shadow-xs'>
                        {isPending ? <Spinner width={20} height={20} borderWidth={1.5} borderMainColor={"wheat"} borderTopColor={"yellow"} /> : quantity}
                    </div>

                    <button
                        disabled={isPending}

                        onClick={() => quantityUpdator(product.pk, "increase")}
                        className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 transition cursor-pointer"
                        title="افزایش تعداد"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                </div>
            </td>
            <td className="p-3 font-bold text-sky-900">
                {formatPrice(product.item_total_price, storeSettings.currencyUnit)}
            </td>
            <td className="p-3 text-center">
                <button
                    disabled={isPending}
                    onClick={() => handleRemoveFromCart(product.pk)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </td>
        </tr>
    )
}