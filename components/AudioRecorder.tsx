'use client'

import { useState, useRef } from 'react'
import { Mic, MicOff, Square, Play, Pause, Upload, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface AudioRecorderProps {
  leadId: string
  userId: string
  onTranscriptionComplete?: (data: {
    transcription: string
    analysis: any
    interactionId: string
  }) => void
}

export function AudioRecorder({ leadId, userId, onTranscriptionComplete }: AudioRecorderProps) {
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

  const uploadAndTranscribe = async () => {
    if (!audioBlob) {
      toast.error('Nenhum áudio para processar')
      return
    }

    setIsTranscribing(true)
    
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('leadId', leadId)
      formData.append('userId', userId)

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Falha na transcrição')
      }

      const result = await response.json()
      
      if (result.success) {
        toast.success('Áudio processado com sucesso!')
        
        if (onTranscriptionComplete) {
          onTranscriptionComplete({
            transcription: result.transcription,
            analysis: result.analysis,
            interactionId: result.interactionId,
          })
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
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Mic className="w-5 h-5 text-accent-500" />
          <span>Gravador de Áudio IA</span>
        </h3>
        
        {recordingTime > 0 && (
          <div className="text-sm text-gray-400">
            {formatTime(recordingTime)}
          </div>
        )}
      </div>

      {/* Controles de Gravação */}
      <div className="flex items-center space-x-4 mb-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isTranscribing}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Mic className="w-4 h-4" />
            <span>Gravar</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors animate-pulse"
          >
            <Square className="w-4 h-4" />
            <span>Parar</span>
          </button>
        )}

        {audioUrl && (
          <>
            <button
              onClick={playAudio}
              disabled={isTranscribing}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Reproduzir</span>
                </>
              )}
            </button>

            <button
              onClick={uploadAndTranscribe}
              disabled={isTranscribing}
              className="flex items-center space-x-2 bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {isTranscribing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Processar com IA</span>
                </>
              )}
            </button>

            <button
              onClick={clearRecording}
              disabled={isTranscribing}
              className="text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              <MicOff className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Visualizador de Áudio */}
      {isRecording && (
        <div className="mb-4">
          <div className="flex items-center space-x-1 justify-center">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-red-500 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 20 + 10}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-2">
            Gravando... Fale naturalmente sobre a conversa com o lead.
          </p>
        </div>
      )}

      {/* Player de Áudio */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      {/* Dicas de Uso */}
      <div className="text-xs text-gray-500 bg-gray-900 p-3 rounded-lg">
        <p className="font-medium mb-1">💡 Dicas para melhor resultado:</p>
        <ul className="space-y-1">
          <li>• Grave em ambiente silencioso</li>
          <li>• Fale claramente sobre objetivos do lead</li>
          <li>• Mencione próximos passos discutidos</li>
          <li>• A IA extrairá tarefas automaticamente</li>
        </ul>
      </div>
    </div>
  )
}
