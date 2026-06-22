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

    // Get the default printer set in Windows
    const printer = await qz.printers.getDefault();
    if (!printer) {
      throw new Error("No default printer found in the system.");
    }

    // Thermal-printer-specific config
    const config = qz.configs.create(printer, {
      colorType: 'blackwhite', // thermal printers print black only — prevents blank output
      margins: 0,              // no extra margins; let the HTML control spacing
      scaleContent: true,      // scale content to fit the 80mm paper width
    });

    // QZ Tray's Chromium renderer requires a full HTML document — a bare <div>
    // fragment causes the renderer to produce a blank page.
    const fullHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: 80mm;
        font-family: monospace;
        font-size: 13px;
        color: #000;
        background: #fff;
      }
    </style>
  </head>
  <body>${htmlString}</body>
</html>`;

    const data = [{
      type: 'pixel',
      format: 'html',
      flavor: 'plain',
      data: fullHtml,
      options: {
        pageWidth: '80mm',  // MUST be a string with unit — bare number is ignored by QZ Tray
        pageHeight: '0mm',  // 0 = auto / continuous feed (correct for thermal receipts)
      }
    }];

    await qz.print(config, data as any);
    console.log("Print job sent successfully to:", printer);
  } catch (error: any) {
    console.error("Print failed", error);
    throw new Error(error.message || "Failed to print receipt.");
  }
};
