// The reaseon why I make these value as a config file instead of .env file because
// I want to make this MVP easy for Hashpays team to test it without creating new Infura API Key
const ETHEREUM_NETWORK = "ropsten"
const INFURA_API_KEY = "3f061812d4914dd2ad74f256a7db557e"
const SERVER_ENDPOINT = "http://localhost:8000"

export { ETHEREUM_NETWORK, INFURA_API_KEY, SERVER_ENDPOINT }
