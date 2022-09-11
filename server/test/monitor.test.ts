import { ethers } from "ethers"
import {
    checkPendingPayment,
    getUserTransaction,
    removeCompletedPayment,
    removeExpiredPaymentId,
} from "../monitor/monitoringFunction"
import { PendingPayment } from "../types/Payment"
import { ETHEREUM_NETWORK, INFURA_API_KEY } from "../config"

describe("test checkPendingPayment function", () => {
    let mockZeroPendingPayment: PendingPayment[] = []
    let mockPendingPayment: PendingPayment[] = []
    beforeEach(() => {
        mockPendingPayment = [
            {
                id: "4538c1fa-93ff-408d-958f-dd05399dbd0e",
                status: "pending",
                payment_amount: "0.05",
                payment_currency: "ETH",
                userAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
                merchantAddress: "0x518707e145604eA17eA6fd319Fa65DCD2E96Eb34",
                network: "ETH",
                inserted_at: 12967297,
                expired_at: 12967322,
                received: ethers.BigNumber.from("0"),
            },
            {
                id: "013a2a29-9ba6-414d-b049-1a67ca3e41db",
                status: "pending",
                payment_amount: "0.05",
                payment_currency: "ETH",
                userAddress: "0x5593572e312C4F8Fc2fe924907624B39D1d6B65c",
                merchantAddress: "0xC61D4ee4B910E52E04512bbf7CcEb0Ab48072227",
                network: "ETH",
                inserted_at: 12967297,
                expired_at: 12967322,
                received: ethers.BigNumber.from("0"),
            },
        ]
    })

    test("should return false", () => {
        let remainingPendingPayment = checkPendingPayment(mockZeroPendingPayment)
        expect(remainingPendingPayment).toBe(false)
    })

    test("should return true", () => {
        let remainingPendingPayment = checkPendingPayment(mockPendingPayment)
        expect(remainingPendingPayment).toBe(true)
    })
})

describe("test removeExpiredPaymentId function", () => {
    let mockPendingPayment: PendingPayment[]

    beforeEach(() => {
        mockPendingPayment = [
            {
                id: "4538c1fa-93ff-408d-958f-dd05399dbd0e",
                status: "pending",
                payment_amount: "0.05",
                payment_currency: "ETH",
                userAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
                merchantAddress: "0x518707e145604eA17eA6fd319Fa65DCD2E96Eb34",
                network: "ETH",
                inserted_at: 12967297,
                expired_at: 12967322,
                received: ethers.BigNumber.from("0"),
            },
            {
                id: "013a2a29-9ba6-414d-b049-1a67ca3e41db",
                status: "pending",
                payment_amount: "0.05",
                payment_currency: "ETH",
                userAddress: "0x5593572e312C4F8Fc2fe924907624B39D1d6B65c",
                merchantAddress: "0xC61D4ee4B910E52E04512bbf7CcEb0Ab48072227",
                network: "ETH",
                inserted_at: 12967300,
                expired_at: 12967325,
                received: ethers.BigNumber.from("0"),
            },
        ]
    })

    test("should remove expired payment", () => {
        let expiredPaymentId = ["4538c1fa-93ff-408d-958f-dd05399dbd0e"]
        try {
            removeExpiredPaymentId(mockPendingPayment, expiredPaymentId)
            expect(mockPendingPayment.length).toBe(1)
            expect(mockPendingPayment[0].id).not.toBe("4538c1fa-93ff-408d-958f-dd05399dbd0e")
        } catch (error) {
            console.log(error)
        }
    })

    test("should not remove any payment", () => {
        let expiredPaymentId: string[] = []
        try {
            removeExpiredPaymentId(mockPendingPayment, expiredPaymentId)
            expect(mockPendingPayment.length).toBe(2)
        } catch (error) {
            console.log(error)
        }
    })
})

describe("test getUserTransaction function", () => {
    const infuraProvider = new ethers.providers.InfuraProvider(ETHEREUM_NETWORK, INFURA_API_KEY)
    let userAddress: string = "0x5593572e312C4F8Fc2fe924907624B39D1d6B65c"
    let blockNumber: number

    test("should get user transaction", async () => {
        blockNumber = 12967812
        try {
            let userTransaction = await getUserTransaction(infuraProvider, blockNumber, userAddress)
            let transaction = userTransaction[0]
            expect(transaction.from).toEqual(userAddress)
            expect(transaction.data).toEqual("0x")
            expect(transaction.blockNumber).toEqual(blockNumber)
        } catch (error) {
            console.log(error)
        }
    })

    test("should not get user transaction", async () => {
        blockNumber = 12967822
        try {
            let userTransaction = await getUserTransaction(infuraProvider, blockNumber, userAddress)
            expect(userTransaction.length).toEqual(0)
        } catch (error) {
            console.log(error)
        }
    })
})

describe("test removeCompletedPayment function", () => {
    let mockPendingPayment: PendingPayment[]

    beforeEach(() => {
        mockPendingPayment = [
            {
                id: "4538c1fa-93ff-408d-958f-dd05399dbd0e",
                status: "pending",
                payment_amount: "0.05",
                payment_currency: "ETH",
                userAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
                merchantAddress: "0x518707e145604eA17eA6fd319Fa65DCD2E96Eb34",
                network: "ETH",
                inserted_at: 12967297,
                expired_at: 12967322,
                received: ethers.BigNumber.from("0"),
            },
            {
                id: "013a2a29-9ba6-414d-b049-1a67ca3e41db",
                status: "pending",
                payment_amount: "0.05",
                payment_currency: "ETH",
                userAddress: "0x5593572e312C4F8Fc2fe924907624B39D1d6B65c",
                merchantAddress: "0xC61D4ee4B910E52E04512bbf7CcEb0Ab48072227",
                network: "ETH",
                inserted_at: 12967300,
                expired_at: 12967325,
                received: ethers.BigNumber.from("0"),
            },
        ]
    })

    test("should remove completed payment", () => {
        let completedPaymentId = ["4538c1fa-93ff-408d-958f-dd05399dbd0e"]
        try {
            removeCompletedPayment(mockPendingPayment, completedPaymentId)
            expect(mockPendingPayment.length).toBe(1)
            expect(mockPendingPayment[0].id).not.toBe("4538c1fa-93ff-408d-958f-dd05399dbd0e")
        } catch (error) {
            console.log(error)
        }
    })

    test("should not remove any payment", () => {
        let completedPaymentId: string[] = []
        try {
            removeCompletedPayment(mockPendingPayment, completedPaymentId)
            expect(mockPendingPayment.length).toBe(2)
        } catch (error) {
            console.log(error)
        }
    })
})
