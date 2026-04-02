import svgPaths from "./svg-l8nmvjat1c";

function Heading() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Heading 2">
      <div className="flex flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#181828] text-[15px] w-full">
        <p className="css-4hzbpn leading-[20px]">Add Post</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="content-stretch flex items-start p-[10px] relative w-full">
        <Heading />
      </div>
    </div>
  );
}

function Svg() {
  return (
    <div className="absolute left-[-4px] size-[20px] top-0" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="SVG">
          <path d={svgPaths.p15de5300} fill="var(--fill-0, #1D384A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Margin() {
  return (
    <div className="h-[20px] relative shrink-0 w-[24px]" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Svg />
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex items-center justify-center min-w-[64px] px-[16px] py-[5px] relative rounded-[12px] shrink-0 z-[2]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(29,56,74,0.5)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Margin />
      <div className="css-g0mm18 flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#1d384a] text-[12px] text-center tracking-[0.343px] uppercase">
        <p className="css-ew64yg leading-[20px]">Find Template</p>
      </div>
    </div>
  );
}

function Svg1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p3fd9e500} fill="var(--fill-0, black)" fillOpacity="0.54" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonClose() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[20px] shrink-0 z-[1]" data-name="Button - Close">
      <Svg1 />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex isolate items-center relative shrink-0" data-name="Container">
      <Button />
      <ButtonClose />
    </div>
  );
}

function Container() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex items-start p-[10px] relative w-full">
        <Container1 />
        <Container2 />
      </div>
    </div>
  );
}

function Input() {
  return <div className="flex-[1_0_0] h-[53.13px] min-h-px min-w-px" data-name="Input" />;
}

function Fieldset() {
  return (
    <div className="absolute inset-[-5px_0_0_0] overflow-clip rounded-[12px]" data-name="Fieldset">
      <div className="absolute border border-[rgba(0,0,0,0.23)] border-solid inset-[5px_0_0_0] rounded-[12px]" data-name="Fieldset:styles" />
    </div>
  );
}

function Container8() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center pr-[14px] relative w-full">
          <Input />
          <Fieldset />
        </div>
      </div>
    </div>
  );
}

function Label() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[14px] max-w-[1686px] overflow-clip top-[16px]" data-name="Label">
      <div className="css-g0mm18 flex flex-col font-['Source_Sans_Pro:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(0,0,0,0.6)] tracking-[0.131px]">
        <p className="css-ew64yg leading-[20.13px]">Title *</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container8 />
      <Label />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0 w-[831.2px]" data-name="Container">
      <Container7 />
    </div>
  );
}

function Combobox() {
  return <div className="flex-[1_0_0] h-[35.13px] min-h-px min-w-[39px]" data-name="Combobox" />;
}

function SvgAddFreeFormTagsToHelpQuicklyConveyTheKeyInformationAboutThePostGoodTagsAlsoHelpMakeThePostEasierToFindInSearches() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="SVG - Add free form tags to help quickly convey the key information about the post. Good tags also help make the post easier to find in searches.">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="SVG - Add free form tags to help quickly convey the key information about the post. Good tags also help make the post easier to find in searches.">
          <path d={svgPaths.p2fa4e500} fill="var(--fill-0, #1D384A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[10px] pr-[5px] relative shrink-0" data-name="Margin">
      <SvgAddFreeFormTagsToHelpQuicklyConveyTheKeyInformationAboutThePostGoodTagsAlsoHelpMakeThePostEasierToFindInSearches />
    </div>
  );
}

function Fieldset1() {
  return (
    <div className="absolute inset-[-5px_0_0_0] overflow-clip rounded-[12px]" data-name="Fieldset">
      <div className="absolute border border-[rgba(0,0,0,0.23)] border-solid inset-[5px_0_0_0] rounded-[12px]" data-name="Fieldset:styles" />
    </div>
  );
}

function Container11() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-center flex flex-wrap gap-0 items-center p-[9px] relative w-full">
          <Combobox />
          <Margin1 />
          <Fieldset1 />
        </div>
      </div>
    </div>
  );
}

function Label1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[14px] max-w-[1686px] overflow-clip top-[16px]" data-name="Label">
      <div className="css-g0mm18 flex flex-col font-['Source_Sans_Pro:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(0,0,0,0.6)] tracking-[0.131px]">
        <p className="css-ew64yg leading-[20.13px]">Tags</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container11 />
      <Label1 />
    </div>
  );
}

function Filter() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Filter">
      <Container10 />
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start min-w-[200px] relative self-stretch shrink-0 w-[364.8px]" data-name="Container">
      <Filter />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex gap-[20px] items-start relative shrink-0 w-full" data-name="Container">
      <Container6 />
      <Container9 />
    </div>
  );
}

function Label2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[20px] max-w-[1686px] overflow-clip top-[60px] z-[3]" data-name="Label">
      <div className="css-g0mm18 flex flex-col font-['Source_Sans_Pro:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(0,0,0,0.6)] tracking-[0.131px]">
        <p className="css-ew64yg leading-[20.13px]">Description</p>
      </div>
    </div>
  );
}

function Svg2() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p29c5e180} fill="var(--fill-0, black)" fillOpacity="0.26" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonUndo() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[20px] shrink-0 size-[40px]" data-name="Button - Undo">
      <Svg2 />
    </div>
  );
}

function Undo() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Undo">
      <ButtonUndo />
    </div>
  );
}

function Svg3() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p1de0a780} fill="var(--fill-0, black)" fillOpacity="0.26" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonRedo() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[20px] shrink-0 size-[40px]" data-name="Button - Redo">
      <Svg3 />
    </div>
  );
}

function Redo() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Redo">
      <ButtonRedo />
    </div>
  );
}

function Svg4() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p23a7bff0} fill="var(--fill-0, black)" fillOpacity="0.54" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonBold() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[20px] shrink-0 size-[40px]" data-name="Button - Bold">
      <Svg4 />
    </div>
  );
}

function Bold() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Bold">
      <ButtonBold />
    </div>
  );
}

function Svg5() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p2de38400} fill="var(--fill-0, black)" fillOpacity="0.54" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonItalic() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[20px] shrink-0 size-[40px]" data-name="Button - Italic">
      <Svg5 />
    </div>
  );
}

function Italic() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Italic">
      <ButtonItalic />
    </div>
  );
}

function Svg6() {
  return (
    <div className="relative shrink-0 size-[35px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 35 35">
        <g id="SVG">
          <path d={svgPaths.p9373f80} fill="var(--fill-0, black)" fillOpacity="0.54" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonHeader() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[20px] shrink-0 size-[40px]" data-name="Button - Header 1">
      <Svg6 />
    </div>
  );
}

function Header() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Header 1">
      <ButtonHeader />
    </div>
  );
}

function Svg7() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p553a780} fill="var(--fill-0, black)" fillOpacity="0.54" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonHeader1() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[20px] shrink-0 size-[40px]" data-name="Button - Header 2">
      <Svg7 />
    </div>
  );
}

function Header1() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Header 2">
      <ButtonHeader1 />
    </div>
  );
}

function Svg8() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="SVG">
          <path d={svgPaths.pfd91300} fill="var(--fill-0, black)" fillOpacity="0.54" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonHeader2() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[20px] shrink-0 size-[40px]" data-name="Button - Header 3">
      <Svg8 />
    </div>
  );
}

function Header2() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Header 3">
      <ButtonHeader2 />
    </div>
  );
}

function Svg9() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p3b953840} fill="var(--fill-0, black)" fillOpacity="0.54" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonUnorderedList() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[20px] shrink-0 size-[40px]" data-name="Button - Unordered List">
      <Svg9 />
    </div>
  );
}

function UnorderedList() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Unordered List">
      <ButtonUnorderedList />
    </div>
  );
}

function Svg10() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p28a8b100} fill="var(--fill-0, black)" fillOpacity="0.54" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonOrderedList() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[20px] shrink-0 size-[40px]" data-name="Button - Ordered List">
      <Svg10 />
    </div>
  );
}

function OrderedList() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Ordered List">
      <ButtonOrderedList />
    </div>
  );
}

function Svg11() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p2c4fb440} fill="var(--fill-0, black)" fillOpacity="0.54" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonBlockquote() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[20px] shrink-0 size-[40px]" data-name="Button - Blockquote">
      <Svg11 />
    </div>
  );
}

function Blockquote() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Blockquote">
      <ButtonBlockquote />
    </div>
  );
}

function Svg12() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p3b6396c0} fill="var(--fill-0, black)" fillOpacity="0.54" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonCode() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[20px] shrink-0 size-[40px]" data-name="Button - Code">
      <Svg12 />
    </div>
  );
}

function Code() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Code">
      <ButtonCode />
    </div>
  );
}

function Svg13() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path clipRule="evenodd" d="M4 11H20V13H4V11Z" fill="var(--fill-0, black)" fillOpacity="0.54" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonInsertHorizontalLine() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[20px] shrink-0 size-[40px]" data-name="Button - Insert horizontal line">
      <Svg13 />
    </div>
  );
}

function InsertHorizontalLine() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Insert horizontal line">
      <ButtonInsertHorizontalLine />
    </div>
  );
}

function Svg14() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p2cffb5c0} fill="var(--fill-0, black)" fillOpacity="0.54" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonInsertTable() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[20px] shrink-0" data-name="Button - Insert Table">
      <Svg14 />
    </div>
  );
}

function InsertTable() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Insert Table">
      <ButtonInsertTable />
    </div>
  );
}

function Svg15() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p595600} fill="var(--fill-0, black)" fillOpacity="0.54" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonLink() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[20px] shrink-0" data-name="Button - Link">
      <Svg15 />
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Link">
      <ButtonLink />
    </div>
  );
}

function Svg16() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p3c2fbe00} fill="var(--fill-0, black)" fillOpacity="0.54" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonVisuals() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[20px] shrink-0" data-name="Button - Visuals">
      <Svg16 />
    </div>
  );
}

function Visuals() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Visuals">
      <ButtonVisuals />
    </div>
  );
}

function Svg17() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p201a2780} fill="var(--fill-0, black)" fillOpacity="0.54" id="Vector" />
          <path d={svgPaths.p4d32800} fill="var(--fill-0, black)" fillOpacity="0.54" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function ButtonEmbedVideoOrOtherMedia() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[20px] shrink-0" data-name="Button - Embed Video or other Media">
      <Svg17 />
    </div>
  );
}

function EmbedVideoOrOtherMedia() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Embed Video or other Media">
      <ButtonEmbedVideoOrOtherMedia />
    </div>
  );
}

function Svg18() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p3a464800} fill="var(--fill-0, black)" fillOpacity="0.54" id="Vector" />
          <path d={svgPaths.p325b55a0} fill="var(--fill-0, black)" fillOpacity="0.54" id="Vector_2" />
          <path d={svgPaths.p7e32e30} fill="var(--fill-0, black)" fillOpacity="0.54" id="Vector_3" />
          <path d={svgPaths.p671c370} fill="var(--fill-0, black)" fillOpacity="0.54" id="Vector_4" />
        </g>
      </svg>
    </div>
  );
}

function ButtonEmoticons() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[20px] shrink-0" data-name="Button - Emoticons">
      <Svg18 />
    </div>
  );
}

function Emoticons() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Emoticons">
      <ButtonEmoticons />
    </div>
  );
}

function Tablist() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Tablist">
      <Undo />
      <Redo />
      <Bold />
      <Italic />
      <Header />
      <Header1 />
      <Header2 />
      <UnorderedList />
      <OrderedList />
      <Blockquote />
      <Code />
      <InsertHorizontalLine />
      <InsertTable />
      <Link />
      <Visuals />
      <EmbedVideoOrOtherMedia />
      <Emoticons />
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-x-auto overflow-y-clip relative self-stretch" data-name="Container">
      <Tablist />
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex items-start justify-center overflow-clip relative shrink-0 w-full" data-name="Container">
      <Container18 />
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative self-stretch" data-name="Container">
      <Container17 />
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-full" data-name="Container">
      <Container16 />
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px pb-[80px] relative" data-name="Container">
      <Container15 />
    </div>
  );
}

function Fieldset2() {
  return (
    <div className="absolute inset-[-5px_0_0_0] overflow-clip rounded-[12px]" data-name="Fieldset">
      <div className="absolute border border-[rgba(0,0,0,0.23)] border-solid inset-[5px_0_0_0] rounded-[12px]" data-name="Fieldset:styles" />
    </div>
  );
}

function Container13() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full z-[2]" data-name="Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center p-[10px] relative w-full">
          <Container14 />
          <Fieldset2 />
        </div>
      </div>
    </div>
  );
}

function Container19() {
  return <div className="h-[20px] shrink-0 w-full z-[1]" data-name="Container" />;
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col isolate items-start relative shrink-0 w-full" data-name="Container">
      <Label2 />
      <Container13 />
      <Container19 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Heading 2">
      <div className="flex flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#181828] text-[15px] w-full">
        <p className="css-4hzbpn leading-[20px]">Additional Content</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-start min-h-px min-w-px relative self-stretch" data-name="Container">
      <Heading1 />
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-wrap items-start min-h-px min-w-px relative" data-name="Container">
      <Container22 />
    </div>
  );
}

function Svg19() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p38a27780} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#1d384a] content-stretch flex items-center justify-center relative rounded-[20px] shrink-0 size-[40px]" data-name="Background">
      <Svg19 />
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="css-g0mm18 flex flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1d384a] text-[12px] text-center tracking-[0.4px]">
        <p className="css-ew64yg leading-[20px]">None</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center min-w-[64px] px-[15px] py-[5px] relative rounded-[12px] shrink-0" data-name="Button">
      <Background />
      <Container25 />
    </div>
  );
}

function NoAdditionalContent() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="No additional content">
      <Button1 />
    </div>
  );
}

function Svg20() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p2d4b5d40} fill="var(--fill-0, #1D384A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Border() {
  return (
    <div className="content-stretch flex items-center justify-center p-px relative rounded-[20px] shrink-0 size-[40px]" data-name="Border">
      <div aria-hidden="true" className="absolute border border-[#d3d3d3] border-solid inset-0 pointer-events-none rounded-[20px]" />
      <Svg20 />
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="css-g0mm18 flex flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1d384a] text-[12px] text-center tracking-[0.4px]">
        <p className="css-ew64yg leading-[20px]">Whiteboard</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center min-w-[64px] px-[15px] py-[5px] relative rounded-[12px] shrink-0" data-name="Button">
      <Border />
      <Container26 />
    </div>
  );
}

function AddAWhiteboardToThisPost() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Add a whiteboard to this post">
      <Button2 />
    </div>
  );
}

function Svg21() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p21e21000} fill="var(--fill-0, #1D384A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Border1() {
  return (
    <div className="content-stretch flex items-center justify-center p-px relative rounded-[20px] shrink-0 size-[40px]" data-name="Border">
      <div aria-hidden="true" className="absolute border border-[#d3d3d3] border-solid inset-0 pointer-events-none rounded-[20px]" />
      <Svg21 />
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="css-g0mm18 flex flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1d384a] text-[12px] text-center tracking-[0.4px]">
        <p className="css-ew64yg leading-[20px]">Memo</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center min-w-[64px] px-[15px] py-[5px] relative rounded-[12px] shrink-0" data-name="Button">
      <Border1 />
      <Container27 />
    </div>
  );
}

function AddACollaborativeDocumentToThisPost() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Add a collaborative document to this post">
      <Button3 />
    </div>
  );
}

function Svg22() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p3b2b4480} fill="var(--fill-0, #1D384A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Border2() {
  return (
    <div className="content-stretch flex items-center justify-center p-px relative rounded-[20px] shrink-0 size-[40px]" data-name="Border">
      <div aria-hidden="true" className="absolute border border-[#d3d3d3] border-solid inset-0 pointer-events-none rounded-[20px]" />
      <Svg22 />
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="css-g0mm18 flex flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1d384a] text-[12px] text-center tracking-[0.4px]">
        <p className="css-ew64yg leading-[20px]">Call To Action</p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center min-w-[64px] px-[15px] py-[5px] relative rounded-[12px] shrink-0" data-name="Button">
      <Border2 />
      <Container28 />
    </div>
  );
}

function AddACallToActionToThisPost() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Add a call to action to this post">
      <Button4 />
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-wrap gap-[0px_20px] items-start relative shrink-0" data-name="Container">
      <NoAdditionalContent />
      <AddAWhiteboardToThisPost />
      <AddACollaborativeDocumentToThisPost />
      <AddACallToActionToThisPost />
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex h-[20px] items-center justify-end relative shrink-0" data-name="Container">
      <Container24 />
    </div>
  );
}

function Container20() {
  return (
    <div className="relative shrink-0 w-[1176px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-center relative w-full">
        <Container21 />
        <Container23 />
      </div>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="absolute bg-white left-0 right-0 rounded-[12px] top-[-20px]" data-name="Background+Border">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[20px] relative rounded-[inherit] w-full">
        <Container20 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#d3d3d3] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Margin2() {
  return (
    <div className="h-[40px] relative shrink-0 w-full" data-name="Margin">
      <BackgroundBorder />
    </div>
  );
}

function Svg23() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p21cef280} fill="var(--fill-0, #1D384A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonAddReference() {
  return (
    <div className="content-stretch flex items-center justify-center p-[8px] relative rounded-[20px] shrink-0 z-[2]" data-name="Button - Add Reference">
      <Svg23 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 z-[1]" data-name="Heading 3">
      <div className="css-g0mm18 flex flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#181828] text-[12px] tracking-[0.088px]">
        <p className="css-ew64yg leading-[20px]">Add Reference</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex isolate items-center relative shrink-0 w-full" data-name="Container">
      <ButtonAddReference />
      <Heading2 />
    </div>
  );
}

function Separator() {
  return (
    <div className="h-px relative shrink-0 w-full" data-name="Separator">
      <div aria-hidden="true" className="absolute border-[#d3d3d3] border-b border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function SeparatorMargin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[137.05px] pl-[10px] right-[40px] top-[19.5px]" data-name="Separator:margin">
      <Separator />
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-name="Heading 2">
      <div className="css-g0mm18 flex flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#181828] text-[15px]">
        <p className="css-ew64yg leading-[20px]">Response Options</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex items-start relative self-stretch shrink-0" data-name="Container">
      <Heading3 />
    </div>
  );
}

function Container31() {
  return (
    <div className="absolute content-stretch flex flex-wrap items-start left-0 top-1/2 translate-y-[-50%]" data-name="Container">
      <Container32 />
    </div>
  );
}

function Svg24() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.pbe35b00} fill="var(--fill-0, black)" fillOpacity="0.54" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonExpand() {
  return (
    <div className="absolute content-stretch flex items-center justify-center p-[8px] right-0 rounded-[20px] top-1/2 translate-y-[-50%]" data-name="Button - Expand">
      <Svg24 />
    </div>
  );
}

function Container30() {
  return (
    <div className="h-[40px] relative shrink-0 w-full" data-name="Container">
      <SeparatorMargin />
      <Container31 />
      <ButtonExpand />
    </div>
  );
}

function Container4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[20px] items-start p-[20px] relative w-full">
        <Container5 />
        <Container12 />
        <Margin2 />
        <Container29 />
        <Container30 />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="overflow-auto size-full">
        <div className="content-stretch flex flex-col items-start p-[20px] relative w-full">
          <Container4 />
        </div>
      </div>
    </div>
  );
}

function Button5() {
  return (
    <div className="content-stretch flex items-center justify-center min-w-[64px] px-[15px] py-[5px] relative rounded-[12px] shrink-0" data-name="Button">
      <div className="css-g0mm18 flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.26)] text-center tracking-[0.343px] uppercase">
        <p className="css-ew64yg leading-[20px]">Save as draft</p>
      </div>
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-[rgba(0,0,0,0.12)] content-stretch flex items-center justify-center min-w-[64px] px-[15px] py-[5px] relative rounded-[12px] shrink-0" data-name="Button">
      <div className="css-g0mm18 flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.26)] text-center tracking-[0.343px] uppercase">
        <p className="css-ew64yg leading-[20px]">Post</p>
      </div>
    </div>
  );
}

function PleaseMakeSureAllTitlesAreFilledIn() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Please make sure all titles are filled in.">
      <Button5 />
      <Button6 />
    </div>
  );
}

function Container33() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center justify-end size-full">
        <div className="content-stretch flex items-center justify-end p-[20px] relative w-full">
          <PleaseMakeSureAllTitlesAreFilledIn />
        </div>
      </div>
    </div>
  );
}

export default function Dialog() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start overflow-clip relative rounded-[12px] shadow-[0px_11px_15px_-7px_rgba(0,0,0,0.2),0px_24px_38px_3px_rgba(0,0,0,0.14),0px_9px_46px_8px_rgba(0,0,0,0.12)] size-full" data-name="Dialog">
      <Container />
      <Container3 />
      <Container33 />
    </div>
  );
}