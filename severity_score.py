
import os
import requests

ROBOFLOW_URL = "https://serverless.roboflow.com/evelly-khanza/workflows/fabric-defect-detection2025-logic"
API_KEY = os.environ.get("ROBOFLOW_API_KEY")

def get_predictions(image_url: str) -> dict:
    """Panggil Roboflow workflow dan ambil hasil predictions."""
    response = requests.post(
        ROBOFLOW_URL,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}",
        },
        json={
            "inputs": {
                "image": {"type": "url", "value": image_url}
            }
        },
    )
    response.raise_for_status()
    data = response.json()

    # outputs Roboflow biasanya ada di data["outputs"][0]["predictions"]["predictions"]
    # sesuaikan lagi kalau struktur asli beda pas kalian tes langsung
    outputs = data.get("outputs", [{}])[0]
    predictions_block = outputs.get("predictions", {})
    detections = predictions_block.get("predictions", [])
    image_info = predictions_block.get("image", {})  # biasanya ada width/height gambar

    return {
        "detections": detections,
        "image_width": image_info.get("width"),
        "image_height": image_info.get("height"),
    }


def hitung_severity_score(
    detections: list,
    image_width: float,
    image_height: float,
    confidence_threshold: float = 0.4,
) -> dict:
   
    valid_detections = [d for d in detections if d.get("confidence", 0) >= confidence_threshold]

    jumlah_defect = len(valid_detections)

    total_area_defect = sum(d["width"] * d["height"] for d in valid_detections)
    luas_total_foto = image_width * image_height if image_width and image_height else 1

    rasio_area_persen = (total_area_defect / luas_total_foto) * 100

    # hitung breakdown per jenis defect
    breakdown = {}
    for d in valid_detections:
        kelas = d.get("class", "unknown")
        breakdown[kelas] = breakdown.get(kelas, 0) + 1

    # tentukan kategori kelayakan (threshold ini contoh awal, sesuaikan lagi
    # setelah lihat hasil beberapa foto kain asli)
    if rasio_area_persen < 5 and jumlah_defect <= 2:
        kategori = "Layak Produksi"
    elif rasio_area_persen <= 15 and jumlah_defect <= 5:
        kategori = "Perlu Dicek Ulang"
    else:
        kategori = "Reject"

    return {
        "jumlah_defect": jumlah_defect,
        "rasio_area_persen": round(rasio_area_persen, 2),
        "breakdown_per_jenis": breakdown,
        "kategori": kategori,
    }


def analisa_kain(image_url: str) -> dict:
    """Fungsi utama: dari URL gambar sampai severity score."""
    hasil_prediksi = get_predictions(image_url)
    severity = hitung_severity_score(
        detections=hasil_prediksi["detections"],
        image_width=hasil_prediksi["image_width"],
        image_height=hasil_prediksi["image_height"],
    )
    return severity


if __name__ == "__main__":
    # contoh pemakaian
    contoh_url = "https://example.com/gambar-kain.jpg"
    hasil = analisa_kain(contoh_url)
    print(hasil)
