// import {
//   FC,
//   useState,
// } from 'react';

// import {
//   Layout,
//   struct,
//   u16,
//   u8,
// } from '@solana/buffer-layout';
// import {
//   publicKey,
//   u64,
// } from '@solana/buffer-layout-utils';
// // import { u64 } from '@project-serum/serum/lib/layout';
// import {
//   TOKEN_2022_PROGRAM_ID,
//   TokenInstruction,
// } from '@solana/spl-token-3';
// import {
//   useConnection,
//   useWallet,
// } from '@solana/wallet-adapter-react';
// import {
//   AccountMeta,
//   LAMPORTS_PER_SOL,
//   PublicKey,
//   Signer,
//   Transaction,
//   TransactionInstruction,
// } from '@solana/web3.js';

// import { mint } from '../../adresses/adresses';
// import styles from '../../css/Home.module.css';

// export class COptionPublicKeyLayout extends Layout<PublicKey | null> {
//     private publicKeyLayout: Layout<PublicKey>;
//     constructor(property?: string | undefined) {
//         super(-1, property);
//         this.publicKeyLayout = publicKey();
//     }
//     decode(buffer: Uint8Array, offset: number = 0): PublicKey | null {
//         const option = buffer[offset];
//         if (option === 0) {
//             return null;
//         }
//         return this.publicKeyLayout.decode(buffer, offset + 1);
//     }
//     encode(src: PublicKey | null, buffer: Uint8Array, offset: number = 0): number {
//         if (src === null) {
//             buffer[offset] = 0;
//             return 1;
//         } else {
//             buffer[offset] = 1;
//             this.publicKeyLayout.encode(src, buffer, offset + 1);
//             return 33;
//         }
//     }
//     getSpan(buffer?: Uint8Array, offset: number = 0): number {
//         if (buffer) {
//             const option = buffer[offset];
//             return option === 0 ? 1 : 1 + this.publicKeyLayout.span;
//         }
//         return 1 + this.publicKeyLayout.span;
//     }
// }
// export function addSigners(
//     keys: AccountMeta[],
//     ownerOrAuthority: PublicKey,
//     multiSigners: (Signer | PublicKey)[]
// ): AccountMeta[] {
//     if (multiSigners.length) {
//         keys.push({ pubkey: ownerOrAuthority, isSigner: false, isWritable: false });
//         for (const signer of multiSigners) {
//             keys.push({
//                 pubkey: signer instanceof PublicKey ? signer : signer.publicKey,
//                 isSigner: true,
//                 isWritable: false,
//             });
//         }
//     } else {
//         keys.push({ pubkey: ownerOrAuthority, isSigner: true, isWritable: false });
//     }
//     return keys;
// }
// export enum TransferFeeInstruction {
//     InitializeTransferFeeConfig = 0,
//     TransferCheckedWithFee = 1,
//     WithdrawWithheldTokensFromMint = 2,
//     WithdrawWithheldTokensFromAccounts = 3,
//     HarvestWithheldTokensToMint = 4,
//     SetTransferFee = 5,
// }
// // SetTransferFee
// /** TODO: docs */
// export interface SetTransferFeeInstructionData {
//     instruction: TokenInstruction.TransferFeeExtension;
//     transferFeeInstruction: TransferFeeInstruction.SetTransferFee;
//     transferFeeBasisPoints: number;
//     maximumFee: bigint;
// }
// /** TODO: docs */
// export const setTransferFeeInstructionData = struct<SetTransferFeeInstructionData>([
//     u8("instruction"),
//     u8("transferFeeInstruction"),
//     u16("transferFeeBasisPoints"),
//     u64("maximumFee"),
// ]);
// /**
//  * Construct a SetTransferFeeInstructionData instruction
//  *
//  * @param mint            Token mint account
//  * @param authority         Authority that can update the fees
//  * @param transferFeeBasisPoints Amount of transfer collected as fees, expressed as basis points of the transfer amount
//  * @param maximumFee        Maximum fee assessed on transfers
//  * @param programId       SPL Token program account
//  *
//  * @return Instruction to add to a transaction
//  */
// export function createSetTransferFeeInstructionInstruction(
//     mint: PublicKey,
//     authority: PublicKey,
//     transferFeeBasisPoints: number,
//     maximumFee: bigint,
//     multiSigners: (Signer | PublicKey)[] = [],
//     programId = TOKEN_2022_PROGRAM_ID
// ): TransactionInstruction {
//     const keys =  addSigners(
//         [
//             { pubkey: mint, isSigner: false, isWritable: true },
//         ],
//         authority,
//         multiSigners
//     );
//     const data = Buffer.alloc(setTransferFeeInstructionData.span);
//     setTransferFeeInstructionData.encode(
//         {
//             instruction: TokenInstruction.TransferFeeExtension,
//             transferFeeInstruction: TransferFeeInstruction.SetTransferFee,
//             transferFeeBasisPoints: transferFeeBasisPoints,
//             maximumFee: maximumFee,
//         },
//         data
//     );
//     return new TransactionInstruction({ keys, programId, data });
// }

// const SetTransferFeeForm: FC = () => {
//     const [txSig, setTxSig] = useState("");
//     const { publicKey, sendTransaction } = useWallet();
//     const { connection } = useConnection();

//     const generateExplorerTxUrl = (txId: string) => `https://explorer.solana.com/tx/${txId}?cluster=testnet`;

//     const changeMintFee = async (event: any) => {
//         event.preventDefault();
//         const feePercentage = parseInt(event.target.fee.value);
//         const feeBasisPoints = feePercentage * 100; // Assuming 'fee' input is for basis points
//         const maximumFee = BigInt(1200000*LAMPORTS_PER_SOL);
//         if (!publicKey) return; // Ensure there's a public key

//         const mintPubkey = new PublicKey(mint);
//         // Assuming the authority to be the wallet's publicKey and setting a dummy maximumFee
//         const tx = createSetTransferFeeInstructionInstruction(
//             mintPubkey,
//             publicKey, // Authority
//             feeBasisPoints, // transferFeeBasisPoints
//             maximumFee, // maximumFee
//             [], // multiSigners (optional)
//             TOKEN_2022_PROGRAM_ID // You should define this constant according to your needs
//         );
//         const transaction = new Transaction().add(tx);
//         const {blockhash, lastValidBlockHeight} = await connection.getLatestBlockhash();
//         transaction.recentBlockhash = blockhash;
//         transaction.lastValidBlockHeight = lastValidBlockHeight;
//         transaction.feePayer = publicKey;

//         try {
//             // Assuming you have the mintKeypair somewhere to sign the transaction if needed
//             const serializedTransaction = transaction.serialize({requireAllSignatures: false});
//             const base64 = serializedTransaction.toString("base64");
//             console.log("TEST TX", base64);

//             const transactionSignature = await sendTransaction(transaction, connection, {
//                 signers: [], // mintKeypair should be included here if it's supposed to sign the transaction
//             });

//             setTxSig(transactionSignature);

//             console.log(`Transaction Signature: ${transactionSignature}`);
//         } catch (error) {
//             console.error("Transaction failed", error);
//         }
//     };

//     return (
//         <div>
//             {publicKey ? (
//                 <form onSubmit={changeMintFee} className={styles.form}>
//                     <h2>Change Transfer Fee</h2>
//                     <h6>In this section 3dC9gEwhF2kiuuJmQFKdASRe4F8VtENRdQsurPQ1G7mS wallet address has to be used</h6>
//                     <label htmlFor="fee">Transfer Fee Percentage:</label>
//                     <input
//                         id="fee"
//                         type="text"
//                         className={styles.formField}
//                         placeholder="Enter Fee Percentage"
//                         required
//                     />
//                     <button type="submit" className={styles.formButton}>
//                         Change Mint Fee
//                     </button>
//                 </form>
//             ) : (
//                 <div className={styles.errorMessage}>Please connect your wallet to continue</div>
//             )}
//             {/*{txSig && <div>Transaction Signature: {txSig}</div>}*/}
//         </div>
//     );
// };

// export default SetTransferFeeForm;




export const SetTransferFeeForm = () => {
    return <h1>Hello world</h1>
}