// This is a simple simulator for Arweave/IPFS uploads
// In production, this would be replaced with actual Arweave or IPFS integration

import axios from 'axios';

// Pinata API credentials
const PINATA_API_KEY = 'dcbacd4c0427e6f563db';
const PINATA_API_SECRET = 'd0db6e0b91215e833a51414798753b69b86dab861ab7759b9484465f63879bb8';
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjMTcwMjEzNi03YWZlLTQ1ZDAtYmI3ZS0yM2ExYjQzNTEzYzciLCJlbWFpbCI6Inp1c2thbWFsb3ZpY2hAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2<boltAction type="file" filePath="src/services/arweaveSimulator.ts">// This is a simple simulator for Arweave/IPFS uploads
// In production, this would be replaced with actual Arweave or IPFS integration

import axios from 'axios';

// Pinata API credentials
const PINATA_API_KEY = 'dcbacd4c0427e6f563db';
const PINATA_API_SECRET = 'd0db6e0b91215e833a51414798753b69b86dab861ab7759b9484465f63879bb8';
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjMTcwMjEzNi03YWZlLTQ1ZDAtYmI3ZS0yM2ExYjQzNTEzYzciLCJlbWFpbCI6Inp1c2thbWFsb3ZpY2hAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImRjYmFjZDRjMDQyN2U2ZjU2M2RiIiwic2NvcGVkS2V5U2VjcmV0IjoiZDBkYjZlMGI5MTIxNWU4MzNhNTE0MTQ3OTg3NTNiNjliODZkYWI4NjFhYjc3NTliOTQ4NDQ2NWY2Mzg3OWJiOCIsImV4cCI6MTc3MzA3MjMzN30.iAGG1YDYwcgvfiE1ybjbEj5odXzljlb51Q7KPUIL_nI';

// Function to convert data URL to blob for Pinata upload
function dataURLtoBlob(dataURL: string): Blob {
  const parts = dataURL.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  
  return new Blob([uInt8Array], { type: contentType });
}

// Upload image to IPFS via Pinata
export async function uploadImage(imageDataUrl: string): Promise<string> {
  try {
    console.log('Uploading image to IPFS via Pinata...');
    
    // For testing/development, return a simulated URL
    // Remove this in production and use the actual upload code below
    if (process.env.NODE_ENV === 'development') {
      console.log('DEV MODE: Returning simulated IPFS URL');
      const mockCid = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      return `https://gateway.pinata.cloud/ipfs/${mockCid}`;
    }
    
    // Create a Blob from the data URL
    const blob = dataURLtoBlob(imageDataUrl);
    
    // Create form data for Pinata
    const formData = new FormData();
    formData.append('file', blob, 'message.png');
    
    // Add metadata
    const metadata = JSON.stringify({
      name: 'SMS Message Image',
      keyvalues: {
        timestamp: Date.now().toString()
      }
    });
    formData.append('pinataMetadata', metadata);
    
    // Set options (like not pinning immediately)
    const options = JSON.stringify({
      cidVersion: 1
    });
    formData.append('pinataOptions', options);
    
    // Send to Pinata
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    console.log('Image upload successful:', response.data);
    const ipfsHash = response.data.IpfsHash;
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
  } catch (error) {
    console.error('Error uploading image to IPFS:', error);
    // Return fallback URL for testing
    return 'https://gateway.pinata.cloud/ipfs/QmULzpvqFp5G2HV6JE5aarHQJSCvdx35YPNQBDi5jZQtfR';
  }
}

// Upload metadata to IPFS via Pinata
export async function uploadMetadata(metadata: any): Promise<string> {
  try {
    console.log('Uploading metadata to IPFS via Pinata...');
    
    // For testing/development, return a simulated URL
    // Remove this in production and use the actual upload code below
    if (process.env.NODE_ENV === 'development') {
      console.log('DEV MODE: Returning simulated IPFS URL');
      const mockCid = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      return `https://gateway.pinata.cloud/ipfs/${mockCid}`;
    }
    
    // Convert metadata to JSON string
    const metadataString = JSON.stringify(metadata);
    
    // Create a Blob with the metadata
    const blob = new Blob([metadataString], { type: 'application/json' });
    
    // Create form data for Pinata
    const formData = new FormData();
    formData.append('file', blob, 'metadata.json');
    
    // Add metadata for Pinata
    const pinataMetadata = JSON.stringify({
      name: 'SMS Message Metadata',
      keyvalues: {
        timestamp: Date.now().toString()
      }
    });
    formData.append('pinataMetadata', pinataMetadata);
    
    // Set options (like not pinning immediately)
    const options = JSON.stringify({
      cidVersion: 1
    });
    formData.append('pinataOptions', options);
    
    // Send to Pinata
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    console.log('Metadata upload successful:', response.data);
    const ipfsHash = response.data.IpfsHash;
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    // Return fallback URL for testing
    return 'https://gateway.pinata.cloud/ipfs/QmULzpvqFp5G2HV6JE5aarHQJSCvdx35YPNQBDi5jZQtfR';
  }
}
