<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductLabel;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

class LabelGenerationService
{
    /**
     * Generate QR codes and labels for all items in an order
     *
     * @param Order $order
     * @return array
     */
    public function generateLabelsForOrder(Order $order): array
    {
        $generatedLabels = [];

        // Process each order item
        foreach ($order->items as $item) {
            $label = $this->generateLabelForOrderItem($order, $item);
            if ($label) {
                $generatedLabels[] = $label;
            }
        }

        return $generatedLabels;
    }

    /**
     * Generate a label for a specific order item
     *
     * @param Order $order
     * @param OrderItem $item
     * @return ProductLabel|null
     */
    public function generateLabelForOrderItem(Order $order, OrderItem $item): ?ProductLabel
    {
        // Generate a unique verification URL for this product in this order
        $verificationUrl = route('orders.verify', [
            'order' => $order->id,
            'product' => $item->product_id
        ]);

        // Generate QR code as SVG and embed it directly
        $renderer = new ImageRenderer(
            new RendererStyle(200),
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);
        $qrCodeSvg = $writer->writeString($verificationUrl);

        // Convert to data URI for embedding in HTML
        $qrCodeDataUri = 'data:image/svg+xml;base64,' . base64_encode($qrCodeSvg);

        // Generate PDF label
        $labelFileName = 'labels/' . $order->order_number . '_' . $item->product_id . '.pdf';
        $labelPath = 'public/' . $labelFileName;

        // Prepare data for the PDF view
        $data = [
            'order' => $order,
            'item' => $item,
            'product' => $item->product,
            'qrCodeUrl' => $qrCodeDataUri,
            'verificationUrl' => $verificationUrl
        ];

        // Generate PDF
        $pdf = PDF::loadView('labels.product', $data);

        // Save PDF to storage
        Storage::put($labelPath, $pdf->output());

        // Create or update the product label record
        return ProductLabel::updateOrCreate(
            [
                'order_id' => $order->id,
                'product_id' => $item->product_id,
            ],
            [
                'qr_code_path' => $verificationUrl, // Store the verification URL
                'label_path' => $labelFileName,
                'is_printed' => false,
            ]
        );
    }

    /**
     * Mark a label as printed
     *
     * @param ProductLabel $label
     * @return bool
     */
    public function markAsPrinted(ProductLabel $label): bool
    {
        return $label->update(['is_printed' => true]);
    }

    /**
     * Get the PDF for a specific label
     *
     * @param ProductLabel $label
     * @return \Barryvdh\DomPDF\PDF|null
     */
    public function getLabelPdf(ProductLabel $label)
    {
        if (!$label->label_path || !Storage::exists('public/' . $label->label_path)) {
            return null;
        }

        // Get the PDF content
        $pdfContent = Storage::get('public/' . $label->label_path);

        return $pdfContent;
    }

    /**
     * Generate a combined PDF with all labels for an order
     *
     * @param Order $order
     * @return \Barryvdh\DomPDF\PDF|null
     */
    public function generateCombinedLabelsPdf(Order $order)
    {
        $labels = ProductLabel::where('order_id', $order->id)->get();

        if ($labels->isEmpty()) {
            return null;
        }

        // Prepare data for the combined PDF view
        $data = [
            'order' => $order,
            'labels' => $labels
        ];

        // Generate PDF with proper encoding for special characters
        $pdf = PDF::loadView('labels.combined', $data);
        return $pdf;
    }
}
