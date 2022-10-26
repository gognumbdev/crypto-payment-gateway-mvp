import { ethers } from "ethers"
import { Server } from "socket.io"
import { ETHEREUM_NETWORK, INFURA_API_KEY } from "../config"
import { pendingPayment } from "../../database/payments"
import merchantAddressDB from "../../database/merchantAddresses"
import {
    logReportUserTransactionInBlock,
    logStartEthereumMonitor,
    logStopEthereumMonitor,
} from "./helper"
import {
    checkCompletedPayment,
    checkExpieredPayment as checkExpiredPayment,
    checkPendingPayment,
    getLatestBlockNumber,
    getUserTransaction,
    removeCompletedPayment,
    removeExpiredPaymentId,
    updatePaymentWithUserTransaction,
} from "./monitoringFunction"

const monitorEthereum = (io: Server) => {
    logStartEthereumMonitor()
    let intervalID: NodeJS.Timer
    let prevBlockNumber: number = 0
    const infuraProvider = new ethers.providers.InfuraProvider(ETHEREUM_NETWORK, INFURA_API_KEY)

    const blockMonitor = async () => {
        let remainingPendingPayment = checkPendingPayment(pendingPayment)
        if (!remainingPendingPayment) {
            logStopEthereumMonitor()
            clearInterval(intervalID)
            return
        }

        // Assignment setup config -> for simplicity, let's have only 1 user
        let { userAddress } = pendingPayment[0]

        let latestBlockNumber = await getLatestBlockNumber()

        if (latestBlockNumber === prevBlockNumber) return

        let expiredPaymentId = checkExpiredPayment(
            io,
            pendingPayment,
            latestBlockNumber,
            userAddress,
            merchantAddressDB
        )

        removeExpiredPaymentId(pendingPayment, expiredPaymentId)

        let userTransaction = await getUserTransaction(
            infuraProvider,
            latestBlockNumber,
            userAddress
        )

        updatePaymentWithUserTransaction(
            io,
            pendingPayment,
            userTransaction,
            latestBlockNumber,
            userAddress
        )

        logReportUserTransactionInBlock(userTransaction.length, latestBlockNumber)

        let completedPaymentId = checkCompletedPayment(
            io,
            pendingPayment,
            latestBlockNumber,
            userAddress,
            merchantAddressDB
        )

        removeCompletedPayment(pendingPayment, completedPaymentId)

        prevBlockNumber = latestBlockNumber
    }
    // Ethereum Monitor will run every 8 secondes -> 1 fastest block  is 12 seconds, 1 block can be 24,26,48 seconds
    // but rarely impossible to less than 12 seconds in this case so I select 8 seconds bbecause it not much frequent as 6 seconds
    // and still can track every block at least once
    intervalID = setInterval(blockMonitor, 8000)
}

export default monitorEthereum
