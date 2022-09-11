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
    checkExpieredPayment,
    checkPendingPayment,
    getLatestBlockNumber,
    getUserTransaction,
    removeCompletedPayment,
    removeExpiredPaymentId,
    updatePaymentWithUserTransaction,
} from "./monitoringFunction"

const ethereumMonitor = (io: Server) => {
    // 1.Start Ethereum Monitor
    logStartEthereumMonitor()
    let intervalID: NodeJS.Timer
    let latestBlockNumber: number = 0
    const infuraProvider = new ethers.providers.InfuraProvider(ETHEREUM_NETWORK, INFURA_API_KEY)

    const blockMonitor = async () => {
        // 2.Are pending payment === 0 ? True,stop monitor due to ne payment to detect : False,Skip and run monitor
        let remainingPendingPayment = checkPendingPayment(pendingPayment)
        // If no pending payment then stop Ethereum Ropsten Monitor
        if (!remainingPendingPayment) {
            logStopEthereumMonitor()
            clearInterval(intervalID)
            return
        }

        // Assignment setup config -> for simplicity, let's have only 1 user
        let { userAddress } = pendingPayment[0]

        // 3.Get latest block number from our server on api/crypto/payments route that will call API to Infura to get latest block number
        let blockNumber = await getLatestBlockNumber()

        // 4.Is block number eqaul to latest block number ? True,we already processing this block so skip : False,processing this block
        if (blockNumber === latestBlockNumber) {
            return
        } else {
            latestBlockNumber = blockNumber
        }

        // 5. Check expired_block for each pending
        let expiredPaymentId = checkExpieredPayment(
            io,
            pendingPayment,
            blockNumber,
            userAddress,
            merchantAddressDB
        )

        // Remove expired Payment id
        removeExpiredPaymentId(pendingPayment, expiredPaymentId)

        // 6.Get block transaction with ethers.js that we connect with provider that is Infura
        // 7.Filter transaction to get only the user transaction which match userAddress and data -> '0x' that mean normal transfer ETH
        let userTransaction = await getUserTransaction(infuraProvider, blockNumber, userAddress)

        // 8.Update payment with the user transaction in this block
        updatePaymentWithUserTransaction(
            io,
            pendingPayment,
            userTransaction,
            blockNumber,
            userAddress
        )

        logReportUserTransactionInBlock(userTransaction.length, blockNumber)

        // 9.Check received value
        let completedPaymentId = checkCompletedPayment(
            io,
            pendingPayment,
            blockNumber,
            userAddress,
            merchantAddressDB
        )

        // Remove cpmpleted payment
        removeCompletedPayment(pendingPayment, completedPaymentId)
    }
    // Ethereum Monitor will run every 8 secondes -> 1 fastest block  is 12 seconds, 1 block can be 24,26,48 seconds
    // but rarely impossible to less than 12 seconds in this case so I select 8 seconds bbecause it not much frequent as 6 seconds
    // and still can track every block at least once
    intervalID = setInterval(blockMonitor, 8000)
}

export default ethereumMonitor
