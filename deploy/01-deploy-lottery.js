const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("5")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let vrfCoodinatorV2Address, subscriptionId

    if (developmentChains.includes(network.name)) {
        const vrfCoodinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoodinatorV2Address = vrfCoodinatorV2Mock.address
        const transactionResponse = await vrfCoodinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait(1)
        subscriptionId = transactionReceipt.events[0].args.subId
        // Fund the subscription
        await vrfCoodinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
        console.log("Finished the smart contract type here")
    } else {
        vrfCoodinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }

    const entranceFee = networkConfig[chainId]["entranceFee"]
    const gasLane = networkConfig[chainId]["gasLane"]
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    const interval = networkConfig[chainId]["interval"]

    const args = [
        vrfCoodinatorV2Address,
        entranceFee,
        gasLane,
        subscriptionId,
        callbackGasLimit,
        interval,
    ]
    console.log("Deploying the Lottery")
    const lottery = await deploy("Lottery", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(lottery.address, args)
    }
    log("______________________________________")
}

module.exports.tags = ["all", "lottery"]
