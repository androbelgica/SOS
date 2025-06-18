<!DOCTYPE html>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Cart & Cook - Product Label - {{ $product->name }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            font-size: 10px;
        }

        .label-container {
            width: 4in;
            height: 2in;
            border: 1px solid #000;
            padding: 10px;
            margin: 0 auto;
            page-break-inside: avoid;
            box-sizing: border-box;
        }

        .header {
            text-align: center;
            border-bottom: 1px solid #ccc;
            padding-bottom: 3px;
            margin-bottom: 5px;
        }

        .logo {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 2px;
        }

        .contact-info {
            font-size: 8px;
            margin-top: 2px;
        }

        .order-info {
            margin-bottom: 5px;
        }

        .product-info {
            margin-bottom: 5px;
        }

        .qr-code {
            text-align: center;
            margin: 5px 0;
        }

        .qr-code img {
            max-width: 100px;
            height: auto;
        }

        .verification-text {
            text-align: center;
            font-size: 8px;
            margin-top: 2px;
        }

        .processed-time {
            text-align: center;
            font-size: 9px;
            font-style: italic;
            margin-top: 3px;
        }

        .footer {
            text-align: center;
            font-size: 8px;
            margin-top: 5px;
            border-top: 1px solid #ccc;
            padding-top: 3px;
        }
    </style>
</head>

<body>
    <div class="label-container">
        <div class="header">
            <div class="logo">Cart & Cook</div>
            <div>Order #{{ $order->order_number }}</div>
            <div class="contact-info">
                <small>Contact: 0917-123-4567 | 123 Ocean Drive, Manila</small>
            </div>
        </div>

        <div class="order-info">
            <strong>Order Date:</strong> {{ $order->created_at->format('M d, Y') }}<br>
            <strong>Status:</strong> {{ ucfirst($order->status) }}
        </div>

        <div class="product-info">
            <strong>Product:</strong> {{ $product->name }}<br>
            <strong>Quantity:</strong> {{ $item->quantity }} {{ $product->unit_type === 'kg' ? 'grams' : 'pcs' }}<br>
            <strong>Unit Price:</strong> Php {{ number_format($item->price, 2) }} {{ $product->unit_type === 'kg' ? '/kg' : '/pc' }}<br>
            @php
            // Calculate subtotal based on product type
            if ($product->unit_type === 'kg') {
            $subtotal = $item->price * ($item->quantity / 1000); // Convert grams to kg for calculation
            } else {
            $subtotal = $item->price * $item->quantity;
            }
            @endphp
            <strong>Subtotal:</strong> Php {{ number_format($subtotal, 2) }}
        </div>

        <div class="qr-code">
            <img src="{{ $qrCodeUrl }}" alt="Verification QR Code">
            <div class="verification-text">
                Scan to verify product before payment
            </div>
        </div>

        <div class="processed-time">
            Processed: {{ now()->format('M d, Y h:i A') }}
        </div>

        <div class="footer">
            Thank you for shopping with Cart & Cook!
        </div>
    </div>
</body>

</html>