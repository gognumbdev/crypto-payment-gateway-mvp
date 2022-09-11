import Item from "../../database/types/Item"

interface Order {
    item: Item
    userAddress: string
    merchantAddress: string
    received: number
    status: "pending" | "success" | "fail"
    id: string
}

export default Order
