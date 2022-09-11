import axios from "axios"
import { ethers } from "ethers"
import { Server, Socket } from "socket.io"
import { ETHEREUM_NETWORK, INFURA_API_KEY, SERVER_ENDPOINT } from "../config"
import { pendingPayment } from "../../database/payments"
import merchantAddressDB from "../../database/merchantAddresses"
import {
    logFailMessage,
    logNoneUserTransaction,
    logReportUserTransactionInBlock,
    logSuccessMessage,
    logUserTransaction,
} from "./helper"

const ethereumMonitor = (io: Server, socket: Socket) => {
    // 1.Start Ethereum Monitor
    console.log("\x1b[36m", `\n Start Ethereum Ropsten Monitoring on ${Date()} \n`)
    let intervalID: NodeJS.Timer
    let latestBlockNumber: number = 0
    const infuraProvider = new ethers.providers.InfuraProvider(ETHEREUM_NETWORK, INFURA_API_KEY)

    let blockMonitor = async () => {
        // 2.Are pending payment === 0 ? True,stop monitor due to ne payment to detect : False,Skip and run monitor
        if (pendingPayment.length === 0) {
            clearInterval(intervalID)
            console.log("\x1b[36m", `Stop Ethereum Ropsten Monitoring on ${Date()} \n`)
            return
        }
        // Assignment setup config -> for simplicity, let's have only 1 user
        let { userAddress } = pendingPayment[0]

        // 3.Get latest block number from our server on api/crypto/payments route that will call API to Infura to get latest block number
        let latestBlockResponse = await axios.get(
            `${SERVER_ENDPOINT}/api/crypto/payments/infura/getLatestBlockNumber`
        )
        let blockNumber = parseInt(latestBlockResponse.data.result, 16)

        // 4.Is block number eqaul to latest block number ? True,we already processing this block so skip : False,processing this block
        if (blockNumber === latestBlockNumber) {
            return
        } else {
            latestBlockNumber = blockNumber
        }

        // 5. Check expired_block for each pending
        let expiredPaymentId: Array<string> = []
        pendingPayment.forEach(
            ({ received, id, payment_amount, merchantAddress, inserted_at, expired_at }) => {
                if (blockNumber > expired_at) {
                    expiredPaymentId.push(id)
                    // Fail : user transfer not enough to payment_amount in 25 blocks period
                    let receivedInETH = ethers.utils.formatUnits(received)
                    logFailMessage(
                        id,
                        receivedInETH,
                        userAddress,
                        merchantAddress,
                        payment_amount,
                        inserted_at,
                        expired_at
                    )
                    io.emit("finalize_payment", {
                        status: "fail",
                        userAddress,
                        merchantAddress,
                        id,
                    })
                    let addressIndex = merchantAddressDB.findIndex(
                        ({ address }) => address === merchantAddress
                    )
                    merchantAddressDB[addressIndex].status = "ready"
                }
            }
        )
        // Remove expired Payment id
        for (let i = 0; i < expiredPaymentId.length; i++) {
            let index = pendingPayment.findIndex(({ id }) => id === expiredPaymentId[i])
            pendingPayment.splice(index, 1)
        }

        // 6.Get block transaction with ethers.js that we connect with provider that is Infura
        let blockWithTransactions = await infuraProvider.getBlockWithTransactions(blockNumber)
        let blockTransactions = blockWithTransactions.transactions

        // 7.Filter transaction to get only the user transaction which match userAddress and data -> '0x' that mean normal transfer ETH
        let userTransactions = blockTransactions.filter(
            ({ from, data }) => from === userAddress && data === "0x"
        )

        // 8.Update payment with the user transaction in this block
        if (userTransactions.length > 0) {
            userTransactions.forEach(({ data, from, to, value }) => {
                logUserTransaction(blockNumber, data, from, to, value)
                let index = pendingPayment.findIndex((payment) => payment.merchantAddress === to)
                // update received value of the payment in pendingPayment that has merchantAddress match to `to`
                // that is the destination address of this transaction
                pendingPayment[index].received = pendingPayment[index].received.add(value)
                let { received, merchantAddress, id } = pendingPayment[index]
                io.emit("update_payment", {
                    id,
                    received: ethers.utils.formatUnits(received),
                    merchantAddress,
                    userAddress,
                })
            })
        } else {
            logNoneUserTransaction(userAddress, blockNumber)
        }

        logReportUserTransactionInBlock(userTransactions.length, blockNumber)

        // 9.Check received value
        let completedPaymentId: Array<string> = []
        pendingPayment.forEach(({ received, id, payment_amount, merchantAddress, inserted_at }) => {
            let paymentAmountInWei = ethers.utils.parseEther(String(payment_amount))
            if (received.gte(paymentAmountInWei)) {
                // user transfer more than or equal to payment_amount
                completedPaymentId.push(id)
                let receivedInETH = ethers.utils.formatUnits(received)
                logSuccessMessage(
                    id,
                    receivedInETH,
                    userAddress,
                    merchantAddress,
                    inserted_at,
                    blockNumber
                )
                io.emit("finalize_payment", {
                    status: "success",
                    userAddress,
                    merchantAddress,
                    id,
                })
                let addressIndex = merchantAddressDB.findIndex(
                    ({ address }) => address === merchantAddress
                )
                merchantAddressDB[addressIndex].status = "ready"
            }
        })
        // Remove cpmpleted payment
        for (let i = 0; i < completedPaymentId.length; i++) {
            let index = pendingPayment.findIndex(({ id }) => id === completedPaymentId[i])
            pendingPayment.splice(index, 1)
        }
    }

    // Ethereum Monitor will run every 8 secondes -> 1 fastest block  is 12 seconds, 1 block can be 24,26,48 seconds
    // but rarely impossible to less than 12 seconds in this case so I select 8 seconds bbecause it not much frequent as 6 seconds
    // and still can track every block at least once
    intervalID = setInterval(blockMonitor, 8000)
}

export default ethereumMonitor
