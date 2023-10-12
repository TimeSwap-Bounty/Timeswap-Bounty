import Image from 'next/image'
import { Inter } from 'next/font/google'
import { IPaymaster, BiconomyPaymaster } from '@biconomy/paymaster'
import { IBundler, Bundler } from '@biconomy/bundler'
import { BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account"
import { Wallet, providers, ethers } from 'ethers';
import { ChainId } from "@biconomy/core-types"
import { ParticleAuthModule, ParticleProvider } from "@biconomy/particle-auth";
import { ECDSAOwnershipValidationModule, DEFAULT_ECDSA_OWNERSHIP_MODULE } from '@biconomy/modules'



const inter = Inter({ subsets: ['latin'] })
const particle = new ParticleAuthModule.ParticleNetwork({
  projectId: "ac2a7faa-bb47-456e-8ea3-c8f0638ae770",
  clientKey: "cIpudnswFwtmKwYTV3QQbooddnk7Xp6QisFpTRpp",
  appId: "8473b4a1-7368-411d-a5ed-b9e29a139a7f",
  wallet: {
    displayWalletEntry: true,
    defaultWalletEntryPosition: ParticleAuthModule.WalletEntryPosition.BR,
  },
});


const bundler: IBundler = new Bundler({
  // get from biconomy dashboard https://dashboard.biconomy.io/
  bundlerUrl: 'https://bundler.biconomy.io/api/v2/{chain-id-here}/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44',     
  chainId: ChainId.GOERLI,// or any supported chain of your choice
  entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
})


const paymaster: IPaymaster = new BiconomyPaymaster({
// get from biconomy dashboard https://dashboard.biconomy.io/
paymasterUrl: 'https://paymaster.biconomy.io/api/v1/5/NgKf3XZAu.d4708e98-860c-42d1-9c5b-e6249d2bd2c0' 
})


const connect = async () => {
  try {
    const userInfo = await particle.auth.login();
    console.log("Logged in user:", userInfo);
    const particleProvider = new ParticleProvider(particle.auth);
    const web3Provider = new ethers.providers.Web3Provider(
      particleProvider,
      "any"
    );

    // eslint-disable-next-line @next/next/no-assign-module-variable
    const module = await ECDSAOwnershipValidationModule.create({
    signer: web3Provider.getSigner(),
    moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE
    })

    let biconomySmartAccount = await BiconomySmartAccountV2.create({
      chainId: ChainId.GOERLI,
      bundler: bundler, 
      paymaster: paymaster,
      entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
      defaultValidationModule: module,
      activeValidationModule: module
    })

    const address = await biconomySmartAccount.getAccountAddress()
    console.log(address);
  } catch (error) {
    console.error(error);
  }
};


export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <button onClick={connect}>create Account</button>
    </main>
  )
}
