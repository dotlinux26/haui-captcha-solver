from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import ddddocr
import base64

app = FastAPI()

# Cho phép Extension của bro gọi vào (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ocr = ddddocr.DdddOcr(show_ad=False)

@app.post("/solve")
async def solve_captcha(image_base64: str = Body(..., embed=True)):
    try:
        # Giải mã Base64 từ Extension gửi lên
        img_bytes = base64.b64decode(image_base64)
        
        # ddddocr ra tay!
        res = ocr.classification(img_bytes)
        
        print(f"[JunaBot Server] Giải mã thành công: {res}")
        return {"status": "success", "result": res}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Chạy lệnh: uvicorn main:app --reload --host 0.0.0.0 --port 8000
