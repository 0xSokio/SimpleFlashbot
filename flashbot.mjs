import { Wallet, BigNumber, ethers, providers } from 'ethers';
import { FlashbotsBundleProvider, FlashbotsBundleResolution } from '@flashbots/ethers-provider-bundle';
import dotenv from 'dotenv';
dotenv.config();

const provider = new providers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/dvy8_Cs2vvTAwJY04UEPH0-m3Kar32GY');

const authSigner = new Wallet(process.env.PRIVATE_KEY, provider);

const start = async () => {
    const flashbotsProvider = await FlashbotsBundleProvider.create(provider, authSigner, 'https://relay-sepolia.flashbots.net');

    const gwei = BigNumber.from(10).pow(9);
    const LEGACY_GAS_PRICE = gwei.mul(13);
    const PRIORITY_FEE = gwei.mul(100);
    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber);
    const maxBaseFeeInFutureBlock = FlashbotsBundleProvider.getMaxBaseFeeInFutureBlock(block.baseFeePerGas, 6);
    const amountInEther = '0.001';

    const signedTransactions = await flashbotsProvider.signBundle([
        {
            signer: authSigner,
            transaction: {
                to: '0x2c3fF32c7F6C7f83fFd13C76Cfef67C0E9811240',
                type: 2,
                maxFeePerGas: PRIORITY_FEE.add(maxBaseFeeInFutureBlock),
                maxPriorityFeePerGas: PRIORITY_FEE,
                data: '0x',
                chainId: 11155111,
                value: ethers.utils.parseEther(amountInEther),
            },
        },
        {
            signer: authSigner,
            transaction: {
                to: '0x2c3fF32c7F6C7f83fFd13C76Cfef67C0E9811240',
                gasPrice: LEGACY_GAS_PRICE,
                data: '0x',
                value: ethers.utils.parseEther(amountInEther),
            },
        },
    ]);

    console.log(new Date());
    console.log('Starting to run the simulation...');
    const simulation = await flashbotsProvider.simulate(signedTransactions, blockNumber + 1);
    console.log(new Date());
}

start();