import { PublicKey, TransactionInstruction, AccountMeta, Signer, Transaction } from "@solana/web3.js";
import { struct, u16, u8 } from "@solana/buffer-layout";
import { u64 } from "@solana/buffer-layout-utils";
import {createTransferCheckedInstruction, TOKEN_2022_PROGRAM_ID} from "@solana/spl-token"; // Updated for clarity
import React, { FC, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import styles from "../styles/Home.module.css";
import {createSetTransferFeeInstructionInstruction} from "./SetTransferFeeForm";



const TransferWithZeroFee: FC = () => {
    const [txSig, setTxSig] = useState("");
    const { publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();

    async function transferTokensWithZeroFee(
        recipientPublicKey: PublicKey,
        mintAddress: PublicKey,
        amount: number,
    ) {
        let transactionSignature: string;

        const transferInstruction = createTransferCheckedInstruction(
            publicKey, // Source account
            mintAddress,
            recipientPublicKey, // Destination account
            publicKey, // Owner of the source account
            amount,
            9,
            [], // No multiSignatures
            TOKEN_2022_PROGRAM_ID
        );

        const transaction = new Transaction().add(transferInstruction);
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;
        transaction.feePayer = publicKey;

        // Sign and send the transaction
        try {
            const serializedTransaction = transaction.serialize({
                requireAllSignatures: false,
            });
            const base64 = serializedTransaction.toString("base64");

            console.log("TEST TX", base64);

            transactionSignature = await sendTransaction(
                transaction,
                connection
            );

            postMessage(
                `LET'S GOOO:"https://solana.fm/tx/${transactionSignature}?cluster=testnet-solana`
            );

        }
        catch (error) {
            console.error("Transaction failed", error);
        }
    }
    // Helper function to change the mint fee
    const changeMintFee = async (mintAddress: string, feeBasisPoints: number, maximumFee: bigint) => {
        if (!publicKey) return; // Ensure there's a public key

        let transactionSignature: string;
        const mintPubkey = new PublicKey(mintAddress);
        const tx = createSetTransferFeeInstructionInstruction(
            mintPubkey,
            publicKey, // Assuming the wallet's publicKey is the authority
            feeBasisPoints,
            maximumFee,
            [], // No multiSigners
            TOKEN_2022_PROGRAM_ID
        );
        const transaction = new Transaction().add(tx);
        const { blockhash, lastValidBlockHeight } =    await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;
        transaction.feePayer = publicKey;

        try {
            const serializedTransaction = transaction.serialize({
                requireAllSignatures: false,
            });
            const base64 = serializedTransaction.toString("base64");
            console.log("TEST TX", base64);
            transactionSignature = await sendTransaction(
                transaction,
                connection
            );
            postMessage(
                `LET'S GOOO:"https://solana.fm/tx/${transactionSignature}?cluster=testnet-solana`
            );
        }
        catch (error) {
            console.error("Transaction failed", error);
        }
        return transactionSignature;
    };

    // New function to adjust fees around a transaction
    const handleTransactionWithAdjustedFees = async (event: any) => {
        event.preventDefault();
        const mintAddress = event.target.mintAddress.value;
        const newFeeBasisPoints = 0; // Set fee to 0
        const originalFeeBasisPoints = parseInt(event.target.originalFee.value); // Assuming input for original fee
        const maximumFee = BigInt(event.target.maximumFee.value); // Assuming input for maximum fee

        try {
            // Set transfer fee to 0
            await changeMintFee(mintAddress, newFeeBasisPoints, maximumFee);

            // Place your transaction logic here
            // For example, send a specific transaction with the waived fee
            // Ensure the transaction is processed before proceeding
            const recepient = new PublicKey(event.target.receiver.value);
            const amount = event.target.amount.value;
            transferTokensWithZeroFee(recepient, mintAddress, amount)

            // Reset the fee to its original value
            await changeMintFee(mintAddress, originalFeeBasisPoints, maximumFee);

            setTxSig("Transaction completed with adjusted fees.");
        } catch (error) {
            console.error("Failed to adjust fees or send transaction", error);
            setTxSig("Failed to process transaction.");
        }
    };

    return (
        <div>
            {publicKey ? (
                <form onSubmit={handleTransactionWithAdjustedFees} className={styles.form}>
                    <label htmlFor="mintAddress">Mint Address:</label>
                    <input
                        id="mintAddress"
                        type="text"
                        className={styles.formField}
                        placeholder="Enter Token Mint Address"
                        required
                    />
                    <label htmlFor="originalFee">Original Transfer Fee Basis Points:</label>
                    <input
                        id="originalFee"
                        type="number"
                        className={styles.formField}
                        placeholder="Enter Original Fee Basis Points"
                        required
                    />
                    <label htmlFor="amount">Amount:</label>
                    <input
                        id="amount"
                        type="number"
                        className={styles.formField}
                        placeholder={"Enter Amount"}
                        required
                    />
                    <label htmlFor="maximumFee">Maximum Fee:</label>
                    <input
                        id="maximumFee"
                        type="text"
                        className={styles.formField}
                        placeholder="Enter Maximum Fee"
                        required
                    />
                    <label htmlFor="receiver">Recipient Address:</label>
                    <input
                        id="receiver"
                        type="text"
                        className={styles.formField}
                        placeholder="Enter Receiver Address"
                        required
                    />
                    <button type="submit" className={styles.formButton}>
                        Process Transaction with Adjusted Fees
                    </button>
                </form>
            ) : (
                <span>Please Connect Your Wallet</span>
            )}
            {txSig && <div>Transaction Signature: {txSig}</div>}
        </div>
    );
};

export default TransferWithZeroFee;
