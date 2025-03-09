import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { 
  createCreateMetadataAccountV3Instruction,
  DataV2
} from '@metaplex-foundation/mpl-token-metadata';

// Metaplex Token Metadata Program ID
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// Function to derive metadata account address
export async function getMetadataAddress(mint: PublicKey): Promise<PublicKey> {
  const metadataBytes = new TextEncoder().encode('metadata');
  
  const [metadataAddress] = await PublicKey.findProgramAddress(
    [
      metadataBytes,
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  return metadataAddress;
}

// Create metadata instruction using the official Metaplex SDK
export function createNFTMetadataInstruction(
  metadataAddress: PublicKey,
  mint: PublicKey,
  mintAuthority: PublicKey,
  payer: PublicKey,
  uri: string
): TransactionInstruction {
  // Create the DataV2 object expected by the Metaplex instruction
  const data: DataV2 = {
    name: "SMS Message NFT",
    symbol: "SMS",
    uri: uri,
    sellerFeeBasisPoints: 0,
    creators: [
      {
        address: mintAuthority,
        verified: true,
        share: 100,
      },
    ],
    collection: null,
    uses: null,
  };

  // Create the instruction using the official Metaplex SDK
  return createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataAddress,
      mint: mint,
      mintAuthority: mintAuthority,
      payer: payer,
      updateAuthority: mintAuthority,
    },
    {
      createMetadataAccountArgsV3: {
        data: data,
        isMutable: true,
        collectionDetails: null,
      }
    }
  );
}
