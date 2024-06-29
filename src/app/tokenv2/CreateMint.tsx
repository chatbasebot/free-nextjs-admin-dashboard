import {
  FC,
  useState,
} from 'react';

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createInitializeTransferFeeConfigInstruction,
  createMintToInstruction,
  createUpdateFieldInstruction,
  ExtensionType,
  getAssociatedTokenAddress,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from '@solana/spl-token-3';
import {
  createInitializeInstruction,
  pack,
  TokenMetadata,
} from '@solana/spl-token-metadata';
import {
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

import styles from '../../css/Home.module.css';

const CreateMintForm: FC = () => {
    const [txSig, setTxSig] = useState("");
    const [mintAddress, setMintAddress] = useState("");
    const {publicKey, sendTransaction} = useWallet();
    const {connection} = useConnection();
    const generateExplorerTxUrl = (txId: string) => `https://explorer.solana.com/tx/${txId}?cluster=testnet`;
    const createMint = async (event: any) => {

        event.preventDefault();
        if (!connection || !publicKey) {
            console.error("Connection or publicKey is missing");
            return;
        }

        const payer = publicKey;
        const mintKeypair = Keypair.generate();
        // Address for Mint Account
        const mint = mintKeypair.publicKey;

        // Transaction signature returned from sent transaction
        let transactionSignature: string;

        // Authority that can mint new tokens
        const mintAuthority = publicKey;
        const decimals = 9;

        // METADATA POINTER STUFF
        const updateFromUser = new PublicKey(event.target.owner.value);
        // const metaData: TokenMetadata = {
        //     updateAuthority: updateFromUser,
        //     mint: mint,
        //     name: "CryptoAirlines",
        //     symbol: "CAIR",
        //     uri: "https://raw.githubusercontent.com/cair-cryptoairlines/cair_token/main/cair_token_production_uri.json",
        //     //TODO: Change additional Metadata
        //     additionalMetadata: [
        //         ["website","https://cryptoairlines.foundation/"],
        //         ["twitter","https://x.com/_CryptoAirlines?t=iMBgvvBPHJP1H7-zfZZQRA&s=08"],
        //         ["telegram","https://t.me/cryptoairlineskb"]
        //     ]
        // };
        const metaData: TokenMetadata = {
            updateAuthority: updateFromUser,
            mint: mint,
            name: "aleyna",
            symbol: "Aly",
            uri: "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/DeveloperPortal/metadata.json",
            additionalMetadata: [
                ["website","x"],
                ["twitter","x"],
                ["telegram","x"]
            ]
        };


        const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
        const metadataLen = pack(metaData).length;
        const transferFeeConfigAuthority = new PublicKey(event.target.fee.value);
        const withdrawWithheldAuthority = new PublicKey(event.target.fee.value);
        const feeBasisPoints = 300;
        const maxFee = BigInt(100);
        const mintLen = getMintLen([ExtensionType.MetadataPointer, ExtensionType.TransferFeeConfig]);

        // Minimum lamports required for Mint Account
        const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataExtension + metadataLen);

        // Instruction to invoke System Program to create new account
        const createAccountInstruction = SystemProgram.createAccount({
            fromPubkey: payer, // Account that will transfer lamports to created account
            newAccountPubkey: mint, // Address of the account to create
            space: mintLen, // Amount of bytes to allocate to the created account
            lamports, // Amount of lamports transferred to created account
            programId: TOKEN_2022_PROGRAM_ID, // Program assigned as owner of created account
        });
        // Instruction to initialize Metadata Pointer Extension
        const initializeMetadataPointerInstruction =
            createInitializeMetadataPointerInstruction(
                mint, // Mint Account address
                updateFromUser, // Authority that can set the metadata address
                mint, // Account address that holds the metadata
                TOKEN_2022_PROGRAM_ID
            );

        // Instruction to initialize TransferFeeConfig Extension
        const initializeTransferFeeConfig =
            createInitializeTransferFeeConfigInstruction(
                mint, // Mint Account address
                transferFeeConfigAuthority, // Authority to update fees
                withdrawWithheldAuthority, // Authority to withdraw fees
                feeBasisPoints, // Basis points for transfer fee calculation
                maxFee, // Maximum fee per transfer
                TOKEN_2022_PROGRAM_ID // Token Extension Program ID
            );

        // Instruction to initialize Mint Account data
        const initializeMintInstruction = createInitializeMintInstruction(
            mint, // Mint Account Address
            decimals, // Decimals of Mint
            mintAuthority, // Designated Mint Authority
            null, // Optional Freeze Authority
            TOKEN_2022_PROGRAM_ID // Token Extension Program ID
        );

        // Instruction to initialize Metadata Account data
        const initializeMetadataInstruction = createInitializeInstruction({
            programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
            metadata: mint, // Account address that holds the metadata
            updateAuthority: updateFromUser, // Authority that can update the metadata
            mint: mint, // Mint Account address
            mintAuthority: mintAuthority, // Designated Mint Authority
            name: metaData.name,
            symbol: metaData.symbol,
            uri: metaData.uri,
        });

        const updateFieldInstruction = createUpdateFieldInstruction({
            programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
            metadata: mint, // Account address that holds the metadata
            updateAuthority: updateFromUser, // Authority that can update the metadata
            field: metaData.additionalMetadata[0][0], // key
            value: metaData.additionalMetadata[0][1], // value
        });
        const updateFieldInstruction2 = createUpdateFieldInstruction({
            programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
            metadata: mint, // Account address that holds the metadata
            updateAuthority: updateFromUser, // Authority that can update the metadata
            field: metaData.additionalMetadata[1][0], // key
            value: metaData.additionalMetadata[1][1], // value
        });
        const updateFieldInstruction3 = createUpdateFieldInstruction({
            programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
            metadata: mint, // Account address that holds the metadata
            updateAuthority: updateFromUser, // Authority that can update the metadata
            field: metaData.additionalMetadata[2][0], // key
            value: metaData.additionalMetadata[2][1], // value
        });
        const owner = new PublicKey(event.target.owner.value);
        const mintAmount = BigInt(40_000_000 * Math.pow(10, decimals));

        const transaction = new Transaction().add(
            createAccountInstruction,
            initializeMetadataPointerInstruction,
            initializeTransferFeeConfig,
            initializeMintInstruction,
            initializeMetadataInstruction,
            updateFieldInstruction,
            updateFieldInstruction2,
            updateFieldInstruction3
        );

        const { blockhash, lastValidBlockHeight } =    await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;
        transaction.feePayer = publicKey;

        try {
            const serializedTransaction = transaction.serialize({    requireAllSignatures: false,
            });
            const base64 = serializedTransaction.toString("base64");
            console.log("TEST TX", base64);
            transactionSignature = await sendTransaction(
                transaction,
                connection,
                {signers: [mintKeypair]}
            );

            postMessage(
                `LET'S GOOO:"https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
            );
            //ayad/////////
            console.log("Mint Address", mint.toBase58());
            console.log("Transaction Signature", transactionSignature);

        }
        catch (error) {
            console.error("Transaction failed", error);
        }
        // console.log("Mint Address", mint.toBase58());
        // console.log("Transaction Signature", transactionSignature);

        // Create associated token account
        const ATAdress = await getAssociatedTokenAddress(
            mint,
            payer,
            false,
            TOKEN_2022_PROGRAM_ID
        );
        console.log("ATA", ATAdress.toBase58());
        console.log("Mint", mint.toBase58());
        // Instruction to create associated token account
        const ATA = createAssociatedTokenAccountInstruction(
            publicKey,
            ATAdress,
            publicKey,
            mintKeypair.publicKey,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );
        console.log("ATA2", ATA);

        // Instruction to mint tokens to associated token account
        const mintToInstruction = createMintToInstruction(
            mint, // Mint Account address
            ATAdress, // Mint to
            mintAuthority, // Mint Authority address
            mintAmount, // Amount
            [], // Additional signers
            TOKEN_2022_PROGRAM_ID // Token Extension Program ID
        );

        // Transaction to create associated token account and mint tokens
        const transaction2 = new Transaction().add(
            ATA,
            mintToInstruction
        );
        const {
            blockhash: blockhash2,
            lastValidBlockHeight: lastValidBlockHeight2
        } = await connection.getLatestBlockhash();

        transaction2.recentBlockhash = blockhash2;
        transaction2.lastValidBlockHeight = lastValidBlockHeight2;
        transaction2.feePayer = publicKey;

        try {
            const serializedTransaction = transaction2.serialize(
                {
                    requireAllSignatures: false,
                }
            );
            const base64 = serializedTransaction.toString("base64");
            console.log("TEST TX", base64);
            transactionSignature = await sendTransaction(
                transaction2,
                connection,
                {signers: []}
            );

            postMessage(
                `LET'S GOOO:"https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
            );
        }
        catch (error) {
            console.error("Transaction failed", error);
        }
    };

    return (
        <div>
            {publicKey ? (
                <form onSubmit={createMint} className={styles.form}>
                    <h2>Create Mint</h2>
                    <label htmlFor="owner">Token Account Owner:</label>
                    <input
                        id="owner"
                        type="text"
                        className={styles.formField}
                        placeholder="Enter Token Account Owner PublicKey (Same as Wallet PublicKey)"
                        required
                    />
                    <label htmlFor="fee">Fee Account Owner:</label>
                    <input
                        id="fee"
                        type="text"
                        className={styles.formField}
                        placeholder="Enter Fee Account Owner PublicKey (Can be different from Wallet PublicKey)"
                        required
                    />
                    <button type="submit" className={styles.formButton}>
                        Create Mint
                    </button>
                </form>
            ) : (
                <div className={styles.errorMessage}>Please connect your wallet to continue</div>
            )}
        </div>
    );
};

export default CreateMintForm;
