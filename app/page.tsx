import { getWordStatsServer } from "@/lib/words-server";
import HomeClient from "@/components/home/HomeClient";

export default function Home() {
  // 서버 컴포넌트에서 초기 데이터(말씀 통계)를 로드
  // JSON 파일 임포트가 포함된 lib/words-server.ts는 여기서 안전하게 호출 가능
  const stats = getWordStatsServer();

  return <HomeClient stats={stats} />;
}
