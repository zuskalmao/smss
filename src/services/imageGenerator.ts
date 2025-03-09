import { createCanvas, loadImage, registerFont } from 'canvas';

// In a browser environment, we'll simulate canvas functionality
let canvas: any;
let ctx: any;

// Generator function for message images
export async function generateMessageImage(
  message: string, 
  senderAddress: string, 
  timestamp: number
): Promise<string> {
  console.log('Generating message image with text:', message);

  try {
    // Create canvas (simulated for browser)
    const canvasWidth = 1200;
    const canvasHeight = 630;

    // If we're in a Node.js environment with canvas
    if (typeof createCanvas === 'function') {
      canvas = createCanvas(canvasWidth, canvasHeight);
      ctx = canvas.getContext('2d');
    } else {
      // Browser fallback (simplified for this example)
      canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      ctx = canvas.getContext('2d');
    }

    // Set background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, '#6d28d9'); // Purple from Tailwind
    gradient.addColorStop(1, '#4c1d95'); // Darker purple
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Add border
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, canvasWidth - 40, canvasHeight - 40);

    // Set text properties
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 48px Arial';

    // Draw title
    ctx.fillText('$SMS Message', canvasWidth / 2, 100);
    
    // Draw message text (center-aligned with wrapping)
    const maxWidth = canvasWidth - 100;
    const lineHeight = 60;
    
    // Word wrap function for center-aligned text
    const wrapText = (text: string, maxWidth: number): string[] => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        
        if (width < maxWidth) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      
      lines.push(currentLine);
      return lines;
    };

    // Draw wrapped message text
    const messageLines = wrapText(message, maxWidth);
    const messageY = (canvasHeight / 2) - ((messageLines.length - 1) * lineHeight / 2);
    
    ctx.font = '36px Arial';
    messageLines.forEach((line, i) => {
      ctx.fillText(line, canvasWidth / 2, messageY + (i * lineHeight));
    });

    // Draw footer with sender address and timestamp
    ctx.font = '18px Arial';
    const date = new Date(timestamp);
    const dateString = date.toLocaleString();
    
    // Truncate long addresses
    const shortenedAddress = `${senderAddress.substring(0, 6)}...${senderAddress.substring(senderAddress.length - 6)}`;
    
    ctx.fillText(`From: ${shortenedAddress}`, canvasWidth / 2, canvasHeight - 100);
    ctx.fillText(`Sent: ${dateString}`, canvasWidth / 2, canvasHeight - 70);

    // Add $SMS branding
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Powered by $SMS Token', canvasWidth / 2, canvasHeight - 30);

    // Return the canvas as a data URL
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating message image:', error);
    
    // Return fallback image URL in case of error
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  }
}

// Generate metadata for the NFT
export function generateMetadata(
  imageUrl: string,
  message: string,
  senderAddress: string,
  recipientAddress: string,
  timestamp: number
): any {
  const date = new Date(timestamp);
  const dateString = date.toLocaleString();
  
  return {
    name: "SMS Message NFT",
    symbol: "SMS",
    description: `Message sent from ${senderAddress} to ${recipientAddress} on ${dateString}`,
    seller_fee_basis_points: 0,
    image: imageUrl,
    external_url: "https://sms-token.vercel.app/",
    attributes: [
      {
        trait_type: "Message",
        value: message.length > 50 ? message.substring(0, 50) + "..." : message
      },
      {
        trait_type: "Sender",
        value: senderAddress
      },
      {
        trait_type: "Recipient",
        value: recipientAddress
      },
      {
        trait_type: "Timestamp",
        value: timestamp.toString()
      }
    ],
    properties: {
      files: [
        {
          uri: imageUrl,
          type: "image/png"
        }
      ],
      category: "image",
      creators: [
        {
          address: senderAddress,
          share: 100
        }
      ]
    }
  };
}
