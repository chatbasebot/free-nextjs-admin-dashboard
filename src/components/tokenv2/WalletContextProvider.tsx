import {FC, ReactNode} from "react";
import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import {WalletModalProvider} from "@solana/wallet-adapter-react-ui";
import * as web3 from "@solana/web3.js";
import {GlowWalletAdapter, PhantomWalletAdapter} from "@solana/wallet-adapter-wallets";
require("@solana/wallet-adapter-react-ui/styles.css");

const WalletContextProvider: FC<{ children: ReactNode }> = ({children}) => {
    const wallets = [new PhantomWalletAdapter(),
        new GlowWalletAdapter()];

    // const endpoint = new web3.Connection("https://palpable-wiser-morning.solana-mainnet.quiknode.pro/458e1acd4eac134013635891edb37ca0076383af/");
    // const strEnd = endpoint.rpcEndpoint
    const strEnd = web3.clusterApiUrl("testnet");
    return (

        <ConnectionProvider endpoint={strEnd} >
            <WalletProvider wallets={wallets}>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default WalletContextProvider;
