import svgPaths from "./svg-gkkjy4cmz9";
import imgContainer from "figma:asset/1cdaaf404081187f07c6e8961821c69500af1010.png";
import imgContainer1 from "figma:asset/363a8de6fd03387d5f94a2db79d3969c6d993d02.png";

function Container() {
  return <div className="absolute bg-[rgba(0,0,0,0.4)] blur-3xl filter h-[831.992px] left-0 rounded-[16px] top-[24px] w-[1023.98px]" data-name="Container" />;
}

function Container1() {
  return (
    <div className="absolute h-[831.992px] left-0 opacity-20 rounded-[16px] top-0 w-[1023.98px]" data-name="Container">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[16px] size-full" src={imgContainer} />
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute h-[800px] left-0 opacity-30 rounded-bl-[10px] rounded-tl-[10px] top-0 w-[493.008px]" data-name="Container">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-bl-[10px] rounded-tl-[10px] size-full" src={imgContainer1} />
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-[185.14px] size-[40px] top-0" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="Icon">
          <path d={svgPaths.p3c977280} id="Vector" stroke="var(--stroke-0, #EC003F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33333" />
        </g>
      </svg>
    </div>
  );
}

function Heading() {
  return (
    <div className="absolute h-[31.992px] left-0 top-[47.99px] w-[410.273px]" data-name="Heading 2">
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[32px] left-[204.88px] text-[24px] text-center text-nowrap text-stone-800 top-[-3.25px] translate-x-[-50%] whitespace-pre">{`도움말 & 리소스`}</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="absolute content-stretch flex h-[15.977px] items-start left-0 top-[87.97px] w-[410.273px]" data-name="Paragraph">
      <p className="basis-0 font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal grow leading-[16px] min-h-px min-w-px relative shrink-0 text-[#57534d] text-[12px] text-center">언제든 도움을 요청할 수 있습니다</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[121.191px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_1.25px] border-solid border-stone-300 inset-0 pointer-events-none" />
      <Icon />
      <Heading />
      <Paragraph />
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4_1285)" id="Icon">
          <path d={svgPaths.p7b90900} id="Vector" stroke="var(--stroke-0, #57534D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
        <defs>
          <clipPath id="clip0_4_1285">
            <rect fill="white" height="11.9922" width="11.9922" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[48.008px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[48.008px]">
        <p className="basis-0 font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal grow leading-[16px] min-h-px min-w-px relative shrink-0 text-[#57534d] text-[12px]">카테고리</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Container">
      <Icon1 />
      <Text />
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-[#e17100] h-[34.473px] left-0 rounded-[10px] top-0 w-[131.426px]" data-name="Button">
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[66.21px] text-[12px] text-center text-nowrap text-white top-[8.24px] translate-x-[-50%] whitespace-pre">전체</p>
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-[29.61px] size-[15.996px] top-[9.24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_4_1277)" id="Icon">
          <path d={svgPaths.p179c9000} id="Vector" stroke="var(--stroke-0, #44403B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M7.99805 5.99854V8.66455" id="Vector_2" stroke="var(--stroke-0, #44403B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M7.99805 11.3306H8.00471" id="Vector_3" stroke="var(--stroke-0, #44403B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
        <defs>
          <clipPath id="clip0_4_1277">
            <rect fill="white" height="15.9961" width="15.9961" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute bg-white h-[34.473px] left-[139.41px] rounded-[10px] top-0 w-[131.426px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[1.25px] border-solid border-stone-300 inset-0 pointer-events-none rounded-[10px]" />
      <Icon2 />
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[75.59px] text-[#44403b] text-[12px] text-center text-nowrap top-[8.24px] translate-x-[-50%] whitespace-pre">긴급 상담</p>
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute left-[29.61px] size-[15.996px] top-[9.24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_4_1274)" id="Icon">
          <path d={svgPaths.p3de13100} id="Vector" stroke="var(--stroke-0, #44403B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
        <defs>
          <clipPath id="clip0_4_1274">
            <rect fill="white" height="15.9961" width="15.9961" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute bg-white h-[34.473px] left-[278.83px] rounded-[10px] top-0 w-[131.445px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[1.25px] border-solid border-stone-300 inset-0 pointer-events-none rounded-[10px]" />
      <Icon3 />
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[75.59px] text-[#44403b] text-[12px] text-center text-nowrap top-[8.24px] translate-x-[-50%] whitespace-pre">전문 상담</p>
    </div>
  );
}

function Icon4() {
  return (
    <div className="absolute left-[29.61px] size-[15.996px] top-[9.24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_4_1267)" id="Icon">
          <path d={svgPaths.p8c21c80} id="Vector" stroke="var(--stroke-0, #44403B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
        <defs>
          <clipPath id="clip0_4_1267">
            <rect fill="white" height="15.9961" width="15.9961" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute bg-white h-[34.473px] left-0 rounded-[10px] top-[42.46px] w-[131.426px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[1.25px] border-solid border-stone-300 inset-0 pointer-events-none rounded-[10px]" />
      <Icon4 />
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[75.59px] text-[#44403b] text-[12px] text-center text-nowrap top-[8.24px] translate-x-[-50%] whitespace-pre">상담 전화</p>
    </div>
  );
}

function Icon5() {
  return (
    <div className="absolute left-[29.61px] size-[15.996px] top-[9.24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_4_1249)" id="Icon">
          <path d="M7.99805 6.66504H8.00471" id="Vector" stroke="var(--stroke-0, #44403B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M7.99805 9.33105H8.00471" id="Vector_2" stroke="var(--stroke-0, #44403B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M7.99805 3.99902H8.00471" id="Vector_3" stroke="var(--stroke-0, #44403B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M10.6641 6.66504H10.6707" id="Vector_4" stroke="var(--stroke-0, #44403B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M10.6641 9.33105H10.6707" id="Vector_5" stroke="var(--stroke-0, #44403B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M10.6641 3.99902H10.6707" id="Vector_6" stroke="var(--stroke-0, #44403B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M5.33203 6.66504H5.3387" id="Vector_7" stroke="var(--stroke-0, #44403B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M5.33203 9.33105H5.3387" id="Vector_8" stroke="var(--stroke-0, #44403B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M5.33203 3.99902H5.3387" id="Vector_9" stroke="var(--stroke-0, #44403B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d={svgPaths.p5103b00} id="Vector_10" stroke="var(--stroke-0, #44403B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d={svgPaths.p3eb68a00} id="Vector_11" stroke="var(--stroke-0, #44403B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
        <defs>
          <clipPath id="clip0_4_1249">
            <rect fill="white" height="15.9961" width="15.9961" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute bg-white h-[34.473px] left-[139.41px] rounded-[10px] top-[42.46px] w-[131.426px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[1.25px] border-solid border-stone-300 inset-0 pointer-events-none rounded-[10px]" />
      <Icon5 />
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[75.59px] text-[#44403b] text-[12px] text-center text-nowrap top-[8.24px] translate-x-[-50%] whitespace-pre">의료 기관</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[76.934px] relative shrink-0 w-full" data-name="Container">
      <Button />
      <Button1 />
      <Button2 />
      <Button3 />
      <Button4 />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col gap-[7.988px] h-[100.898px] items-start relative shrink-0 w-full" data-name="Container">
      <Container4 />
      <Container5 />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#57534d] text-[12px] top-[-1px] w-[76px]">총 8개의 기관</p>
    </div>
  );
}

function Heading1() {
  return (
    <div className="absolute content-stretch flex h-[20px] items-start left-0 top-0 w-[375.781px]" data-name="Heading 3">
      <p className="basis-0 font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal grow leading-[20px] min-h-px min-w-px relative shrink-0 text-[14px] text-stone-800">자살예방 상담전화</p>
    </div>
  );
}

function Icon6() {
  return (
    <div className="absolute left-[9.24px] size-[15.996px] top-[5.23px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_4_1238)" id="Icon">
          <path d={svgPaths.p3d631b60} id="Vector" stroke="var(--stroke-0, #C70036)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M7.99805 5.99854V8.66455" id="Vector_2" stroke="var(--stroke-0, #C70036)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M7.99805 11.3306H8.00471" id="Vector_3" stroke="var(--stroke-0, #C70036)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
        <defs>
          <clipPath id="clip0_4_1238">
            <rect fill="white" height="15.9961" width="15.9961" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text1() {
  return (
    <div className="absolute bg-rose-100 h-[26.465px] left-0 rounded-[4.1943e+07px] top-[23.98px] w-[90.684px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#ffa1ad] border-[1.25px] border-solid inset-0 pointer-events-none rounded-[4.1943e+07px]" />
      <Icon6 />
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[29.22px] text-[#c70036] text-[12px] text-nowrap top-[4.23px] whitespace-pre">긴급 상담</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[50.449px] relative shrink-0 w-full" data-name="Container">
      <Heading1 />
      <Text1 />
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[19.473px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[19.5px] left-0 text-[#57534d] text-[12px] text-nowrap top-[-1.75px] whitespace-pre">24시간 위기상담 및 자살예방 전문 상담</p>
    </div>
  );
}

function Icon7() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4_1246)" id="Icon">
          <path d={svgPaths.p3f4af900} id="Vector" stroke="var(--stroke-0, #1447E6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
        <defs>
          <clipPath id="clip0_4_1246">
            <rect fill="white" height="11.9922" width="11.9922" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[26.445px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[26.445px]">
        <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#1447e6] text-[12px] text-nowrap whitespace-pre">1393</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Link">
      <Icon7 />
      <Text2 />
    </div>
  );
}

function Icon8() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4_1270)" id="Icon">
          <path d={svgPaths.p2faab000} id="Vector" stroke="var(--stroke-0, #57534D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p36ca1140} id="Vector_2" stroke="var(--stroke-0, #57534D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
        <defs>
          <clipPath id="clip0_4_1270">
            <rect fill="white" height="11.9922" width="11.9922" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[37.227px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[37.227px]">
        <p className="font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#57534d] text-[12px] text-nowrap whitespace-pre">24시간</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Container">
      <Icon8 />
      <Text3 />
    </div>
  );
}

function Icon9() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p2317f580} id="Vector" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p255b9b58} id="Vector_2" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p36ba96e0} id="Vector_3" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
      </svg>
    </div>
  );
}

function Text4() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[76.23px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[76.23px]">
        <p className="basis-0 font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal grow leading-[16px] min-h-px min-w-px relative shrink-0 text-[#8200db] text-[12px]">웹사이트 방문</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Link">
      <Icon9 />
      <Text4 />
    </div>
  );
}

function Container9() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[7.988px] h-[73.145px] items-start pb-0 pt-[9.238px] px-0 relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.25px_0px_0px] border-solid border-stone-200 inset-0 pointer-events-none" />
      <Link />
      <Container8 />
      <Link1 />
    </div>
  );
}

function Container10() {
  return (
    <div className="bg-[rgba(255,255,255,0.7)] h-[201.543px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.25px] border-solid border-stone-300 inset-0 pointer-events-none rounded-[10px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[11.992px] h-[201.543px] items-start pb-[1.25px] pt-[17.246px] px-[17.246px] relative w-full">
          <Container7 />
          <Paragraph2 />
          <Container9 />
        </div>
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="absolute content-stretch flex h-[20px] items-start left-0 top-0 w-[375.781px]" data-name="Heading 3">
      <p className="basis-0 font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal grow leading-[20px] min-h-px min-w-px relative shrink-0 text-[14px] text-stone-800">정신건강 위기상담 전화</p>
    </div>
  );
}

function Icon10() {
  return (
    <div className="absolute left-[9.24px] size-[15.996px] top-[5.23px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_4_1238)" id="Icon">
          <path d={svgPaths.p3d631b60} id="Vector" stroke="var(--stroke-0, #C70036)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M7.99805 5.99854V8.66455" id="Vector_2" stroke="var(--stroke-0, #C70036)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M7.99805 11.3306H8.00471" id="Vector_3" stroke="var(--stroke-0, #C70036)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
        <defs>
          <clipPath id="clip0_4_1238">
            <rect fill="white" height="15.9961" width="15.9961" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text5() {
  return (
    <div className="absolute bg-rose-100 h-[26.465px] left-0 rounded-[4.1943e+07px] top-[23.98px] w-[90.684px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#ffa1ad] border-[1.25px] border-solid inset-0 pointer-events-none rounded-[4.1943e+07px]" />
      <Icon10 />
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[29.22px] text-[#c70036] text-[12px] text-nowrap top-[4.23px] whitespace-pre">긴급 상담</p>
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[50.449px] relative shrink-0 w-full" data-name="Container">
      <Heading2 />
      <Text5 />
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[19.473px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[19.5px] left-0 text-[#57534d] text-[12px] text-nowrap top-[-1.75px] whitespace-pre">정신건강 위기 상황에 대한 전문 상담</p>
    </div>
  );
}

function Icon11() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4_1246)" id="Icon">
          <path d={svgPaths.p3f4af900} id="Vector" stroke="var(--stroke-0, #1447E6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
        <defs>
          <clipPath id="clip0_4_1246">
            <rect fill="white" height="11.9922" width="11.9922" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text6() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[57.813px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[57.813px]">
        <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#1447e6] text-[12px] text-nowrap whitespace-pre">1577-0199</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Link">
      <Icon11 />
      <Text6 />
    </div>
  );
}

function Icon12() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4_1270)" id="Icon">
          <path d={svgPaths.p2faab000} id="Vector" stroke="var(--stroke-0, #57534D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p36ca1140} id="Vector_2" stroke="var(--stroke-0, #57534D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
        <defs>
          <clipPath id="clip0_4_1270">
            <rect fill="white" height="11.9922" width="11.9922" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text7() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[37.227px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[37.227px]">
        <p className="font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#57534d] text-[12px] text-nowrap whitespace-pre">24시간</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Container">
      <Icon12 />
      <Text7 />
    </div>
  );
}

function Icon13() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p2317f580} id="Vector" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p255b9b58} id="Vector_2" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p36ba96e0} id="Vector_3" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
      </svg>
    </div>
  );
}

function Text8() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[76.23px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[76.23px]">
        <p className="basis-0 font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal grow leading-[16px] min-h-px min-w-px relative shrink-0 text-[#8200db] text-[12px]">웹사이트 방문</p>
      </div>
    </div>
  );
}

function Link3() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Link">
      <Icon13 />
      <Text8 />
    </div>
  );
}

function Container13() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[7.988px] h-[73.145px] items-start pb-0 pt-[9.238px] px-0 relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.25px_0px_0px] border-solid border-stone-200 inset-0 pointer-events-none" />
      <Link2 />
      <Container12 />
      <Link3 />
    </div>
  );
}

function Container14() {
  return (
    <div className="bg-[rgba(255,255,255,0.7)] h-[201.543px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.25px] border-solid border-stone-300 inset-0 pointer-events-none rounded-[10px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[11.992px] h-[201.543px] items-start pb-[1.25px] pt-[17.246px] px-[17.246px] relative w-full">
          <Container11 />
          <Paragraph3 />
          <Container13 />
        </div>
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="absolute content-stretch flex h-[20px] items-start left-0 top-0 w-[375.781px]" data-name="Heading 3">
      <p className="basis-0 font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal grow leading-[20px] min-h-px min-w-px relative shrink-0 text-[14px] text-stone-800">청소년 상담전화</p>
    </div>
  );
}

function Icon14() {
  return (
    <div className="absolute left-[9.24px] size-[15.996px] top-[5.23px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_4_1243)" id="Icon">
          <path d={svgPaths.p8c21c80} id="Vector" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
        <defs>
          <clipPath id="clip0_4_1243">
            <rect fill="white" height="15.9961" width="15.9961" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text9() {
  return (
    <div className="absolute bg-purple-100 h-[26.465px] left-0 rounded-[4.1943e+07px] top-[23.98px] w-[90.684px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#dab2ff] border-[1.25px] border-solid inset-0 pointer-events-none rounded-[4.1943e+07px]" />
      <Icon14 />
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[29.22px] text-[#8200db] text-[12px] text-nowrap top-[4.23px] whitespace-pre">상담 전화</p>
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[50.449px] relative shrink-0 w-full" data-name="Container">
      <Heading3 />
      <Text9 />
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[19.473px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[19.5px] left-0 text-[#57534d] text-[12px] text-nowrap top-[-1.75px] whitespace-pre">청소년의 고민과 위기 상황 상담</p>
    </div>
  );
}

function Icon15() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4_1246)" id="Icon">
          <path d={svgPaths.p3f4af900} id="Vector" stroke="var(--stroke-0, #1447E6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
        <defs>
          <clipPath id="clip0_4_1246">
            <rect fill="white" height="11.9922" width="11.9922" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text10() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[26.445px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[26.445px]">
        <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#1447e6] text-[12px] text-nowrap whitespace-pre">1388</p>
      </div>
    </div>
  );
}

function Link4() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Link">
      <Icon15 />
      <Text10 />
    </div>
  );
}

function Icon16() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4_1270)" id="Icon">
          <path d={svgPaths.p2faab000} id="Vector" stroke="var(--stroke-0, #57534D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p36ca1140} id="Vector_2" stroke="var(--stroke-0, #57534D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
        <defs>
          <clipPath id="clip0_4_1270">
            <rect fill="white" height="11.9922" width="11.9922" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text11() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[37.227px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[37.227px]">
        <p className="font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#57534d] text-[12px] text-nowrap whitespace-pre">24시간</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Container">
      <Icon16 />
      <Text11 />
    </div>
  );
}

function Icon17() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p2317f580} id="Vector" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p255b9b58} id="Vector_2" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p36ba96e0} id="Vector_3" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
      </svg>
    </div>
  );
}

function Text12() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[76.23px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[76.23px]">
        <p className="basis-0 font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal grow leading-[16px] min-h-px min-w-px relative shrink-0 text-[#8200db] text-[12px]">웹사이트 방문</p>
      </div>
    </div>
  );
}

function Link5() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Link">
      <Icon17 />
      <Text12 />
    </div>
  );
}

function Container17() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[7.988px] h-[73.145px] items-start pb-0 pt-[9.238px] px-0 relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.25px_0px_0px] border-solid border-stone-200 inset-0 pointer-events-none" />
      <Link4 />
      <Container16 />
      <Link5 />
    </div>
  );
}

function Container18() {
  return (
    <div className="bg-[rgba(255,255,255,0.7)] h-[201.543px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.25px] border-solid border-stone-300 inset-0 pointer-events-none rounded-[10px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[11.992px] h-[201.543px] items-start pb-[1.25px] pt-[17.246px] px-[17.246px] relative w-full">
          <Container15 />
          <Paragraph4 />
          <Container17 />
        </div>
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="absolute content-stretch flex h-[20px] items-start left-0 top-0 w-[375.781px]" data-name="Heading 3">
      <p className="basis-0 font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal grow leading-[20px] min-h-px min-w-px relative shrink-0 text-[14px] text-stone-800">한국생명의전화</p>
    </div>
  );
}

function Icon18() {
  return (
    <div className="absolute left-[9.24px] size-[15.996px] top-[5.23px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_4_1243)" id="Icon">
          <path d={svgPaths.p8c21c80} id="Vector" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
        <defs>
          <clipPath id="clip0_4_1243">
            <rect fill="white" height="15.9961" width="15.9961" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text13() {
  return (
    <div className="absolute bg-purple-100 h-[26.465px] left-0 rounded-[4.1943e+07px] top-[23.98px] w-[90.684px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#dab2ff] border-[1.25px] border-solid inset-0 pointer-events-none rounded-[4.1943e+07px]" />
      <Icon18 />
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[29.22px] text-[#8200db] text-[12px] text-nowrap top-[4.23px] whitespace-pre">상담 전화</p>
    </div>
  );
}

function Container19() {
  return (
    <div className="h-[50.449px] relative shrink-0 w-full" data-name="Container">
      <Heading4 />
      <Text13 />
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[19.473px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[19.5px] left-0 text-[#57534d] text-[12px] text-nowrap top-[-1.75px] whitespace-pre">자살예방 및 정서적 지원 상담</p>
    </div>
  );
}

function Icon19() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4_1246)" id="Icon">
          <path d={svgPaths.p3f4af900} id="Vector" stroke="var(--stroke-0, #1447E6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
        <defs>
          <clipPath id="clip0_4_1246">
            <rect fill="white" height="11.9922" width="11.9922" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text14() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[57.813px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[57.813px]">
        <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#1447e6] text-[12px] text-nowrap whitespace-pre">1588-9191</p>
      </div>
    </div>
  );
}

function Link6() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Link">
      <Icon19 />
      <Text14 />
    </div>
  );
}

function Icon20() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4_1270)" id="Icon">
          <path d={svgPaths.p2faab000} id="Vector" stroke="var(--stroke-0, #57534D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p36ca1140} id="Vector_2" stroke="var(--stroke-0, #57534D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
        <defs>
          <clipPath id="clip0_4_1270">
            <rect fill="white" height="11.9922" width="11.9922" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text15() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[37.227px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[37.227px]">
        <p className="font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#57534d] text-[12px] text-nowrap whitespace-pre">24시간</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Container">
      <Icon20 />
      <Text15 />
    </div>
  );
}

function Icon21() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p2317f580} id="Vector" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p255b9b58} id="Vector_2" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p36ba96e0} id="Vector_3" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
      </svg>
    </div>
  );
}

function Text16() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[76.23px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[76.23px]">
        <p className="basis-0 font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal grow leading-[16px] min-h-px min-w-px relative shrink-0 text-[#8200db] text-[12px]">웹사이트 방문</p>
      </div>
    </div>
  );
}

function Link7() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Link">
      <Icon21 />
      <Text16 />
    </div>
  );
}

function Container21() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[7.988px] h-[73.145px] items-start pb-0 pt-[9.238px] px-0 relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.25px_0px_0px] border-solid border-stone-200 inset-0 pointer-events-none" />
      <Link6 />
      <Container20 />
      <Link7 />
    </div>
  );
}

function Container22() {
  return (
    <div className="bg-[rgba(255,255,255,0.7)] h-[201.543px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.25px] border-solid border-stone-300 inset-0 pointer-events-none rounded-[10px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[11.992px] h-[201.543px] items-start pb-[1.25px] pt-[17.246px] px-[17.246px] relative w-full">
          <Container19 />
          <Paragraph5 />
          <Container21 />
        </div>
      </div>
    </div>
  );
}

function Heading5() {
  return (
    <div className="absolute content-stretch flex h-[20px] items-start left-0 top-0 w-[375.781px]" data-name="Heading 3">
      <p className="basis-0 font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal grow leading-[20px] min-h-px min-w-px relative shrink-0 text-[14px] text-stone-800">마음이음</p>
    </div>
  );
}

function Icon22() {
  return (
    <div className="absolute left-[9.24px] size-[15.996px] top-[5.23px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_4_1222)" id="Icon">
          <path d={svgPaths.p170b7a00} id="Vector" stroke="var(--stroke-0, #1447E6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
        <defs>
          <clipPath id="clip0_4_1222">
            <rect fill="white" height="15.9961" width="15.9961" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text17() {
  return (
    <div className="absolute bg-blue-100 h-[26.465px] left-0 rounded-[4.1943e+07px] top-[23.98px] w-[90.684px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#8ec5ff] border-[1.25px] border-solid inset-0 pointer-events-none rounded-[4.1943e+07px]" />
      <Icon22 />
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[29.22px] text-[#1447e6] text-[12px] text-nowrap top-[4.23px] whitespace-pre">전문 상담</p>
    </div>
  );
}

function Container23() {
  return (
    <div className="h-[50.449px] relative shrink-0 w-full" data-name="Container">
      <Heading5 />
      <Text17 />
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="h-[19.473px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[19.5px] left-0 text-[#57534d] text-[12px] text-nowrap top-[-1.75px] whitespace-pre">정신건강 관련 정보 제공 및 전문기관 연계</p>
    </div>
  );
}

function Icon23() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4_1246)" id="Icon">
          <path d={svgPaths.p3f4af900} id="Vector" stroke="var(--stroke-0, #1447E6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
        <defs>
          <clipPath id="clip0_4_1246">
            <rect fill="white" height="11.9922" width="11.9922" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text18() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[57.813px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[57.813px]">
        <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#1447e6] text-[12px] text-nowrap whitespace-pre">1577-0199</p>
      </div>
    </div>
  );
}

function Link8() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Link">
      <Icon23 />
      <Text18 />
    </div>
  );
}

function Icon24() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4_1270)" id="Icon">
          <path d={svgPaths.p2faab000} id="Vector" stroke="var(--stroke-0, #57534D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p36ca1140} id="Vector_2" stroke="var(--stroke-0, #57534D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
        <defs>
          <clipPath id="clip0_4_1270">
            <rect fill="white" height="11.9922" width="11.9922" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text19() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[80.469px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[80.469px]">
        <p className="basis-0 font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal grow leading-[16px] min-h-px min-w-px relative shrink-0 text-[#57534d] text-[12px]">평일 9시~18시</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Container">
      <Icon24 />
      <Text19 />
    </div>
  );
}

function Icon25() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p2317f580} id="Vector" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p255b9b58} id="Vector_2" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p36ba96e0} id="Vector_3" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
      </svg>
    </div>
  );
}

function Text20() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[76.23px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[76.23px]">
        <p className="basis-0 font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal grow leading-[16px] min-h-px min-w-px relative shrink-0 text-[#8200db] text-[12px]">웹사이트 방문</p>
      </div>
    </div>
  );
}

function Link9() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Link">
      <Icon25 />
      <Text20 />
    </div>
  );
}

function Container25() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[7.988px] h-[73.145px] items-start pb-0 pt-[9.238px] px-0 relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.25px_0px_0px] border-solid border-stone-200 inset-0 pointer-events-none" />
      <Link8 />
      <Container24 />
      <Link9 />
    </div>
  );
}

function Container26() {
  return (
    <div className="bg-[rgba(255,255,255,0.7)] h-[201.543px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.25px] border-solid border-stone-300 inset-0 pointer-events-none rounded-[10px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[11.992px] h-[201.543px] items-start pb-[1.25px] pt-[17.246px] px-[17.246px] relative w-full">
          <Container23 />
          <Paragraph6 />
          <Container25 />
        </div>
      </div>
    </div>
  );
}

function Heading6() {
  return (
    <div className="absolute content-stretch flex h-[20px] items-start left-0 top-0 w-[375.781px]" data-name="Heading 3">
      <p className="basis-0 font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal grow leading-[20px] min-h-px min-w-px relative shrink-0 text-[14px] text-stone-800">한국심리상담센터</p>
    </div>
  );
}

function Icon26() {
  return (
    <div className="absolute left-[9.24px] size-[15.996px] top-[5.23px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_4_1222)" id="Icon">
          <path d={svgPaths.p170b7a00} id="Vector" stroke="var(--stroke-0, #1447E6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
        <defs>
          <clipPath id="clip0_4_1222">
            <rect fill="white" height="15.9961" width="15.9961" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text21() {
  return (
    <div className="absolute bg-blue-100 h-[26.465px] left-0 rounded-[4.1943e+07px] top-[23.98px] w-[90.684px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#8ec5ff] border-[1.25px] border-solid inset-0 pointer-events-none rounded-[4.1943e+07px]" />
      <Icon26 />
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[29.22px] text-[#1447e6] text-[12px] text-nowrap top-[4.23px] whitespace-pre">전문 상담</p>
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[50.449px] relative shrink-0 w-full" data-name="Container">
      <Heading6 />
      <Text21 />
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="h-[19.473px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[19.5px] left-0 text-[#57534d] text-[12px] text-nowrap top-[-1.75px] whitespace-pre">전문 심리상담사와의 1:1 상담</p>
    </div>
  );
}

function Icon27() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4_1246)" id="Icon">
          <path d={svgPaths.p3f4af900} id="Vector" stroke="var(--stroke-0, #1447E6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
        <defs>
          <clipPath id="clip0_4_1246">
            <rect fill="white" height="11.9922" width="11.9922" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text22() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[57.813px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[57.813px]">
        <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#1447e6] text-[12px] text-nowrap whitespace-pre">1899-1231</p>
      </div>
    </div>
  );
}

function Link10() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Link">
      <Icon27 />
      <Text22 />
    </div>
  );
}

function Icon28() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4_1270)" id="Icon">
          <path d={svgPaths.p2faab000} id="Vector" stroke="var(--stroke-0, #57534D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p36ca1140} id="Vector_2" stroke="var(--stroke-0, #57534D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
        <defs>
          <clipPath id="clip0_4_1270">
            <rect fill="white" height="11.9922" width="11.9922" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text23() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[87.07px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[87.07px]">
        <p className="basis-0 font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal grow leading-[16px] min-h-px min-w-px relative shrink-0 text-[#57534d] text-[12px]">평일 10시~19시</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Container">
      <Icon28 />
      <Text23 />
    </div>
  );
}

function Icon29() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p2317f580} id="Vector" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p255b9b58} id="Vector_2" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p36ba96e0} id="Vector_3" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
      </svg>
    </div>
  );
}

function Text24() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[76.23px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[76.23px]">
        <p className="basis-0 font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal grow leading-[16px] min-h-px min-w-px relative shrink-0 text-[#8200db] text-[12px]">웹사이트 방문</p>
      </div>
    </div>
  );
}

function Link11() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Link">
      <Icon29 />
      <Text24 />
    </div>
  );
}

function Container29() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[7.988px] h-[73.145px] items-start pb-0 pt-[9.238px] px-0 relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.25px_0px_0px] border-solid border-stone-200 inset-0 pointer-events-none" />
      <Link10 />
      <Container28 />
      <Link11 />
    </div>
  );
}

function Container30() {
  return (
    <div className="bg-[rgba(255,255,255,0.7)] h-[201.543px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.25px] border-solid border-stone-300 inset-0 pointer-events-none rounded-[10px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[11.992px] h-[201.543px] items-start pb-[1.25px] pt-[17.246px] px-[17.246px] relative w-full">
          <Container27 />
          <Paragraph7 />
          <Container29 />
        </div>
      </div>
    </div>
  );
}

function Heading7() {
  return (
    <div className="absolute content-stretch flex h-[20px] items-start left-0 top-0 w-[375.781px]" data-name="Heading 3">
      <p className="basis-0 font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal grow leading-[20px] min-h-px min-w-px relative shrink-0 text-[14px] text-stone-800">대한신경정신의학회</p>
    </div>
  );
}

function Icon30() {
  return (
    <div className="absolute left-[9.24px] size-[15.996px] top-[5.23px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_4_1225)" id="Icon">
          <path d="M7.99805 6.66504H8.00471" id="Vector" stroke="var(--stroke-0, #008236)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M7.99805 9.33105H8.00471" id="Vector_2" stroke="var(--stroke-0, #008236)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M7.99805 3.99902H8.00471" id="Vector_3" stroke="var(--stroke-0, #008236)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M10.6641 6.66504H10.6707" id="Vector_4" stroke="var(--stroke-0, #008236)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M10.6641 9.33105H10.6707" id="Vector_5" stroke="var(--stroke-0, #008236)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M10.6641 3.99902H10.6707" id="Vector_6" stroke="var(--stroke-0, #008236)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M5.33203 6.66504H5.3387" id="Vector_7" stroke="var(--stroke-0, #008236)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M5.33203 9.33105H5.3387" id="Vector_8" stroke="var(--stroke-0, #008236)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M5.33203 3.99902H5.3387" id="Vector_9" stroke="var(--stroke-0, #008236)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d={svgPaths.p5103b00} id="Vector_10" stroke="var(--stroke-0, #008236)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d={svgPaths.p3eb68a00} id="Vector_11" stroke="var(--stroke-0, #008236)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
        <defs>
          <clipPath id="clip0_4_1225">
            <rect fill="white" height="15.9961" width="15.9961" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text25() {
  return (
    <div className="absolute bg-green-100 h-[26.465px] left-0 rounded-[4.1943e+07px] top-[23.98px] w-[90.684px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#7bf1a8] border-[1.25px] border-solid inset-0 pointer-events-none rounded-[4.1943e+07px]" />
      <Icon30 />
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[29.22px] text-[#008236] text-[12px] text-nowrap top-[4.23px] whitespace-pre">의료 기관</p>
    </div>
  );
}

function Container31() {
  return (
    <div className="h-[50.449px] relative shrink-0 w-full" data-name="Container">
      <Heading7 />
      <Text25 />
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="h-[19.473px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[19.5px] left-0 text-[#57534d] text-[12px] text-nowrap top-[-1.75px] whitespace-pre">정신과 전문의 찾기 및 정신건강 정보</p>
    </div>
  );
}

function Icon31() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4_1270)" id="Icon">
          <path d={svgPaths.p2faab000} id="Vector" stroke="var(--stroke-0, #57534D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p36ca1140} id="Vector_2" stroke="var(--stroke-0, #57534D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
        <defs>
          <clipPath id="clip0_4_1270">
            <rect fill="white" height="11.9922" width="11.9922" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text26() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[80.469px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[80.469px]">
        <p className="basis-0 font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal grow leading-[16px] min-h-px min-w-px relative shrink-0 text-[#57534d] text-[12px]">평일 9시~18시</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Container">
      <Icon31 />
      <Text26 />
    </div>
  );
}

function Icon32() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p2317f580} id="Vector" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p255b9b58} id="Vector_2" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p36ba96e0} id="Vector_3" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
      </svg>
    </div>
  );
}

function Text27() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[76.23px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[76.23px]">
        <p className="basis-0 font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal grow leading-[16px] min-h-px min-w-px relative shrink-0 text-[#8200db] text-[12px]">웹사이트 방문</p>
      </div>
    </div>
  );
}

function Link12() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Link">
      <Icon32 />
      <Text27 />
    </div>
  );
}

function Container33() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[7.988px] h-[49.18px] items-start pb-0 pt-[9.238px] px-0 relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.25px_0px_0px] border-solid border-stone-200 inset-0 pointer-events-none" />
      <Container32 />
      <Link12 />
    </div>
  );
}

function Container34() {
  return (
    <div className="bg-[rgba(255,255,255,0.7)] h-[177.578px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.25px] border-solid border-stone-300 inset-0 pointer-events-none rounded-[10px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[11.992px] h-[177.578px] items-start pb-[1.25px] pt-[17.246px] px-[17.246px] relative w-full">
          <Container31 />
          <Paragraph8 />
          <Container33 />
        </div>
      </div>
    </div>
  );
}

function Heading8() {
  return (
    <div className="absolute content-stretch flex h-[20px] items-start left-0 top-0 w-[375.781px]" data-name="Heading 3">
      <p className="basis-0 font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal grow leading-[20px] min-h-px min-w-px relative shrink-0 text-[14px] text-stone-800">국립정신건강센터</p>
    </div>
  );
}

function Icon33() {
  return (
    <div className="absolute left-[9.24px] size-[15.996px] top-[5.23px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_4_1225)" id="Icon">
          <path d="M7.99805 6.66504H8.00471" id="Vector" stroke="var(--stroke-0, #008236)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M7.99805 9.33105H8.00471" id="Vector_2" stroke="var(--stroke-0, #008236)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M7.99805 3.99902H8.00471" id="Vector_3" stroke="var(--stroke-0, #008236)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M10.6641 6.66504H10.6707" id="Vector_4" stroke="var(--stroke-0, #008236)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M10.6641 9.33105H10.6707" id="Vector_5" stroke="var(--stroke-0, #008236)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M10.6641 3.99902H10.6707" id="Vector_6" stroke="var(--stroke-0, #008236)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M5.33203 6.66504H5.3387" id="Vector_7" stroke="var(--stroke-0, #008236)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M5.33203 9.33105H5.3387" id="Vector_8" stroke="var(--stroke-0, #008236)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d="M5.33203 3.99902H5.3387" id="Vector_9" stroke="var(--stroke-0, #008236)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d={svgPaths.p5103b00} id="Vector_10" stroke="var(--stroke-0, #008236)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          <path d={svgPaths.p3eb68a00} id="Vector_11" stroke="var(--stroke-0, #008236)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
        </g>
        <defs>
          <clipPath id="clip0_4_1225">
            <rect fill="white" height="15.9961" width="15.9961" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text28() {
  return (
    <div className="absolute bg-green-100 h-[26.465px] left-0 rounded-[4.1943e+07px] top-[23.98px] w-[90.684px]" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#7bf1a8] border-[1.25px] border-solid inset-0 pointer-events-none rounded-[4.1943e+07px]" />
      <Icon33 />
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[29.22px] text-[#008236] text-[12px] text-nowrap top-[4.23px] whitespace-pre">의료 기관</p>
    </div>
  );
}

function Container35() {
  return (
    <div className="h-[50.449px] relative shrink-0 w-full" data-name="Container">
      <Heading8 />
      <Text28 />
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="h-[19.473px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[19.5px] left-0 text-[#57534d] text-[12px] text-nowrap top-[-1.75px] whitespace-pre">정신건강 전문 진료 및 치료 서비스</p>
    </div>
  );
}

function Icon34() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4_1246)" id="Icon">
          <path d={svgPaths.p3f4af900} id="Vector" stroke="var(--stroke-0, #1447E6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
        <defs>
          <clipPath id="clip0_4_1246">
            <rect fill="white" height="11.9922" width="11.9922" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text29() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[75.938px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[75.938px]">
        <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#1447e6] text-[12px] text-nowrap whitespace-pre">02-2204-0001</p>
      </div>
    </div>
  );
}

function Link13() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Link">
      <Icon34 />
      <Text29 />
    </div>
  );
}

function Icon35() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_4_1270)" id="Icon">
          <path d={svgPaths.p2faab000} id="Vector" stroke="var(--stroke-0, #57534D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p36ca1140} id="Vector_2" stroke="var(--stroke-0, #57534D)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
        <defs>
          <clipPath id="clip0_4_1270">
            <rect fill="white" height="11.9922" width="11.9922" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text30() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[80.469px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[80.469px]">
        <p className="basis-0 font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal grow leading-[16px] min-h-px min-w-px relative shrink-0 text-[#57534d] text-[12px]">평일 9시~18시</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Container">
      <Icon35 />
      <Text30 />
    </div>
  );
}

function Icon36() {
  return (
    <div className="relative shrink-0 size-[11.992px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p2317f580} id="Vector" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p255b9b58} id="Vector_2" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
          <path d={svgPaths.p36ba96e0} id="Vector_3" stroke="var(--stroke-0, #8200DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999349" />
        </g>
      </svg>
    </div>
  );
}

function Text31() {
  return (
    <div className="h-[15.977px] relative shrink-0 w-[76.23px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[15.977px] items-start relative w-[76.23px]">
        <p className="basis-0 font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal grow leading-[16px] min-h-px min-w-px relative shrink-0 text-[#8200db] text-[12px]">웹사이트 방문</p>
      </div>
    </div>
  );
}

function Link14() {
  return (
    <div className="content-stretch flex gap-[7.988px] h-[15.977px] items-center relative shrink-0 w-full" data-name="Link">
      <Icon36 />
      <Text31 />
    </div>
  );
}

function Container37() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[7.988px] h-[73.145px] items-start pb-0 pt-[9.238px] px-0 relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.25px_0px_0px] border-solid border-stone-200 inset-0 pointer-events-none" />
      <Link13 />
      <Container36 />
      <Link14 />
    </div>
  );
}

function Container38() {
  return (
    <div className="bg-[rgba(255,255,255,0.7)] h-[201.543px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.25px] border-solid border-stone-300 inset-0 pointer-events-none rounded-[10px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[11.992px] h-[201.543px] items-start pb-[1.25px] pt-[17.246px] px-[17.246px] relative w-full">
          <Container35 />
          <Paragraph9 />
          <Container37 />
        </div>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex flex-col gap-[11.992px] h-[1700.29px] items-start relative shrink-0 w-full" data-name="Container">
      <Paragraph1 />
      <Container10 />
      <Container14 />
      <Container18 />
      <Container22 />
      <Container26 />
      <Container30 />
      <Container34 />
      <Container38 />
    </div>
  );
}

function Container40() {
  return (
    <div className="content-stretch flex flex-col gap-[23.984px] h-[1970.35px] items-start relative shrink-0 w-full" data-name="Container">
      <Container3 />
      <Container6 />
      <Container39 />
    </div>
  );
}

function Container41() {
  return (
    <div className="absolute box-border content-stretch flex flex-col h-[800px] items-start left-0 overflow-clip pb-0 pl-[31.992px] pr-[50.742px] pt-[31.992px] top-0 w-[493.008px]" data-name="Container">
      <Container40 />
    </div>
  );
}

function Container42() {
  return (
    <div className="absolute h-[800px] left-0 top-0 w-[493.008px]" data-name="Container">
      <Container2 />
      <Container41 />
    </div>
  );
}

function Container43() {
  return (
    <div className="absolute bg-gradient-to-b from-[#973c00] h-[800px] left-[493.01px] to-[#973c00] top-0 via-50% via-[#7b3306] w-[5.996px]" data-name="Container">
      <div className="absolute inset-0 pointer-events-none shadow-[3px_0px_6px_0px_inset_rgba(0,0,0,0.4),-3px_0px_6px_0px_inset_rgba(0,0,0,0.4)]" />
    </div>
  );
}

function Container44() {
  return (
    <div className="absolute h-[800px] left-0 opacity-30 rounded-br-[10px] rounded-tr-[10px] top-0 w-[493.008px]" data-name="Container">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-br-[10px] rounded-tr-[10px] size-full" src={imgContainer1} />
    </div>
  );
}

function Container45() {
  return (
    <div className="h-[31.992px] relative shrink-0 w-[493.008px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_1.25px] border-[rgba(190,219,255,0.3)] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[31.992px] w-[493.008px]" />
    </div>
  );
}

function Container46() {
  return (
    <div className="absolute box-border content-stretch flex flex-col h-[800px] items-start left-0 pb-0 pt-[80px] px-0 top-0 w-[493.008px]" data-name="Container">
      {[...Array(15).keys()].map((_, i) => (
        <Container45 key={i} />
      ))}
    </div>
  );
}

function Container47() {
  return <div className="absolute bg-[rgba(255,162,162,0.4)] h-[800px] left-[31.99px] top-0 w-[0.996px]" data-name="Container" />;
}

function Heading9() {
  return (
    <div className="content-stretch flex h-[20px] items-start relative shrink-0 w-full" data-name="Heading 3">
      <p className="basis-0 font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal grow leading-[20px] min-h-px min-w-px relative shrink-0 text-[#44403b] text-[14px]">도움을 요청하는 것은 용기입니다</p>
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="absolute h-[38.945px] left-0 top-0 w-[429.023px]" data-name="Paragraph">
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[19.5px] left-0 text-[#57534d] text-[12px] top-[-1.75px] w-[422px]">혼자서 감정을 감당하기 어려울 때, 전문가의 도움을 받는 것은 매우 현명한 선택입니다. 당신의 감정과 고민은 소중하며, 언제든 도움을 요청할 수 있습니다.</p>
    </div>
  );
}

function BoldText() {
  return (
    <div className="absolute content-stretch flex h-[21.25px] items-start left-0 top-[1.25px] w-[85.625px]" data-name="Bold Text">
      <p className="basis-0 font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold grow leading-[24px] min-h-px min-w-px relative shrink-0 text-[#a50036] text-[16px]">긴급한 경우</p>
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="h-[95.938px] relative shrink-0 w-full" data-name="Paragraph">
      <BoldText />
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[24px] left-0 text-[#a50036] text-[16px] top-[22.23px] w-[403px]">자살 충동이나 자해 생각이 든다면 즉시 1393(자살예방 상담전화) 또는 1577-0199(정신건강 위기상담)로 연락해주세요. 24시간 상담 가능합니다.</p>
    </div>
  );
}

function Container48() {
  return (
    <div className="absolute bg-[rgba(255,241,242,0.5)] box-border content-stretch flex flex-col h-[122.422px] items-start left-0 pb-[1.25px] pt-[13.242px] px-[13.242px] rounded-[10px] top-[54.94px] w-[429.023px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#ffccd3] border-[1.25px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Paragraph11 />
    </div>
  );
}

function BoldText1() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-0 top-[194.61px] w-[135.801px]" data-name="Bold Text">
      <p className="basis-0 font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold grow leading-[19.5px] min-h-px min-w-px relative shrink-0 text-[12px] text-stone-800">상담이 도움이 되는 경우:</p>
    </div>
  );
}

function ListItem() {
  return (
    <div className="h-[19.473px] relative shrink-0 w-full" data-name="List Item">
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[19.5px] left-0 text-[#57534d] text-[12px] text-nowrap top-[-1.75px] whitespace-pre">• 지속적인 우울감이나 불안감</p>
    </div>
  );
}

function ListItem1() {
  return (
    <div className="h-[19.473px] relative shrink-0 w-full" data-name="List Item">
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[19.5px] left-0 text-[#57534d] text-[12px] text-nowrap top-[-1.75px] whitespace-pre">• 일상생활에 지장을 주는 감정 변화</p>
    </div>
  );
}

function ListItem2() {
  return (
    <div className="h-[19.473px] relative shrink-0 w-full" data-name="List Item">
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[19.5px] left-0 text-[#57534d] text-[12px] text-nowrap top-[-1.75px] whitespace-pre">• 수면 문제나 식욕 변화</p>
    </div>
  );
}

function ListItem3() {
  return (
    <div className="h-[19.473px] relative shrink-0 w-full" data-name="List Item">
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[19.5px] left-0 text-[#57534d] text-[12px] text-nowrap top-[-1.75px] whitespace-pre">• 대인관계의 어려움</p>
    </div>
  );
}

function ListItem4() {
  return (
    <div className="h-[19.473px] relative shrink-0 w-full" data-name="List Item">
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[19.5px] left-0 text-[#57534d] text-[12px] text-nowrap top-[-1.75px] whitespace-pre">• 스트레스 관리의 어려움</p>
    </div>
  );
}

function List() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[3.984px] h-[113.301px] items-start left-[16px] top-[228.83px] w-[413.027px]" data-name="List">
      <ListItem />
      <ListItem1 />
      <ListItem2 />
      <ListItem3 />
      <ListItem4 />
    </div>
  );
}

function BoldText2() {
  return (
    <div className="absolute content-stretch flex h-[21.25px] items-start left-0 top-[1.25px] w-[101.641px]" data-name="Bold Text">
      <p className="basis-0 font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold grow leading-[24px] min-h-px min-w-px relative shrink-0 text-[#44403b] text-[16px]">개인정보 보호</p>
    </div>
  );
}

function Paragraph12() {
  return (
    <div className="h-[71.953px] relative shrink-0 w-full" data-name="Paragraph">
      <BoldText2 />
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[24px] left-0 text-[#44403b] text-[16px] top-[22.23px] w-[427px]">모든 상담은 비밀이 보장되며, 상담 기관은 전문적이고 안전한 환경을 제공합니다.</p>
    </div>
  );
}

function Container49() {
  return (
    <div className="absolute box-border content-stretch flex flex-col h-[89.199px] items-start left-0 pb-0 pt-[17.246px] px-0 top-[366.11px] w-[429.023px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.25px_0px_0px] border-solid border-stone-300 inset-0 pointer-events-none" />
      <Paragraph12 />
    </div>
  );
}

function BoldText3() {
  return (
    <div className="absolute content-stretch flex h-[15px] items-start left-[20.7px] top-0 w-[52.227px]" data-name="Bold Text">
      <p className="basis-0 font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold grow leading-[16px] min-h-px min-w-px relative shrink-0 text-[#193cb8] text-[12px]">알림 설정</p>
    </div>
  );
}

function Paragraph13() {
  return (
    <div className="h-[47.93px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arimo:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#193cb8] text-[12px] text-nowrap top-[-1px] whitespace-pre">💡</p>
      <BoldText3 />
      <p className="absolute font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#193cb8] text-[12px] top-[14.98px] w-[392px]">{`마이페이지에서 '감정 알림'을 켜두면 위험 신호가 감지될 때 알림을 받을 수 있습니다.`}</p>
    </div>
  );
}

function Container50() {
  return (
    <div className="absolute bg-[rgba(239,246,255,0.5)] box-border content-stretch flex flex-col h-[74.414px] items-start left-0 pb-[1.25px] pt-[13.242px] px-[13.242px] rounded-[10px] top-[471.31px] w-[429.023px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#bedbff] border-[1.25px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Paragraph13 />
    </div>
  );
}

function Container51() {
  return (
    <div className="h-[545.723px] relative shrink-0 w-full" data-name="Container">
      <Paragraph10 />
      <Container48 />
      <BoldText1 />
      <List />
      <Container49 />
      <Container50 />
    </div>
  );
}

function Container52() {
  return (
    <div className="content-stretch flex flex-col gap-[11.992px] h-[577.715px] items-start relative shrink-0 w-full" data-name="Container">
      <Heading9 />
      <Container51 />
    </div>
  );
}

function Container53() {
  return (
    <div className="absolute box-border content-stretch flex flex-col h-[800px] items-start left-0 overflow-clip pb-0 pt-[31.992px] px-[31.992px] top-0 w-[493.008px]" data-name="Container">
      <Container52 />
    </div>
  );
}

function Container54() {
  return (
    <div className="absolute h-[800px] left-[499px] top-0 w-[493.008px]" data-name="Container">
      <Container44 />
      <Container46 />
      <Container47 />
      <Container53 />
    </div>
  );
}

function SupportResourcesPage() {
  return (
    <div className="absolute bg-amber-50 h-[800px] left-[16px] rounded-[10px] top-[16px] w-[991.992px]" data-name="SupportResourcesPage">
      <Container42 />
      <Container43 />
      <Container54 />
      <div className="absolute inset-0 pointer-events-none shadow-[0px_2px_4px_0px_inset_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function Container55() {
  return (
    <div className="absolute left-[11.99px] rounded-tl-[4px] size-[23.984px] top-[11.99px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.25px_0px_0px_1.25px] border-[rgba(187,77,0,0.5)] border-solid inset-0 pointer-events-none rounded-tl-[4px]" />
    </div>
  );
}

function Container56() {
  return (
    <div className="absolute left-[988.01px] rounded-tr-[4px] size-[23.984px] top-[11.99px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.25px_1.25px_0px_0px] border-[rgba(187,77,0,0.5)] border-solid inset-0 pointer-events-none rounded-tr-[4px]" />
    </div>
  );
}

function Container57() {
  return (
    <div className="absolute left-[11.99px] rounded-bl-[4px] size-[23.984px] top-[796.02px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_1.25px_1.25px] border-[rgba(187,77,0,0.5)] border-solid inset-0 pointer-events-none rounded-bl-[4px]" />
    </div>
  );
}

function Container58() {
  return (
    <div className="absolute left-[988.01px] rounded-br-[4px] size-[23.984px] top-[796.02px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_1.25px_1.25px_0px] border-[rgba(187,77,0,0.5)] border-solid inset-0 pointer-events-none rounded-br-[4px]" />
    </div>
  );
}

function Container59() {
  return <div className="absolute bg-[rgba(255,255,255,0.2)] h-[80px] left-0 rounded-bl-[10px] rounded-br-[10px] top-0 w-[47.988px]" data-name="Container" />;
}

function Icon37() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <div className="absolute inset-[-10.84%_-11.67%_-16.67%_-11.67%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 26">
          <g filter="url(#filter0_dd_4_372)" id="Icon">
            <path d={svgPaths.p28d09f00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            <path d={svgPaths.p2b33ca80} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="28" id="filter0_dd_4_372" width="28" x="-1.66667" y="-0.832939">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="1" />
              <feGaussianBlur stdDeviation="1" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_4_372" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="1" />
              <feGaussianBlur stdDeviation="2" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
              <feBlend in2="effect1_dropShadow_4_372" mode="normal" result="effect2_dropShadow_4_372" />
              <feBlend in="SourceGraphic" in2="effect2_dropShadow_4_372" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Container60() {
  return (
    <div className="absolute box-border content-stretch flex h-[31.992px] items-start justify-center left-0 pb-0 pl-0 pr-[0.02px] pt-[11.992px] top-0 w-[47.988px]" data-name="Container">
      <Icon37 />
    </div>
  );
}

function Container61() {
  return (
    <div className="absolute bg-gradient-to-b from-[#ff637e] h-[80px] left-0 rounded-bl-[10px] rounded-br-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] to-[#ec003f] top-[-8px] via-50% via-[#ff2056] w-[47.988px]" data-name="Container">
      <Container59 />
      <Container60 />
    </div>
  );
}

function Container62() {
  return <div className="absolute bg-[rgba(199,0,54,0.5)] blur filter h-[7.988px] left-[7.99px] rounded-[4.1943e+07px] top-[72.01px] w-[31.992px]" data-name="Container" />;
}

function Button5() {
  return (
    <div className="absolute h-[80px] left-0 top-0 w-[47.988px]" data-name="Button">
      <Container61 />
      <Container62 />
    </div>
  );
}

function Container63() {
  return <div className="absolute bg-[rgba(255,255,255,0.2)] h-[80px] left-0 rounded-bl-[10px] rounded-br-[10px] top-0 w-[47.988px]" data-name="Container" />;
}

function Icon38() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <div className="absolute inset-[-6.67%_-11.67%_-16.67%_-11.67%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
          <g filter="url(#filter0_dd_4_383)" id="Icon">
            <path d={svgPaths.p9534100} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            <path d="M17.3333 15.5V8.83333" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            <path d="M13.1667 15.5V5.5" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            <path d="M9 15.5V13" id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="28" id="filter0_dd_4_383" width="28" x="-1.66667" y="-1.66667">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="1" />
              <feGaussianBlur stdDeviation="1" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_4_383" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="1" />
              <feGaussianBlur stdDeviation="2" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
              <feBlend in2="effect1_dropShadow_4_383" mode="normal" result="effect2_dropShadow_4_383" />
              <feBlend in="SourceGraphic" in2="effect2_dropShadow_4_383" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Container64() {
  return (
    <div className="absolute box-border content-stretch flex h-[31.992px] items-start justify-center left-0 pb-0 pl-0 pr-[0.02px] pt-[11.992px] top-0 w-[47.988px]" data-name="Container">
      <Icon38 />
    </div>
  );
}

function Container65() {
  return (
    <div className="absolute bg-gradient-to-b from-[#c27aff] h-[80px] left-0 rounded-bl-[10px] rounded-br-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] to-[#9810fa] top-[-8px] via-50% via-[#ad46ff] w-[47.988px]" data-name="Container">
      <Container63 />
      <Container64 />
    </div>
  );
}

function Container66() {
  return <div className="absolute bg-[rgba(130,0,219,0.5)] blur filter h-[7.988px] left-[7.99px] rounded-[4.1943e+07px] top-[72.01px] w-[31.992px]" data-name="Container" />;
}

function Button6() {
  return (
    <div className="absolute h-[80px] left-[51.97px] top-0 w-[47.988px]" data-name="Button">
      <Container65 />
      <Container66 />
    </div>
  );
}

function Container67() {
  return <div className="absolute bg-[rgba(255,255,255,0.2)] h-[80px] left-0 rounded-bl-[10px] rounded-br-[10px] top-0 w-[47.988px]" data-name="Container" />;
}

function Icon39() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <div className="absolute inset-[-6.67%_-11.67%_-16.67%_-11.67%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
          <g filter="url(#filter0_dd_4_379)" id="Icon">
            <path d={svgPaths.p2b24c280} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            <path d={svgPaths.pc2576f0} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="28" id="filter0_dd_4_379" width="28" x="-1.66667" y="-1.66667">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="1" />
              <feGaussianBlur stdDeviation="1" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_4_379" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="1" />
              <feGaussianBlur stdDeviation="2" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
              <feBlend in2="effect1_dropShadow_4_379" mode="normal" result="effect2_dropShadow_4_379" />
              <feBlend in="SourceGraphic" in2="effect2_dropShadow_4_379" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Container68() {
  return (
    <div className="absolute box-border content-stretch flex h-[31.992px] items-start justify-center left-0 pb-0 pl-0 pr-[0.02px] pt-[11.992px] top-0 w-[47.988px]" data-name="Container">
      <Icon39 />
    </div>
  );
}

function Container69() {
  return (
    <div className="absolute bg-gradient-to-b from-[#00d5be] h-[80px] left-0 rounded-bl-[10px] rounded-br-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] to-[#009689] top-[-8px] via-50% via-[#00bba7] w-[47.988px]" data-name="Container">
      <Container67 />
      <Container68 />
    </div>
  );
}

function Container70() {
  return <div className="absolute bg-[rgba(0,120,111,0.5)] blur filter h-[7.988px] left-[7.99px] rounded-[4.1943e+07px] top-[72.01px] w-[31.992px]" data-name="Container" />;
}

function Button7() {
  return (
    <div className="absolute h-[80px] left-[103.95px] top-0 w-[47.988px]" data-name="Button">
      <Container69 />
      <Container70 />
    </div>
  );
}

function Container71() {
  return <div className="absolute bg-[rgba(255,255,255,0.2)] h-[80px] left-0 rounded-bl-[10px] rounded-br-[10px] top-0 w-[47.988px]" data-name="Container" />;
}

function Icon40() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <div className="absolute inset-[-6.67%_-3.33%_-16.67%_-3.33%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 25">
          <g filter="url(#filter0_dd_4_368)" id="Icon">
            <path d={svgPaths.p199ea480} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            <path d={svgPaths.p24713580} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="28" id="filter0_dd_4_368" width="28" x="-3.33333" y="-1.66667">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="1" />
              <feGaussianBlur stdDeviation="1" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_4_368" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="1" />
              <feGaussianBlur stdDeviation="2" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
              <feBlend in2="effect1_dropShadow_4_368" mode="normal" result="effect2_dropShadow_4_368" />
              <feBlend in="SourceGraphic" in2="effect2_dropShadow_4_368" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Container72() {
  return (
    <div className="absolute box-border content-stretch flex h-[31.992px] items-start justify-center left-0 pb-0 pl-0 pr-[0.02px] pt-[11.992px] top-0 w-[47.988px]" data-name="Container">
      <Icon40 />
    </div>
  );
}

function Container73() {
  return (
    <div className="absolute bg-gradient-to-b from-[#51a2ff] h-[80px] left-0 rounded-bl-[10px] rounded-br-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] to-[#155dfc] top-[-8px] via-50% via-[#2b7fff] w-[47.988px]" data-name="Container">
      <Container71 />
      <Container72 />
    </div>
  );
}

function Container74() {
  return <div className="absolute bg-[rgba(20,71,230,0.5)] blur filter h-[7.988px] left-[7.99px] rounded-[4.1943e+07px] top-[72.01px] w-[31.992px]" data-name="Container" />;
}

function Button8() {
  return (
    <div className="absolute h-[80px] left-[155.92px] top-0 w-[47.988px]" data-name="Button">
      <Container73 />
      <Container74 />
    </div>
  );
}

function Container75() {
  return <div className="absolute bg-[rgba(255,255,255,0.2)] h-[80px] left-0 rounded-bl-[10px] rounded-br-[10px] top-0 w-[47.988px]" data-name="Container" />;
}

function Icon41() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <div className="absolute inset-[-6.67%_-11.67%_-16.67%_-11.67%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
          <g filter="url(#filter0_dd_4_349)" id="Icon">
            <path d={svgPaths.pfd0d080} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            <path d="M19.8333 11.3333H9.83333" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            <path d={svgPaths.pcd100} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="28" id="filter0_dd_4_349" width="28" x="-1.66667" y="-1.66667">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="1" />
              <feGaussianBlur stdDeviation="1" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_4_349" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="1" />
              <feGaussianBlur stdDeviation="2" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
              <feBlend in2="effect1_dropShadow_4_349" mode="normal" result="effect2_dropShadow_4_349" />
              <feBlend in="SourceGraphic" in2="effect2_dropShadow_4_349" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Container76() {
  return (
    <div className="absolute box-border content-stretch flex h-[31.992px] items-start justify-center left-0 pb-0 pl-0 pr-[0.02px] pt-[11.992px] top-0 w-[47.988px]" data-name="Container">
      <Icon41 />
    </div>
  );
}

function Container77() {
  return (
    <div className="absolute bg-gradient-to-b from-[#ffb900] h-[80px] left-0 rounded-bl-[10px] rounded-br-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] to-[#e17100] top-[-8px] via-50% via-[#fe9a00] w-[47.988px]" data-name="Container">
      <Container75 />
      <Container76 />
    </div>
  );
}

function Container78() {
  return <div className="absolute bg-[rgba(187,77,0,0.5)] blur filter h-[7.988px] left-[7.99px] rounded-[4.1943e+07px] top-[72.01px] w-[31.992px]" data-name="Container" />;
}

function Button9() {
  return (
    <div className="absolute h-[80px] left-[207.89px] top-0 w-[47.988px]" data-name="Button">
      <Container77 />
      <Container78 />
    </div>
  );
}

function Bookmarks() {
  return (
    <div className="absolute h-[80px] left-[720.12px] top-0 w-[255.879px]" data-name="Bookmarks">
      <Button5 />
      <Button6 />
      <Button7 />
      <Button8 />
      <Button9 />
    </div>
  );
}

function Container79() {
  return (
    <div className="absolute h-[831.992px] left-0 rounded-[16px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] top-0 w-[1023.98px]" data-name="Container">
      <Container1 />
      <SupportResourcesPage />
      <Container55 />
      <Container56 />
      <Container57 />
      <Container58 />
      <Bookmarks />
    </div>
  );
}

function DiaryBook() {
  return (
    <div className="h-[831.992px] relative shrink-0 w-full" data-name="DiaryBook">
      <Container />
      <Container79 />
    </div>
  );
}

function App() {
  return (
    <div className="absolute box-border content-stretch flex flex-col h-[1090px] items-start left-0 overflow-clip pb-0 pt-[129.004px] px-[503.633px] top-0 w-[2031.25px]" data-name="App">
      <DiaryBook />
    </div>
  );
}

function Container80() {
  return <div className="absolute bg-gradient-to-b from-[rgba(123,51,6,0.2)] h-[1090px] left-0 to-[rgba(28,25,23,0.4)] top-0 w-[2031.25px]" data-name="Container" />;
}

function App1() {
  return (
    <div className="absolute h-[1090px] left-0 top-0 w-[2031.25px]" data-name="App">
      <Container80 />
    </div>
  );
}

function Text32() {
  return (
    <div className="absolute content-stretch flex h-[16.484px] items-start left-0 top-[-20000px] w-[6.074px]" data-name="Text">
      <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[16.5px] relative shrink-0 text-[11px] text-neutral-950 text-nowrap whitespace-pre">0</p>
    </div>
  );
}

export default function Component() {
  return (
    <div className="bg-white relative size-full" data-name="도움말/리소스 화면">
      <App />
      <App1 />
      <Text32 />
    </div>
  );
}