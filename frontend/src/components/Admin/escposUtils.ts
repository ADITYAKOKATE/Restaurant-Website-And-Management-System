import { POSActiveOrder } from './adminTypes';



const ESC = '\x1B';
const GS = '\x1D';

const INIT = ESC + '@';
const ALIGN_LEFT = ESC + 'a' + '\x00';
const ALIGN_CENTER = ESC + 'a' + '\x01';
const ALIGN_RIGHT = ESC + 'a' + '\x02';
const BOLD_ON = ESC + 'E' + '\x01';
const BOLD_OFF = ESC + 'E' + '\x00';
const DOUBLE_ON = GS + '!' + '\x11'; // double width + double height
const DOUBLE_OFF = GS + '!' + '\x00';
const FEED_CUT = '\n\n\n' + GS + 'V' + '\x42' + '\x00'; // feed + partial cut


export const LINE_WIDTH = 42;

// --- Text layout helpers -------------------------------------------------

function padRight(str: string, len: number): string {
  if (str.length >= len) return str.slice(0, len);
  return str + ' '.repeat(len - str.length);
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str.slice(0, len);
  return ' '.repeat(len - str.length) + str;
}

function centerLine(str: string, width = LINE_WIDTH): string {
  if (str.length >= width) return str.slice(0, width);
  const totalPad = width - str.length;
  const left = Math.floor(totalPad / 2);
  return ' '.repeat(left) + str;
}

function dashLine(width = LINE_WIDTH): string {
  return '-'.repeat(width) + '\n';
}


function wrapText(text: string, width: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? current + ' ' + word : word;
    if (candidate.length > width) {
      if (current) lines.push(current);
      // word itself longer than width — hard-break it
      if (word.length > width) {
        let remaining = word;
        while (remaining.length > width) {
          lines.push(remaining.slice(0, width));
          remaining = remaining.slice(width);
        }
        current = remaining;
      } else {
        current = word;
      }
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [''];
}

function twoCol(left: string, right: string, width = LINE_WIDTH): string {
  const space = Math.max(1, width - left.length - right.length);
  return left + ' '.repeat(space) + right + '\n';
}

// --- KOT builder -----------------------------------------------------

export function buildKotEscPos(
  order: POSActiveOrder,
  restaurantName = 'HOTEL PREMACHA WADA'
): string {
  const tableLabel =
    order.tableNumber >= 101 ? `P${order.tableNumber - 100}` : `Table ${order.tableNumber}`;

  const time = new Date(order.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  let out = '';
  out += INIT;
  out += ALIGN_CENTER + DOUBLE_ON + BOLD_ON;
  out += 'KOT\n';
  out += DOUBLE_OFF;
  out += padRight(restaurantName, LINE_WIDTH).trim() + '\n';
  out += BOLD_OFF;
  out += ALIGN_LEFT;
  out += dashLine();

  out += twoCol(`Token: #${order.tokenNumber}`, tableLabel);
  out += `Time: ${time}\n`;
  out += dashLine();

  out += BOLD_ON;
  out += twoCol('Item', 'Qty');
  out += BOLD_OFF;
  out += dashLine();

  const nameWidth = LINE_WIDTH - 6;
  for (const item of order.items) {
    const lines = wrapText(item.name, nameWidth);
    out += BOLD_ON;
    lines.forEach((line, idx) => {
      if (idx === lines.length - 1) {
        out += twoCol(line, `x${item.quantity}`);
      } else {
        out += line + '\n';
      }
    });
    out += BOLD_OFF;
  }

  if (order.specialInstructions) {
    out += dashLine();
    out += 'Note: ' + order.specialInstructions + '\n';
  }

  out += dashLine();
  out += ALIGN_CENTER + BOLD_ON;
  out += '*** Kitchen Copy ***\n';
  out += BOLD_OFF + ALIGN_LEFT;

  out += FEED_CUT;
  return out;
}

// --- Bill builder -----------------------------------------------------

export function buildBillEscPos(
  order: POSActiveOrder,
  restaurantName = 'HOTEL PREMACHA WADA',
  cashierName = 'biller'
): string {
  const tableLabel =
    order.tableNumber >= 101 ? `${order.tableNumber - 100}` : `${order.tableNumber}`;

  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);

  const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });

  let out = '';
  out += INIT;
  out += ALIGN_CENTER + BOLD_ON + DOUBLE_ON;
  out += restaurantName + '\n';
  out += DOUBLE_OFF + BOLD_OFF;
  out += 'GADE WASTI, NEXT TO PERFECT\n';
  out += 'VAJAN KATA, NAGAR ROAD,\n';
  out += 'WAGHOLI, PUNE - 412207\n';
  out += ALIGN_LEFT;
  out += dashLine();

  out += BOLD_ON + `Name: ${order.user?.name || 'Walk-In'}\n` + BOLD_OFF;
  out += dashLine();

  out += twoCol(`Date: ${dateStr}`, `Dine In: ${tableLabel}`);
  const cashierField = `Cashier: ${cashierName}`.slice(0, LINE_WIDTH - 14);
  out += twoCol(cashierField, `Bill No.: ${order.tokenNumber}`);
  out += dashLine();

  // Column layout: name | qty | amount
  const qtyW = 5;
  const amtW = 10;
  const nameW = LINE_WIDTH - qtyW - amtW;

  out += BOLD_ON;
  out += padRight('Item', nameW) + padLeft('Qty', qtyW) + padLeft('Amount', amtW) + '\n';
  out += BOLD_OFF;
  out += dashLine();

  for (const item of order.items) {
    const lines = wrapText(item.name, nameW);
    lines.forEach((line, idx) => {
      if (idx === lines.length - 1) {
        const amount = (item.price * item.quantity).toFixed(2);
        out +=
          padRight(line, nameW) + padLeft(String(item.quantity), qtyW) + padLeft(amount, amtW) + '\n';
      } else {
        out += line + '\n';
      }
    });
    // price-per-unit reference line, small/plain
    out += `  @ Rs.${item.price.toFixed(2)}\n`;
  }

  out += dashLine();
  out += twoCol(`Total Qty : ${totalQty}`, `Rs.${subtotal.toFixed(2)}`);

  if (order.discountAmount > 0) {
    out += twoCol('Discount', `-Rs.${order.discountAmount.toFixed(2)}`);
  }
  if (order.taxAmount > 0) {
    out += twoCol('GST', `Rs.${order.taxAmount.toFixed(2)}`);
  }

  out += dashLine();
  out += BOLD_ON + DOUBLE_ON;
  out += 'GRAND TOTAL\n';
  out += `Rs.${order.totalAmount.toFixed(2)}\n`;
  out += DOUBLE_OFF + BOLD_OFF;
  out += dashLine();

  out += ALIGN_CENTER + BOLD_ON;
  out += 'THANK YOU\nVISIT AGAIN !!\n';
  out += BOLD_OFF + ALIGN_LEFT;

  out += FEED_CUT;
  return out;
}
