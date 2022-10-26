import axios from "axios"
import { ethers } from "ethers"
import { TransactionResponse } from "@ethersproject/abstract-provider"
import { Server } from "socket.io"
import { MerchantAddress } from "../../database/merchantAddresses"
import { SERVER_ENDPOINT } from "../config"
import { PendingPayment } from "../types/Payment"
import {
    logFailMessage,
    logNoneUserTransaction,
    logSuccessMessage,
    logUserTransaction,
} from "./helper"

const checkPendingPayment = (pendingPayment: PendingPayment[]): Boolean => {
    if (pendingPayment.length === 0) {
        return false
    }
    return true
}

const getLatestBlockNumber = async () => {
    let latestBlockResponse = await axios.get(
        `${SERVER_ENDPOINT}/api/crypto/payments/infura/getLatestBlockNumber`
    )
    return parseInt(latestBlockResponse.data.result, 16)
}

const checkExpiredPayment = (
    io: Server,
    pendingPayment: PendingPayment[],
    blockNumber: number,
    userAddress: string,
    merchantAddressDB: MerchantAddress[]
): string[] => {
    let expiredPaymentId: string[] = []
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
    return expiredPaymentId
}

const removeExpiredPaymentId = (pendingPayment: PendingPayment[], expiredPaymentId: string[]) => {
    for (let i = 0; i < expiredPaymentId.length; i++) {
        let index = pendingPayment.findIndex(({ id }) => id === expiredPaymentId[i])
        pendingPayment.splice(index, 1)
    }
}

const getUserTransaction = async (
    infuraProvider: ethers.providers.UrlJsonRpcProvider,
    blockNumber: number,
    userAddress: string
) => {
    // 6.Get block transaction with ethers.js that we connect with provider that is Infura
    let blockWithTransactions = await infuraProvider.getBlockWithTransactions(blockNumber)
    let blockTransactions = blockWithTransactions.transactions

    // 7.Filter transaction to get only the user transaction which match userAddress and data -> '0x' that mean normal transfer ETH
    let userTransaction: TransactionResponse[] = blockTransactions.filter(
        ({ from, data }) => from === userAddress && data === "0x"
    )

    return userTransaction
}

const updatePaymentWithUserTransaction = (
    io: Server,
    pendingPayment: PendingPayment[],
    userTransaction: TransactionResponse[],
    blockNumber: number,
    userAddress: string
) => {
    if (userTransaction.length > 0) {
        userTransaction.forEach(({ data, from, to, value }) => {
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
}

const checkCompletedPayment = (
    io: Server,
    pendingPayment: PendingPayment[],
    blockNumber: number,
    userAddress: string,
    merchantAddressDB: MerchantAddress[]
) => {
    let completedPaymentId: string[] = []
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
    return completedPaymentId
}

const removeCompletedPayment = (pendingPayment: PendingPayment[], completedPaymentId: string[]) => {
    for (let i = 0; i < completedPaymentId.length; i++) {
        let index = pendingPayment.findIndex(({ id }) => id === completedPaymentId[i])
        pendingPayment.splice(index, 1)
    }
}

export {
    checkPendingPayment,
    getLatestBlockNumber,
    checkExpiredPayment as checkExpieredPayment,
    removeExpiredPaymentId,
    getUserTransaction,
    updatePaymentWithUserTransaction,
    checkCompletedPayment,
    removeCompletedPayment,
}
