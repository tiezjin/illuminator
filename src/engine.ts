

/**
 * Image processing engine designed to run inside a Web Worker.
 * Handles background removal and WebP/PNG conversion.
 * 
 */

interface WorkerInputData {
    bitmap: ImageBitmap;
    threshold: number;
    doTransparency: boolean;
    doWebP: boolean;
}


export const workerCode = () => {
    self.onmessage = async (e: MessageEvent) => {
        const { bitmap, threshold, doTransparency, doWebP } = e.data as WorkerInputData;

        let isBitmapClosed = false;

        try {
            // 1. Initialize OffscreenCanvas 
            const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                self.postMessage({ success: false, error: "Could not get canvas context" });
                bitmap.close();
                isBitmapClosed = true;           //  close before return
                return;
            }

            // 2. Draw the bitmap to the canvas
            ctx.drawImage(bitmap, 0, 0);

            // 3. Close the bitmap immediately to free up memory 
            bitmap.close();
            isBitmapClosed = true;

            // 4. Perform Pixel Manipulation
            if (doTransparency) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                for (let i = 0; i < data.length; i += 4) {
                    if (data[i]! > threshold && data[i + 1]! > threshold && data[i + 2]! > threshold) {
                        data[i + 3] = 0; // A
                    }
                }
                ctx.putImageData(imageData, 0, 0);
            }

            // 5. Convert to Blob (WebP or PNG)
            const type = doWebP ? "image/webp" : "image/png";
            const extension = doWebP ? "webp" : "png";

            const blob = await canvas.convertToBlob({ 
                type: type, 
                quality: 0.85 
            });

            // 6. Send results back to main thread
            self.postMessage({ 
                success: true,
                blob, 
                ext: extension 
            });  

        } catch (err) {
            self.postMessage({
                success: false,
                error: err instanceof Error ? err.message : String(err)
            });

        } finally {
            if (!isBitmapClosed && bitmap) {
                bitmap.close();
            }
        } 
    };
};