import { ItemInterface } from "./Item"

interface IOrderBox {
    id: string
    item: ItemInterface
    merchantAddress: string
    received: number
    status: "pending" | "success" | "fail"
}

interface Order {
    item: ItemInterface
    userAddress: string
    merchantAddress: string
    received: number
    status: "pending" | "success" | "fail"
    id: string
}

export type { Order, IOrderBox }
