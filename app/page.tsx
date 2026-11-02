"use client";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { ArrowUpRight, ArrowRight, ArrowDown, Waves, Compass, Pause, Play, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { SiteHeader } from "@/components/site-header";
import { SakanaLogo } from "@/components/sakana-logo";
import { AddSpecimenDialog } from "@/components/add-specimen-dialog";
import { WaveButtonFrame } from "@/components/wave-button-frame";
import { SakanaButton } from "@/components/sakana-button";
import { OceanChapters } from "@/components/ocean-chapters";
import { OceanShader } from "@/components/ocean-shader";
import { HeroSchool, cropClip } from "@/components/hero-school";
import { SilhouetteQuiz } from "@/components/silhouette-quiz";
import { ScrollMotion, OceanMarquee, useDialogEntrance } from "@/components/scroll-motion";
import { loadSpecimens, type SavedSpecimen } from "@/lib/collection-storage";

type Habitat = "khoi" | "bo" | "day" | "ngot";

const habitats: { key: Habitat | "all"; label: string }[] = [
  { key: "all", label: "TẤT CẢ" },
  { key: "khoi", label: "BIỂN KHƠI" },
  { key: "bo", label: "VEN BỜ & RẠN" },
  { key: "day", label: "ĐÁY & BIỂN SÂU" },
  { key: "ngot", label: "NƯỚC NGỌT" },
];
// Cards arrive a page at a time so a long collection never paints all at once.
const page = 12;

interface FishSpecies {
  id?: string;
  name: string;
  latin: string;
  group?: Habitat;
  tag: string;
  description: string;
  habitat: string;
  trait: string;
  note: string;
  crop?: number[];
  image?: string;
  credit?: string;
}

const species: FishSpecies[] = [
  {
    name: "Cá trích",
    group: "khoi",
    latin: "Clupeidae",
    crop: [100, 0, 445, 173],
    tag: "BẦY ĐÀN",
    description: "Những đàn cá bạc di chuyển như một cơ thể thống nhất. Mỗi lần đổi hướng, hàng nghìn chiếc vảy cùng bắt sáng, tạo nên những dải lấp lánh trong làn nước.",
    habitat: "Vùng biển ven bờ",
    trait: "Sống thành đàn",
    note: "Một chuyển động nhỏ, cả đàn cùng đổi hướng."
  },
  {
    name: "Cá đuối",
    group: "day",
    latin: "Batoidea",
    crop: [565, 545, 490, 416],
    tag: "ĐÁY ĐẠI DƯƠNG",
    description: "Đôi vây ngực mở rộng như cánh, đưa cá đuối lướt qua nước bằng chuyển động nhịp nhàng. Cơ thể dẹt giúp nhiều loài ẩn mình giữa cát và quan sát thế giới sát đáy biển.",
    habitat: "Đáy cát và vùng biển mở",
    trait: "Bộ xương sụn",
    note: "Một đôi cánh, một cách bay khác."
  },
  {
    name: "Cá chuồn",
    group: "khoi",
    latin: "Exocoetidae",
    crop: [70, 1180, 450, 200],
    tag: "MẶT BIỂN",
    description: "Cá chuồn tăng tốc dưới nước rồi lao lên khỏi mặt biển. Những chiếc vây ngực dài dang rộng giúp chúng lượn trong không khí trước khi trở về với đại dương.",
    habitat: "Biển nhiệt đới và cận nhiệt đới",
    trait: "Lượn trên mặt nước",
    note: "Nơi ranh giới giữa biển và trời mờ đi."
  },
  {
    name: "Cá Chó",
    group: "ngot",
    latin: "Esox lucius (Northern Pike)",
    image: "/species/pike.png",
    tag: "SĂN MỒI VÙNG LẠNH",
    description: "Chiếc mõm vịt đặc trưng cùng hàm răng sắc nhọn và hoa văn da đốm lốm đốm. Kẻ săn mồi thượng thặng rình rập giữa thảm cỏ nước với tốc độ phóng mồi chớp nhoáng.",
    habitat: "Vùng nước ngọt & lợ phương Bắc",
    trait: "Phục kích tốc độ cao",
    note: "Tĩnh lặng tựa gỗ mục, vụt bay như mũi tên săn mồi."
  },
  {
    name: "Cá ngừ đại dương",
    group: "khoi",
    latin: "Thunnus orientalis (Bluefin Tuna)",
    image: "/species/tuna.png",
    tag: "KÌNH NGƯ VIỄN KHƠI",
    description: "Thân hình thoi khí động học hoàn hảo với vây đuôi hình trăng khuyết và các vây phụ nhọn. Chúng bơi liên tục suốt đời không ngừng nghỉ, xé toạc những dòng hải lưu Thái Bình Dương.",
    habitat: "Vùng biển khơi Thái Bình Dương",
    trait: "Kình ngư đường dài",
    note: "Trái tim không bao giờ ngừng đập giữa dòng hải lưu lạnh."
  },
  {
    name: "Cá tráp đỏ",
    group: "bo",
    latin: "Pagrus major (Red Seabream)",
    image: "/species/seabream.png",
    tag: "BIỂU TƯỢNG MAY MẮN",
    description: "Chiếc lưng vòm cao kiêu hãnh với những tia vây lưng sắc nhọn và lớp vảy ánh bạc óng ánh. Biểu trưng cho sự tôn nghiêm, may mắn và thịnh vượng trong văn hóa biển Nhật Bản.",
    habitat: "Vùng rạn đá đáy biển ven bờ",
    trait: "Vảy giáp kiên cố",
    note: "Sắc vóc uy nghiêm mang phúc lành của biển cả."
  },
  {
    name: "Cá nóc",
    group: "bo",
    latin: "Tetraodontidae",
    image: "/species/pufferfish.png",
    tag: "VỆ BINH GAI GÓC",
    description: "Cá nóc có thể phồng cơ thể khi gặp nguy hiểm, khiến kẻ săn mồi khó nuốt chúng. Một số loài còn mang độc tố mạnh, vì vậy vẻ ngoài nhỏ bé của chúng là lời cảnh báo đầy hiệu quả giữa đại dương.",
    habitat: "Biển nhiệt đới và cận nhiệt đới",
    trait: "Phồng mình để tự vệ",
    note: "Giữa làn nước rộng, một cơ thể nhỏ cũng có cách tự bảo vệ riêng."
  },
  {
    name: "Cá cần câu",
    group: "day",
    latin: "Lophius piscatorius (Angler)",
    image: "/species/anglerfish.webp",
    tag: "KẺ CÂU MỒI ĐÁY BIỂN",
    description: "Gai vây lưng đầu tiên biến thành một chiếc cần câu, đầu cần mang mẩu thịt nhỏ làm mồi nhử. Cá cần câu nằm im giữa bùn cát, đung đưa mồi rồi há chiếc miệng rộng nuốt trọn con mồi bơi lại gần.",
    habitat: "Đáy biển Đông Bắc Đại Tây Dương",
    trait: "Cần câu mọc trên đầu",
    note: "Kiên nhẫn là vũ khí, bóng tối là nơi ẩn náu.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá ngựa",
    group: "bo",
    latin: "Hippocampus hippocampus (Short-snouted Seahorse)",
    image: "/species/seahorse.webp",
    tag: "NGƯỜI CHA MANG THAI",
    description: "Cá ngựa bơi thẳng đứng nhờ chiếc vây lưng nhỏ vẫy liên hồi, chiếc đuôi cuộn tròn bám vào cỏ biển. Điều kỳ lạ nhất: cá ngựa đực mới là con mang trứng trong túi ấp và sinh ra đàn con.",
    habitat: "Thảm cỏ biển Địa Trung Hải & Đông Đại Tây Dương",
    trait: "Cá bố mang thai",
    note: "Một chú ngựa nhỏ, chậm rãi giữa đồng cỏ dưới nước.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá mao tiên",
    group: "bo",
    latin: "Pterois volitans (Red Lionfish)",
    image: "/species/lionfish.webp",
    tag: "VŨ CÔNG CÓ NỌC",
    description: "Những tia vây dài xòe rộng như dải lụa, đẹp đến mức khó rời mắt. Nhưng các gai vây lưng chứa nọc độc, và bộ trang phục rực rỡ ấy chính là lời cảnh báo cho mọi kẻ săn mồi.",
    habitat: "Rạn san hô Ấn Độ Dương – Thái Bình Dương",
    trait: "Gai vây có nọc độc",
    note: "Vẻ đẹp nào cũng có cách tự bảo vệ của riêng nó.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá thu",
    group: "khoi",
    latin: "Scomber scombrus (Atlantic Mackerel)",
    image: "/species/mackerel.webp",
    tag: "MŨI TÊN BẠC",
    description: "Thân thon như mũi tên, lưng xanh vằn những đường sóng sẫm màu. Cá thu Đại Tây Dương không có bong bóng bơi nên gần như không ngừng bơi, theo từng đàn lớn di cư dọc các vùng biển lạnh.",
    habitat: "Bắc Đại Tây Dương",
    trait: "Không có bong bóng bơi",
    note: "Dừng lại là chìm xuống, nên cứ thế mà bơi.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá chép",
    group: "ngot",
    latin: "Cyprinus carpio (Common Carp)",
    image: "/species/carp.webp",
    tag: "VƯỢT VŨ MÔN",
    description: "Lớp vảy lớn óng ánh vàng đồng cùng hai đôi râu nhỏ bên mép giúp cá chép dò tìm thức ăn dưới đáy bùn. Trong văn hóa Á Đông, cá chép vượt Vũ Môn hóa rồng là biểu tượng của sự bền bỉ và đỗ đạt.",
    habitat: "Sông hồ nước ngọt khắp Á – Âu",
    trait: "Hai đôi râu cảm giác",
    note: "Ngược dòng mãi, rồi cũng có ngày hóa rồng.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1785) · Phạm vi công cộng"
  },
  {
    name: "Cá nhám gai",
    group: "day",
    latin: "Squalus acanthias (Spiny Dogfish)",
    image: "/species/dogfish.webp",
    tag: "CÁ MẬP NHỎ BỀN BỈ",
    description: "Một loài cá mập nhỏ với những đốm trắng trên lưng và chiếc gai nhọn trước mỗi vây lưng. Cá nhám gai có thời gian mang thai gần hai năm, thuộc hàng dài nhất trong thế giới động vật có xương sống.",
    habitat: "Vùng biển ôn đới",
    trait: "Mang thai gần hai năm",
    note: "Có những điều cần thời gian mới thành hình.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá mặt trăng",
    group: "khoi",
    latin: "Mola mola (Ocean Sunfish)",
    image: "/species/sunfish.webp",
    tag: "VẦNG TRĂNG TRÔI DẠT",
    description: "Thân tròn dẹt như bị cắt mất nửa sau, cá mặt trăng là một trong những loài cá xương nặng nhất đại dương. Chúng thường nằm nghiêng phơi mình trên mặt biển và ăn rất nhiều sứa.",
    habitat: "Biển khơi ôn đới & nhiệt đới",
    trait: "Phơi nắng trên mặt biển",
    note: "Một vầng trăng lặng lẽ, trôi theo con nước.",
    credit: "Tranh khắc: H. L. Todd (khoảng 1880) · Phạm vi công cộng"
  },
  {
    name: "Cá kiếm",
    latin: "Xiphias gladius (Swordfish)",
    group: "khoi",
    image: "/species/swordfish.png",
    tag: "KIẾM SĨ VIỄN KHƠI",
    description: "Chiếc mỏ dài dẹt như lưỡi kiếm dùng để quật ngang vào đàn cá mồi. Cá kiếm còn có một cơ quan sinh nhiệt đặc biệt giúp sưởi ấm mắt và não khi lặn xuống vùng nước lạnh sâu thẳm.",
    habitat: "Biển khơi nhiệt đới & ôn đới",
    trait: "Tự sưởi ấm đôi mắt",
    note: "Một nhát kiếm giữa dòng xanh thẳm."
  },
  {
    name: "Cá dây",
    latin: "Zeus faber (John Dory)",
    group: "bo",
    image: "/species/john-dory.webp",
    tag: "DẤU TAY TRÊN THÂN",
    description: "Thân mỏng như một chiếc lá, giữa sườn có đốm đen tròn mà truyền thuyết châu Âu gọi là dấu tay của Thánh Peter. Nhìn từ phía trước gần như vô hình, cá dây lặng lẽ tiến sát rồi phóng hàm ra hút gọn con mồi.",
    habitat: "Ven bờ Đông Đại Tây Dương & Địa Trung Hải",
    trait: "Hàm phóng ra như ống hút",
    note: "Mỏng đến mức con mồi chẳng kịp nhận ra.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá bơn sao",
    latin: "Pleuronectes platessa (European Plaice)",
    group: "day",
    image: "/species/plaice.webp",
    tag: "ĐÔI MẮT DỜI CHỖ",
    description: "Khi mới nở, cá bơn bơi thẳng như mọi loài cá khác. Rồi một bên mắt dần dời sang phía bên kia đầu, và cá bơn nằm nghiêng cả đời trên nền cát, những đốm cam trên lưng hòa vào đáy biển.",
    habitat: "Đáy cát Đông Bắc Đại Tây Dương",
    trait: "Hai mắt cùng một phía",
    note: "Một đời nằm nghiêng, ngước nhìn lên mặt nước.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá bơn vằn",
    latin: "Zebrias zebra (Zebra Sole)",
    group: "day",
    image: "/species/zebra-sole.webp",
    tag: "NGỰA VẰN ĐÁY BIỂN",
    description: "Những sọc nâu đậm chạy ngang thân dẹt như bộ áo ngựa vằn. Cá bơn vằn vùi mình trong cát bùn vùng nước ven bờ, chỉ để lộ đôi mắt nhỏ quan sát xung quanh.",
    habitat: "Đáy cát Ấn Độ Dương – Tây Thái Bình Dương",
    trait: "Vùi mình trong cát",
    note: "Kẻ sọc nằm yên giữa những gợn sóng cát.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá rô châu Âu",
    latin: "Perca fluviatilis (European Perch)",
    group: "ngot",
    image: "/species/perch.webp",
    tag: "SỌC XANH VÂY ĐỎ",
    description: "Những vạch sẫm dọc thân xanh lục cùng vây bụng đỏ cam khiến cá rô châu Âu dễ nhận ra giữa làn nước trong. Lúc nhỏ chúng sống thành đàn, khi lớn trở thành kẻ săn mồi đơn độc của sông hồ.",
    habitat: "Sông hồ nước ngọt châu Âu & Bắc Á",
    trait: "Vây lưng gai nhọn",
    note: "Sọc rừng giữa lòng hồ lặng.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá nheo châu Âu",
    latin: "Silurus glanis (Wels Catfish)",
    group: "ngot",
    image: "/species/wels-catfish.webp",
    tag: "KHỔNG LỒ SÔNG SÂU",
    description: "Một trong những loài cá nước ngọt lớn nhất châu Âu, có thể dài hơn hai mét. Cá nheo không vảy, đôi râu dài trên mép giúp chúng dò tìm con mồi trong làn nước đục và bóng tối đáy sông.",
    habitat: "Sông hồ Trung & Đông Âu",
    trait: "Râu dài dò đường",
    note: "Lặng lẽ dưới đáy sông, lớn dần theo năm tháng.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá chào mào",
    latin: "Chelidonichthys lucerna (Tub Gurnard)",
    group: "day",
    image: "/species/gurnard.webp",
    tag: "BƯỚC ĐI DƯỚI ĐÁY",
    description: "Vây ngực xòe rộng như đôi cánh, kèm vài tia vây tách rời mà cá chào mào dùng để bước đi và dò tìm thức ăn dưới cát. Chúng còn phát ra tiếng kêu ục ục nhờ rung bong bóng bơi.",
    habitat: "Đáy biển Đông Đại Tây Dương & Địa Trung Hải",
    trait: "Đi bằng tia vây",
    note: "Có loài cá chọn cách bước đi thay vì bơi.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá tuyết",
    latin: "Gadus morhua (Atlantic Cod)",
    group: "khoi",
    image: "/species/cod.webp",
    tag: "LOÀI CÁ ĐỔI LỊCH SỬ",
    description: "Sợi râu nhỏ dưới cằm và ba vây lưng là dấu hiệu nhận ra cá tuyết. Suốt nhiều thế kỷ, chúng nuôi sống cả những vùng biển Bắc Đại Tây Dương, cho đến khi đánh bắt quá mức khiến nhiều đàn cá sụp đổ.",
    habitat: "Biển lạnh Bắc Đại Tây Dương",
    trait: "Râu cằm cảm giác",
    note: "Biển rộng đến đâu cũng có giới hạn.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá mút đá",
    latin: "Petromyzon marinus (Sea Lamprey)",
    group: "khoi",
    image: "/species/lamprey.webp",
    tag: "CHIẾC MIỆNG KHÔNG HÀM",
    description: "Không có hàm, chỉ có một chiếc miệng tròn như giác hút với những vòng răng sừng. Cá mút đá bám vào thân cá khác để hút máu, thuộc một dòng dõi cổ xưa đã tồn tại hàng trăm triệu năm.",
    habitat: "Bắc Đại Tây Dương & sông ngòi ven biển",
    trait: "Miệng giác hút",
    note: "Hình hài của những đại dương cổ đại.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá tầm Beluga",
    latin: "Huso huso (Beluga Sturgeon)",
    group: "ngot",
    image: "/species/beluga.webp",
    tag: "HÓA THẠCH SỐNG",
    description: "Thân phủ những hàng vảy xương, mõm dài với râu cảm giác: cá tầm Beluga là một trong những loài cá xương lớn nhất thế giới. Bị săn bắt vì trứng cá muối quý giá, loài này nay đang cực kỳ nguy cấp.",
    habitat: "Biển Caspi, Biển Đen & các dòng sông đổ ra",
    trait: "Vảy xương như áo giáp",
    note: "Sống chậm, lớn chậm, và cần được bảo vệ.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá vàng",
    latin: "Carassius auratus (Goldfish)",
    group: "ngot",
    image: "/species/goldfish.webp",
    tag: "NGÀN NĂM THUẦN DƯỠNG",
    description: "Từ một loài cá diếc hoang dã, người Trung Hoa đã chọn lọc và nuôi dưỡng cá vàng suốt hơn một nghìn năm. Ngày nay có vô số giống với đuôi xòe, mắt lồi và sắc màu rực rỡ.",
    habitat: "Ao hồ nước ngọt Đông Á",
    trait: "Đuôi xòe như dải lụa",
    note: "Một tia nắng nhỏ bơi trong chậu nước.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá hồi",
    latin: "Salmo salar (Atlantic Salmon)",
    group: "khoi",
    image: "/species/salmon.webp",
    tag: "HÀNH TRÌNH VỀ NGUỒN",
    description: "Sinh ra ở thượng nguồn, lớn lên ngoài biển cả, rồi cá hồi lại vượt thác ngược dòng trở về đúng con sông nơi mình chào đời để sinh sản. Khứu giác nhạy bén dẫn đường cho chúng suốt hành trình dài.",
    habitat: "Sông & biển Bắc Đại Tây Dương",
    trait: "Nhớ đường về sông cũ",
    note: "Đi thật xa, để rồi trở về.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá nhám vằn",
    latin: "Stegostoma fasciatum (Zebra Shark)",
    group: "bo",
    image: "/species/zebra-shark.webp",
    tag: "SỌC LÚC NHỎ, ĐỐM KHI LỚN",
    description: "Lúc còn nhỏ, cá nhám vằn mang những sọc vàng trên nền sẫm như trong bức tranh này; khi trưởng thành, sọc tan thành các đốm như da báo. Loài cá mập hiền lành này nghỉ ngơi trên nền cát quanh rạn san hô.",
    habitat: "Rạn san hô Ấn Độ Dương – Thái Bình Dương",
    trait: "Đổi hoa văn khi lớn",
    note: "Lớn lên là thay một bộ áo khác.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá nhám dẹt",
    latin: "Squatina squatina (Angelshark)",
    group: "day",
    image: "/species/angel-shark.webp",
    tag: "THIÊN THẦN TRONG CÁT",
    description: "Thân dẹt với vây ngực mở rộng như đôi cánh, cá nhám dẹt vùi mình dưới cát và chờ con mồi đi ngang qua. Từng phổ biến khắp ven biển châu Âu, loài này nay đang cực kỳ nguy cấp.",
    habitat: "Đáy cát Đông Bắc Đại Tây Dương & Địa Trung Hải",
    trait: "Phục kích dưới cát",
    note: "Đôi cánh nằm im chờ thời khắc của mình.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá mập búa",
    latin: "Sphyrna zygaena (Smooth Hammerhead)",
    group: "khoi",
    image: "/species/hammerhead.webp",
    tag: "CHIẾC ĐẦU HÌNH BÚA",
    description: "Chiếc đầu dẹt bè ngang như cây búa đặt hai mắt cách xa nhau, giúp mở rộng tầm nhìn. Bề mặt rộng ấy còn chứa dày đặc các cơ quan cảm nhận điện, dò ra con mồi ẩn mình dưới cát.",
    habitat: "Biển khơi ôn đới & nhiệt đới",
    trait: "Cảm nhận điện trường",
    note: "Một hình dáng lạ, một cách nhìn rộng hơn.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá mập trắng",
    latin: "Carcharodon carcharias (Great White Shark)",
    group: "khoi",
    image: "/species/great-white.webp",
    tag: "CHÚA TỂ ĐẠI DƯƠNG",
    description: "Loài cá săn mồi lớn nhất đại dương, có thể dài khoảng sáu mét. Những hàng răng cưa liên tục được thay mới, và cơ thể giữ nhiệt ấm hơn nước biển giúp cá mập trắng bứt tốc mạnh mẽ cả ở vùng biển lạnh.",
    habitat: "Biển ven bờ & khơi xa vùng ôn đới",
    trait: "Răng thay mới suốt đời",
    note: "Đứng đầu chuỗi thức ăn, cũng là mắt xích dễ tổn thương.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá đuối điện",
    latin: "Torpedo torpedo (Common Torpedo)",
    group: "day",
    image: "/species/electric-ray.webp",
    tag: "NGƯỜI GIỮ TIA SÉT",
    description: "Hai cơ quan phát điện hình quả thận nằm hai bên đầu có thể phóng ra cú sốc đủ làm choáng con mồi. Người La Mã cổ đại từng dùng loài cá này để chữa đau đầu bằng chính dòng điện của nó.",
    habitat: "Đáy cát Địa Trung Hải & Đông Đại Tây Dương",
    trait: "Phóng điện làm choáng",
    note: "Một tia sét nhỏ nằm im dưới cát.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá mập ma",
    latin: "Chimaera monstrosa (Rabbitfish)",
    group: "day",
    image: "/species/chimaera.webp",
    tag: "BÓNG MA VỰC SÂU",
    description: "Họ hàng xa của cá mập, với đôi mắt to phản quang, chiếc đuôi dài như roi và gai vây lưng có nọc. Cá mập ma lướt chậm rãi trên đáy biển sâu hàng trăm mét, nơi ánh sáng hầu như không chạm tới.",
    habitat: "Biển sâu Đông Bắc Đại Tây Dương",
    trait: "Mắt to cho bóng tối",
    note: "Một dòng họ cổ xưa sống lặng lẽ trong vực thẳm.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá nóc nhím",
    latin: "Diodon hystrix (Spot-fin Porcupinefish)",
    group: "bo",
    image: "/species/porcupinefish.webp",
    tag: "QUẢ CẦU GAI",
    description: "Khi gặp nguy hiểm, cá nóc nhím hút nước phồng tròn cơ thể và mọi chiếc gai dựng đứng, biến thành một quả cầu gai không kẻ săn mồi nào muốn nuốt. Hàm răng liền khối giúp chúng nghiền vỏ ốc, vỏ cua.",
    habitat: "Rạn san hô nhiệt đới toàn cầu",
    trait: "Phồng mình dựng gai",
    note: "Đừng vội đánh giá một sinh vật trông hiền lành.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá nóc hòm sừng",
    latin: "Lactoria cornuta (Longhorn Cowfish)",
    group: "bo",
    image: "/species/cowfish.webp",
    tag: "CHIẾC HỘP CÓ SỪNG",
    description: "Cơ thể được bọc trong một lớp giáp xương cứng hình hộp, chỉ có vây và đuôi cử động được. Hai chiếc sừng nhọn trên trán khiến cá nóc hòm sừng trông như một chú bò nhỏ bơi lạch bạch giữa rạn san hô.",
    habitat: "Rạn san hô Ấn Độ Dương – Thái Bình Dương",
    trait: "Áo giáp hình hộp",
    note: "Chậm rãi cũng là một cách sống.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá bò Picasso",
    latin: "Rhinecanthus aculeatus (Picasso Triggerfish)",
    group: "bo",
    image: "/species/picasso-triggerfish.webp",
    tag: "BỨC TRANH BIẾT BƠI",
    description: "Những mảng màu và đường kẻ trên thân như nét cọ của danh họa Picasso. Khi bị đe dọa, cá bò chui vào khe đá rồi dựng và khóa chặt gai vây lưng, khiến không ai kéo ra được.",
    habitat: "Rạn san hô Ấn Độ Dương – Thái Bình Dương",
    trait: "Gai lưng có chốt khóa",
    note: "Nghệ thuật cũng biết cách tự vệ.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá bò giấy",
    latin: "Aluterus monoceros (Unicorn Leatherjacket)",
    group: "bo",
    image: "/species/leatherjacket.webp",
    tag: "MỘT CHIẾC SỪNG",
    description: "Thân mỏng dẹt với lớp da nhám như giấy ráp và một chiếc gai dài duy nhất trên đầu. Cá bò giấy quen thuộc với ngư dân miền biển Việt Nam, thường được phơi thành món khô cá bò.",
    habitat: "Vùng biển nhiệt đới toàn cầu",
    trait: "Da nhám như giấy ráp",
    note: "Một sừng nhỏ giữa biển mênh mông.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá lịch",
    latin: "Muraena helena (Mediterranean Moray)",
    group: "bo",
    image: "/species/moray.webp",
    tag: "CẶP HÀM THỨ HAI",
    description: "Cá lịch há miệng liên tục không phải để đe dọa mà để bơm nước qua mang. Trong cổ họng chúng còn có một bộ hàm thứ hai, phóng ra kéo con mồi vào trong như sinh vật ngoài hành tinh.",
    habitat: "Hang đá Địa Trung Hải & Đông Đại Tây Dương",
    trait: "Hai bộ hàm",
    note: "Nhìn đáng sợ, chỉ là đang thở mà thôi.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá chình điện",
    latin: "Electrophorus electricus (Electric Eel)",
    group: "ngot",
    image: "/species/electric-eel.webp",
    tag: "DÒNG ĐIỆN SỐNG",
    description: "Dù tên là chình, đây thực ra là họ hàng của cá dao. Phần lớn cơ thể là các tế bào phát điện xếp chồng, có thể phóng ra hàng trăm vôn. Chúng còn phải ngoi lên mặt nước để thở không khí.",
    habitat: "Sông ngòi lưu vực Amazon",
    trait: "Phóng điện hàng trăm vôn",
    note: "Một cục pin biết bơi giữa rừng mưa.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá nhìn sao",
    latin: "Uranoscopus scaber (Atlantic Stargazer)",
    group: "day",
    image: "/species/stargazer.webp",
    tag: "ĐÔI MẮT HƯỚNG TRỜI",
    description: "Đôi mắt nằm trên đỉnh đầu, luôn hướng lên phía mặt nước như đang ngắm sao. Cá nhìn sao vùi mình trong cát, chỉ để lộ mắt và miệng, rồi bất ngờ đớp lấy con mồi bơi ngang phía trên.",
    habitat: "Đáy cát Địa Trung Hải & Đông Đại Tây Dương",
    trait: "Mắt trên đỉnh đầu",
    note: "Nằm dưới đáy biển mà vẫn ngước nhìn trời.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá ép",
    latin: "Remora remora (Common Remora)",
    group: "khoi",
    image: "/species/remora.webp",
    tag: "KẺ ĐI NHỜ",
    description: "Vây lưng của cá ép đã biến thành một đĩa hút có gờ trên đỉnh đầu. Nhờ nó, cá ép bám vào cá mập, rùa biển hay cá voi để đi nhờ khắp đại dương và nhặt những mẩu thức ăn còn sót lại.",
    habitat: "Biển khơi nhiệt đới & ôn đới",
    trait: "Đĩa hút trên đầu",
    note: "Đi xa hơn nhờ biết bám vào người bạn đồng hành.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá nục heo cờ",
    latin: "Coryphaena hippurus (Mahi-mahi)",
    group: "khoi",
    image: "/species/mahi-mahi.webp",
    tag: "SẮC MÀU CHỚP NHOÁNG",
    description: "Thân xanh vàng óng ánh có thể đổi màu nhanh chóng khi bơi hay săn mồi. Cá nục heo cờ lớn rất nhanh nhưng sống ngắn ngủi, thường tụ tập dưới những đám rong hay khúc gỗ trôi giữa biển khơi.",
    habitat: "Biển khơi nhiệt đới & cận nhiệt đới",
    trait: "Lớn nhanh, sống vội",
    note: "Rực rỡ như một ánh chớp trên sóng.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá vẹt xanh",
    latin: "Scarus coeruleus (Blue Parrotfish)",
    group: "bo",
    image: "/species/parrotfish.webp",
    tag: "NGƯỜI LÀM RA CÁT",
    description: "Răng cá vẹt dính liền thành chiếc mỏ cứng để gặm tảo bám trên san hô. Phần đá vôi nuốt vào được nghiền nhỏ rồi thải ra thành cát mịn, góp phần tạo nên những bãi cát trắng quanh rạn.",
    habitat: "Rạn san hô Tây Đại Tây Dương",
    trait: "Mỏ răng gặm san hô",
    note: "Bãi cát trắng có khi bắt đầu từ một chú cá.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá thần tiên hoàng đế",
    latin: "Pomacanthus imperator (Emperor Angelfish)",
    group: "bo",
    image: "/species/emperor-angelfish.webp",
    tag: "HOÀNG BÀO SỌC VÀNG",
    description: "Cá con mang những vòng tròn trắng xanh xoáy ốc, khi trưởng thành lại khoác bộ áo sọc vàng xanh lộng lẫy như hoàng bào. Hai giai đoạn khác nhau đến mức người xưa từng tưởng là hai loài.",
    habitat: "Rạn san hô Ấn Độ Dương – Thái Bình Dương",
    trait: "Đổi áo khi trưởng thành",
    note: "Mỗi tuổi một dung mạo.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá bướm sọc",
    latin: "Chaetodon striatus (Banded Butterflyfish)",
    group: "bo",
    image: "/species/butterflyfish.webp",
    tag: "VŨ ĐIỆU ĐÔI",
    description: "Những dải sẫm vắt ngang thân, một dải che kín mắt khiến kẻ săn mồi khó đoán đâu là đầu. Cá bướm thường bơi thành từng cặp, nhẹ nhàng lượn quanh rạn san hô như đôi cánh bướm.",
    habitat: "Rạn san hô Tây Đại Tây Dương",
    trait: "Dải sẫm giấu mắt",
    note: "Có những sinh vật đi đâu cũng có đôi.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá ếch rong",
    latin: "Histrio histrio (Sargassum Fish)",
    group: "khoi",
    image: "/species/sargassum-fish.webp",
    tag: "BẬC THẦY NGỤY TRANG",
    description: "Họ hàng của cá cần câu, sống giữa những thảm rong mơ trôi nổi ngoài biển khơi. Thân cá loang lổ, đầy tua rua như rong, và vây ngực như bàn tay giúp nó trèo bám giữa các cành rong.",
    habitat: "Thảm rong mơ trôi nổi vùng nhiệt đới",
    trait: "Bàn tay vây để trèo",
    note: "Trở thành một phần của khu rừng trôi nổi.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá chim",
    latin: "Stromateus fiatola (Blue Butterfish)",
    group: "khoi",
    image: "/species/butterfish.webp",
    tag: "THÂN TRÒN ÓNG BẠC",
    description: "Cùng họ với cá chim quen thuộc trên mâm cơm Việt, thân tròn dẹt, vây dài và lớp vảy mịn ánh bạc. Cá chim non thường nép dưới tán sứa trôi để tránh kẻ săn mồi.",
    habitat: "Địa Trung Hải & Đông Đại Tây Dương",
    trait: "Nép dưới tán sứa",
    note: "Một chiếc đĩa bạc lướt nhẹ trong nước.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá nhói",
    latin: "Belone belone (Garfish)",
    group: "khoi",
    image: "/species/garfish.webp",
    tag: "XƯƠNG XANH LỤC",
    description: "Thân dài mảnh như mũi tên với đôi hàm kéo dài thành chiếc mỏ đầy răng nhọn. Điều lạ lùng là xương cá nhói có màu xanh lục, do một sắc tố tự nhiên trong cơ thể.",
    habitat: "Mặt biển Đông Bắc Đại Tây Dương & Địa Trung Hải",
    trait: "Xương màu xanh lá",
    note: "Mũi tên bạc lướt sát mặt sóng.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá hố",
    latin: "Trichiurus lepturus (Largehead Hairtail)",
    group: "khoi",
    image: "/species/hairtail.webp",
    tag: "DẢI LỤA BẠC",
    description: "Thân dài dẹt như dải lụa, không vảy, không vây đuôi mà thon dần thành một sợi chỉ. Cá hố đôi khi bơi dựng đứng trong nước, hàm răng nanh sắc nhọn lấp lánh dưới ánh đèn thuyền câu đêm.",
    habitat: "Vùng biển nhiệt đới & ôn đới, có biển Việt Nam",
    trait: "Không có vây đuôi",
    note: "Một dải bạc dựng đứng giữa làn nước đêm.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá đuôi chuột",
    latin: "Coryphaenoides rupestris (Roundnose Grenadier)",
    group: "day",
    image: "/species/grenadier.webp",
    tag: "CƯ DÂN VỰC THẲM",
    description: "Đầu to, mắt lớn và chiếc đuôi dài thon nhọn như đuôi chuột. Cá đuôi chuột sống ở độ sâu từ vài trăm đến hơn hai nghìn mét, lớn rất chậm và có thể sống hàng chục năm trong bóng tối lạnh giá.",
    habitat: "Biển sâu Bắc Đại Tây Dương",
    trait: "Sống thọ trong lạnh giá",
    note: "Thời gian dưới vực sâu trôi chậm hơn.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá phèn",
    latin: "Mullus surmuletus (Striped Red Mullet)",
    group: "bo",
    image: "/species/red-mullet.webp",
    tag: "ĐÔI RÂU DÒ CÁT",
    description: "Hai sợi râu dưới cằm không ngừng quét trên nền cát để tìm giun và giáp xác ẩn mình. Người La Mã cổ đại quý cá phèn đến mức trả giá bằng bạc và ngắm nhìn sắc đỏ của chúng biến đổi.",
    habitat: "Ven bờ Địa Trung Hải & Đông Đại Tây Dương",
    trait: "Râu cằm dò mồi",
    note: "Kiên nhẫn dò từng hạt cát.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  },
  {
    name: "Cá sòng",
    latin: "Trachurus trachurus (Atlantic Horse Mackerel)",
    group: "khoi",
    image: "/species/horse-mackerel.webp",
    tag: "HÀNG VẢY GIÁP",
    description: "Dọc đường bên thân là một hàng vảy xương lớn như dãy khiên nhỏ nối nhau. Cá sòng bơi thành những đàn lớn, di chuyển theo mùa qua các vùng biển để kiếm ăn và sinh sản.",
    habitat: "Đông Đại Tây Dương & Địa Trung Hải",
    trait: "Hàng vảy khiên dọc thân",
    note: "Mỗi chiếc vảy là một tấm khiên nhỏ.",
    credit: "Tranh khắc: M. E. Bloch, Ichthyologie (1796) · Phạm vi công cộng"
  }
];

function subscribeMotionPreference(callback: () => void) {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  preference.addEventListener("change", callback);
  return () => preference.removeEventListener("change", callback);
}

function getMotionPreference() {
  return !matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Specimen({ crop, image, className = "" }: { crop?: number[]; image?: string; className?: string }) {
  if (image) {
    return (
      <div
        aria-hidden="true"
        className={`specimen-art ${className}`}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
          filter: "none"
        }}
      >
        <img
          src={image}
          alt=""
          draggable="false"
          loading="lazy"
          decoding="async"
          style={{
            maxHeight: "185px",
            maxWidth: "96%",
            objectFit: "contain",
            filter: "url(#ink-cutout)"
          }}
        />
      </div>
    );
  }
  const [x, y, w, h] = crop!;
  const clip = cropClip(x);
  return <div aria-hidden="true" className={`specimen ${className}`} style={{ aspectRatio: `${w}/${h}`, maxWidth: `calc(var(--specimen-height, 10000px) * ${w/h})`, clipPath: clip }}><img src="/fish-archive.png" alt="" draggable="false" style={{ width: `${1080 / w * 100}%`, left: `${-x / w * 100}%`, top: `${-y / h * 100}%` }} /></div>;
}
export default function Home() {
  const [selected, setSelected] = useState<number | null>(null);
  const motionPreference = useSyncExternalStore(subscribeMotionPreference, getMotionPreference, () => true);
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null);
  const motion = motionOverride ?? motionPreference;
  const [addOpen, setAddOpen] = useState(false);
  const [customSpecies, setCustomSpecies] = useState<FishSpecies[]>([]);
  const [collectionError, setCollectionError] = useState("");
  const imageUrls = useRef<string[]>([]);
  const scene = useRef<HTMLDivElement>(null);
  const speciesList = [...species, ...customSpecies];
  const [habitat, setHabitat] = useState<Habitat | "all">("all");
  const [shown, setShown] = useState(page);
  const grid = useRef<HTMLDivElement>(null);
  const filtered = habitat === "all" ? speciesList : speciesList.filter(fish => fish.group === habitat);
  const visible = filtered.slice(0, shown);
  const visibleKey = visible.map(fish => fish.id ?? fish.name).join("|");
  useDialogEntrance(selected, motion);
  // Cards fade up as they scroll into view, including ones added by a filter or "more".
  useEffect(() => {
    const cards = grid.current?.querySelectorAll<HTMLElement>(".specimen-card:not(.visible)");
    if (!cards?.length) return;
    if (!motion) { cards.forEach(card => card.classList.add("visible")); return; }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }), { rootMargin: "0px 0px -6% 0px" });
    cards.forEach(card => observer.observe(card));
    return () => observer.disconnect();
  }, [visibleKey, motion]);
  useEffect(() => {
    let active = true;
    void loadSpecimens().then(items => {
      if (!active) return;
      const loaded = items.map(item => {
        const image = URL.createObjectURL(item.imageBlob);
        imageUrls.current.push(image);
        return { ...item, image };
      });
      setCustomSpecies(current => {
        const existing = new Set(current.map(item => item.id));
        return [...loaded.filter(item => !existing.has(item.id)), ...current];
      });
    }).catch(() => { if (active) setCollectionError("Không mở được bộ sưu tập đã lưu trong trình duyệt."); });
    return () => {
      active = false;
      imageUrls.current.forEach(url => URL.revokeObjectURL(url));
      imageUrls.current = [];
    };
  }, []);
  function addSpecimen(item: SavedSpecimen) {
    const image = URL.createObjectURL(item.imageBlob);
    imageUrls.current.push(image);
    setCustomSpecies(current => [...current, { ...item, image }]);
  }
  return <main className={motion ? "" : "motion-paused"}>
    <svg width="0" height="0" aria-hidden="true" className="image-filters"><defs><filter id="ink-light" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .85 0 0 0 0 .87 0 0 0 0 .79 1 1 1 0 -.89"/></filter><filter id="ink-dark" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .15 0 0 0 0 .26 0 0 0 0 .29 1 1 1 0 -.89"/></filter><filter id="ink-cutout" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values=".265 .52 .10 0 .062 .22 .43 .08 0 .186 .187 .367 .068 0 .226 0 0 0 1 0"/></filter></defs></svg>
    <ScrollMotion motion={motion} itemCount={speciesList.length} locked={selected !== null || addOpen} />
    <SiteHeader />
    <section className="hero" id="kham-pha" onPointerMove={event => {
      if (!motion || event.pointerType === "touch" || !scene.current) return;
      const r = event.currentTarget.getBoundingClientRect();
      scene.current.style.setProperty("--mx", `${(event.clientX-r.left)/r.width-.5}`);
      scene.current.style.setProperty("--my", `${(event.clientY-r.top)/r.height-.5}`);
    }} onPointerLeave={() => { scene.current?.style.setProperty("--mx", "0"); scene.current?.style.setProperty("--my", "0"); }}>
      <OceanShader motion={motion} className="hero-shader"/>
      <div className="hero-grain"/>
      <div className="bubble-field" aria-hidden="true"/>
      <div className="hero-top"><span className="font-mono tracking-[0.22em] font-medium text-[#cbe0d5]">MỘT BỘ SƯU TẬP TỪ LÒNG BIỂN</span><span className="font-mono tracking-[0.2em] text-[#cbe0d5]/80">EST. 2026 &nbsp; / &nbsp; VOL. 01</span></div>
      <div className="hero-copy">
        {/* Eyebrow trang nhã phong cách thư tịch biển */}
        <div className="eyebrow font-mono text-[10px] sm:text-[11px] tracking-[0.25em] text-[#93b8ac] flex items-center gap-3.5 mb-5 select-none">
          <span className="w-8 h-[1px] bg-[#93b8ac]/60" />
          <span>THỦY TỘC CHÍ · CHƯƠNG I</span>
        </div>

        {/* Bố cục chữ lớn dạng Poster Khảo cứu: Cỡ chữ cực đại, phông Monospace giãn cách rộng, nền chìm chữ Hán mờ */}
        <div className="relative pl-5 sm:pl-8 border-l border-[#76a899]/35 my-6 sm:my-9 select-none">
          {/* Nền chìm chữ Hán mờ ảo tạo chiều sâu mỹ thuật đại dương */}
          <div
            aria-hidden="true"
            className="hero-watermark absolute -left-4 -top-10 sm:-top-16 text-[150px] sm:text-[230px] lg:text-[270px] font-japanese text-[#ffffff]/[0.035] leading-none pointer-events-none select-none -z-10 font-normal tracking-widest"
          >
            海洋
          </div>

          {/* Dòng định danh Poster Khảo cứu */}
          <div className="hero-label flex items-center gap-3 text-[10px] sm:text-[11px] font-mono tracking-[0.28em] text-[#86aba0] uppercase mb-4 sm:mb-5">
            <span className="w-8 h-[1px] bg-[#86aba0]/60" />
            <span>CHƯƠNG I // KHẢO CỨU ĐẠI DƯƠNG</span>
            <span className="text-[#aab3a6]/30 hidden sm:inline">|</span>
            <span className="text-[#86aba0]/60 hidden sm:inline">VOL. 2026</span>
          </div>

          {/* Tiêu đề chính cỡ cực đại, giãn cách thoáng, không có bất kỳ dấu chấm nào */}
          <h1 className="font-mono tracking-[0.03em] sm:tracking-[0.05em] leading-[1.05] my-0">
            <span className="block text-[46px] sm:text-[68px] lg:text-[84px] font-light text-[#f2efe6]">
              Một đại dương
            </span>
            <span className="block text-[46px] sm:text-[68px] lg:text-[84px] font-light text-[#9ec7ba] italic my-1 sm:my-2.5">
              Vạn điều
            </span>
            <span className="hero-glow block text-[46px] sm:text-[68px] lg:text-[84px] font-normal text-[#dcf5ec]">
              kỳ diệu
            </span>
          </h1>
        </div>

        {/* Khối mô tả thanh lịch */}
        <p className="hero-lede font-mono font-light text-[14.5px] sm:text-[16px] text-[#cde0d7]/90 leading-[1.85] tracking-[0.01em] max-w-[480px] mb-8">
          Lặn vào thế giới của những chiếc vây.<br/>
          Mỗi loài cá, một câu chuyện chưa kể.
        </p>
        <SakanaButton
          href="#bo-suu-tap"
          idPrefix="hero-explore"
          className="hero-cta px-8 sm:px-10 py-3.5 sm:py-4 text-[13px] sm:text-[14px]"
        >
          <span>BẮT ĐẦU KHÁM PHÁ</span>
          <ArrowRight size={16} />
        </SakanaButton>
      </div>
      <div className="ocean-scene" ref={scene}>
        <div className="orbit orbit-one"/><div className="orbit orbit-two"/><HeroSchool motion={motion}/><span className="scene-coordinate font-mono tracking-[0.22em]">35° 00′ N &nbsp; 139° 30′ E</span>
        <div className="fish-layer fish-one"><Specimen crop={[100, 0, 445, 173]}/><span className="specimen-caption font-mono tracking-[0.16em]">Fig. 01 — Clupeidae</span></div>
        <div className="fish-layer fish-two"><Specimen crop={[45, 158, 490, 303]}/></div>
        <div className="fish-layer fish-three"><Specimen crop={[100, 0, 445, 173]}/></div>
        <div className="floating-note font-mono"><span className="font-mono">FIELD NOTES / 001</span><p className="font-mono">“Biển luôn có<br/>một điều gì đó<br/><em>để kể.”</em></p><Waves size={31} strokeWidth={1}/></div>
        <span className="ocean-kanji" aria-hidden="true">魚</span>
        <div className="compass font-mono"><Compass size={55} strokeWidth={0.7}/><span className="font-mono">THE OCEAN ARCHIVE</span></div>
      </div>
      <div className="hero-bottom font-mono"><a href="#bo-suu-tap" className="font-mono"><span className="scroll-indicator"/> CUỘN ĐỂ LẶN SÂU HƠN</a><span className="hero-bottom-center font-mono">Vẻ đẹp nằm dưới bề mặt.</span><button onClick={() => setMotionOverride(!motion)} aria-pressed={!motion} aria-label={motion ? "Tạm dừng chuyển động" : "Bật chuyển động"} className="font-mono">{motion ? <Pause size={13}/> : <Play size={13}/>}<span>{motion ? "TẠM DỪNG" : "CHUYỂN ĐỘNG"}</span></button></div>
    </section>
    <section className="collection paper" id="bo-suu-tap">
      <div className="section-heading reveal"><div><div className="eyebrow font-mono">01 / THỦY TỘC CHÍ</div><h2>Những cư dân <em>của biển.</em></h2></div><div className="collection-heading-actions"><p className="font-mono font-light text-[15px]">Từ tầng nước lấp lánh đến đáy biển tĩnh lặng,<br/>mỗi hình dáng là một cách sống.</p><SakanaButton onClick={() => setAddOpen(true)} idPrefix="collection-add">THÊM MẪU CÁ</SakanaButton></div></div>
      {collectionError && <p className="collection-error" role="alert">{collectionError}</p>}
      <div className="habitat-filter font-mono" role="group" aria-label="Lọc theo môi trường sống">{habitats.map(item => <button key={item.key} type="button" aria-pressed={habitat === item.key} onClick={event => {
        setHabitat(item.key);
        setShown(page);
        // A shorter list must not leave the reader stranded further down the page.
        const bar = event.currentTarget.parentElement!.getBoundingClientRect();
        if (bar.top >= 0) return;
        const top = bar.top + scrollY - (document.querySelector("header")?.offsetHeight ?? 0) - 16;
        window.scrollTo({ top, behavior: "instant" });
        dispatchEvent(new CustomEvent("sakana:scroll-to", { detail: top }));
      }}>{item.label}<sup>{item.key === "all" ? speciesList.length : speciesList.filter(fish => fish.group === item.key).length}</sup></button>)}</div>
      <div className="specimen-grid" ref={grid}>{visible.map((fish, position) => { const index = speciesList.indexOf(fish); return <button className="specimen-card card-reveal" style={{ "--delay": `${(position % 3) * 90}ms` } as CSSProperties} key={fish.id ?? fish.name} onClick={() => setSelected(index)} aria-label={`Khám phá ${fish.name}`}><div className="card-top font-mono"><span>PLATE {String(index + 1).padStart(2, "0")}</span><span>{fish.tag}</span></div><div className="card-art"><Specimen crop={fish.crop} image={fish.image}/><span className="card-orbit"/></div><div className="card-bottom"><div><h3 className="font-mono">{fish.name}</h3><p className="font-mono italic text-[13.5px]">{fish.latin}</p></div><span className="circle-arrow"><ArrowUpRight size={21}/></span></div></button>; })}</div>
      {filtered.length > shown && <div className="collection-more"><SakanaButton onClick={() => setShown(count => count + page)} idPrefix="collection-more"><span>XEM THÊM {Math.min(page, filtered.length - shown)} LOÀI</span> <ArrowDown size={15}/></SakanaButton><span className="font-mono">{shown} / {filtered.length} TIÊU BẢN</span></div>}
      <div className="collection-foot font-mono"><span>{speciesList.length} HÌNH DÁNG. {speciesList.length} CÁCH SỐNG.</span><Waves size={25} strokeWidth={1}/><span>MỘT ĐẠI DƯƠNG CHUNG.</span></div>
    </section>
    <section className="story" id="cau-chuyen"><div className="story-swimmer-layer" aria-hidden="true"><svg viewBox="0 0 1000 600" preserveAspectRatio="none"><path className="swim-trail" d="M1060,40 C850,20 760,230 560,250 S240,330 170,470 S20,600 -60,560"/></svg><div className="story-swimmer"><img src="/species/flying-fish.png" alt="" draggable="false"/></div></div><div className="story-image reveal"><img src="/ocean-collage.png" alt="Collage cá bạc, tranh sóng biển Nhật Bản và những trang giấy cổ" loading="lazy"/><span className="image-label font-mono">FRAGMENTS OF THE SEA — 001</span><div className="story-stamp font-mono">海<span className="font-mono">BIỂN CẢ</span></div></div><div className="story-copy reveal"><div className="eyebrow font-mono">02 / CHUYỆN TỪ LÒNG BIỂN</div><h2>Không chỉ là cá.<br/>Là cả một<br/><em>thế giới.</em></h2><p className="font-mono font-light text-[15px] leading-[1.85]">Có những vẻ đẹp chỉ hiện ra khi ta chậm lại. Một đường vân trên vảy, nhịp đập của vây, hay cách cả đàn cá cùng đổi hướng.</p><p className="font-mono font-light text-[15px] leading-[1.85]">Sakana là một cuốn thủy tộc chí nhỏ — nơi chúng ta quan sát, tìm hiểu và yêu thêm thế giới ở phía bên kia mặt nước.</p><div className="pt-2"><SakanaButton href="#bo-suu-tap" idPrefix="story-collection"><span>Mở cuốn thủy tộc chí</span> <ArrowRight size={16}/></SakanaButton></div></div></section>
    <SilhouetteQuiz fish={speciesList} />
    <OceanMarquee />
    <OceanChapters motion={motion} onAddSpecimen={() => setAddOpen(true)} />
    <footer><a className="brand" href="#kham-pha" aria-label="Sakana — Về đầu trang"><SakanaLogo size={48} theme="ink" /><div className="flex flex-col"><div className="flex items-center gap-2"><span className="font-japanese text-[22px] text-[#193b47] leading-none">さかな</span><span className="px-1.5 py-0.5 bg-[#ba3b32] text-[#fbf8f1] text-[9px] font-serif rounded-[2px] leading-tight">魚</span></div><span className="font-mono tracking-[0.24em] text-[11px] font-semibold text-[#193b47] uppercase mt-0.5">SAKANA</span></div></a><p className="font-mono italic text-[14.5px]">Một chút tò mò. Cả một đại dương.</p><div className="flex justify-end"><SakanaButton href="#kham-pha" idPrefix="footer-kham-pha" className="px-5 py-2 text-[11.5px]"><span>Trở về mặt nước</span> <ArrowUpRight size={15}/></SakanaButton></div><span className="footer-bottom font-mono">© 2026 SAKANA &nbsp; · &nbsp; AN OCEAN OF CURIOSITY</span></footer>
    <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}><DialogContent className="fish-dialog paper font-mono" showCloseButton={false}>{selected !== null && speciesList[selected] && <><DialogClose className="dialog-close" aria-label="Đóng thông tin"><X size={22}/></DialogClose><span className="eyebrow font-mono">THỦY TỘC CHÍ / PLATE {String(selected + 1).padStart(2, "0")}</span><div className="dialog-art"><Specimen crop={speciesList[selected].crop} image={speciesList[selected].image}/></div><DialogTitle className="dialog-title font-mono">{speciesList[selected].name}</DialogTitle><span className="latin font-mono">{speciesList[selected].latin}</span><DialogDescription className="dialog-description font-mono">{speciesList[selected].description}</DialogDescription><dl className="fish-facts font-mono"><div><dt className="font-mono">MÔI TRƯỜNG</dt><dd className="font-mono">{speciesList[selected].habitat}</dd></div><div><dt className="font-mono">ĐẶC ĐIỂM</dt><dd className="font-mono">{speciesList[selected].trait}</dd></div></dl><p className="fish-note font-mono">{speciesList[selected].note}</p><p className="illustration-note font-mono">{speciesList[selected].id ? "Ảnh và thông tin do bạn thêm, lưu trên trình duyệt này." : speciesList[selected].credit ?? "Tranh khắc minh họa theo nhóm cá, không dùng để định danh loài."}</p></>}</DialogContent></Dialog>
    <AddSpecimenDialog open={addOpen} onOpenChange={setAddOpen} onAdded={addSpecimen}/>
  </main>;
}

