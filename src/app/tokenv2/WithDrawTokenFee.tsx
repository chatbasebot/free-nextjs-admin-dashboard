import { FC } from 'react';

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createWithdrawWithheldTokensFromAccountsInstruction,
  getTransferFeeAmount,
  TOKEN_2022_PROGRAM_ID,
  unpackAccount,
} from '@solana/spl-token-3';
import {
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import {
  PublicKey,
  Transaction,
} from '@solana/web3.js';

import styles from '../../css/Home.module.css';

const WithDrawTokenFee: FC = () => {

    const {publicKey, sendTransaction} = useWallet();
    const {connection} = useConnection();


    const withdrawTokenFee = async (event: any) => {
        //ayad/////////
        if(!publicKey){return console.log('wallet not connected!')}
        let transactionSignature: string;
        const mintAddress = event.target.mintAddress.value;
        const feeAuth = new PublicKey(event.target.feeAuth.value);
        const mint = new PublicKey(mintAddress);

        const allAccounts = await connection.getProgramAccounts(TOKEN_2022_PROGRAM_ID, {
            commitment: 'confirmed',
            filters: [
                {
                    memcmp: {
                        offset: 0,
                        bytes: mint.toString(),
                    },
                },
            ],
        });

        const accountsToWithdrawFrom: PublicKey[] = [];
        for (const accountInfo of allAccounts) {
            const account = unpackAccount(
                accountInfo.pubkey,
                accountInfo.account,
                TOKEN_2022_PROGRAM_ID
            );
            const transferFeeAmount = getTransferFeeAmount(account);
            if (transferFeeAmount !== null && transferFeeAmount.withheldAmount > BigInt(0)) {
                accountsToWithdrawFrom.push(accountInfo.pubkey);
            }
        }

        const feeVault = await PublicKey.createWithSeed(publicKey, "seed", TOKEN_2022_PROGRAM_ID);
        const feeVaultAccountInstruction = createAssociatedTokenAccountIdempotentInstruction(
            publicKey,
            feeVault,
            publicKey,
            mint,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID);

        const instruction = createWithdrawWithheldTokensFromAccountsInstruction(
            mint,
            publicKey,
            feeAuth,
            [],
            accountsToWithdrawFrom,
            TOKEN_2022_PROGRAM_ID
        );
        const transaction = new Transaction()
            .add(feeVaultAccountInstruction, instruction);

        const {blockhash, lastValidBlockHeight} = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;
        transaction.feePayer = publicKey;
        try {
            transactionSignature = await sendTransaction(transaction, connection);
            console.log("Transaction Signature", transactionSignature);
        } catch (error) {
            console.error("Transaction failed", error);
        }
    }

    return (
        <div>
            {publicKey ? (
                <form onSubmit={withdrawTokenFee} className={styles.form}>
                    <h2>Withdraw Token Fees</h2>
                    <h6>In this section 3dC9gEwhF2kiuuJmQFKdASRe4F8VtENRdQsurPQ1G7mS wallet address has to be used</h6>
                    <label htmlFor="owner">Token Account Owner:</label>
                    <input
                        id="owner"
                        type="text"
                        className={styles.formField}
                        placeholder="Enter Token Account Owner PublicKey (Same as Wallet PublicKey)"
                        required
                    />
                    <label htmlFor="feeAuth">Token Account Owner:</label>
                    <input
                        id="feeAuth"
                        type="text"
                        className={styles.formField}
                        placeholder="Enter Token Fee Authority PublicKey"
                        required
                    />
                    <label htmlFor="mintAddress">Fee Account Owner:</label>
                    <input
                        id="mintAddress"
                        type="text"
                        className={styles.formField}
                        placeholder="Enter Fee Account Owner PublicKey (Can be different from Wallet PublicKey)"
                        required
                    />
                    <button type="submit" className={styles.formButton}>
                        Withdraw Token Fees
                    </button>
                </form>
            ) : (
                <div className={styles.errorMessage}>Please connect your wallet to continue</div>
            )}
        </div>
    );

};

export default WithDrawTokenFee;
