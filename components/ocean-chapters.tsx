"use client";

import { ArrowDown, ArrowUpRight, Plus } from "lucide-react";
import { SakanaButton } from "@/components/sakana-button";

const shapes = [
  { number: "01", name: "Lướt như một cánh chim", fish: "Cá đuối", className: "chapter-shape-art--ray" },
  { number: "02", name: "Vút qua dòng nước", fish: "Cá ngừ", className: "chapter-shape-art--tuna" },
  { number: "03", name: "Ẩn mình trong im lặng", fish: "Cá Chó", className: "chapter-shape-art--pike" },
  { number: "04", name: "Rẽ sóng như một mũi kiếm", fish: "Cá kiếm", className: "chapter-shape-art--swordfish" },
];

const depths = [
  { title: "Nơi biển chạm trời", label: "01 / MẶT NƯỚC", text: "Ánh sáng vỡ trên từng con sóng. Cá chuồn mở vây, lướt qua ranh giới mong manh giữa nước và không trung." },
  { title: "Giữa miền xanh thẳm", label: "02 / TẦNG GIỮA", text: "Những đàn cá bạc nối nhau qua vùng nước mở. Không có lối mòn, chỉ có nhịp bơi và dòng chảy." },
  { title: "Một thế giới sát đáy", label: "03 / ĐÁY BIỂN", text: "Cá đuối lướt qua nền cát. Giữa rạn đá và những tán rong, sự sống hiện ra theo một nhịp chậm hơn." },
];

export function OceanChapters({ onAddSpecimen }: { onAddSpecimen: () => void }) {
  return (
    <>
      <section className="folio folio-depths" id="tang-nuoc" aria-labelledby="depths-title">
        <div className="folio-topline"><span>03 / NHỮNG TẦNG NƯỚC</span><span>MỘT LÁT CẮT ĐẠI DƯƠNG</span></div>
        <div className="depth-layout">
          <div className="depth-copy">
            <header className="reveal"><h2 id="depths-title">Càng xuống sâu,<br /><em>càng nhiều chuyện.</em></h2><p>Một mặt biển. Những thế giới khác nhau.<br />Hãy cùng nhìn xuống dưới làn sóng.</p></header>
            <div className="depth-index">{depths.map(depth => <article className="reveal" key={depth.label}><span className="folio-label">{depth.label}</span><h3>{depth.title}</h3><p>{depth.text}</p></article>)}</div>
            <span className="depth-end"><ArrowDown size={16} /> THEO CHIỀU SÂU CỦA BIỂN</span>
          </div>
          <figure className="depth-plate reveal"><img src="/chapters/depths.webp" alt="Tranh khắc biển từ mặt nước có cá chuồn xuống đàn cá bạc và cá đuối gần đáy" width={1024} height={1536} loading="lazy" /><figcaption>H.03 — Từ mặt sóng đến nền cát · Tranh minh họa</figcaption></figure>
        </div>
      </section>

      <section className="folio folio-current" id="dong-chay" aria-labelledby="current-title">
        <div className="folio-topline"><span>04 / DÒNG CHẢY</span><span>CHUYỂN ĐỘNG KHÔNG NGỪNG</span></div>
        <div className="current-intro reveal"><h2 id="current-title">Không có con đường.<br /><em>Vẫn có lối đi.</em></h2><p>Một lần nghiêng mình, cả đàn đổi hướng.<br />Giữa biển rộng, chuyển động của từng con cá hòa vào một nhịp chung.</p></div>
        <figure className="current-plate reveal"><img src="/chapters/currents.webp" alt="Đàn cá bạc uốn thành dòng chảy trên nền biển xanh mực" width={1536} height={1024} loading="lazy" /><figcaption><span>NHỊP ĐIỆU CỦA BẦY ĐÀN</span><span>H.04 / SAKANA</span></figcaption></figure>
        <div className="current-foot reveal"><span>水流 / DÒNG NƯỚC</span><p>Đi cùng nhau, thành một dải bạc giữa đại dương.</p><ArrowDown size={22} /></div>
      </section>

      <section className="chapter chapter-shapes paper" id="hinh-dang" aria-labelledby="shapes-title">
        <div className="chapter-heading reveal"><span className="chapter-kicker">05 / HÌNH DÁNG</span><h2 id="shapes-title">Mỗi đường nét là một <em>cách sống.</em></h2><p>Quan sát dáng cá là cách gần nhất để hình dung chúng đi qua làn nước ra sao.</p></div>
        <div className="chapter-shape-list">
          {shapes.map(shape => <article className="chapter-shape-row reveal" key={shape.number}><span className="chapter-shape-number">{shape.number}</span><div className={`chapter-shape-art ${shape.className}`} aria-hidden="true" /><div className="chapter-shape-copy"><h3>{shape.name}</h3><p>{shape.fish}</p></div></article>)}
        </div>
      </section>

      <section className="folio folio-journal" id="quan-sat" aria-labelledby="observe-title">
        <div className="folio-topline"><span>06 / NHẬT KÝ QUAN SÁT</span><span>NHỮNG ĐIỀU NHỎ BÉ</span></div>
        <div className="journal-layout">
          <figure className="journal-plate reveal"><div className="journal-plate-heading"><span>BẢN GHI CHÉP / 001</span><span>魚</span></div><img src="/chapters/journal.webp" alt="Bản vẽ cá tráp đỏ và hai chi tiết phóng lớn của vảy, vây" width={1024} height={1536} loading="lazy" /><figcaption><span>Cá tráp đỏ</span><i>Pagrus major</i></figcaption></figure>
          <div className="journal-copy reveal"><span className="folio-label">MỘT CHÚT TÒ MÒ LÀ ĐỦ</span><h2 id="observe-title">Nhìn gần hơn.<br /><em>Thấy nhiều hơn.</em></h2><p>Không cần biết hết tên gọi. Một đường vây, một lớp vảy, một lần đổi hướng cũng đủ để bắt đầu.</p><ol className="journal-notes"><li><span>01</span><div><h3>Theo một đường nét</h3><p>Nhìn từ đầu đến đuôi. Chi tiết nào khiến bạn dừng mắt lâu nhất?</p></div></li><li><span>02</span><div><h3>Ở lại một nhịp bơi</h3><p>Quan sát cách cá mở vây, giữ thăng bằng và chuyển hướng trong nước.</p></div></li><li><span>03</span><div><h3>Giữ một điều vừa thấy</h3><p>Viết một câu ngắn, lưu một hình ảnh. Đó là trang đầu tiên của bạn.</p></div></li></ol><div className="pt-2"><SakanaButton onClick={onAddSpecimen} idPrefix="journal-add" className="w-fit">GHI LẠI MỘT MẪU CÁ <Plus size={16} /></SakanaButton></div></div>
        </div>
      </section>

      <section className="folio folio-care" id="giu-bien" aria-labelledby="care-title">
        <div className="folio-topline"><span>07 / GIỮ BIỂN TRONG LÀNH</span><span>NGÔI NHÀ CHUNG</span></div>
        <div className="care-heading reveal"><h2 id="care-title">Giữ lấy biển.<br /><em>Giữ lấy những điều kỳ diệu.</em></h2><p>Mỗi loài cá thuộc về một thế giới lớn hơn chính nó. Yêu một sinh vật cũng là trân trọng vùng nước nuôi dưỡng nó.</p></div>
        <figure className="care-plate reveal"><img src="/chapters/reef.webp" alt="Tranh rạn san hô với cá nhỏ, rong biển và rùa đang bơi" width={1536} height={1024} loading="lazy" /><figcaption>MỘT ĐẠI DƯƠNG / VÔ VÀN SỰ SỐNG</figcaption></figure>
        <div className="care-principles reveal"><p><span>01 / QUAN SÁT</span>Để sinh vật được tự do.</p><p><span>02 / TÔN TRỌNG</span>Để rạn biển được nguyên vẹn.</p><p><span>03 / GÌN GIỮ</span>Để lại một vùng nước sạch.</p></div>
      </section>

      <section className="folio folio-invite" id="hanh-trinh" aria-labelledby="invite-title">
        <div className="invite-copy reveal"><span className="folio-label">08 / MỘT TRANG MỚI</span><h2 id="invite-title">Biển còn rộng.<br /><em>Chuyện còn dài.</em></h2><p>Mang theo sự tò mò.<br />Cùng viết tiếp cuốn thủy tộc chí của riêng bạn.</p><div className="invite-actions"><SakanaButton href="#bo-suu-tap" idPrefix="invite-col">VỀ BỘ SƯU TẬP <ArrowUpRight size={16} /></SakanaButton><SakanaButton onClick={onAddSpecimen} idPrefix="invite-add">THÊM MẪU CÁ <Plus size={16} /></SakanaButton></div></div>
        <figure className="invite-plate"><img src="/chapters/horizon.webp" alt="Tranh sóng biển yên bình với cánh buồm nhỏ phía chân trời" width={1536} height={1024} loading="lazy" /></figure>
        <div className="invite-colophon"><span>SAKANA / THỦY TỘC CHÍ</span><span>HẾT MỘT CHƯƠNG. MỞ MỘT HÀNH TRÌNH.</span></div>
      </section>
    </>
  );
}
