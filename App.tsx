
import React, { useState, useRef, useEffect } from 'react';
import { 
  FileAudio, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Mic,
  Languages,
  Trash2,
  Settings,
  ChevronDown,
  DownloadCloud,
  Cpu,
  Zap
} from 'lucide-react';
import { AppStatus, TranscriptionResult, SegmentLength } from './types';
import { transcribeAudio } from './services/geminiService';
import { fileToBase64, generateSRT, downloadFile } from './utils/fileUtils';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState('Arabic');
  const [segmentLength, setSegmentLength] = useState<SegmentLength>('medium');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 25 * 1024 * 1024) {
        setError("حجم الملف كبير جداً. الحد الأقصى هو 25 ميجابايت.");
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
      setStatus(AppStatus.IDLE);
    }
  };

  // Fix: Added handleUploadClick to trigger the hidden file input when the container is clicked.
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const processAudio = async () => {
    if (!file) return;
    try {
      setStatus(AppStatus.LOADING);
      setError(null);
      const base64 = await fileToBase64(file);
      const data = await transcribeAudio(base64, file.type, targetLang, segmentLength);
      setResult(data);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع.");
      setStatus(AppStatus.ERROR);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setStatus(AppStatus.IDLE);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 font-tajawal selection:bg-indigo-100 text-slate-900">
      
      {/* Floating Portable Install Button */}
      {installPrompt && (
        <button 
          onClick={handleInstall}
          className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-white border border-indigo-100 shadow-[0_10px_30px_-10px_rgba(79,70,229,0.3)] px-5 py-3 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all duration-300 group animate-bounce-slow"
        >
          <div className="bg-indigo-600 p-2 rounded-xl group-hover:bg-white transition-colors">
            <DownloadCloud className="w-5 h-5 text-white group-hover:text-indigo-600" />
          </div>
          <div className="text-right">
            <p className="text-xs font-bold opacity-70">نسخة الكمبيوتر</p>
            <p className="text-sm font-black">تثبيت كبرنامج محمول</p>
          </div>
        </button>
      )}

      {/* Header Section */}
      <div className="max-w-4xl w-full text-center mb-10 mt-4">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full mb-6 animate-fadeIn">
          <Cpu className="w-4 h-4 text-indigo-600" />
          <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-widest">Portable App Experience</span>
          <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white p-5 rounded-[1.8rem] shadow-xl border border-slate-100">
              <Mic className="text-indigo-600 w-10 h-10" />
            </div>
          </div>
        </div>

        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
          SawtToText <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">Pro 2.0</span>
        </h1>
        <p className="text-xl text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
          حوّل صوتك إلى نص وترجمة SRT بدقة سينمائية، الآن في نسخة قابلة للتثبيت على سطح المكتب.
        </p>
      </div>

      <div className="max-w-5xl w-full">
        <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] overflow-hidden border border-slate-200/50">
          <div className="p-4 md:p-12">
            <div className="flex flex-col lg:flex-row gap-12">
              
              {/* Drop Zone */}
              <div className="flex-1">
                <div 
                  onClick={handleUploadClick}
                  className={`relative group h-80 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-700 ${
                    file ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'
                  }`}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*,video/*" className="hidden" />
                  {file ? (
                    <div className="text-center animate-fadeIn p-8">
                      <div className="w-28 h-28 bg-white shadow-2xl rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-100 group-hover:scale-105 transition-transform duration-500">
                        <FileAudio className="w-14 h-14 text-indigo-600" />
                      </div>
                      <h4 className="text-2xl font-black text-slate-800 mb-2 truncate max-w-sm mx-auto">{file.name}</h4>
                      <div className="flex items-center justify-center gap-3">
                        <span className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-black rounded-full shadow-lg shadow-indigo-100">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <span className="px-4 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200">
                          {file.type.split('/')[1]?.toUpperCase() || 'AUDIO'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-600 group-hover:rotate-12 transition-all duration-500 shadow-inner">
                        <Upload className="w-10 h-10 text-slate-300 group-hover:text-white" />
                      </div>
                      <h4 className="text-2xl font-bold text-slate-700 mb-2">اختر ملف الصوت أو الفيديو</h4>
                      <p className="text-slate-400 font-medium">اسحب الملف هنا أو اضغط للتصفح</p>
                    </div>
                  )}
                  {file && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); reset(); }}
                      className="absolute top-8 left-8 p-3 bg-white/90 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all border border-slate-100 shadow-sm"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="lg:w-80 flex flex-col gap-6">
                <div className="bg-[#fcfdfe] p-8 rounded-[2.5rem] border border-slate-100 shadow-inner space-y-8">
                  <div className="space-y-4">
                    <label className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Languages className="w-4 h-4 text-indigo-600" /> لغة الترجمة
                    </label>
                    <div className="relative group">
                      <select 
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="w-full appearance-none p-4 pr-10 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 transition-all outline-none font-bold text-slate-800 cursor-pointer shadow-sm group-hover:border-slate-200"
                      >
                        <option value="Arabic">العربية</option>
                        <option value="English">الإنجليزية</option>
                        <option value="French">الفرنسية</option>
                        <option value="German">الألمانية</option>
                        <option value="Spanish">الإسبانية</option>
                        <option value="Turkish">التركية</option>
                      </select>
                      <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Settings className="w-4 h-4 text-indigo-600" /> نمط الجمل
                    </label>
                    <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                      {(['short', 'medium', 'long'] as const).map((len) => (
                        <button
                          key={len}
                          onClick={() => setSegmentLength(len)}
                          className={`py-3 px-1 text-[11px] font-black rounded-xl transition-all duration-300 ${
                            segmentLength === len 
                              ? 'bg-white text-indigo-600 shadow-md' 
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {len === 'short' ? 'قصيرة' : len === 'medium' ? 'تلقائي' : 'طويلة'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  disabled={!file || status === AppStatus.LOADING}
                  onClick={processAudio}
                  className={`w-full py-6 rounded-[2rem] font-black flex items-center justify-center gap-3 transition-all duration-500 text-xl shadow-2xl ${
                    !file || status === AppStatus.LOADING 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 shadow-indigo-200'
                  }`}
                >
                  {status === AppStatus.LOADING ? (
                    <><Loader2 className="w-7 h-7 animate-spin" /> جاري التحويل...</>
                  ) : (
                    <>ابدأ المعالجة</>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-10 animate-shake">
                <div className="bg-red-50 border-2 border-red-100 text-red-600 px-8 py-5 rounded-[2rem] flex items-center gap-4">
                  <AlertCircle className="w-6 h-6 flex-shrink-0" />
                  <p className="font-bold text-lg">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {status === AppStatus.SUCCESS && result && (
          <div className="mt-12 space-y-10 animate-fadeIn">
            <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="p-10 md:p-14 border-b border-slate-50 bg-[#fafbfc] flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex items-center gap-6">
                  <div className="bg-green-100 p-5 rounded-[2rem]">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-3xl text-slate-900 mb-1">جاهز للتحميل</h3>
                    <p className="text-slate-500 text-lg font-medium">تم إنشاء ملفاتك بنجاح تام</p>
                  </div>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <button 
                    onClick={() => downloadFile(generateSRT(result.segments), `SawtToText_${Date.now()}.srt`, 'text/plain')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] hover:bg-slate-800 transition-all font-black shadow-2xl shadow-slate-300"
                  >
                    <Download className="w-6 h-6" /> SRT
                  </button>
                  <button 
                    onClick={() => downloadFile(result.fullText, `SawtToText_${Date.now()}.txt`, 'text/plain')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-indigo-50 text-indigo-700 px-10 py-5 rounded-[1.5rem] hover:bg-indigo-100 transition-all font-black border-2 border-indigo-100"
                  >
                    <Download className="w-6 h-6" /> TXT
                  </button>
                </div>
              </div>
              
              <div className="p-10 md:p-20 max-h-[900px] overflow-y-auto custom-scrollbar">
                <div className="space-y-16">
                  {result.segments.map((seg) => (
                    <div key={seg.index} className="flex flex-col md:flex-row gap-10 group">
                      <div className="md:w-40 flex-shrink-0">
                        <div className="inline-flex items-center justify-center bg-slate-50 text-slate-400 px-5 py-2.5 rounded-2xl text-[14px] font-mono font-black border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                          {seg.start}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-800 leading-[2] text-3xl font-bold group-hover:text-slate-950 transition-colors">
                          {seg.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-24 mb-12 text-slate-400 text-sm flex flex-col items-center gap-6">
        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-tighter">
           <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-slate-600">Portable Engine Ready</span>
           </div>
        </div>
        <p dir="ltr" className="font-medium opacity-50">v2.1 Portable Edition • Built for Precision</p>
      </footer>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.19, 1, 0.22, 1); }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 12px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 20px;
          border: 4px solid #ffffff;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default App;
