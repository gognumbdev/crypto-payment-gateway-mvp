import { BigNumber } from "ethers"

interface Transaction {
    accessList: any
    blockHash: string
    blockNumber: number
    chainId: number
    confirmations: number
    creates: any
    data: string
    from: string
    gasLimit: BigNumber
    gasPrice: BigNumber
    hash: string
    nonce: number
    r: string
    s: string
    to: string
    transactionIndex: number
    type: number
    v: number
    value: BigNumber
    wait: any
}

export default Transaction
