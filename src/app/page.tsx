import { getWordStatsServer } from "@/features/meditation/services/word.service";
import HomeClient from "@/features/meditation/components/HomeClient";

export default async function Home() {
  // 서버 컴포넌트에서 초기 데이터(말씀 통계)를 로드
  // DB 연동으로 변경됨
  const stats = await getWordStatsServer();

  return <HomeClient stats={stats} />;
}
