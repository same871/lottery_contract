const { ethers, network } = require("hardhat")
fs = require("fs")

const FRONT_END_ADDRESSES_FILE =
    "../nextJs.Lottery_frentend/lottery_frontend/constants/contractAddress.json"
const FRONT_END_ABI_FILE = "../nextJs.Lottery_frentend/lottery_frontend/constants/abi.json"

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating front end...")
        updateContractAddresses()
        updateAbi()
    }
}

async function updateContractAddresses() {
    const lottery = await ethers.getContract("Lottery")
    const chainId = network.config.chainId.toString()
    const contractAddresses = JSON.parse(fs.readFileSync(FRONT_END_ADDRESSES_FILE, "utf8"))
    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId].includes(lottery.address)) {
            contractAddresses[chainId].push(lottery.address)
        }
    } else {
        contractAddresses[chainId] = [lottery.address]
    }

    fs.writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(contractAddresses))
}

async function updateAbi() {
    const lottery = await ethers.getContract("Lottery")
    fs.writeFileSync(FRONT_END_ABI_FILE, lottery.interface.format(ethers.utils.FormatTypes.json))
}

module.exports.tags = ["all", "frontend"]
