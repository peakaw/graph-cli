const { withSpinner } = require('./spinner')
const fetch = require('node-fetch')
const immutable = require('immutable')

const loadAbiFromEtherscan = async (ABI, network, address) =>
  await withSpinner(
    `Fetching ABI from Etherscan`,
    `Failed to fetch ABI from Etherscan`,
    `Warnings while fetching ABI from Etherscan`,
    async spinner => {
      const jsonResult = await fetchABI(ABI, network, address)
      return new ABI('Contract', undefined, immutable.fromJS(JSON.parse(jsonResult)))
    },
  )

const fetchABI = async (network, address) => {
  const scanApiUrl = getEtherscanLikeAPIUrl(network);
  let result = await fetch(
    `${scanApiUrl}?module=contract&action=getabi&address=${address}`,
  )
  console.log('result:')
  console.log(result)
  let json = await result.json()

  console.log('json:')
  console.log(json.result)

  // Etherscan returns a JSON object that has a `status`, a `message` and
  // a `result` field. The `status` is '0' in case of errors and '1' in
  // case of success
  if (json.status === '1') {
    return json.result
  } else {
    throw new Error('ABI not found, try loading it from a local file')
  }
}

const loadAbiFromBlockScout = async (ABI, network, address) =>
  await withSpinner(
    `Fetching ABI from BlockScout`,
    `Failed to fetch ABI from BlockScout`,
    `Warnings while fetching ABI from BlockScout`,
    async spinner => {
      let result = await fetch(
        `https://blockscout.com/${
          network.replace('-', '/')
        }/api?module=contract&action=getabi&address=${address}`,
      )
      let json = await result.json()

      // BlockScout returns a JSON object that has a `status`, a `message` and
      // a `result` field. The `status` is '0' in case of errors and '1' in
      // case of success
      if (json.status === '1') {
        return new ABI('Contract', undefined, immutable.fromJS(JSON.parse(json.result)))
      } else {
        throw new Error('ABI not found, try loading it from a local file')
      }
    },
  )

const getEtherscanLikeAPIUrl = (network) => {
  switch (network) {
    case "mainnet": return `https://api.etherscan.io/api`
    case "arbitrum-one": return `https://api.arbiscan.io/api`
    case "bsc": return `https://api.bscscan.com/api`
    case "matic": return `https://api.polygonscan.com/api`
    case "mumbai": return `https://api-testnet.polygonscan.com/api`
    case "aurora": return `https://api.aurorascan.dev/api`
    case "aurora-testnet": return `https://api-testnet.aurorascan.dev/api`
    case "optimism-kovan": return `https://api-kovan-optimistic.etherscan.io/api`
    case "optimism": return `https://api-optimistic.etherscan.io/api`
    case "avalanche": return `https://api.snowtrace.io/api`;
    case "fuji": return `https://api-testnet.snowtrace.io/api`;
    // case "harmony": return `https://api.harmony.one/api`;
    // case "harmony": return `https://api.harmony.one`;
    // case "harmony": return `https://api.s0.t.hmny.io`;
    // case "harmony": return `https://api.s0.t.hmny.io/api`;
    // case "harmony": return `https://harmony-mainnet.chainstacklabs.com`;
    case "harmony": return `https://harmony-mainnet.chainstacklabs.com/api`;
    default: return `https://api-${network}.etherscan.io/api`
  }
}

module.exports = {
  loadAbiFromEtherscan,
  loadAbiFromBlockScout,
  fetchABI,
}
