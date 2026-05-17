"use client";
import { useState, useRef } from "react";

interface Props {
  onTranscript: (text: string) => void;
}

export default function VoiceButton({ onTranscript }: Props) {
  const [listening, setListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const toggle = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      onTranscript(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  return (
    <button
      onClick={toggle}
      title={listening ? "Stop listening" : "Speak"}
      className={`p-2 rounded-full transition-colors ${listening ? "bg-red-100 text-red-600 animate-pulse" : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700"}`}
    >
      {listening ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><rect x="5" y="5" width="10" height="10" rx="1"/></svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a3 3 0 003-3V5a3 3 0 00-6 0v4a3 3 0 003 3zm5-3a5 5 0 01-10 0H3a7 7 0 0014 0h-2z"/></svg>
      )}
    </button>
  );
}
