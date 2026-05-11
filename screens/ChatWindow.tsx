
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { ArrowLeft, Send, MoreVertical, Phone, Mic, Trash2, StopCircle } from 'lucide-react';
import { Message } from '../types';

const ChatWindow = () => {
  const { rideId } = useParams<{ rideId: string }>();
  const navigate = useNavigate();
  const { state, dispatch, t } = useApp();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  const ride = state.rides.find(r => r.id === rideId);
  const currentUser = state.user;

  const rideMessages = state.messages.filter(m => m.rideId === rideId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [rideMessages, isRecording]);

  if (!ride || !currentUser) return <div className="p-4">Chat not found</div>;

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      rideId: ride.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    dispatch({ type: 'SEND_MESSAGE', payload: newMessage });
    setInputText('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or not available.");
    }
  };

  const stopAndSendRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = () => {
        // Original cleanup
        if (mediaRecorderRef.current?.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const newMessage: Message = {
          id: `msg_audio_${Date.now()}`,
          rideId: ride.id,
          senderId: currentUser.id,
          senderName: currentUser.name,
          text: '🎤 ' + t('messages.audio_msg'),
          audioUrl: audioUrl,
          timestamp: new Date().toISOString(),
        };

        dispatch({ type: 'SEND_MESSAGE', payload: newMessage });
      };
      
      mediaRecorderRef.current.stop();
      resetRecordingState();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      resetRecordingState();
    }
  };

  const resetRecordingState = () => {
    setIsRecording(false);
    setRecordingDuration(0);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    audioChunksRef.current = [];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 fixed inset-0 z-50 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ms-2 rounded-full hover:bg-gray-100 text-gray-600">
            <ArrowLeft size={20} className="rtl:rotate-180" />
          </button>
          <div className="ms-2">
            <h1 className="font-bold text-gray-900 text-sm leading-tight">{ride.destination}</h1>
            <p className="text-xs text-gray-500">
              {new Date(ride.departureTime).toLocaleDateString()} • {ride.driverName}
            </p>
          </div>
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <button className="p-2 rounded-full hover:bg-gray-100 text-indigo-600">
            <Phone size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {rideMessages.length > 0 ? (
          rideMessages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  isMe 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                }`}>
                  {!isMe && <p className="text-[10px] font-bold text-indigo-600 mb-1">{msg.senderName}</p>}
                  
                  {msg.audioUrl ? (
                    <div className="flex items-center gap-2 min-w-[150px]">
                      <audio controls src={msg.audioUrl} className="h-8 w-full max-w-[200px]" />
                    </div>
                  ) : (
                    <p>{msg.text}</p>
                  )}

                  <p className={`text-[10px] mt-1 text-end ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm bg-white/50 inline-block px-3 py-1 rounded-full">
              This is the start of your conversation.
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-3 border-t border-gray-100 safe-area-bottom">
        {isRecording ? (
          <div className="flex items-center space-x-3 rtl:space-x-reverse bg-gray-50 rounded-full px-4 py-2 border border-red-100 animate-pulse">
             <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
             <span className="text-red-600 font-bold text-sm flex-1">
               {t('messages.recording')} {formatDuration(recordingDuration)}
             </span>
             
             <button 
               onClick={cancelRecording} 
               className="p-2 bg-gray-200 rounded-full text-gray-600 hover:bg-gray-300 transition"
             >
               <Trash2 size={18} />
             </button>
             
             <button 
               onClick={stopAndSendRecording} 
               className="p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 transition shadow-md"
             >
               <Send size={18} className="rtl:rotate-180 ms-0.5" />
             </button>
          </div>
        ) : (
          <form onSubmit={handleSendText} className="flex items-center space-x-2 rtl:space-x-reverse">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('messages.title') + '...'}
              className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            
            {inputText.trim() ? (
              <button 
                type="submit" 
                className="bg-indigo-600 text-white p-3 rounded-full shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-90"
              >
                <Send size={18} className="rtl:rotate-180 ms-0.5" />
              </button>
            ) : (
              <button 
                type="button"
                onClick={startRecording}
                className="bg-gray-100 text-gray-600 p-3 rounded-full hover:bg-gray-200 transition-all active:scale-90"
              >
                <Mic size={20} />
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
