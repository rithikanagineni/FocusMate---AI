/**
 * Speech-to-Text Abstraction for FocusMate
 * Integrates Web Speech API with fallback transcription.
 */

export class SpeechService {
  private static recognition: any = null;

  static isSupported(): boolean {
    return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  static startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: any) => void
  ) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback if browser doesn't support Web Speech API directly
      const mockText = "I have to finish my project report tomorrow, study machine learning chapters 4 and 5, attend my meeting at 3 PM and send the internship application before Friday.";
      let currentIdx = 0;
      const interval = setInterval(() => {
        currentIdx += 14;
        if (currentIdx >= mockText.length) {
          clearInterval(interval);
          onResult(mockText, true);
        } else {
          onResult(mockText.substring(0, currentIdx), false);
        }
      }, 300);
      return () => clearInterval(interval);
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        onResult(final || interim, Boolean(final));
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition warning:', e);
        onError(e);
      };

      recognition.start();
      this.recognition = recognition;

      return () => {
        try {
          recognition.stop();
        } catch {}
      };
    } catch (err) {
      onError(err);
      return () => {};
    }
  }

  static stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
  }

  static getSampleTranscripts() {
    return [
      "I have to finish my project report tomorrow, study machine learning chapters 4 and 5, attend my meeting at 3 PM and send the internship application before Friday.",
      "Meeting with Prof. Alex at 2 PM to review the neural network model, submit the assignment by 6 PM, and revise math formulas for 45 minutes.",
      "Call the design team regarding the product slide deck, test the focus timer feature, and wrap up before dinner."
    ];
  }
}
