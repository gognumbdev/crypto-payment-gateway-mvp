import { useState } from "react"
import OrderBox from "./OrderBox"
import { useAppSelector } from "../redux/hook"
import store from "../redux/store"

const Orders = () => {
    const { orders } = useAppSelector((state) => state.orders)
    const [fourceUpdate, setForceUpdate] = useState(false)

    store.subscribe(() => {
        setForceUpdate(!fourceUpdate)
    })

    const calculatePendingOrderNumber = () => {
        let number = 0
        orders.forEach((order) => {
            if (order.status === "pending") {
                number += 1
            }
        })
        return number
    }

    return (
        <div className="w-full flex flex-col items-center justify-center">
            <p className="font-bold text-xl shadow rounded px-4 py-2 text-white bg-[#00c5c5]">
                Pending orders : {calculatePendingOrderNumber()}
            </p>
            {orders.map((order) => (
                <OrderBox
                    key={order.id}
                    item={order.item}
                    merchantAddress={order.merchantAddress}
                    received={order.received}
                    status={order.status}
                    id={order.id}
                />
            ))}
        </div>
    )
}

export default Orders
