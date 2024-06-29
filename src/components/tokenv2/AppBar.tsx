// import {FC, useEffect, useState} from "react";
// import styles from "../styles/Home.module.css";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import Link from "next/link";
//
// export const AppBar: FC = () => {
//
//     const [isDarkTheme, setIsDarkTheme] = useState(false);
//
//     useEffect(() => {
//         document.body.classList.toggle('dark-theme', isDarkTheme);
//     }, [isDarkTheme]);
//
//     return (
//       <div className={styles.AppHeader}>
//           <span>CryptoAirlines Token Creation Form</span>
//           <button onClick={() => setIsDarkTheme(!isDarkTheme)}>Toggle Theme</button>
//
//           <Link href="/CreateMint" className={styles.navLinks}>
//               Create Mint
//           </Link>
//           <Link href="/SetTransferFeeForm" className={styles.navLinks}>
//               Change Transfer Fee
//           </Link>
//           <Link href="/TransferWithZeroFee" className={styles.navLinks}>
//               Transfer With No Fee
//           </Link>
//           <WalletMultiButton/>
//       </div>
//   );
// };


import { FC, useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

export const AppBar: FC = () => {
    const [isDarkTheme, setIsDarkTheme] = useState(false);

    useEffect(() => {
        if (isDarkTheme) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkTheme]);

    return (
        <div className={styles.AppHeader}>
            <span>CryptoAirlines Token Management Panel</span>
            {/*TODO: Add a button to toggle the theme*/}
            {/*<button onClick={() => setIsDarkTheme(!isDarkTheme)}>Toggle Theme</button>*/}
            {/*<Link href="/CreateMint" className={styles.navLink}>*/}
            {/*    Create Mint*/}
            {/*</Link>*/}
            <Link href="/SetTransferFeeForm" className={styles.navLink}>
                Change Transfer Fee
            </Link>
            {/*<Link href="/TransferWithZeroFee" className={styles.navLink}>*/}
            {/*    Transfer With No Fee*/}
            {/*</Link>*/}
            <Link href="/WithDrawTokenFee" className={styles.navLink}>
                Withdraw Token Fees
            </Link>
            <Link href="/Whitelisting" className={styles.navLink}>
                Whitelisting
            </Link>
            <WalletMultiButton />
        </div>
    );
};
