import { useState } from "react"
import { useAppSelector } from "../redux/hook"
import store from "../redux/store"
import ItemBox from "./ItemBox"

const Items = () => {
    const { orders } = useAppSelector((state) => state.orders)
    const { items } = useAppSelector((state) => state.items)

    const countPendingOrder = () => {
        let count = 0
        orders.forEach((order) => {
            if (order.status === "pending") {
                count += 1
            }
        })
        return count
    }

    const [fourceUpdate, setForceUpdate] = useState(false)

    store.subscribe(() => {
        setForceUpdate(!fourceUpdate)
    })

    return (
        <div className="flex gap-4 w-10/12 items-center justify-between">
            {items.map((item) => (
                <ItemBox
                    key={item.name}
                    name={item.name}
                    price={item.price}
                    owned={item.owned}
                    buyAble={countPendingOrder() < 5}
                />
            ))}
        </div>
    )
}

export default Items
