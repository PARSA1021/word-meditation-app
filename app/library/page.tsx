// app/library/page.tsx
import { getAllWordsServer} from"@/features/meditation/services/word.service";
import { generateTOC, serializeTOC} from"@/features/meditation/services/toc.service";
import LibraryMain from "@/features/meditation/components/LibraryMain";

export const metadata = {
 title:"말씀 도서관 | Word Meditation",
 description:"계층별 목차를 통해 성현의 말씀을 탐색하세요.",
};

import { Suspense} from"react";

export default async function LibraryPage() {
 // 1. 서버 사이드에서 모든 데이터 로드
 const allWords = getAllWordsServer();

 // 2. TOC 생성 (O(n) 성능)
 const tocTree = generateTOC(allWords);
 
 // 3. 클라이언트 컴포넌트로 전달을 위해 직렬화 (말씀 데이터 제외하여 페이로드 축소)
 const serializedTOC = serializeTOC(tocTree, false);

 return (
 <div className="min-h-screen bg-slate-50">
 <Suspense fallback={
 <div className="h-screen flex items-center justify-center">
 <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
 </div>
}>
 <LibraryMain toc={serializedTOC} />
 </Suspense>
 </div>
 );
}
