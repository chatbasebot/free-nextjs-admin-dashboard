import { serialize } from 'borsh';

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token-3';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

import {
  mint,
  pda_authority,
  programID,
} from '../adresses/adresses';
import {
  InitPDA,
  InitPDASchema,
  TransferData,
  TransferDataSchema,
} from '../models/model';

export const sendTransaction = async (transaction: TransactionInstruction, connection: Connection, wallet: WalletContextState) => {

    // try {
    //     const {blockhash, lastValidBlockHeight} = await connection.getLatestBlockhash();
    //     console.log("Son geçerli blok hash ve yüksekliği alındı.", blockhash, lastValidBlockHeight);
    //     console.log("İşlem hazırlandı ve imzalanacak.");
    //
    //     const message = new TransactionMessage({
    //         instructions: [transaction],
    //         payerKey: wallet.publicKey!,
    //         recentBlockhash : (await connection.getLatestBlockhash()).blockhash
    //     }).compileToV0Message();
    //
    //
    //     const tx = new VersionedTransaction(message);
    //     const serializedTransaction = tx.serialize();
    //     const base64 = serializedTransaction.toString();
    //     console.log("TEST TX", base64);
    //     const signature = await wallet.sendTransaction(tx,connection);
    //
    //     await connection.confirmTransaction({
    //         blockhash: blockhash,
    //         lastValidBlockHeight: lastValidBlockHeight,
    //         signature: signature,
    //     });
    //
    //     console.log(`İşlem gönderildi, imza: ${tx}`);
    //
    //     return tx;
    // } catch (error) {
    //     console.error("İşlem gönderilirken bir hata oluştu:", error);
    //     throw error; // Hata döndürmek için burada throw kullanılabilir.
    // }

    //ayad///////////
    if(!wallet.publicKey){return console.log('wallet not connected!')}
    const tx = new Transaction().add(transaction);
    const {blockhash, lastValidBlockHeight} = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.feePayer = wallet.publicKey;

    try {
        // Assuming you have the mintKeypair somewhere to sign the transaction if needed
        const serializedTransaction = tx.serialize({requireAllSignatures: false});
        const base64 = serializedTransaction.toString("base64");
        console.log("TEST TX", base64);

        const transactionSignature = await wallet.sendTransaction(tx, connection, {
            signers: [], // mintKeypair should be included here if it's supposed to sign the transaction
        });

        console.log(`Transaction Signature: ${transactionSignature}`);
    } catch (error) {
        console.error("Transaction failed", error);
    }
}
export const sendDoubleTransaction = async (transaction: TransactionInstruction, transaction2: TransactionInstruction, connection: Connection, wallet: WalletContextState) => {

    // try {
    //     const {blockhash, lastValidBlockHeight} = await connection.getLatestBlockhash();
    //     console.log("Son geçerli blok hash ve yüksekliği alındı.", blockhash, lastValidBlockHeight);
    //
    //
    //
    //     console.log("İşlem hazırlandı ve imzalanacak.");
    //     const message = new TransactionMessage({
    //         instructions: [transaction,transaction2],
    //         payerKey: wallet.publicKey!,
    //         recentBlockhash : (await connection.getLatestBlockhash()).blockhash
    //     }).compileToV0Message();
    //
    //
    //     const tx = new VersionedTransaction(message);
    //
    //     const signature = await wallet.sendTransaction(tx,connection);
    //
    //
    //     await connection.confirmTransaction({
    //         blockhash: blockhash,
    //         lastValidBlockHeight: lastValidBlockHeight,
    //         signature: signature,
    //     });
    //
    //     console.log(`İşlem gönderildi, imza: ${tx}`);
    //
    //     return tx;
    // } catch (error) {
    //     console.error("İşlem gönderilirken bir hata oluştu:", error);
    //     throw error; // Hata döndürmek için burada throw kullanılabilir.
    // }

    //ayad///////////
    if(!wallet.publicKey){return console.log('wallet not connected!')}
    const tx = new Transaction().add(transaction, transaction2);
    const {blockhash, lastValidBlockHeight} = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.feePayer = wallet.publicKey;

    try {
        // Assuming you have the mintKeypair somewhere to sign the transaction if needed
        const serializedTransaction = tx.serialize({requireAllSignatures: false});
        const base64 = serializedTransaction.toString("base64");
        console.log("TEST TX", base64);

        const transactionSignature = await wallet.sendTransaction(tx, connection, {
            signers: [],
        });

        console.log(`Transaction Signature: ${transactionSignature}`);
    } catch (error) {
        console.error("Transaction failed", error);
    }
}
export const getWhitelistPDA = async (acc_to_add_to_whitelist: PublicKey) => {

    const pda = PublicKey.findProgramAddressSync([acc_to_add_to_whitelist.toBuffer()], programID);

    return pda[0], pda[1];

}
export const connection = new Connection("https://api.testnet.solana.com", "confirmed");
export const init_pda = async (authority: PublicKey, wallet: WalletContextState) => {

    const [pdaAddress, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from("seed")],
        programID
    );
    console.log(`PDA Address: ${pdaAddress.toString()}, Bump: ${bump}`);

    let init = new InitPDA({bump});
    let encoded = serialize(InitPDASchema, init);
    let data = Uint8Array.of(3, ...encoded);

    const transactionInstruction = new TransactionInstruction({
        programId: programID,
        keys: [
            {pubkey: authority, isSigner: false, isWritable: true},
            {pubkey: pdaAddress, isSigner: false, isWritable: true},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false},
        ],
        data: Buffer.from(data)
    });


    // try {
    //     const {blockhash, lastValidBlockHeight} = await connection.getLatestBlockhash();
    //     console.log("Son geçerli blok hash ve yüksekliği alındı.", blockhash, lastValidBlockHeight);
    //
    //
    //     console.log("İşlem hazırlandı ve imzalanacak.");
    //     const message = new TransactionMessage({
    //         instructions: [transactionInstruction],
    //         payerKey: wallet.publicKey!,
    //         recentBlockhash: (await connection.getLatestBlockhash()).blockhash
    //     }).compileToV0Message();
    //
    //
    //     const tx = new VersionedTransaction(message);
    //
    //     const signature = await wallet.sendTransaction(tx, connection);
    //
    //
    //     await connection.confirmTransaction({
    //         blockhash: blockhash,
    //         lastValidBlockHeight: lastValidBlockHeight,
    //         signature: signature,
    //     });
    //
    //     console.log(`İşlem gönderildi, imza: ${tx}`);
    //
    //     return tx;
    // } catch (error) {
    //     console.error("İşlem gönderilirken bir hata oluştu:", error);
    //     throw error; // Hata döndürmek için burada throw kullanılabilir.
    // }

    await sendTransaction(transactionInstruction, connection, wallet);
    return pdaAddress[0];
};
const transfer_tokens = async (source_ata: PublicKey,
                               destination_ata: PublicKey,
                               wallet: WalletContextState,
                               pda_whitelist: PublicKey,
                               auth_pda: PublicKey,
                               pda_bump: number,amount: number) => {
    //ayad///////////
    if(!wallet.publicKey){return console.log('wallet not connected!')}
    let init = new TransferData();
    init.bump = pda_bump;
    init.lamports = amount * LAMPORTS_PER_SOL;

    let encoded = serialize(TransferDataSchema, init);
    let concated = Uint8Array.of(1, ...encoded);
    const ix = new TransactionInstruction({
        programId: programID,
        keys: [
            {isSigner: false, isWritable: true, pubkey: source_ata},
            {isSigner: false, isWritable: true, pubkey: destination_ata},
            {isSigner: false, isWritable: true, pubkey: wallet.publicKey},
            {isSigner: false, isWritable: true, pubkey: mint},
            {isSigner: false, isWritable: true, pubkey: pda_whitelist},
            {isSigner: false, isWritable: true, pubkey: auth_pda},
            {isSigner: false, isWritable: true, pubkey: TOKEN_2022_PROGRAM_ID},
        ],
        data: Buffer.from(concated)
    });

    const sign = sendTransaction(ix, connection, wallet);
    console.log("sig", sign);
    return sign;
};
const create_and_transfer_tokens = async (source_ata: PublicKey,
                                          destination_ata: PublicKey,
                                          wallet: WalletContextState,
                                          pda_whitelist: PublicKey,
                                          auth_pda: PublicKey,
                                          pda_bump: number,amount: number, destination:PublicKey) => {
    //ayad///////////
    if(!wallet.publicKey){return console.log('wallet not connected!')}
    const ix = await create_ata(wallet, destination_ata, destination);
    const pda = PublicKey.findProgramAddressSync([Buffer.from("seed")], programID);

    let init = new TransferData();

    init.bump = pda_bump;
    init.lamports = amount * LAMPORTS_PER_SOL;
    console.log("Source ATA:", source_ata.toString());
    let encoded = serialize(TransferDataSchema, init);
    let concated = Uint8Array.of(1, ...encoded);
    const ix2 = new TransactionInstruction({
        programId: programID,
        keys: [
            {isSigner: false, isWritable: true, pubkey: source_ata},
            {isSigner: false, isWritable: true, pubkey: destination_ata},
            {isSigner: false, isWritable: true, pubkey: wallet.publicKey},
            {isSigner: false, isWritable: true, pubkey: mint},
            {isSigner: false, isWritable: true, pubkey: pda_whitelist}, //acc does not exist
            {isSigner: false, isWritable: true, pubkey: auth_pda},
            {isSigner: false, isWritable: true, pubkey: TOKEN_2022_PROGRAM_ID},
        ],
        data: Buffer.from(concated)
    });

    console.log(pda[1]);
    
    //ayad////////
    if(!ix){return console.log('can not find ix')}
    const sign = sendDoubleTransaction(ix, ix2, connection, wallet);
    console.log("sig", sign);
    return sign;
}
export const transfer_tokens_whitelist = async (amount: number, wallet: WalletContextState, destination: string) => {
    //ayad///////////
    if(!wallet.publicKey){return console.log('wallet not connected!')}
    const dest = new PublicKey(destination);
    const destination_ata = await get_ata(dest);
    let acc_info = await connection.getAccountInfo(destination_ata); //dest acc ???
    const source_ata = await get_ata(wallet.publicKey);
    const pda_whitelist = await get_whitelist_account(wallet.publicKey);
    // 1000000, lamportsu buna esit degilse hesap yoktur

    if (acc_info?.owner.toString() == TOKEN_2022_PROGRAM_ID.toString()) {
        await transfer_tokens(source_ata,destination_ata,wallet,pda_whitelist[0],pda_authority,pda_whitelist[1],amount);
    } else {
        await create_and_transfer_tokens(source_ata,destination_ata,wallet,pda_whitelist[0],pda_authority,pda_whitelist[1],amount,dest);
    }

}
export const add_account_to_whitelist = async (account: PublicKey, wallet: WalletContextState) => {
    //ayad///////////
    if(!wallet.publicKey){return console.log('wallet not connected!')}

    const whitelist_pda = PublicKey.findProgramAddressSync([account.toBytes()], programID);

    let init = new InitPDA();

    init.bump = whitelist_pda[1];

    let encoded = serialize(InitPDASchema, init);

    let concated = Uint8Array.of(0, ...encoded);
    const ix = new TransactionInstruction({
        programId: programID,
        keys: [
            {isSigner: false, isWritable: true, pubkey: wallet.publicKey},
            {isSigner: false, isWritable: true, pubkey: account},
            {isSigner: false, isWritable: true, pubkey: whitelist_pda[0]},
            {isSigner: false, isWritable: true, pubkey: SystemProgram.programId},
        ],
        data: Buffer.from(concated)
    });

    console.log(whitelist_pda[0]);

    await sendTransaction(ix, connection, wallet);

}
export const create_ata = async (wallet: WalletContextState, destination_ata: PublicKey, destination: PublicKey) => {
    //ayad///////////
    if(!wallet.publicKey){return console.log('wallet not connected!')}
    return createAssociatedTokenAccountInstruction(wallet.publicKey, destination_ata, destination, mint, TOKEN_2022_PROGRAM_ID);
}
export const transfer_auth = async (wallet: WalletContextState) => {
    //ayad///////////
    if(!wallet.publicKey){return console.log('wallet not connected!')}

    const new_authority = new PublicKey("34TAZBN3wVy6w7NK5AAzcDCcQinW8j7yupNUkESUW2X1");

    const ix = new TransactionInstruction({
        programId: programID,
        keys: [
            {isSigner: true, isWritable: true, pubkey: wallet.publicKey},
            {isSigner: false, isWritable: true, pubkey: new_authority},
            {isSigner: false, isWritable: true, pubkey: mint},
            {isSigner: false, isWritable: true, pubkey: TOKEN_2022_PROGRAM_ID},
            {isSigner: false, isWritable: true, pubkey: SYSVAR_RENT_PUBKEY},
        ],
        data: Buffer.from([2])
    });


    await sendTransaction(ix, connection, wallet);
};
export const transfer_without_whitelist = async () => {
};
export const get_whitelist_account = async (acc_publickey:PublicKey) => {
    const pda = PublicKey.findProgramAddressSync([acc_publickey.toBytes()], programID);
    return pda;

};
export const get_ata = async (acc_publickey:PublicKey) => {
    return await getAssociatedTokenAddress(mint, acc_publickey, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
};
