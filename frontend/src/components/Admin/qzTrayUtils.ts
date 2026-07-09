import qz from 'qz-tray';

let isConnected = false;

export const connectQZ = async () => {
  if (isConnected || qz.websocket.isActive()) {
    isConnected = true;
    return;
  }

  try {
    await qz.websocket.connect({
      retries: 2,
      delay: 1,
    });

    isConnected = true;
  } catch (error) {
    console.error("Failed to connect to QZ Tray", error);
    throw new Error(
      "Could not connect to QZ Tray. Please ensure the QZ Tray application is running."
    );
  }
};

/**
 * Prints raw ESC/POS commands directly — no HTML rendering, no rasterization.
 * The printer draws its own built-in font glyphs at full darkness, which is
 * what avoids the faded/greyish output that rasterized HTML printing produces
 * on thermal printers. Use with escposUtils.ts (buildBillEscPos / buildKotEscPos).
 */
export const printRawReceipt = async (escposString: string) => {
  try {
    await connectQZ();

    const printer = await qz.printers.getDefault();

    if (!printer) {
      throw new Error("No default printer found.");
    }

    // No pixel/rasterize options here — this is a raw passthrough config.
    const config = qz.configs.create(printer);

    const data = [
      {
        type: "raw",
        format: "plain",
        data: escposString,
      },
    ];

    await qz.print(config, data as any);

    console.log("Printed Successfully (raw ESC/POS)");
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message || "Printing Failed");
  }
};

export const printHtmlReceipt = async (htmlString: string) => {
  try {
    await connectQZ();

    const printer = await qz.printers.getDefault();

    if (!printer) {
      throw new Error("No default printer found.");
    }

    const config = qz.configs.create(printer, {
      colorType: "blackwhite",
      margins: 0,

      // Changed
      scaleContent: false,

      // Try native printer resolution
      density: 203,

      // Better rendering
      interpolation: false,

      rasterize: true,
    });

    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>

<style>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;

    color:#000 !important;
    font-weight:700 !important;

    -webkit-font-smoothing:none;
    text-rendering:geometricPrecision;
}

html{
    width:80mm;
}

body{

    width:80mm;

    font-family:"Courier New", monospace;

    font-size:15px;

    font-weight:700;

    background:#fff;

    color:#000;

    image-rendering:pixelated;
}

table{
    width:100%;
    border-collapse:collapse;
}

td,th{

    font-size:15px !important;

    font-weight:700 !important;

}

h1,h2,h3,h4,h5,h6{

    font-weight:900 !important;

}

</style>

</head>

<body>

${htmlString}

</body>

</html>
`;

    const data = [
      {
        type: "pixel",
        format: "html",
        flavor: "plain",
        data: fullHtml,
        options: {
          pageWidth: "80mm",
          pageHeight: "0mm",
        },
      },
    ];

    await qz.print(config, data as any);

    console.log("Printed Successfully");
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message || "Printing Failed");
  }
};
