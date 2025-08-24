import MainPage from "@/components/MainPage";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MainPage />
    </Suspense>
  );
}
