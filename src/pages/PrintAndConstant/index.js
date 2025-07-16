

export const config = {
    taxRate: 0.10, // 10%
    serviceChargeRate: 0.05, // 5%
    hotelName: 'Restaurant POS', // Generic hotel name
    cashierRole: 'Cashier',
};

export const PrintThisBill = (order) => {
    const parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

    const itemsHtml = parsedItems.map(item => `
        <tr class='table-row'>
            <td>${item.item_name}</td>
            <td class="text-center">${item.quantity}</td>
            <td class="text-right">₹${item.price.toFixed(2)}</td>
            <td class="text-right">₹${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    const invoiceDate = new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
                <title>Invoice ${order.order_id}</title>

            <link href="https://cdn.tailwindcss.com" rel="stylesheet">
         
              <style>
        /* Custom styles for print-specific adjustments */
        @media print {
            body {
                -webkit-print-color-adjust: exact; /* Ensures background colors and images are printed */
                print-color-adjust: exact;
                font-family: 'Inter', sans-serif; /* Ensure consistent font */
            }
            /* Hide elements not needed for print */
            .no-print {
                display: none !important;
            }
            /* Adjust margins for printing */
            @page {
                margin: 1cm;
            }
            /* Ensure tables break correctly across pages */
            table {
                page-break-inside: auto;
            }
            tr {
                page-break-inside: avoid;
                page-break-after: auto;
            }
            thead {
                display: table-header-group; /* Repeat table headers on each page */
            }
            tfoot {
                display: table-footer-group; /* Repeat table footers on each page */
            }
            /* Add some padding to avoid content touching edges on print */
            .invoice-container {
                padding: 0.5cm;
            }
        }
        /* General styles for Inter font and rounded corners */
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f3f4f6; /* Light gray background for preview */
            display: flex;
            justify-content: center;
            align-items: flex-start; /* Align to top for longer content */
            min-height: 100vh;
            padding: 2rem;
        }
        .invoice-container {
            max-width: 800px;
            width: 100%;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 0.75rem; /* Rounded corners for the main container */
            overflow: hidden; /* Ensures rounded corners are applied correctly */
            padding: 2rem;
            box-sizing: border-box; /* Include padding in element's total width and height */
        }
        .section-heading {
            border-bottom: 1px solid #e5e7eb; /* Light gray border for separation */
            padding-bottom: 0.5rem;
            margin-bottom: 1rem;
        }
        .table-header th {
            background-color: #f9fafb; /* Lighter background for table header */
            color: #4b5563; /* Darker text for table header */
            font-weight: 600;
            padding: 0.75rem 1rem;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        .table-row td {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #f3f4f6; /* Very light border for table rows */
        }
        .table-row:last-child td {
            border-bottom: none; /* No border for the last row */
        }
        .summary-row td {
            padding: 0.5rem 1rem;
        }
        .summary-row.total td {
            font-weight: 700;
            font-size: 1.125rem; /* Larger font for total */
            color: #1f2937; /* Darker color for total */
            border-top: 2px solid #e5e7eb; /* Stronger border for total */
            padding-top: 1rem;
        }
    </style>
        </head>
        <body>
            <div class="invoice">
                <div class="header">
                    <h1>Hotel <span class="highlight">${config.hotelName}}</span></h1>
                    <p>123 Main Street, Cityville, Maharashtra, India</p>
                    <p>Email: support@grandvibes.com | Contact: +91-9876543210</p>
                </div>

                <div class="details mb-6">
                    <p><strong>Invoice:</strong> ${order.order_id}</p>
                    <p><strong>Date:</strong> ${invoiceDate}</p>
                    <p><strong>Customer:</strong> ${order.customer_name || 'Walk-in Guest'}</p>
                    <p><strong>Table:</strong> ${order.table_name}</p>
                </div>

            

        <!-- Item List Section -->
        <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-800 mb-3 section-heading">Items:</h3>
            <div class="overflow-x-auto rounded-md border border-gray-200">
                <table class="min-w-full bg-white">
                    <thead>
                        <tr class="table-header">
                            <th class="rounded-tl-md">Item</th>
                            <th>Quantity</th>
                            <th class="text-right">Price</th>
                            <th class="text-right rounded-tr-md">Total</th>
                        </tr>
                    </thead>
                    <tbody id="item-list">
                        <!-- Item rows will be dynamically inserted here by JavaScript -->
                        ${itemsHtml}
                    </tbody>
                </table>
            </div>
        </div>



 <!-- Financial Summary Section -->
        <div class="flex justify-end mb-8">
            <div class="w-full md:w-1/2 lg:w-2/5 rounded-md border border-gray-200 p-4 bg-gray-50">
                <table class="w-full text-gray-700 text-sm">
                    <tbody>
                        <tr class="summary-row">
                            <td class="font-medium">Subtotal:</td>
                            <td class="text-right" id="subtotal">₹${parseFloat(order.subtotal).toFixed(2)}</td>
                        </tr>
                        <tr class="summary-row">
                            <td class="font-medium">${config?.taxRate * 100}% Tax (Inclusive of Subtotal:</td>
                            <td class="text-right" id="tax"> ₹${parseFloat(order.tax).toFixed(2)}</td>
                        </tr>
                        <tr class="summary-row">
                            <td class="font-medium">Serervice Charge (5% of Total):</td>
                            <td class="text-right" id="tax"> ₹${parseFloat(order?.service_charge).toFixed(2)}</td>
                        </tr>
                        <tr class="summary-row">
                            <td class="font-medium">Discount:</td>
                            <td class="text-right text-red-600" id="discount">-₹${parseFloat(order.discount).toFixed(2)}</td>
                        </tr>
                        <tr class="summary-row total">
                            <td class="font-bold text-lg">Total Due:</td>
                            <td class="text-right font-bold text-lg text-blue-700" id="total">₹${parseFloat(order.total).toFixed(2)}</td>
                        </tr>
                        <tr class="summary-row mt-2">
                            <td class="font-medium">Payment Method:</td>
                            <td class="text-right" id="payment-method"><strong>${order.payment_method || 'Not Paid'}</strong></td>
                        </tr>
                        <tr class="summary-row">
                            <td class="font-medium">Status:</td>
                            <td class="text-right text-green-600 font-semibold" id="payment-status">${order?.payment_status?.toUpperCase()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>


                <!-- Footer Message -->
        <div class="text-center text-gray-600 text-sm mt-8 pt-4 border-t border-gray-200">
            <p class="mb-1">Thank you for choosing Hotel Grand Stay! We appreciate your business.</p>
            <p>For support, please contact us at support@hotelgrandstay.com or call +1 (555) 123-4567.</p>
            <p class="mt-4 text-xs">This is a computer-generated invoice and does not require a signature.</p>
        </div>
    </div>
            </div>
              <script src="https://cdn.tailwindcss.com"></script>
            <script>
                window.onload = () => window.print();
                window.cancel()
                
            </script>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
}

export const parseItems = (itemStr) => {
    try {
        if (typeof itemStr === 'string') {
            const parsed = JSON.parse(itemStr);
            return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
        } else if (Array.isArray(itemStr)) {
            return itemStr;
        } else {
            console.warn('Unexpected item format:', itemStr);
            return [];
        }
    } catch (e) {
        console.error("Failed to parse items", itemStr);
        return [];
    }
};



export default PrintThisBill;
