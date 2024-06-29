"use client";
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Input,
  message,
  Modal,
  Popover,
  Radio,
} from 'antd';

import DefaultLayout from '@/components/Layouts/DefaultLayout';
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Connection,
  VersionedTransaction,
} from '@solana/web3.js';

import styles from './swap.module.css';
import tokenList from './tokenList.json';

function Swap() {
      const wallet = useWallet();
      // const connection = useConnection();
      // const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY_HERE');
      const connection = new Connection('https://raydium-raydium-5ad5.mainnet.rpcpool.com/');
      const [messageApi, contextHolder] = message.useMessage();
  
      const [slippage, setSlippage] = useState(2.5);
      // const [tokenOneAmount, setTokenOneAmount] = useState(null);
      // const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
      const [tokenOneAmount, setTokenOneAmount] = useState(0);
      const [tokenTwoAmount, setTokenTwoAmount] = useState(0);
      const [tokenOne, setTokenOne] = useState(tokenList[0]);
      const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
      const [isOpen, setIsOpen] = useState(false);
      const [changeToken, setChangeToken] = useState(1);
      const [quoteResponse, setQuoteResponse] = useState(null);
      // const [prices, setPrices] = useState(null);
      ///////////ayad//////////
      const [tokenOneN, setTokenOneN] = useState(0);
      const [tokenTwoN, setTokenTwoN] = useState(1);
  
      function handleSlippageChange(e: any) {
          setSlippage(e.target.value);
      }
  
      function changeAmount(e: any) {
          setTokenOneAmount(e.target.value);
          // if(e.target.value && prices){
          //   setTokenTwoAmount((e.target.value * prices.ratio).toFixed(2))
          // }else{
          // //   setTokenTwoAmount(null);
          // setTokenTwoAmount(0);
          // }
      }
  
      ////////////ayad///////////
      // const handleFromValueChange = (
      //     event: React.ChangeEvent<HTMLInputElement>
      //     ) => {
      //     setTokenOneAmount(Number(event.target.value));
      // };
  
      const debounce = <T extends unknown[]>(
          func: (...args: T) => void,
          wait: number
        ) => {
          let timeout: NodeJS.Timeout | undefined;
        
          return (...args: T) => {
            const later = () => {
              clearTimeout(timeout);
              func(...args);
            };
        
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
          };
      };
  
      const debounceQuoteCall = useCallback(debounce(getQuote, 500), [tokenOne, tokenTwo]);
  
      useEffect(() => {
          debounceQuoteCall(tokenOneAmount);
      }, [tokenOneAmount, debounceQuoteCall]);
  
      async function getQuote(currentAmount: number) {
          if (isNaN(currentAmount) || currentAmount <= 0) {
            console.error('Invalid fromAmount value:', currentAmount);
            return;
          }
      
          // const quote = await (
          //   await fetch(
          //     `https://quote-api.jup.ag/v6/quote?inputMint=${tokenOne.address}&outputMint=${tokenTwo.address}&amount=${currentAmount * Math.pow(10, tokenOne.decimals)}&slippage=${slippage}`
          //   )
          // ).json();
  
          let quote;
          try{
            quote = await (
              await fetch(
                `https://quote-api.jup.ag/v6/quote?inputMint=${tokenOne.address}&outputMint=${tokenTwo.address}&amount=${currentAmount * Math.pow(10, tokenOne.decimals)}&slippage=${slippage}`
              )
            ).json();
          } catch(e){console.log('Error: ',e)}
      
          if (quote && quote.outAmount) {
            const outAmountNumber =
              Number(quote.outAmount) / Math.pow(10, tokenTwo.decimals);
            setTokenTwoAmount(outAmountNumber);
          } else {
              setTokenTwoAmount(0);
          }
      
          setQuoteResponse(quote);
      }
  
  
  
      function switchTokens() {
          // setPrices(null);
          setTokenOneAmount(0);
          setTokenTwoAmount(0);
          const one = tokenOne;
          const two = tokenTwo;
          setTokenOne(two);
          setTokenTwo(one);
          // fetchPrices(two.address, one.address);
      }
  
      function openModal(asset: any) {
          setChangeToken(asset);
          setIsOpen(true);
      }
  
      function modifyToken(i: any){
          // setPrices(null);
          setTokenOneAmount(0);
          setTokenTwoAmount(0);
          if (changeToken === 1) {
              /////ayad/////
              if(tokenTwoN == i){
                  setTokenTwo(tokenOne);
                  // tokenTwoN = tokenOneN;
                  setTokenTwoN(tokenOneN);
              }
              
              setTokenOne(tokenList[i]);
              setTokenOneN(i);
          //   fetchPrices(tokenList[i].address, tokenTwo.address)
          } else {
              ////ayad//////
              if(tokenOneN == i) {
                  setTokenOne(tokenTwo);
                  //tokenOneN = tokenTwoN;
                  setTokenOneN(tokenTwoN);
              }
              
              setTokenTwo(tokenList[i]);
              setTokenTwoN(i);
          //  fetchPrices(tokenOne.address, tokenList[i].address)
          }
          setIsOpen(false);
      }
  
      async function signAndSendTransaction() {
          if (!wallet.connected || !wallet.signTransaction) {
            console.error(
              'Wallet is not connected or does not support signing transactions'
            );
            return;
          }
      
          // get serialized transactions for the swap
          const { swapTransaction } = await (
            await fetch('https://quote-api.jup.ag/v6/swap', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                quoteResponse,
                userPublicKey: wallet.publicKey?.toString(),
                wrapAndUnwrapSol: true,
                // feeAccount is optional. Use if you want to charge a fee.  feeBps must have been passed in /quote API.
                // feeAccount: "fee_account_public_key"
              }),
            })
          ).json();
      
          try {
              //sending transaction
              messageApi.destroy();
              messageApi.open({
                  type: 'loading',
                  content: 'Transaction is Pending...',
                  duration: 0,
              })
              
            const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
            const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
            const signedTransaction = await wallet.signTransaction(transaction);
      
            const rawTransaction = signedTransaction.serialize();
            const txid = await connection.sendRawTransaction(rawTransaction, {
              skipPreflight: true,
              maxRetries: 2,
            });
      
            const latestBlockHash = await connection.getLatestBlockhash();
            await connection.confirmTransaction({
              blockhash: latestBlockHash.blockhash,
              lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
              signature: txid
            }, 'confirmed');
            
            //Transaction Successful
            messageApi.destroy();
            messageApi.open({
            type: 'success',
            content: 'Transaction Successful',
            duration: 2.5,
            })
            
            console.log(`https://solscan.io/tx/${txid}`);
      
          } catch (error) {
              //Transaction Failed
              messageApi.destroy();
              messageApi.open({
                  type: 'error',
                  content: 'Transaction Failed',
                  duration: 2.50,
                })
              console.error('Error signing or sending the transaction:', error);
          }
      } 
      
      const settings = (
          <>
            <div>Slippage Tolerance</div>
            <div>
              <Radio.Group value={slippage} onChange={handleSlippageChange}>
                <Radio.Button value={0.5}>0.5%</Radio.Button>
                <Radio.Button value={2.5}>2.5%</Radio.Button>
                <Radio.Button value={5}>5.0%</Radio.Button>
              </Radio.Group>
            </div>
          </>
        );
      return (
        <DefaultLayout>
          <div className={styles.App}>
              <div className={styles.mainWindow}>
                  {contextHolder}
                  <Modal
                      open={isOpen}
                      footer={null}
                      onCancel={() => setIsOpen(false)}
                      title="Select a token"
                  >
                      <div className={styles.modalContent}>
                      {tokenList?.map((e: any, i: any) => {
                          return (
                          <div
                              className={styles.tokenChoice}
                              key={i}
                              onClick={() => modifyToken(i)}
                          >
                              <img src={e.img} alt={e.ticker} className={styles.tokenLogo} />
                              <div className={styles.tokenChoiceNames}>
                                  <div className={styles.tokenName}>{e.name}</div>
                                  <div className={styles.tokenTicker}>{e.ticker}</div>
                              </div>
                          </div>
                          );
                      })}
                      </div>
                  </Modal>
                  <div className={styles.tradeBox}>
                      <div className={styles.tradeBoxHeader}>
                          <h4>Swap</h4>
                          <Popover
                          content={settings}
                          title="Settings"
                          trigger="click"
                          placement="bottomRight"
                          >
                              <SettingOutlined className={styles.cog}/>
                          </Popover>
                      </div>
                      <div className={styles.inputs}>
                          <Input
                              placeholder="0"
                              value={tokenOneAmount}
                              onChange={changeAmount}
                              // onChange={handleFromValueChange}
                              // disabled={!prices}
                          />
                          <Input placeholder="0" 
                          value={tokenOneAmount==0 ? 0 : tokenTwoAmount} 
                          disabled={true} 
                          />
                          <div className={styles.switchButton} onClick={switchTokens}>
                              <ArrowDownOutlined className={styles.switchArrow} />
                          </div>
                          {/* <div className={styles.assetOne} onClick={() => openModal(1)}> */}
                          <div className={styles.assetOne} onClick={() => openModal(1)}>
                              <img src={tokenOne.img} alt="assetOneLogo" className={styles.assetLogo} />
                              {/* <Image src={tokenOne.img} alt="assetOneLogo" width="22px" height="22px" className={styles.assetLogo} /> */}
                              {tokenOne.ticker}
                              <DownOutlined />
                          </div>
                          <div className={styles.assetTwo} onClick={() => openModal(2)}>
                              <img src={tokenTwo.img} alt="assetOneLogo" className={styles.assetLogo} />
                              {tokenTwo.ticker}
                              <DownOutlined />
                          </div>
                      </div>
                      {/* <div className={styles.swapButton} disabled={!tokenOneAmount || !isConnected} onClick={fetchDexSwap}>Swap</div> */}
                      <button className={styles.swapButton} disabled={!tokenOneAmount || tokenOneAmount==0 || !wallet.publicKey} onClick={signAndSendTransaction}>{!wallet.publicKey ? "Connect wallet" : "Swap"}</button>
                  </div>
              </div>
          </div>
        </DefaultLayout>
      )
  }
  export default Swap;