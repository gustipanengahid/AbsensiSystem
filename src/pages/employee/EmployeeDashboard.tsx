import React, { useState, useEffect, useRef } from "react";
import { User, OfficeConfig, AttendanceRecord } from "../../types";
import { photoService } from "../../services/photoService";
import { locationService } from "../../services/locationService";
import { getDepartmentSchedule } from "../../utils/scheduleUtils";
import {
  Camera,
  Navigation,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Check,
  UserCheck,
  LogOut,
  Eye,
  X,
  Clock,
  MapPin,
  FileText,
  DollarSign,
} from "lucide-react";

interface EmployeeDashboardProps {
  activeTab: string;
  user: User;
  office: OfficeConfig;
  records: AttendanceRecord[];
  onRecordSave: (rec: AttendanceRecord) => void;
  showToast: (text: string, type?: "success" | "error" | "info") => void;
}

export default function EmployeeDashboard({
  activeTab,
  user,
  office,
  records,
  onRecordSave,
  showToast,
}: EmployeeDashboardProps) {
  if (activeTab === "absen-history") {
    return <EmployeeHistoryPage user={user} records={records} />;
  }
  if (activeTab === "profile") {
    return (
      <EmployeeProfilePage user={user} office={office} records={records} />
    );
  }

  return (
    <EmployeeCheckInPage
      user={user}
      office={office}
      records={records}
      onRecordSave={onRecordSave}
      showToast={showToast}
    />
  );
}

function EmployeeCheckInPage({
  user,
  office,
  records,
  onRecordSave,
  showToast,
}: {
  user: User;
  office: OfficeConfig;
  records: AttendanceRecord[];
  onRecordSave: (rec: AttendanceRecord) => void;
  showToast: (m: string, t?: "success" | "error" | "info") => void;
}) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [locationError, setLocationError] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [checkOutNote, setCheckOutNote] = useState("");

  const nowLocalDate = new Date();
  const year = nowLocalDate.getFullYear();
  const month = String(nowLocalDate.getMonth() + 1).padStart(2, "0");
  const day = String(nowLocalDate.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  const existingTodayRecord = records.find(
    (r) => r.userId === user.id && r.date === todayStr,
  );

  const isAlreadyFinishedToday =
    !!existingTodayRecord && !!existingTodayRecord.checkOutTime;

  let hasCompletedShift = false;
  if (existingTodayRecord && existingTodayRecord.checkInTime) {
    const [hIn, mIn, sIn] = existingTodayRecord.checkInTime
      .split(":")
      .map(Number);
    const checkInDate = new Date();
    checkInDate.setHours(hIn, mIn, sIn || 0);

    const diffMs = currentTime.getTime() - checkInDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    hasCompletedShift = diffHours >= 8;
  }

  const deptSchedule = getDepartmentSchedule(user, office);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchLocation = () => {
    setLocationStatus("loading");
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationError("Browser Anda tidak mendukung Geolocation API.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const dist = locationService.calculateDistanceMeters(
          lat,
          lng,
          office.latitude,
          office.longitude,
        );
        setUserLocation({ lat, lng });
        setDistance(dist);
        setLocationStatus("success");
      },
      (err) => {
        setLocationStatus("error");
        setLocationError(
          `Gagal mengambil lokasi GPS: ${err.message}. Pastikan izin GPS aktif.`,
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  useEffect(() => {
    fetchLocation();
  }, [office]);

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err: any) {
      setCameraError(
        "Gagal mengakses kamera depan: " + (err.message || "Izin ditolak"),
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedPhotoUrl(dataUrl);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedPhotoUrl(null);
    startCamera();
  };

  const handleCheckIn = async () => {
    if (isAlreadyFinishedToday) {
      showToast(
        "Anda sudah menyelesaikan absensi hari ini. Silakan absen kembali besok.",
        "error",
      );
      return;
    }
    if (!capturedPhotoUrl) {
      showToast("Wajib mengambil foto selfie sebelum absen!", "error");
      return;
    }

    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    const photoId = `photo-in-${user.id}-${Date.now()}`;

    await photoService.savePhoto(photoId, capturedPhotoUrl);

    const [targetH, targetM] = deptSchedule.workStartHour
      .split(":")
      .map(Number);
    const isLate =
      now.getHours() > targetH ||
      (now.getHours() === targetH && now.getMinutes() > targetM);

    const newRecord: AttendanceRecord = {
      id: `att-${todayStr}-${user.id}`,
      userId: user.id,
      userName: user.name,
      userPosition: user.position,
      date: todayStr,
      checkInTime: timeStr,
      checkInPhotoId: photoId,
      checkInLat: userLocation?.lat,
      checkInLng: userLocation?.lng,
      checkInDistanceMeters: distance || 0,
      status: isLate ? "Terlambat" : "Hadir",
    };

    onRecordSave(newRecord);
    setCapturedPhotoUrl(null);
    showToast(`Presensi Masuk berhasil dicatat (${timeStr})!`, "success");
  };

  const handleCheckOut = async () => {
    if (!existingTodayRecord) {
      showToast("Anda belum melakukan Absen Masuk hari ini!", "error");
      return;
    }
    if (existingTodayRecord.checkOutTime) {
      showToast("Anda sudah melakukan Absen Pulang hari ini.", "error");
      return;
    }
    if (!capturedPhotoUrl) {
      showToast("Wajib mengambil foto selfie sebelum absen pulang!", "error");
      return;
    }

    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    const photoId = `photo-out-${user.id}-${Date.now()}`;

    await photoService.savePhoto(photoId, capturedPhotoUrl);

    const updatedRecord: AttendanceRecord = {
      ...existingTodayRecord,
      checkOutTime: timeStr,
      checkOutPhotoId: photoId,
      checkOutLat: userLocation?.lat ?? existingTodayRecord.checkOutLat,
      checkOutLng: userLocation?.lng ?? existingTodayRecord.checkOutLng,
      checkOutDistanceMeters:
        distance ?? existingTodayRecord.checkOutDistanceMeters ?? 0,
      note: checkOutNote.trim() || existingTodayRecord.note,
      status: "Pulang",
    };

    onRecordSave(updatedRecord);
    setCapturedPhotoUrl(null);
    setCheckOutNote("");
    showToast(
      `Presensi Pulang berhasil dicatat (${timeStr}). Absensi hari ini selesai!`,
      "success",
    );
  };

  const isWithinRadius =
    distance !== null && distance <= (office.radiusMeters || 100);

  const span = 0.005;
  const minLng = office.longitude - span;
  const minLat = office.latitude - span;
  const maxLng = office.longitude + span;
  const maxLat = office.latitude + span;

  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=cartodbpositron&marker=${office.latitude}%2C${office.longitude}`;

  return (
    <div className="space-y-5 max-w-6xl mx-auto font-sans pb-12">
      <div className="bg-white border border-slate-100 px-6 py-4 rounded-2xl shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0 shadow-2xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50/80 px-2 py-0.5 rounded-md">
                {user.department}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400 font-medium">
                {deptSchedule.workStartHour} - {deptSchedule.workEndHour} WIB
              </span>
            </div>
            <div className="flex items-baseline gap-2.5 mt-0.5">
              <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900">
                {currentTime.toLocaleTimeString("id-ID")}
              </h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50/80 border border-slate-100 px-4 py-2 rounded-xl text-xs">
          <span className="text-slate-400 font-medium">Status Kehadiran:</span>
          {isAlreadyFinishedToday ? (
            <span className="font-bold text-emerald-600">
              Selesai Hari Ini (Absen Terbuka Lagi Besok)
            </span>
          ) : existingTodayRecord ? (
            <span className="font-bold text-blue-600">
              Sedang Berkerja (Aktif)
            </span>
          ) : (
            <span className="font-bold text-amber-600">
              Belum Absen Hari Ini
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-xs text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>1. Validasi Lokasi GPS</span>
              </h3>
              <button
                onClick={fetchLocation}
                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100 flex items-center gap-1 text-xs font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="text-xs text-slate-500 flex items-center justify-between font-medium">
                <span className="truncate">
                  <span className="text-slate-700 font-semibold">Kantor:</span>{" "}
                  {office.name}
                </span>
                <span className="font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md flex-shrink-0">
                  Radius Max {office.radiusMeters || 100}m
                </span>
              </div>

              {locationStatus === "success" && distance !== null && (
                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    isWithinRadius
                      ? "bg-blue-50/40 border-blue-100/80 text-blue-900"
                      : "bg-rose-50/40 border-rose-100/80 text-rose-900"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>Jarak Aktual Dari Kantor:</span>
                    <span className="text-sm font-mono">{distance} Meter</span>
                  </div>
                </div>
              )}

              <div className="relative w-full h-52 sm:h-56 rounded-xl overflow-hidden border border-slate-100 shadow-2xs bg-slate-50">
                <iframe
                  title="Peta Lokasi Kantor"
                  width="100%"
                  height="100%"
                  src={mapEmbedUrl}
                  className="border-0 w-full h-full grayscale-20 contrast-105 pointer-events-auto"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-xs text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>2. Verifikasi Foto & Absen</span>
              </h3>
            </div>

            {isAlreadyFinishedToday ? (
              <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-sm">
                  Absensi Hari Ini Telah Selesai
                </h4>
                <p className="text-xs text-emerald-700">
                  Anda telah menyelesaikan presensi masuk dan pulang hari ini.
                </p>
                <p className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 py-1.5 px-3 rounded-xl mt-2 inline-block">
                  * Anda bisa absen lagi besok mulai pukul{" "}
                  {deptSchedule.workStartHour} WIB sesuai setting departemen.
                </p>
              </div>
            ) : (
              <>
                <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-100 shadow-2xs flex items-center justify-center mb-3">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
                  />
                  {capturedPhotoUrl && (
                    <img
                      src={capturedPhotoUrl}
                      alt="Snapshot"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {!cameraActive && !capturedPhotoUrl && (
                    <div className="text-center p-4">
                      <Camera className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-400 font-medium">
                        Kamera selfie belum diaktifkan
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!cameraActive && !capturedPhotoUrl && (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" /> Buka Kamera Selfie
                    </button>
                  )}
                  {cameraActive && (
                    <button
                      type="button"
                      onClick={captureSnapshot}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Ambil Foto
                    </button>
                  )}
                  {capturedPhotoUrl && (
                    <button
                      type="button"
                      onClick={retakePhoto}
                      className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs py-2.5 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Foto Ulang
                    </button>
                  )}
                </div>

                {existingTodayRecord && !existingTodayRecord.checkOutTime && (
                  <div className="mt-3.5">
                    <input
                      type="text"
                      value={checkOutNote}
                      onChange={(e) => setCheckOutNote(e.target.value)}
                      placeholder="Catatan Pulang (Opsional)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>
                )}

                <div className="mt-3 p-2.5 bg-blue-50/50 border border-blue-100/70 rounded-xl text-[11px] text-blue-700 font-medium">
                  ℹ️ Anda bisa absen lagi besok pukul{" "}
                  <span className="font-bold">
                    {deptSchedule.workStartHour} WIB
                  </span>{" "}
                  (sesuai setting shift departemen).
                </div>
              </>
            )}
          </div>

          {!isAlreadyFinishedToday && (
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  disabled={
                    !isWithinRadius ||
                    (!!existingTodayRecord && !hasCompletedShift) ||
                    !capturedPhotoUrl
                  }
                  onClick={handleCheckIn}
                  className={`py-3 px-3 rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2 ${
                    !isWithinRadius ||
                    (!!existingTodayRecord && !hasCompletedShift) ||
                    !capturedPhotoUrl
                      ? "bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Absen Masuk</span>
                </button>
                <button
                  disabled={
                    !isWithinRadius ||
                    !existingTodayRecord ||
                    !!existingTodayRecord.checkOutTime ||
                    !capturedPhotoUrl
                  }
                  onClick={handleCheckOut}
                  className={`py-3 px-3 rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2 ${
                    !isWithinRadius ||
                    !existingTodayRecord ||
                    !!existingTodayRecord.checkOutTime ||
                    !capturedPhotoUrl
                      ? "bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Absen Pulang</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmployeeHistoryPage({
  user,
  records,
}: {
  user: User;
  records: AttendanceRecord[];
}) {
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);
  const myRecords = records.filter((r) => r.userId === user.id);

  const handleOpenPhoto = async (photoId?: string) => {
    if (!photoId) return;
    const dataUrl = await photoService.getPhoto(photoId);
    setActivePhotoModal(dataUrl);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans pb-12">
      <div>
        <h2 className="text-xl font-black text-slate-950 tracking-tight">
          Riwayat Presensi Saya
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Daftar rekaman kehadiran dan rekam jejak kerja Anda
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="p-4 sm:px-6">Tanggal</th>
                <th className="p-4">Jam Masuk</th>
                <th className="p-4">Jam Pulang</th>
                <th className="p-4">Catatan</th>
                <th className="p-4">Jarak GPS</th>
                <th className="p-4">Foto Masuk</th>
                <th className="p-4">Foto Pulang</th>
                <th className="p-4 sm:pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {myRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    Belum ada catatan presensi tersimpan.
                  </td>
                </tr>
              ) : (
                myRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50">
                    <td className="p-4 sm:px-6 font-mono text-slate-600 font-semibold">
                      {rec.date}
                    </td>
                    <td className="p-4 font-mono text-blue-600 font-bold">
                      {rec.checkInTime}
                    </td>
                    <td className="p-4 font-mono text-emerald-600 font-bold">
                      {rec.checkOutTime || "-"}
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">
                      {rec.note || "-"}
                    </td>
                    <td className="p-4 text-slate-500">
                      {rec.checkInDistanceMeters !== undefined
                        ? `${rec.checkInDistanceMeters}m`
                        : "-"}
                    </td>
                    <td className="p-4">
                      {rec.checkInPhotoId && (
                        <button
                          onClick={() => handleOpenPhoto(rec.checkInPhotoId)}
                          className="px-2.5 py-1 bg-slate-50 text-blue-600 border border-slate-200 rounded-lg text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" /> Masuk
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      {rec.checkOutPhotoId && (
                        <button
                          onClick={() => handleOpenPhoto(rec.checkOutPhotoId)}
                          className="px-2.5 py-1 bg-slate-50 text-emerald-600 border border-slate-200 rounded-lg text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" /> Pulang
                        </button>
                      )}
                    </td>
                    <td className="p-4 sm:pr-6">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-[10px]">
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activePhotoModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden border border-slate-100 p-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <span className="font-bold text-xs text-slate-800">
                Preview Foto
              </span>
              <button
                onClick={() => setActivePhotoModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-slate-900 flex items-center justify-center min-h-[250px] rounded-xl overflow-hidden">
              <img
                src={activePhotoModal}
                alt="Preview"
                className="max-h-72 object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmployeeProfilePage({
  user,
  office,
  records,
}: {
  user: User;
  office: OfficeConfig;
  records: AttendanceRecord[];
}) {
  const deptSchedule = getDepartmentSchedule(user, office);
  const userAvatar = (user as any).avatar;

  const matchedDept = office.departmentSchedules?.find(
    (d) => d.department.toLowerCase() === user.department.toLowerCase(),
  );
  const dailyRate = matchedDept?.dailySalary || 120000;

  const myPresentDays = records.filter(
    (r) =>
      r.userId === user.id &&
      (r.status === "Hadir" || r.status === "Terlambat"),
  ).length;

  const totalEarnedSalary = myPresentDays * dailyRate;

  return (
    <div className="space-y-6 max-w-2xl mx-auto font-sans pb-12">
      <div>
        <h2 className="text-xl font-black text-slate-950 tracking-tight">
          Profil & Informasi Gaji Saya
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Rincian jadwal kerja, tarif harian, dan akumulasi pendapatan Anda
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-700 relative" />

        <div className="px-6 pb-6 relative">
          <div className="-mt-12 mb-4 flex items-end justify-between">
            <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white text-slate-900 font-black text-2xl flex items-center justify-center shadow-md overflow-hidden">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="bg-slate-900 text-white w-full h-full flex items-center justify-center">
                  {user.name.charAt(0)}
                </span>
              )}
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-bold uppercase tracking-wider">
              {user.role}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-slate-950">{user.name}</h3>
              <p className="text-xs text-slate-400 font-semibold">
                {user.position} • {user.department}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <DollarSign className="w-4 h-4" /> Tarif Gaji Harian
                </span>
                <span className="text-lg font-black text-blue-900 font-mono">
                  Rp {dailyRate.toLocaleString("id-ID")} / Hari
                </span>
              </div>

              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4" /> Total Gaji (Sesuai Absen)
                </span>
                <div>
                  <span className="text-lg font-black text-emerald-900 font-mono">
                    Rp {totalEarnedSalary.toLocaleString("id-ID")}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
                    Dari {myPresentDays} hari kehadiran
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-950 block uppercase tracking-wider">
                Jadwal Operasional Karyawan
              </span>
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">
                    Lokasi Penugasan:
                  </span>
                  <span className="font-bold text-slate-800">
                    {office.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">
                    Departemen:
                  </span>
                  <span className="font-bold text-slate-800">
                    {user.department}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">
                    Jam Kerja Reguler:
                  </span>
                  <span className="font-extrabold text-blue-600">
                    {deptSchedule.workStartHour} WIB -{" "}
                    {deptSchedule.workEndHour} WIB
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
