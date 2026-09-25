"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ImagePlus, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { prepareSpecimenImage } from "@/lib/specimen-image";
import { saveSpecimen, type SavedSpecimen } from "@/lib/collection-storage";
import { SakanaButton } from "@/components/sakana-button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: (specimen: SavedSpecimen) => void;
}

export function AddSpecimenDialog({ open, onOpenChange, onAdded }: Props) {
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);
  const previewUrl = useRef<string | null>(null);

  useEffect(() => () => {
    requestId.current++;
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
  }, []);

  function close() {
    requestId.current++;
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = null;
    setPreview(null);
    setImageBlob(null);
    setProcessing(false);
    setError("");
    onOpenChange(false);
  }

  async function chooseImage(file?: File) {
    if (!file) return;
    const currentRequest = ++requestId.current;
    setError("");
    setProcessing(true);
    try {
      const blob = await prepareSpecimenImage(file);
      if (currentRequest !== requestId.current) return;
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
      const url = URL.createObjectURL(blob);
      previewUrl.current = url;
      setPreview(url);
      setImageBlob(blob);
    } catch (cause) {
      if (currentRequest === requestId.current) {
        if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
        previewUrl.current = null;
        setImageBlob(null);
        setPreview(null);
        setError(cause instanceof Error ? cause.message : "Không thể xử lý ảnh.");
      }
    } finally {
      if (currentRequest === requestId.current) setProcessing(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!imageBlob || processing || saving) {
      setError("Hãy chọn ảnh cá và đợi xử lý xong.");
      return;
    }
    const form = new FormData(formElement);
    const value = (key: string) => String(form.get(key) ?? "").trim();
    const specimen: SavedSpecimen = {
      id: crypto.randomUUID(),
      name: value("name"),
      latin: value("latin"),
      tag: value("tag").toLocaleUpperCase("vi"),
      description: value("description"),
      habitat: value("habitat"),
      trait: value("trait"),
      note: value("note"),
      imageBlob,
    };
    setSaving(true);
    setError("");
    try {
      await saveSpecimen(specimen);
      onAdded(specimen);
      formElement.reset();
      close();
    } catch {
      setError("Không lưu được mẫu cá trong trình duyệt này. Hãy kiểm tra dung lượng lưu trữ rồi thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return <Dialog open={open} onOpenChange={next => { if (!next && !saving) close(); }}>
    <DialogContent className="add-specimen-dialog paper font-mono" showCloseButton={false}>
      <DialogClose className="dialog-close" aria-label="Đóng" disabled={saving}><X size={22}/></DialogClose>
      <span className="eyebrow font-mono">THỦY TỘC CHÍ / MẪU MỚI</span>
      <DialogTitle className="dialog-title font-mono">Thêm vào bộ sưu tập</DialogTitle>
      <DialogDescription className="dialog-description font-mono">Chọn ảnh cá trên nền đơn sắc hoặc PNG trong suốt. Nền ảnh sẽ được tách tự động và màu được đồng bộ với bộ sưu tập.</DialogDescription>
      <form className="specimen-form" onSubmit={submit}>
        <label className="upload-field">
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => void chooseImage(event.target.files?.[0])} required={!imageBlob}/>
          {preview ? <img className="upload-preview" src={preview} alt="Ảnh cá sau khi tách nền"/> : <ImagePlus size={32} strokeWidth={1.3}/>}
          <span>{processing ? "Đang tách nền..." : preview ? "Chọn ảnh khác" : "Chọn ảnh cá"}</span>
        </label>
        <div className="specimen-form-grid">
          <label>TÊN CÁ <input name="name" required maxLength={70} placeholder="Ví dụ: Cá ngựa"/></label>
          <label>TÊN KHOA HỌC <input name="latin" required maxLength={100} placeholder="Ví dụ: Hippocampus"/></label>
          <label>NHÓM / NHÃN <input name="tag" required maxLength={45} placeholder="Ví dụ: RẠN SAN HÔ"/></label>
          <label>MÔI TRƯỜNG <input name="habitat" required maxLength={100} placeholder="Nơi sinh sống"/></label>
          <label>ĐẶC ĐIỂM <input name="trait" required maxLength={100} placeholder="Đặc điểm nổi bật"/></label>
          <label>GHI CHÚ <input name="note" maxLength={180} placeholder="Một câu ngắn về loài cá"/></label>
        </div>
        <label className="form-wide">MÔ TẢ <textarea name="description" required maxLength={600} rows={3} placeholder="Giới thiệu mẫu cá và câu chuyện của nó"/></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="flex justify-end pt-2">
          <SakanaButton
            type="submit"
            disabled={!imageBlob || processing || saving}
            idPrefix="dialog-submit"
          >
            {saving ? "ĐANG LƯU..." : "THÊM MẪU CÁ"}
          </SakanaButton>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}
