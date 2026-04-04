import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionService, collectionKeys } from '@/lib/api/services/collection.service';
import { X, Plus, Folder, Check, FolderPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Collection {
    id: string;
    name: string;
    is_public: boolean;
}

interface AddToCollectionModalProps {
    modelId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function AddToCollectionModal({ modelId, isOpen, onClose }: AddToCollectionModalProps) {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');

    const { data: collections, isLoading } = useQuery({
        queryKey: collectionKeys.all,
        queryFn: collectionService.getMyCollections,
        enabled: isOpen
    });

    const createCollectionMutation = useMutation({
        mutationFn: collectionService.createCollection,
        onSuccess: (newCollection) => {
            queryClient.invalidateQueries({ queryKey: collectionKeys.all });
            setIsCreating(false);
            setNewCollectionName('');
            toast.success('Collection created');
            addToCollectionMutation.mutate(newCollection.id);
        }
    });

    const addToCollectionMutation = useMutation({
        mutationFn: (collectionId: string) => collectionService.addToCollection(collectionId, modelId),
        onSuccess: () => {
            toast.success('Added to collection');
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Already in collection');
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-[#141414] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-gray-800 flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FolderPlus className="w-5 h-5 text-yellow-400" /> Save to Collection
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin w-8 h-8 border-t-2 border-yellow-400 rounded-full" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {collections?.map((collection) => (
                                <button
                                    key={collection.id}
                                    onClick={() => addToCollectionMutation.mutate(collection.id)}
                                    disabled={addToCollectionMutation.isPending}
                                    className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-800 bg-gray-900/50 hover:bg-gray-800 hover:border-gray-700 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
                                            <Folder className="w-5 h-5 text-gray-400 group-hover:text-yellow-400" />
                                        </div>
                                        <span className="font-medium text-white">{collection.name}</span>
                                    </div>
                                    <Plus className="w-5 h-5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                            {collections?.length === 0 && !isCreating && (
                                <div className="text-center py-6 text-gray-500 text-sm">You haven't created any collections yet.</div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-800 bg-gray-900/30 shrink-0">
                    {isCreating ? (
                        <div className="flex items-center gap-2">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Collection name..."
                                value={newCollectionName}
                                onChange={(e) => setNewCollectionName(e.target.value)}
                                className="flex-1 px-4 py-2.5 bg-[#0a0a0a] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-yellow-400"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newCollectionName.trim()) {
                                        createCollectionMutation.mutate(newCollectionName.trim());
                                    } else if (e.key === 'Escape') {
                                        setIsCreating(false);
                                    }
                                }}
                            />
                            <button
                                onClick={() => newCollectionName.trim() && createCollectionMutation.mutate(newCollectionName.trim())}
                                disabled={!newCollectionName.trim() || createCollectionMutation.isPending}
                                className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl disabled:opacity-50 transition-colors"
                            >
                                <Check className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800
                            hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-white font-medium rounded-xl transition-all"
                        >
                            <Plus className="w-5 h-5" /> Create New Collection
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
