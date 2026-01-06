
// Utility to generate Pix Payload (EMV BR Code)
// Based on standard specifications for static Pix QR Codes

function crc16ccitt(payload: string): string {
    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
        let x = ((crc >> 8) ^ payload.charCodeAt(i)) & 0xFF;
        x ^= x >> 4;
        crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xFFFF;
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatField(id: string, value: string): string {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
}

export function generatePixCopyPaste(
    key: string,
    name: string,
    city: string,
    amount?: number | string,
    txId: string = '***'
): string {
    const cleanKey = key.trim();
    const cleanName = name.substring(0, 25).trim(); // Max 25 chars
    const cleanCity = city.substring(0, 15).trim(); // Max 15 chars
    const cleanTxId = txId.substring(0, 25).trim() || '***';

    let payload =
        formatField('00', '01') + // Payload Format Indicator
        formatField('26',
            formatField('00', 'BR.GOV.BCB.PIX') +
            formatField('01', cleanKey)
        ) + // Merchant Account Information
        formatField('52', '0000') + // Merchant Category Code
        formatField('53', '986'); // Transaction Currency (BRL)

    if (amount) {
        payload += formatField('54', Number(amount).toFixed(2));
    }

    payload += formatField('58', 'BR') + // Country Code
        formatField('59', cleanName) + // Merchant Name
        formatField('60', cleanCity) + // Merchant City
        formatField('62', formatField('05', cleanTxId)); // Additional Data Field Template

    payload += '6304'; // CRC16 ID + Length

    const crc = crc16ccitt(payload);
    return payload + crc;
}
