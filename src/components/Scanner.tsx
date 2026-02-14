"use client";

import { useEffect, useRef } from "react";
import Quagga from "@ericblade/quagga2";

// Quaggaのレスポンス用の型定義
interface QuaggaResult {
  codeResult: {
    code: string | null;
    format: string;
  };
}

interface ScannerProps {
  onDetected: (code: string) => void;
}

export default function Scanner({ onDetected }: ScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scannerRef.current || scannerRef.current.offsetWidth === 0) {
      return;
    }

    const initQuagga = async () => {
      try {
        await Quagga.init(
          {
            inputStream: {
              type: "LiveStream",
              constraints: {
                facingMode: "environment",
                aspectRatio: { min: 1, max: 2 },
              },
              target: scannerRef.current!,
            },
            decoder: {
              readers: ["ean_reader"],
            },
            locate: true,
          },
          (err) => {
            if (err) {
              console.error("Quagga init error:", err);
              return;
            }
            Quagga.start();
          },
        );

        Quagga.onDetected(handleDetected);
      } catch (e) {
        console.error("Scanner setup failed:", e);
      }
    };

    // data の型を any から QuaggaResult に変更
    const handleDetected = (data: QuaggaResult) => {
      if (data.codeResult.code) {
        onDetected(data.codeResult.code);
      }
    };

    const timer = setTimeout(() => {
      initQuagga();
    }, 300);

    return () => {
      clearTimeout(timer);
      Quagga.offDetected(handleDetected);
      Quagga.stop();
    };
  }, [onDetected]);

  return (
    <div
      ref={scannerRef}
      // style={{ minHeight: "200px" }} を Tailwind の min-h-[200px] に変更
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden min-h-[200px]"
    >
      {/* 読み取りガイド */}
      <div className="absolute inset-0 border-2 border-orange-500/50 pointer-events-none m-8 sm:m-12">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
      </div>
    </div>
  );
}
