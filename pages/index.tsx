import { useEffect } from "react";
import { useRouter } from "next/router";

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirige automáticamente a /inicio
    router.replace("/inicio");
  }, [router]);

  return null; // No muestra nada, solo redirige
}
