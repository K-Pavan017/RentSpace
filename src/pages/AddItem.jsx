import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Camera, 
  MapPin, 
  IndianRupee, 
  Phone, 
  FileText, 
  Home as HomeIcon, 
  Map as MapIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ShieldCheck,
  Calendar,
  Info
} from 'lucide-react';

export default function AddItem() {
  const { category } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    rentPrice: '',
    mobile: '',
    houseNo: '',
    place: '',
    district: '',
    description: '',
    // --- NEW ESSENTIAL DETAILS ---
    securityDeposit: '',
    minRentPeriod: '1 Day',
    condition: 'Good',
    isAvailable: 'Immediate',
    idVerified: false
  });

  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]); // For image previews
  const [location, setLocation] = useState({ lat: null, lng: null, error: null });

  /* ---------------- AUTO LOCATION PERMISSION ---------------- */
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ lat: null, lng: null, error: 'Geolocation not supported' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, error: null });
      },
      (err) => {
        setLocation({ lat: null, lng: null, error: 'Location permission denied' });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  /* ---------------- FORM HANDLING ---------------- */
  const handleChange = (e) => {
    const { name, type, value, files, checked } = e.target;
    
    if (type === 'file') {
      const fileArray = Array.from(files);
      setFormData(prev => ({ ...prev, images: files }));
      
      const filePreviews = fileArray.map(file => URL.createObjectURL(file));
      setPreviews(filePreviews);
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const wordCount = formData.description.trim().split(/\s+/).filter(Boolean).length;
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  /* ---------------- CLOUDINARY UPLOAD ---------------- */
  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', uploadPreset);//rents_upload
    data.append('folder', category);

    const res = await fetch(
      'https://api.cloudinary.com/v1_1/{cloudName}/image/upload',
      { method: 'POST', body: data }
    );

    const json = await res.json();
    if (json.secure_url) return json.secure_url;
    throw new Error(json.error?.message || 'Cloudinary upload failed');
  };

  /* ---------------- SUBMIT FORM ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      if (!formData.title || !formData.rentPrice || !formData.mobile || !formData.houseNo || !formData.place || !formData.district || !formData.description) {
        alert('Please fill all required fields');
        setUploading(false);
        return;
      }

      if (wordCount < 50 || wordCount > 100) {
        alert('Description must be between 50 and 100 words');
        setUploading(false);
        return;
      }

      if (!location.lat || !location.lng) {
        alert('Please allow location permission to continue');
        setUploading(false);
        return;
      }

      const imageUrls = [];
      if (formData.images) {
        for (const file of Array.from(formData.images)) {
          const url = await uploadToCloudinary(file);
          imageUrls.push(url);
        }
      }

      await addDoc(collection(db, 'listings'), {
        title: formData.title,
        rentPrice: Number(formData.rentPrice),
        mobile: formData.mobile,
        description: formData.description,
        images: imageUrls,
        category: category.toLowerCase(),
        location: { lat: location.lat, lng: location.lng },
        address: { houseNo: formData.houseNo, place: formData.place, district: formData.district },
        // --- SAVING NEW DETAILS ---
        securityDeposit: Number(formData.securityDeposit),
        condition: formData.condition,
        minRentPeriod: formData.minRentPeriod,
        isAvailable: formData.isAvailable,
        idVerified: formData.idVerified,
        createdAt: new Date(),
      });
      alert('Listing added successfully!');
      navigate('/home');
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Header Section */}
      <div className="bg-slate-900 text-white pt-16 pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold mb-3 capitalize tracking-tight">List Your {category}</h1>
          <p className="text-slate-400">Reach thousands of potential renters in your area.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Info */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText className="w-5 h-5" /></div>
              <h2 className="text-xl font-bold">Item Details</h2>
            </div>

            <div className="grid gap-6">
              <div className="relative">
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Listing Title</label>
                <input name="title" placeholder="e.g. Luxury 3BHK Apartment" required onChange={handleChange}
                  className="w-full p-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Rent Price (Per Day/Month)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="number" name="rentPrice" placeholder="0.00" required onChange={handleChange}
                      className="w-full pl-10 pr-4 py-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="tel" name="mobile" placeholder="Mobile Number" required onChange={handleChange}
                      className="w-full pl-10 pr-4 py-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-bold text-slate-400 uppercase block">Description</label>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${wordCount < 50 || wordCount > 100 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {wordCount} / 100 Words
                  </span>
                </div>
                <textarea name="description" placeholder="Describe features, amenities, and rules..." rows={5} required onChange={handleChange}
                  className="w-full p-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none" />
              </div>
            </div>
          </div>

          {/* NEW Section 2: Rental Terms & Quality */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-4">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><ShieldCheck className="w-5 h-5" /></div>
              <h2 className="text-xl font-bold">Rental Policies & Quality</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Security Deposit (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="number" name="securityDeposit" placeholder="Enter 0 if none" required onChange={handleChange}
                    className="w-full pl-10 pr-4 py-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Item Condition</label>
                <select name="condition" onChange={handleChange} value={formData.condition}
                  className="w-full p-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium">
                  <option value="Brand New">Brand New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good / Used</option>
                  <option value="Fair">Fair / Workable</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Min. Rental Period</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" name="minRentPeriod" placeholder="e.g., 2 Days" required onChange={handleChange}
                    className="w-full pl-10 pr-4 py-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Availability Status</label>
                <select name="isAvailable" onChange={handleChange} value={formData.isAvailable}
                  className="w-full p-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium">
                  <option value="Immediate">Available Immediately</option>
                  <option value="Next Week">Available from Next Week</option>
                  <option value="Custom">Contact for Availability</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <input type="checkbox" name="idVerified" checked={formData.idVerified} onChange={handleChange}
                className="mt-1 w-5 h-5 accent-blue-600 rounded cursor-pointer" />
              <p className="text-sm text-blue-800 font-medium leading-relaxed">
                I agree to show my **Original ID Proof** to the renter during the exchange. This builds trust and ensures a safe community.
              </p>
            </div>
          </div>

          {/* Section 3: Photos */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Camera className="w-5 h-5" /></div>
              <h2 className="text-xl font-bold">Media & Photos</h2>
            </div>
            
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center group hover:border-blue-400 transition-colors relative">
              <input type="file" name="images" multiple required onChange={handleChange}
                className="absolute inset-0 opacity-0 cursor-pointer" />
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
                <Camera className="w-8 h-8 text-slate-400 group-hover:text-blue-500" />
              </div>
              <p className="font-bold text-slate-700">Click to upload photos</p>
              <p className="text-sm text-slate-400 mt-1">PNG, JPG up to 10MB</p>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-6">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                    <img src={src} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Location */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><MapIcon className="w-5 h-5" /></div>
              <h2 className="text-xl font-bold">Location Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <input name="houseNo" placeholder="House No / Door No" required onChange={handleChange}
                className="w-full p-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
              <input name="place" placeholder="Area / Landmark" required onChange={handleChange}
                className="w-full p-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
              <input name="district" placeholder="City / District" required onChange={handleChange}
                className="w-full p-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
            </div>

            <div className={`flex items-center gap-3 p-4 rounded-2xl border ${location.lat ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
              {location.lat ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm font-bold">
                {location.lat ? 'GPS Location Verified' : 'Location access is required for listing verification'}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-5 rounded-2xl text-white font-black text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 ${
              uploading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Uploading Listing...
              </>
            ) : (
              'Publish Listing'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}