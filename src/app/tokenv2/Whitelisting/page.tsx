import React, {
  ChangeEvent,
  FC,
  useState,
} from 'react';

import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

import styles from '../../../css/Home.module.css';
import {
  add_account_to_whitelist,
  init_pda,
  transfer_auth,
  transfer_tokens_whitelist,
} from '../../../services/service';

//1 kere kullanicak - initialize whitelist
// whitelist add account
const Whitelisting: FC = () => {
    const [destination, setDestination] = useState('');
    const wallet = useWallet();
    const publicKey = wallet.publicKey;

    const destinationaddressInput = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setDestination(event.target.value);
    };

    const [amount, setAmount] = useState<number>(0);

    // Event handler for the input change
    const handleAmountInput = (event: ChangeEvent<HTMLInputElement>) => {
        // Convert the input value to a number and update the state
        setAmount(Number(event.target.value));
    };
    const handleOnClick = async () => {
        const dest = new PublicKey(destination);
        await add_account_to_whitelist(dest, wallet).then((response) => {
            console.log(response);
        });

    }
    const transferToken = async () => {
        //ayad
        if(!wallet.publicKey){return console.log('wallet not conected!')}
        init_pda(wallet.publicKey, wallet).then((response) => {
            console.log(response);
        });
        transfer_auth(wallet).then((response) => {
            console.log(response);
        });
        await transfer_tokens_whitelist(amount, wallet, destination).then((response) => {
            console.log(response);
        });

    }


    return (
        <div>
            {publicKey ? (
                <form className={styles.form}>
                    <label htmlFor="destination">Destination Address:</label>
                    <input
                        type="text"
                        placeholder="Destination Address"
                        value={destination}
                        className={styles.formField}
                        required
                        onChange={destinationaddressInput}
                    />
                    <label htmlFor="amount">Amount:</label>
                    <input
                        type="number"
                        className={styles.formField}
                        placeholder="enter amount "
                        value={amount}
                        onChange={handleAmountInput}
                    />
                    <button onClick={handleOnClick} type="submit" className={styles.formButton}>Whiteliste Ekle</button>
                    <button onClick={transferToken} type="submit" className={styles.formButton}>Transfer token</button>
                </form>
            ) : (
                <div className={styles.errorMessage}>Please connect your wallet to continue</div>
            )}
        </div>

    );
};

export default Whitelisting;
