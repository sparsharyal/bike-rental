import { useState } from "react";

export default function UploadQR() {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<"khalti" | "esewa">("khalti");

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("ownerId", "OWNER_ID_HERE"); // Replace with actual Owner ID

    const res = await fetch("/api/upload-qr", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      alert("QR Uploaded Successfully");
    } else {
      alert(`Error: ${data.message}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2">Upload QR Code</h2>
      <select value={type} onChange={(e) => setType(e.target.value as "khalti" | "esewa")}>
        <option value="khalti">Khalti QR</option>
        <option value="esewa">eSewa QR</option>
      </select>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
        Upload
      </button>
    </div>
  );
}
