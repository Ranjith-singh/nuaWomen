import { useState, useEffect } from 'react';
import api from '../api/axios';
import FileList from '../components/FileList';
import UploadModal from '../components/UploadModal';
import { Plus } from 'lucide-react';

export default function Dashboard() {
    const [ownedFiles, setOwnedFiles] = useState([]);
    const [sharedFiles, setSharedFiles] = useState([]);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        fetchFiles();
    }, [refreshTrigger]);

    const fetchFiles = async () => {
        try {
            const ownedRes = await api.get('/files/owned');
            console.log("ownedRes: ",ownedRes.data.message.files)
            setOwnedFiles(ownedRes.data.message.files);

            const sharedRes = await api.get('/files/shared');
            // console.log("Immutable Snapshot:", JSON.parse(JSON.stringify(sharedRes)));
            setSharedFiles(sharedRes.data.data.fileMetadata);
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    const handleUploadSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
        setIsUploadOpen(false);
    };

    return (
        <div className="space-y-8">
            <div className="bg-linear-to-r from-white to-brand-50 p-8 rounded-3xl border border-brand-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-brand-200/40 to-accent-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-brand-600 to-accent-600">
                            My Files
                        </h1>
                        <p className="mt-2 text-slate-600 max-w-lg">
                            Manage and share your documents securely. View your own files or those shared with you.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsUploadOpen(true)}
                        className="flex items-center justify-center bg-linear-to-r from-brand-600 to-accent-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Upload New File
                    </button>
                </div>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Owned by me</h2>
                <FileList files={ownedFiles} isOwned={true} onRefresh={() => setRefreshTrigger(prev => prev + 1)} />
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Shared with me</h2>
                <FileList files={sharedFiles} isOwned={false} onRefresh={() => setRefreshTrigger(prev => prev + 1)} />
            </div>

            {isUploadOpen && (
                <UploadModal onClose={() => setIsUploadOpen(false)} onSuccess={handleUploadSuccess} />
            )}
        </div>
    );
}
