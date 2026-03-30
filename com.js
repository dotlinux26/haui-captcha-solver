(function loadWeapons() {
    if (typeof cv === 'undefined') {
        const s = document.createElement('script');
        s.src = 'https://docs.opencv.org/4.x/opencv.js';
        s.async = true;
        document.head.appendChild(s);
        console.log("🚀 Đang kéo OpenCV về máy...");
    }
    if (typeof Tesseract === 'undefined') {
        const s2 = document.createElement('script');
        s2.src = 'https://unpkg.com/tesseract.js@v2.1.0/dist/tesseract.min.js';
        document.head.appendChild(s2);
        console.log("🚀 Đang kéo Tesseract về máy...");
    }
})();

(async function junaSuperSolverV6_2_1() {
    console.log("%c [JunaBot V6.2.1] Khởi động chế độ Debug Hardcore... ", "color: cyan; background: #222; font-weight: bold;");

    const SERVER_URL = 'https://haui-captcha-solver.onrender.com/solve';
    const IMG_ID = 'ctl00_Image1';
    const INPUT_ID = 'ctl00_txtimgcode';

    async function startSolving() {
        const imgElement = document.getElementById(IMG_ID);
        const inputField = document.getElementById(INPUT_ID);
        
        // Kiểm tra xem OpenCV đã sẵn sàng chưa
        if (typeof cv === 'undefined' || !cv.imread) {
            console.log("⚠️ OpenCV chưa load xong, đang đợi tí...");
            setTimeout(startSolving, 1000);
            return;
        }

        if (!imgElement) {
            console.log("❌ Không tìm thấy ảnh Captcha ID: " + IMG_ID);
            return;
        }

        console.log("JunaBot: Đang xử lý ảnh...");
        let src, dst, M;
        try {
            src = cv.imread(imgElement);
            dst = new cv.Mat();
            cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
            cv.GaussianBlur(dst, dst, new cv.Size(3, 3), 0);
            cv.threshold(dst, dst, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);
            M = cv.Mat.ones(2, 2, cv.CV_8U);
            cv.dilate(dst, dst, M, new cv.Point(-1, -1), 1);
            cv.bitwise_not(dst, dst);

            let canvas = document.createElement('canvas');
            cv.imshow(canvas, dst);
            
            // Hiện Preview ngay lập tức để Juna biết là code ĐANG CHẠY
            let preview = document.getElementById('juna_debug_v6_2') || document.createElement('div');
            preview.id = 'juna_debug_v6_2';
            preview.style = "position:fixed; top:20px; left:20px; z-index:10000; padding:10px; background:black; border:3px solid cyan; color:white; min-width:200px;";
            preview.innerHTML = "<b>TRẠNG THÁI:</b> <span id='juna_status' style='color:orange'>Đang gửi server...</span><br>";
            
            let debugImg = new Image();
            debugImg.src = canvas.toDataURL();
            debugImg.style = "margin-top:10px; width: 150px; background:white; border:1px solid #555";
            preview.appendChild(debugImg);
            document.body.appendChild(preview);

            const base64Data = canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, "");

            // GỬI LÊN SERVER VỚI TIMEOUT
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // Đợi tối đa 60s cho Render khởi động

            const response = await fetch(SERVER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_base64: base64Data }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            const data = await response.json();

            if (data.status === "success") {
                const res = data.result.toLowerCase();
                console.log("🔥 SERVER CHỐT: " + res);
                inputField.value = res;
                document.getElementById('juna_status').innerText = "XONG!";
                document.getElementById('juna_status').style.color = "lime";
            } else {
                document.getElementById('juna_status').innerText = "LỖI SERVER: " + data.message;
            }
        } catch (err) {
            console.log("❌ Lỗi Fetch: ", err);
            document.getElementById('juna_status').innerText = "SERVER CHƯA TỈNH (ĐANG RESTART)";
            document.getElementById('juna_status').style.color = "red";
        } finally {
            if (src) src.delete(); if (dst) dst.delete(); if (M) M.delete();
        }
    }

    startSolving();
})();
