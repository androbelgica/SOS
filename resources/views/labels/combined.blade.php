<!DOCTYPE html>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Cart & Cook - Order Labels - {{ $order->order_number }}</title>
    <style>
        @page {
            size: A4;
            margin: 1cm;
        }

        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            font-size: 10px;
            width: 100%;
        }

        .page-header {
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid #000;
        }

        .page-title {
            font-size: 14px;
            font-weight: bold;
        }

        .order-info {
            margin-bottom: 15px;
            font-size: 10px;
        }

        .labels-page {
            width: 100%;
            height: 100%;
            page-break-after: always;
        }

        .labels-grid {
            display: grid;
            /* 2 labels per row */
            grid-template-columns: 1fr 1fr;
            /* 2 labels per column */
            grid-template-rows: 1fr 1fr;
            gap: 0.5cm;
            width: 100%;
            height: 100%;
        }

        .label-container {
            border: 1px solid #000;
            padding: 8px;
            box-sizing: border-box;
            /* Fixed size: 2 inches height, 4 inches width */
            height: 2in;
            width: 4in;
            display: flex;
            flex-direction: column;
            margin-bottom: 0.5cm;
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

        .product-info {
            margin-bottom: 5px;
            flex-grow: 1;
        }

        .qr-code {
            text-align: center;
            margin: 5px 0;
        }

        .qr-code img {
            max-width: 80px;
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

        .page-break {
            page-break-after: always;
        }
    </style>
</head>

<body>
    <div class="page-header">
        <div class="page-title">Cart & Cook</div>
        <div>Order #{{ $order->order_number }}</div>
        <div>Date: {{ $order->created_at->format('M d, Y') }}</div>
        <div>Contact: 0917-123-4567 | 123 Ocean Drive, Manila</div>
    </div>

    <div class="order-info">
        <strong>Customer:</strong> {{ $order->user->name }} |
        <strong>Email:</strong> {{ $order->user->email }} |
        <strong>Status:</strong> {{ ucfirst($order->status) }} |
        <strong>Payment Status:</strong> {{ ucfirst($order->payment_status) }}
    </div>

    @php
    $labelsCount = count($labels);
    $pageCount = ceil($labelsCount / 4);
    @endphp

    @for ($page = 0; $page < $pageCount; $page++)
        <div class="labels-page">
        <div class="labels-grid">
            @for ($i = $page * 4; $i < min(($page + 1) * 4, $labelsCount); $i++)
                @php
                $label=$labels[$i];
                $orderItem=$order->items->where('product_id', $label->product_id)->first();
                $quantity = $orderItem ? $orderItem->quantity : 0;
                $unitPrice = $orderItem ? $orderItem->price : 0;

                // Calculate subtotal based on product type
                if ($label->product->unit_type === 'kg') {
                $subtotal = $unitPrice * ($quantity / 1000); // Convert grams to kg for calculation
                } else {
                $subtotal = $unitPrice * $quantity;
                }

                $processedTime = $label->created_at->format('M d, Y h:i A');
                @endphp

                <div class="label-container">
                    <div class="header">
                        <div class="logo">Cart & Cook</div>
                        <div>Order #{{ $order->order_number }}</div>
                        <div class="contact-info">
                            <small>Contact: 0917-123-4567 | 123 Ocean Drive, Manila</small>
                        </div>
                    </div>

                    <div class="product-info">
                        <strong>Product:</strong> {{ $label->product->name }}<br>
                        <strong>Quantity:</strong> {{ $quantity }} {{ $label->product->unit_type === 'kg' ? 'grams' : 'pcs' }}<br>
                        <strong>Unit Price:</strong> Php {{ number_format($unitPrice, 2) }} {{ $label->product->unit_type === 'kg' ? '/kg' : '/pc' }}<br>
                        <strong>Subtotal:</strong> Php {{ number_format($subtotal, 2) }}
                    </div>

                    <div class="qr-code">
                        @php
                        // Generate QR code directly in the template
                        $renderer = new \BaconQrCode\Renderer\ImageRenderer(
                        new \BaconQrCode\Renderer\RendererStyle\RendererStyle(150),
                        new \BaconQrCode\Renderer\Image\SvgImageBackEnd()
                        );
                        $writer = new \BaconQrCode\Writer($renderer);
                        $qrCodeSvg = $writer->writeString($label->qr_code_path);
                        $qrCodeDataUri = 'data:image/svg+xml;base64,' . base64_encode($qrCodeSvg);
                        @endphp
                        <img src="{{ $qrCodeDataUri }}" alt="Verification QR Code">
                        <div class="verification-text">
                            Scan to verify product
                        </div>
                    </div>

                    <div class="processed-time">
                        Processed: {{ $processedTime }}
                    </div>

                    <div class="footer">
                        Thank you for shopping with Cart & Cook!
                    </div>
                </div>
                @endfor
        </div>
        </div>

        @if($page < $pageCount - 1)
            <div class="page-break">
            </div>
            @endif
            @endfor
</body>

</html>