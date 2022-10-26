import server from "../index"
import request from "supertest"
import Payment from "../../database/types/Payment"
import { ethers } from "ethers"
import { PendingPayment } from "../types/Payment"
import { pendingPayment } from "../../database/payments"

describe("test root server endpoint", () => {
    test("should send Hashpays MVP Server", async () => {
        try {
            let response = await request(server).get(`/`)
            expect(response.statusCode).toBe(200)
            expect(response.text).toBe("Hashpays MVP Server")
        } catch (error) {
            console.log(error)
        }
    })
})

describe("test POST : api/crypto/payments/createPayments", () => {
    let endpoint: string = "/api/crypto/payments"

    test("should post success so get status 201 and get payment object", async () => {
        let paymentData = JSON.stringify({
            userAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            network: "ETH",
            currency: "ETH",
            amount: 0.05,
        })
        let response = await request(server).post(`${endpoint}/createPayment`).send(paymentData)
        let { id, status, merchantAddress, inserted_at, expired_at } = JSON.parse(response.text)
        expect(response.statusCode).toBe(201)
        expect(status).toEqual("pending")
        expect(merchantAddress).toMatch(/0x/)
        expect(expired_at).toBeGreaterThan(inserted_at)
    })
})

describe("test GET : api/crypto/payments/allPayments", () => {
    let endpoint: string = "/api/crypto/payments"

    beforeEach(async () => {
        let paymentData = JSON.stringify({
            userAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            network: "ETH",
            currency: "ETH",
            amount: 0.05,
        })
        await request(server).post(`${endpoint}/createPayment`).send(paymentData)
    })

    test("should get status 200 and payments object", async () => {
        try {
            let response = await request(server).get(`${endpoint}/allPayments`)
            let payments = JSON.parse(response.text).data
            expect(response.statusCode).toBe(200)
            payments.forEach((payment: Payment) => {
                let { id, status, merchantAddress, inserted_at, expired_at } = payment
                expect(status).toEqual("pending")
                expect(merchantAddress).toMatch(/0x/)
                expect(expired_at).toBeGreaterThan(inserted_at)
            })
        } catch (error) {
            console.log(error)
        }
    })
})

describe("test GET : api/crypto/payments/infura/getLatestBlockNumber", () => {
    let endpoint: string = "/api/crypto/payments"

    test("should get status 200 and block response object", async () => {
        try {
            let response = await request(server).get(`${endpoint}/infura/getLatestBlockNumber`)
            let { jsonrpc, id, result } = JSON.parse(response.text)
            expect(response.statusCode).toBe(200)
            expect(jsonrpc).toBe("2.0")
            expect(id).toBe(1)
            expect(result).toMatch(/0x/)
        } catch (error) {
            console.log(error)
        }
    })
})
