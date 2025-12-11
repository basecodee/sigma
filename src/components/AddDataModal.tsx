import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
  type: 'unitkerja' | 'edc';
}

const AddDataModal: React.FC<AddDataModalProps> = ({ isOpen, onClose, onAdd, type }) => {
  const [formData, setFormData] = useState({
    nama_lokasi: '',
    jenis: 'EDC' as 'EDC' | 'EDC + CCTV',
    tagihan: 35000,
    tarif: 100000,
    jan: false,
    feb: false,
    mar: false,
    apr: false,
    mei: false,
    jun: false,
    jul: false,
    agu: false,
    sep: false,
    okt: false,
    nov: false,
    des: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'unitkerja') {
      const { jenis, tagihan, ...unitKerjaData } = formData;
      onAdd(unitKerjaData);
    } else {
      const { tarif, ...edcData } = formData;
      onAdd(edcData);
    }
    
    // Reset form
    setFormData({
      nama_lokasi: '',
      jenis: 'EDC',
      tagihan: 35000,
      tarif: 100000,
      jan: false,
      feb: false,
      mar: false,
      apr: false,
      mei: false,
      jun: false,
      jul: false,
      agu: false,
      sep: false,
      okt: false,
      nov: false,
      des: false,
    });
    
    onClose();
  };

  const handleJenisChange = (jenis: 'EDC' | 'EDC + CCTV') => {
    setFormData(prev => ({
      ...prev,
      jenis,
      tagihan: jenis === 'EDC' ? 35000 : 135000
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Tambah Data {type === 'unitkerja' ? 'Unit Kerja' : 'EDC & CCTV'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="nama_lokasi" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nama Lokasi
              </label>
              <input
                type="text"
                id="nama_lokasi"
                required
                value={formData.nama_lokasi}
                onChange={(e) => setFormData(prev => ({ ...prev, nama_lokasi: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Masukkan nama lokasi"
              />
            </div>

            {type === 'edc' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Jenis Layanan
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="jenis"
                      value="EDC"
                      checked={formData.jenis === 'EDC'}
                      onChange={() => handleJenisChange('EDC')}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">EDC Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="jenis"
                      value="EDC + CCTV"
                      checked={formData.jenis === 'EDC + CCTV'}
                      onChange={() => handleJenisChange('EDC + CCTV')}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">EDC + CCTV</span>
                  </label>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="tarif" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {type === 'unitkerja' ? 'Tarif per Bulan' : 'Tagihan per Bulan'}
              </label>
              <input
                type="number"
                id="tarif"
                required
                value={type === 'unitkerja' ? formData.tarif : formData.tagihan}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  [type === 'unitkerja' ? 'tarif' : 'tagihan']: parseInt(e.target.value)
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Masukkan tarif"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status Pembayaran per Bulan (Opsional)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'jan', label: 'Jan' },
                  { key: 'feb', label: 'Feb' },
                  { key: 'mar', label: 'Mar' },
                  { key: 'apr', label: 'Apr' },
                  { key: 'mei', label: 'Mei' },
                  { key: 'jun', label: 'Jun' },
                  { key: 'jul', label: 'Jul' },
                  { key: 'agu', label: 'Agu' },
                  { key: 'sep', label: 'Sep' },
                  { key: 'okt', label: 'Okt' },
                  { key: 'nov', label: 'Nov' },
                  { key: 'des', label: 'Des' }
                ].map(month => (
                  <label key={month.key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData[month.key as keyof typeof formData] as boolean}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        [month.key]: e.target.checked
                      }))}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{month.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Tambah Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDataModal;