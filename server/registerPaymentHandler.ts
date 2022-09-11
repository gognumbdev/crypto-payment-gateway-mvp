import { ethers } from "ethers"
import { Server, Socket } from "socket.io"
import Payment from "../database/types/Payment"
import { pendingPayment } from "../database/payments"
import ethereumMonitor from "./monitor/ethereumMonitor"

// Add payment order to Ethereum Ropsten monitor to detect user transaction
const addPaymentToMonitor = (io: Server, payment: Payment) => {
    if (pendingPayment.length > 0) {
        // Already monitor , just add more payment to Ethereum monitor
        pendingPayment.push({ ...payment, received: ethers.BigNumber.from("0") })
    } else {
        // Add new payment to monitor to the pendingPayment in the database
        pendingPayment.push({ ...payment, received: ethers.BigNumber.from("0") })
        // Now Ethereum Monitor stop, So Start Ethereum Monitor to detect user transaction
        ethereumMonitor(io)
    }
}

const paymentHandler = (io: Server, socket: Socket) => {
    // Listenn to `add_payment_to_monitor` from client to monitor user transaction on Ethereum Ropsten
    socket.on("add_payment_to_monitor", (payment) => addPaymentToMonitor(io, payment))
}

module.exports = paymentHandler
