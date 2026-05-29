import qz from 'qz-tray';

let isConnected = false;

export const connectQZ = async () => {
  if (isConnected || qz.websocket.isActive()) {
    isConnected = true;
    return;
  }
  try {
    await qz.websocket.connect({ retries: 2, delay: 1 });
    isConnected = true;
  } catch (error) {
    console.error("Failed to connect to QZ Tray", error);
    throw new Error("Could not connect to QZ Tray. Please ensure the QZ Tray application is running on your machine.");
  }
};

export const printHtmlReceipt = async (htmlString: string) => {
  try {
    await connectQZ();
    
    // Attempt to get the default printer
    const printer = await qz.printers.getDefault();
    if (!printer) {
      throw new Error("No default printer found in the system.");
    }

    const config = qz.configs.create(printer);
    
    // Using 'pixel' printing for HTML format is optimal for receipts
    const data = [{
      type: 'pixel',
      format: 'html',
      flavor: 'plain',
      data: htmlString,
      options: {
        // Typical thermal printer width is 80mm
        // Adjust if needed
        pageWidth: 80, 
      }
    }];

    await qz.print(config, data as any);
    console.log("Print job sent successfully to:", printer);
  } catch (error: any) {
    console.error("Print failed", error);
    throw new Error(error.message || "Failed to print receipt.");
  }
};
