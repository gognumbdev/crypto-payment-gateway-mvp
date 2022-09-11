import { v4 as uuidv4 } from "uuid"
import { Request, Response, Router } from "express"
import { ETHEREUM_NETWORK, INFURA_API_KEY } from "../config"
import Payment from "../../database/types/Payment"
import payments, { pendingPayment } from "../../database/payments"
import merchantAddressesDB, { MerchantAddress } from "../../database/merchantAddresses"

const axios = require("axios")
const express = require("express")

const router: Router = express.Router()

// Handling request using router
router.get("/allPayments", (req: Request, res: Response) => {
    // This endpoint respond with all payments that create since the server start
    try {
        console.log("Get all payments \n")
        res.status(200).json({
            data: payments,
        })
    } catch (error) {
        console.log(error)
    }
})

router.get("/pendingPayments", (req: Request, res: Response) => {
    // This endpoint respond with all payments that still pending state
    try {
        console.log("Get all pending payments \n")
        res.status(200).json({
            data: pendingPayment,
        })
    } catch (error) {
        console.log(error)
    }
})

router.post("/createPayment", async (req: Request, res: Response) => {
    try {
        const { userAddress, network, currency, amount } = req.body

        let readyMerchantAddress: MerchantAddress | undefined
        let count = 0

        // Get the merchant address that has 'ready' status
        merchantAddressesDB.forEach((address) => {
            if (address.status === "ready" && count < 1) {
                readyMerchantAddress = address
                address.status = "pending"
                count += 1
            }
        })

        if (readyMerchantAddress === undefined) {
            throw "Request fail due to no ready merchant address"
        }

        // Get block number from Infura API by request to our server
        let latestBlockResponse = await axios.get(
            "http://localhost:8000/api/crypto/payments/infura/getLatestBlockNumber"
        )
        let latestBlockNumber = parseInt(latestBlockResponse.data.result, 16)

        // inserted_at is the block number when we create payment request,expired_at is the last block
        // Ethereum Ropsten block time average is 12 secs per 1 block -> 1 minute has 5 blocks
        // 25 blocks is about 5 minutes in best case

        let newPayment: Payment = {
            id: uuidv4(),
            status: "pending",
            payment_amount: amount,
            payment_currency: currency,
            userAddress,
            merchantAddress: readyMerchantAddress.address,
            network,
            inserted_at: latestBlockNumber,
            expired_at: latestBlockNumber + 25,
        }

        payments.push(newPayment)
        res.status(201).json(newPayment)
    } catch (error) {
        throw error
    }
})

// Handling request related to Infura API Key
router.get("/infura/getLatestBlockNumber", async (req: Request, res: Response) => {
    try {
        let requestData = JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_blockNumber",
            params: [],
            id: 1,
        })
        let requestConfig = { headers: { "Content-Type": "application/json" } }
        let response = await axios.post(
            `https://${ETHEREUM_NETWORK}.infura.io/v3/${INFURA_API_KEY}`,
            requestData,
            requestConfig
        )
        res.status(200).json(response.data)
    } catch (error) {
        console.log(error)
    }
})

module.exports = router
