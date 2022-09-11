import { PendingPayment } from "../server/types/Payment"
import Payment from "./types/Payment"

let payments: Array<Payment> = []
let pendingPayment: Array<PendingPayment> = []

export default payments
export { pendingPayment }
