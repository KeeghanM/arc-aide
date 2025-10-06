import { useEffect, useState } from 'react'

export function useTranscription() {
  const [isRecording, setIsRecording] = useState(false)
  // eslint-disable-next-line no-undef -- it's a global
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)

  // Initialise recognition only on the client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = true
        recognitionInstance.lang = 'en-GB'
        recognitionInstance.interimResults = true
        recognitionInstance.maxAlternatives = 1

        setRecognition(recognitionInstance)
      }
    }
  }, [])

  const startRecording = () => {
    if (recognition) {
      recognition.start()
      setIsRecording(true)
    }
  }

  const stopRecording = () => {
    if (recognition) {
      recognition.stop()
      setIsRecording(false)
    }
  }

  // eslint-disable-next-line no-undef -- it's a global
  const setOnResult = (callback: (event: SpeechRecognitionEvent) => void) => {
    if (recognition) {
      recognition.onresult = callback
    }
  }

  return {
    isRecording,
    startRecording,
    stopRecording,
    setOnResult,
    isSupported: recognition !== null,
  }
}
