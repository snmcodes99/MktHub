const PDFDocument = require("pdfkit");

const generateInvoicePDF = (order) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: "A4",
            margin: 50
        });

        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
        doc.on("error", reject);

        // Professional Color Palette
        const primaryColor = "#2563eb";
        const darkText = "#111827";
        const secondaryText = "#4b5563";
        const lightGray = "#f3f4f6";
        const borderColor = "#e5e7eb";

        // ===========================================
        // HEADER
        // ===========================================
        
        // Company Name (Left)
        doc.font("Helvetica-Bold").fontSize(28).fillColor(primaryColor).text("MktHub", 50, 50);
        doc.font("Helvetica").fontSize(10).fillColor(secondaryText).text("www.mkthub.com", 50, 80);

        // Invoice Text & Details (Right)
        doc.font("Helvetica-Bold").fontSize(22).fillColor(darkText).text("INVOICE", 400, 50, { align: "right" });
        
        doc.font("Helvetica").fontSize(10).fillColor(secondaryText);
        doc.text(`Invoice No: ${order.orderNumber}`, 300, 80, { align: "right" });
        // Using string slicing safely for _id in case it's an object id
        const orderIdString = (order._id || "").toString().slice(-8).toUpperCase();
        doc.text(`Order ID: ${orderIdString}`, 300, 95, { align: "right" });
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`, 300, 110, { align: "right" });

        doc.moveDown(2);
        
        // Header separator line
        doc.moveTo(50, 135).lineTo(545, 135).lineWidth(1).strokeColor(borderColor).stroke();

        // ===========================================
        // CUSTOMER & SHIPPING DETAILS
        // ===========================================
        const addressY = 155;
        const leftX = 50;
        const rightX = 300;

        // Bill To (Left)
        doc.font("Helvetica-Bold").fontSize(11).fillColor(darkText).text("Bill To:", leftX, addressY);
        doc.font("Helvetica").fontSize(10).fillColor(secondaryText);
        doc.text(order.user.name, leftX, addressY + 15);
        doc.text(order.user.email, leftX, addressY + 30);
        if (order.user.phone) {
            doc.text(order.user.phone, leftX, addressY + 45);
        }

        // Ship To (Right)
        doc.font("Helvetica-Bold").fontSize(11).fillColor(darkText).text("Ship To:", rightX, addressY);
        doc.font("Helvetica").fontSize(10).fillColor(secondaryText);
        
        const address = order.shippingAddress;
        let currentY = addressY + 15;
        if (address.name) {
            doc.text(address.name, rightX, currentY);
            currentY += 15;
        }
        doc.text(`${address.houseNo}, ${address.street}`, rightX, currentY);
        currentY += 15;
        doc.text(`${address.city}, ${address.state}`, rightX, currentY);
        currentY += 15;
        doc.text(`${address.country} - ${address.zipCode}`, rightX, currentY);
        currentY += 15;
        if (address.phoneNo) {
            doc.text(`Phone: ${address.phoneNo}`, rightX, currentY);
        }

        // ===========================================
        // PRODUCT TABLE
        // ===========================================
        const tableTop = 270;
        
        // Table Header Background (Soft gray)
        doc.rect(50, tableTop, 495, 25).fill(lightGray);

        const columns = {
            sno: 60,
            product: 100,
            qty: 320,
            price: 380,
            total: 460
        };

        // Table Header Text
        doc.font("Helvetica-Bold").fontSize(10).fillColor(darkText);
        const headerY = tableTop + 8;
        doc.text("#", columns.sno, headerY);
        doc.text("Product", columns.product, headerY);
        doc.text("Qty", columns.qty, headerY, { width: 40, align: "center" });
        doc.text("Price", columns.price, headerY, { width: 70, align: "right" });
        doc.text("Total", columns.total, headerY, { width: 70, align: "right" });

        // Table Rows
        let rowY = tableTop + 35;
        doc.font("Helvetica").fontSize(10).fillColor(secondaryText);

        order.items.forEach((item, index) => {
            const lineTotal = item.quantity * item.sellingPrice;

            // Handle page breaks if there are too many items
            if (rowY > 700) {
                doc.addPage();
                rowY = 50;
            }

            doc.text(index + 1, columns.sno, rowY);
            doc.text(item.productName, columns.product, rowY, { width: 200 });
            doc.text(item.quantity.toString(), columns.qty, rowY, { width: 40, align: "center" });
            // Using Rs. instead of ₹ because default PDFKit fonts don't support the rupee symbol and render it as a glitchy quote
            doc.text(`Rs. ${item.sellingPrice.toFixed(2)}`, columns.price, rowY, { width: 70, align: "right" });
            doc.text(`Rs. ${lineTotal.toFixed(2)}`, columns.total, rowY, { width: 70, align: "right" });

            rowY += 25; // Move down for the next row
            
            // Draw faint row separator line
            doc.moveTo(50, rowY - 10).lineTo(545, rowY - 10).lineWidth(0.5).strokeColor(borderColor).stroke();
        });

        // ===========================================
        // SUMMARY & PAYMENT DETAILS
        // ===========================================
        const summaryTop = rowY + 15;

        // Payment Details (Left side)
        doc.font("Helvetica-Bold").fontSize(11).fillColor(darkText).text("Payment Info", 50, summaryTop);
        doc.font("Helvetica").fontSize(10).fillColor(secondaryText);
        doc.text(`Method: ${order.paymentMethod}`, 50, summaryTop + 20);
        doc.text(`Status: ${order.paymentStatus}`, 50, summaryTop + 35);

        // Totals (Right side)
        const labelX = 350;
        const valueX = 460;

        doc.font("Helvetica").fontSize(10).fillColor(secondaryText);
        doc.text("Subtotal:", labelX, summaryTop);
        doc.text(`Rs. ${order.totalPrice.toFixed(2)}`, valueX, summaryTop, { width: 70, align: "right" });

        // A line above grand total
        doc.moveTo(labelX, summaryTop + 20).lineTo(545, summaryTop + 20).lineWidth(1).strokeColor(borderColor).stroke();

        doc.font("Helvetica-Bold").fontSize(12).fillColor(primaryColor);
        doc.text("Grand Total:", labelX, summaryTop + 30);
        doc.text(`Rs. ${order.totalPrice.toFixed(2)}`, valueX, summaryTop + 30, { width: 70, align: "right" });

        // ===========================================
        // FOOTER
        // ===========================================
        // Position footer at the bottom of the page
        const footerY = 740;
        doc.moveTo(50, footerY - 10).lineTo(545, footerY - 10).lineWidth(1).strokeColor(borderColor).stroke();

        doc.font("Helvetica-Bold").fontSize(10).fillColor(darkText).text("Thank you for shopping with MktHub!", 50, footerY, { align: "center", width: 495 });
        doc.font("Helvetica").fontSize(9).fillColor("#9ca3af").text("For support, contact support@mkthub.com", 50, footerY + 15, { align: "center", width: 495 });
        doc.text("This is a computer-generated invoice and does not require a signature.", 50, footerY + 28, { align: "center", width: 495 });

        doc.end();
    });
};

module.exports = {
    generateInvoicePDF
};