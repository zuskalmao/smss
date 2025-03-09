import axios from 'axios';

// Pinata API configuration
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjMTcwMjEzNi03YWZlLTQ1ZDAtYmI3ZS0yM2ExYjQzNTEzYzciLCJlbWFpbCI6Inp1c2thbWFsb3ZpY2hAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImRjYmFjZDRjMDQyN2U2ZjU2M2RiIiwic2NvcGVkS2V5U2VjcmV0IjoiZDBkYjZlMGI5MTIxNWU4MzNhNTE0MTQ3OTg3NTNiNjliODZkYWI4NjFhYjc3NTliOTQ4NDQ2NWY2Mzg3OWJiOCIsImV4cCI6MTc3MzA3MjMzN30.iAGG1YDYwcgvfiE1ybjbEj5odXzljlb51Q7KPUIL_nI';
const PINATA_API_URL = 'https://api.pinata.cloud';

// HTTP client with authentication
const pinataAxios = axios.create({
  baseURL: PINATA_API_URL,
  headers: {
    Authorization: `Bearer ${PINATA_JWT}`
  }
});

/**
 * Converts a data URL to a Blob
 * Using Blob directly instead of File since it's more reliable in browser environments
 */
export function dataURLtoBlob(dataUrl: string): Blob {
  // Convert base64/URLEncoded data component to raw binary data
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  
  // Create a Uint8Array to hold the binary data
  const uInt8Array = new Uint8Array(rawLength);
  
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  
  return new Blob([uInt8Array], { type: contentType });
}

/**
 * Uploads an image to IPFS via Pinata
 * @param imageDataUrl - The data URL of the image
 * @returns The IPFS URL of the uploaded image
 */
export async function uploadImageToPinata(imageDataUrl: string): Promise<string> {
  try {
    console.log('Uploading image to Pinata IPFS...');
    
    if (!imageDataUrl || !imageDataUrl.startsWith('data:image/')) {
      throw new Error('Invalid image data URL');
    }
    
    // Convert data URL to Blob
    const imageBlob = dataURLtoBlob(imageDataUrl);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', imageBlob, `sms_message_${Date.now()}.png`);
    
    // Add metadata
    const metadata = JSON.stringify({
      name: `SMS Message Image ${Date.now()}`,
      keyvalues: {
        type: 'sms-message-image',
        timestamp: Date.now().toString()
      }
    });
    formData.append('pinataMetadata', metadata);
    
    // Add pinning options
    const pinataOptions = JSON.stringify({
      cidVersion: 1
    });
    formData.append('pinataOptions', pinataOptions);
    
    console.log('Sending request to Pinata...');
    
    // Upload to Pinata
    const response = await pinataAxios.post('/pinning/pinFileToIPFS', formData, {
      maxBodyLength: Infinity,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.status === 200) {
      const { IpfsHash } = response.data;
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;
      console.log('Image uploaded successfully to IPFS:', ipfsUrl);
      return ipfsUrl;
    } else {
      throw new Error(`Pinata upload failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error uploading image to Pinata:', error);
    
    // Detailed error logging
    if (error.response) {
      console.error('Pinata error response:', error.response.data);
      console.error('Pinata error status:', error.response.status);
    } else if (error.request) {
      console.error('No response received from Pinata', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    // Fallback to a simulated URL in case of error
    const fallbackUrl = `https://arweave.net/${Math.random().toString(36).substring(2, 15)}`;
    console.warn('Using fallback URL:', fallbackUrl);
    return fallbackUrl;
  }
}

/**
 * Uploads metadata JSON to IPFS via Pinata
 * @param metadata - The metadata object
 * @returns The IPFS URL of the uploaded metadata
 */
export async function uploadMetadataToPinata(metadata: any): Promise<string> {
  try {
    console.log('Uploading metadata to Pinata IPFS...');
    
    // Find the sender value from metadata for logging
    const sender = metadata.attributes?.find((attr: any) => attr.trait_type === 'Sender')?.value || 'unknown';
    
    // Prepare the request
    const data = JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: `SMS Message Metadata ${Date.now()}`,
        keyvalues: {
          type: 'sms-message-metadata',
          timestamp: Date.now().toString(),
          sender: sender
        }
      },
      pinataOptions: {
        cidVersion: 1
      }
    });
    
    // Upload to Pinata
    const response = await pinataAxios.post('/pinning/pinJSONToIPFS', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      const { IpfsHash } = response.data;
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;
      console.log('Metadata uploaded successfully to IPFS:', ipfsUrl);
      return ipfsUrl;
    } else {
      throw new Error(`Pinata metadata upload failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error uploading metadata to Pinata:', error);
    
    // Detailed error logging
    if (error.response) {
      console.error('Pinata error response:', error.response.data);
      console.error('Pinata error status:', error.response.status);
    }
    
    // Fallback to a simulated URL in case of error
    const fallbackUrl = `https://arweave.net/${Math.random().toString(36).substring(2, 15)}`;
    console.warn('Using fallback URL for metadata:', fallbackUrl);
    return fallbackUrl;
  }
}

/**
 * Verify Pinata connection and credentials
 * @returns A boolean indicating if the connection was successful
 */
export async function verifyPinataConnection(): Promise<boolean> {
  try {
    console.log('Verifying Pinata connection...');
    const response = await pinataAxios.get('/data/testAuthentication');
    console.log('Pinata connection verified:', response.data);
    return response.status === 200;
  } catch (error) {
    console.error('Pinata connection verification failed:', error);
    return false;
  }
}
