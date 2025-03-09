import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { createNFTMessage, checkTokenBalance } from '../services/nftMessaging';
import ImageWithFallback from './ui/ImageWithFallback';
import { motion } from 'framer-motion';

// Number of tokens to burn for each message
const TOKENS_TO_BURN = 100;

const NftMessaging = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, connected } = wallet;

  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [transactionResult, setTransactionResult] = useState<{
    success: boolean;
    txId?: string;
    error?: string;
  } | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  // Check token balance when wallet connects
  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (connected && publicKey) {
        try {
          const balance = await checkTokenBalance(connection, publicKey);
          setTokenBalance(balance);
        } catch (error) {
          console.error('Error fetching token balance:', error);
        }
      } else {
        setTokenBalance(null);
      }
    };

    fetchTokenBalance();
    
    // Set up interval to refresh balance
    const intervalId = setInterval(fetchTokenBalance, 30000); // every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [connected, publicKey, connection]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !recipient || !message) return;
    
    setIsSubmitting(true);
    setTransactionResult(null);
    
    try {
      // Validate recipient address
      if (!recipient.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
        throw new Error('Invalid Solana wallet address');
      }

      // Check token balance
      if (tokenBalance !== null && tokenBalance < TOKENS_TO_BURN) {
        throw new Error(`Insufficient tokens. You need at least ${TOKENS_TO_BURN} $SMS tokens.`);
      }
      
      console.log('Starting NFT message creation...');
      
      // Send the NFT message in a single transaction
      const result = await createNFTMessage({
        recipient,
        message,
        connection,
        wallet
      });
      
      console.log('NFT message creation result:', result);
      setTransactionResult(result);
      
      if (result.success) {
        // Update token balance after successful transaction
        if (tokenBalance !== null) {
          setTokenBalance(tokenBalance - TOKENS_TO_BURN);
        }
        
        // Clear form after successful transaction
        setTimeout(() => {
          setMessage('');
          setRecipient('');
          setIsPreview(false);
          setTransactionResult(null);
        }, 5000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setTransactionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle preview mode
  const togglePreview = () => {
    setIsPreview(!isPreview);
  };

  return (
    <section id="message" className="relative py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-8">
            Send NFT Messages
          </h2>
          
          <div className="bg-gray-800 rounded-xl shadow-purple p-6 md:p-8">
            {!connected ? (
              <div className="text-center py-8">
                <p className="text-gray-300 mb-6">Connect your wallet to send NFT messages</p>
                <div className="flex justify-center">
                  <WalletMultiButton />
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-purple-400 font-medium">Your $SMS Balance</p>
                    <p className="text-white text-xl font-bold">
                      {tokenBalance !== null ? tokenBalance.toLocaleString() : 'Loading...'}
                    </p>
                  </div>
                  <div>
                    <p className="text-purple-400 font-medium text-right">Cost per Message</p>
                    <p className="text-white text-xl font-bold text-right">{TOKENS_TO_BURN} $SMS</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="recipient" className="block text-gray-300 mb-2">Recipient Address</label>
                    <input
                      type="text"
                      id="recipient"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-purple-500"
                      placeholder="Solana wallet address"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-gray-300 mb-2">Message</label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-purple-500 min-h-[100px]"
                      placeholder="Type your message here..."
                      disabled={isSubmitting}
                      required
                      maxLength={280}
                    />
                    <div className="flex justify-end mt-1 text-gray-400 text-sm">
                      {message.length}/280
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-4 mt-6">
                    <button
                      type="button"
                      onClick={togglePreview}
                      className="py-3 px-6 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition"
                      disabled={isSubmitting || !message}
                    >
                      {isPreview ? 'Edit Message' : 'Preview Message'}
                    </button>
                    
                    <button
                      type="submit"
                      className="py-3 px-6 rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-medium transition flex-1"
                      disabled={isSubmitting || !recipient || !message}
                    >
                      {isSubmitting ? 'Sending...' : `Send for ${TOKENS_TO_BURN} $SMS`}
                    </button>
                  </div>
                </form>

                {isPreview && (
                  <div className="mt-8 border border-gray-700 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-2">Message Preview</h3>
                    <div className="bg-purple-900 rounded-lg p-4 text-white">
                      {message}
                    </div>
                  </div>
                )}

                {transactionResult && (
                  <div className={`mt-6 rounded-lg p-4 ${transactionResult.success ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}>
                    <h3 className={`font-medium mb-2 ${transactionResult.success ? 'text-green-400' : 'text-red-400'}`}>
                      {transactionResult.success ? 'Message Sent Successfully!' : 'Error Sending Message'}
                    </h3>
                    {transactionResult.success && transactionResult.txId && (
                      <p className="text-gray-300 break-all">
                        Transaction ID: 
                        <a 
                          href={`https://solscan.io/tx/${transactionResult.txId}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-400 ml-1 hover:underline"
                        >
                          {transactionResult.txId}
                        </a>
                      </p>
                    )}
                    {!transactionResult.success && transactionResult.error && (
                      <p className="text-gray-300">{transactionResult.error}</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default NftMessaging;
