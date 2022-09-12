import Item from "./Item"

export default interface Order {
    item: Item
    address: string
    received: number
    status: "pending" | "success" | "fail"
    id: string
}
