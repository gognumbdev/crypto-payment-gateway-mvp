import { BigNumber, ethers } from "ethers"

let logUserTransaction = (
    blockNumber: number,
    data: string,
    from: string,
    to: string | undefined,
    value: BigNumber
) => {
    console.log(
        "\x1b[34m",
        `Found user transaction on the block number ${blockNumber} with the data ${data}, user transfer from address ${from} ` +
            `to address ${to} with the transaction value ${ethers.utils.formatUnits(value)} ETH.`
    )
}

let logFailMessage = (
    id: string,
    receivedInETH: string,
    userAddress: string,
    merchantAddress: string,
    payment_amount: string,
    inserted_at: number,
    expired_at: number
) => {
    console.log(
        "\x1b[31m",
        `Fail -> PaymentID:${id} fail with the total transfer amount ${receivedInETH} ETH from userAddress:${userAddress} to merchantAddress:${merchantAddress},` +
            `This fail due to user doesn't transfer ${payment_amount} ETH to merchantAddress in 25 block that start at the block ${inserted_at} until the block ${expired_at} \n`
    )
}

let logSuccessMessage = (
    id: string,
    receivedInETH: string,
    userAddress: string,
    merchantAddress: string,
    inserted_at: number,
    blockNumber: number
) => {
    console.log(
        "\x1b[32m",
        `Success -> PaymentID:${id} success with the transfer amount ${receivedInETH} ETH from userAddress:${userAddress} to merchantAddress:${merchantAddress}` +
            `, Start at the block ${inserted_at} and completed within the block ${blockNumber} \n`
    )
}

let logNoneUserTransaction = (userAddress: string, blockNumber: number) => {
    console.log(
        "\x1b[33m",
        `None of userAddress:${userAddress} transaction in the block ${blockNumber} `
    )
}

let logReportUserTransactionInBlock = (transactionNubmer: number, blockNumber: number) => {
    console.log(
        `On ${
            Date().toString().split(" ")[4]
        }, The block ${blockNumber} has ${transactionNubmer} ` + `user transaction\n`
    )
}

let logStartEthereumMonitor = () => {
    console.log("\x1b[36m", `\n Start Ethereum Ropsten Monitoring on ${Date()} \n`)
}

let logStopEthereumMonitor = () => {
    console.log("\x1b[36m", `Stop Ethereum Ropsten Monitoring on ${Date()} \n`)
}
export {
    logUserTransaction,
    logFailMessage,
    logSuccessMessage,
    logNoneUserTransaction,
    logReportUserTransactionInBlock,
    logStartEthereumMonitor,
    logStopEthereumMonitor,
}
