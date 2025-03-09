import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import * as borsh from '@project-serum/borsh';

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

// Create metadata instruction
export function createNFTMetadataInstruction(
  metadataAddress: PublicKey,
  mint: PublicKey,
  mintAuthority: PublicKey,
  payer: PublicKey,
  uri: string
): TransactionInstruction {
  // Required accounts according to Metaplex docs
  const accounts = [
    { pubkey: metadataAddress, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: mintAuthority, isSigner: true, isWritable: false },
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: mintAuthority, isSigner: false, isWritable: false }, // Update authority (same as mint authority)
    { pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false }, // System Program
    { pubkey: TOKEN_METADATA_PROGRAM_ID, isSigner: false, isWritable: false }, // Token Program was wrong, should be metadata program
  ];

  // Serialize the instruction data using Borsh schema
  const dataLayout = borsh.struct([
    borsh.u8('instruction'), // 0 = CreateMetadataAccountV3
    borsh.struct([
      borsh.str('name'),
      borsh.str('symbol'),
      borsh.str('uri'),
      borsh.u16('sellerFeeBasisPoints'),
      borsh.bool('hasCreators'),
      borsh.option(
        borsh.vec(
          borsh.struct([
            borsh.publicKey('address'),
            borsh.bool('verified'),
            borsh.u8('share'),
          ])
        ),
        'creators'
      ),
      borsh.bool('isMutable'),
      borsh.option(
        borsh.struct([
          borsh.publicKey('key'),
          borsh.bool('verified'),
        ]),
        'collection'
      ),
      borsh.option(
        borsh.struct([
          borsh.bool('useMethod'),
          borsh.u64('remaining'),
          borsh.u64('total'),
        ]),
        'uses'
      ),
      borsh.option(
        borsh.bool(),
        'isPrimarySaleHappened'
      ),
    ], 'data'),
  ]);

  // Create the creators array with only one creator (the mint authority)
  const creators = [
    {
      address: mintAuthority.toBuffer(),
      verified: true,
      share: 100,
    },
  ];

  // Create the data object to serialize
  const data = {
    instruction: 0, // CreateMetadataAccountV3 instruction
    data: {
      name: "SMS Message NFT",
      symbol: "SMS",
      uri: uri,
      sellerFeeBasisPoints: 0,
      hasCreators: true,
      creators: creators,
      isMutable: true,
      collection: null,
      uses: null,
      isPrimarySaleHappened: null,
    },
  };

  // Serialize the data
  const serializedData = Buffer.alloc(1000); // Allocate a buffer with enough space
  const serializedLength = dataLayout.encode(data, serializedData);
  const serializedInstruction = serializedData.slice(0, serializedLength);

  return new TransactionInstruction({
    keys: accounts,
    programId: TOKEN_METADATA_PROGRAM_ID,
    data: serializedInstruction
  });
}
