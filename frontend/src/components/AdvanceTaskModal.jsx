import React, { useState } from 'react';
import { useApp, resolveMediaUrl } from '../context/AppContext';
import { X, ExternalLink, Upload, CheckCircle2, Clock, AlertTriangle, Image as ImageIcon, Loader2, Sparkles, Check } from 'lucide-react';

export default function AdvanceTaskModal() {
  const { activeAdvanceModalTask, setActiveAdvanceModalTask, userSubmitAdvanceProof } = useApp();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  if (!activeAdvanceModalTask) return null;

  const task = activeAdvanceModalTask;
  const submission = task.userSubmission;
  const isApproved = submission?.status === 'approved';
  const isPending = submission?.status === 'pending';
  const isRejected = submission?.status === 'rejected';

  const handleClose = () => {
    setActiveAdvanceModalTask(null);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, WEBP)');
        return;
      }
      setSelectedFile(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    const res = await userSubmitAdvanceProof(task.id, selectedFile);
    setIsUploading(false);
    if (res?.success) {
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
      }
      // Update local task submission state
      setActiveAdvanceModalTask({
        ...task,
        userSubmission: res.submission
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-[#0E121B] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-4 h-4 fill-amber-400" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Advance Task</span>
              <h3 className="text-base font-extrabold text-white truncate max-w-[240px] sm:max-w-xs">{task.title}</h3>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 no-scrollbar">
          {/* Rewards & Slots Banner */}
          <div className="bg-[#141925] border border-white/5 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="flex items-center space-x-1.5 text-xs font-black text-[#00DF8F] bg-[#00DF8F]/10 border border-[#00DF8F]/20 px-2.5 py-1 rounded-xl">
                <img src="/usdt.png" alt="USDT" className="w-4 h-4 rounded-full" />
                <span>+${Number(task.usdtReward || 0.5).toFixed(4)} USDT</span>
              </div>
              {Number(task.fgReward) > 0 && (
                <div className="flex items-center space-x-1.5 text-xs font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-xl">
                  <img src="/fn_coin.png" alt="FN" className="w-4 h-4 rounded-full" />
                  <span>+{task.fgReward} FN</span>
                </div>
              )}
            </div>

            <div className="text-[11px] font-mono text-gray-400 font-bold">
              Slots: <span className="text-white">{task.completedCount || 0}/{task.participants || 100}</span>
            </div>
          </div>

          {/* Task Instructions (How to Complete) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-gray-300">
                📋 How to Complete this Task
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Proof required</span>
            </div>

            <div className="bg-[#141925] border border-white/5 rounded-2xl p-4 text-xs text-gray-300 leading-relaxed space-y-2 whitespace-pre-wrap font-sans">
              {task.instructions || task.description || 'Visit the link below, complete all requested actions, and take a screenshot of your confirmation screen as proof.'}
            </div>
          </div>

          {/* Task Link Action Button */}
          {task.link && (
            <div>
              <a
                href={task.link}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#FF6128] to-[#FF7A40] hover:from-[#ff733d] hover:to-[#ff8a55] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-[#FF6128]/25 transition-transform active:scale-95 cursor-pointer"
              >
                <span>Open Task Link</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Submission Status or Upload Section */}
          <div className="pt-2 border-t border-white/5 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-gray-300 block">
              📸 Submit Screenshot Proof
            </span>

            {isApproved ? (
              <div className="bg-[#00DF8F]/10 border border-[#00DF8F]/30 rounded-2xl p-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#00DF8F]/20 text-[#00DF8F] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h4 className="text-sm font-black text-white">Task Completed &amp; Paid! 🎉</h4>
                <p className="text-xs text-gray-400">
                  Your screenshot proof was verified by the admin. Reward of +${Number(task.usdtReward).toFixed(4)} USDT has been added to your wallet!
                </p>
              </div>
            ) : isPending ? (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-white">Proof Under Review ⏳</h4>
                <p className="text-xs text-gray-400">
                  Your screenshot proof was submitted on {new Date(submission?.createdAt || Date.now()).toLocaleDateString()}. Admin will review and credit your reward shortly!
                </p>
                {submission?.screenshotUrl && (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-[10px] text-gray-400 block mb-1.5 uppercase font-mono">Your Submitted Screenshot:</span>
                    <div className="rounded-xl overflow-hidden border border-white/10 max-h-40 bg-black/50 flex items-center justify-center p-1">
                      <img
                        src={resolveMediaUrl(submission.screenshotUrl)}
                        alt="Your submitted proof"
                        className="max-h-36 object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {isRejected && (
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3 text-xs text-rose-300 flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-black text-rose-400 block">Previous Proof Declined:</strong>
                      <span>{submission?.rejectReason || 'Screenshot did not match task requirements. Please upload a clear new screenshot below.'}</span>
                    </div>
                  </div>
                )}

                {/* Upload Box */}
                {!selectedFile ? (
                  <label className="border-2 border-dashed border-white/15 hover:border-[#FF6128]/50 rounded-2xl p-6 flex flex-col items-center justify-center space-y-2.5 cursor-pointer bg-[#141925]/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-extrabold text-white block">Click to Upload Screenshot</span>
                      <span className="text-[10px] text-gray-500 block mt-0.5">Supports JPG, PNG, WEBP up to 10MB</span>
                    </div>
                  </label>
                ) : (
                  <div className="bg-[#141925] border border-white/10 rounded-2xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 overflow-hidden">
                        <ImageIcon className="w-4 h-4 text-[#00DF8F] shrink-0" />
                        <span className="text-xs font-mono font-bold text-gray-300 truncate max-w-[200px]">
                          {selectedFile.name}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          ({(selectedFile.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          if (previewUrl) URL.revokeObjectURL(previewUrl);
                          setPreviewUrl('');
                        }}
                        className="text-gray-400 hover:text-rose-400 text-xs font-bold"
                      >
                        Change
                      </button>
                    </div>

                    {previewUrl && (
                      <div className="rounded-xl overflow-hidden border border-white/10 max-h-48 bg-black/40 flex items-center justify-center">
                        <img
                          src={previewUrl}
                          alt="Proof preview"
                          className="max-h-48 w-full object-contain"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={handleSubmit}
                      className="w-full py-3 px-4 rounded-xl bg-[#00DF8F] hover:bg-[#00c780] text-black text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Uploading Proof...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Submit Screenshot for Verification 🚀</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

