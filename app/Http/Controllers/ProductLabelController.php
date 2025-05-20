<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductLabel;
use App\Services\LabelGenerationService;
use Inertia\Inertia;

class ProductLabelController extends Controller
{
    protected $labelService;

    public function __construct(LabelGenerationService $labelService)
    {
        $this->labelService = $labelService;
    }

    /**
     * Generate labels for an order
     *
     * @param Order $order
     * @return \Illuminate\Http\RedirectResponse
     */
    public function generateLabels(Order $order)
    {
        // Only generate labels if order status is processing
        if ($order->status !== 'processing') {
            return redirect()->back()->with('error', 'Labels can only be generated for orders in processing status.');
        }

        // Generate labels
        $labels = $this->labelService->generateLabelsForOrder($order);

        if (count($labels) > 0) {
            return redirect()->back()->with('success', 'Product labels generated successfully.');
        }

        return redirect()->back()->with('error', 'Failed to generate product labels.');
    }

    /**
     * View a specific label
     *
     * @param ProductLabel $label
     * @return \Illuminate\Http\Response
     */
    public function viewLabel(ProductLabel $label)
    {
        $pdfContent = $this->labelService->getLabelPdf($label);

        if (!$pdfContent) {
            return redirect()->back()->with('error', 'Label not found.');
        }

        return response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . basename($label->label_path) . '"',
        ]);
    }

    /**
     * Print all labels for an order
     *
     * @param Order $order
     * @return \Illuminate\Http\Response
     */
    public function printAllLabels(Order $order)
    {
        $pdf = $this->labelService->generateCombinedLabelsPdf($order);

        if (!$pdf) {
            return redirect()->back()->with('error', 'No labels found for this order.');
        }

        // Mark all labels as printed
        ProductLabel::where('order_id', $order->id)->update(['is_printed' => true]);

        return $pdf->download('order_' . $order->order_number . '_labels.pdf');
    }

    /**
     * Verify a product from an order using QR code
     *
     * @param Order $order
     * @param Product $product
     * @return \Inertia\Response
     */
    public function verify(Order $order, Product $product)
    {
        $orderItem = $order->items()->where('product_id', $product->id)->first();

        if (!$orderItem) {
            abort(404, 'Product not found in this order.');
        }

        return Inertia::render('Orders/Verify', [
            'order' => $order->load('user'),
            'product' => $product,
            'orderItem' => $orderItem
        ]);
    }
}
