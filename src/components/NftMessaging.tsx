// Add extra error handling in handleSubmit
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
