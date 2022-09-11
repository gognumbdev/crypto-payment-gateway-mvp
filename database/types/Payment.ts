export default interface Payment {
    id: string
    status: "pending" | "success" | "fail"
    payment_amount: string
    payment_currency: string
    userAddress: string
    merchantAddress: string
    network: string
    inserted_at: number
    expired_at: number
}
