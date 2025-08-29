'use client'

import { useState, useRef } from 'react'
import { Mic, MicOff, Square, Play, Pause, Upload, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface AudioRecorderProps {
  leadId: string
  onTranscriptionComplete?: (transcription: string, analysis: any) => void
}

export function AudioRecorder({ leadId, onTranscriptionComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        }
      })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      const chunks: Blob[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Timer para mostrar tempo de gravação
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      toast.success('Gravação iniciada')
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error)
      toast.error('Erro ao acessar microfone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      toast.success('Gravação finalizada')
    }
  }

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const transcribeAudio = async () => {
    if (!audioBlob) {
      toast.error('Nenhuma gravação encontrada')
      return
    }

    setIsTranscribing(true)

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('leadId', leadId)

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Áudio transcrito com sucesso!')
        
        if (onTranscriptionComplete) {
          onTranscriptionComplete(result.transcription, result.analysis)
        }
        
        // Limpar estado após sucesso
        setAudioBlob(null)
        setAudioUrl(null)
        setRecordingTime(0)
      } else {
        throw new Error(result.error || 'Erro desconhecido')
      }
    } catch (error) {
      console.error('Erro na transcrição:', error)
      toast.error('Erro ao processar áudio')
    } finally {
      setIsTranscribing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const clearRecording = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
    setIsPlaying(false)
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  return (
    <div className="card-minimal">
      <div className="flex items-center justify-between mb-4">
        <h3 className="notion-subtitle text-gray-900 flex items-center gap-2">
          <Mic className="w-4 h-4 text-gray-600" />
          <span>Gravador de Áudio IA</span>
        </h3>
        
        {recordingTime > 0 && (
          <div className="notion-caption text-gray-500">
            {formatTime(recordingTime)}
          </div>
        )}
      </div>

      {/* Controles de Gravação */}
      <div className="flex items-center gap-3 mb-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="btn-primary flex items-center gap-2"
            disabled={isTranscribing}
          >
            <Mic className="w-4 h-4" />
            Gravar
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-2"
          >
            <Square className="w-4 h-4" />
            Parar
          </button>
        )}

        {audioBlob && (
          <>
            <button
              onClick={playAudio}
              className="btn-secondary flex items-center gap-2"
              disabled={isTranscribing}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pausar' : 'Reproduzir'}
            </button>

            <button
              onClick={transcribeAudio}
              className="btn-primary flex items-center gap-2"
              disabled={isTranscribing}
            >
              {isTranscribing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isTranscribing ? 'Processando...' : 'Transcrever'}
            </button>

            <button
              onClick={clearRecording}
              className="btn-secondary text-red-600 hover:bg-red-50"
              disabled={isTranscribing}
            >
              Limpar
            </button>
          </>
        )}
      </div>

      {/* Status da Gravação */}
      {isRecording && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="notion-body text-red-700">Gravando... {formatTime(recordingTime)}</span>
          </div>
        </div>
      )}

      {/* Dicas de Uso */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="notion-caption text-blue-900 font-medium mb-1">Dicas para melhor qualidade:</h4>
        <ul className="notion-caption text-blue-800 space-y-1">
          <li>• Fale claramente e próximo ao microfone</li>
          <li>• Evite ruídos de fundo</li>
          <li>• Mencione informações importantes sobre o lead</li>
        </ul>
      </div>

      {/* Audio Element (hidden) */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          style={{ display: 'none' }}
        />
      )}
    </div>
  )
}